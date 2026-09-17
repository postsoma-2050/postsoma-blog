"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { CATEGORY_SLUGS, CATEGORIES } from "@/lib/design-tokens";
import { openSearchModal } from "./SearchModal";

interface HeroSearchProps {
  postCount: number;
}

export default function HeroSearch({ postCount }: HeroSearchProps) {
  return (
    <section aria-label="Hero Search" className="relative pt-2 pb-0">
      <div className="flex flex-col items-start gap-3.5 max-w-2xl">
        {/* Subtle mission marker */}
        <div className="font-mono text-[0.72rem] tracking-wider text-[var(--text-muted)] uppercase">
          PostSoma 2050 · {postCount} nodes
        </div>

        {/* Title */}
        <h1 className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-tight">
          Echoes from the Prompt.
        </h1>

        {/* Subtitle */}
        <p className="font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
          High-Tech meets High-Touch. A practitioner-thinker&apos;s radar across artificial intelligence, existential philosophy, asymmetric investing, decentralized systems, and epistemic notes.
        </p>

        {/* ⌘K Search trigger bar */}
        <div className="w-full mt-2">
          <button
            type="button"
            onClick={openSearchModal}
            className="group w-full flex items-center justify-between gap-3 rounded-2xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-raised)] hover:border-[var(--border-default)] backdrop-blur-md px-4 py-3 text-left transition-all duration-150 shadow-[var(--card-inset)] focus:outline-none focus:ring-2 focus:ring-[var(--border-default)] cursor-pointer"
            aria-label="Open search modal"
          >
            <div className="flex items-center gap-3 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
              <Search className="h-4 w-4 opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
              <span className="font-mono text-xs sm:text-[0.82rem]">
                Search {postCount} nodes, concepts, &amp; tags...
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-[0.72rem] text-[var(--text-muted)]">
              <kbd className="rounded border-[0.5px] border-[var(--border-subtle)] bg-[var(--hover-highlight)] px-1.5 py-0.5 text-[0.7rem] text-[var(--text-secondary)]">
                ⌘K
              </kbd>
            </div>
          </button>
        </div>

        {/* Quick jump to 5 cognitive sectors in Stammy slash format */}
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 pt-1 font-mono text-[0.75rem] text-[var(--text-muted)]">
          <span className="opacity-70">Sectors:</span>
          {CATEGORIES.map((cat, idx) => {
            const slug = CATEGORY_SLUGS[cat];
            return (
              <span key={cat} className="inline-flex items-center">
                {idx > 0 && <span className="mr-2.5 opacity-30 select-none">/</span>}
                <Link
                  href={`/${slug}`}
                  className="hover:text-[var(--text-primary)] transition-colors"
                >
                  {cat}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
