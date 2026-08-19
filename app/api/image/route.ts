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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get("blockId");
  const pageId = searchParams.get("pageId");
  const mediaIndexStr = searchParams.get("mediaIndex");
  const fallbackUrl = searchParams.get("url");

  const mediaIndex = mediaIndexStr ? parseInt(mediaIndexStr, 10) : 0;

  let targetUrl: string | null = null;

  // 1. Try to get fresh signed URL from Notion via blockId or pageId
  if (blockId || pageId) {
    try {
      targetUrl = await getFreshImageUrl({
        blockId: blockId ?? undefined,
        pageId: pageId ?? undefined,
        mediaIndex: isNaN(mediaIndex) ? 0 : mediaIndex,
      });
    } catch (err) {
      console.warn("⚠️ Failed to resolve image URL via Notion API:", err);
    }
  }

  // 2. Fallback to direct URL if provided
  if (!targetUrl && fallbackUrl) {
    targetUrl = fallbackUrl;
  }

  if (!targetUrl) {
    return new NextResponse("Image not found", { status: 404 });
  }

  try {
    const res = await fetch(targetUrl);
    if (!res.ok) {
      // If direct URL failed (e.g. 403 expired) and we have blockId/pageId, retry with fresh URL
      if (res.status === 403 && (blockId || pageId)) {
        const freshUrl = await getFreshImageUrl({
          blockId: blockId ?? undefined,
          pageId: pageId ?? undefined,
          mediaIndex: isNaN(mediaIndex) ? 0 : mediaIndex,
        });
        if (freshUrl && freshUrl !== targetUrl) {
          const retryRes = await fetch(freshUrl);
          if (retryRes.ok) {
            const contentType = retryRes.headers.get("content-type") || "image/jpeg";
            const buffer = await retryRes.arrayBuffer();
            return new NextResponse(buffer, {
              status: 200,
              headers: {
                "Content-Type": contentType,
                "Cache-Control":
                  "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
              },
            });
          }
        }
      }
      return new NextResponse(`Failed to fetch image upstream: ${res.status}`, {
        status: res.status,
      });
    }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await res.arrayBuffer();

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control":
          "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable",
      },
    });
  } catch (error: any) {
    console.error("❌ Failed to stream image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
