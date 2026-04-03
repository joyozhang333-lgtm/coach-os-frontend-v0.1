/**
 * CoachOS V0.2 — Chat API Route
 * Handles AI Coach conversations using OpenAI API with streaming support.
 */
import { Router, Request, Response } from "express";
import OpenAI from "openai";
import { getCoachById, getDefaultCoach, type CoachPersona } from "../coaches.js";

const router = Router();

// Initialize OpenAI client (uses OPENAI_API_KEY and OPENAI_BASE_URL from env)
const openai = new OpenAI();

// In-memory session store (for demo; production would use Redis/DB)
const sessionStore = new Map<
  string,
  {
    coachId: string;
    messages: Array<{ role: "user" | "assistant"; content: string }>;
    topicSummary: string;
    emotionState: string;
    messageCount: number;
    createdAt: number;
  }
>();

/**
 * POST /api/chat
 * Send a message to an AI Coach and receive a streaming response.
 *
 * Body: { sessionId?, coachId, message, history? }
 * Response: Server-Sent Events (SSE) stream
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { sessionId, coachId, message, history } = req.body;

    if (!message || typeof message !== "string") {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const coach: CoachPersona = getCoachById(coachId || "siyu") || getDefaultCoach();

    // Get or create session
    const sid = sessionId || `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let session = sessionStore.get(sid);

    if (!session) {
      session = {
        coachId: coach.id,
        messages: [],
        topicSummary: "",
        emotionState: "neutral",
        messageCount: 0,
        createdAt: Date.now(),
      };
      sessionStore.set(sid, session);
    }

    // If coach changed, note it in context
    if (session.coachId !== coach.id) {
      session.coachId = coach.id;
      session.messages.push({
        role: "assistant",
        content: `[系统：已切换到 ${coach.name}]`,
      });
    }

    // Add user message to session
    session.messages.push({ role: "user", content: message });
    session.messageCount++;

    // Build messages for OpenAI
    const systemMessage = {
      role: "system" as const,
      content: coach.systemPrompt + `\n\n## 当前会话信息\n- 这是第 ${session.messageCount} 轮对话\n- 来访者的情绪状态倾向：${session.emotionState}`,
    };

    // Use provided history or session history (last 20 messages for context window)
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
    res.setHeader("X-Session-Id", sid);

    // Call OpenAI (non-streaming, then simulate SSE chunks for frontend)
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

    // Send response in chunks to simulate streaming for better UX
    const chunkSize = 4;
    for (let i = 0; i < fullResponse.length; i += chunkSize) {
      const chunk = fullResponse.slice(i, i + chunkSize);
      res.write(`data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`);
    }

    // Save assistant response to session
    session.messages.push({ role: "assistant", content: fullResponse });

    // Send completion event with session info
    res.write(
      `data: ${JSON.stringify({
        type: "done",
        sessionId: sid,
        messageCount: session.messageCount,
      })}\n\n`
    );

    res.end();
  } catch (error: any) {
    console.error("Chat API error:", error);

    // If headers already sent (streaming started), send error event
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: "error", error: "AI 服务暂时不可用，请稍后重试" })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

/**
 * POST /api/chat/analyze-topic
 * Analyze conversation to extract topic and emotion for counselor matching.
 *
 * Body: { messages: Array<{role, content}> }
 * Response: { topic, emotion, keywords, recommendedSpecialties }
 */
router.post("/analyze-topic", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: "Messages are required" });
      return;
    }

    const userMessages = messages
      .filter((m: { role: string }) => m.role === "user")
      .map((m: { content: string }) => m.content)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `你是一个心理咨询话题分析系统。分析来访者的对话内容，提取以下信息：
1. 主要话题（如：情绪管理、亲密关系、职业发展、自我探索等）
2. 情绪状态（如：焦虑、低落、困惑、愤怒、平静等）
3. 关键词（3-5个）
4. 推荐的咨询师专长方向

请以 JSON 格式返回：
{
  "topic": "主要话题",
  "emotion": "情绪状态",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "recommendedSpecialties": ["专长1", "专长2"],
  "urgencyLevel": "low|medium|high",
  "summary": "一句话总结来访者的核心需求"
}`,
        },
        {
          role: "user",
          content: `请分析以下来访者的对话内容：\n\n${userMessages}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const analysis = JSON.parse(completion.choices[0]?.message?.content || "{}");
    res.json(analysis);
  } catch (error: any) {
    console.error("Topic analysis error:", error);
    res.status(500).json({
      topic: "一般心理支持",
      emotion: "未知",
      keywords: [],
      recommendedSpecialties: ["情绪管理"],
      urgencyLevel: "low",
      summary: "来访者正在寻求心理支持",
    });
  }
});

export default router;
