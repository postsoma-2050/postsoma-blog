"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  // When pathname or searchParams change, complete and hide the progress bar
  useEffect(() => {
    if (loading) {
      setProgress(100);
      const timeout = setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [pathname, searchParams, loading]);

  // Intercept internal link clicks to trigger instant visual feedback (0ms)
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

      // If clicking the current exact URL, do not trigger loading
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Start loading bar immediately
      setLoading(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 200);
      const t2 = setTimeout(() => setProgress(85), 600);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    const handlePopState = () => {
      setLoading(true);
      setProgress(60);
    };

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("popstate", handlePopState);
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
            transition={{ duration: 0.2 }}
            className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
          >
            {/* 1. Neon Laser Line */}
            <div className="h-[2.5px] w-full bg-transparent overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-[#00F0FF] to-white"
                style={{
                  width: `${progress}%`,
                  boxShadow:
                    "0 0 14px 2px #00F0FF, 0 0 28px 4px rgba(0, 240, 255, 0.6)",
                }}
                transition={{ ease: "easeOut", duration: 0.35 }}
              />
            </div>

            {/* 2. Cyber Floating Status Pill (Corner Badge) */}
            <div className="absolute right-4 top-4 flex items-center gap-2 rounded border border-cyan-500/40 bg-black/85 px-3 py-1.5 font-mono text-[10px] text-cyan-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.25)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span className="tracking-widest uppercase font-semibold animate-pulse">
                SYS.STREAM // DECRYPTING DATA CORE...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
