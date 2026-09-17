"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/lib/types";

interface HorizontalRailProps {
  posts: Post[];
  title?: string;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return iso.split("T")[0].replace(/-/g, ".");
}

export default function HorizontalRail({
  posts,
  title = "Latest Transmissions",
}: HorizontalRailProps) {
  if (!posts || posts.length === 0) return null;

  return (
    <section aria-label="Recent Transmissions Rail">
      {/* Section Header: Aligned with RANDOM DISCOVERY design tokens */}
      <div className="flex items-center justify-between pb-3 mb-4 font-mono text-[11px] tracking-wider uppercase">
        {/* 左侧：绿点心跳 + 加粗主标题 + 数量标尺 */}
        <div className="flex items-center gap-2 text-[var(--text-muted)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-philosophy)] animate-pulse" />
          <span className="font-bold text-[var(--text-primary)] text-[12px] tracking-widest">
            {title.toUpperCase()}
          </span>
          <span className="opacity-40">/</span>
          <span>{posts.length} NODES</span>
        </div>

        {/* 右侧：滚动指引微标 */}
        <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-[var(--text-muted)]">
          <span>SCROLL TO EXPLORE</span>
          <span className="text-[var(--text-secondary)]">→</span>
        </div>
      </div>

      {/* Horizontal scrolling track with 100ms tactile lift room */}
      <div className="flex gap-4 overflow-x-auto pt-2 pb-2 snap-x no-scrollbar items-end">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/post/${post.slug}`}
            className="group relative flex w-[230px] sm:w-[260px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-[20px] border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-raised)] backdrop-blur-md shadow-[var(--card-inset)] p-4 mb-6 hover:mb-4 transition-all duration-100 ease-out hover:-translate-y-1 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
          >
            <div>
              {/* Category / Date metadata */}
              <div className="flex items-baseline gap-1.5 font-mono text-[0.72rem]">
                <span className="font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  {post.category}
                </span>
                <span className="text-[var(--text-muted)] opacity-40 select-none">/</span>
                <span className="text-[var(--text-muted)]">{formatDate(post.publishedDate)}</span>
              </div>

              {/* Title */}
              <h3 className="mt-2.5 font-sans text-[0.95rem] font-medium leading-[1.25] tracking-tight text-[var(--text-primary)] group-hover:opacity-85 transition-opacity line-clamp-2">
                {post.name}
              </h3>

              {/* Excerpt */}
              {(post.summary || post.aiSummary) && (
                <p className="mt-2 font-sans text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {post.summary || post.aiSummary}
                </p>
              )}
            </div>

            {/* Subtle Footer Arrow */}
            <div className="mt-4 flex items-center justify-end border-t-[0.5px] border-[var(--border-subtle)] pt-2 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
