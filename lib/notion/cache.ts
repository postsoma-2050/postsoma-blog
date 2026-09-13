import fs from "fs";
import path from "path";

// =========================================================================
// Disk-based File Cache for Notion API Responses
// =========================================================================

const CACHE_DIR = path.join(process.cwd(), ".next/cache/notion");

/**
 * Read-through cache backed by the local filesystem.
 * - On server: reads/writes JSON files under .next/cache/notion/
 * - On client (browser): skips the cache and calls fetchFn directly.
 * TTL is checked against the file's mtime.
 */
export async function withFileCache<T>(
  key: string,
  ttlMs: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  if (typeof window !== "undefined") {
    return fetchFn();
  }

  const safeKey = key.replace(/[^a-zA-Z0-9_\-]/g, "_");
  const cacheFile = path.join(CACHE_DIR, `${safeKey}.json`);

  try {
    if (fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const age = Date.now() - stats.mtimeMs;
      if (age < ttlMs) {
        const data = fs.readFileSync(cacheFile, "utf-8");
        return JSON.parse(data) as T;
      }
    }
  } catch (err) {
    console.warn(`⚠️ [Notion Cache] Failed to read cache for key ${safeKey}:`, err);
  }

  const freshData = await fetchFn();

  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify(freshData), "utf-8");
  } catch (err) {
    console.warn(`⚠️ [Notion Cache] Failed to write cache for key ${safeKey}:`, err);
  }

  return freshData;
}

/**
 * Purges the local disk cache for Notion data (used during On-Demand Revalidation).
 * If pageId is provided, clears all cache files containing that pageId as well as list caches.
 * If no pageId is provided, clears all Notion cache files completely.
 */
export function clearNotionCache(pageId?: string) {
  try {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        if (!pageId || file.includes(pageId) || file.startsWith("published_posts")) {
          try {
            fs.unlinkSync(path.join(CACHE_DIR, file));
          } catch {
            // ignore individual unlink error
          }
        }
      }
    }
  } catch (err) {
    console.warn("⚠️ [Notion Cache] Failed to clear disk cache files:", err);
  }
}
