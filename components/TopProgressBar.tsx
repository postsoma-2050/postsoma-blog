"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  // When pathname or searchParams change, the new page has arrived -> dismiss immediately
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 150);
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

      // Start indeterminate loading state immediately on click
      setLoading(true);
    };

    const handlePopState = () => {
      setLoading(true);
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
            transition={{ duration: 0.15 }}
            className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
          >
            {/* 1. Neon Cyan Indeterminate Laser Stream */}
            <div className="relative h-[2.5px] w-full bg-cyan-950/30 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent animate-laser-stream" />
              <div
                className="absolute inset-0 bg-[#00F0FF]/40"
                style={{
                  boxShadow:
                    "0 0 12px 2px #00F0FF, 0 0 24px 4px rgba(0, 240, 255, 0.5)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
