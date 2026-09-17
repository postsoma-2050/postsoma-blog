"use client";

import { motion } from "framer-motion";
import { toEnglishSubCategory } from "@/lib/design-tokens";

const ALL_LABEL = "All";

export type SubCategoryFilterVariant = "default" | "minimal";

type SubCategoryFilterProps = {
  subCategories: string[];
  selected: string;
  onSelect: (value: string) => void;
  /** Category accent hex (e.g. #00F0FF for AI). */
  accent?: string;
  /** "minimal" = monochrome variant */
  variant?: SubCategoryFilterVariant;
};

export default function SubCategoryFilter({
  subCategories,
  selected,
  onSelect,
  accent,
  variant = "default",
}: SubCategoryFilterProps) {
  // Deduplicate subcategories strictly by their resolved display label
  const seenLabels = new Set<string>();
  const items: string[] = [ALL_LABEL];

  for (const sub of subCategories) {
    if (!sub) continue;
    const raw = sub.trim();
    if (!raw || raw.toLowerCase() === "all") continue;
    const display = toEnglishSubCategory(raw) || raw;
    const lower = display.toLowerCase();
    if (!seenLabels.has(lower)) {
      seenLabels.add(lower);
      items.push(raw);
    }
  }

  if (items.length <= 1) return null;

  return (
    <nav
      className="subcat-scroll flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none"
      aria-label="Filter by sub-category"
    >
      {items.map((sub) => {
        const displayLabel = sub === ALL_LABEL ? ALL_LABEL : (toEnglishSubCategory(sub) || sub);
        const isActive =
          selected === sub ||
          (sub !== ALL_LABEL && selected.toLowerCase() === displayLabel.toLowerCase());

        return (
          <button
            key={sub}
            type="button"
            onClick={() => onSelect(sub)}
            className={`
              relative shrink-0 rounded-full px-3.5 py-1.5 font-mono text-xs sm:text-sm font-medium transition-all
              ${
                isActive
                  ? "bg-[var(--bg-surface)] text-[var(--text-primary)] font-semibold border-[0.5px] border-[var(--border-default)] shadow-sm"
                  : "bg-[var(--hover-highlight)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)] border-[0.5px] border-transparent"
              }
            `}
          >
            {isActive && (
              <motion.span
                layoutId="subcat-pill-bg"
                className="absolute inset-0 rounded-full border-[0.5px] border-[var(--border-default)] bg-[var(--bg-surface)] shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10">{displayLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}

export { ALL_LABEL };
