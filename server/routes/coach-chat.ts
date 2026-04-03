/**
 * CoachOS V0.2 — Specialist Coach Chat Route
 * Handles conversations with specialist AI coaches (the 11 专题 Coaches).
 * Supports session tracking, return-to-main, and integration with the recommendation system.
 */

import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { getCoachAgentById, GUICHU_AI, getSpecialistCoaches, getHumanCoachProfiles } from "../coaches-extended.js";
import {
  getSession,
  updateSession,
  createSession,
  addAuditLog,
} from "../store.js";
import type { CoachAgent } from "../../shared/types.js";

const router = Router();
const openai = new OpenAI();

/**
 * POST /api/coach-chat
 * Send a message to a specialist AI Coach.
 * Supports the same SSE streaming format as the main chat.
 *
 * Body: { sessionId?, coachId, message, history?, userId? }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { sessionId, coachId, message, history, userId = "anonymous" } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (!coachId) {
      res.status(400).json({ error: "coachId is required" });
      return;
    }

    // Get the specialist coach
    const coach = getCoachAgentById(coachId);
    if (!coach) {
      res.status(404).json({ error: `Coach not found: ${coachId}` });
      return;
    }

    // Get or create session
    let session = sessionId ? getSession(sessionId) : null;
    if (!session) {
      session = createSession({
        userId,
        coachAgentId: coachId,
        entrySource: "main_ai_recommendation",
        sessionRole: "specialist",
      });
    }

    // Add user message to session
    session.messages.push({ role: "user", content: message });
    session.messageCount++;
    updateSession(session.id, {
      messages: session.messages,
      messageCount: session.messageCount,
    });

    // Build system prompt with context
    const systemMessage = {
      role: "system" as const,
      content: buildSpecialistPrompt(coach, session.messageCount),
    };

    // Use provided history or session history
    const contextMessages = (history && Array.isArray(history) && history.length > 0)
      ? history.slice(-20).map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))
      : session.messages.slice(-20);

    // Set up SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Session-Id", session.id);
    res.setHeader("X-Coach-Id", coachId);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [systemMessage, ...contextMessages],
      stream: false,
      temperature: 0.8,
      max_tokens: 500,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    const fullResponse = completion.choices[0]?.message?.content || "抱歉，我暂时无法回复。";

    // Send response in chunks
    const chunkSize = 4;
    for (let i = 0; i < fullResponse.length; i += chunkSize) {
      const chunk = fullResponse.slice(i, i + chunkSize);
      res.write(`data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`);
    }

    // Save assistant response
    session.messages.push({ role: "assistant", content: fullResponse });
    updateSession(session.id, {
      messages: session.messages,
    });

    // Send completion event
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        sessionId: session.id,
        coachId,
        coachName: coach.name,
        messageCount: session.messageCount,
        canReturnToMain: coach.returnToMainRequired,
      })}\n\n`
    );

    res.end();
  } catch (error: any) {
    console.error("Coach chat error:", error);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "AI 服务暂时不可用，请稍后重试" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * GET /api/coach-chat/coaches
 * Get list of all specialist coaches for frontend display.
 */
router.get("/coaches", (_req: Request, res: Response) => {
  const specialists = getSpecialistCoaches();
  const humans = getHumanCoachProfiles();

  res.json({
    mainAI: {
      id: GUICHU_AI.id,
      name: GUICHU_AI.name,
      specialty: GUICHU_AI.specialty,
      avatar: GUICHU_AI.avatar,
      greeting: GUICHU_AI.greeting,
    },
    specialists: specialists.map((c: CoachAgent) => ({
      id: c.id,
      name: c.name,
      nameEn: c.nameEn,
      specialty: c.specialty,
      method: c.method,
      avatar: c.avatar,
      bio: c.bio,
      tags: c.tags,
      color: c.color,
      greeting: c.greeting,
    })),
    humanCoaches: humans.map((h: any) => ({
      id: h.id,
      displayName: h.displayName,
      headline: h.headline,
      bio: h.bio,
      specialties: h.specialties,
      priceRange: h.priceRange,
      availability: h.availability,
    })),
  });
});

/* ═══ Helper: Build Specialist System Prompt ═══ */
function buildSpecialistPrompt(coach: CoachAgent, messageCount: number): string {
  return `${coach.systemPrompt}

## 当前会话信息
- 这是第 ${messageCount} 轮对话
- 你是归处平台的专题 Coach，用户是从归处 AI 推荐过来的
- 对话结束后，用户可以选择返回归处 AI 继续陪伴
- 如果你觉得用户的议题已经在你的能力范围内得到了初步处理，可以温和地提醒用户可以随时回到归处 AI

## 重要提醒
- 不要主动催促用户离开
- 在用户准备好时，自然地提及可以回到归处 AI
- 保持你独特的风格和专业性`;
}

export default router;
