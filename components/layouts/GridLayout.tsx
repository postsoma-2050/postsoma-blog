"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PostCard from "@/components/PostCard";
import SubCategoryFilter, { ALL_LABEL } from "@/components/SubCategoryFilter";
import type { Post } from "@/lib/posts";
import { CATEGORY_ACCENTS, toEnglishSubCategory, type Category } from "@/lib/design-tokens";

type GridLayoutProps = {
  title: string;
  category: Category;
  posts: Post[];
};

export default function GridLayout({
  title,
  category,
  posts,
}: GridLayoutProps) {
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
          <span>Intelligence Terminal</span>
          <span>·</span>
          <span>{posts.length} Research Nodes</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Autonomous intelligence, machine learning architectures, and human-machine cognitive co-evolution.
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

      {/* Lightweight Double-Column Tech Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid gap-5 sm:grid-cols-2"
      >
        {filteredPosts.length === 0 ? (
          <p className="col-span-full py-12 font-sans text-center text-[var(--text-secondary)]">
            No research nodes found in this section.
          </p>
        ) : (
          filteredPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.04 * i, 0.3) }}
              className="h-full"
            >
              <PostCard post={post} accent={accent} size="grid" />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
