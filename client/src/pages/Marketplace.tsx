/*
 * Design: Architectural Dark Theater × Line System
 * Marketplace — Coach discovery with sidebar layout
 * Glow cards, search, category filters, coach grid
 */
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { Search, Star, Sparkles, ArrowRight, Filter, Heart } from "lucide-react";
import { useState } from "react";
import AppLayout from "@/components/AppLayout";

const COACHES = [
  {
    id: "amber",
    name: "安宁心",
    nameEn: "Serenity",
    specialty: "情绪调节 · 正念冥想",
    desc: "帮助你觉察情绪模式，找到内心的平静。擅长正念引导和情绪调节技术。",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-serenity_d6e7dd08.png",
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
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-mirror_70c8e3dc.png",
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
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-warmth_c1d7e79c.png",
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
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-infinity_c1656b18.png",
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
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    sessions: "1.5K",
    rating: 4.8,
    tags: ["创业", "压力", "韧性"],
    color: "from-orange-500/20 to-orange-600/5",
  },
  {
    id: "dawn",
    name: "晨光",
    nameEn: "Dawn",
    specialty: "晨间正念 · 日记引导",
    desc: "每天清晨陪伴你开启新的一天，通过正念和日记建立内在秩序。",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    sessions: "856",
    rating: 4.6,
    tags: ["晨间", "日记", "习惯"],
    color: "from-sky-500/20 to-sky-600/5",
  },
];

const CATEGORIES = ["全部", "情绪调节", "自我探索", "亲密关系", "职业发展", "创业指导", "正念冥想"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

export default function Marketplace() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("全部");

  const filtered = COACHES.filter((c) => {
    const matchSearch = !search || c.name.includes(search) || c.specialty.includes(search) || c.tags.some((t) => t.includes(search));
    const matchCategory = category === "全部" || c.specialty.includes(category);
    return matchSearch && matchCategory;
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.h1 custom={0} variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            发现你的 <span className="text-gradient">AI 教练</span>
          </motion.h1>
          <motion.p custom={1} variants={fadeUp} className="text-muted-foreground max-w-lg mb-6">
            每位教练都有独特的方法论和陪伴风格。选择最适合你当前状态的那一位。
          </motion.p>

          {/* Search & Filter */}
          <motion.div custom={2} variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索教练、专业领域..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-secondary border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                    category === cat
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Coach Grid */}
        <motion.div initial="hidden" animate="visible" className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
                  {/* Favorite */}
                  <button className="absolute top-3 left-3 w-7 h-7 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={13} className="text-muted-foreground" />
                  </button>
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
                    <ArrowRight
                      size={14}
                      className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </AppLayout>
  );
}
