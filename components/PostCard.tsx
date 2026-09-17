"use client";

import React from "react";
import Link from "next/link";
import { RiArrowRightUpLine } from "@remixicon/react";
import type { Post } from "@/lib/posts";
import {
  CATEGORY_ACCENTS,
  toEnglishSubCategory,
  toEnglishTag,
} from "@/lib/design-tokens";

export type PostCardProps = {
  post: Post;
  accent?: string;
  size?: "default" | "stream" | "compact" | "feature" | "grid";
  isPrimary?: boolean;
};

function formatCardDate(date?: string | null): string {
  return date ? date.replace(/-/g, ".") : "";
}

function getCleanTags(tags?: string[]): string[] {
  const rawMappedTags = (tags || []).map(toEnglishTag).filter(Boolean);
  return Array.from(new Set(rawMappedTags)).filter(
    (tag) => tag.toLowerCase() !== "insight" || rawMappedTags.length === 1
  );
}

function resolveThumbnail(post: Post): string | null {
  const firstImage = post.media?.find((m) => m.kind === "image");
  if (post.cover) return post.cover;
  if (!firstImage) return null;
  if (firstImage.url.includes("amazonaws.com") || firstImage.url.includes("notion.so")) {
    return `/api/image?pageId=${post.id}&mediaIndex=0`;
  }
  return firstImage.url;
}

// 1. COMPACT VARIANT (Minimalist index / archive lists)
function CompactCard({
  post,
  color,
  subCat,
  date,
}: {
  post: Post;
  color: string;
  subCat: string;
  date: string;
}) {
  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <article className="flex items-baseline justify-between gap-4 py-3.5 border-b-[0.5px] border-[var(--border-subtle)] -mx-2 px-2 rounded-lg transition-all duration-100 ease-out hover:bg-[var(--hover-highlight)] hover:-translate-y-1">
        <div className="flex items-baseline gap-3 min-w-0">
          {date && (
            <span className="shrink-0 font-mono text-[11px] text-[var(--text-muted)]">
              {date}
            </span>
          )}
          <h3
            className="font-sans text-sm sm:text-base font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--hover-color)] transition-colors"
            style={{ "--hover-color": color } as React.CSSProperties}
          >
            {post.name}
          </h3>
        </div>
        {subCat && (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            {subCat}
          </span>
        )}
      </article>
    </Link>
  );
}

// 2. GRID VARIANT (Double-column cards for Tech / AI)
function GridCard({
  post,
  color,
  subCat,
  date,
  tags,
}: {
  post: Post;
  color: string;
  subCat: string;
  date: string;
  tags: string[];
}) {
  return (
    <Link href={`/post/${post.slug}`} className="h-full flex flex-col group">
      <article
        className="relative flex flex-col h-full rounded-[24px] border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md shadow-[var(--card-inset)] p-5 sm:p-6 transition-all duration-100 ease-out hover:border-[var(--border-default)] hover:bg-[var(--bg-raised)] hover:-translate-y-1 hover:shadow-md"
        style={{ "--hover-color": color } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-3">
          <span className="truncate">{subCat}</span>
          {date && <span className="shrink-0">{date}</span>}
        </div>

        <h3 className="font-sans text-base sm:text-lg font-semibold tracking-tight text-[var(--text-primary)] transition-colors duration-150 group-hover:text-[var(--hover-color)] leading-snug">
          {post.name}
        </h3>

        {post.summary && (
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {post.summary}
          </p>
        )}

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--border-subtle)]">
          <span className="font-mono text-[10px] text-[var(--text-muted)] truncate mr-2">
            {tags.slice(0, 2).map((t) => `#${t}`).join(" ")}
          </span>
          <RiArrowRightUpLine className="w-4 h-4 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--hover-color)]" />
        </div>
      </article>
    </Link>
  );
}

// 3. DEFAULT VARIANT (3-column card grid in FurtherReadSection)
function DefaultCard({
  post,
  color,
  subCat,
  date,
  tags,
  isPrimary,
}: {
  post: Post;
  color: string;
  subCat: string;
  date: string;
  tags: string[];
  isPrimary: boolean;
}) {
  return (
    <Link href={`/post/${post.slug}`} className="h-full flex flex-col group">
      <article
        className="relative flex flex-col h-full rounded-[22px] border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] backdrop-blur-md shadow-[var(--card-inset)] p-4 sm:p-5 transition-all duration-100 ease-out hover:border-[var(--border-default)] hover:bg-[var(--bg-raised)] hover:-translate-y-1 hover:shadow-md"
        style={{ "--hover-color": color } as React.CSSProperties}
      >
        <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
          <span className="shrink-0">{date}</span>
          <span className="truncate max-w-[120px] text-right">{subCat}</span>
        </div>

        {isPrimary && (
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[9px] font-bold tracking-widest text-[var(--hover-color)]">
            <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0 animate-pulse" />
            <span>RECOMMENDED</span>
          </div>
        )}

        <h4 className="font-sans text-[0.95rem] sm:text-base font-semibold tracking-tight text-[var(--text-primary)] transition-colors duration-150 group-hover:text-[var(--hover-color)] leading-snug line-clamp-2 mb-2">
          {post.name}
        </h4>

        {post.summary && (
          <p className="font-sans text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2 mb-3">
            {post.summary}
          </p>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-[var(--border-subtle)] font-mono text-[10px] text-[var(--text-muted)]">
          <span className="truncate mr-2">
            {tags.slice(0, 2).map((t) => `#${t}`).join(" ")}
          </span>
          <RiArrowRightUpLine className="w-3.5 h-3.5 shrink-0 text-[var(--text-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--hover-color)]" />
        </div>
      </article>
    </Link>
  );
}

// 4. STREAM & FEATURE VARIANT (Magazine Flow)
function StreamCard({
  post,
  color,
  subCat,
  date,
  tags,
  isPrimary,
  thumbnailUrl,
}: {
  post: Post;
  color: string;
  subCat: string;
  date: string;
  tags: string[];
  isPrimary: boolean;
  thumbnailUrl: string | null;
}) {
  return (
    <Link href={`/post/${post.slug}`} className="group block">
      <article
        className="relative flex items-start justify-between gap-6 py-6 sm:py-7 border-b-[0.5px] border-[var(--border-subtle)] -mx-3 px-3 sm:-mx-4 sm:px-4 rounded-[20px] transition-all duration-100 ease-out hover:bg-[var(--hover-highlight)] hover:-translate-y-1"
        style={{ "--hover-color": color } as React.CSSProperties}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
            {date && <span className="shrink-0">{date}</span>}
            {subCat && (
              <>
                <span className="opacity-40">·</span>
                <span className="truncate">{subCat}</span>
              </>
            )}
            {isPrimary && (
              <>
                <span className="opacity-40">·</span>
                <span className="font-bold text-[var(--hover-color)] shrink-0">RECOMMENDED</span>
              </>
            )}
          </div>

          <h2 className="mt-2 font-sans text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)] transition-colors duration-150 group-hover:text-[var(--hover-color)] leading-snug">
            {post.name}
          </h2>

          {post.summary && (
            <p className="mt-2.5 font-sans text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed line-clamp-2">
              {post.summary}
            </p>
          )}

          {tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[10px] text-[var(--text-muted)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {thumbnailUrl && (
          <div className="hidden sm:block w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt={post.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        )}
      </article>
    </Link>
  );
}

export default function PostCard({
  post,
  accent,
  size = "default",
  isPrimary = false,
}: PostCardProps) {
  const color = accent ?? CATEGORY_ACCENTS[post.category] ?? "var(--text-primary)";
  const subCat = toEnglishSubCategory(post.subCategory, post.category) || post.category;
  const date = formatCardDate(post.publishedDate);
  const tags = getCleanTags(post.tags);
  const thumbnailUrl = resolveThumbnail(post);

  switch (size) {
    case "compact":
      return <CompactCard post={post} color={color} subCat={subCat} date={date} />;
    case "grid":
      return <GridCard post={post} color={color} subCat={subCat} date={date} tags={tags} />;
    case "default":
      return (
        <DefaultCard
          post={post}
          color={color}
          subCat={subCat}
          date={date}
          tags={tags}
          isPrimary={isPrimary}
        />
      );
    case "stream":
    case "feature":
    default:
      return (
        <StreamCard
          post={post}
          color={color}
          subCat={subCat}
          date={date}
          tags={tags}
          isPrimary={isPrimary}
          thumbnailUrl={thumbnailUrl}
        />
      );
  }
}
