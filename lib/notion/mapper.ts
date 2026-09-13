import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Post } from "../types";
import { CATEGORIES, type Category } from "../design-tokens";
import { getPageTitle } from "./client";

// =========================================================================
// Notion ↔ Internal Category Mapping
// =========================================================================

/**
 * Maps our internal category slugs to exact Notion database category strings.
 * DO NOT MODIFY — these strings must match Notion exactly (including spaces and Chinese characters).
 */
export const CATEGORY_MAP: Record<string, string> = {
  "ai-insights":    "AI資訊 AI Insights",
  "blockchain":     "區塊鏈 Blockchain",
  "investing":      "投資觀念 Investing",
  "philosophy":     "價值觀 Philosophy",
  "sheshin-notes":  "覺觀筆記 Sheshin Notes",
};

/**
 * Reverse map: converts Notion category string to our internal Category type.
 */
const NOTION_TO_CATEGORY: Record<string, Category> = {
  "AI資訊 AI Insights":    "AI Insights",
  "區塊鏈 Blockchain":      "Blockchain",
  "投資觀念 Investing":     "Investing",
  "價值觀 Philosophy":      "Philosophy",
  "覺觀筆記 Sheshin Notes": "Sheshin Notes",
};

function getCategoryFromNotion(notionCategory: string | null): Category {
  if (!notionCategory) return "AI Insights";

  const category = NOTION_TO_CATEGORY[notionCategory];
  if (category && CATEGORIES.includes(category)) {
    return category;
  }

  console.warn(`⚠️ Unknown Notion category: "${notionCategory}", defaulting to "AI Insights"`);
  return "AI Insights";
}

// =========================================================================
// Notion Page → Post Mapper
// =========================================================================

/** Infer media kind from a URL's file extension. */
function inferMediaKind(url: string): "image" | "video" | "audio" | "other" {
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "avif", "bmp", "ico"].includes(ext))
    return "image";
  if (["mp4", "webm", "mov", "avi", "mkv", "ogv"].includes(ext)) return "video";
  if (["mp3", "wav", "ogg", "aac", "flac", "m4a", "opus"].includes(ext)) return "audio";
  return "other";
}

/** Safe read from Notion page properties. Never accesses [0] on empty arrays. */
export function mapPageToPost(page: PageObjectResponse): Post | null {
  try {
    const p = page.properties ?? {};
    if (typeof p !== "object") return null;

    const getTitle = (key: string): string => {
      const prop = p[key];
      if (!prop || typeof prop !== "object" || !("title" in prop)) return "";
      const arr = (prop as { title?: unknown[] }).title;
      if (!Array.isArray(arr) || arr.length === 0) return "";
      const first = arr[0];
      const text =
        first && typeof first === "object" && "plain_text" in first
          ? (first as { plain_text?: string }).plain_text
          : undefined;
      return typeof text === "string" ? text : "";
    };

    const getRichText = (key: string): string | null => {
      const prop = p[key];
      if (!prop || typeof prop !== "object" || !("rich_text" in prop)) return null;
      const arr = (prop as { rich_text?: unknown[] }).rich_text;
      if (!Array.isArray(arr) || arr.length === 0) return null;
      const first = arr[0];
      const text =
        first && typeof first === "object" && "plain_text" in first
          ? (first as { plain_text?: string }).plain_text
          : undefined;
      return typeof text === "string" ? text : null;
    };

    const getSelect = (key: string): string | null => {
      const prop = p[key];
      if (!prop || typeof prop !== "object" || !("select" in prop)) return null;
      const sel = (prop as { select?: { name?: string } }).select;
      const name = sel?.name;
      return typeof name === "string" ? name : null;
    };

    const getDate = (key: string): string | null => {
      const prop = p[key];
      if (!prop || typeof prop !== "object" || !("date" in prop)) return null;
      const date = (prop as { date?: { start?: string } }).date;
      const start = date?.start;
      return typeof start === "string" ? start : null;
    };

    const getMultiSelect = (key: string): string[] => {
      const prop = p[key];
      if (!prop || typeof prop !== "object" || !("multi_select" in prop)) return [];
      const arr = (prop as { multi_select?: Array<{ name?: string }> }).multi_select;
      if (!Array.isArray(arr)) return [];
      return arr
        .map((x) => (x && typeof x.name === "string" ? x.name : ""))
        .filter(Boolean);
    };

    const getCheckbox = (key: string): boolean => {
      const prop = p[key];
      if (!prop || typeof prop !== "object" || !("checkbox" in prop)) return false;
      return (prop as { checkbox?: boolean }).checkbox === true;
    };

    const getFiles = (key: string): Post["media"] => {
      const prop = p[key];
      if (!prop || typeof prop !== "object" || !("files" in prop)) return [];
      const files = (prop as { files?: unknown[] }).files;
      if (!Array.isArray(files)) return [];
      return files
        .map((f) => {
          if (!f || typeof f !== "object") return null;
          const fileObj = f as {
            type?: string;
            name?: string;
            file?: { url?: string };
            external?: { url?: string };
          };
          const url =
            fileObj.type === "file"
              ? fileObj.file?.url
              : fileObj.type === "external"
                ? fileObj.external?.url
                : undefined;
          if (!url || typeof url !== "string") return null;
          return {
            url,
            name: typeof fileObj.name === "string" ? fileObj.name : undefined,
            kind: inferMediaKind(url),
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);
    };

    const name = getTitle("Name") || getPageTitle(page);
    const slugRaw = getRichText("Slug");
    const slug =
      typeof slugRaw === "string" && slugRaw
        ? slugRaw
        : (name ? name.toLowerCase().replace(/\s+/g, "-") : "") || (page.id ?? "");
    if (!name && !slug) return null;

    const rawCategory = getSelect("Category");
    const category: Category = getCategoryFromNotion(rawCategory);

    return {
      id: typeof page.id === "string" ? page.id : "",
      name: name || "Untitled Post",
      slug: typeof slug === "string" ? slug : String(page.id ?? ""),
      category,
      subCategory: getSelect("Sub-Category") ?? null, // Notion Select property "Sub-Category"
      summary: getRichText("Summary") ?? null,
      aiSummary: getRichText("AI_Summary") ?? getRichText("Summary") ?? null,
      tags: getMultiSelect("Tags") ?? [],
      cover: null,
      publishedDate: getDate("Published Date") ?? getDate("Date") ?? null,
      featured: getCheckbox("Featured"),
      media: getFiles("Media"),
    };
  } catch (err) {
    console.warn(`⚠️ Failed to parse post: ${page?.id ?? "unknown"}`, err);
    return null;
  }
}
