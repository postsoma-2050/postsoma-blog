"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, ArrowRight } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/design-tokens";

export type SearchablePost = {
  name: string;
  slug: string;
  category: Category;
  summary?: string | null;
  publishedDate?: string | null;
  tags?: string[];
};

export function openSearchModal() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-postsoma-search"));
  }
}

interface SearchModalProps {
  posts: SearchablePost[];
}

export default function SearchModal({ posts }: SearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen to open-search custom event & Cmd+K keyboard shortcut
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setQuery("");
      setSelectedIndex(0);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("open-postsoma-search", handleOpen);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("open-postsoma-search", handleOpen);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Filter posts based on query and category
  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchCategory =
        selectedCategory === "ALL" || p.category === selectedCategory;
      if (!matchCategory) return false;
      if (!q) return true;

      const titleMatch = p.name.toLowerCase().includes(q);
      const summaryMatch = p.summary?.toLowerCase().includes(q) ?? false;
      const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(q)) ?? false;
      return titleMatch || summaryMatch || tagMatch;
    });
  }, [posts, query, selectedCategory]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredPosts.length, selectedCategory, query]);

  // Keyboard navigation within list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredPosts.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredPosts.length - 1
      );
    } else if (e.key === "Enter" && filteredPosts[selectedIndex]) {
      e.preventDefault();
      setIsOpen(false);
      router.push(`/post/${filteredPosts[selectedIndex].slug}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search transmissions"
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-6 md:p-20 overflow-y-auto bg-black/40 dark:bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-2xl overflow-hidden rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header / input */}
        <div className="flex items-center border-b-[0.5px] border-[var(--border-subtle)] px-4 py-3 sm:px-5">
          <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Search 300+ cognitive transmissions..."
            className="w-full bg-transparent font-mono text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] mr-2"
              aria-label="Clear query"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded border-[0.5px] border-[var(--border-subtle)] bg-[var(--hover-highlight)] px-2 py-1 font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            ESC
          </button>
        </div>

        {/* Category filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors shrink-0 ${
              selectedCategory === "ALL"
                ? "bg-[var(--bg-raised)] text-[var(--text-primary)] border-[0.5px] border-[var(--border-default)]"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent"
            }`}
          >
            ALL ({posts.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = posts.filter((p) => p.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded px-2.5 py-1 font-mono text-[11px] transition-colors shrink-0 ${
                  isSelected
                    ? "bg-[var(--bg-raised)] text-[var(--text-primary)] border-[0.5px] border-[var(--border-default)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] border border-transparent"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 sm:p-3 divide-y-[0.5px] divide-[var(--border-subtle)]">
          {filteredPosts.length === 0 ? (
            <div className="py-12 text-center font-mono text-xs text-[var(--text-muted)]">
              No matching transmissions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredPosts.map((post, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <Link
                  key={post.slug}
                  href={`/post/${post.slug}`}
                  onClick={() => setIsOpen(false)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`group flex items-start justify-between gap-3 rounded-lg p-3 transition-colors ${
                    isSelected
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)]"
                      : "text-[var(--text-primary)] hover:bg-[var(--hover-highlight)]"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[9px] font-semibold tracking-wider text-[var(--text-secondary)]">
                        {post.category}
                      </span>
                      {post.publishedDate && (
                        <span className="font-mono text-[10px] text-[var(--text-muted)]">
                          {post.publishedDate.split("T")[0].replace(/-/g, ".")}
                        </span>
                      )}
                    </div>
                    <h4 className="font-mono text-sm font-medium truncate group-hover:opacity-85 transition-opacity">
                      {post.name}
                    </h4>
                    {post.summary && (
                      <p className="font-sans text-xs text-[var(--text-muted)] line-clamp-1 mt-0.5">
                        {post.summary}
                      </p>
                    )}
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 shrink-0 mt-2 transition-transform ${
                      isSelected
                        ? "text-[var(--text-primary)] translate-x-1"
                        : "text-[var(--text-muted)]"
                    }`}
                  />
                </Link>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2 text-[10px] font-mono text-[var(--text-muted)]">
          <span>↑ / ↓ Navigate · ↵ Select</span>
          <span>{filteredPosts.length} Nodes</span>
        </div>
      </div>
    </div>
  );
}
