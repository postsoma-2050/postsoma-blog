"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, route transition is COMPLETE -> instantly hit 100% and vanish
  useEffect(() => {
    if (loading) {
      setProgress(100);
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      const timeout = setTimeout(() => {
        setLoading(false);
        setProgress(0);
        setElapsed(0);
      }, 250);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams, loading]);

  // Handle link clicks with active continuous crawl and timer
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const isTargetBlank = target.getAttribute("target") === "_blank";

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

      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start loading
      setLoading(true);
      setProgress(15);
      setElapsed(0);

      // Clear any existing intervals
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

      // 1. Live elapsed timer
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const diff = ((Date.now() - startTime) / 1000).toFixed(1);
        setElapsed(parseFloat(diff));
      }, 100);

      // 2. Smoothly and continuously advance progress towards 95%
      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 94) return 94.5;
          // Step progress asymptotically
          const remaining = 95 - prev;
          const step = Math.max(0.5, remaining * 0.08);
          return Math.min(94, prev + step);
        });
      }, 120);
    };

    const handlePopState = () => {
      setLoading(true);
      setProgress(40);
    };

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("popstate", handlePopState);
      if (timerRef.current) clearInterval(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[9999] pointer-events-none"
          >
            {/* 1. Neon Cyan Laser Top Line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-transparent overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-600 via-[#00F0FF] to-white"
                style={{
                  width: `${progress}%`,
                  boxShadow:
                    "0 0 16px 3px #00F0FF, 0 0 32px 6px rgba(0, 240, 255, 0.7)",
                }}
                transition={{ ease: "linear", duration: 0.1 }}
              />
            </div>

            {/* 2. Ambient Cyber Stream Banner (Bottom-Right Interactive HUD) */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 rounded-lg border border-cyan-400/40 bg-black/90 p-4 font-mono text-xs text-cyan-300 backdrop-blur-md shadow-[0_0_35px_rgba(0,240,255,0.3)] max-w-sm sm:max-w-md pointer-events-auto">
              <div className="flex items-center justify-between gap-3 border-b border-cyan-500/20 pb-2">
                <span className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                  </span>
                  STREAMING ARCHIVE // 正在加载
                </span>
                <span className="text-[10px] text-cyan-400/70 font-semibold tabular-nums">
                  {elapsed.toFixed(1)}s elapsed
                </span>
              </div>

              <p className="text-[11px] text-gray-300 leading-relaxed">
                <span className="text-cyan-400 font-bold mr-1.5">&gt;</span>
                正在从 Notion 数据库获取正文与多媒体节点...
              </p>

              {/* Progress bar visual */}
              <div className="flex items-center gap-2 pt-1">
                <div className="h-1.5 flex-1 rounded bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-[#00F0FF] transition-all duration-150"
                    style={{ width: `${Math.round(progress)}%` }}
                  />
                </div>
                <span className="text-[9px] text-cyan-400/60 tabular-nums">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
