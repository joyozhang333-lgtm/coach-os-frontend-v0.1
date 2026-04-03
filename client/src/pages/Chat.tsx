/*
 * Design: Architectural Dark Theater × Line System
 * Chat — Core feature: AI Coach switching + Counselor recommendation
 * Left: Coach list panel | Center: Chat | Right: Coach info + Recommendations
 */
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Send,
  Sparkles,
  Mic,
  Paperclip,
  ChevronRight,
  ChevronLeft,
  Star,
  ArrowRight,
  Users,
  MessageCircle,
  Zap,
  X,
  UserPlus,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";

/* ═══ Data: 4 AI Coaches ═══ */
const AI_COACHES = [
  {
    id: "siyu",
    name: "陈思雨",
    nameEn: "Siyu Chen",
    specialty: "情绪调节 · 正念引导",
    method: "正念引导 · 认知行为技术",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-serenity_d6e7dd08.png",
    greeting: "你好，我是思雨。今天想聊些什么？无论是什么，我都在这里陪伴你。",
    tags: ["正念", "情绪", "冥想", "焦虑缓解"],
    sessions: "3.2K",
    rating: 4.9,
    color: "amber",
    bio: "国家二级心理咨询师背景，擅长帮助来访者觉察情绪模式。通过正念引导和认知行为技术，陪伴你找到内心的平静。",
  },
  {
    id: "zimo",
    name: "林子墨",
    nameEn: "Zimo Lin",
    specialty: "自我探索 · 深度觉察",
    method: "精神动力学 · 信念探索",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-mirror_70c8e3dc.png",
    greeting: "你好，我是子墨。今天想看见哪个部分的自己？让我们一起探索。",
    tags: ["觉察", "探索", "信念", "内在小孩"],
    sessions: "2.8K",
    rating: 4.8,
    color: "teal",
    bio: "心理学硕士，专注于精神动力学方向。善于引导你看见行为模式背后的信念系统，发现内在真实的需求。",
  },
  {
    id: "xiaowei",
    name: "张晓薇",
    nameEn: "Xiaowei Zhang",
    specialty: "亲密关系 · 沟通表达",
    method: "家庭治疗 · 依恋理论",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-warmth_c1d7e79c.png",
    greeting: "你好，我是晓薇。今天想聊聊什么关系中的事情吗？我在这里倾听。",
    tags: ["关系", "沟通", "边界", "依恋"],
    sessions: "1.9K",
    rating: 4.7,
    color: "rose",
    bio: "家庭治疗师背景，专注于依恋理论和沟通模式。陪伴你改善关系中的表达方式，学会设立健康的边界。",
  },
  {
    id: "haoran",
    name: "王浩然",
    nameEn: "Haoran Wang",
    specialty: "职业发展 · 决策支持",
    method: "组织心理学 · 决策框架",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663494351292/UiPe44g7XsskFqpdXViubX/coach-avatar-infinity_c1656b18.png",
    greeting: "你好，我是浩然。今天想聊聊职业上的什么话题？让我们一起理清思路。",
    tags: ["职业", "决策", "目标", "领导力"],
    sessions: "2.1K",
    rating: 4.9,
    color: "violet",
    bio: "组织心理学博士，曾任企业高管教练。帮助你在职业十字路口理清思路，找到内在驱动力和行动方向。",
  },
];

/* ═══ Data: Real Counselors (recommended based on topic match) ═══ */
const COUNSELORS = [
  {
    id: "c1",
    name: "李心怡",
    title: "国家二级心理咨询师",
    specialty: "情绪管理 · CBT",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face",
    matchScore: 96,
    experience: "8 年",
    price: "¥300/次",
    available: true,
  },
  {
    id: "c2",
    name: "张明远",
    title: "心理学博士 · 督导师",
    specialty: "深度分析 · 精神动力",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    matchScore: 91,
    experience: "12 年",
    price: "¥500/次",
    available: true,
  },
  {
    id: "c3",
    name: "王思涵",
    title: "家庭治疗师",
    specialty: "家庭系统 · 关系修复",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face",
    matchScore: 87,
    experience: "6 年",
    price: "¥280/次",
    available: false,
  },
];

/* ═══ Demo Replies ═══ */
const DEMO_REPLIES: Record<string, string[]> = {
  siyu: [
    "我听到你了。能再多说一些吗？是什么让你有这样的感受？",
    "让我们先做一个简单的呼吸练习。吸气四秒，屏住四秒，呼气六秒。准备好了吗？",
    "这是一个很有勇气的觉察。当你注意到这个模式时，身体有什么感觉？",
    "你提到的焦虑感，它像什么？如果给它一个颜色和形状，会是什么样的？",
  ],
  zimo: [
    "有意思。你刚才说的这个「应该」，是谁的声音？是你自己的，还是别人的？",
    "让我们慢下来看看这个模式。你第一次注意到自己有这样的反应是什么时候？",
    "你提到的这个场景让我想到——也许在那个瞬间，你需要的不是解决方案，而是被看见。",
    "如果你的内在小孩现在站在你面前，ta 想对你说什么？",
  ],
  xiaowei: [
    "在这段关系中，你最想被理解的是什么？",
    "你说「我不知道怎么开口」——如果没有任何后果，你最想对 ta 说什么？",
    "边界不是墙，而是一扇门。你可以选择什么时候打开，什么时候关上。",
    "你有没有注意到，每次你退让的时候，身体会有什么反应？",
  ],
  haoran: [
    "让我们用一个框架来理清这个决策。你最看重的三个因素是什么？",
    "如果五年后的你回头看今天的选择，你觉得 ta 会怎么说？",
    "你提到了「不确定」——不确定本身不是问题，问题是我们如何与不确定共处。",
    "在你过去做过的最好的决策中，你是怎么做到的？那次的感觉是什么样的？",
  ],
};

interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  time: string;
  coachId?: string;
}

const COLOR_MAP: Record<string, string> = {
  amber: "text-amber-400",
  teal: "text-teal-400",
  rose: "text-rose-400",
  violet: "text-violet-400",
};

const BG_COLOR_MAP: Record<string, string> = {
  amber: "bg-amber-400/10",
  teal: "bg-teal-400/10",
  rose: "bg-rose-400/10",
  violet: "bg-violet-400/10",
};

const RING_COLOR_MAP: Record<string, string> = {
  amber: "ring-amber-400/30",
  teal: "ring-teal-400/30",
  rose: "ring-rose-400/30",
  violet: "ring-violet-400/30",
};

export default function Chat() {
  const [activeCoach, setActiveCoach] = useState(AI_COACHES[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "coach", content: AI_COACHES[0].greeting, time: "刚刚", coachId: AI_COACHES[0].id },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyIndex = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Show counselor recommendation after 3 messages
  useEffect(() => {
    if (messageCount >= 3 && !showRecommendation) {
      setShowRecommendation(true);
    }
  }, [messageCount, showRecommendation]);

  const switchCoach = useCallback(
    (coach: typeof AI_COACHES[0]) => {
      if (coach.id === activeCoach.id) return;
      setActiveCoach(coach);
      const switchMsg: Message = {
        id: Date.now().toString(),
        role: "coach",
        content: `[已切换到 ${coach.name}] ${coach.greeting}`,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        coachId: coach.id,
      };
      setMessages((prev) => [...prev, switchMsg]);
      replyIndex.current = 0;
    },
    [activeCoach.id]
  );

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setMessageCount((c) => c + 1);

    setTimeout(() => {
      const replies = DEMO_REPLIES[activeCoach.id] || DEMO_REPLIES.siyu;
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: replies[replyIndex.current % replies.length],
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
        coachId: activeCoach.id,
      };
      replyIndex.current++;
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <AppLayout>
      <div className="h-full flex">
        {/* ═══ Left: Coach List Panel ═══ */}
        <div className="w-[280px] shrink-0 border-r border-border bg-card/30 flex flex-col hidden lg:flex">
          <div className="p-4 border-b border-border">
            <h3 className="text-sm font-semibold mb-1">AI 教练</h3>
            <p className="text-[10px] text-muted-foreground">选择一位教练开始对话</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {AI_COACHES.map((coach) => (
              <button
                key={coach.id}
                onClick={() => switchCoach(coach)}
                className={`w-full text-left p-3 rounded-lg transition-all group ${
                  activeCoach.id === coach.id
                    ? "bg-secondary border border-primary/20"
                    : "hover:bg-secondary/50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={coach.avatar}
                      alt={coach.name}
                      className={`w-10 h-10 rounded-full object-cover ring-2 ${
                        activeCoach.id === coach.id ? RING_COLOR_MAP[coach.color] : "ring-transparent"
                      }`}
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-card" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium">{coach.name}</span>
                      <span className="text-[10px] text-muted-foreground">{coach.nameEn}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{coach.specialty}</p>
                  </div>
                </div>
                {activeCoach.id === coach.id && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${BG_COLOR_MAP[coach.color]} ${COLOR_MAP[coach.color]}`}>
                      对话中
                    </span>
                  </div>
                )}
              </button>
            ))}

            {/* Divider */}
            <div className="py-3">
              <div className="border-t border-border" />
            </div>

            {/* Real Counselors Section */}
            <div className="px-1">
              <div className="flex items-center gap-1.5 mb-2">
                <Users size={12} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">真人咨询师</span>
              </div>
              {COUNSELORS.slice(0, 2).map((counselor) => (
                <button
                  key={counselor.id}
                  className="w-full text-left p-3 rounded-lg hover:bg-secondary/50 transition-all border border-transparent group"
                  onClick={() => {}}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img src={counselor.avatar} alt={counselor.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-border" />
                      {counselor.available && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-card" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium block">{counselor.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate block">{counselor.specialty}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-emerald-400 font-mono block">{counselor.matchScore}%</span>
                      <span className="text-[9px] text-muted-foreground">匹配</span>
                    </div>
                  </div>
                </button>
              ))}
              <Link href="/marketplace" className="block text-center text-[10px] text-primary hover:underline underline-offset-2 mt-2 py-1">
                查看全部咨询师 →
              </Link>
            </div>
          </div>
        </div>

        {/* ═══ Center: Chat Area ═══ */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <div className="shrink-0 border-b border-border bg-card/50">
            <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={activeCoach.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{activeCoach.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${BG_COLOR_MAP[activeCoach.color]} ${COLOR_MAP[activeCoach.color]}`}>
                      AI Coach
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">在线 · {activeCoach.method}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Mobile coach switcher */}
                <div className="flex lg:hidden items-center gap-1">
                  {AI_COACHES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => switchCoach(c)}
                      className={`w-7 h-7 rounded-full overflow-hidden ring-2 transition-all ${
                        activeCoach.id === c.id ? RING_COLOR_MAP[c.color] : "ring-transparent opacity-50 hover:opacity-80"
                      }`}
                    >
                      <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowRightPanel(!showRightPanel)}
                  className="w-8 h-8 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  title={showRightPanel ? "隐藏面板" : "显示面板"}
                >
                  {showRightPanel ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                </button>
                <button
                  onClick={() => {
                    setMessages([{ id: "1", role: "coach", content: activeCoach.greeting, time: "刚刚", coachId: activeCoach.id }]);
                    replyIndex.current = 0;
                    setMessageCount(0);
                    setShowRecommendation(false);
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary"
                >
                  新对话
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
              <div className="text-center py-4">
                <span className="text-[10px] text-muted-foreground px-3 py-1 rounded-full bg-secondary">
                  Coach Session 已开始 · {activeCoach.name}
                </span>
              </div>

              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const msgCoach = msg.coachId ? AI_COACHES.find((c) => c.id === msg.coachId) : null;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                      className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {msg.role === "coach" && msgCoach && (
                        <img src={msgCoach.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0 mt-1" />
                      )}
                      {msg.role === "coach" && !msgCoach && (
                        <img src={activeCoach.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0 mt-1" />
                      )}
                      <div className={`max-w-[75%] ${msg.role === "user" ? "ml-auto" : ""}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className={`text-[10px] text-muted-foreground mt-1 block ${msg.role === "user" ? "text-right" : ""}`}>
                          {msg.time}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Typing indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
                    <img src={activeCoach.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0 mt-1" />
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ═══ Counselor Recommendation Card (appears after 3 messages) ═══ */}
              <AnimatePresence>
                {showRecommendation && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                    className="relative"
                  >
                    <div className="glow-card p-5 border-primary/20">
                      <button
                        onClick={() => setShowRecommendation(false)}
                        className="absolute top-3 right-3 w-6 h-6 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground"
                      >
                        <X size={12} />
                      </button>
                      <div className="flex items-center gap-2 mb-3">
                        <Zap size={14} className="text-primary" />
                        <span className="text-xs font-medium">基于你的对话内容，为你推荐匹配的咨询师</span>
                      </div>
                      <div className="space-y-2">
                        {COUNSELORS.map((c) => (
                          <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors">
                            <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-medium">{c.name}</span>
                                <span className="text-[9px] text-muted-foreground">{c.title}</span>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{c.specialty} · {c.experience}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-xs text-emerald-400 font-mono font-medium">{c.matchScore}%</div>
                              <span className="text-[9px] text-muted-foreground">{c.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">匹配度基于对话主题和情绪状态计算</span>
                        <Link href="/marketplace" className="text-[10px] text-primary hover:underline underline-offset-2 flex items-center gap-1">
                          查看更多 <ArrowRight size={8} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="shrink-0 max-w-3xl mx-auto px-4 pb-3 w-full">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {["最近压力有点大", "想聊聊和朋友的关系", "感觉有些迷茫", "工作上遇到了瓶颈", "想了解自己的情绪模式"].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      inputRef.current?.focus();
                    }}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="shrink-0 border-t border-border bg-card/50">
            <div className="max-w-3xl mx-auto px-4 py-3">
              <div className="flex items-end gap-2">
                <button className="shrink-0 w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Paperclip size={15} />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="说说你的感受..."
                    rows={1}
                    className="w-full resize-none bg-secondary rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all max-h-32"
                    style={{ minHeight: "40px" }}
                  />
                </div>
                <button className="shrink-0 w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Mic size={15} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="shrink-0 w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-30 hover:opacity-90 transition-all"
                >
                  <Send size={15} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Sparkles size={10} />
                  <span>CoachOS · {activeCoach.name}</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Enter 发送 · Shift+Enter 换行</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Right: Coach Info + Recommendations Panel ═══ */}
        <AnimatePresence>
          {showRightPanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="shrink-0 border-l border-border bg-card/30 overflow-hidden hidden xl:block"
            >
              <div className="w-[300px] h-full overflow-y-auto">
                {/* Coach Profile */}
                <div className="p-5 border-b border-border">
                  <div className="flex flex-col items-center text-center">
                    <img
                      src={activeCoach.avatar}
                      alt={activeCoach.name}
                      className={`w-16 h-16 rounded-full object-cover ring-2 ${RING_COLOR_MAP[activeCoach.color]} mb-3`}
                    />
                    <h3 className="text-base font-semibold">{activeCoach.name}</h3>
                    <span className="text-xs text-muted-foreground">{activeCoach.nameEn} · {activeCoach.specialty}</span>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1">
                        <Star size={11} className="text-amber-400 fill-amber-400" />
                        <span className="text-xs font-medium">{activeCoach.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle size={11} className="text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{activeCoach.sessions}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="p-5 border-b border-border">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">关于</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{activeCoach.bio}</p>
                </div>

                {/* Tags */}
                <div className="p-5 border-b border-border">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">专长标签</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCoach.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Other Coaches */}
                <div className="p-5 border-b border-border">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">切换教练</h4>
                  <div className="space-y-2">
                    {AI_COACHES.filter((c) => c.id !== activeCoach.id).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => switchCoach(c)}
                        className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                      >
                        <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-border" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium block">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground truncate block">{c.specialty}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recommended Counselors */}
                <div className="p-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <UserPlus size={12} className="text-primary" />
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">推荐咨询师</h4>
                  </div>
                  <div className="space-y-2">
                    {COUNSELORS.map((c) => (
                      <div key={c.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                        <img src={c.avatar} alt={c.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-border" />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-medium block">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">{c.specialty}</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">{c.matchScore}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
