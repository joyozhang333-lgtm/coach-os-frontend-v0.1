/**
 * CoachOS V0.3 — In-Memory Data Store
 * Centralized storage for sessions, recommendations, feedback, and audit logs.
 * V0.3: Added session cleanup, audit log trimming, and memory management.
 * In production, this would be backed by a database (Prisma/PostgreSQL).
 */

import type {
  CoachSession,
  RecommendationDecision,
  RecommendationFeedback,
  CoachReturnEvent,
  AuditLogEntry,
  AuditEventType,
  SessionRole,
  EntrySource,
} from "../shared/types.js";

/* ═══ ID Generator ═══ */
let idCounter = 0;
export function generateId(prefix: string): string {
  idCounter++;
  return `${prefix}_${Date.now()}_${idCounter}_${Math.random().toString(36).slice(2, 6)}`;
}

/* ═══ Session Store ═══ */
const sessions = new Map<string, CoachSession>();

export function createSession(params: {
  userId: string;
  coachAgentId: string;
  entrySource: EntrySource;
  sessionRole: SessionRole;
  rootMainCoachSessionId?: string;
  recommendedByDecisionId?: string;
}): CoachSession {
  const session: CoachSession = {
    id: generateId("sess"),
    userId: params.userId,
    coachAgentId: params.coachAgentId,
    entrySource: params.entrySource,
    sessionRole: params.sessionRole,
    rootMainCoachSessionId: params.rootMainCoachSessionId,
    recommendedByDecisionId: params.recommendedByDecisionId,
    messages: [],
    topicSummary: "",
    emotionState: "neutral",
    messageCount: 0,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  sessions.set(session.id, session);
  return session;
}

export function getSession(id: string): CoachSession | undefined {
  return sessions.get(id);
}

export function updateSession(id: string, updates: Partial<CoachSession>): CoachSession | undefined {
  const session = sessions.get(id);
  if (!session) return undefined;
  const updated = { ...session, ...updates, updatedAt: Date.now() };
  sessions.set(id, updated);
  return updated;
}

export function getActiveMainSession(userId: string): CoachSession | undefined {
  for (const session of Array.from(sessions.values())) {
    if (session.userId === userId && session.sessionRole === "main" && session.isActive) {
      return session;
    }
  }
  return undefined;
}

export function getSessionsByUser(userId: string): CoachSession[] {
  const result: CoachSession[] = [];
  for (const session of Array.from(sessions.values())) {
    if (session.userId === userId) {
      result.push(session);
    }
  }
  return result.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * V0.3: Cleanup inactive sessions older than maxAge (milliseconds).
 * Returns the number of sessions removed.
 */
export function cleanupInactiveSessions(maxAge: number): number {
  const now = Date.now();
  let cleaned = 0;
  for (const [id, session] of Array.from(sessions.entries())) {
    if (!session.isActive && (now - session.updatedAt) > maxAge) {
      sessions.delete(id);
      cleaned++;
    }
    // Also clean active sessions that haven't been updated in a very long time
    if (session.isActive && (now - session.updatedAt) > maxAge * 2) {
      sessions.delete(id);
      cleaned++;
    }
  }

  // Trim audit logs if they exceed 10000 entries
  trimAuditLogs(10000);

  return cleaned;
}

/* ═══ Recommendation Store ═══ */
const recommendations = new Map<string, RecommendationDecision>();

export function createRecommendation(decision: Omit<RecommendationDecision, "id" | "createdAt">): RecommendationDecision {
  const rec: RecommendationDecision = {
    ...decision,
    id: generateId("rec"),
    createdAt: new Date().toISOString(),
  };
  recommendations.set(rec.id, rec);
  return rec;
}

export function getRecommendation(id: string): RecommendationDecision | undefined {
  return recommendations.get(id);
}

export function updateRecommendation(id: string, updates: Partial<RecommendationDecision>): RecommendationDecision | undefined {
  const rec = recommendations.get(id);
  if (!rec) return undefined;
  const updated = { ...rec, ...updates };
  recommendations.set(id, updated);
  return updated;
}

export function getPendingRecommendation(sessionId: string): RecommendationDecision | undefined {
  for (const rec of Array.from(recommendations.values())) {
    if (rec.mainCoachSessionId === sessionId && (rec.status === "pending" || rec.status === "shown")) {
      return rec;
    }
  }
  return undefined;
}

export function getRecommendationsBySession(sessionId: string): RecommendationDecision[] {
  const result: RecommendationDecision[] = [];
  for (const rec of Array.from(recommendations.values())) {
    if (rec.mainCoachSessionId === sessionId) {
      result.push(rec);
    }
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

/* ═══ Feedback Store ═══ */
const feedbacks = new Map<string, RecommendationFeedback>();

export function createFeedback(feedback: Omit<RecommendationFeedback, "id" | "createdAt">): RecommendationFeedback {
  const fb: RecommendationFeedback = {
    ...feedback,
    id: generateId("fb"),
    createdAt: new Date().toISOString(),
  };
  feedbacks.set(fb.id, fb);
  return fb;
}

/* ═══ Return Event Store ═══ */
const returnEvents = new Map<string, CoachReturnEvent>();

export function createReturnEvent(event: Omit<CoachReturnEvent, "id" | "createdAt">): CoachReturnEvent {
  const re: CoachReturnEvent = {
    ...event,
    id: generateId("ret"),
    createdAt: new Date().toISOString(),
  };
  returnEvents.set(re.id, re);
  return re;
}

/* ═══ Audit Log Store ═══ */
const auditLogs: AuditLogEntry[] = [];

export function addAuditLog(params: {
  eventType: AuditEventType;
  userId: string;
  sessionId?: string;
  recommendationId?: string;
  coachAgentId?: string;
  metadata?: Record<string, unknown>;
}): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: generateId("audit"),
    eventType: params.eventType,
    userId: params.userId,
    sessionId: params.sessionId,
    recommendationId: params.recommendationId,
    coachAgentId: params.coachAgentId,
    metadata: params.metadata || {},
    timestamp: new Date().toISOString(),
  };
  auditLogs.push(entry);
  return entry;
}

export function getAuditLogs(filters?: {
  userId?: string;
  eventType?: AuditEventType;
  sessionId?: string;
  limit?: number;
}): AuditLogEntry[] {
  let result = [...auditLogs];
  if (filters?.userId) {
    result = result.filter((e) => e.userId === filters.userId);
  }
  if (filters?.eventType) {
    result = result.filter((e) => e.eventType === filters.eventType);
  }
  if (filters?.sessionId) {
    result = result.filter((e) => e.sessionId === filters.sessionId);
  }
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  if (filters?.limit) {
    result = result.slice(0, filters.limit);
  }
  return result;
}

/**
 * V0.3: Trim audit logs to keep only the most recent entries.
 */
function trimAuditLogs(maxEntries: number): void {
  if (auditLogs.length > maxEntries) {
    const excess = auditLogs.length - maxEntries;
    auditLogs.splice(0, excess);
  }
}

/* ═══ Stats ═══ */
export function getStoreStats() {
  return {
    sessions: sessions.size,
    activeSessions: Array.from(sessions.values()).filter((s) => s.isActive).length,
    recommendations: recommendations.size,
    feedbacks: feedbacks.size,
    returnEvents: returnEvents.size,
    auditLogs: auditLogs.length,
  };
}
