"use client";

import Link from "next/link";
import type { Post } from "@/lib/posts";
import { CATEGORY_ACCENTS } from "@/lib/design-tokens";

interface LatestTransmissionsProps {
  latestPosts: Post[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "UNKNOWN";
  return iso.split("T")[0].replace(/-/g, ".");
}

export default function LatestTransmissions({ latestPosts }: LatestTransmissionsProps) {
  if (latestPosts.length === 0) return null;

  const [primary, ...secondaries] = latestPosts;

  return (
    <section aria-label="Latest Transmissions" className="mt-8">
      {/* Section header */}
      <div className="mb-4 flex items-center gap-3">
        <span className="font-mono text-xs font-bold tracking-widest text-cyan-400">
          {"[ >> ]"}
        </span>
        <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-text-primary">
          LATEST_TRANSMISSIONS
        </h2>
        <span className="font-mono text-xs text-text-secondary/50">{"// SYS.FEED"}</span>
        {/* Decorative line */}
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/30 to-transparent" />
      </div>

      {/* Grid: 2 columns on desktop for primary card, 1 column for secondary list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Primary Latest Post */}
        {primary && (() => {
          const accent = CATEGORY_ACCENTS[primary.category];
          return (
            <Link
              href={`/post/${primary.slug}`}
              className="md:col-span-2 group relative flex flex-col justify-between overflow-hidden rounded-lg border border-cyan-400/40 bg-neutral-900/60 p-5 transition-all duration-200 hover:border-cyan-400/75 hover:bg-neutral-900 hover:shadow-[0_0_30px_rgba(0,240,255,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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
                {/* Meta details */}
                <div className="relative z-10 flex items-center justify-between mb-3">
                  <span
                    className="font-mono text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-current bg-white/5"
                    style={{ color: accent }}
                  >
                    [{primary.category}]
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[8px] font-bold text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded border border-cyan-400/20">
                      LATEST
                    </span>
                    <span className="font-mono text-xs font-bold text-text-primary/90">
                      {formatDate(primary.publishedDate)}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="relative z-10 font-mono text-base md:text-lg font-bold leading-snug text-text-primary group-hover:text-white transition-colors">
                  {primary.name}
                </h3>

                {/* Excerpt */}
                {(primary.summary || primary.aiSummary) && (
                  <p className="relative z-10 mt-2 font-sans text-xs leading-relaxed text-text-secondary/70 line-clamp-2">
                    {primary.summary || primary.aiSummary}
                  </p>
                )}
              </div>

              {/* Bottom CTA */}
              <div className="relative z-10 mt-4 flex items-center justify-between border-t border-white/5 pt-2">
                <span
                  className="font-mono text-[9px] font-bold uppercase tracking-widest transition-colors"
                  style={{ color: accent }}
                >
                  READ FULL TRANSMISSION →
                </span>
              </div>
            </Link>
          );
        })()}

        {/* Secondary Latest Posts (Stacked stack) */}
        <div className="md:col-span-1 flex flex-col gap-3.5">
          {secondaries.map((post) => {
            const accent = CATEGORY_ACCENTS[post.category];
            return (
              <Link
                key={post.slug}
                href={`/post/${post.slug}`}
                className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded border border-white/5 bg-neutral-950/40 p-3.5 transition-all duration-200 hover:border-cyan-400/30 hover:bg-neutral-900/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.04)] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
              >
                <div>
                  {/* Category + Date */}
                  <div className="relative z-10 flex items-center justify-between mb-1.5">
                    <span
                      className="font-mono text-[8px] font-bold uppercase tracking-widest"
                      style={{ color: accent }}
                    >
                      [{post.category}]
                    </span>
                    <span className="font-mono text-[9px] text-text-secondary/40">
                      {formatDate(post.publishedDate)}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="relative z-10 font-mono text-xs font-semibold leading-snug text-text-primary group-hover:text-white transition-colors line-clamp-2">
                    {post.name}
                  </h4>
                </div>

                {/* CTA */}
                <div className="relative z-10 mt-3 border-t border-white/5 pt-1.5 flex items-center">
                  <span
                    className="font-mono text-[8px] font-bold uppercase tracking-widest"
                    style={{ color: accent }}
                  >
                    READ →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
