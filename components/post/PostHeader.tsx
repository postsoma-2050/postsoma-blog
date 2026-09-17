import Link from "next/link";
import { RiArrowLeftLine } from "@remixicon/react";
import type { Post } from "@/lib/posts";
import { toEnglishTag } from "@/lib/design-tokens";

interface PostHeaderProps {
  post: Post;
  categorySlug: string;
  readingTime: number | string;
}

export default function PostHeader({ post, categorySlug, readingTime }: PostHeaderProps) {
  const rawMappedTags = (post.tags || []).map(toEnglishTag).filter(Boolean);
  const uniqueTags = Array.from(new Set(rawMappedTags)).filter(
    (tag) => tag.toLowerCase() !== "insight" || rawMappedTags.length === 1
  );

  return (
    <header className="mb-14 text-center">
      <Link
        href={`/${categorySlug}`}
        className="inline-flex items-center font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
      >
        <RiArrowLeftLine className="w-3.5 h-3.5 mr-1.5" />
        {post.category}
      </Link>
      <h1 className="mt-4 font-sans text-3xl sm:text-4xl lg:text-[2.6rem] font-semibold tracking-tight text-[var(--text-primary)] leading-[1.25]">
        {post.name}
      </h1>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-[0.85rem] text-[var(--text-muted)]">
        {post.publishedDate && <time>{post.publishedDate}</time>}
        <span>·</span>
        <span>{readingTime} min read</span>
        {uniqueTags.length > 0 && (
          <>
            <span>·</span>
            {uniqueTags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </>
        )}
      </div>
    </header>
  );
}
