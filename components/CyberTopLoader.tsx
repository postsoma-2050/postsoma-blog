"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function CyberTopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  const isFirstRender = useRef(true);

  // 1. 路由或参数改变时：新页面到达，激光进度条瞬间冲向 100% 并平滑淡出
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    clearAllTimers();
    setProgress(100);
    const doneTimer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 300);
    timersRef.current.push(doneTimer);
  }, [pathname, searchParams]);

  // 2. 0ms 拦截站内链接点击，立刻启动激光流光
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const isTargetBlank = target.getAttribute("target") === "_blank";

      // 忽略外链、新标签页、锚点、下载、tel/mailto 及带有修饰键的点击
      if (
        !href ||
        isTargetBlank ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // 忽略当前完全相同的 URL
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      clearAllTimers();
      setLoading(true);
      setProgress(25); // 0ms 瞬间起步

      // 阶梯式自然递增，模拟数据流拉取过程
      const t1 = setTimeout(() => setProgress(55), 250);
      const t2 = setTimeout(() => setProgress(75), 800);
      const t3 = setTimeout(() => setProgress(90), 2000);
      // 安全回退：若 15 秒未响应则自动隐藏
      const safetyTimer = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 15000);

      timersRef.current.push(t1, t2, t3, safetyTimer);
    };

    const handlePopState = () => {
      clearAllTimers();
      setLoading(true);
      setProgress(60);
    };

    document.addEventListener("click", handleAnchorClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick, true);
      window.removeEventListener("popstate", handlePopState);
      clearAllTimers();
    };
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
        >
          {/* 顶栏赛博霓虹激光线 */}
          <div className="h-[2.5px] w-full bg-transparent overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--accent-philosophy)] via-[#00F0FF] to-white"
              style={{
                width: `${progress}%`,
                boxShadow:
                  "0 0 12px 2px #00F0FF, 0 0 24px 4px rgba(0, 240, 255, 0.5)",
              }}
              transition={{ ease: "easeOut", duration: 0.35 }}
            />
          </div>

          {/* 右上角极简微型传输状态标 */}
          <div className="absolute right-4 top-3 flex items-center gap-2 rounded-full border border-cyan-500/30 bg-black/80 px-2.5 py-1 font-mono text-[9px] text-cyan-300 backdrop-blur-md shadow-lg">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500" />
            </span>
            <span className="tracking-widest uppercase animate-pulse">
              SYS.STREAMING // {Math.round(progress)}%
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
