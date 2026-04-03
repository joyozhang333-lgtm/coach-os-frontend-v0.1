/**
 * CoachOS V0.2 — API Client
 * Handles communication with the backend API server.
 */

const API_BASE = "/api";

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
 * Get counselor recommendations based on conversation analysis.
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
