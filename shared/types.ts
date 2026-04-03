/**
 * CoachOS V0.2 — Shared Types
 * Core type definitions for the 归处 AI + Coach 协同机制
 */

/* ═══ Coach Classification ═══ */
export type CoachClass = "main_ai" | "specialist_ai" | "human_coach";
export type SessionRole = "main" | "specialist" | "human_support";
export type EntrySource = "landing" | "main_ai_recommendation" | "marketplace" | "manual_switch";

/* ═══ Recommendation Types ═══ */
export type TriggerSource = "threshold" | "semantic" | "risk" | "explicit_request";
export type RecommendedType = "specialist_ai" | "human_coach";
export type RecommendationStatus = "pending" | "shown" | "accepted" | "dismissed" | "suppressed" | "expired";
export type FeedbackAction = "continue_main_ai" | "open_specialist_ai" | "open_human_coach" | "dismiss_once" | "suppress_for_session";
export type ReturnReason = "completed" | "user_exit" | "handoff_to_main" | "human_booking_finished";
export type RiskLevel = "none" | "low" | "medium" | "high" | "critical";

/* ═══ Audit Event Types ═══ */
export type AuditEventType =
  | "recommendation_generated"
  | "recommendation_shown"
  | "recommendation_accepted"
  | "recommendation_dismissed"
  | "entered_specialist_coach"
  | "entered_human_coach"
  | "returned_to_main_ai";

/* ═══ Coach Agent (Extended) ═══ */
export interface CoachAgent {
  id: string;
  name: string;
  nameEn: string;
  coachClass: CoachClass;
  specialty: string;
  method: string;
  systemPrompt: string;
  topicKeywords: string[];
  triggerSignals: string[];
  notSuitableFor: string[];
  summaryFocus: string[];
  isRecommendable: boolean;
  recommendationPriority: number;
  returnToMainRequired: boolean;
  humanProfileId?: string;
  avatar?: string;
  bio?: string;
  tags?: string[];
  rating?: number;
  sessions?: string;
  color?: string;
  greeting?: string;
}

/* ═══ Human Coach Profile ═══ */
export interface HumanCoachProfile {
  id: string;
  coachAgentId: string;
  displayName: string;
  headline: string;
  bio: string;
  specialties: string[];
  methods: string[];
  credentials: string[];
  serviceModes: string[];
  priceRange: { min: number; max: number; currency: string };
  languages: string[];
  availability: { status: "available" | "busy" | "offline"; nextSlot?: string };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/* ═══ Recommendation Decision ═══ */
export interface RecommendationDecision {
  id: string;
  userId: string;
  mainSessionId: string;
  mainCoachSessionId: string;
  triggerSource: TriggerSource;
  triggerReason: string;
  confidenceScore: number;
  riskLevel: RiskLevel;
  recommendedType: RecommendedType;
  recommendedCoachAgentId: string;
  recommendedHumanProfileId?: string;
  displayReason: string;
  status: RecommendationStatus;
  shownAt?: string;
  actedAt?: string;
  createdAt: string;
}

/* ═══ Recommendation Feedback ═══ */
export interface RecommendationFeedback {
  id: string;
  recommendationDecisionId: string;
  userId: string;
  action: FeedbackAction;
  notes?: string;
  createdAt: string;
}

/* ═══ Coach Session (Extended) ═══ */
export interface CoachSession {
  id: string;
  userId: string;
  coachAgentId: string;
  entrySource: EntrySource;
  sessionRole: SessionRole;
  rootMainCoachSessionId?: string;
  recommendedByDecisionId?: string;
  returnToMainCoachSessionId?: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  topicSummary: string;
  emotionState: string;
  messageCount: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

/* ═══ Coach Return Event ═══ */
export interface CoachReturnEvent {
  id: string;
  userId: string;
  fromCoachSessionId: string;
  toMainCoachSessionId: string;
  reason: ReturnReason;
  summaryJson: {
    keyTopics: string[];
    insights: string[];
    nextSteps: string[];
    coachNotes: string;
  };
  createdAt: string;
}

/* ═══ Audit Log Entry ═══ */
export interface AuditLogEntry {
  id: string;
  eventType: AuditEventType;
  userId: string;
  sessionId?: string;
  recommendationId?: string;
  coachAgentId?: string;
  metadata: Record<string, unknown>;
  timestamp: string;
}

/* ═══ API Request/Response Types ═══ */
export interface RecommendationEvaluateRequest {
  sessionId: string;
  userId?: string;
  currentMessage?: string;
}

export interface RecommendationEvaluateResponse {
  shouldRecommend: boolean;
  recommendation?: {
    id: string;
    type: RecommendedType;
    coachName: string;
    coachId: string;
    displayReason: string;
    triggerSource: TriggerSource;
    confidenceScore: number;
    riskLevel: RiskLevel;
  };
}

export interface RecommendationCurrentResponse {
  hasRecommendation: boolean;
  recommendation?: {
    id: string;
    type: RecommendedType;
    coachName: string;
    coachId: string;
    coachAvatar?: string;
    coachSpecialty?: string;
    displayReason: string;
    actions: FeedbackAction[];
  };
}

export interface RecommendationRespondRequest {
  recommendationId: string;
  action: FeedbackAction;
  userId?: string;
  notes?: string;
}

export interface ReturnToMainRequest {
  reason: ReturnReason;
  userId?: string;
}

export interface ReturnToMainResponse {
  success: boolean;
  mainSessionId: string;
  summary?: {
    keyTopics: string[];
    insights: string[];
    nextSteps: string[];
  };
}
