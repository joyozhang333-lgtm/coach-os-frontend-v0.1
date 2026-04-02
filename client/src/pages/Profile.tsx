/*
 * Design: Architectural Dark Theater × Line System
 * Profile — User profile, settings, subscription, data export
 */
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Shield,
  Bell,
  Download,
  LogOut,
  ChevronRight,
  Crown,
  Calendar,
  MessageCircle,
  Heart,
  Settings,
  Globe,
  Moon,
  Smartphone,
} from "lucide-react";
import AppLayout from "@/components/AppLayout";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

const SETTINGS_SECTIONS = [
  {
    title: "账户",
    items: [
      { icon: Mail, label: "邮箱地址", value: "user@example.com", action: "edit" },
      { icon: Shield, label: "密码安全", value: "已设置", action: "edit" },
      { icon: Globe, label: "语言", value: "简体中文", action: "edit" },
    ],
  },
  {
    title: "偏好",
    items: [
      { icon: Bell, label: "通知设置", value: "已开启", action: "toggle" },
      { icon: Moon, label: "深色模式", value: "已开启", action: "toggle" },
      { icon: Smartphone, label: "移动端推送", value: "已开启", action: "toggle" },
    ],
  },
  {
    title: "数据",
    items: [
      { icon: Download, label: "导出对话记录", value: "", action: "button" },
      { icon: Download, label: "导出成长报告", value: "", action: "button" },
    ],
  },
];

export default function Profile() {
  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-[900px]">
        {/* Header */}
        <motion.div initial="hidden" animate="visible" className="mb-8">
          <motion.h1 custom={0} variants={fadeUp} className="text-2xl lg:text-3xl font-bold tracking-tight mb-2">
            个人<span className="text-gradient">中心</span>
          </motion.h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible" className="glow-card p-6 mb-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <User size={24} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">用户昵称</h2>
              <p className="text-xs text-muted-foreground">user@example.com</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  <Crown size={10} />
                  Pro 会员
                </span>
                <span className="text-[10px] text-muted-foreground">2026-03-01 加入</span>
              </div>
            </div>
            <button className="px-4 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all">
              编辑资料
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible" className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: Calendar, label: "使用天数", value: "34" },
            { icon: MessageCircle, label: "总对话数", value: "128" },
            { icon: Heart, label: "情绪均值", value: "72" },
          ].map((stat) => (
            <div key={stat.label} className="glow-card p-4 text-center">
              <stat.icon size={16} className="text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Settings */}
        <motion.div initial="hidden" animate="visible">
          {SETTINGS_SECTIONS.map((section, si) => (
            <motion.div key={section.title} custom={si + 3} variants={fadeUp} className="mb-6">
              <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">{section.title}</h3>
              <div className="glow-card overflow-hidden">
                {section.items.map((item, i) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-3 px-5 py-3.5 hover:bg-secondary/30 transition-colors ${
                      i < section.items.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <item.icon size={16} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
                    <span className="text-sm flex-1">{item.label}</span>
                    {item.value && <span className="text-xs text-muted-foreground">{item.value}</span>}
                    {item.action === "edit" && <ChevronRight size={14} className="text-muted-foreground" />}
                    {item.action === "toggle" && (
                      <div className="w-8 h-4.5 rounded-full bg-primary/30 relative">
                        <div className="absolute right-0.5 top-0.5 w-3.5 h-3.5 rounded-full bg-primary" />
                      </div>
                    )}
                    {item.action === "button" && (
                      <button className="text-xs text-primary hover:underline underline-offset-2">导出</button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Danger Zone */}
        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible" className="mt-8">
          <button className="flex items-center gap-2 text-sm text-destructive hover:underline underline-offset-2">
            <LogOut size={14} />
            退出登录
          </button>
        </motion.div>
      </div>
    </AppLayout>
  );
}
