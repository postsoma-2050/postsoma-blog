import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { Post } from "../types";

// Re-export public API from sub-modules so all callers continue to use `@/lib/notion`
export { safeNotionCall, getNotionClient, testNotionConnection } from "./client";
export { clearNotionCache } from "./cache";
export { CATEGORY_MAP } from "./mapper";
export * from "./blocks";

import { safeNotionCall, getNotionClient } from "./client";
import { withFileCache } from "./cache";
import { mapPageToPost, CATEGORY_MAP } from "./mapper";

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
