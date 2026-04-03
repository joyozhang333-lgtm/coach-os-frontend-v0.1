/**
 * CoachOS V0.2 — API Client
 * Handles communication with the backend API server.
 * Includes legacy APIs + new 归处 AI + Coach 协同机制 APIs.
 */

const API_BASE = "/api";

/* ═══════════════════════════════════════════════
 * Legacy APIs (unchanged)
 * ═══════════════════════════════════════════════ */

/**
 * Send a message to an AI Coach and receive a streaming response.
 * Returns an async generator that yields content chunks.
 */
export async function* chatStream(params: {
  coachId: string;
  message: string;
  sessionId?: string;
  history?: Array<{ role: string; content: string }>;
}): AsyncGenerator<
  | { type: "content"; content: string }
  | { type: "done"; sessionId: string; messageCount: number }
  | { type: "error"; error: string }
> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    yield { type: "error", error: "AI 服务暂时不可用" };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: "error", error: "无法建立连接" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.startsWith("data: ")) {
      try {
        const data = JSON.parse(buffer.slice(6));
        yield data;
      } catch {
        // Skip malformed JSON
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Analyze conversation topic for counselor matching.
 */
export async function analyzeTopicAPI(
  messages: Array<{ role: string; content: string }>
): Promise<{
  topic: string;
  emotion: string;
  keywords: string[];
  recommendedSpecialties: string[];
  urgencyLevel: string;
  summary: string;
}> {
  const response = await fetch(`${API_BASE}/chat/analyze-topic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return response.json();
}

/**
 * Get counselor recommendations based on conversation analysis (legacy).
 */
export async function getRecommendations(params: {
  topic?: string;
  emotion?: string;
  keywords?: string[];
  messages?: Array<{ role: string; content: string }>;
}): Promise<{
  recommendations: Array<{
    id: string;
    name: string;
    title: string;
    specialty: string;
    avatar: string;
    matchScore: number;
    matchReason: string;
    experience: string;
    price: string;
    available: boolean;
  }>;
}> {
  const response = await fetch(`${API_BASE}/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return response.json();
}

/**
 * Analyze counselor style from onboarding conversation.
 */
export async function analyzeStyle(
  messages: Array<{ role: string; content: string }>
): Promise<{
  overallStyle: string;
  styleDescription: string;
  dimensions: Array<{ name: string; score: number; description: string }>;
  strengths: string[];
  growthAreas: string[];
  matchedCoachStyle: string;
  keywords: string[];
}> {
  const response = await fetch(`${API_BASE}/style-analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  return response.json();
}

/* ═══════════════════════════════════════════════
 * New: 归处 AI + Coach 协同机制 APIs
 * ═══════════════════════════════════════════════ */

/** Recommendation evaluation result */
export interface RecommendationResult {
  shouldRecommend: boolean;
  recommendation?: {
    id: string;
    type: "specialist_ai" | "human_coach";
    coachName: string;
    coachId: string;
    coachAvatar?: string;
    coachSpecialty?: string;
    displayReason: string;
    triggerSource: string;
    confidenceScore: number;
    riskLevel: string;
    actions?: string[];
  };
}

/**
 * Evaluate whether to recommend a specialist/human coach.
 * POST /api/recommendations/evaluate
 */
export async function evaluateRecommendation(params: {
  sessionId: string;
  userId?: string;
  currentMessage?: string;
  messageCount?: number;
  messages?: Array<{ role: string; content: string }>;
}): Promise<RecommendationResult> {
  const response = await fetch(`${API_BASE}/recommendations/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error(`Recommendation evaluate failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Get current pending recommendation for a session.
 * GET /api/recommendations/current?sessionId=...
 */
export async function getCurrentRecommendation(sessionId: string): Promise<RecommendationResult & { hasRecommendation?: boolean }> {
  const response = await fetch(`${API_BASE}/recommendations/current?sessionId=${encodeURIComponent(sessionId)}`);
  if (!response.ok) {
    throw new Error(`Get recommendation failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Respond to a recommendation (accept, dismiss, continue).
 * POST /api/recommendations/respond
 */
export async function respondToRecommendation(params: {
  recommendationId: string;
  action: "continue_main_ai" | "open_specialist_ai" | "open_human_coach" | "dismiss_once" | "suppress_for_session";
  userId?: string;
  notes?: string;
}): Promise<{
  success: boolean;
  status: string;
  newSessionId?: string;
  coachId?: string;
}> {
  const response = await fetch(`${API_BASE}/recommendations/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    throw new Error(`Recommendation respond failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Return from specialist/human coach to main 归处 AI.
 * POST /api/coach/sessions/:id/return-to-main
 */
export async function returnToMainAI(params: {
  sessionId: string;
  reason?: "completed" | "user_exit" | "handoff_to_main" | "human_booking_finished";
  userId?: string;
}): Promise<{
  success: boolean;
  mainSessionId: string;
  summary?: {
    keyTopics: string[];
    insights: string[];
    nextSteps: string[];
    coachNotes?: string;
  };
}> {
  const response = await fetch(`${API_BASE}/coach/sessions/${encodeURIComponent(params.sessionId)}/return-to-main`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: params.reason || "user_exit", userId: params.userId }),
  });
  if (!response.ok) {
    throw new Error(`Return to main failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Send a message to a specialist AI Coach (SSE streaming).
 * POST /api/coach-chat
 */
export async function* specialistChatStream(params: {
  coachId: string;
  message: string;
  sessionId?: string;
  history?: Array<{ role: string; content: string }>;
  userId?: string;
}): AsyncGenerator<
  | { type: "content"; content: string }
  | { type: "done"; sessionId: string; coachId: string; coachName: string; messageCount: number; canReturnToMain: boolean }
  | { type: "error"; error: string }
> {
  const response = await fetch(`${API_BASE}/coach-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    yield { type: "error", error: "专题 Coach 服务暂时不可用" };
    return;
  }

  const reader = response.body?.getReader();
  if (!reader) {
    yield { type: "error", error: "无法建立连接" };
    return;
  }

  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            yield data;
          } catch {
            // Skip malformed JSON
          }
        }
      }
    }

    if (buffer.startsWith("data: ")) {
      try {
        const data = JSON.parse(buffer.slice(6));
        yield data;
      } catch {
        // Skip malformed JSON
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Get list of all coaches (specialist + human).
 * GET /api/coach-chat/coaches
 */
export async function getAllCoaches(): Promise<{
  mainAI: {
    id: string;
    name: string;
    specialty: string;
    avatar: string;
    greeting: string;
  };
  specialists: Array<{
    id: string;
    name: string;
    nameEn: string;
    specialty: string;
    method: string;
    avatar: string;
    bio: string;
    tags: string[];
    color: string;
    greeting: string;
  }>;
  humanCoaches: Array<{
    id: string;
    displayName: string;
    headline: string;
    bio: string;
    specialties: string[];
    priceRange: { min: number; max: number; currency: string };
    availability: { status: string; nextSlot?: string };
  }>;
}> {
  const response = await fetch(`${API_BASE}/coach-chat/coaches`);
  if (!response.ok) {
    throw new Error(`Get coaches failed: ${response.status}`);
  }
  return response.json();
}
