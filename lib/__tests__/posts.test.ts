import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCategorySlug, getRelatedPosts, clearPostsMemoryCache } from "../posts";
import type { Post } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "post-1",
    name: "Test Post",
    slug: "test-post",
    category: "AI Insights",
    subCategory: null,
    summary: "A test post",
    aiSummary: null,
    tags: [],
    cover: null,
    publishedDate: "2025-01-01",
    featured: false,
    media: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests: getCategorySlug
// ---------------------------------------------------------------------------

describe("getCategorySlug", () => {
  it("returns the correct slug for each category", () => {
    const cases: Array<[Post["category"], string]> = [
      ["AI Insights",   "ai-insights"],
      ["Blockchain",    "blockchain"],
      ["Investing",     "investing"],
      ["Philosophy",    "philosophy"],
      ["Sheshin Notes", "sheshin-notes"],
    ];
    for (const [category, expectedSlug] of cases) {
      expect(getCategorySlug(category)).toBe(expectedSlug);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: getRelatedPosts
// Pure logic tested by mocking getPosts (the async data source).
// ---------------------------------------------------------------------------

// We mock the notion module so getPublishedPosts never fires a real HTTP request.
vi.mock("../notion", () => ({
  getPublishedPosts: vi.fn(),
  clearNotionCache: vi.fn(),
  fetchPostBySlugDirectlyFromNotion: vi.fn().mockResolvedValue(null),
}));

describe("getRelatedPosts", () => {
  // Reset in-memory cache before each test so mocked data is always fresh.
  beforeEach(() => {
    clearPostsMemoryCache();
  });

  const current = makePost({
    slug: "current",
    category: "AI Insights",
    tags: ["AI", "GPT"],
    publishedDate: "2025-06-01",
  });

  it("returns posts ranked by tag intersection (most tags first)", async () => {
    const { getPublishedPosts } = await import("../notion");
    (getPublishedPosts as ReturnType<typeof vi.fn>).mockResolvedValue([
      current,
      makePost({ slug: "a", tags: ["AI", "GPT"], publishedDate: "2025-05-01" }), // 2 tags
      makePost({ slug: "b", tags: ["AI"],         publishedDate: "2025-04-01" }), // 1 tag
      makePost({ slug: "c", tags: [],             publishedDate: "2025-03-01" }), // 0 tags
    ]);

    const related = await getRelatedPosts(current, 3);
    expect(related[0].slug).toBe("a"); // 2-tag match first
    expect(related[1].slug).toBe("b"); // 1-tag match second
  });

  it("falls back to same-category posts when tag matches are insufficient", async () => {
    const { getPublishedPosts } = await import("../notion");
    (getPublishedPosts as ReturnType<typeof vi.fn>).mockResolvedValue([
      current,
      makePost({ slug: "same-cat",   category: "AI Insights", tags: [], publishedDate: "2025-05-01" }),
      makePost({ slug: "other-cat",  category: "Blockchain",  tags: [], publishedDate: "2025-04-01" }),
    ]);

    const related = await getRelatedPosts(current, 3);
    // same-cat should appear before other-cat because it shares the category
    const slugs = related.map((p) => p.slug);
    expect(slugs.indexOf("same-cat")).toBeLessThan(slugs.indexOf("other-cat"));
  });

  it("never includes the current post in results", async () => {
    const { getPublishedPosts } = await import("../notion");
    (getPublishedPosts as ReturnType<typeof vi.fn>).mockResolvedValue([
      current,
      makePost({ slug: "other", tags: ["AI", "GPT"] }),
    ]);

    const related = await getRelatedPosts(current, 5);
    expect(related.map((p) => p.slug)).not.toContain("current");
  });

  it("respects the limit parameter", async () => {
    const { getPublishedPosts } = await import("../notion");
    (getPublishedPosts as ReturnType<typeof vi.fn>).mockResolvedValue([
      current,
      makePost({ slug: "p1", tags: ["AI"] }),
      makePost({ slug: "p2", tags: ["AI"] }),
      makePost({ slug: "p3", tags: ["AI"] }),
      makePost({ slug: "p4", tags: ["AI"] }),
    ]);

    const related = await getRelatedPosts(current, 2);
    expect(related).toHaveLength(2);
  });

  it("sorts same-intersection posts by publishedDate descending", async () => {
    const { getPublishedPosts } = await import("../notion");
    (getPublishedPosts as ReturnType<typeof vi.fn>).mockResolvedValue([
      current,
      makePost({ slug: "older", tags: ["AI"], publishedDate: "2024-01-01" }),
      makePost({ slug: "newer", tags: ["AI"], publishedDate: "2025-05-01" }),
    ]);

    const related = await getRelatedPosts(current, 3);
    expect(related[0].slug).toBe("newer");
    expect(related[1].slug).toBe("older");
  });

  it("returns empty array when there are no other posts", async () => {
    const { getPublishedPosts } = await import("../notion");
    (getPublishedPosts as ReturnType<typeof vi.fn>).mockResolvedValue([current]);

    const related = await getRelatedPosts(current, 3);
    expect(related).toHaveLength(0);
  });
});
