/*
 * Design: Architectural Dark Theater × Line System
 * AppLayout — Persistent sidebar navigation for PC experience
 * 64px collapsed / 240px expanded sidebar with spring animation
 */
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  MessageCircle,
  BarChart3,
  Layers,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from "lucide-react";
import { useState, type ReactNode } from "react";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "仪表盘", href: "/app" },
  { icon: Users, label: "教练广场", href: "/marketplace" },
  { icon: MessageCircle, label: "智慧对话", href: "/chat" },
  { icon: BarChart3, label: "成长洞见", href: "/insights" },
  { icon: Layers, label: "创作工坊", href: "/studio" },
  { icon: User, label: "个人中心", href: "/profile" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  const sidebarWidth = collapsed ? 64 : 240;

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="h-full shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col relative z-20"
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
          <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
              <span className="text-black text-xs font-bold">C</span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-semibold tracking-wide whitespace-nowrap overflow-hidden"
                >
                  CoachOS
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/app" && location.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`nav-item relative ${isActive ? "active" : ""}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} strokeWidth={1.5} className="shrink-0" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="overflow-hidden whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="px-3 py-3 border-t border-sidebar-border space-y-1 shrink-0">
          <div
            className="nav-item"
            onClick={() => {}}
            title={collapsed ? "设置" : undefined}
          >
            <Settings size={18} strokeWidth={1.5} className="shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  设置
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="nav-item w-full"
            title={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            {collapsed ? (
              <ChevronRight size={18} strokeWidth={1.5} className="shrink-0" />
            ) : (
              <ChevronLeft size={18} strokeWidth={1.5} className="shrink-0" />
            )}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  收起侧边栏
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
