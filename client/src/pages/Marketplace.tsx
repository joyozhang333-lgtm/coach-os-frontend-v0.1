import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowLeft, ArrowRight, Search, Sparkles, Star } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const COACHES = [
  {
    id: "amber",
    name: "安宁心",
    nameEn: "Serenity",
    specialty: "情绪调节 · 正念冥想",
    desc: "帮助你觉察情绪模式，找到内心的平静。擅长正念引导和情绪调节技术。",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-1-A3mBFMvgfbS2zXeuvtKNDJ.webp",
    sessions: "3.2K",
    rating: 4.9,
    tags: ["正念", "情绪", "冥想"],
    color: "from-amber-500/20 to-amber-600/5",
  },
  {
    id: "jade",
    name: "明镜台",
    nameEn: "Mirror",
    specialty: "自我探索 · 深度觉察",
    desc: "引导你看见真实的自己。通过深度对话，帮助你理解行为模式背后的信念。",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-2-MnhkP6sForXkU4A8q3vRBh.webp",
    sessions: "2.8K",
    rating: 4.8,
    tags: ["觉察", "探索", "信念"],
    color: "from-teal-500/20 to-teal-600/5",
  },
  {
    id: "flame",
    name: "暖光",
    nameEn: "Warmth",
    specialty: "亲密关系 · 沟通表达",
    desc: "陪伴你改善关系中的沟通模式，学会表达需求和设立边界。",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-3-PrjWnPHsqTmsd6YkSdQEvy.webp",
    sessions: "1.9K",
    rating: 4.7,
    tags: ["关系", "沟通", "边界"],
    color: "from-rose-500/20 to-rose-600/5",
  },
  {
    id: "loop",
    name: "无限环",
    nameEn: "Infinity",
    specialty: "职业发展 · 决策支持",
    desc: "帮助你在职业十字路口做出清晰的决策，找到内在驱动力。",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-4-GXV3XAmRvzYzbcWegpYQDs.webp",
    sessions: "2.1K",
    rating: 4.9,
    tags: ["职业", "决策", "目标"],
    color: "from-violet-500/20 to-violet-600/5",
  },
  {
    id: "prism",
    name: "棱镜",
    nameEn: "Prism",
    specialty: "创业指导 · 压力管理",
    desc: "为创业者提供心理支持和决策框架，在高压环境中保持清醒。",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-5-6jTYDn7i8ELzNNtZBSsEWv.webp",
    sessions: "1.5K",
    rating: 4.8,
    tags: ["创业", "压力", "韧性"],
    color: "from-orange-500/20 to-orange-600/5",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function Marketplace() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const filtered = COACHES.filter(
    (c) => !search || c.name.includes(search) || c.specialty.includes(search) || c.tags.some((t) => t.includes(search))
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <span className="text-black text-[9px] font-bold">C</span>
              </div>
              <span className="text-sm font-semibold">教练广场</span>
            </div>
          </div>
          <Link href="/chat" className="text-[13px] px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">
            开始对话
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-12 pb-8">
        <motion.div initial="hidden" animate="visible">
          <motion.h1 custom={0} variants={fadeUp} className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            发现你的 <span className="text-gradient">AI 教练</span>
          </motion.h1>
          <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-lg mb-8">
            每位教练都有独特的方法论和陪伴风格。选择最适合你当前状态的那一位。
          </motion.p>
          <motion.div custom={2} variants={fadeUp} className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索教练、专业领域..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Coach Grid */}
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pb-20">
        <motion.div
          initial="hidden" animate="visible"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {filtered.map((coach, i) => (
            <motion.div key={coach.id} custom={i + 3} variants={fadeUp}>
              <div
                className="glow-card group overflow-hidden cursor-pointer"
                onClick={() => navigate(`/chat/${coach.id}`)}
              >
                {/* Avatar area */}
                <div className={`relative aspect-[4/3] bg-gradient-to-br ${coach.color} overflow-hidden`}>
                  <img
                    src={coach.avatar}
                    alt={coach.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 glass rounded-full px-2.5 py-1 flex items-center gap-1">
                    <Star size={11} className="text-amber-400 fill-amber-400" />
                    <span className="text-[11px] font-medium">{coach.rating}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-base font-semibold">{coach.name}</h3>
                    <span className="text-xs text-muted-foreground">{coach.nameEn}</span>
                  </div>
                  <p className="text-xs text-primary/80 mb-3">{coach.specialty}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{coach.desc}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {coach.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles size={11} />
                      {coach.sessions}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">开始对话</span>
                    <ArrowRight size={14} className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
