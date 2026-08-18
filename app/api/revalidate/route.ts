import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { CATEGORY_SLUGS } from "@/lib/design-tokens";

/**
 * On-Demand ISR Revalidation API Endpoint
 * 
 * Supports:
 * 1. POST /api/revalidate (Webhook / automation)
 * 2. GET /api/revalidate?secret=...&path=... (Manual verification in browser)
 * 
 * Headers or Query / Body supported for authentication:
 * - Authorization: Bearer <REVALIDATION_SECRET>
 * - x-revalidation-secret: <REVALIDATION_SECRET>
 * - Query param: ?secret=<REVALIDATION_SECRET>
 * - Body field: { "secret": "<REVALIDATION_SECRET>" }
 */

function authenticate(req: NextRequest, bodySecret?: string): boolean {
  const secretEnv = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET;
  if (!secretEnv) {
    console.error("❌ REVALIDATION_SECRET is not set in environment variables!");
    return false;
  }

  // 1. Check Bearer token in Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token === secretEnv) return true;
  }

  // 2. Check custom header
  const customHeader = req.headers.get("x-revalidation-secret");
  if (customHeader && customHeader.trim() === secretEnv) {
    return true;
  }

  // 3. Check query param
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret && querySecret.trim() === secretEnv) {
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
    // Body is optional or might not be JSON
  }

  if (!authenticate(req, body?.secret)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing revalidation secret token." },
      { status: 401 }
    );
  }

  const revalidated: string[] = [];

  try {
    // 1. Revalidate all / layout
    if (body.all === true || body.type === "layout") {
      revalidatePath("/", "layout");
      revalidated.push("layout (entire site)");
    }

    // 2. Revalidate by specific slug
    if (body.slug && typeof body.slug === "string") {
      const slug = body.slug.trim().replace(/^\/post\//, "");
      const postPath = `/post/${slug}`;
      revalidatePath(postPath, "page");
      revalidated.push(postPath);

      // Revalidate homepage as latest posts might change
      revalidatePath("/", "page");
      revalidated.push("/");

      // Revalidate category page if provided, or revalidate all category pages
      if (body.category && typeof body.category === "string") {
        const catSlug = body.category.trim().replace(/^\//, "");
        const catPath = `/${catSlug}`;
        revalidatePath(catPath, "page");
        revalidated.push(catPath);
      } else {
        // Automatically revalidate known category paths
        for (const slug of Object.values(CATEGORY_SLUGS)) {
          revalidatePath(`/${slug}`, "page");
        }
        revalidated.push("all category pages");
      }

      // Revalidate sitemap
      revalidatePath("/sitemap.xml");
      revalidated.push("/sitemap.xml");
    }

    // 3. Revalidate by explicit path
    if (body.path && typeof body.path === "string") {
      const targetPath = body.path.trim();
      const type = body.pathType === "layout" ? "layout" : "page";
      revalidatePath(targetPath, type);
      revalidated.push(`${targetPath} (${type})`);
    }

    // 4. Revalidate by cache tag
    if (body.tag && typeof body.tag === "string") {
      revalidateTag(body.tag.trim());
      revalidated.push(`tag: ${body.tag}`);
    }

    // If no specific options were given, revalidate homepage and sitemap by default
    if (revalidated.length === 0) {
      revalidatePath("/", "page");
      revalidatePath("/sitemap.xml");
      revalidated.push("/", "/sitemap.xml");
    }

    return NextResponse.json({
      success: true,
      message: "On-demand revalidation completed successfully.",
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
    if (all) {
      revalidatePath("/", "layout");
      revalidated.push("layout (entire site)");
    }

    if (slug) {
      const cleanSlug = slug.trim().replace(/^\/post\//, "");
      const postPath = `/post/${cleanSlug}`;
      revalidatePath(postPath, "page");
      revalidatePath("/", "page");
      revalidatePath("/sitemap.xml");
      revalidated.push(postPath, "/", "/sitemap.xml");
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
      revalidatePath("/", "page");
      revalidatePath("/sitemap.xml");
      revalidated.push("/", "/sitemap.xml");
    }

    return NextResponse.json({
      success: true,
      message: "On-demand revalidation completed successfully.",
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
