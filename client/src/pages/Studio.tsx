/*
 * Design: Architectural Dark Theater × Line System
 * Studio — Coach creation workshop with review pipeline
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Edit3,
  Eye,
  Trash2,
  Settings,
  Upload,
  FileText,
  Layers,
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

type CoachStatus = "draft" | "review" | "approved" | "published";

const STATUS_CONFIG: Record<CoachStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  draft: { label: "草稿", color: "text-muted-foreground", bg: "bg-muted", icon: Edit3 },
  review: { label: "审核中", color: "text-amber-400", bg: "bg-amber-400/10", icon: Clock },
  approved: { label: "已通过", color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle2 },
  published: { label: "已发布", color: "text-primary", bg: "bg-primary/10", icon: Sparkles },
};

const MY_COACHES = [
  {
    id: "1",
    name: "晨光引导师",
    desc: "专注于晨间正念和日记引导的 AI 教练",
    status: "published" as CoachStatus,
    sessions: 856,
    rating: 4.6,
    created: "2026-03-01",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "2",
    name: "创业伙伴",
    desc: "为创业者提供心理支持和决策框架的 AI 教练",
    status: "review" as CoachStatus,
    sessions: 0,
    rating: 0,
    created: "2026-03-28",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    id: "3",
    name: "亲子沟通师",
    desc: "帮助父母改善与孩子的沟通方式",
    status: "draft" as CoachStatus,
    sessions: 0,
    rating: 0,
    created: "2026-04-01",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
  },
];

const REVIEW_STEPS = [
  { step: 1, title: "基础信息", desc: "教练名称、头像、简介", done: true },
  { step: 2, title: "方法论配置", desc: "理论取向、对话风格", done: true },
  { step: 3, title: "提示词设计", desc: "系统提示词、示例对话", done: true },
  { step: 4, title: "安全审核", desc: "内容安全、伦理合规", done: false },
  { step: 5, title: "质量测试", desc: "对话质量、一致性测试", done: false },
  { step: 6, title: "发布上线", desc: "教练广场上架", done: false },
];

export default function Studio() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-[1200px]">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.h1 custom={0} variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            创作<span className="text-gradient">工坊</span>
          </motion.h1>
          <motion.p custom={1} variants={fadeUp} className="text-muted-foreground mb-6">
            创建、管理和发布你的 AI 教练。
          </motion.p>
          <motion.div custom={2} variants={fadeUp} className="flex items-center gap-3">
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
            >
              <Plus size={16} />
              创建新教练
            </button>
            <Link
              href="/counselor-onboard"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
            >
              <Upload size={14} />
              风格复制入口
            </Link>
          </motion.div>
        </motion.div>

        {/* Create Form (toggle) */}
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glow-card p-6 mb-8 border-primary/20"
          >
            <h3 className="text-sm font-semibold mb-4">创建新 AI 教练</h3>
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">教练名称</label>
                <input
                  type="text"
                  placeholder="例如：晨光引导师"
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5">专业领域</label>
                <input
                  type="text"
                  placeholder="例如：情绪调节 · 正念冥想"
                  className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1.5">教练简介</label>
                <textarea
                  placeholder="描述这位 AI 教练的方法论、陪伴风格和适用场景..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="text-xs text-muted-foreground block mb-1.5">理论取向</label>
                <div className="flex flex-wrap gap-2">
                  {["CBT", "人本主义", "精神动力", "叙事疗法", "正念", "ACT", "家庭系统"].map((t) => (
                    <button
                      key={t}
                      className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5 pt-4 border-t border-border">
              <button className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all">
                保存草稿
              </button>
              <button onClick={() => setShowCreate(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                取消
              </button>
            </div>
          </motion.div>
        )}

        {/* My Coaches */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.h2 custom={3} variants={fadeUp} className="text-sm font-medium mb-4">
            我的教练 ({MY_COACHES.length})
          </motion.h2>
          <div className="space-y-3">
            {MY_COACHES.map((coach, i) => {
              const status = STATUS_CONFIG[coach.status];
              return (
                <motion.div key={coach.id} custom={i + 4} variants={fadeUp} className="glow-card p-5">
                  <div className="flex items-center gap-4">
                    <img src={coach.avatar} alt={coach.name} className="w-12 h-12 rounded-lg object-cover ring-1 ring-border" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="text-sm font-semibold">{coach.name}</h3>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${status.bg} ${status.color} flex items-center gap-1`}>
                          <status.icon size={10} />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{coach.desc}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 shrink-0">
                      {coach.sessions > 0 && (
                        <div className="text-center">
                          <div className="text-sm font-medium">{coach.sessions}</div>
                          <div className="text-[10px] text-muted-foreground">对话</div>
                        </div>
                      )}
                      {coach.rating > 0 && (
                        <div className="text-center">
                          <div className="text-sm font-medium">{coach.rating}</div>
                          <div className="text-[10px] text-muted-foreground">评分</div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                        <Eye size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Review Pipeline */}
        <motion.div initial="hidden" animate="visible">
          <motion.h2 custom={7} variants={fadeUp} className="text-sm font-medium mb-4">
            审核流程
          </motion.h2>
          <motion.div custom={8} variants={fadeUp} className="glow-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <Layers size={14} className="text-primary" />
              <span className="text-xs text-muted-foreground">「创业伙伴」审核进度</span>
            </div>
            <div className="space-y-4">
              {REVIEW_STEPS.map((s, i) => (
                <div key={s.step} className="flex items-start gap-4">
                  <div className="relative flex flex-col items-center">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                        s.done ? "bg-emerald-400/20 text-emerald-400" : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {s.done ? <CheckCircle2 size={14} /> : s.step}
                    </div>
                    {i < REVIEW_STEPS.length - 1 && (
                      <div className={`w-px h-6 mt-1 ${s.done ? "bg-emerald-400/30" : "bg-border"}`} />
                    )}
                  </div>
                  <div className="pt-0.5">
                    <span className={`text-sm font-medium block ${s.done ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
