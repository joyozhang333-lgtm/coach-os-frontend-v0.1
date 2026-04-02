import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, Plus, Clock, CheckCircle2, AlertCircle, Eye, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const DRAFTS = [
  {
    id: "1",
    name: "晨光",
    status: "published" as const,
    specialty: "晨间正念 · 日记引导",
    sessions: 856,
    updated: "2 天前",
  },
  {
    id: "2",
    name: "深海",
    status: "review" as const,
    specialty: "深度情绪探索 · 内在小孩",
    sessions: 0,
    updated: "5 小时前",
  },
  {
    id: "3",
    name: "星图",
    status: "draft" as const,
    specialty: "人生规划 · 价值观梳理",
    sessions: 0,
    updated: "刚刚",
  },
];

const STATUS_MAP = {
  published: { label: "已发布", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  review: { label: "审核中", icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
  draft: { label: "草稿", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-secondary" },
};

export default function Studio() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-black text-[9px] font-bold">C</span>
              </div>
              <span className="text-sm font-semibold">创作工坊</span>
            </div>
          </div>
          <button
            onClick={() => toast("创建新教练", { description: "Feature coming soon" })}
            className="inline-flex items-center gap-1.5 text-[13px] px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={14} />
            新建教练
          </button>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-10">
          <motion.h1 custom={0} variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            我的教练工坊
          </motion.h1>
          <motion.p custom={1} variants={fadeUp} className="text-muted-foreground">
            创建、调试、发布你自己的 AI 教练。
          </motion.p>
        </motion.div>

        {/* Stats row */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "已发布", value: "1", sub: "教练" },
            { label: "审核中", value: "1", sub: "教练" },
            { label: "总对话", value: "856", sub: "次" },
          ].map((s, i) => (
            <motion.div key={s.label} custom={i + 2} variants={fadeUp} className="glow-card p-5">
              <div className="text-2xl font-bold text-gradient">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label} · {s.sub}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Coach list */}
        <motion.div initial="hidden" animate="visible">
          <motion.h2 custom={5} variants={fadeUp} className="text-sm font-medium text-muted-foreground mb-4 tracking-wide uppercase">
            我的教练
          </motion.h2>
          <div className="space-y-3">
            {DRAFTS.map((draft, i) => {
              const status = STATUS_MAP[draft.status];
              const StatusIcon = status.icon;
              return (
                <motion.div
                  key={draft.id}
                  custom={i + 6}
                  variants={fadeUp}
                  className="glow-card p-5 flex items-center gap-5 group cursor-pointer"
                  onClick={() => toast("编辑「" + draft.name + "」", { description: "Feature coming soon" })}
                >
                  {/* Color dot */}
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-primary">{draft.name[0]}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium">{draft.name}</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                        <StatusIcon size={10} />
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">{draft.specialty}</span>
                  </div>

                  {/* Meta */}
                  <div className="hidden sm:flex items-center gap-6 text-xs text-muted-foreground shrink-0">
                    {draft.sessions > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {draft.sessions}
                      </span>
                    )}
                    <span>{draft.updated}</span>
                  </div>

                  <button className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={16} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Workflow section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mt-16 pt-16 border-t border-border"
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-sm font-medium text-muted-foreground mb-8 tracking-wide uppercase">
            发布流程
          </motion.h2>
          <div className="grid sm:grid-cols-4 gap-4">
            {[
              { step: "01", title: "创建", desc: "定义教练的人格、方法论和对话风格" },
              { step: "02", title: "调试", desc: "在沙盒中测试对话质量和边界处理" },
              { step: "03", title: "审核", desc: "提交 CoachOS 团队进行安全和质量审核" },
              { step: "04", title: "发布", desc: "通过审核后上架教练广场" },
            ].map((item, i) => (
              <motion.div key={item.step} custom={i + 1} variants={fadeUp} className="glow-card p-5">
                <span className="text-xs text-primary font-mono">{item.step}</span>
                <h3 className="text-sm font-semibold mt-2 mb-1">{item.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
