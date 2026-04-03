/*
 * Design: Architectural Dark Theater × Line System
 * Insights — Growth tracking with emotion trajectory, timeline, monthly reports
 */
import { motion } from "framer-motion";
import {
  TrendingUp,
  Calendar,
  Heart,
  Brain,
  Flame,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Minus,
  BookOpen,
  Sparkles,
  Clock,
  Target,
} from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const MONTHLY_MOOD = [
  { week: "W1", avg: 62, high: 78, low: 45 },
  { week: "W2", avg: 68, high: 82, low: 50 },
  { week: "W3", avg: 55, high: 72, low: 38 },
  { week: "W4", avg: 75, high: 88, low: 60 },
];

const EMOTION_TAGS = [
  { name: "平静", count: 18, trend: "up" as const },
  { name: "焦虑", count: 12, trend: "down" as const },
  { name: "觉察", count: 15, trend: "up" as const },
  { name: "感恩", count: 9, trend: "up" as const },
  { name: "迷茫", count: 6, trend: "down" as const },
  { name: "成长", count: 11, trend: "up" as const },
];

const TIMELINE = [
  { date: "2026-04-01", title: "觉察到回避模式", desc: "在与林子墨的对话中，第一次清晰地看到了自己在冲突中的回避模式。", coach: "林子墨", emotion: "觉察", type: "breakthrough" as const },
  { date: "2026-03-28", title: "完成 7 天正念挑战", desc: "连续 7 天完成晨间正念练习，焦虑指数下降 15%。", coach: "陈思雨", emotion: "平静", type: "milestone" as const },
  { date: "2026-03-25", title: "第一次表达边界", desc: "在张晓薇的引导下，第一次在关系中清晰地表达了自己的边界。", coach: "张晓薇", emotion: "勇气", type: "breakthrough" as const },
  { date: "2026-03-20", title: "职业方向梳理", desc: "与王浩然完成了职业价值观排序，明确了未来 3 年的发展方向。", coach: "王浩然", emotion: "清晰", type: "insight" as const },
  { date: "2026-03-15", title: "开始 CoachOS 旅程", desc: "注册 CoachOS，与陈思雨进行了第一次深度对话。", coach: "陈思雨", emotion: "期待", type: "milestone" as const },
];

const TYPE_COLORS: Record<string, string> = {
  breakthrough: "bg-amber-400",
  milestone: "bg-emerald-400",
  insight: "bg-violet-400",
};

const TREND_ICON = {
  up: ArrowUp,
  down: ArrowDown,
  stable: Minus,
};

export default function Insights() {
  const [activeTab, setActiveTab] = useState<"overview" | "timeline" | "report">("overview");

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-[1200px]">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.h1 custom={0} variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            成长<span className="text-gradient">洞见</span>
          </motion.h1>
          <motion.p custom={1} variants={fadeUp} className="text-muted-foreground mb-6">
            每一步都被温柔记录。这里是你的成长轨迹。
          </motion.p>

          {/* Tabs */}
          <motion.div custom={2} variants={fadeUp} className="flex gap-1 p-1 rounded-lg bg-secondary/50 w-fit">
            {[
              { key: "overview" as const, label: "总览" },
              { key: "timeline" as const, label: "来时路" },
              { key: "report" as const, label: "月度报告" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`text-xs px-4 py-1.5 rounded-md transition-all ${
                  activeTab === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* ═══ Overview Tab ═══ */}
        {activeTab === "overview" && (
          <motion.div initial="hidden" animate="visible">
            {/* KPI Row */}
            <motion.div custom={3} variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: "情绪均值", value: "72", change: "+5", icon: Heart, color: "text-rose-400" },
                { label: "觉察次数", value: "15", change: "+3", icon: Brain, color: "text-violet-400" },
                { label: "对话总数", value: "47", change: "+12", icon: BookOpen, color: "text-amber-400" },
                { label: "连续天数", value: "14", change: "", icon: Flame, color: "text-orange-400" },
              ].map((kpi) => (
                <div key={kpi.label} className="glow-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <kpi.icon size={16} className={kpi.color} strokeWidth={1.5} />
                    {kpi.change && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono">
                        <TrendingUp size={10} />
                        {kpi.change}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </motion.div>

            {/* Monthly Mood Chart */}
            <motion.div custom={4} variants={fadeUp} className="glow-card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-medium">月度情绪波动</h3>
                <span className="text-xs text-muted-foreground">2026 年 3 月</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {MONTHLY_MOOD.map((w, i) => (
                  <div key={w.week} className="text-center">
                    <div className="relative h-32 flex items-end justify-center mb-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${w.avg}%` }}
                        transition={{ delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                        className="w-8 rounded-t-md bg-gradient-to-t from-primary/60 to-primary/20 relative"
                      >
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-primary">
                          {w.avg}
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-xs text-muted-foreground">{w.week}</span>
                    <div className="text-[9px] text-muted-foreground mt-0.5">
                      {w.low}-{w.high}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Emotion Tags */}
            <motion.div custom={5} variants={fadeUp} className="glow-card p-6">
              <h3 className="text-sm font-medium mb-4">情绪关键词</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {EMOTION_TAGS.map((tag) => {
                  const TrendIcon = TREND_ICON[tag.trend];
                  return (
                    <div key={tag.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{tag.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{tag.count}</span>
                      </div>
                      <TrendIcon
                        size={12}
                        className={tag.trend === "up" ? "text-emerald-400" : tag.trend === "down" ? "text-rose-400" : "text-muted-foreground"}
                      />
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ Timeline Tab ═══ */}
        {activeTab === "timeline" && (
          <motion.div initial="hidden" animate="visible">
            <motion.div custom={3} variants={fadeUp} className="relative">
              {/* Vertical line */}
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

              <div className="space-y-8">
                {TIMELINE.map((event, i) => (
                  <motion.div key={i} custom={i + 4} variants={fadeUp} className="relative flex gap-6 pl-12">
                    {/* Dot */}
                    <div className={`absolute left-3 top-1.5 w-3 h-3 rounded-full ${TYPE_COLORS[event.type]} ring-4 ring-background`} />

                    <div className="glow-card p-5 flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground font-mono">{event.date}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{event.emotion}</span>
                      </div>
                      <h4 className="text-sm font-semibold mb-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{event.desc}</p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Sparkles size={10} />
                        <span>与 {event.coach} 的对话</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ═══ Monthly Report Tab ═══ */}
        {activeTab === "report" && (
          <motion.div initial="hidden" animate="visible">
            <motion.div custom={3} variants={fadeUp} className="glow-card p-8 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-primary" />
                <h2 className="text-lg font-semibold">2026 年 3 月 · 月度报告</h2>
              </div>

              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-sm text-muted-foreground leading-relaxed space-y-4">
                  <p>
                    本月你共完成了 <span className="text-foreground font-medium">47 次</span>深度对话，
                    情绪均值从月初的 62 上升到月末的 75，整体呈现积极的成长趋势。
                  </p>
                  <p>
                    最显著的突破发生在 3 月 25 日——你第一次在关系中清晰地表达了自己的边界。
                    这标志着你从「回避冲突」到「面对冲突」的重要转变。
                  </p>
                  <p>
                    焦虑出现的频率从月初的每周 4 次下降到月末的每周 2 次，
                    这与你坚持正念练习有直接关系。建议继续保持每日的晨间正念。
                  </p>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <motion.div custom={4} variants={fadeUp} className="glow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target size={14} className="text-emerald-400" />
                  <h3 className="text-sm font-medium">本月成就</h3>
                </div>
                <div className="space-y-3">
                  {["完成 7 天正念挑战", "首次表达个人边界", "情绪均值提升 13 点", "觉察次数增长 25%"].map((a, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                      {a}
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div custom={5} variants={fadeUp} className="glow-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-primary" />
                  <h3 className="text-sm font-medium">下月建议</h3>
                </div>
                <div className="space-y-3">
                  {[
                    "尝试与林子墨进行更深层的信念探索",
                    "将正念练习时间从 10 分钟延长到 15 分钟",
                    "记录每次觉察的具体触发场景",
                    "探索与「完美主义」相关的核心信念",
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight size={12} className="text-primary shrink-0" />
                      {s}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Coach Usage */}
            <motion.div custom={6} variants={fadeUp} className="glow-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-medium">教练使用分布</h3>
              </div>
              <div className="space-y-3">
                {[
                  { name: "陈思雨", sessions: 18, percent: 38, color: "bg-amber-400" },
                  { name: "林子墨", sessions: 14, percent: 30, color: "bg-teal-400" },
                  { name: "张晓薇", sessions: 9, percent: 19, color: "bg-rose-400" },
                  { name: "王浩然", sessions: 6, percent: 13, color: "bg-violet-400" },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-xs w-16 shrink-0">{c.name}</span>
                    <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${c.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${c.percent}%` }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono w-12 text-right">{c.sessions} 次</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
