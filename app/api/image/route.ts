import { NextRequest, NextResponse } from "next/server";
import { getFreshImageUrl } from "@/lib/notion";

/**
 * Image Persistence Proxy Route
 *
 * Automatically resolves fresh Notion S3 presigned URLs (if expired)
 * and streams the image binary with long-term Edge/CDN caching headers:
 * `Cache-Control: public, max-age=31536000, s-maxage=31536000, immutable`
 *
 * This ensures:
 * 1. Zero 403 Forbidden errors when Notion 1-hour presigned URLs expire.
 * 2. Vercel CDN caches the image at the edge forever after the first request.
 * 3. 0 extra Notion API calls on subsequent image loads.
 */

const IMAGE_CACHE_HEADERS = {
  "Cache-Control":
    "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
};

/** Builds a successful image response from an ArrayBuffer. */
function imageResponse(buffer: ArrayBuffer, contentType: string): NextResponse {
  return new NextResponse(buffer, {
    status: 200,
    headers: { "Content-Type": contentType, ...IMAGE_CACHE_HEADERS },
  });
}

/**
 * Resolves the target image URL from Notion (via blockId / pageId) with
 * a fallback to the raw `url` query param.
 * Returns null if neither yields a URL.
 */
async function resolveTargetUrl({
  blockId,
  pageId,
  mediaIndex,
  fallbackUrl,
}: {
  blockId: string | null;
  pageId: string | null;
  mediaIndex: number;
  fallbackUrl: string | null;
}): Promise<string | null> {
  if (blockId || pageId) {
    try {
      const fresh = await getFreshImageUrl({
        blockId: blockId ?? undefined,
        pageId: pageId ?? undefined,
        mediaIndex,
      });
      if (fresh) return fresh;
    } catch (err) {
      console.warn("⚠️ Failed to resolve image URL via Notion API:", err);
    }
  }
  return fallbackUrl;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get("blockId");
  const pageId = searchParams.get("pageId");
  const mediaIndexStr = searchParams.get("mediaIndex");
  const fallbackUrl = searchParams.get("url");

  const mediaIndex = mediaIndexStr ? parseInt(mediaIndexStr, 10) : 0;
  const safeMediaIndex = isNaN(mediaIndex) ? 0 : mediaIndex;

  const targetUrl = await resolveTargetUrl({ blockId, pageId, mediaIndex: safeMediaIndex, fallbackUrl });

  if (!targetUrl) {
    return new NextResponse("Image not found", { status: 404 });
  }

  try {
    const res = await fetch(targetUrl);

    if (!res.ok) {
      // If the URL expired (403) and we have a Notion source, retry once with a fresh URL.
      if (res.status === 403 && (blockId || pageId)) {
        const freshUrl = await getFreshImageUrl({
          blockId: blockId ?? undefined,
          pageId: pageId ?? undefined,
          mediaIndex: safeMediaIndex,
        });
        if (freshUrl && freshUrl !== targetUrl) {
          const retryRes = await fetch(freshUrl);
          if (retryRes.ok) {
            const contentType = retryRes.headers.get("content-type") || "image/jpeg";
            return imageResponse(await retryRes.arrayBuffer(), contentType);
          }
        }
      }
      return new NextResponse(`Failed to fetch image upstream: ${res.status}`, {
        status: res.status,
      });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    return imageResponse(await res.arrayBuffer(), contentType);
  } catch (error: any) {
    console.error("❌ Failed to stream image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
