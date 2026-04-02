import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "wouter";
import { ArrowLeft, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";

const COACH_MAP: Record<string, { name: string; specialty: string; avatar: string; greeting: string }> = {
  amber: {
    name: "安宁心",
    specialty: "情绪调节",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-1-A3mBFMvgfbS2zXeuvtKNDJ.webp",
    greeting: "你好，我是安宁心。今天想聊些什么？无论是什么，我都在这里。",
  },
  jade: {
    name: "明镜台",
    specialty: "自我探索",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-2-MnhkP6sForXkU4A8q3vRBh.webp",
    greeting: "你好，我是明镜台。今天想看见哪个部分的自己？",
  },
  flame: {
    name: "暖光",
    specialty: "亲密关系",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-3-PrjWnPHsqTmsd6YkSdQEvy.webp",
    greeting: "你好，我是暖光。今天想聊聊什么关系中的事情吗？",
  },
  loop: {
    name: "无限环",
    specialty: "职业发展",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-4-GXV3XAmRvzYzbcWegpYQDs.webp",
    greeting: "你好，我是无限环。今天想聊聊职业上的什么话题？",
  },
  prism: {
    name: "棱镜",
    specialty: "创业指导",
    avatar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663491136490/4gPRyqhBUiBfbrLWU3EW8R/coach-avatar-5-6jTYDn7i8ELzNNtZBSsEWv.webp",
    greeting: "你好，我是棱镜。今天想聊聊创业路上的什么挑战？",
  },
};

const DEFAULT_COACH = COACH_MAP.amber;

interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  time: string;
}

const DEMO_REPLIES = [
  "我听到你了。能再多说一些吗？是什么让你有这样的感受？",
  "这是一个很有勇气的觉察。当你注意到这个模式时，身体有什么感觉？",
  "你提到的这个场景让我想到——也许在那个瞬间，你需要的不是解决方案，而是被看见。",
  "让我们慢下来。深呼吸一下。你现在最想对自己说什么？",
  "我注意到你用了「应该」这个词。如果把「应该」换成「想要」，这句话会变成什么？",
];

export default function Chat() {
  const params = useParams<{ coachId?: string }>();
  const coach = useMemo(() => {
    return (params.coachId && COACH_MAP[params.coachId]) || DEFAULT_COACH;
  }, [params.coachId]);

  const initialMessages = useMemo<Message[]>(() => [
    { id: "1", role: "coach", content: coach.greeting, time: "刚刚" },
  ], [coach.greeting]);

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const replyIndex = useRef(0);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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

    // Simulate AI reply
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        role: "coach",
        content: DEMO_REPLIES[replyIndex.current % DEMO_REPLIES.length],
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };
      replyIndex.current++;
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Top bar */}
      <div className="shrink-0 glass border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <img src={coach.avatar} alt="Coach" className="w-8 h-8 rounded-full object-cover ring-1 ring-border" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-background" />
              </div>
              <div>
                <span className="text-sm font-medium block leading-tight">{coach.name}</span>
                <span className="text-[10px] text-muted-foreground">在线 · {coach.specialty}</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setMessages(initialMessages);
              replyIndex.current = 0;
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            新对话
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Session start */}
          <div className="text-center py-4">
            <span className="text-[10px] text-muted-foreground px-3 py-1 rounded-full bg-secondary">
              Coach Session 已开始
            </span>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.role === "coach" && (
                  <img src={coach.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0 mt-1" />
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
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3"
              >
                <img src={coach.avatar} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0 mt-1" />
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
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="shrink-0 max-w-3xl mx-auto px-4 pb-3 w-full">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["最近压力有点大", "想聊聊和朋友的关系", "感觉有些迷茫"].map((s) => (
              <button
                key={s}
                onClick={() => { setInput(s); inputRef.current?.focus(); }}
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
              <span>CoachOS · {coach.name}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">Enter 发送 · Shift+Enter 换行</span>
          </div>
        </div>
      </div>
    </div>
  );
}
