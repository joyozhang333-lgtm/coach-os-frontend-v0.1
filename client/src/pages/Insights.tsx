import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Calendar, Heart, Brain, Flame, Droplets } from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const EMOTION_DATA = [
  { day: "周一", value: 72, label: "平静" },
  { day: "周二", value: 45, label: "焦虑" },
  { day: "周三", value: 68, label: "平静" },
  { day: "周四", value: 82, label: "愉悦" },
  { day: "周五", value: 55, label: "低落" },
  { day: "周六", value: 78, label: "平静" },
  { day: "周日", value: 88, label: "愉悦" },
];

const JOURNEY = [
  { date: "2026-03-28", title: "第一次深度对话", desc: "你开始觉察到自己在压力下的回避模式。", emotion: "觉察", icon: Brain },
  { date: "2026-03-22", title: "关系中的边界", desc: "你学会了在亲密关系中表达自己的需求。", emotion: "成长", icon: Heart },
  { date: "2026-03-15", title: "情绪的命名", desc: "你第一次准确地命名了自己的复杂情绪。", emotion: "突破", icon: Flame },
  { date: "2026-03-08", title: "接纳不完美", desc: "你开始接受「不需要每件事都做到完美」。", emotion: "释放", icon: Droplets },
];

const TABS = ["情绪轨迹", "来时路", "月度报告"] as const;

export default function Insights() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("情绪轨迹");

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
              <span className="text-sm font-semibold">成长洞见</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>2026 年 3 月</span>
          </div>
        </div>
      </nav>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.h1 custom={0} variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            你的成长<span className="text-gradient">轨迹</span>
          </motion.h1>
          <motion.p custom={1} variants={fadeUp} className="text-muted-foreground">
            每一步成长都被温柔记录。
          </motion.p>
        </motion.div>

        {/* Summary cards */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { label: "本月对话", value: "23", change: "+8" },
            { label: "情绪均值", value: "72", change: "+5" },
            { label: "觉察次数", value: "11", change: "+3" },
            { label: "连续天数", value: "14", change: "" },
          ].map((s, i) => (
            <motion.div key={s.label} custom={i + 2} variants={fadeUp} className="glow-card p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{s.value}</span>
                {s.change && (
                  <span className="text-xs text-emerald-400 flex items-center gap-0.5">
                    <TrendingUp size={10} />
                    {s.change}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-1 block">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs */}
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible" className="mb-8">
          <div className="flex gap-1 p-1 bg-secondary rounded-lg w-fit">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all ${
                  tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tab content */}
        {tab === "情绪轨迹" && (
          <motion.div initial="hidden" animate="visible">
            <motion.div custom={0} variants={fadeUp} className="glow-card p-6 mb-6">
              <h3 className="text-sm font-medium mb-6">本周情绪波动</h3>
              {/* Simple bar chart */}
              <div className="flex items-end gap-3" style={{ height: 200 }}>
                {EMOTION_DATA.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <span className="text-[10px] text-muted-foreground">{d.label}</span>
                    <div className="flex-1 w-full flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${d.value}%` }}
                        transition={{ delay: i * 0.08, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/80 to-primary/30 relative"
                      >
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-medium text-primary">
                          {d.value}
                        </span>
                      </motion.div>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div custom={1} variants={fadeUp} className="glow-card p-6">
              <h3 className="text-sm font-medium mb-2">AI 洞察</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                本周你的情绪整体呈上升趋势。周二的焦虑可能与工作压力相关，但你在周四通过深度对话成功调节了状态。建议继续保持每日的正念练习，它正在帮助你建立更稳定的情绪基线。
              </p>
            </motion.div>
          </motion.div>
        )}

        {tab === "来时路" && (
          <motion.div initial="hidden" animate="visible">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

              <div className="space-y-8">
                {JOURNEY.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.div key={item.date} custom={i} variants={fadeUp} className="relative pl-14">
                      {/* Timeline dot */}
                      <div className="absolute left-3 top-1 w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      </div>

                      <div className="glow-card p-5">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon size={14} className="text-primary" />
                          <span className="text-xs text-primary font-medium">{item.emotion}</span>
                          <span className="text-[10px] text-muted-foreground ml-auto">{item.date}</span>
                        </div>
                        <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {tab === "月度报告" && (
          <motion.div initial="hidden" animate="visible">
            <motion.div custom={0} variants={fadeUp} className="glow-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3 月成长报告</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
                这个月你完成了 23 次深度对话，情绪稳定性提升了 12%。你最大的突破是学会了在关系中设立健康的边界。
              </p>
              <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                {[
                  { label: "对话时长", value: "8.5h" },
                  { label: "关键觉察", value: "11" },
                  { label: "情绪提升", value: "+12%" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-lg font-bold text-gradient">{s.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
