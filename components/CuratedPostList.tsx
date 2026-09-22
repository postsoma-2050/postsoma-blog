"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/lib/types";
import {
  CATEGORY_ACCENTS,
  toEnglishSubCategory,
  toEnglishTag,
} from "@/lib/design-tokens";

interface CuratedPostListProps {
  posts: Post[];
  initialPosts?: Post[];
  totalCount?: number;
}

function formatDate(iso: string | null): string {
  if (!iso) return "2024.01.01";
  return iso.split("T")[0].replace(/-/g, ".");
}

// ── Hourly deterministic shuffle ──────────────────────────────────────────
// Seed = year·1e6 + month·1e4 + day·1e2 + hour  (changes every clock hour)
function getHourSeed(): number {
  const d = new Date();
  return (
    d.getFullYear() * 1_000_000 +
    (d.getMonth() + 1) * 10_000 +
    d.getDate() * 100 +
    d.getHours()
  );
}

// mulberry32 — fast, good-quality 32-bit seeded PRNG
function mulberry32(seed: number) {
  return function () {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Minutes remaining until the next full clock-hour */
function minutesUntilNextHour(): number {
  const now = new Date();
  return 59 - now.getMinutes();
}

function estimateReadingTime(post: Post): string {
  const words = (post.name.length + (post.summary?.length || 0)) * 4;
  const mins = Math.max(3, Math.min(8, Math.round(words / 100)));
  return `${mins} min read`;
}

function getCoreTakeaway(post: Post): string {
  if (post.aiSummary) {
    try {
      const parsed = JSON.parse(post.aiSummary);
      if (parsed.keyTakeaway || parsed.key_takeaway) {
        return parsed.keyTakeaway || parsed.key_takeaway;
      }
      if (parsed.coreTakeaway || parsed.core_takeaway) {
        return parsed.coreTakeaway || parsed.core_takeaway;
      }
      if (parsed.takeaway || parsed.summary || parsed.one_line_summary || parsed.oneLiner) {
        return parsed.takeaway || parsed.summary || parsed.one_line_summary || parsed.oneLiner;
      }
    } catch {
      if (post.aiSummary.length > 20) return post.aiSummary;
    }
  }
  return post.summary || "Explores foundational epistemic frameworks, system dynamics, and emergent cognitive frontiers.";
}

export default function CuratedPostList({
  posts,
  initialPosts,
  totalCount = posts.length,
}: CuratedPostListProps) {
  // Deterministic hourly seed — same seed within the same clock-hour
  const [displayPosts, setDisplayPosts] = useState<Post[]>(() => {
    const pool = initialPosts && initialPosts.length > 0 ? initialPosts : posts;
    return seededShuffle(pool, getHourSeed()).slice(0, 6);
  });
  const [isShuffling, setIsShuffling] = useState(false);
  const [minsLeft, setMinsLeft] = useState<number>(minutesUntilNextHour);

  // Auto-reshuffle every clock-hour + keep countdown ticking
  useEffect(() => {
    const tick = () => {
      const newSeed = getHourSeed();
      // Only reshuffle when the hour actually flips
      setDisplayPosts((prev) => {
        const prevSeed =
          prev.length > 0
            ? seededShuffle(posts, newSeed).slice(0, 6).map((p) => p.slug).join("|")
            : "";
        const currSlugs = prev.map((p) => p.slug).join("|");
        if (prevSeed !== currSlugs) {
          return seededShuffle(posts, newSeed).slice(0, 6);
        }
        return prev;
      });
      setMinsLeft(minutesUntilNextHour());
    };
    // Check every 60 s — lightweight; only triggers a state change on the hour boundary
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [posts]);

  const handleShuffle = () => {
    if (posts.length <= 6) {
      setDisplayPosts([...posts]);
      return;
    }

    setIsShuffling(true);

    // Prefer nodes not currently shown
    const currentSlugs = new Set(displayPosts.map((p) => p.slug));
    const unshown = posts.filter((p) => !currentSlugs.has(p.slug));
    const candidatePool = unshown.length >= 6 ? unshown : posts;

    // Fisher-Yates with Math.random for manual shuffle (intentionally non-deterministic)
    const shuffled = [...candidatePool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setDisplayPosts(shuffled.slice(0, 6));
    setTimeout(() => setIsShuffling(false), 350);
  };

  return (
    <section aria-label="Random Discovery Archive" className="relative">
      {/* ── Status Bar & Shuffle Action ───────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 mb-2 font-mono text-[11px] tracking-wider uppercase border-b-[0.5px] border-[var(--border-subtle)]">
        {/* 左侧状态标识 */}
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-philosophy)] animate-pulse" />
          <span className="font-bold text-[var(--text-primary)] text-[12px] tracking-widest">
            RANDOM DISCOVERY
          </span>
          <span className="opacity-40">/</span>
          <span>6 OF {totalCount} NODES</span>
          <span className="opacity-30 select-none">·</span>
          <span
            className="opacity-50 tabular-nums"
            title="Auto-refreshes every clock hour"
          >
            SYNC IN {minsLeft}M
          </span>
        </div>

        {/* 右侧一键洗牌按钮 */}
        <button
          onClick={handleShuffle}
          className="group flex items-center gap-1.5 px-3 py-1 rounded-full border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-all duration-150 active:scale-95 cursor-pointer select-none"
          title="Shuffle 6 random transmissions"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              isShuffling ? "rotate-180" : "group-hover:rotate-180"
            } text-[var(--text-muted)] group-hover:text-[var(--text-primary)]`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-[10px] tracking-widest font-mono">SHUFFLE</span>
        </button>
      </div>

      {/* ── Magazine List Flow (6 Random Nodes) ───────────────────────────── */}
      <div className="flex flex-col gap-1 sm:gap-1.5 mt-2">
        {displayPosts.map((post, index) => {
          const accentColor = CATEGORY_ACCENTS[post.category] ?? "var(--accent-philosophy)";
          const coreTakeaway = getCoreTakeaway(post);
          const readTime = estimateReadingTime(post);
          const rawMappedTags = (post.tags || []).map(toEnglishTag).filter(Boolean);
          const uniqueTags = Array.from(new Set(rawMappedTags)).filter(
            (tag) => tag.toLowerCase() !== "insight" || rawMappedTags.length === 1
          );

          return (
            <div
              key={post.slug}
              className="relative group hover:z-40 focus-within:z-40"
            >
              <Link
                href={`/post/${post.slug}`}
                className="flex items-center justify-between gap-4 -mx-4 px-4 py-3.5 rounded-[16px] transition-colors duration-150 ease-out hover:bg-black/[0.03] dark:hover:bg-white/[0.035]"
                style={{ "--hover-color": accentColor } as React.CSSProperties}
              >
                {/* Left Column: Title + Subtitle + Metadata with Tags */}
                <div className="min-w-0 flex-1">
                  {/* 1. Main Title */}
                  <h3 className="font-sans font-medium text-[1.05rem] sm:text-[1.15rem] leading-snug tracking-tight text-[var(--text-primary)] group-hover:text-[var(--hover-color)] transition-colors line-clamp-1">
                    {post.name}
                  </h3>

                  {/* 2. Subtitle / One-line Excerpt */}
                  {(post.summary || post.aiSummary) && (
                    <p className="mt-1 font-sans text-xs sm:text-[0.88rem] text-[var(--text-secondary)] line-clamp-1 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                      {post.summary || post.aiSummary}
                    </p>
                  )}

                  {/* 3. Metadata: Category / YYYY.MM.DD / Subcategory · #tags */}
                  <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.72rem] text-[var(--text-muted)]">
                    <span className="font-medium text-[var(--text-secondary)] group-hover:text-[var(--hover-color)] transition-colors">
                      {post.category}
                    </span>
                    <span className="opacity-30 select-none">/</span>
                    <span>{formatDate(post.publishedDate)}</span>
                    {post.subCategory && (
                      <>
                        <span className="opacity-30 select-none">/</span>
                        <span className="truncate opacity-80">{post.subCategory}</span>
                      </>
                    )}
                    {uniqueTags.length > 0 && (
                      <>
                        <span className="opacity-30 select-none">·</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {uniqueTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-[var(--text-muted)] opacity-75 group-hover:opacity-100 transition-opacity"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Subtle Right Arrow on Hover */}
                <div className="shrink-0 font-mono text-xs text-[var(--text-muted)] opacity-0 -translate-x-1 group-hover:opacity-60 group-hover:translate-x-0 transition-all duration-150 sm:block hidden">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              {/* ── Contextual Inspector (Responsive: Bottom-full on compact viewports, Right-gutter on 2xl) ── */}
              <div
                className="hidden lg:block absolute z-[100] pointer-events-none bottom-full right-0 mb-2 w-[300px] 2xl:left-[calc(100%+24px)] 2xl:right-auto 2xl:top-0 2xl:bottom-auto 2xl:w-[340px] rounded-[18px] border-[0.5px] border-[var(--border-default)] bg-[var(--bg-surface)]/95 backdrop-blur-xl p-4 shadow-2xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 2xl:translate-y-0 2xl:translate-x-2 2xl:group-hover:translate-x-0 transition-all duration-200 ease-out"
                style={{
                  boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.4)",
                }}
              >
                {/* Header: Category Indicator / Read Time · PREVIEW */}
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span
                    className="flex items-center gap-2 font-semibold"
                    style={{ color: accentColor }}
                  >
                    <span className="h-2 w-2 rounded-full bg-current shrink-0" />
                    <span>{post.category}</span>
                    {post.subCategory && (
                      <>
                        <span className="opacity-40 select-none">/</span>
                        <span className="font-normal text-[var(--text-secondary)] truncate max-w-[120px]">
                          {post.subCategory}
                        </span>
                      </>
                    )}
                    <span className="opacity-40 select-none">·</span>
                    <span className="font-normal text-[var(--text-muted)]">{readTime}</span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] opacity-70 font-mono">
                    PREVIEW
                  </span>
                </div>

                {/* Title */}
                <h4 className="mt-2.5 font-sans text-[0.94rem] font-semibold tracking-tight text-[var(--text-primary)] leading-snug line-clamp-2">
                  {post.name}
                </h4>

                {/* Core Thesis / Takeaway */}
                <div
                  className="mt-2.5 rounded-xl border-l-2 bg-[var(--hover-highlight)]/80 p-2.5 text-xs text-[var(--text-secondary)] leading-relaxed"
                  style={{ borderColor: accentColor }}
                >
                  <div
                    className="font-mono text-[9px] uppercase tracking-widest mb-1 font-bold"
                    style={{ color: accentColor }}
                  >
                    CORE THESIS
                  </div>
                  <p className="font-medium text-[var(--text-primary)] line-clamp-3">
                    {coreTakeaway}
                  </p>
                </div>

                {/* Summary */}
                {post.summary && (
                  <p className="mt-2.5 font-sans text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {post.summary}
                  </p>
                )}

                {/* Tags */}
                {uniqueTags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t-[0.5px] border-[var(--border-subtle)]">
                    {uniqueTags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-[var(--hover-highlight)] border-[0.5px] border-[var(--border-subtle)] text-[var(--text-muted)]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link to view all transmissions */}
      <div className="mt-6 flex items-center justify-between font-mono text-[0.75rem] text-[var(--text-muted)] pt-2 border-t-[0.5px] border-[var(--border-subtle)]">
        <span className="opacity-70">Explore deeper</span>
        <Link
          href="/sheshin-notes"
          className="group inline-flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <span>View all {totalCount} transmissions</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
