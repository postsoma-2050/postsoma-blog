"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PostCard from "@/components/PostCard";
import SubCategoryFilter, { ALL_LABEL } from "@/components/SubCategoryFilter";
import type { Post } from "@/lib/posts";
import { CATEGORY_ACCENTS, toEnglishSubCategory, type Category } from "@/lib/design-tokens";

type ListLayoutProps = {
  title: string;
  category: Category;
  posts: Post[];
};

export default function ListLayout({
  title,
  category,
  posts,
}: ListLayoutProps) {
  const accent = CATEGORY_ACCENTS[category];
  const subCategories = useMemo(
    () =>
      Array.from(
        new Set(posts.map((p) => p.subCategory?.trim()).filter((x): x is string => !!x))
      ),
    [posts]
  );
  const [selectedSub, setSelectedSub] = useState(ALL_LABEL);

  const filteredPosts =
    selectedSub === ALL_LABEL
      ? posts
      : posts.filter((p) => {
          if (!p.subCategory) return false;
          if (p.subCategory === selectedSub) return true;
          const en = toEnglishSubCategory(p.subCategory, category);
          const selEn = toEnglishSubCategory(selectedSub, category) || selectedSub;
          return en === selEn || en === selectedSub;
        });

  return (
    <div className="mx-auto max-w-[760px] space-y-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="border-b border-[var(--border-subtle)] pb-6"
      >
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-[var(--text-muted)] mb-2">
          <span>Mindfulness &amp; Inner Cultivation</span>
          <span>·</span>
          <span>{posts.length} Notes</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Quiet reflections, inner observations, and philosophical field notes.
        </p>
      </motion.header>

      {/* SubCategory Filter */}
      {subCategories.length > 0 && (
        <SubCategoryFilter
          subCategories={subCategories}
          selected={selectedSub}
          onSelect={setSelectedSub}
          accent={accent}
        />
      )}

      {/* Dense minimal list */}
      <motion.ul
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="divide-y divide-[var(--border-subtle)]"
      >
        {filteredPosts.length === 0 ? (
          <li className="py-12 font-sans text-center text-[var(--text-secondary)]">
            No notes found in this section.
          </li>
        ) : (
          filteredPosts.map((post, i) => (
            <motion.li
              key={post.slug}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.03 * i, 0.3) }}
            >
              <PostCard post={post} accent={accent} size="compact" />
            </motion.li>
          ))
        )}
      </motion.ul>
    </div>
  );
}
