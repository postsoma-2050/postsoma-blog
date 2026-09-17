"use client";

import { useState, useCallback } from "react";
import { Copy, ChevronRight } from "lucide-react";
import katex from "katex";
import TextRenderer from "@/components/TextRenderer";
import type { NotionBlock, NotionRichText } from "@/lib/notion";

function getRichTextFromBlock(block: NotionBlock): NotionRichText[] {
  const key = block.type as keyof NotionBlock;
  const value = block[key];
  if (typeof value === "object" && value !== null && "rich_text" in value) {
    const rt = (value as { rich_text?: NotionRichText[] }).rich_text;
    return Array.isArray(rt) ? rt : [];
  }
  return [];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\u4e00-\u9fa5]/g, "");
}

type BlockRendererProps = {
  blocks: NotionBlock[];
  accent?: string;
};

export default function BlockRenderer({
  blocks,
  accent = "#00F0FF",
}: BlockRendererProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyCode = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  }, []);

  if (!blocks?.length) return null;

  const nodes: React.ReactNode[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];

    // Bulleted Lists
    if (block.type === "bulleted_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        items.push(blocks[i]);
        i++;
      }
      nodes.push(
        <ul
          key={block.id}
          className="mb-7 list-disc pl-6 space-y-2.5 text-[1.05rem] leading-[1.8] text-[var(--text-secondary)] font-sans"
        >
          {items.map((b) => (
            <li key={b.id} className="pl-1">
              <TextRenderer
                richText={
                  Array.isArray(b.bulleted_list_item?.rich_text)
                    ? b.bulleted_list_item!.rich_text!
                    : []
                }
              />
              {Array.isArray(b.children) && b.children.length > 0 && (
                <BlockRenderer blocks={b.children} accent={accent} />
              )}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered Lists
    if (block.type === "numbered_list_item") {
      const items: NotionBlock[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        items.push(blocks[i]);
        i++;
      }
      nodes.push(
        <ol
          key={block.id}
          className="mb-7 list-decimal pl-6 space-y-2.5 text-[1.05rem] leading-[1.8] text-[var(--text-secondary)] font-sans"
        >
          {items.map((b) => (
            <li key={b.id} className="pl-1">
              <TextRenderer
                richText={
                  Array.isArray(b.numbered_list_item?.rich_text)
                    ? b.numbered_list_item!.rich_text!
                    : []
                }
              />
              {Array.isArray(b.children) && b.children.length > 0 && (
                <BlockRenderer blocks={b.children} accent={accent} />
              )}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    const rich = getRichTextFromBlock(block);
    const children = block.children;

    switch (block.type) {
      // Paragraph
      case "paragraph":
        nodes.push(
          <p
            key={block.id}
            className="mb-7 text-[1.05rem] leading-[1.8] text-[var(--text-secondary)] font-sans"
          >
            <TextRenderer richText={rich} />
          </p>
        );
        break;

      // Headings
      case "heading_1":
      case "heading_2":
      case "heading_3": {
        const headingKey = block.type as "heading_1" | "heading_2" | "heading_3";
        const data = block[headingKey];
        const Tag = headingKey === "heading_1" ? "h1" : headingKey === "heading_2" ? "h2" : "h3";
        const headingRich =
          Array.isArray(data?.rich_text) && data!.rich_text!.length > 0
            ? data!.rich_text!
            : rich;
        const text = headingRich.map((r) => r.text?.content ?? "").join("").trim();
        const fontSize =
          headingKey === "heading_1"
            ? "text-3xl sm:text-4xl"
            : headingKey === "heading_2"
              ? "text-2xl sm:text-[1.75rem]"
              : "text-xl sm:text-[1.35rem]";
        const spacingClasses =
          headingKey === "heading_1"
            ? "mt-16 mb-5"
            : headingKey === "heading_2"
              ? "mt-14 mb-4"
              : "mt-10 mb-3";
        const isToggleable = !!(data && "is_toggleable" in data && (data as { is_toggleable?: boolean }).is_toggleable);

        if (isToggleable) {
          nodes.push(
            <details
              key={block.id}
              className={`group ${spacingClasses} rounded-xl border-l-2 border-[var(--border-default)] pl-4 open:bg-[var(--hover-highlight)] transition-all`}
            >
              <summary className="flex cursor-pointer list-none items-center py-2 [&::-webkit-details-marker]:hidden">
                <span className="mr-3 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-90" aria-hidden>
                  ▶
                </span>
                <Tag
                  className={`${fontSize} font-sans font-semibold tracking-tight text-[var(--text-primary)] m-0 inline-block`}
                  id={slugify(text) || undefined}
                >
                  <TextRenderer richText={headingRich} />
                </Tag>
              </summary>
              {Array.isArray(children) && children.length > 0 && (
                <div className="mt-2 space-y-4 border-l border-[var(--border-subtle)] pl-2 ml-1.5">
                  <BlockRenderer blocks={children} accent={accent} />
                </div>
              )}
            </details>
          );
        } else {
          nodes.push(
            <Tag
              key={block.id}
              id={slugify(text) || undefined}
              className={`${fontSize} ${spacingClasses} font-sans font-semibold tracking-tight text-[var(--text-primary)] scroll-mt-24`}
            >
              <TextRenderer richText={headingRich} />
            </Tag>
          );
        }
        break;
      }

      // To-do checklist
      case "to_do": {
        const checked = block.to_do?.checked ?? false;
        nodes.push(
          <div key={block.id} className="my-3.5 flex items-start gap-3">
            <span
              className="mt-1 h-5 w-5 shrink-0 rounded-md border-[0.5px] border-[var(--border-default)] bg-[var(--bg-surface)] flex items-center justify-center text-xs"
              aria-hidden
            >
              {checked && (
                <span className="text-[var(--accent-dot)] font-bold">✓</span>
              )}
            </span>
            <span
              className={`text-[1.02rem] leading-[1.7] ${
                checked
                  ? "text-[var(--text-muted)] line-through"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <TextRenderer richText={rich} />
            </span>
            {Array.isArray(children) && children.length > 0 && (
              <div className="ml-8 mt-2">
                <BlockRenderer blocks={children} accent={accent} />
              </div>
            )}
          </div>
        );
        break;
      }

      // Quote
      case "quote":
        nodes.push(
          <blockquote
            key={block.id}
            className="my-7 border-l-2 border-[var(--text-muted)] py-2.5 pl-5 italic text-[1.05rem] leading-[1.8] text-[var(--text-secondary)] bg-[var(--hover-highlight)] rounded-r-xl"
          >
            <TextRenderer richText={rich} />
          </blockquote>
        );
        break;

      // Callout
      case "callout":
        nodes.push(
          <div
            key={block.id}
            className="my-7 rounded-2xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 text-[1.02rem] leading-[1.7] text-[var(--text-secondary)] shadow-sm"
          >
            <TextRenderer richText={rich} />
            {Array.isArray(children) && children.length > 0 && (
              <div className="mt-3">
                <BlockRenderer blocks={children} accent={accent} />
              </div>
            )}
          </div>
        );
        break;

      // Toggle
      case "toggle":
        nodes.push(
          <details
            key={block.id}
            className="group my-5 rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden"
          >
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 font-mono text-sm text-[var(--text-primary)] hover:bg-[var(--hover-highlight)] transition-colors [&::-webkit-details-marker]:hidden">
              <ChevronRight
                className="h-4 w-4 shrink-0 transition-transform group-open:rotate-90 text-[var(--text-muted)]"
                aria-hidden
              />
              <TextRenderer richText={rich} />
            </summary>
            <div className="border-t border-[var(--border-subtle)] px-4 py-3 pl-8">
              {Array.isArray(children) && children.length > 0 ? (
                <BlockRenderer blocks={children} accent={accent} />
              ) : null}
            </div>
          </details>
        );
        break;

      // Code Block
      case "code": {
        const codeContent = block.code;
        const codeText = Array.isArray(codeContent?.rich_text)
          ? codeContent!.rich_text!
              .map((r) => r.text?.content ?? "")
              .join("")
          : "";
        const lang = codeContent?.language ?? "plaintext";
        nodes.push(
          <div key={block.id} className="my-7 rounded-xl overflow-hidden border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-2">
              <span className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
                {lang}
              </span>
              <button
                type="button"
                onClick={() => copyCode(block.id, codeText)}
                className="flex items-center gap-1.5 rounded px-2.5 py-1 font-mono text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-highlight)] transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {copiedId === block.id ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono text-[var(--text-primary)] bg-transparent">
              <code>{codeText}</code>
            </pre>
          </div>
        );
        break;
      }

      // Divider
      case "divider":
        nodes.push(
          <hr
            key={block.id}
            className="my-10 border-0 border-t-[0.5px] border-[var(--border-subtle)]"
          />
        );
        break;

      // Equation
      case "equation": {
        const expression = block.equation?.expression ?? "";
        let html = "";
        try {
          html = katex.renderToString(expression, {
            throwOnError: false,
            displayMode: true,
          });
        } catch {
          html = expression;
        }
        nodes.push(
          <div
            key={block.id}
            className="my-7 overflow-x-auto text-center py-2 text-[var(--text-primary)]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
        break;
      }

      // Table
      case "table": {
        const tableData = (block as { table?: { has_column_header?: boolean } }).table;
        const rows = block.children ?? [];

        nodes.push(
          <div
            key={block.id}
            className="my-8 w-full overflow-x-auto rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-sm"
          >
            <table className="w-full border-collapse font-sans text-sm">
              <tbody>
                {rows.map((rowBlock, rowIndex) => {
                  if (rowBlock.type !== "table_row") return null;
                  const rowData = (rowBlock as { table_row?: { cells?: NotionRichText[][] } }).table_row;
                  const cells = rowData?.cells ?? [];
                  const isHeaderRow = !!(tableData?.has_column_header && rowIndex === 0);

                  return (
                    <tr
                      key={rowBlock.id}
                      className={`border-b border-[var(--border-subtle)] last:border-b-0 ${
                        isHeaderRow
                          ? "bg-[var(--bg-raised)] font-semibold text-[var(--text-primary)]"
                          : "hover:bg-[var(--hover-highlight)] transition-colors text-[var(--text-secondary)]"
                      }`}
                    >
                      {cells.map((cell, cellIndex) => {
                        const CellTag = isHeaderRow ? "th" : "td";
                        const cellClasses = isHeaderRow
                          ? "px-4 py-3 text-left font-semibold text-[var(--text-primary)] whitespace-nowrap"
                          : "min-w-[120px] px-4 py-3 text-[var(--text-secondary)]";

                        return (
                          <CellTag key={`${rowBlock.id}-${cellIndex}`} className={cellClasses}>
                            <TextRenderer richText={Array.isArray(cell) ? cell : []} />
                          </CellTag>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        break;
      }

      // Image
      case "image": {
        const img = block.image;
        const rawUrl =
          img?.type === "file"
            ? img.file?.url
            : img?.type === "external"
              ? img.external?.url
              : null;

        const isNotionInternal =
          img?.type === "file" ||
          Boolean(
            rawUrl &&
              (rawUrl.includes("amazonaws.com") ||
                rawUrl.includes("notion.so") ||
                rawUrl.includes("X-Amz-Expires"))
          );

        // Route internal Notion files through persistent CDN caching proxy
        const url = isNotionInternal
          ? `/api/image?blockId=${block.id}`
          : rawUrl;

        const alt =
          (img?.caption ?? [])
            .map((c) => (c as NotionRichText).text?.content ?? "")
            .join("")
            .trim() || "Post image";

        if (url) {
          nodes.push(
            <div key={block.id} className="my-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={alt}
                loading="lazy"
                className="mx-auto rounded-xl border-[0.5px] border-[var(--border-subtle)] shadow-sm max-w-full h-auto"
              />
            </div>
          );
        }
        break;
      }

      default:
        if (rich.length > 0) {
          nodes.push(
            <p key={block.id} className="mb-7 text-[1.05rem] leading-[1.8] text-[var(--text-secondary)] font-sans">
              <TextRenderer richText={rich} />
            </p>
          );
        }
        if (Array.isArray(children) && children.length > 0) {
          nodes.push(
            <div key={`${block.id}-children`} className="ml-4">
              <BlockRenderer blocks={children} accent={accent} />
            </div>
          );
        }
    }
    i++;
  }

  return <>{nodes}</>;
}
