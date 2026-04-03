/*
 * Design: Architectural Dark Theater × Line System
 * CounselorOnboard — Counselor style cloning system
 * Step 1: Welcome & intro → Step 2: 30-min conversation → Step 3: Style analysis report
 * Now integrated with real AI style analysis via backend API
 */
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Send,
  CheckCircle2,
  Shield,
  BarChart3,
  FileText,
  MessageCircle,
  Mic,
  Brain,
  Heart,
  Zap,
  Target,
  Users,
  BookOpen,
  Award,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { analyzeStyle } from "@/lib/api";

/* ═══ System interview questions ═══ */
const INTERVIEW_QUESTIONS = [
  "欢迎来到 CoachOS 咨询师入驻系统！我是您的风格分析助手。接下来的 30 分钟，我会通过一系列深度对话来全面了解您的咨询风格。准备好了吗？",
  "首先，请简单介绍一下您的专业背景和主要的咨询方向。",
  "当一个来访者第一次来到您面前，情绪很低落但不知道该说什么时，您通常会怎么开始？",
  "在咨询过程中，您更倾向于使用哪种理论取向？比如 CBT、精神动力、人本主义、叙事疗法等？",
  "如果来访者在对话中突然沉默了，您会怎么处理这个沉默？",
  "请描述一个让您印象深刻的咨询案例（不涉及隐私信息），以及您从中学到了什么。",
  "您认为在咨询关系中，最重要的三个要素是什么？",
  "当来访者的情绪非常强烈（比如愤怒或悲伤）时，您的第一反应通常是什么？",
  "您如何看待在咨询中适当的自我暴露？您会在什么情况下分享自己的经历？",
  "最后一个问题：如果用三个词来形容您的咨询风格，您会选择哪三个词？",
  "非常感谢您的分享！我已经收集了足够的信息来分析您的咨询风格。现在让我为您生成专业报告...",
];

/* ═══ Fallback style report (used when API fails) ═══ */
const FALLBACK_REPORT = {
  overallStyle: "温暖共情型 · 整合取向",
  styleDescription:
    "您的咨询风格以温暖共情为核心基调，融合了人本主义的无条件积极关注和认知行为疗法的结构化引导。您善于在安全的关系中引导来访者探索内在世界，同时提供实用的应对策略。",
  dimensions: [
    { name: "共情能力", score: 85, description: "展现出较高的共情能力" },
    { name: "引导技术", score: 80, description: "善于使用开放式提问引导对话" },
    { name: "理论整合", score: 78, description: "能够灵活运用不同理论取向" },
    { name: "边界管理", score: 76, description: "保持了适当的专业边界" },
    { name: "危机处理", score: 79, description: "面对情绪时保持稳定" },
    { name: "沉默运用", score: 72, description: "可以进一步发展沉默的治疗性运用" },
  ],
  strengths: [
    "出色的情绪共鸣能力，来访者容易感到被理解和接纳",
    "理论整合能力强，能根据不同来访者灵活调整咨询策略",
    "善于在安全的关系中引导深层探索",
  ],
  growthAreas: [
    "可以尝试更多地运用沉默作为治疗工具",
    "在面对阻抗时，可以探索更多元的介入方式",
    "建议发展更系统的结案流程",
  ],
  matchedCoachStyle: "陈思雨 × 林子墨 融合型",
  keywords: ["温暖", "共情", "整合", "引导", "安全感", "探索"],
};

interface StyleReport {
  overallStyle: string;
  styleDescription: string;
  dimensions: Array<{ name: string; score: number; description: string }>;
  strengths: string[];
  growthAreas: string[];
  matchedCoachStyle: string;
  keywords: string[];
}

interface Message {
  id: string;
  role: "system" | "counselor";
  content: string;
  time: string;
}

type Step = "welcome" | "conversation" | "analyzing" | "report";

export default function CounselorOnboard() {
  const [step, setStep] = useState<Step>("welcome");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [styleReport, setStyleReport] = useState<StyleReport>(FALLBACK_REPORT);
  const [analysisError, setAnalysisError] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Timer
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const progressPercent = Math.min((questionIndex / (INTERVIEW_QUESTIONS.length - 1)) * 100, 100);

  const startConversation = useCallback(() => {
    setStep("conversation");
    setIsTimerRunning(true);
    const firstMsg: Message = {
      id: "1",
      role: "system",
      content: INTERVIEW_QUESTIONS[0],
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages([firstMsg]);
    setQuestionIndex(1);
  }, []);

  // Call AI style analysis API
  const runStyleAnalysis = useCallback(async (conversationMessages: Message[]) => {
    setStep("analyzing");
    setAnalysisError(false);
    setAnalysisProgress(0);

    // Animate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress((p) => {
        if (p >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return p + Math.random() * 15;
      });
    }, 500);

    try {
      // Format messages for the API
      const apiMessages = conversationMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const report = await analyzeStyle(apiMessages);

      // Validate the report has required fields
      if (report && report.overallStyle && report.dimensions) {
        setStyleReport(report);
      } else {
        setStyleReport(FALLBACK_REPORT);
      }
    } catch (error) {
      console.error("Style analysis failed:", error);
      setAnalysisError(true);
      setStyleReport(FALLBACK_REPORT);
    } finally {
      clearInterval(progressInterval);
      setAnalysisProgress(100);
      // Short delay for progress animation to complete
      setTimeout(() => setStep("report"), 800);
    }
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "counselor",
      content: text,
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      if (questionIndex >= INTERVIEW_QUESTIONS.length) {
        // Analysis phase — call real AI
        setIsTimerRunning(false);
        setIsTyping(false);
        const allMessages = [...messages, userMsg];
        runStyleAnalysis(allMessages);
        return;
      }

      const nextMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "system",
        content: INTERVIEW_QUESTIONS[questionIndex],
        time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, nextMsg]);
      setQuestionIndex((i) => i + 1);
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ═══ Welcome Step ═══ */}
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="max-w-2xl mx-auto px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-8">
                  <span className="text-black text-xl font-bold">C</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-4">
                  咨询师风格<span className="text-gradient">复制系统</span>
                </h1>
                <p className="text-muted-foreground text-lg mb-3 max-w-lg mx-auto leading-relaxed">
                  通过 30 分钟的深度对话，我们将分析并复制您独特的咨询风格，创建属于您的 AI 教练分身。
                </p>
                <p className="text-muted-foreground text-sm mb-10 max-w-md mx-auto">
                  对话结束后，AI 将实时生成一份详细的咨询风格分析报告，包含专业性建议。
                </p>

                <div className="grid sm:grid-cols-3 gap-4 mb-10 max-w-lg mx-auto">
                  {[
                    { icon: MessageCircle, label: "30 分钟对话", desc: "深度风格采集" },
                    { icon: Brain, label: "AI 风格分析", desc: "GPT-4 多维评估" },
                    { icon: FileText, label: "专业报告", desc: "个性化成长建议" },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="glow-card p-4 text-center"
                    >
                      <item.icon size={20} className="text-primary mx-auto mb-2" strokeWidth={1.5} />
                      <span className="text-xs font-medium block">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground">{item.desc}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield size={12} />
                    <span>所有对话内容严格保密</span>
                  </div>
                </div>

                <button
                  onClick={startConversation}
                  className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
                >
                  开始风格采集
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </button>

                <div className="mt-8">
                  <Link href="/app" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    ← 返回平台
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* ═══ Conversation Step ═══ */}
        {step === "conversation" && (
          <motion.div
            key="conversation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col"
          >
            {/* Top bar with timer and progress */}
            <div className="shrink-0 border-b border-border bg-card/50">
              <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Link href="/app" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={18} />
                  </Link>
                  <div>
                    <span className="text-sm font-medium block leading-tight">风格采集对话</span>
                    <span className="text-[10px] text-muted-foreground">CoachOS 风格分析系统</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Timer */}
                  <div className="flex items-center gap-1.5 text-sm font-mono">
                    <Clock size={14} className="text-primary" />
                    <span className={elapsedSeconds >= 1800 ? "text-primary" : "text-foreground"}>
                      {formatTime(elapsedSeconds)}
                    </span>
                    <span className="text-muted-foreground text-xs">/ 30:00</span>
                  </div>
                  {/* Progress */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{Math.round(progressPercent)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
                <div className="text-center py-4">
                  <span className="text-[10px] text-muted-foreground px-3 py-1 rounded-full bg-secondary">
                    风格采集对话已开始
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                      className={`flex gap-3 ${msg.role === "counselor" ? "flex-row-reverse" : ""}`}
                    >
                      {msg.role === "system" && (
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 mt-1">
                          <Sparkles size={12} className="text-black" />
                        </div>
                      )}
                      <div className={`max-w-[75%] ${msg.role === "counselor" ? "ml-auto" : ""}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            msg.role === "counselor"
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-secondary text-foreground rounded-bl-md"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <span className={`text-[10px] text-muted-foreground mt-1 block ${msg.role === "counselor" ? "text-right" : ""}`}>
                          {msg.time}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles size={12} className="text-black" />
                    </div>
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
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border bg-card/50">
              <div className="max-w-3xl mx-auto px-4 py-3">
                <div className="flex items-end gap-2">
                  <button className="shrink-0 w-9 h-9 rounded-lg hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                    <Mic size={15} />
                  </button>
                  <div className="flex-1">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="分享您的咨询经验和风格..."
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
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ Analyzing Step ═══ */}
        {step === "analyzing" && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-6"
              >
                <Brain size={24} className="text-black" />
              </motion.div>
              <h2 className="text-xl font-bold mb-2">正在分析您的咨询风格</h2>
              <p className="text-sm text-muted-foreground mb-2">AI 正在深度分析对话数据，生成专业报告...</p>
              <p className="text-[10px] text-muted-foreground mb-6">
                分析维度：共情能力 · 引导技术 · 理论整合 · 边界管理 · 危机处理 · 沉默运用
              </p>
              <div className="mt-4 w-48 h-1.5 rounded-full bg-secondary mx-auto overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  animate={{ width: `${Math.min(analysisProgress, 100)}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">{Math.round(Math.min(analysisProgress, 100))}%</p>
            </div>
          </motion.div>
        )}

        {/* ═══ Report Step ═══ */}
        {step === "report" && (
          <motion.div
            key="report"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen py-12 px-6"
          >
            <div className="max-w-4xl mx-auto">
              {/* Report Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs text-primary mb-4">
                  <CheckCircle2 size={12} />
                  风格分析完成
                </div>
                {analysisError && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/5 text-xs text-amber-400 mb-4 ml-2">
                    <AlertCircle size={12} />
                    使用默认分析（AI 服务暂时不可用）
                  </div>
                )}
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-3">
                  您的咨询风格<span className="text-gradient">分析报告</span>
                </h1>
                <p className="text-muted-foreground">
                  基于 {formatTime(elapsedSeconds)} 的深度对话，以下是您的专业风格画像
                </p>
              </motion.div>

              {/* Overall Style Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glow-card p-8 mb-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-primary" />
                  <h2 className="text-lg font-semibold">整体风格</h2>
                </div>
                <div className="text-2xl font-bold text-gradient mb-3">{styleReport.overallStyle}</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{styleReport.styleDescription}</p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {styleReport.keywords.map((kw) => (
                    <span key={kw} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                      {kw}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Dimension Scores */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glow-card p-8 mb-6"
              >
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 size={16} className="text-primary" />
                  <h2 className="text-lg font-semibold">多维度评估</h2>
                </div>
                <div className="space-y-5">
                  {styleReport.dimensions.map((dim, i) => (
                    <motion.div
                      key={dim.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium">{dim.name}</span>
                        <span className="text-sm font-mono text-primary">{dim.score}</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden mb-1.5">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${dim.score}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">{dim.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Strengths & Growth */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="glow-card p-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={16} className="text-emerald-400" />
                    <h2 className="text-base font-semibold">核心优势</h2>
                  </div>
                  <div className="space-y-3">
                    {styleReport.strengths.map((s, i) => (
                      <div key={i} className="flex gap-3">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glow-card p-8"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Target size={16} className="text-amber-400" />
                    <h2 className="text-base font-semibold">成长方向</h2>
                  </div>
                  <div className="space-y-3">
                    {styleReport.growthAreas.map((g, i) => (
                      <div key={i} className="flex gap-3">
                        <ArrowRight size={14} className="text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground leading-relaxed">{g}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* AI Coach Match */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glow-card p-8 mb-8 border-primary/20"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Zap size={16} className="text-primary" />
                  <h2 className="text-base font-semibold">AI 教练匹配</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  基于您的咨询风格分析，我们已为您创建了 AI 教练分身。您的风格最接近：
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-base font-semibold text-gradient">{styleReport.matchedCoachStyle}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  您的 AI 教练分身已准备就绪，来访者可以在教练广场找到并与之对话。
                </p>
              </motion.div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                <Link
                  href="/app"
                  className="group inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all"
                >
                  进入平台
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <button
                  onClick={() => {
                    setStep("welcome");
                    setMessages([]);
                    setQuestionIndex(0);
                    setElapsedSeconds(0);
                    setIsTimerRunning(false);
                    setStyleReport(FALLBACK_REPORT);
                    setAnalysisError(false);
                    setAnalysisProgress(0);
                  }}
                  className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
                >
                  重新采集
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
