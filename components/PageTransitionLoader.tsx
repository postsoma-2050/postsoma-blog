"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PageTransitionLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const fromUrlRef = useRef<string>("");
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ONLY close the loading screen when the route has ACTUALLY navigated to the new URL!
  useEffect(() => {
    const currentUrl =
      pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // If we were waiting for navigation and the URL has changed from the starting page
    if (fromUrlRef.current && currentUrl !== fromUrlRef.current) {
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      setLoading(false);
      fromUrlRef.current = "";
    }
  }, [pathname, searchParams]);

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

      const currentUrl =
        window.location.pathname + window.location.search;
      if (href === currentUrl) return;

      // Save origin URL
      fromUrlRef.current = currentUrl;

      // Immediately enter full-screen loading screen (0ms)
      setLoading(true);

      // Safety timeout (25s) in case navigation completely fails/aborts
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        setLoading(false);
        fromUrlRef.current = "";
      }, 25000);
    };

    const handlePopState = () => {
      const currentUrl =
        window.location.pathname + window.location.search;
      fromUrlRef.current = currentUrl;
      setLoading(true);
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-bg/95 backdrop-blur-md select-none px-4"
          >
            {/* Minimalist Cyberpunk Spinner */}
            <div className="relative flex h-16 w-16 items-center justify-center">
              {/* Outer Cyan Rotating Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 border-r-cyan-400/30 animate-spin"
                style={{
                  boxShadow: "0 0 20px rgba(0, 240, 255, 0.35)",
                  animationDuration: "1s",
                }}
              />

              {/* Inner Reverse Rotating Ring */}
              <div
                className="absolute inset-2 rounded-full border-2 border-transparent border-b-cyan-300 border-l-cyan-300/40 animate-spin"
                style={{
                  animationDuration: "1.6s",
                  animationDirection: "reverse",
                }}
              />

              {/* Pulsing Center Node */}
              <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#00F0FF] animate-pulse" />
            </div>

            {/* Clean Minimalist Typography */}
            <div className="mt-8 text-center space-y-1.5 font-mono">
              <p className="text-xs uppercase font-bold tracking-[0.25em] text-cyan-400">
                POSTSOMA 2050 // LOADING NODE
              </p>
              <p className="text-[11px] tracking-wider text-text-secondary/60">
                正在加载文章内容，请稍候...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
