/**
 * HumanCoachPage — 真人 Coach 信息页
 * 展示真人 Coach 基本信息，提供返回归处 AI 的入口。
 * 本轮不做完整预约系统，只做信息展示和回归。
 */
import { motion } from "framer-motion";
import { useLocation, useParams } from "wouter";
import {
  ArrowLeft,
  Home,
  User,
  Clock,
  Globe,
  Award,
  Calendar,
  MessageCircle,
  Phone,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { getAllCoaches } from "@/lib/api";

interface HumanCoach {
  id: string;
  displayName: string;
  headline: string;
  bio: string;
  specialties: string[];
  priceRange: { min: number; max: number; currency: string };
  availability: { status: string; nextSlot?: string };
}

export default function HumanCoachPage() {
  const params = useParams<{ coachId: string }>();
  const coachId = params.coachId || "";
  const [, navigate] = useLocation();
  const [coach, setCoach] = useState<HumanCoach | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingClicked, setBookingClicked] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const coachName = searchParams.get("name") || "真人 Coach";

  useEffect(() => {
    async function loadCoach() {
      try {
        const data = await getAllCoaches();
        const found = data.humanCoaches.find(
          (h) => h.id === coachId || h.id.includes(coachId)
        );
        if (found) {
          setCoach(found);
        }
      } catch (error) {
        console.error("Failed to load coach:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadCoach();
  }, [coachId]);

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Top Bar */}
        <div className="shrink-0 border-b border-border bg-card/50">
          <div className="px-4 lg:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/chat")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
              >
                <ArrowLeft size={14} />
                <Home size={14} />
                返回归处 AI
              </button>
            </div>
            <span className="text-[10px] text-muted-foreground px-2 py-1 rounded-full bg-emerald-400/10 text-emerald-400">
              真人 Coach
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-4 py-8">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-muted-foreground">加载中...</p>
              </div>
            ) : coach ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Profile Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4 ring-2 ring-border">
                    <User size={32} className="text-muted-foreground" />
                  </div>
                  <h1 className="text-xl font-semibold mb-1">{coach.displayName}</h1>
                  <p className="text-sm text-muted-foreground">{coach.headline}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        coach.availability.status === "available"
                          ? "bg-emerald-400/10 text-emerald-400"
                          : coach.availability.status === "busy"
                          ? "bg-amber-400/10 text-amber-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {coach.availability.status === "available"
                        ? "可预约"
                        : coach.availability.status === "busy"
                        ? "忙碌中"
                        : "离线"}
                    </span>
                    {coach.availability.nextSlot && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock size={10} />
                        下次可约: {coach.availability.nextSlot}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="bg-card border border-border rounded-xl p-5 mb-4">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">关于</h3>
                  <p className="text-sm text-foreground/80 leading-relaxed">{coach.bio}</p>
                </div>

                {/* Specialties */}
                <div className="bg-card border border-border rounded-xl p-5 mb-4">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">专长领域</h3>
                  <div className="flex flex-wrap gap-2">
                    {coach.specialties.map((s) => (
                      <span key={s} className="text-xs px-3 py-1 rounded-full bg-secondary text-foreground/80">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="bg-card border border-border rounded-xl p-5 mb-4">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">咨询费用</h3>
                  <p className="text-lg font-semibold">
                    ¥{coach.priceRange.min} - ¥{coach.priceRange.max}
                    <span className="text-xs text-muted-foreground font-normal ml-1">/次</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 mb-8">
                  <button
                    onClick={() => setBookingClicked(true)}
                    disabled={coach.availability.status !== "available"}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    <Calendar size={15} />
                    {bookingClicked ? "预约功能即将上线" : "预约咨询"}
                  </button>

                  <button
                    onClick={() => navigate("/chat")}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  >
                    <Home size={15} />
                    返回归处 AI 继续对话
                  </button>
                </div>

                {/* Booking clicked notice */}
                {bookingClicked && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-4 text-center"
                  >
                    <p className="text-xs text-amber-300">
                      真人 Coach 预约系统正在开发中，敬请期待。
                      <br />
                      你可以先返回归处 AI 继续对话。
                    </p>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="text-center py-20">
                <p className="text-sm text-muted-foreground mb-4">未找到该咨询师信息</p>
                <button
                  onClick={() => navigate("/chat")}
                  className="text-xs text-primary hover:underline"
                >
                  返回归处 AI
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
