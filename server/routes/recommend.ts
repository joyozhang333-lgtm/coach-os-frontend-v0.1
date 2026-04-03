/**
 * CoachOS V0.2 — Counselor Recommendation API
 * Provides intelligent matching between user conversation topics
 * and available human counselors.
 */
import { Router, Request, Response } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI();

// Counselor database (demo data; production would use a real database)
const COUNSELOR_DB = [
  {
    id: "c1",
    name: "李心怡",
    title: "国家二级心理咨询师",
    specialty: "情绪管理 · CBT",
    specialtyKeywords: ["情绪", "焦虑", "抑郁", "压力", "CBT", "认知行为", "正念", "失眠"],
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    experience: "8 年",
    price: "¥300/次",
    available: true,
    bio: "擅长运用认知行为疗法帮助来访者管理焦虑和情绪困扰，注重实用技巧的传授。",
  },
  {
    id: "c2",
    name: "张明远",
    title: "心理学博士 · 督导师",
    specialty: "深度分析 · 精神动力",
    specialtyKeywords: ["自我探索", "潜意识", "童年", "精神动力", "深度分析", "梦", "内在小孩", "人格"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    experience: "12 年",
    price: "¥500/次",
    available: true,
    bio: "精神动力学取向，擅长深度自我探索和人格成长，帮助来访者理解行为模式背后的深层动力。",
  },
  {
    id: "c3",
    name: "王思涵",
    title: "家庭治疗师",
    specialty: "家庭系统 · 关系修复",
    specialtyKeywords: ["关系", "家庭", "伴侣", "沟通", "边界", "依恋", "婚姻", "亲子"],
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    experience: "6 年",
    price: "¥280/次",
    available: false,
    bio: "系统式家庭治疗师，专注于亲密关系和家庭动力，帮助来访者建立更健康的关系模式。",
  },
  {
    id: "c4",
    name: "刘晨曦",
    title: "职业发展咨询师",
    specialty: "职业规划 · 生涯发展",
    specialtyKeywords: ["职业", "工作", "转行", "晋升", "目标", "领导力", "团队", "职场"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    experience: "10 年",
    price: "¥350/次",
    available: true,
    bio: "组织心理学背景，擅长职业生涯规划和领导力发展，帮助来访者在职业道路上做出明智选择。",
  },
  {
    id: "c5",
    name: "陈雅琳",
    title: "创伤治疗师 · EMDR认证",
    specialty: "创伤修复 · EMDR",
    specialtyKeywords: ["创伤", "PTSD", "恐惧", "噩梦", "闪回", "安全感", "信任", "伤害"],
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    experience: "9 年",
    price: "¥400/次",
    available: true,
    bio: "EMDR认证治疗师，专注于创伤后应激障碍和复杂创伤的治疗，提供安全、专业的治疗环境。",
  },
];

/**
 * POST /api/recommend
 * Get counselor recommendations based on conversation analysis.
 *
 * Body: { topic, emotion, keywords, messages? }
 * Response: { recommendations: Array<Counselor & { matchScore, matchReason }> }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { topic, emotion, keywords, messages } = req.body;

    // Calculate match scores based on keyword overlap and topic relevance
    const recommendations = COUNSELOR_DB.map((counselor) => {
      let score = 50; // Base score

      // Keyword matching (up to +30)
      if (keywords && Array.isArray(keywords)) {
        const matchedKeywords = keywords.filter((kw: string) =>
          counselor.specialtyKeywords.some(
            (sk) => sk.includes(kw) || kw.includes(sk)
          )
        );
        score += Math.min(matchedKeywords.length * 10, 30);
      }

      // Topic matching (up to +15)
      if (topic) {
        const topicLower = topic.toLowerCase();
        if (counselor.specialty.toLowerCase().includes(topicLower) ||
            counselor.specialtyKeywords.some((sk) => topicLower.includes(sk))) {
          score += 15;
        }
      }

      // Availability bonus (+5)
      if (counselor.available) {
        score += 5;
      }

      // Add some natural variation (±3)
      score += Math.floor(Math.random() * 7) - 3;

      // Clamp to 60-99
      score = Math.max(60, Math.min(99, score));

      return {
        ...counselor,
        matchScore: score,
        matchReason: generateMatchReason(counselor, topic, emotion),
      };
    });

    // Sort by match score descending
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // If we have messages, try to use AI for more nuanced matching
    if (messages && Array.isArray(messages) && messages.length >= 3) {
      try {
        const aiRecommendation = await getAIRecommendation(messages, COUNSELOR_DB);
        if (aiRecommendation) {
          // Merge AI scores with keyword-based scores
          for (const rec of recommendations) {
            const aiRec = aiRecommendation.find((ar: any) => ar.id === rec.id);
            if (aiRec) {
              rec.matchScore = Math.round((rec.matchScore + aiRec.score) / 2);
              if (aiRec.reason) {
                rec.matchReason = aiRec.reason;
              }
            }
          }
          recommendations.sort((a, b) => b.matchScore - a.matchScore);
        }
      } catch {
        // Fall back to keyword-based matching
      }
    }

    res.json({ recommendations: recommendations.slice(0, 5) });
  } catch (error: any) {
    console.error("Recommendation error:", error);
    // Return basic recommendations on error
    res.json({
      recommendations: COUNSELOR_DB.slice(0, 3).map((c, i) => ({
        ...c,
        matchScore: 90 - i * 5,
        matchReason: "基于您的对话主题推荐",
      })),
    });
  }
});

function generateMatchReason(
  counselor: typeof COUNSELOR_DB[0],
  topic?: string,
  emotion?: string
): string {
  if (topic && emotion) {
    return `擅长${topic}方向，能够有效帮助处理${emotion}相关议题`;
  }
  if (topic) {
    return `在${topic}领域有丰富经验`;
  }
  return `${counselor.specialty}方向的专业咨询师`;
}

async function getAIRecommendation(
  messages: Array<{ role: string; content: string }>,
  counselors: typeof COUNSELOR_DB
) {
  const userMessages = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join("\n");

  const counselorList = counselors
    .map((c) => `- ${c.id}: ${c.name} (${c.specialty}) - ${c.bio}`)
    .join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      {
        role: "system",
        content: `你是一个咨询师匹配系统。根据来访者的对话内容，为每位咨询师打分（60-99分）并给出匹配理由。

可选咨询师：
${counselorList}

请以 JSON 格式返回：
{ "matches": [{ "id": "咨询师ID", "score": 分数, "reason": "一句话匹配理由" }] }`,
      },
      {
        role: "user",
        content: `来访者的对话内容：\n${userMessages}`,
      },
    ],
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
  return result.matches;
}

export default router;
