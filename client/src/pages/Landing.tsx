/**
 * CoachOS V0.2 — Landing Page
 * Design: Cinematic brand manifesto, NOT a template.
 * No stats bars, no feature grids, no "AI template" patterns.
 * Pure visual storytelling with golden volumetric light + architectural wireframes.
 * Primary CTA leads directly to AI Coach conversation.
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/hero-landing-v02-T5Ss4XvR7DNCqs5KA8yCAU.webp";

/* ═══ Slow fade-in ═══ */
const slowReveal = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({
    opacity: 1,
    transition: { duration: 1.4, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, delay, ease: [0.25, 0.1, 0.25, 1] as const },
  }),
};

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white min-h-screen overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO: Full-screen cinematic
      ═══════════════════════════════════════════ */}
      <section className="relative h-screen flex flex-col">
        {/* Background image with parallax */}
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${scrollY * 0.15}px)` }}
        >
          <img
            src={HERO_BG}
            alt=""
            className="w-full h-full object-cover opacity-70"
          />
          {/* Gradient overlays for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-[#0a0a0a]/40" />
        </div>

        {/* Minimal top nav */}
        <nav className="relative z-20 flex items-center justify-between px-8 lg:px-16 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-black text-xs font-bold tracking-tight">C</span>
            </div>
            <span className="text-sm font-medium tracking-wide text-white/80">CoachOS</span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-[13px] text-white/50">
            <Link href="/marketplace" className="hover:text-white/90 transition-colors duration-300">教练</Link>
            <Link href="/insights" className="hover:text-white/90 transition-colors duration-300">洞见</Link>
            <Link href="/counselor-onboard" className="hover:text-white/90 transition-colors duration-300">咨询师入驻</Link>
            <Link
              href="/chat"
              className="text-amber-400/90 hover:text-amber-300 transition-colors duration-300"
            >
              开始对话
            </Link>
          </div>
        </nav>

        {/* Hero content — asymmetric left-aligned */}
        <div className="relative z-10 flex-1 flex items-center px-8 lg:px-16">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-2xl"
          >
            <motion.div custom={0.3} variants={slowReveal}>
              <p className="text-amber-400/70 text-xs tracking-[0.3em] uppercase mb-8 font-medium">
                A space for your inner world
              </p>
            </motion.div>

            <motion.h1
              custom={0.6}
              variants={slowReveal}
              className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[1.05] tracking-tight mb-8"
            >
              <span className="block text-white/95">你的故事，</span>
              <span className="block text-amber-400/90">值得被听见。</span>
            </motion.h1>

            <motion.p
              custom={1}
              variants={slowReveal}
              className="text-white/40 text-lg lg:text-xl leading-relaxed max-w-lg mb-12"
            >
              不是工具，是陪伴。CoachOS 用 AI 的方式，
              <br className="hidden lg:block" />
              为你创造一个安全的对话空间。
            </motion.p>

            <motion.div custom={1.4} variants={slowReveal}>
              <Link
                href="/chat"
                className="group inline-flex items-center gap-3 text-base"
              >
                <span className="px-8 py-3.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-white/90 font-medium hover:bg-white/[0.1] hover:border-amber-400/30 transition-all duration-500">
                  开始你的第一次对话
                </span>
                <span className="w-10 h-10 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center group-hover:bg-amber-400/20 transition-all duration-500">
                  <ArrowRight size={16} className="text-amber-400" />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] text-white/20 tracking-widest uppercase">Scroll</span>
          <ChevronDown size={14} className="text-white/20 animate-bounce" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — Philosophy: One sentence, one truth
      ═══════════════════════════════════════════ */}
      <section className="relative py-40 lg:py-56 px-8 lg:px-16">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0d0d0d] to-[#0a0a0a]" />
        {/* Subtle horizontal line */}
        <div className="absolute top-0 left-16 right-16 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-120px" }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <motion.p
            custom={0}
            variants={slideUp}
            className="text-[clamp(1.5rem,3.5vw,3rem)] font-light leading-[1.5] text-white/70 tracking-tight"
          >
            <span className="text-white/90">"每个人的内心，</span>都有一座需要被照亮的房间。
            我们不急着给答案，
            <span className="text-amber-400/80">只是陪你，把灯打开。"</span>
          </motion.p>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 3 — How it works: Narrative, not feature list
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 lg:py-44 px-8 lg:px-16">
        <div className="absolute top-0 left-16 right-16 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1200px] mx-auto"
        >
          <motion.div custom={0} variants={slideUp} className="mb-24">
            <span className="text-[11px] text-amber-400/60 tracking-[0.25em] uppercase font-medium">Your Journey</span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white/90 mt-4">
              三步，开始改变。
            </h2>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-0">
            {/* Step 1 */}
            <motion.div
              custom={0.2}
              variants={slideUp}
              className="relative p-10 lg:p-12 border-l border-white/[0.06] group"
            >
              <div className="absolute top-10 left-0 w-2 h-2 rounded-full bg-amber-400/60 -translate-x-[5px]" />
              <span className="text-[11px] text-white/25 tracking-widest uppercase block mb-6">01</span>
              <h3 className="text-xl font-semibold text-white/90 mb-4">与 AI 教练对话</h3>
              <p className="text-white/40 leading-relaxed text-[15px]">
                打开 CoachOS，选择一位 AI 教练，开始你的第一次对话。不需要准备什么，来就好。
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              custom={0.4}
              variants={slideUp}
              className="relative p-10 lg:p-12 border-l border-white/[0.06] group"
            >
              <div className="absolute top-10 left-0 w-2 h-2 rounded-full bg-amber-400/40 -translate-x-[5px]" />
              <span className="text-[11px] text-white/25 tracking-widest uppercase block mb-6">02</span>
              <h3 className="text-xl font-semibold text-white/90 mb-4">AI 理解你的需求</h3>
              <p className="text-white/40 leading-relaxed text-[15px]">
                在对话过程中，AI 会理解你的情绪和话题方向，为你匹配最适合的真人咨询师。
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              custom={0.6}
              variants={slideUp}
              className="relative p-10 lg:p-12 border-l border-white/[0.06] group"
            >
              <div className="absolute top-10 left-0 w-2 h-2 rounded-full bg-amber-400/20 -translate-x-[5px]" />
              <span className="text-[11px] text-white/25 tracking-widest uppercase block mb-6">03</span>
              <h3 className="text-xl font-semibold text-white/90 mb-4">无缝衔接真人咨询</h3>
              <p className="text-white/40 leading-relaxed text-[15px]">
                当你准备好了，一键切换到匹配的真人咨询师。你的对话背景会被安全传递，无需重复叙述。
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 4 — AI Coaches: Real people, real names
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 lg:py-44 px-8 lg:px-16">
        <div className="absolute top-0 left-16 right-16 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1200px] mx-auto"
        >
          <motion.div custom={0} variants={slideUp} className="mb-20 max-w-lg">
            <span className="text-[11px] text-amber-400/60 tracking-[0.25em] uppercase font-medium">AI Coaches</span>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white/90 mt-4 mb-5">
              四位 AI 教练，<br />四种陪伴方式。
            </h2>
            <p className="text-white/40 leading-relaxed">
              每位教练都有独特的专业背景和对话风格。他们不是冰冷的程序，而是基于真实咨询方法论训练的 AI 伙伴。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                name: "陈思雨",
                role: "情绪调节 · 正念引导",
                desc: "国家二级心理咨询师背景，擅长帮助来访者觉察情绪模式。通过正念引导和认知行为技术，陪伴你找到内心的平静。",
                avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-serenity_d6e7dd08.png",
                accent: "amber",
              },
              {
                name: "林子墨",
                role: "自我探索 · 深度觉察",
                desc: "心理学硕士，专注于精神动力学方向。善于引导你看见行为模式背后的信念系统，发现内在真实的需求。",
                avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-mirror_70c8e3dc.png",
                accent: "teal",
              },
              {
                name: "张晓薇",
                role: "亲密关系 · 沟通表达",
                desc: "家庭治疗师背景，专注于依恋理论和沟通模式。陪伴你改善关系中的表达方式，学会设立健康的边界。",
                avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-warmth_c1d7e79c.png",
                accent: "rose",
              },
              {
                name: "王浩然",
                role: "职业发展 · 决策支持",
                desc: "组织心理学博士，曾任企业高管教练。帮助你在职业十字路口理清思路，找到内在驱动力和行动方向。",
                avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-infinity_c1656b18.png",
                accent: "violet",
              },
            ].map((coach, i) => (
              <motion.div
                key={coach.name}
                custom={0.15 * i}
                variants={slideUp}
              >
                <Link href="/chat" className="block">
                  <div className="group relative p-6 lg:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-400/20 hover:bg-white/[0.04] transition-all duration-500 cursor-pointer">
                    <div className="flex items-start gap-5">
                      <img
                        src={coach.avatar}
                        alt={coach.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0 ring-1 ring-white/[0.08]"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-white/90">{coach.name}</h3>
                          <span className={`text-[11px] px-2 py-0.5 rounded-full bg-${coach.accent}-400/10 text-${coach.accent}-400/70`}>
                            AI Coach
                          </span>
                        </div>
                        <p className="text-[13px] text-white/40 mb-3">{coach.role}</p>
                        <p className="text-[14px] text-white/30 leading-relaxed">{coach.desc}</p>
                      </div>
                    </div>
                    {/* Hover arrow */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ArrowRight size={16} className="text-amber-400/60" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — For Counselors
      ═══════════════════════════════════════════ */}
      <section className="relative py-32 lg:py-44 px-8 lg:px-16">
        <div className="absolute top-0 left-16 right-16 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-[1200px] mx-auto"
        >
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div custom={0} variants={slideUp}>
              <span className="text-[11px] text-amber-400/60 tracking-[0.25em] uppercase font-medium">For Counselors</span>
              <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white/90 mt-4 mb-6">
                你的咨询风格，<br />
                值得被延续。
              </h2>
              <p className="text-white/40 leading-relaxed mb-8 max-w-md">
                只需 30 分钟的自然对话，CoachOS 就能理解你独特的咨询风格，创建一个延续你方法论的 AI 教练。你的专业经验，将帮助更多人。
              </p>
              <Link
                href="/counselor-onboard"
                className="group inline-flex items-center gap-2 text-[14px] text-amber-400/70 hover:text-amber-400 transition-colors duration-300"
              >
                了解咨询师入驻 <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>

            <motion.div custom={0.3} variants={slideUp}>
              <div className="relative p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                {/* Simulated conversation snippet */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-amber-400/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[10px] text-amber-400">C</span>
                    </div>
                    <div className="bg-white/[0.04] rounded-xl rounded-tl-sm px-4 py-3 text-[13px] text-white/50 leading-relaxed">
                      在你的咨询中，当来访者表达焦虑时，你通常会怎么回应？
                    </div>
                  </div>
                  <div className="flex items-start gap-3 justify-end">
                    <div className="bg-amber-400/[0.06] border border-amber-400/10 rounded-xl rounded-tr-sm px-4 py-3 text-[13px] text-white/60 leading-relaxed max-w-[80%]">
                      我会先停下来，让他们感受到我在这里。然后我会问："这个焦虑，它住在你身体的哪个位置？"
                    </div>
                  </div>
                </div>
                {/* Progress indicator */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                  <div className="flex-1 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-amber-400/40 to-amber-400/20" />
                  </div>
                  <span className="text-[11px] text-white/25">19:32 / 30:00</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — CTA: Minimal, powerful
      ═══════════════════════════════════════════ */}
      <section className="relative py-40 lg:py-56 px-8 lg:px-16">
        <div className="absolute top-0 left-16 right-16 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-400/[0.03] rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="relative z-10 text-center max-w-2xl mx-auto"
        >
          <motion.h2
            custom={0}
            variants={slideUp}
            className="text-4xl lg:text-6xl font-bold tracking-tight text-white/90 mb-6"
          >
            Ready?
          </motion.h2>
          <motion.p
            custom={0.2}
            variants={slideUp}
            className="text-lg text-white/35 mb-12"
          >
            不用准备好，来就好。
          </motion.p>
          <motion.div custom={0.4} variants={slideUp}>
            <Link
              href="/chat"
              className="group inline-flex items-center gap-3"
            >
              <span className="px-10 py-4 rounded-full bg-gradient-to-r from-amber-400/90 to-amber-500/90 text-[#0a0a0a] font-semibold text-base hover:from-amber-400 hover:to-amber-500 transition-all duration-500 shadow-lg shadow-amber-400/10">
                开始对话
              </span>
              <span className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center group-hover:border-amber-400/30 transition-all duration-500">
                <ArrowRight size={18} className="text-white/40 group-hover:text-amber-400 transition-colors duration-300" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER — Ultra minimal
      ═══════════════════════════════════════════ */}
      <footer className="relative px-8 lg:px-16 py-10">
        <div className="absolute top-0 left-16 right-16 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
              <span className="text-black text-[8px] font-bold">C</span>
            </div>
            <span className="text-[12px] text-white/20">CoachOS &copy; 2026</span>
          </div>
          <div className="flex items-center gap-8 text-[12px] text-white/20">
            <Link href="/chat" className="hover:text-white/50 transition-colors duration-300">对话</Link>
            <Link href="/marketplace" className="hover:text-white/50 transition-colors duration-300">教练</Link>
            <Link href="/insights" className="hover:text-white/50 transition-colors duration-300">洞见</Link>
            <Link href="/counselor-onboard" className="hover:text-white/50 transition-colors duration-300">咨询师入驻</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
