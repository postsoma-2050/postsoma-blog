"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Search, Sun, Moon, User } from "lucide-react";
import { openSearchModal } from "./SearchModal";
import { useThemeTransition } from "@/hooks/useThemeTransition";

interface SectorItem {
  id: string;
  en: string;
  href: string;
  iconUrl: string;
}

const SECTORS: SectorItem[] = [
  {
    id: "ai",
    en: "AI Insights",
    href: "/ai-insights",
    iconUrl: "/icons/AI.png",
  },
  {
    id: "philosophy",
    en: "Philosophy",
    href: "/philosophy",
    iconUrl: "/icons/Philosophy.png",
  },
  {
    id: "investing",
    en: "Investing",
    href: "/investing",
    iconUrl: "/icons/investing.png",
  },
  {
    id: "blockchain",
    en: "Blockchain",
    href: "/blockchain",
    iconUrl: "/icons/Blockchain.png",
  },
  {
    id: "notes",
    en: "Sheshin Notes",
    href: "/sheshin-notes",
    iconUrl: "/icons/Sheshin Notes.png",
  },
];

export default function FloatingDock() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useThemeTransition();

  return (
    <aside
      aria-label="Cognitive Sector Dock"
      className="fixed left-5 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-1 p-1.5 rounded-[22px] bg-[var(--dock-bg)] backdrop-blur-xl border-[0.5px] border-[var(--border-subtle)] shadow-lg shadow-black/[0.04] transition-colors duration-200"
    >
      {/* 5 Cognitive Sectors with 3D Icons rendered via Next.js Image */}
      {SECTORS.map((sector) => {
        const isActive = pathname.startsWith(sector.href);

        return (
          <div key={sector.id} className="relative group flex items-center">
            <Link
              href={sector.href}
              aria-label={sector.en}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] ${
                isActive
                  ? "bg-black/[0.05] dark:bg-white/[0.08]"
                  : "hover:bg-[var(--hover-highlight)]"
              }`}
            >
              <Image
                src={sector.iconUrl}
                alt={sector.en}
                width={28}
                height={28}
                className="w-7 h-7 object-contain group-hover:scale-110 transition-transform duration-200 ease-out"
                priority
              />

              {/* Active Indicator Pill */}
              {isActive && (
                <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2.5 w-1 rounded-full bg-[var(--accent-dot)] shadow-sm" />
              )}
            </Link>

            {/* Hover Tooltip to the Right (Pure English) */}
            <div className="absolute left-full ml-3.5 hidden group-hover:flex items-center pointer-events-none z-50 animate-in fade-in slide-in-from-left-1 duration-150">
              <div className="rounded-lg border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--text-primary)] shadow-xl whitespace-nowrap backdrop-blur-md">
                {sector.en}
              </div>
            </div>
          </div>
        );
      })}

      {/* Subtle Divider */}
      <div className="my-1 h-[0.5px] w-5 bg-[var(--border-subtle)]" aria-hidden />

      {/* 1. Home Link */}
      <div className="relative group flex items-center">
        <Link
          href="/"
          aria-label="Home"
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] ${
            pathname === "/"
              ? "text-[var(--text-primary)] bg-black/[0.05] dark:bg-white/[0.08]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-highlight)]"
          }`}
        >
          <Home className="h-4 w-4 transition-transform group-hover:scale-105" />
          {pathname === "/" && (
            <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2.5 w-1 rounded-full bg-[var(--accent-dot)] shadow-sm" />
          )}
        </Link>
        <div className="absolute left-full ml-3.5 hidden group-hover:flex items-center pointer-events-none z-50 animate-in fade-in slide-in-from-left-1 duration-150">
          <div className="rounded-lg border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--text-primary)] shadow-xl whitespace-nowrap backdrop-blur-md">
            Home
          </div>
        </div>
      </div>

      {/* 2. Global Search Trigger */}
      <div className="relative group flex items-center">
        <button
          type="button"
          onClick={openSearchModal}
          aria-label="Search (⌘K)"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-highlight)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] cursor-pointer"
        >
          <Search className="h-4 w-4 transition-transform group-hover:scale-105" />
        </button>
        <div className="absolute left-full ml-3.5 hidden group-hover:flex items-center pointer-events-none z-50 animate-in fade-in slide-in-from-left-1 duration-150">
          <div className="rounded-lg border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--text-primary)] shadow-xl whitespace-nowrap backdrop-blur-md">
            Search (⌘K)
          </div>
        </div>
      </div>

      {/* 3. Theme Toggle Button */}
      <div className="relative group flex items-center">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-highlight)] transition-all duration-150 active:scale-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] cursor-pointer"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 transition-transform duration-200 group-hover:rotate-45" />
          ) : (
            <Moon className="h-4 w-4 transition-transform duration-200 group-hover:-rotate-12" />
          )}
        </button>
        <div className="absolute left-full ml-3.5 hidden group-hover:flex items-center pointer-events-none z-50 animate-in fade-in slide-in-from-left-1 duration-150">
          <div className="rounded-lg border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--text-primary)] shadow-xl whitespace-nowrap backdrop-blur-md">
            Toggle Theme
          </div>
        </div>
      </div>

      {/* 4. About Link */}
      <div className="relative group flex items-center">
        <Link
          href="/about"
          aria-label="About"
          className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] ${
            pathname === "/about"
              ? "text-[var(--text-primary)] bg-black/[0.05] dark:bg-white/[0.08]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-highlight)]"
          }`}
        >
          <User className="h-4 w-4 transition-transform group-hover:scale-105" />
          {pathname === "/about" && (
            <span className="absolute left-1 top-1/2 -translate-y-1/2 h-2.5 w-1 rounded-full bg-[var(--accent-dot)] shadow-sm" />
          )}
        </Link>
        <div className="absolute left-full ml-3.5 hidden group-hover:flex items-center pointer-events-none z-50 animate-in fade-in slide-in-from-left-1 duration-150">
          <div className="rounded-lg border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-2.5 py-1 font-mono text-[11px] font-medium text-[var(--text-primary)] shadow-xl whitespace-nowrap backdrop-blur-md">
            About
          </div>
        </div>
      </div>
    </aside>
  );
}
