import type { Category } from "./design-tokens";

// =========================================================================
// Shared domain types for posts
// Extracted from lib/posts.ts to break the circular dependency:
//   lib/posts.ts → lib/notion.ts → lib/posts.ts
// Both lib/posts.ts and lib/notion.ts now import from this file instead.
// =========================================================================

export type MediaItem = {
  url: string;
  name?: string;
  mime?: string;
  kind: "image" | "video" | "audio" | "other";
};

export type Post = {
  id?: string;
  name: string;
  slug: string;
  category: Category;
  subCategory?: string | null;
  summary: string | null;
  aiSummary?: string | null;
  tags: string[];
  cover: string | null;
  publishedDate: string | null;
  featured: boolean;
  media: MediaItem[];
};
