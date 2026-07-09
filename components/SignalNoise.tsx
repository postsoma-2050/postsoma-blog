"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Post } from "@/lib/posts";
import { CATEGORY_ACCENTS } from "@/lib/design-tokens";

// ---------------------------------------------------------------------------
// Mulberry32 PRNG — deterministic shuffle from a numeric seed
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const rng = mulberry32(seed);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const LS_KEY = "postsoma_signal_noise_seed";

function generateSeed(): number {
  return Math.floor(Math.random() * 99999) + 1;
}

function formatDate(iso: string | null): string {
  if (!iso) return "UNKNOWN";
  return iso.split("T")[0].replace(/-/g, ".");
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface SignalNoiseProps {
  allPosts: Post[];
  latestSlugs: Set<string>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function FeaturedCard({ post }: { post: Post }) {
  const accent = CATEGORY_ACCENTS[post.category];
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded border border-white/10 bg-neutral-900/60 p-4 transition-all duration-200 hover:border-cyan-400/40 hover:bg-neutral-900 hover:shadow-[0_0_24px_rgba(0,240,255,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 h-full"
    >
      {/* Scanline */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
        aria-hidden
      />
      
      <div>
        {/* Category + date */}
        <div className="relative z-10 flex items-center justify-between mb-2">
          <span
            className="font-mono text-[9px] font-bold uppercase tracking-widest"
            style={{ color: accent }}
          >
            [{post.category}]
          </span>
          <span className="font-mono text-[9px] text-text-secondary/40">
            {formatDate(post.publishedDate)}
          </span>
        </div>

        {/* Title */}
        <h3 className="relative z-10 font-mono text-sm sm:text-base font-bold leading-snug text-text-primary group-hover:text-white transition-colors">
          {post.name}
        </h3>

        {/* Excerpt */}
        {post.summary && (
          <p className="relative z-10 mt-1.5 font-sans text-xs leading-relaxed text-text-secondary/65 line-clamp-2">
            {post.summary}
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-3 flex items-center border-t border-white/5 pt-2 min-h-[44px]">
        <span
          className="font-mono text-[9px] font-bold uppercase tracking-widest transition-colors"
          style={{ color: accent }}
        >
          READ →
        </span>
      </div>
    </Link>
  );
}

function SmallCard({ post }: { post: Post }) {
  const accent = CATEGORY_ACCENTS[post.category];
  return (
    <Link
      href={`/post/${post.slug}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded border border-white/10 bg-neutral-900/60 p-4 transition-all duration-200 hover:border-cyan-400/40 hover:bg-neutral-900 hover:shadow-[0_0_16px_rgba(0,240,255,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 h-full"
    >
      {/* Scanline */}
      <div
        className="pointer-events-none absolute inset-0 opacity-15"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
        }}
        aria-hidden
      />

      <div>
        {/* Category + date */}
        <div className="relative z-10 flex items-center justify-between mb-2">
          <span
            className="font-mono text-[8px] font-bold uppercase tracking-widest"
            style={{ color: accent }}
          >
            [{post.category}]
          </span>
          <span className="font-mono text-[8px] text-text-secondary/40">
            {formatDate(post.publishedDate)}
          </span>
        </div>

        {/* Title */}
        <h4 className="relative z-10 font-mono text-xs font-semibold leading-snug text-text-primary group-hover:text-white transition-colors line-clamp-3">
          {post.name}
        </h4>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-3 border-t border-white/5 pt-1.5 flex items-center min-h-[44px]">
        <span
          className="font-mono text-[8px] font-bold uppercase tracking-widest"
          style={{ color: accent }}
        >
          READ →
        </span>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function SignalNoise({ allPosts, latestSlugs }: SignalNoiseProps) {
  const pool = allPosts.filter((p) => !latestSlugs.has(p.slug));

  const [seed, setSeed] = useState<number | null>(null);
  const [selected, setSelected] = useState<Post[]>([]);

  // Initialize from localStorage or generate new seed
  useEffect(() => {
    let s: number;
    try {
      const stored = localStorage.getItem(LS_KEY);
      s = stored ? parseInt(stored, 10) : generateSeed();
      if (isNaN(s) || s <= 0) s = generateSeed();
    } catch {
      s = generateSeed();
    }
    setSeed(s);
    setSelected(seededShuffle(pool, s).slice(0, 5));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reshuffle = useCallback(() => {
    const s = generateSeed();
    try {
      localStorage.setItem(LS_KEY, String(s));
    } catch {/* no-op */}
    setSeed(s);
    setSelected(seededShuffle(pool, s).slice(0, 5));
  }, [pool]);

  // Render nothing on first server pass (pool can be empty or SSR)
  if (pool.length === 0) return null;

  // Wait for client-side init
  const [featured, ...rest] = selected;
  if (!featured) return null;

  return (
    <section aria-label="Signal Noise" className="mt-8">
      {/* Section header */}
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="font-mono text-xs font-bold tracking-widest text-text-secondary/60">
          {"[ ? ]"}
        </span>
        <h2 className="font-mono text-xs sm:text-sm font-bold uppercase tracking-widest text-text-primary">
          SIGNAL_NOISE
        </h2>
        <span className="font-mono text-[11px] sm:text-xs text-text-secondary/50">
          {`// RNG.SEED:[${seed ?? "..."}]`}
        </span>
        {/* Decorative line */}
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent hidden sm:block" />
        {/* Reshuffle button */}
        <button
          type="button"
          onClick={reshuffle}
          className="w-full md:w-auto h-11 md:h-auto flex md:inline-flex items-center justify-center text-center font-mono text-[10px] font-bold uppercase tracking-widest text-text-secondary/50 hover:text-cyan-400 border border-white/10 hover:border-cyan-400/40 rounded px-3 py-1 md:py-1 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          [ RESHUFFLE // NEW SEED ]
        </button>
      </div>

      {/* Cards — featured + 4 small in lg-grid columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Large featured card */}
        <div className="sm:col-span-2 lg:col-span-1">
          <FeaturedCard post={featured} />
        </div>

        {/* 4 small cards */}
        <div className="sm:col-span-2 lg:col-span-2 grid grid-cols-2 gap-4">
          {rest.map((post) => (
            <SmallCard key={post.slug} post={post} />
          ))}
        </div>
      </div>
    </section>
  );
}
