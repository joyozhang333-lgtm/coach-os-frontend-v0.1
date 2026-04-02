/*
 * Design: Architectural Dark Theater × Line System
 * Dashboard — Main platform hub with sidebar layout
 * KPI cards, recent sessions, quick actions, activity feed
 */
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  MessageCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  BarChart3,
  Users,
  Flame,
  Heart,
  Brain,
  Calendar,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const RECENT_SESSIONS = [
  { coach: "安宁心", topic: "关于最近的工作压力", time: "2 小时前", emotion: "平静", avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-serenity_d6e7dd08.png" },
  { coach: "明镜台", topic: "探索内在的回避模式", time: "昨天", emotion: "觉察", avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-mirror_70c8e3dc.png" },
  { coach: "暖光", topic: "和朋友的沟通困境", time: "3 天前", emotion: "成长", avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-warmth_c1d7e79c.png" },
];

const QUICK_ACTIONS = [
  { icon: MessageCircle, label: "开始对话", desc: "与 AI 教练进行深度对话", href: "/chat", color: "text-amber-400" },
  { icon: Users, label: "教练广场", desc: "发现更多 AI 教练", href: "/marketplace", color: "text-teal-400" },
  { icon: BarChart3, label: "成长洞见", desc: "查看你的成长轨迹", href: "/insights", color: "text-violet-400" },
];

const WEEKLY_MOOD = [
  { day: "一", value: 72 },
  { day: "二", value: 45 },
  { day: "三", value: 68 },
  { day: "四", value: 82 },
  { day: "五", value: 55 },
  { day: "六", value: 78 },
  { day: "日", value: 88 },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-[1200px]">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.div custom={0} variants={fadeUp} className="flex items-center gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-mono">{new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" })}</span>
          </motion.div>
          <motion.h1 custom={1} variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight">
            欢迎回来 <span className="text-gradient">✦</span>
          </motion.h1>
          <motion.p custom={2} variants={fadeUp} className="text-muted-foreground mt-1">
            今天是你连续使用 CoachOS 的第 14 天。
          </motion.p>
        </motion.div>

        {/* KPI Cards */}
        <motion.div initial="hidden" animate="visible" className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "本月对话", value: "23", change: "+8", icon: MessageCircle, trend: "up" },
            { label: "情绪均值", value: "72", change: "+5", icon: Heart, trend: "up" },
            { label: "觉察次数", value: "11", change: "+3", icon: Brain, trend: "up" },
            { label: "连续天数", value: "14", change: "", icon: Flame, trend: "stable" },
          ].map((kpi, i) => (
            <motion.div key={kpi.label} custom={i + 3} variants={fadeUp} className="glow-card p-5">
              <div className="flex items-center justify-between mb-3">
                <kpi.icon size={16} className="text-muted-foreground" strokeWidth={1.5} />
                {kpi.change && (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-mono">
                    <TrendingUp size={10} />
                    {kpi.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Mood Mini Chart */}
            <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="glow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-medium">本周情绪波动</h3>
                <Link href="/insights" className="text-xs text-primary hover:underline underline-offset-2 flex items-center gap-1">
                  查看详情 <ArrowRight size={10} />
                </Link>
              </div>
              <div className="flex items-end gap-3" style={{ height: 120 }}>
                {WEEKLY_MOOD.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <div className="flex-1 w-full flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${d.value}%` }}
                        transition={{ delay: i * 0.06, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                        className="w-full rounded-t-sm bg-gradient-to-t from-primary/60 to-primary/20"
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{d.day}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible" className="glow-card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-medium">最近对话</h3>
                <Link href="/chat" className="text-xs text-primary hover:underline underline-offset-2 flex items-center gap-1">
                  查看全部 <ArrowRight size={10} />
                </Link>
              </div>
              <div className="space-y-3">
                {RECENT_SESSIONS.map((session, i) => (
                  <Link key={i} href="/chat">
                    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                      <img src={session.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{session.coach}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">{session.emotion}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{session.topic}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                        <Clock size={10} />
                        {session.time}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div custom={9} variants={fadeUp} initial="hidden" animate="visible" className="glow-card p-6">
              <h3 className="text-sm font-medium mb-4">快速操作</h3>
              <div className="space-y-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <action.icon size={16} className={action.color} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block">{action.label}</span>
                        <span className="text-[10px] text-muted-foreground">{action.desc}</span>
                      </div>
                      <ArrowRight size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* AI Insight Card */}
            <motion.div custom={10} variants={fadeUp} initial="hidden" animate="visible" className="glow-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-primary" />
                <h3 className="text-sm font-medium">AI 洞察</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                本周你的情绪整体呈上升趋势。周二的焦虑可能与工作压力相关，但你在周四通过深度对话成功调节了状态。建议继续保持每日的正念练习。
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <Link href="/insights" className="text-xs text-primary hover:underline underline-offset-2 flex items-center gap-1">
                  查看完整报告 <ArrowRight size={10} />
                </Link>
              </div>
            </motion.div>

            {/* Upcoming */}
            <motion.div custom={11} variants={fadeUp} initial="hidden" animate="visible" className="glow-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={14} className="text-muted-foreground" />
                <h3 className="text-sm font-medium">今日提醒</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-primary/60" />
                  <div>
                    <span className="text-xs font-medium block">晨间正念 · 10 分钟</span>
                    <span className="text-[10px] text-muted-foreground">08:00 AM</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-emerald-400/60" />
                  <div>
                    <span className="text-xs font-medium block">与安宁心的预约对话</span>
                    <span className="text-[10px] text-muted-foreground">02:00 PM</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full bg-violet-400/60" />
                  <div>
                    <span className="text-xs font-medium block">日记回顾 · 5 分钟</span>
                    <span className="text-[10px] text-muted-foreground">09:00 PM</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
