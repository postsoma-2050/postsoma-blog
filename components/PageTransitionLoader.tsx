"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [targetTitle, setTargetTitle] = useState("");
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // When pathname or searchParams change, the new page has arrived -> dismiss loading screen immediately
  useEffect(() => {
    if (loading) {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      const timeout = setTimeout(() => {
        setLoading(false);
        setTargetTitle("");
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams, loading]);

  // Intercept internal link clicks to trigger INSTANT full-screen transition (0ms)
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      const isTargetBlank = target.getAttribute("target") === "_blank";

      // Ignore external links, mailto, tel, anchor hashes, or blank targets
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

      // If clicking the exact current URL, ignore
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Extract text or title from the clicked link if available
      const linkText = target.innerText?.trim() || "";
      setTargetTitle(linkText.length > 50 ? linkText.slice(0, 50) + "..." : linkText);

      // Immediately enter full-screen loading screen (0ms)
      setLoading(true);

      // Safety timeout in case navigation is aborted
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        setLoading(false);
      }, 20000);
    };

    const handlePopState = () => {
      setLoading(true);
      setTargetTitle("正在返回上一页...");
    };

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("popstate", handlePopState);
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
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
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070707]/96 backdrop-blur-md text-text-primary select-none px-4"
          >
            {/* Top Laser Shimmer Line */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-transparent overflow-hidden">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent animate-laser-stream" />
            </div>

            {/* Central Futuristic Loading HUD Console */}
            <div className="relative w-full max-w-lg rounded-xl border border-cyan-500/40 bg-black/90 p-6 sm:p-8 font-mono shadow-[0_0_50px_rgba(0,240,255,0.25)]">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-cyan-400" />

              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-6">
                <span className="flex items-center gap-2.5 text-cyan-400 font-bold tracking-widest text-xs uppercase">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 shadow-[0_0_10px_#00F0FF]" />
                  </span>
                  SYS.STREAM // 正在进入文章
                </span>
                <span className="text-[10px] text-cyan-400/60 uppercase tracking-widest">
                  DECRYPTING...
                </span>
              </div>

              {/* Target Post Preview (if available) */}
              {targetTitle && (
                <div className="mb-5 rounded border border-white/10 bg-white/[0.03] p-3 text-xs text-text-primary">
                  <span className="text-cyan-400 font-bold mr-2">&gt; 目标:</span>
                  <span className="text-gray-200">{targetTitle}</span>
                </div>
              )}

              {/* Animated Progress Bar */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[11px] text-cyan-300/80">
                  <span>正在从 Notion 数据核心获取正文排版...</span>
                </div>
                <div className="h-2 w-full rounded bg-white/10 overflow-hidden relative">
                  <div className="h-full w-full bg-gradient-to-r from-cyan-600 via-[#00F0FF] to-white animate-laser-stream" />
                </div>
              </div>

              {/* Terminal Logs */}
              <div className="space-y-1.5 text-[11px] text-gray-400 bg-black/60 rounded p-3 border border-white/5">
                <p className="flex items-center gap-2 text-cyan-300">
                  <span className="text-cyan-400">✔</span> 神经数据链路已建立 (Neural Link Connected)
                </p>
                <p className="flex items-center gap-2 text-cyan-300">
                  <span className="text-cyan-400">✔</span> 正在解析 Markdown 与 Notion Blocks...
                </p>
                <p className="flex items-center gap-2 text-amber-400/90 animate-pulse">
                  <span className="text-amber-400">⏳</span> 首次唤醒未缓存节点需数秒，完成后将永久秒开
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
