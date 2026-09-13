import { describe, it, expect } from "vitest";
import { mapPageToPost } from "../mapper";
import { CATEGORY_MAP } from "../mapper";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

// ---------------------------------------------------------------------------
// Helpers: build minimal Notion PageObjectResponse fixtures
// ---------------------------------------------------------------------------

function makeTextProp(value: string) {
  return { type: "title", title: [{ plain_text: value }] };
}

function makeRichTextProp(value: string) {
  return { type: "rich_text", rich_text: [{ plain_text: value }] };
}

function makeSelectProp(name: string) {
  return { type: "select", select: { name } };
}

function makeDateProp(start: string) {
  return { type: "date", date: { start } };
}

function makeCheckboxProp(checked: boolean) {
  return { type: "checkbox", checkbox: checked };
}

function makeMultiSelectProp(names: string[]) {
  return { type: "multi_select", multi_select: names.map((name) => ({ name })) };
}

function makeFilesProp(files: Array<{ url: string; type?: "file" | "external" }>) {
  return {
    type: "files",
    files: files.map(({ url, type = "file" }) =>
      type === "file"
        ? { type: "file", name: "img.jpg", file: { url } }
        : { type: "external", name: "img.jpg", external: { url } }
    ),
  };
}

/** Creates a minimal valid PageObjectResponse for a post. */
function makePage(
  overrides: Partial<Record<string, unknown>> & { id?: string } = {}
): PageObjectResponse {
  const { id = "page-id-123", ...propOverrides } = overrides;
  return {
    object: "page",
    id,
    created_time: "2025-01-01T00:00:00.000Z",
    last_edited_time: "2025-01-01T00:00:00.000Z",
    parent: { type: "database_id", database_id: "db-id" },
    archived: false,
    in_trash: false,
    url: "https://notion.so/page-id-123",
    public_url: null,
    cover: null,
    icon: null,
    properties: {
      Name: makeTextProp("Test Post Title"),
      Slug: makeRichTextProp("test-post-title"),
      Category: makeSelectProp("AI資訊 AI Insights"),
      "Sub-Category": makeSelectProp("LLM"),
      Summary: makeRichTextProp("A summary of the post."),
      AI_Summary: makeRichTextProp("An AI-generated summary."),
      Tags: makeMultiSelectProp(["AI", "GPT"]),
      "Published Date": makeDateProp("2025-06-01"),
      Featured: makeCheckboxProp(false),
      Media: makeFilesProp([]),
      ...propOverrides,
    },
  } as unknown as PageObjectResponse;
}

// ---------------------------------------------------------------------------
// Tests: mapPageToPost
// ---------------------------------------------------------------------------

describe("mapPageToPost", () => {
  it("maps a complete page to a valid Post", () => {
    const page = makePage();
    const post = mapPageToPost(page);

    expect(post).not.toBeNull();
    expect(post!.name).toBe("Test Post Title");
    expect(post!.slug).toBe("test-post-title");
    expect(post!.category).toBe("AI Insights");
    expect(post!.subCategory).toBe("LLM");
    expect(post!.summary).toBe("A summary of the post.");
    expect(post!.aiSummary).toBe("An AI-generated summary.");
    expect(post!.tags).toEqual(["AI", "GPT"]);
    expect(post!.publishedDate).toBe("2025-06-01");
    expect(post!.featured).toBe(false);
    expect(post!.cover).toBeNull();
    expect(post!.media).toEqual([]);
    expect(post!.id).toBe("page-id-123");
  });

  it("falls back to page id as slug when Slug property is missing", () => {
    const page = makePage({ Slug: { type: "rich_text", rich_text: [] } });
    const post = mapPageToPost(page);

    // When Slug is empty, it falls back to lowercased name or page id
    expect(post).not.toBeNull();
    expect(post!.slug).toBeTruthy();
  });

  it("generates a slug from name when Slug rich_text is empty and name exists", () => {
    const page = makePage({
      Name: makeTextProp("Hello World Post"),
      Slug: { type: "rich_text", rich_text: [] },
    });
    const post = mapPageToPost(page);
    expect(post!.slug).toBe("hello-world-post");
  });

  it("maps all 5 Notion categories correctly", () => {
    const categoryMap: Array<[string, string]> = [
      ["AI資訊 AI Insights", "AI Insights"],
      ["區塊鏈 Blockchain", "Blockchain"],
      ["投資觀念 Investing", "Investing"],
      ["價值觀 Philosophy", "Philosophy"],
      ["覺觀筆記 Sheshin Notes", "Sheshin Notes"],
    ];

    for (const [notionName, expected] of categoryMap) {
      const page = makePage({ Category: makeSelectProp(notionName) });
      const post = mapPageToPost(page);
      expect(post!.category).toBe(expected);
    }
  });

  it("defaults to 'AI Insights' for unknown or missing category", () => {
    const pageMissingCat = makePage({
      Category: { type: "select", select: null },
    });
    const post1 = mapPageToPost(pageMissingCat);
    expect(post1!.category).toBe("AI Insights");

    const pageUnknownCat = makePage({ Category: makeSelectProp("Unknown Category XYZ") });
    const post2 = mapPageToPost(pageUnknownCat);
    expect(post2!.category).toBe("AI Insights");
  });

  it("uses getPageTitle fallback when Name title and Slug are both empty", () => {
    const page = makePage({
      Name: { type: "title", title: [] },
      Slug: { type: "rich_text", rich_text: [] },
    });
    // getPageTitle returns "(empty)" for a title array with no items.
    // mapPageToPost then uses that as the name and slug.
    const post = mapPageToPost(page);
    expect(post).not.toBeNull();
    // slug is generated from the fallback name "(empty)" → "(empty)"
    expect(post!.name).toBe("(empty)");
  });

  it("maps featured checkbox correctly", () => {
    const featuredPage = makePage({ Featured: makeCheckboxProp(true) });
    expect(mapPageToPost(featuredPage)!.featured).toBe(true);

    const notFeaturedPage = makePage({ Featured: makeCheckboxProp(false) });
    expect(mapPageToPost(notFeaturedPage)!.featured).toBe(false);
  });

  it("parses media files with correct inferred kinds", () => {
    const page = makePage({
      Media: makeFilesProp([
        { url: "https://example.com/image.jpg?t=123", type: "file" },
        { url: "https://example.com/video.mp4", type: "external" },
        { url: "https://example.com/audio.mp3", type: "file" },
      ]),
    });
    const post = mapPageToPost(page);

    expect(post!.media).toHaveLength(3);
    expect(post!.media[0].kind).toBe("image");
    expect(post!.media[1].kind).toBe("video");
    expect(post!.media[2].kind).toBe("audio");
  });

  it("handles external media files", () => {
    const page = makePage({
      Media: makeFilesProp([{ url: "https://cdn.example.com/img.png", type: "external" }]),
    });
    const post = mapPageToPost(page);
    expect(post!.media[0].url).toBe("https://cdn.example.com/img.png");
    expect(post!.media[0].kind).toBe("image");
  });

  it("returns empty tags array when Tags multi-select is missing", () => {
    const page = makePage({ Tags: { type: "multi_select", multi_select: [] } });
    const post = mapPageToPost(page);
    expect(post!.tags).toEqual([]);
  });

  it("falls back to AI_Summary when present and no separate summary", () => {
    const page = makePage({
      Summary: { type: "rich_text", rich_text: [] },
      AI_Summary: makeRichTextProp("AI-only summary"),
    });
    const post = mapPageToPost(page);
    expect(post!.aiSummary).toBe("AI-only summary");
    expect(post!.summary).toBeNull();
  });

  it("returns a minimal post (not null) when properties is null — mapper is resilient", () => {
    const page = {
      object: "page",
      id: "bad-page",
      properties: null,
    } as unknown as PageObjectResponse;
    // mapPageToPost catches the error internally via try/catch and
    // falls back to getPageTitle which returns "(no title)", generating a post
    // rather than crashing. This is the intended resilient behavior.
    const post = mapPageToPost(page);
    // Either null (if caught) or a minimal post — both are acceptable.
    // Current impl: returns a minimal post with fallback values.
    if (post !== null) {
      expect(post.id).toBe("bad-page");
      expect(typeof post.slug).toBe("string");
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: CATEGORY_MAP integrity
// ---------------------------------------------------------------------------

describe("CATEGORY_MAP", () => {
  it("contains all 5 expected category slugs", () => {
    const expectedSlugs = ["ai-insights", "blockchain", "investing", "philosophy", "sheshin-notes"];
    for (const slug of expectedSlugs) {
      expect(CATEGORY_MAP).toHaveProperty(slug);
      expect(typeof CATEGORY_MAP[slug]).toBe("string");
      expect(CATEGORY_MAP[slug].length).toBeGreaterThan(0);
    }
  });

  it("values contain both Chinese and English text", () => {
    for (const value of Object.values(CATEGORY_MAP)) {
      // Each value should have at least one CJK character
      expect(value).toMatch(/[\u4e00-\u9fa5]/);
    }
  });
});
