/**
 * SpecialistChat — 专题 Coach 对话页面
 * 用户从归处 AI 推荐进入，与专题 Coach 对话，完成后返回归处 AI。
 *
 * Features:
 * - 明确显示当前在和哪个专题 Coach 对话
 * - 明确显示"返回归处 AI"按钮
 * - SSE 流式对话
 * - 返回时触发摘要回传
 */
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useParams } from "wouter";
import {
  Send,
  ArrowLeft,
  Home,
  Loader2,
  Sparkles,
  Info,
  User,
} from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import { specialistChatStream, returnToMainAI } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
  time: string;
}

export default function SpecialistChat() {
  const params = useParams<{ coachId: string }>();
  const coachId = params.coachId || "";
  const [, navigate] = useLocation();

  // Parse coach info from URL search params
  const searchParams = new URLSearchParams(window.location.search);
  const coachName = searchParams.get("name") || "专题 Coach";
  const coachAvatar = searchParams.get("avatar") || "";
  const coachSpecialty = searchParams.get("specialty") || "";
  const coachGreeting = searchParams.get("greeting") || `你好，我是${coachName}。你想聊些什么？`;
  const coachColor = searchParams.get("color") || "teal";
  const mainSessionId = searchParams.get("mainSession") || "";
  const recommendationId = searchParams.get("recId") || "";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "greeting",
      role: "coach",
      content: decodeURIComponent(coachGreeting),
      time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [isReturning, setIsReturning] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = useCallback(async () => {
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

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantMsgId, role: "coach", content: "", time: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) },
    ]);

    try {
      const history = messages
        .filter((m) => m.role === "user" || m.role === "coach")
        .slice(-18)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        }));
      history.push({ role: "user", content: text });

      for await (const event of specialistChatStream({
        coachId,
        message: text,
        sessionId,
        history,
      })) {
        if (event.type === "content") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: m.content + event.content }
                : m
            )
          );
        } else if (event.type === "done") {
          setSessionId(event.sessionId);
        } else if (event.type === "error") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? { ...m, content: event.error || "抱歉，我暂时无法回复。" }
                : m
            )
          );
        }
      }
    } catch (error) {
      console.error("Specialist chat error:", error);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: "抱歉，连接出现了问题。请稍后再试。" }
            : m
        )
      );
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, coachId, sessionId, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReturnToMain = useCallback(async () => {
    if (!sessionId) {
      navigate("/chat");
      return;
    }

    setIsReturning(true);
    try {
      await returnToMainAI({
        sessionId,
        reason: "user_exit",
      });
    } catch (error) {
      console.error("Return to main error:", error);
      // Still navigate even if the API call fails
    } finally {
      setIsReturning(false);
      navigate("/chat");
    }
  }, [sessionId, navigate]);

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

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* ═══ Top Bar ═══ */}
        <div className="shrink-0 border-b border-border bg-card/50">
          <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Return to main button */}
              <button
                onClick={() => setShowReturnConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                title="返回归处 AI"
              >
                <ArrowLeft size={14} />
                <Home size={14} />
              </button>

              <div className="w-px h-6 bg-border" />

              {/* Coach info */}
              <div className="flex items-center gap-3">
                {coachAvatar ? (
                  <img
                    src={decodeURIComponent(coachAvatar)}
                    alt={coachName}
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-border"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User size={16} className="text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{coachName}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${BG_COLOR_MAP[coachColor] || BG_COLOR_MAP.teal} ${COLOR_MAP[coachColor] || COLOR_MAP.teal}`}>
                      专题 Coach
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {coachSpecialty ? decodeURIComponent(coachSpecialty) : "专题支持"}
                  </span>
                </div>
              </div>
            </div>

            {/* Return to main CTA */}
            <button
              onClick={() => setShowReturnConfirm(true)}
              disabled={isReturning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
            >
              <Home size={13} />
              返回归处 AI
            </button>
          </div>

          {/* Info banner */}
          <div className="px-4 lg:px-6 py-2 bg-secondary/30 border-t border-border/50 flex items-center gap-2">
            <Info size={11} className="text-muted-foreground shrink-0" />
            <span className="text-[10px] text-muted-foreground">
              你正在与专题 Coach「{coachName}」对话 · 你随时可以返回归处 AI 继续陪伴
            </span>
          </div>
        </div>

        {/* ═══ Messages ═══ */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
            <div className="text-center py-4">
              <span className="text-[10px] text-muted-foreground px-3 py-1 rounded-full bg-secondary">
                专题 Coach 会话 · {coachName}
              </span>
            </div>

            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {msg.role === "coach" && (
                    coachAvatar ? (
                      <img
                        src={decodeURIComponent(coachAvatar)}
                        alt={coachName}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0 mt-1"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                        <User size={14} className="text-muted-foreground" />
                      </div>
                    )
                  )}
                  <div className={`max-w-[75%] ${msg.role === "user" ? "ml-auto" : ""}`}>
                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.content || (
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          <Loader2 size={12} className="animate-spin" />
                          思考中...
                        </span>
                      )}
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
              {isTyping && messages[messages.length - 1]?.content !== "" && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
                  {coachAvatar ? (
                    <img src={decodeURIComponent(coachAvatar)} alt="" className="w-7 h-7 rounded-full object-cover ring-1 ring-border shrink-0 mt-1" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-1">
                      <User size={14} className="text-muted-foreground" />
                    </div>
                  )}
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

        {/* ═══ Input Area ═══ */}
        <div className="shrink-0 border-t border-border bg-card/50">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`和${coachName}说说你的感受...`}
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
                <span>专题 Coach · {coachName}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Enter 发送 · Shift+Enter 换行</span>
            </div>
          </div>
        </div>

        {/* ═══ Return Confirmation Modal ═══ */}
        <AnimatePresence>
          {showReturnConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              onClick={() => setShowReturnConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border rounded-xl p-6 max-w-sm mx-4 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Home size={16} className="text-primary" />
                  <h3 className="text-sm font-semibold">返回归处 AI</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                  你确定要结束与{coachName}的专题对话，返回归处 AI 吗？
                  归处 AI 会接收到这次对话的摘要，继续陪伴你。
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowReturnConfirm(false)}
                    className="flex-1 px-3 py-2 rounded-lg text-xs border border-border hover:bg-secondary transition-colors"
                  >
                    继续聊
                  </button>
                  <button
                    onClick={handleReturnToMain}
                    disabled={isReturning}
                    className="flex-1 px-3 py-2 rounded-lg text-xs bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {isReturning ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        返回中...
                      </>
                    ) : (
                      "确认返回"
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
