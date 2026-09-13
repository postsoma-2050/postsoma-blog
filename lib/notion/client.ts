import { Client } from "@notionhq/client";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

// =========================================================================
// Notion API Concurrency, Retry & Rate-Limit Helpers
// =========================================================================

class ConcurrencyQueue {
  private activeCount = 0;
  private queue: (() => void)[] = [];

  constructor(private limit: number) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.activeCount >= this.limit) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.activeCount++;
    try {
      return await fn();
    } finally {
      this.activeCount--;
      const next = this.queue.shift();
      if (next) next();
    }
  }
}

const notionQueue = new ConcurrencyQueue(1);
let lastNotionCallTimestamp = 0;
const MIN_NOTION_INTERVAL = 340; // Respect Notion API 3 req/sec limit (~334ms)

async function paceNotionRequest() {
  const now = Date.now();
  const elapsed = now - lastNotionCallTimestamp;
  if (elapsed < MIN_NOTION_INTERVAL) {
    await new Promise((resolve) => setTimeout(resolve, MIN_NOTION_INTERVAL - elapsed));
  }
  lastNotionCallTimestamp = Date.now();
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 5,
  delay = 1000
): Promise<T> {
  try {
    await paceNotionRequest();
    return await fn();
  } catch (err: any) {
    const isRateLimit = err.status === 429 || err.code === "rate_limited";
    if (isRateLimit && retries > 0) {
      const retryAfterHeader = err.headers?.get?.("retry-after");
      const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : delay;
      const sleepTime = retryAfter + Math.random() * 500;

      console.warn(
        `⏳ [Notion API Rate Limited] 429 encountered. Waiting ${Math.round(sleepTime)}ms before retry... (Attempts left: ${retries})`
      );
      await new Promise((resolve) => setTimeout(resolve, sleepTime));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

/** Serializes all Notion API calls through a single-slot queue with retry/back-off. */
export async function safeNotionCall<T>(fn: () => Promise<T>): Promise<T> {
  return notionQueue.run(() => withRetry(fn));
}

/** Creates a Notion SDK client from the NOTION_API_KEY env variable. Throws if missing. */
export function getNotionClient(): Client {
  const key = process.env.NOTION_API_KEY;
  if (!key) {
    throw new Error(
      "NOTION_API_KEY is missing. Add it to .env.local (see .env.example or README)."
    );
  }
  return new Client({ auth: key });
}

/**
 * Extract the title of a Notion page (first property of type "title").
 * Safe: never accesses [0] on an empty array.
 */
export function getPageTitle(page: PageObjectResponse): string {
  try {
    const titleProp = Object.values(page.properties || {}).find(
      (p) => p && typeof p === "object" && "type" in p && p.type === "title"
    );
    if (!titleProp || !("title" in titleProp) || !Array.isArray(titleProp.title))
      return "(no title)";
    const first = titleProp.title.length > 0 ? titleProp.title[0] : null;
    const text =
      first && typeof first === "object" && "plain_text" in first
        ? (first as { plain_text?: string }).plain_text
        : undefined;
    return text ?? "(empty)";
  } catch {
    return "(no title)";
  }
}

/**
 * Test the Notion connection: init client, query the database, and log the first page's title.
 * Use this to confirm your integration (e.g. PostSoma-Bot) is online and the DB is shared.
 */
export async function testNotionConnection(): Promise<void> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) {
    console.error(
      "NOTION_DATABASE_ID is missing. Add it to .env.local (use the ID from your Notion database URL)."
    );
    process.exitCode = 1;
    return;
  }

  try {
    const notion = getNotionClient();

    // v5 API: retrieve database to get its data_source id, then query that data source
    const db = await notion.databases.retrieve({ database_id: databaseId });
    const dataSourceId =
      "data_sources" in db && db.data_sources?.length
        ? db.data_sources[0].id
        : databaseId;

    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      page_size: 1,
      result_type: "page",
    });

    if (response.results.length === 0) {
      console.log("Connection OK. Database is empty (no pages yet).");
      return;
    }

    const first = response.results[0];
    if (first.object !== "page" || !("properties" in first)) {
      console.log("Connection OK. First result is not a full page object.");
      return;
    }

    const title = getPageTitle(first as PageObjectResponse);
    console.log("PostSoma-Bot is online. First page title:", title);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (
      message.includes("Could not find database") ||
      message.includes("object_not_found") ||
      message.includes("unauthorized")
    ) {
      console.error(
        "Notion connection failed: the database was not found or this integration doesn't have access.\n" +
          "In Notion, open the database → ... → Connections → Add connection → select your PostSoma-Bot integration."
      );
    } else if (message.includes("Invalid API key") || message.includes("401")) {
      console.error(
        "Notion connection failed: invalid or missing NOTION_API_KEY. Check .env.local."
      );
    } else {
      console.error("Notion connection failed:", message);
    }
    process.exitCode = 1;
  }
}
