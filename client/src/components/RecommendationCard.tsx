/**
 * RecommendationCard — 推荐卡片组件
 * 在归处 AI 主界面展示推荐的专题 Coach 或真人 Coach。
 * 支持：推荐对象名称、类型、推荐原因、三个操作按钮。
 */
import { motion } from "framer-motion";
import {
  Sparkles,
  X,
  ArrowRight,
  MessageCircle,
  Clock,
  Shield,
  User,
  Bot,
} from "lucide-react";

interface RecommendationCardProps {
  recommendation: {
    id: string;
    type: "specialist_ai" | "human_coach";
    coachName: string;
    coachId: string;
    coachAvatar?: string;
    coachSpecialty?: string;
    displayReason: string;
    triggerSource?: string;
    confidenceScore?: number;
    riskLevel?: string;
  };
  onContinueMain: () => void;
  onOpenCoach: () => void;
  onDismiss: () => void;
  isLoading?: boolean;
}

export default function RecommendationCard({
  recommendation,
  onContinueMain,
  onOpenCoach,
  onDismiss,
  isLoading,
}: RecommendationCardProps) {
  const isHuman = recommendation.type === "human_coach";
  const isHighRisk = recommendation.riskLevel === "high" || recommendation.riskLevel === "critical";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.4 }}
      className="relative"
    >
      <div
        className={`rounded-xl border p-5 backdrop-blur-sm ${
          isHighRisk
            ? "border-rose-500/30 bg-rose-500/5"
            : "border-primary/20 bg-card/80"
        }`}
      >
        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          title="稍后再看"
        >
          <X size={12} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          {isHighRisk ? (
            <Shield size={14} className="text-rose-400" />
          ) : (
            <Sparkles size={14} className="text-primary" />
          )}
          <span className="text-xs font-medium">
            {isHighRisk
              ? "归处 AI 建议你获得更专业的支持"
              : "归处 AI 为你找到了更匹配的支持"}
          </span>
        </div>

        {/* Coach Info */}
        <div className="flex items-start gap-3 mb-4">
          {recommendation.coachAvatar ? (
            <img
              src={recommendation.coachAvatar}
              alt={recommendation.coachName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-border shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center shrink-0">
              {isHuman ? <User size={20} className="text-muted-foreground" /> : <Bot size={20} className="text-muted-foreground" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold">{recommendation.coachName}</span>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${
                  isHuman
                    ? "bg-emerald-400/10 text-emerald-400"
                    : "bg-primary/10 text-primary"
                }`}
              >
                {isHuman ? "真人 Coach" : "专题 AI Coach"}
              </span>
            </div>
            {recommendation.coachSpecialty && (
              <p className="text-[11px] text-muted-foreground mb-1.5">
                {recommendation.coachSpecialty}
              </p>
            )}
          </div>
        </div>

        {/* Recommendation Reason */}
        <div className="bg-secondary/50 rounded-lg px-3 py-2.5 mb-4">
          <p className="text-xs text-foreground/80 leading-relaxed">
            {recommendation.displayReason}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Primary: Go to Coach */}
          <button
            onClick={onOpenCoach}
            disabled={isLoading}
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium transition-all ${
              isHighRisk
                ? "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            } disabled:opacity-50`}
          >
            <ArrowRight size={13} />
            {isHuman ? "了解这位咨询师" : `和${recommendation.coachName}聊聊`}
          </button>

          {/* Secondary: Continue with main AI */}
          <div className="flex gap-2">
            <button
              onClick={onContinueMain}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border disabled:opacity-50"
            >
              <MessageCircle size={11} />
              继续和归处聊
            </button>
            <button
              onClick={onDismiss}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary transition-all border border-border disabled:opacity-50"
            >
              <Clock size={11} />
              稍后再看
            </button>
          </div>
        </div>

        {/* Footer: confidence info */}
        {recommendation.confidenceScore && (
          <div className="mt-3 pt-2 border-t border-border/50">
            <span className="text-[9px] text-muted-foreground/60">
              推荐置信度 {recommendation.confidenceScore}% · 基于对话内容分析
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
