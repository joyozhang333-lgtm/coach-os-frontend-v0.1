/**
 * CoachOS V0.2 — Recommendation Engine
 * Evaluates whether to recommend a specialist AI Coach or human Coach
 * based on semantic triggers, risk assessment, and threshold rules.
 */

import OpenAI from "openai";
import type {
  TriggerSource,
  RecommendedType,
  RiskLevel,
  CoachSession,
} from "../shared/types.js";
import { getSpecialistCoaches, getHumanCoachProfiles } from "./coaches-extended.js";
import type { CoachAgent } from "../shared/types.js";

const openai = new OpenAI();

/* ═══ Trigger Evaluation Result ═══ */
export interface TriggerEvaluation {
  shouldRecommend: boolean;
  triggerSource: TriggerSource;
  triggerReason: string;
  recommendedType: RecommendedType;
  recommendedCoachId: string;
  recommendedCoachName: string;
  displayReason: string;
  confidenceScore: number;
  riskLevel: RiskLevel;
}

/* ═══ Risk Keywords ═══ */
const HIGH_RISK_KEYWORDS = [
  "自杀", "自残", "不想活", "死", "结束生命", "跳楼", "割腕",
  "伤害自己", "没有意义", "活着没意思", "消失", "解脱",
];

const MEDIUM_RISK_KEYWORDS = [
  "崩溃", "绝望", "受不了", "撑不住", "太痛苦", "无法忍受",
  "失控", "恐慌", "panic", "极度焦虑", "严重失眠",
];

const EXPLICIT_HUMAN_REQUEST_KEYWORDS = [
  "真人", "咨询师", "心理医生", "面对面", "预约", "线下",
  "找个人聊", "专业帮助", "看心理", "找专家",
];

const EXPLICIT_SPECIALIST_REQUEST_KEYWORDS = [
  "正念", "冥想", "禅修", "修行", "催眠",
  "内在小孩", "原生家庭", "阴影", "荣格",
  "陈海贤", "林巨", "阿姜查", "佩玛", "一行禅师",
  "迈克·辛格", "彭凯平", "黄仕明", "邱阳创巴", "陈宇廷",
];

/* ═══ Main Evaluation Function ═══ */
export async function evaluateRecommendation(
  session: CoachSession,
  currentMessage: string
): Promise<TriggerEvaluation | null> {
  // Rule 0: Risk trigger — ALWAYS checked first, bypasses message threshold
  // High-risk signals should trigger recommendation regardless of message count
  const riskResult = evaluateRiskTrigger(currentMessage, session);
  if (riskResult) {
    return riskResult;
  }

  // Rule 1: Minimum threshold — at least 3 user messages for non-risk triggers
  if (session.messageCount < 3) {
    return null;
  }

  // Rule 2: Explicit request trigger
  const explicitResult = evaluateExplicitRequest(currentMessage, session);
  if (explicitResult) {
    return explicitResult;
  }

  // Rule 3: Semantic trigger — use AI to analyze
  const semanticResult = await evaluateSemanticTrigger(session, currentMessage);
  if (semanticResult) {
    return semanticResult;
  }

  return null;
}

/* ═══ Risk Trigger ═══ */
function evaluateRiskTrigger(
  message: string,
  session: CoachSession
): TriggerEvaluation | null {
  const allMessages = session.messages.map((m) => m.content).join(" ") + " " + message;
  const lowerMsg = allMessages.toLowerCase();

  // Check high risk
  const highRiskMatch = HIGH_RISK_KEYWORDS.find((kw) => lowerMsg.includes(kw));
  if (highRiskMatch) {
    const humanProfiles = getHumanCoachProfiles();
    const availableHuman = humanProfiles.find((p) => p.availability.status === "available") || humanProfiles[0];
    return {
      shouldRecommend: true,
      triggerSource: "risk",
      triggerReason: `检测到高风险信号: "${highRiskMatch}"`,
      recommendedType: "human_coach",
      recommendedCoachId: availableHuman.coachAgentId,
      recommendedCoachName: availableHuman.displayName,
      displayReason: "我注意到你现在可能正在经历很大的痛苦。一位专业的真人咨询师可以给你更好的支持。",
      confidenceScore: 95,
      riskLevel: "high",
    };
  }

  // Check medium risk
  const mediumRiskMatch = MEDIUM_RISK_KEYWORDS.find((kw) => lowerMsg.includes(kw));
  if (mediumRiskMatch && session.messageCount >= 3) {
    const humanProfiles = getHumanCoachProfiles();
    const availableHuman = humanProfiles.find((p) => p.availability.status === "available") || humanProfiles[0];
    return {
      shouldRecommend: true,
      triggerSource: "risk",
      triggerReason: `检测到中等风险信号: "${mediumRiskMatch}"`,
      recommendedType: "human_coach",
      recommendedCoachId: availableHuman.coachAgentId,
      recommendedCoachName: availableHuman.displayName,
      displayReason: "你现在的感受听起来很强烈。也许和一位真人咨询师深入聊聊会有帮助？",
      confidenceScore: 80,
      riskLevel: "medium",
    };
  }

  return null;
}

/* ═══ Explicit Request Trigger ═══ */
function evaluateExplicitRequest(
  message: string,
  _session: CoachSession
): TriggerEvaluation | null {
  const lowerMsg = message.toLowerCase();

  // Check for explicit human coach request
  const humanMatch = EXPLICIT_HUMAN_REQUEST_KEYWORDS.find((kw) => lowerMsg.includes(kw));
  if (humanMatch) {
    const humanProfiles = getHumanCoachProfiles();
    const availableHuman = humanProfiles.find((p) => p.availability.status === "available") || humanProfiles[0];
    return {
      shouldRecommend: true,
      triggerSource: "explicit_request",
      triggerReason: `用户明确请求真人支持: "${humanMatch}"`,
      recommendedType: "human_coach",
      recommendedCoachId: availableHuman.coachAgentId,
      recommendedCoachName: availableHuman.displayName,
      displayReason: "好的，我为你推荐一位合适的真人咨询师。",
      confidenceScore: 90,
      riskLevel: "none",
    };
  }

  // Check for explicit specialist request
  const specialistMatch = EXPLICIT_SPECIALIST_REQUEST_KEYWORDS.find((kw) => lowerMsg.includes(kw));
  if (specialistMatch) {
    const coach = findBestSpecialistByKeyword(specialistMatch);
    if (coach) {
      return {
        shouldRecommend: true,
        triggerSource: "explicit_request",
        triggerReason: `用户明确请求专题支持: "${specialistMatch}"`,
        recommendedType: "specialist_ai",
        recommendedCoachId: coach.id,
        recommendedCoachName: coach.name,
        displayReason: `你提到了"${specialistMatch}"，${coach.name}在这方面很有经验，也许可以给你更专业的支持。`,
        confidenceScore: 85,
        riskLevel: "none",
      };
    }
  }

  return null;
}

/* ═══ Semantic Trigger (AI-powered) ═══ */
async function evaluateSemanticTrigger(
  session: CoachSession,
  currentMessage: string
): Promise<TriggerEvaluation | null> {
  try {
    const recentMessages = session.messages.slice(-10);
    const conversationContext = recentMessages
      .map((m) => `${m.role === "user" ? "用户" : "AI"}: ${m.content}`)
      .join("\n");

    const specialists = getSpecialistCoaches();
    const coachList = specialists
      .map((c) => `- ${c.id}: ${c.name} (${c.specialty}) — 触发信号: ${c.triggerSignals.join("; ")}`)
      .join("\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: `你是一个推荐决策引擎。根据对话上下文判断是否应该推荐专题 Coach。

## 可推荐的专题 Coach：
${coachList}

## 判断规则：
1. 议题是否已经足够聚焦到某个专题 Coach 的领域？
2. 用户是否在当前对话中反复围绕同一主题？
3. 用户的情绪强度是否需要更专业的支持？
4. 当前 AI 是否已经到了能力边界？

## 重要：
- 不要过于积极推荐，只在确实匹配时推荐
- 如果用户只是随便聊聊，不需要推荐
- confidence_score 低于 60 则不推荐

请以 JSON 格式返回：
{
  "should_recommend": boolean,
  "recommended_coach_id": "string or null",
  "trigger_reason": "string",
  "display_reason": "string - 面向用户的推荐理由，温暖友好",
  "confidence_score": number (0-100),
  "topic_focus": "string - 识别到的核心议题"
}`,
        },
        {
          role: "user",
          content: `对话上下文：
${conversationContext}

用户最新消息：${currentMessage}

请判断是否需要推荐专题 Coach。`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

    if (result.should_recommend && result.confidence_score >= 60 && result.recommended_coach_id) {
      const coach = specialists.find((c) => c.id === result.recommended_coach_id);
      if (coach) {
        return {
          shouldRecommend: true,
          triggerSource: "semantic",
          triggerReason: result.trigger_reason || "语义分析匹配",
          recommendedType: "specialist_ai",
          recommendedCoachId: coach.id,
          recommendedCoachName: coach.name,
          displayReason: result.display_reason || `${coach.name}在${coach.specialty}方面很有经验，也许可以给你更深入的支持。`,
          confidenceScore: result.confidence_score,
          riskLevel: "none",
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Semantic trigger evaluation error:", error);
    return null;
  }
}

/* ═══ Helper: Find Best Specialist by Keyword ═══ */
function findBestSpecialistByKeyword(keyword: string): CoachAgent | null {
  const specialists = getSpecialistCoaches();
  const lowerKw = keyword.toLowerCase();

  // Direct name match
  const nameMatch = specialists.find(
    (c) => c.name.includes(keyword) || c.nameEn.toLowerCase().includes(lowerKw)
  );
  if (nameMatch) return nameMatch;

  // Keyword match
  const keywordMatch = specialists.find((c) =>
    c.topicKeywords.some((tk) => tk.includes(keyword) || keyword.includes(tk))
  );
  if (keywordMatch) return keywordMatch;

  // Tag match
  const tagMatch = specialists.find((c) =>
    c.tags?.some((t) => t.includes(keyword) || keyword.includes(t))
  );
  if (tagMatch) return tagMatch;

  return specialists[0]; // Fallback to first specialist
}
