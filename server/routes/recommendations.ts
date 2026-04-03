/**
 * CoachOS V0.2 — Recommendation API Routes
 * Handles recommendation evaluation, retrieval, response, and return-to-main.
 *
 * Endpoints:
 *   POST /api/recommendations/evaluate
 *   GET  /api/recommendations/current?sessionId=...
 *   POST /api/recommendations/respond
 *   POST /api/coach/sessions/:id/return-to-main
 */

import { Router, Request, Response } from "express";
import { evaluateRecommendation } from "../recommendation-engine.js";
import { getCoachAgentById, getHumanProfileById } from "../coaches-extended.js";
import {
  getSession,
  updateSession,
  createSession,
  createRecommendation,
  getRecommendation,
  updateRecommendation,
  getPendingRecommendation,
  createFeedback,
  createReturnEvent,
  addAuditLog,
  getAuditLogs,
  getStoreStats,
} from "../store.js";
import type {
  RecommendationEvaluateResponse,
  RecommendationCurrentResponse,
  FeedbackAction,
  ReturnReason,
} from "../../shared/types.js";

const router = Router();

/**
 * POST /api/recommendations/evaluate
 * Evaluate whether to generate a recommendation based on current session state.
 */
router.post("/evaluate", async (req: Request, res: Response) => {
  try {
    const { sessionId, userId = "anonymous", currentMessage, messageCount, messages: chatMessages } = req.body;

    if (!sessionId) {
      res.status(400).json({ error: "sessionId is required" });
      return;
    }

    let session = getSession(sessionId);

    // If session doesn't exist, create one for backward compatibility
    if (!session) {
      session = createSession({
        userId,
        coachAgentId: "guichu-main",
        entrySource: "landing",
        sessionRole: "main",
      });
    }

    // Sync message count from frontend if provided (frontend tracks actual count)
    if (typeof messageCount === "number" && messageCount > session.messageCount) {
      session = updateSession(session.id, { messageCount }) || session;
    }

    // Sync chat messages if provided (for semantic analysis)
    if (Array.isArray(chatMessages) && chatMessages.length > 0) {
      const formattedMessages = chatMessages.map((m: { role: string; content: string }) => ({
        role: (m.role === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.content,
      }));
      session = updateSession(session.id, { messages: formattedMessages }) || session;
    }

    // Check if there's already a pending recommendation
    const existing = getPendingRecommendation(sessionId);
    if (existing) {
      const coach = getCoachAgentById(existing.recommendedCoachAgentId);
      const response: RecommendationEvaluateResponse = {
        shouldRecommend: true,
        recommendation: {
          id: existing.id,
          type: existing.recommendedType,
          coachName: coach?.name || "未知",
          coachId: existing.recommendedCoachAgentId,
          displayReason: existing.displayReason,
          triggerSource: existing.triggerSource,
          confidenceScore: existing.confidenceScore,
          riskLevel: existing.riskLevel,
        },
      };
      res.json(response);
      return;
    }

    // Evaluate recommendation
    const evaluation = await evaluateRecommendation(session, currentMessage || "");

    if (!evaluation || !evaluation.shouldRecommend) {
      const response: RecommendationEvaluateResponse = { shouldRecommend: false };
      res.json(response);
      return;
    }

    // Create recommendation decision
    const decision = createRecommendation({
      userId,
      mainSessionId: session.id,
      mainCoachSessionId: sessionId,
      triggerSource: evaluation.triggerSource,
      triggerReason: evaluation.triggerReason,
      confidenceScore: evaluation.confidenceScore,
      riskLevel: evaluation.riskLevel,
      recommendedType: evaluation.recommendedType,
      recommendedCoachAgentId: evaluation.recommendedCoachId,
      displayReason: evaluation.displayReason,
      status: "pending",
    });

    // Audit: recommendation generated
    addAuditLog({
      eventType: "recommendation_generated",
      userId,
      sessionId,
      recommendationId: decision.id,
      coachAgentId: evaluation.recommendedCoachId,
      metadata: {
        triggerSource: evaluation.triggerSource,
        triggerReason: evaluation.triggerReason,
        confidenceScore: evaluation.confidenceScore,
        riskLevel: evaluation.riskLevel,
      },
    });

    const response: RecommendationEvaluateResponse = {
      shouldRecommend: true,
      recommendation: {
        id: decision.id,
        type: evaluation.recommendedType,
        coachName: evaluation.recommendedCoachName,
        coachId: evaluation.recommendedCoachId,
        displayReason: evaluation.displayReason,
        triggerSource: evaluation.triggerSource,
        confidenceScore: evaluation.confidenceScore,
        riskLevel: evaluation.riskLevel,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Recommendation evaluate error:", error);
    res.status(500).json({ error: "Failed to evaluate recommendation" });
  }
});

/**
 * GET /api/recommendations/current?sessionId=...
 * Get the current pending recommendation for a session.
 */
router.get("/current", (req: Request, res: Response) => {
  try {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== "string") {
      res.status(400).json({ error: "sessionId query parameter is required" });
      return;
    }

    const pending = getPendingRecommendation(sessionId);

    if (!pending) {
      const response: RecommendationCurrentResponse = { hasRecommendation: false };
      res.json(response);
      return;
    }

    const coach = getCoachAgentById(pending.recommendedCoachAgentId);

    // Mark as shown
    if (pending.status === "pending") {
      updateRecommendation(pending.id, {
        status: "shown",
        shownAt: new Date().toISOString(),
      });

      // Audit: recommendation shown
      addAuditLog({
        eventType: "recommendation_shown",
        userId: pending.userId,
        sessionId: sessionId,
        recommendationId: pending.id,
        coachAgentId: pending.recommendedCoachAgentId,
      });
    }

    const availableActions: FeedbackAction[] = [
      "continue_main_ai",
      pending.recommendedType === "specialist_ai" ? "open_specialist_ai" : "open_human_coach",
      "dismiss_once",
    ];

    const response: RecommendationCurrentResponse = {
      hasRecommendation: true,
      recommendation: {
        id: pending.id,
        type: pending.recommendedType,
        coachName: coach?.name || "未知",
        coachId: pending.recommendedCoachAgentId,
        coachAvatar: coach?.avatar,
        coachSpecialty: coach?.specialty,
        displayReason: pending.displayReason,
        actions: availableActions,
      },
    };

    res.json(response);
  } catch (error: any) {
    console.error("Get current recommendation error:", error);
    res.status(500).json({ error: "Failed to get recommendation" });
  }
});

/**
 * POST /api/recommendations/respond
 * User responds to a recommendation (accept, dismiss, continue with main AI).
 */
router.post("/respond", (req: Request, res: Response) => {
  try {
    const { recommendationId, action, userId = "anonymous", notes } = req.body;

    if (!recommendationId || !action) {
      res.status(400).json({ error: "recommendationId and action are required" });
      return;
    }

    const recommendation = getRecommendation(recommendationId);
    if (!recommendation) {
      res.status(404).json({ error: "Recommendation not found" });
      return;
    }

    // Create feedback record
    createFeedback({
      recommendationDecisionId: recommendationId,
      userId,
      action: action as FeedbackAction,
      notes,
    });

    // Update recommendation status
    const newStatus = (action === "open_specialist_ai" || action === "open_human_coach")
      ? "accepted"
      : action === "suppress_for_session"
      ? "suppressed"
      : action === "dismiss_once"
      ? "dismissed"
      : "dismissed";

    updateRecommendation(recommendationId, {
      status: newStatus,
      actedAt: new Date().toISOString(),
    });

    // Audit: recommendation accepted or dismissed
    const auditEventType = newStatus === "accepted"
      ? "recommendation_accepted"
      : "recommendation_dismissed";

    addAuditLog({
      eventType: auditEventType,
      userId,
      sessionId: recommendation.mainCoachSessionId,
      recommendationId,
      coachAgentId: recommendation.recommendedCoachAgentId,
      metadata: { action, notes },
    });

    // If accepted, create a new specialist/human session
    let newSessionId: string | undefined;
    if (action === "open_specialist_ai" || action === "open_human_coach") {
      const newSession = createSession({
        userId,
        coachAgentId: recommendation.recommendedCoachAgentId,
        entrySource: "main_ai_recommendation",
        sessionRole: action === "open_specialist_ai" ? "specialist" : "human_support",
        rootMainCoachSessionId: recommendation.mainCoachSessionId,
        recommendedByDecisionId: recommendationId,
      });
      newSessionId = newSession.id;

      // Audit: entered coach
      addAuditLog({
        eventType: action === "open_specialist_ai" ? "entered_specialist_coach" : "entered_human_coach",
        userId,
        sessionId: newSession.id,
        recommendationId,
        coachAgentId: recommendation.recommendedCoachAgentId,
        metadata: { fromMainSession: recommendation.mainCoachSessionId },
      });
    }

    res.json({
      success: true,
      status: newStatus,
      newSessionId,
      coachId: recommendation.recommendedCoachAgentId,
    });
  } catch (error: any) {
    console.error("Recommendation respond error:", error);
    res.status(500).json({ error: "Failed to respond to recommendation" });
  }
});

/**
 * POST /api/coach/sessions/:id/return-to-main
 * Return from a specialist/human coach session back to the main 归处 AI.
 */
router.post("/sessions/:id/return-to-main", (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason = "user_exit", userId = "anonymous" } = req.body;

    const session = getSession(id);
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    const mainSessionId = session.rootMainCoachSessionId || session.id;

    // Create return event with summary
    const returnEvent = createReturnEvent({
      userId,
      fromCoachSessionId: id,
      toMainCoachSessionId: mainSessionId,
      reason: reason as ReturnReason,
      summaryJson: {
        keyTopics: extractKeyTopics(session.messages),
        insights: [],
        nextSteps: [],
        coachNotes: `从 ${getCoachAgentById(session.coachAgentId)?.name || "未知"} 返回归处 AI`,
      },
    });

    // Mark specialist session as inactive
    updateSession(id, { isActive: false });

    // Audit: returned to main AI
    addAuditLog({
      eventType: "returned_to_main_ai",
      userId,
      sessionId: id,
      coachAgentId: session.coachAgentId,
      metadata: {
        reason,
        mainSessionId,
        messageCount: session.messageCount,
        returnEventId: returnEvent.id,
      },
    });

    res.json({
      success: true,
      mainSessionId,
      summary: returnEvent.summaryJson,
    });
  } catch (error: any) {
    console.error("Return to main error:", error);
    res.status(500).json({ error: "Failed to return to main AI" });
  }
});

/**
 * GET /api/recommendations/audit
 * Get audit logs for debugging and tracking.
 */
router.get("/audit", (req: Request, res: Response) => {
  try {
    const { userId, eventType, sessionId, limit } = req.query;
    const logs = getAuditLogs({
      userId: userId as string,
      eventType: eventType as any,
      sessionId: sessionId as string,
      limit: limit ? parseInt(limit as string) : 50,
    });
    res.json({ logs, total: logs.length });
  } catch (error: any) {
    console.error("Audit log error:", error);
    res.status(500).json({ error: "Failed to get audit logs" });
  }
});

/**
 * GET /api/recommendations/stats
 * Get store statistics.
 */
router.get("/stats", (_req: Request, res: Response) => {
  res.json(getStoreStats());
});

/* ═══ Helper ═══ */
function extractKeyTopics(messages: Array<{ role: string; content: string }>): string[] {
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  // Simple keyword extraction
  const topics: string[] = [];
  const topicKeywords: Record<string, string> = {
    "关系": "关系议题",
    "工作": "职业发展",
    "焦虑": "情绪管理",
    "压力": "压力应对",
    "家庭": "家庭关系",
    "父母": "原生家庭",
    "选择": "人生选择",
    "迷茫": "方向探索",
    "修行": "灵性成长",
    "正念": "正念修行",
  };

  for (const [keyword, topic] of Object.entries(topicKeywords)) {
    if (userMessages.includes(keyword) && !topics.includes(topic)) {
      topics.push(topic);
    }
  }

  return topics.length > 0 ? topics : ["一般心理支持"];
}

export default router;
