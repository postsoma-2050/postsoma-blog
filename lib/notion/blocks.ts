import { safeNotionCall, getNotionClient } from "./client";
import { withFileCache } from "./cache";

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

async function fetchBlockChildren(
  notion: ReturnType<typeof getNotionClient>,
  blockId: string
): Promise<NotionBlock[]> {
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

async function enrichBlockWithChildren(
  notion: ReturnType<typeof getNotionClient>,
  block: NotionBlock
): Promise<NotionBlock> {
  if (!block.has_children) return { ...block, children: [] };
  const childBlocks = await fetchBlockChildren(notion, block.id);
  const enrichedChildren = await Promise.all(
    childBlocks.map((c) => enrichBlockWithChildren(notion, c))
  );
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
        typeof mdString === "string"
          ? mdString
          : (mdString as { parent?: string } | null)?.parent ?? "";
      const preview =
        typeof rawContent === "string" ? rawContent.substring(0, 50) : "(no preview)";
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
      const enriched = await Promise.all(
        topBlocks.map((b) => enrichBlockWithChildren(notion, b))
      );
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
    console.warn(
      "⚠️ Failed to retrieve fresh image URL from Notion:",
      { blockId, pageId, mediaIndex },
      err
    );
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
      block.type === "heading_1"
        ? 1
        : block.type === "heading_2"
          ? 2
          : block.type === "heading_3"
            ? 3
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
  // 1. Precise CJK character count (excluding punctuation)
  const cjkCount = (text.match(/[\u4e00-\u9fa5\u3040-\u309f\u30a0-\u30ff]/g) || []).length;
  // 2. Precise English words count
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
