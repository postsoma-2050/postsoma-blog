"use client";

import { useEffect, useState } from "react";


export function useThemeTransition() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = (document.documentElement.getAttribute("data-theme") || "dark") as "light" | "dark";
    setTheme(saved);
  }, []);

  const toggleTheme = (e: React.MouseEvent) => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    if (!document.startViewTransition) {
      applyTheme(nextTheme);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      applyTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: nextTheme === "dark" ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 750,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement:
            nextTheme === "dark"
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
        }
      );
    });
  };

  const applyTheme = (v: "light" | "dark") => {
    setTheme(v);
    document.documentElement.setAttribute("data-theme", v);
    document.documentElement.style.setProperty("color-scheme", v);
    document.cookie = `app-theme=${v}; path=/; max-age=31536000; SameSite=Lax`;
  };

  return { theme, toggleTheme };
}
