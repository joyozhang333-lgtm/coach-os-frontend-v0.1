import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gradient mb-4">404</div>
        <h1 className="text-xl font-semibold mb-3">页面未找到</h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          你要找的页面可能已被移动或不存在。不如回到首页，重新开始。
        </p>
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
