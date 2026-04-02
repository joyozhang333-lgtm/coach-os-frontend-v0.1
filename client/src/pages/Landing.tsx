import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, MessageCircle, Users, BarChart3, Layers } from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/hero-dark-abstract-UaW7FFVrYwSTbsAx5bGwQQ.webp";
const GRID_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/feature-grid-bg-8HTZN8KBVruaFgiQtrHHzc.webp";
const AVATAR1 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-1-A3mBFMvgfbS2zXeuvtKNDJ.webp";
const AVATAR2 = "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-2-MnhkP6sForXkU4A8q3vRBh.webp";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const FEATURES = [
  { icon: MessageCircle, title: "智慧对话", desc: "Coach Session 驱动的深度 AI 对话，理解你的情绪模式与成长轨迹", href: "/chat" },
  { icon: Users, title: "教练广场", desc: "发现适合你的 AI 教练，每位教练都有独特的方法论和陪伴风格", href: "/marketplace" },
  { icon: BarChart3, title: "成长洞见", desc: "情绪轨迹、来时路时间线、月度报告——每一步都被温柔记录", href: "/insights" },
  { icon: Layers, title: "创作工坊", desc: "创建、审核、发布你自己的 AI 教练，完整的 Studio 审核流", href: "/studio" },
];

const STATS = [
  { value: "50+", label: "AI 教练" },
  { value: "10K+", label: "深度对话" },
  { value: "98%", label: "用户满意度" },
  { value: "24/7", label: "全天候陪伴" },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ═══ Nav ═══ */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 glass"
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-black text-xs font-bold">C</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">CoachOS</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "教练广场", href: "/marketplace" },
              { label: "成长洞见", href: "/insights" },
              { label: "创作工坊", href: "/studio" },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200">
                {item.label}
              </Link>
            ))}
            <Link href="/chat" className="text-[13px] px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
              开始对话
            </Link>
          </div>
          {/* Mobile menu button */}
          <Link href="/chat" className="md:hidden text-[13px] px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium">
            开始
          </Link>
        </div>
      </motion.nav>

      {/* ═══ Hero ═══ */}
      <section className="relative min-h-screen flex items-center">
        <div className="absolute inset-0">
          <img src={HERO_BG} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10 pt-24 pb-20 w-full">
          <div className="max-w-2xl">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border text-xs text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                CoachOS v2.0 — Now Live
              </span>
            </motion.div>

            <motion.h1
              custom={1} variants={fadeUp} initial="hidden" animate="visible"
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
            >
              Your AI Coach,
              <br />
              <span className="text-gradient">Redefined.</span>
            </motion.h1>

            <motion.p custom={2} variants={fadeUp} initial="hidden" animate="visible" className="text-lg text-muted-foreground max-w-lg leading-relaxed mb-10">
              世界级 AI 教练平台。深度对话、情绪洞察、成长记录——在这里，每一次对话都是一次觉察。
            </motion.p>

            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible" className="flex flex-wrap items-center gap-4">
              <Link href="/chat" className="group inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all">
                开始对话
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link href="/marketplace" className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all">
                探索教练广场
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-foreground/20 flex justify-center pt-1.5"
          >
            <div className="w-1 h-2 rounded-full bg-foreground/40" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ Stats Bar ═══ */}
      <section className="border-y border-border bg-card/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-4"
          >
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                variants={fadeUp}
                className="py-10 px-4 text-center border-r border-border last:border-r-0"
              >
                <div className="text-3xl lg:text-4xl font-bold text-gradient mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground tracking-wide">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Features ═══ */}
      <section className="relative py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <img src={GRID_BG} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            className="mb-16"
          >
            <motion.span custom={0} variants={fadeUp} className="text-xs text-primary font-medium tracking-widest uppercase block mb-4">Platform</motion.span>
            <motion.h2 custom={1} variants={fadeUp} className="text-3xl lg:text-5xl font-bold tracking-tight mb-4">
              一个完整的教练生态
            </motion.h2>
            <motion.p custom={2} variants={fadeUp} className="text-muted-foreground max-w-lg text-lg">
              从对话到洞见，从创作到审核，CoachOS 构建了完整的 AI 教练运行时。
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-60px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} custom={i} variants={fadeUp}>
                <Link href={f.href}>
                  <div className="glow-card group p-7 h-full flex flex-col">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                      <f.icon size={20} className="text-primary" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{f.desc}</p>
                    <div className="mt-5 flex items-center gap-1.5 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      探索 <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ Coach Showcase ═══ */}
      <section className="py-32 lg:py-40 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
            className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center"
          >
            <motion.div custom={0} variants={fadeUp}>
              <span className="text-xs text-primary font-medium tracking-widest uppercase block mb-4">AI Coaches</span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight mb-6">
                每位教练，<br />都是一颗独特的<span className="text-gradient">宝石</span>。
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
                不同的方法论、不同的陪伴风格、不同的专业领域。在 CoachOS 的教练广场，找到最适合你的那一位。
              </p>
              <Link href="/marketplace" className="group inline-flex items-center gap-2 text-sm text-primary hover:underline underline-offset-4">
                浏览全部教练 <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} className="relative">
              <div className="grid grid-cols-2 gap-6">
                <div className="glow-card p-5 flex flex-col items-center">
                  <img src={AVATAR1} alt="Coach Amber" className="w-full aspect-square object-cover rounded-lg mb-4" />
                  <span className="text-sm font-medium">安宁心</span>
                  <span className="text-xs text-muted-foreground mt-0.5">情绪调节 · 正念</span>
                </div>
                <div className="glow-card p-5 flex flex-col items-center mt-8">
                  <img src={AVATAR2} alt="Coach Jade" className="w-full aspect-square object-cover rounded-lg mb-4" />
                  <span className="text-sm font-medium">明镜台</span>
                  <span className="text-xs text-muted-foreground mt-0.5">自我探索 · 觉察</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-32 lg:py-44 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}
          className="relative z-10 text-center max-w-2xl mx-auto px-6"
        >
          <motion.h2 custom={0} variants={fadeUp} className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
            Ready to begin?
          </motion.h2>
          <motion.p custom={1} variants={fadeUp} className="text-lg text-muted-foreground mb-10">
            不用准备好，来就好。无论你现在处于什么状态，这里都有一个位置留给你。
          </motion.p>
          <motion.div custom={2} variants={fadeUp}>
            <Link href="/chat" className="group inline-flex items-center gap-3 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-all">
              开始你的旅程
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="border-t border-border py-12 px-6 lg:px-10">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-black text-[9px] font-bold">C</span>
            </div>
            <span className="text-xs text-muted-foreground">CoachOS &copy; 2026</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <Link href="/marketplace" className="hover:text-foreground transition-colors">教练广场</Link>
            <Link href="/insights" className="hover:text-foreground transition-colors">成长洞见</Link>
            <Link href="/studio" className="hover:text-foreground transition-colors">创作工坊</Link>
            <Link href="/chat" className="hover:text-foreground transition-colors">开始对话</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
