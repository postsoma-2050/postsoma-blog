import { describe, it, expect } from "vitest";
import {
  estimateReadingTimeFromString,
  estimateReadingTimeFromBlocks,
  getHeadingsFromBlocks,
} from "../notion";
import type { NotionBlock } from "../notion";

// ---------------------------------------------------------------------------
// Helpers: build minimal NotionBlock fixtures
// ---------------------------------------------------------------------------

function makeBlock(
  type: string,
  text: string,
  overrides: Partial<NotionBlock> = {}
): NotionBlock {
  return {
    id: `block-${Math.random().toString(36).slice(2)}`,
    type,
    [type]: {
      rich_text: [{ text: { content: text } }],
    },
    ...overrides,
  };
}

function makeHeading(level: 1 | 2 | 3, text: string): NotionBlock {
  return makeBlock(`heading_${level}`, text);
}

function makeParagraph(text: string, children?: NotionBlock[]): NotionBlock {
  return {
    ...makeBlock("paragraph", text),
    children,
    has_children: !!children?.length,
  };
}

// ---------------------------------------------------------------------------
// Tests: estimateReadingTimeFromString
// ---------------------------------------------------------------------------

describe("estimateReadingTimeFromString", () => {
  it("returns 0 for empty string", () => {
    expect(estimateReadingTimeFromString("")).toBe(0);
  });

  it("returns at least 1 minute for any non-empty text", () => {
    expect(estimateReadingTimeFromString("hello")).toBeGreaterThanOrEqual(1);
  });

  it("estimates English reading time at ~200 words per minute", () => {
    // 200 English words → exactly 1 minute
    const words = Array(200).fill("word").join(" ");
    expect(estimateReadingTimeFromString(words)).toBe(1);

    // 400 words → 2 minutes
    const longWords = Array(400).fill("word").join(" ");
    expect(estimateReadingTimeFromString(longWords)).toBe(2);
  });

  it("estimates CJK reading time at ~500 characters per minute", () => {
    // 500 CJK chars → 1 minute
    const cjk500 = "字".repeat(500);
    expect(estimateReadingTimeFromString(cjk500)).toBe(1);

    // 1000 CJK chars → 2 minutes
    const cjk1000 = "字".repeat(1000);
    expect(estimateReadingTimeFromString(cjk1000)).toBe(2);
  });

  it("combines CJK and English reading time correctly", () => {
    const cjk500 = "字".repeat(500); // 1 min
    const eng200 = Array(200).fill("word").join(" "); // 1 min
    // Total: 2 minutes
    expect(estimateReadingTimeFromString(cjk500 + " " + eng200)).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Tests: estimateReadingTimeFromBlocks
// ---------------------------------------------------------------------------

describe("estimateReadingTimeFromBlocks", () => {
  it("returns 1 for a single short paragraph", () => {
    const blocks = [makeParagraph("Hello world")];
    expect(estimateReadingTimeFromBlocks(blocks)).toBeGreaterThanOrEqual(1);
  });

  it("accumulates text from all blocks", () => {
    // 400 words spread across multiple blocks → 2 minutes
    const halfWords = Array(200).fill("word").join(" ");
    const blocks = [makeParagraph(halfWords), makeParagraph(halfWords)];
    expect(estimateReadingTimeFromBlocks(blocks)).toBe(2);
  });

  it("traverses nested children blocks", () => {
    const childParagraph = makeParagraph(Array(200).fill("word").join(" "));
    const parentBlock = makeParagraph("short", [childParagraph]);
    // Parent text alone is < 1 min, but with child it crosses 1 min
    const result = estimateReadingTimeFromBlocks([parentBlock]);
    expect(result).toBeGreaterThanOrEqual(1);
  });

  it("returns 0 for empty blocks array", () => {
    expect(estimateReadingTimeFromBlocks([])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: getHeadingsFromBlocks
// ---------------------------------------------------------------------------

describe("getHeadingsFromBlocks", () => {
  it("returns empty array for blocks with no headings", () => {
    const blocks = [makeParagraph("Just a paragraph")];
    expect(getHeadingsFromBlocks(blocks)).toEqual([]);
  });

  it("extracts headings with correct levels", () => {
    const blocks = [
      makeHeading(1, "Chapter One"),
      makeParagraph("some text"),
      makeHeading(2, "Section 1.1"),
      makeHeading(3, "Subsection"),
    ];
    const headings = getHeadingsFromBlocks(blocks);

    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({ text: "Chapter One", level: 1 });
    expect(headings[1]).toMatchObject({ text: "Section 1.1", level: 2 });
    expect(headings[2]).toMatchObject({ text: "Subsection", level: 3 });
  });

  it("generates URL-safe slugs from heading text", () => {
    const blocks = [makeHeading(1, "Hello World!")];
    const headings = getHeadingsFromBlocks(blocks);
    // Slug should be lowercase, spaces → hyphens, special chars stripped
    expect(headings[0].slug).toBe("hello-world");
  });

  it("preserves CJK characters in slugs", () => {
    const blocks = [makeHeading(2, "人工智慧 AI")];
    const headings = getHeadingsFromBlocks(blocks);
    expect(headings[0].slug).toContain("人工智慧");
  });

  it("skips headings with empty text", () => {
    const blocks = [
      { ...makeHeading(1, ""), [("heading_1" as string)]: { rich_text: [] } },
      makeHeading(2, "Real Heading"),
    ];
    const headings = getHeadingsFromBlocks(blocks);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Real Heading");
  });

  it("extracts headings from nested children blocks", () => {
    const nestedHeading = makeHeading(2, "Nested Heading");
    const parentBlock = makeParagraph("parent", [nestedHeading]);
    const headings = getHeadingsFromBlocks([parentBlock]);
    expect(headings).toHaveLength(1);
    expect(headings[0].text).toBe("Nested Heading");
  });
});
