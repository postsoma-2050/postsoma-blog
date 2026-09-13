import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Post } from "../types";

// Re-export public API from sub-modules so all callers continue to use `@/lib/notion`
export { safeNotionCall, getNotionClient, testNotionConnection } from "./client";
export { clearNotionCache } from "./cache";
export { CATEGORY_MAP } from "./mapper";

import { safeNotionCall, getNotionClient } from "./client";
import { withFileCache } from "./cache";
import { mapPageToPost, CATEGORY_MAP } from "./mapper";

// =========================================================================
// Notion Block Types
// =========================================================================

export type NotionRichText = {
  type?: string;
  text?: { content: string; link?: { url: string } | null };
  equation?: { expression: string };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
};

export type NotionBlockContent = {
  rich_text?: NotionRichText[];
  checked?: boolean;
  type?: "file" | "external";
  file?: { url: string };
  external?: { url: string };
  caption?: NotionRichText[];
  is_toggleable?: boolean;
};

export type NotionCodeContent = {
  rich_text: NotionRichText[];
  language?: string;
};

export type NotionBlock = {
  id: string;
  type: string;
  has_children?: boolean;
  children?: NotionBlock[];
  paragraph?: NotionBlockContent;
  heading_1?: NotionBlockContent;
  heading_2?: NotionBlockContent;
  heading_3?: NotionBlockContent;
  bulleted_list_item?: NotionBlockContent;
  numbered_list_item?: NotionBlockContent;
  to_do?: NotionBlockContent;
  quote?: NotionBlockContent;
  callout?: NotionBlockContent;
  image?: NotionBlockContent;
  toggle?: NotionBlockContent;
  code?: NotionCodeContent;
  equation?: { expression: string };
};

// =========================================================================
// Block Utilities (private)
// =========================================================================

function getBlockContent(block: NotionBlock): NotionBlockContent | undefined {
  const key = block.type as keyof NotionBlock;
  const value = block[key];
  return typeof value === "object" && value !== null && "rich_text" in value
    ? (value as NotionBlockContent)
    : block.type === "image"
      ? block.image
      : undefined;
}

function getBlockRichText(block: NotionBlock): NotionRichText[] {
  const content = getBlockContent(block);
  return Array.isArray(content?.rich_text) ? content.rich_text : [];
}

const PAGE_SIZE = 100;

async function fetchBlockChildren(notion: ReturnType<typeof getNotionClient>, blockId: string): Promise<NotionBlock[]> {
  const blocks: NotionBlock[] = [];
  let cursor: string | undefined;
  do {
    const response = await safeNotionCall(() =>
      notion.blocks.children.list({
        block_id: blockId,
        page_size: PAGE_SIZE,
        start_cursor: cursor,
      })
    );
    const results = Array.isArray(response.results) ? response.results : [];
    for (const b of results) {
      if (b && typeof b === "object" && "id" in b && "type" in b) {
        blocks.push(b as unknown as NotionBlock);
      }
    }
    cursor = (response as { next_cursor?: string }).next_cursor ?? undefined;
  } while (cursor);
  return blocks;
}

async function enrichBlockWithChildren(notion: ReturnType<typeof getNotionClient>, block: NotionBlock): Promise<NotionBlock> {
  if (!block.has_children) return { ...block, children: [] };
  const childBlocks = await fetchBlockChildren(notion, block.id);
  const enrichedChildren = await Promise.all(childBlocks.map((c) => enrichBlockWithChildren(notion, c)));
  return { ...block, children: enrichedChildren };
}

function flattenBlocks(blocks: NotionBlock[]): NotionBlock[] {
  const out: NotionBlock[] = [];
  for (const b of blocks) {
    out.push(b);
    if (Array.isArray(b.children) && b.children.length > 0) {
      out.push(...flattenBlocks(b.children));
    }
  }
  return out;
}

// =========================================================================
// Public Query API
// =========================================================================

/**
 * Fetches published posts from the Notion database.
 * Strict filter: only returns pages where Status equals "Done".
 * Optional categorySlug narrows to that category (uses CATEGORY_MAP for exact Notion value).
 */
export async function getPublishedPosts(categorySlug?: string): Promise<Post[]> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY) {
    console.error("❌ Missing Notion env variables (NOTION_DATABASE_ID or NOTION_API_KEY)");
    return [];
  }

  const cacheKey = `published_posts_${categorySlug || "all"}`;
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

  return withFileCache(cacheKey, CACHE_TTL, async () => {
    try {
      const notion = getNotionClient();
      const db = await safeNotionCall(() => notion.databases.retrieve({ database_id: databaseId }));
      const dataSourceId =
        "data_sources" in db && Array.isArray(db.data_sources) && db.data_sources.length > 0
          ? (db.data_sources[0] as { id?: string }).id
          : databaseId;
      if (!dataSourceId) {
        console.error("❌ Could not resolve Notion data source id");
        return [];
      }

      const andFilters: Array<{ property: string; status: { equals: string } } | { property: string; select: { equals: string } }> = [
        { property: "Status", status: { equals: "Done" } },
      ];

      if (categorySlug && CATEGORY_MAP[categorySlug]) {
        andFilters.push({ property: "Category", select: { equals: CATEGORY_MAP[categorySlug] } });
      }

      const all: Post[] = [];
      let cursor: string | undefined;
      const pageSize = 100;

      do {
        const response = await safeNotionCall(() =>
          notion.dataSources.query({
            data_source_id: dataSourceId,
            result_type: "page",
            page_size: pageSize,
            start_cursor: cursor,
            filter: { and: andFilters },
            sorts: [{ property: "Published Date", direction: "descending" }],
          })
        );

        const results = Array.isArray(response.results) ? response.results : [];
        for (const item of results) {
          if (!item || item.object !== "page" || !("properties" in item)) continue;
          try {
            const post = mapPageToPost(item as PageObjectResponse);
            if (post) all.push(post);
          } catch (err) {
            console.warn(`⚠️ Failed to process page: ${(item as { id?: string })?.id ?? "unknown"}`, err);
          }
        }

        cursor = response.next_cursor ?? undefined;
      } while (cursor);

      // Sort strictly by published date descending (newest first)
      all.sort((a, b) => {
        const timeA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
        const timeB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
        return timeB - timeA;
      });

      return all;
    } catch (error) {
      console.error("🔥 Notion API failed:", error);
      return [];
    }
  });
}

/**
 * Directly queries Notion database by Slug property without relying on the full post list cache.
 * Provides a foolproof fallback so newly published articles never return 404.
 */
export async function fetchPostBySlugDirectlyFromNotion(slug: string): Promise<Post | null> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId || !process.env.NOTION_API_KEY || !slug) return null;

  try {
    const notion = getNotionClient();
    const db = await safeNotionCall(() => notion.databases.retrieve({ database_id: databaseId }));
    const dataSourceId =
      "data_sources" in db && Array.isArray(db.data_sources) && db.data_sources.length > 0
        ? (db.data_sources[0] as { id?: string }).id
        : databaseId;

    if (!dataSourceId) return null;

    const response = await safeNotionCall(() =>
      notion.dataSources.query({
        data_source_id: dataSourceId,
        result_type: "page",
        page_size: 1,
        filter: {
          and: [
            { property: "Status", status: { equals: "Done" } },
            { property: "Slug", rich_text: { equals: slug } },
          ],
        },
      })
    );

    const results = Array.isArray(response.results) ? response.results : [];
    if (results.length > 0) {
      return mapPageToPost(results[0] as PageObjectResponse);
    }
  } catch (err) {
    console.warn(`⚠️ Failed to fetch post directly by slug "${slug}":`, err);
  }
  return null;
}

/**
 * Fetches a Notion page's body blocks and returns markdown.
 * Use for rendering full post content. Returns empty string on failure.
 */
export async function getPostMarkdown(pageId: string): Promise<string> {
  if (!pageId || !process.env.NOTION_API_KEY) return "";
  const cacheKey = `post_markdown_${pageId}`;
  const CACHE_TTL = 20 * 60 * 1000; // 20 minutes cache

  return withFileCache(cacheKey, CACHE_TTL, async () => {
    try {
      console.log("✅ Found Page ID:", pageId);

      const { NotionToMarkdown } = await import("notion-to-md");
      const notion = getNotionClient();
      const n2m = new NotionToMarkdown({ notionClient: notion });
      const mdBlocks = await safeNotionCall(() => n2m.pageToMarkdown(pageId));
      console.log("📦 Blocks Fetched Count:", mdBlocks?.length ?? 0);

      const mdString = n2m.toMarkdownString(mdBlocks);
      const rawContent =
        typeof mdString === "string" ? mdString : (mdString as { parent?: string } | null)?.parent ?? "";
      const preview = typeof rawContent === "string" ? rawContent.substring(0, 50) : "(no preview)";
      console.log("📝 Markdown Content Preview:", preview);

      return typeof rawContent === "string" ? rawContent : "";
    } catch (err) {
      console.warn("⚠️ Failed to fetch post markdown for page:", pageId, err);
      return "";
    }
  });
}

/**
 * Fetches all top-level blocks of a Notion page with full recursion.
 * Toggle contents, nested lists, and any has_children blocks are populated.
 * Handles pagination (100 blocks per request).
 */
export async function getPostBlocks(pageId: string): Promise<NotionBlock[]> {
  if (!pageId || !process.env.NOTION_API_KEY) return [];
  const cacheKey = `post_blocks_${pageId}`;
  const CACHE_TTL = 20 * 60 * 1000; // 20 minutes cache

  return withFileCache(cacheKey, CACHE_TTL, async () => {
    try {
      const notion = getNotionClient();
      const topBlocks = await fetchBlockChildren(notion, pageId);
      const enriched = await Promise.all(topBlocks.map((b) => enrichBlockWithChildren(notion, b)));
      return enriched;
    } catch (err) {
      console.warn("⚠️ Failed to fetch blocks for page:", pageId, err);
      return [];
    }
  });
}

/**
 * Retrieves a fresh, unexpired image URL for a Notion block or page property.
 */
export async function getFreshImageUrl({
  blockId,
  pageId,
  mediaIndex = 0,
}: {
  blockId?: string;
  pageId?: string;
  mediaIndex?: number;
}): Promise<string | null> {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return null;

  try {
    const notion = getNotionClient();

    if (blockId) {
      const block = (await safeNotionCall(() =>
        notion.blocks.retrieve({ block_id: blockId })
      )) as any;

      if (block && typeof block === "object" && block.type === "image") {
        const img = block.image;
        const url =
          img?.type === "file"
            ? img.file?.url
            : img?.type === "external"
              ? img.external?.url
              : null;
        return url ?? null;
      }
    }

    if (pageId) {
      const page = (await safeNotionCall(() =>
        notion.pages.retrieve({ page_id: pageId })
      )) as any;

      const p = page?.properties ?? {};
      const mediaProp = p["Media"];
      if (mediaProp && mediaProp.type === "files" && Array.isArray(mediaProp.files)) {
        const fileObj = mediaProp.files[mediaIndex];
        if (fileObj) {
          const url =
            fileObj.type === "file"
              ? fileObj.file?.url
              : fileObj.type === "external"
                ? fileObj.external?.url
                : null;
          return url ?? null;
        }
      }
    }

    return null;
  } catch (err) {
    console.warn("⚠️ Failed to retrieve fresh image URL from Notion:", { blockId, pageId, mediaIndex }, err);
    return null;
  }
}

/** Extract heading info from blocks (and nested children) for Table of Contents. */
export function getHeadingsFromBlocks(
  blocks: NotionBlock[]
): { text: string; level: number; slug: string }[] {
  const headings: { text: string; level: number; slug: string }[] = [];
  const flat = flattenBlocks(blocks);
  for (const block of flat) {
    const level =
      block.type === "heading_1" ? 1
        : block.type === "heading_2" ? 2
          : block.type === "heading_3" ? 3
            : 0;
    if (level === 0) continue;
    const rich = getBlockRichText(block);
    const text = rich.map((r) => r.text?.content ?? "").join("").trim();
    if (!text) continue;
    const slug = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-\u4e00-\u9fa5]/g, "");
    headings.push({ text, level, slug });
  }
  return headings;
}

/** Estimates reading time for a plain text or markdown string */
export function estimateReadingTimeFromString(text: string): number {
  if (!text) return 0;
  // 1. Precise CJK (Chinese, Japanese, Korean) character count (excluding punctuation)
  const cjkCount = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  // 2. Precise English words count (matching only letters and numbers, ignoring punctuation)
  const englishWords = text.match(/[a-zA-Z0-9]+(?:'[a-zA-Z0-9]+)?/g) || [];
  const wordCount = englishWords.length;
  // Reading speeds: CJK ~500 chars/min, English ~200 words/min
  const minutes = cjkCount / 500 + wordCount / 200;
  return Math.max(1, Math.ceil(minutes));
}

/** Estimates reading time for an array of Notion blocks */
export function estimateReadingTimeFromBlocks(blocks: NotionBlock[]): number {
  let text = "";
  const flat = flattenBlocks(blocks);
  for (const block of flat) {
    const rich = getBlockRichText(block);
    text += rich.map((r) => r.text?.content ?? "").join("");
  }
  return estimateReadingTimeFromString(text);
}

/**
 * Returns article counts grouped by our 5 display categories.
 * Reuses the cached getPublishedPosts("all") result — zero extra API calls.
 */
export async function getArticleCountByCategory(): Promise<{
  AI: number;
  BC: number;
  PH: number;
  IV: number;
  NT: number;
}> {
  const posts = await getPublishedPosts(); // already cached

  const counts = { AI: 0, BC: 0, PH: 0, IV: 0, NT: 0 };
  for (const post of posts) {
    switch (post.category) {
      case "AI Insights":   counts.AI++; break;
      case "Blockchain":    counts.BC++; break;
      case "Philosophy":    counts.PH++; break;
      case "Investing":     counts.IV++; break;
      case "Sheshin Notes": counts.NT++; break;
    }
  }
  return counts;
}
