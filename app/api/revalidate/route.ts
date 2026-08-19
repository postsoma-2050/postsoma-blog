import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_SLUGS } from "@/lib/design-tokens";
import { clearNotionCache } from "@/lib/notion";
import { clearPostsMemoryCache, getPostBySlug } from "@/lib/posts";

/**
 * On-Demand ISR Revalidation API Endpoint
 * 
 * Supports:
 * 1. POST /api/revalidate (Webhook / automation)
 * 2. GET /api/revalidate?secret=...&slug=... (Manual verification in browser)
 * 
 * Authentication supported via:
 * - Query param: ?secret=<REVALIDATION_SECRET>
 * - Header: Authorization: Bearer <REVALIDATION_SECRET>
 * - Header: x-revalidation-secret: <REVALIDATION_SECRET>
 * - Body: { "secret": "<REVALIDATION_SECRET>" }
 */

function authenticate(req: NextRequest, bodySecret?: string): boolean {
  const secretEnv = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET;
  if (!secretEnv) {
    console.error("❌ REVALIDATION_SECRET is not set in environment variables!");
    return false;
  }

  // 1. Check query param
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret && querySecret.trim() === secretEnv) {
    return true;
  }

  // 2. Check Bearer token in Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token === secretEnv) return true;
  }

  // 3. Check custom header
  const customHeader = req.headers.get("x-revalidation-secret");
  if (customHeader && customHeader.trim() === secretEnv) {
    return true;
  }

  // 4. Check body secret
  if (bodySecret && bodySecret.trim() === secretEnv) {
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    const text = await req.text();
    if (text) {
      body = JSON.parse(text);
    }
  } catch (err) {
    // Body is optional
  }

  if (!authenticate(req, body?.secret)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing revalidation secret token." },
      { status: 401 }
    );
  }

  const revalidated: string[] = [];

  try {
    // 1. Always purge internal memory & Notion disk cache so fresh data is fetched
    clearPostsMemoryCache();

    // 2. Revalidate all / layout / full site
    if (body.all === true || body.type === "layout") {
      clearNotionCache(); // Wipe all Notion block/list caches
      revalidatePath("/", "layout");
      revalidated.push("layout (entire site & all notion caches purged)");
    }

    // 3. Revalidate by specific slug
    if (body.slug && typeof body.slug === "string") {
      const cleanSlug = body.slug.trim().replace(/^\/post\//, "");
      const post = await getPostBySlug(cleanSlug);
      
      // Purge disk cache for this post's blocks & list caches
      clearNotionCache(post?.id);

      const postPath = `/post/${cleanSlug}`;
      revalidatePath(postPath, "page");
      revalidatePath("/post/[slug]", "page");
      revalidated.push(postPath);

      // Revalidate homepage
      revalidatePath("/", "page");
      revalidated.push("/");

      // Revalidate category pages
      if (body.category && typeof body.category === "string") {
        const catSlug = body.category.trim().replace(/^\//, "");
        const catPath = `/${catSlug}`;
        revalidatePath(catPath, "page");
        revalidated.push(catPath);
      } else {
        for (const slug of Object.values(CATEGORY_SLUGS)) {
          revalidatePath(`/${slug}`, "page");
        }
        revalidated.push("all category pages");
      }

      // Revalidate sitemap
      revalidatePath("/sitemap.xml");
      revalidated.push("/sitemap.xml");
    }

    // 4. Revalidate by explicit path
    if (body.path && typeof body.path === "string") {
      const targetPath = body.path.trim();
      const type = body.pathType === "layout" ? "layout" : "page";
      revalidatePath(targetPath, type);
      revalidated.push(`${targetPath} (${type})`);
    }

    // 5. Revalidate by cache tag
    if (body.tag && typeof body.tag === "string") {
      revalidateTag(body.tag.trim());
      revalidated.push(`tag: ${body.tag}`);
    }

    // Fallback if no specific target
    if (revalidated.length === 0) {
      clearNotionCache();
      revalidatePath("/", "page");
      revalidatePath("/sitemap.xml");
      revalidated.push("/", "/sitemap.xml");
    }

    return NextResponse.json({
      success: true,
      message: "On-demand revalidation and multi-layer cache purge completed successfully.",
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error during revalidation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Revalidation failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing secret token." },
      { status: 401 }
    );
  }

  const url = new URL(req.url);
  const path = url.searchParams.get("path");
  const slug = url.searchParams.get("slug");
  const tag = url.searchParams.get("tag");
  const all = url.searchParams.get("all") === "true";

  const revalidated: string[] = [];

  try {
    // 1. Always purge internal memory cache
    clearPostsMemoryCache();

    if (all) {
      clearNotionCache(); // Wipe all Notion block/list caches
      revalidatePath("/", "layout");
      revalidated.push("layout (entire site & all notion caches purged)");
    }

    if (slug) {
      const cleanSlug = slug.trim().replace(/^\/post\//, "");
      const post = await getPostBySlug(cleanSlug);
      
      // Purge disk cache for this post's blocks & list caches
      clearNotionCache(post?.id);

      const postPath = `/post/${cleanSlug}`;
      revalidatePath(postPath, "page");
      revalidatePath("/post/[slug]", "page");
      revalidatePath("/", "page");
      
      for (const catSlug of Object.values(CATEGORY_SLUGS)) {
        revalidatePath(`/${catSlug}`, "page");
      }

      revalidatePath("/sitemap.xml");
      revalidated.push(postPath, "/", "all category pages", "/sitemap.xml");
    }

    if (path) {
      const targetPath = path.trim();
      revalidatePath(targetPath, "page");
      revalidated.push(targetPath);
    }

    if (tag) {
      revalidateTag(tag.trim());
      revalidated.push(`tag: ${tag}`);
    }

    if (revalidated.length === 0) {
      clearNotionCache();
      revalidatePath("/", "page");
      revalidatePath("/sitemap.xml");
      revalidated.push("/", "/sitemap.xml");
    }

    return NextResponse.json({
      success: true,
      message: "On-demand revalidation and multi-layer cache purge completed successfully.",
      revalidated,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Error during GET revalidation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Revalidation failed",
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
