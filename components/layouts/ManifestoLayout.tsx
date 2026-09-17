"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PostCard from "@/components/PostCard";
import SubCategoryFilter, { ALL_LABEL } from "@/components/SubCategoryFilter";
import type { Post } from "@/lib/posts";
import { CATEGORY_ACCENTS, toEnglishSubCategory, type Category } from "@/lib/design-tokens";

type ManifestoLayoutProps = {
  title: string;
  category: Category;
  posts: Post[];
};

export default function ManifestoLayout({
  title,
  category,
  posts,
}: ManifestoLayoutProps) {
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
      : posts.filter((post) => {
          if (!post.subCategory) return false;
          if (post.subCategory === selectedSub) return true;
          const en = toEnglishSubCategory(post.subCategory, category);
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
          <span>Philosophy &amp; Consciousness</span>
          <span>·</span>
          <span>{posts.length} Inquiries</span>
        </div>
        <h1 className="font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          Exploring consciousness, existential risk, and epistemic frameworks for post-singularity humanity.
        </p>
      </motion.header>

      {/* Sub Category Filter */}
      {subCategories.length > 0 && (
        <SubCategoryFilter
          subCategories={subCategories}
          selected={selectedSub}
          onSelect={setSelectedSub}
          accent={accent}
        />
      )}

      {/* Magazine Flow */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {filteredPosts.length === 0 ? (
          <p className="py-12 font-sans text-center text-[var(--text-secondary)]">
            No inquiries recorded in this section.
          </p>
        ) : (
          filteredPosts.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(0.04 * i, 0.3) }}
            >
              <PostCard post={post} accent={accent} size="stream" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
