"use client";

import katex from "katex";
import type { NotionRichText } from "@/lib/notion";

const NOTION_COLOR_TO_CLASS: Record<string, string> = {
  default: "",
  gray: "text-stone-500 dark:text-stone-400",
  brown: "text-amber-800 dark:text-amber-200",
  orange: "text-orange-700 dark:text-orange-300",
  yellow: "text-amber-900 dark:text-yellow-200 font-medium",
  green: "text-emerald-800 dark:text-emerald-300",
  blue: "text-sky-800 dark:text-cyan-300",
  purple: "text-purple-800 dark:text-purple-300",
  pink: "text-rose-800 dark:text-pink-300",
  red: "text-red-700 dark:text-red-400",
};

type TextRendererProps = {
  richText: NotionRichText[];
};

function renderContentWithMath(content: string, isEquation: boolean): React.ReactNode {
  if (!content) return null;

  if (isEquation) {
    try {
      const html = katex.renderToString(content, {
        throwOnError: false,
        displayMode: false,
      });
      return <span className="inline-katex" dangerouslySetInnerHTML={{ __html: html }} />;
    } catch {
      return <span>{content}</span>;
    }
  }

  if (content.includes("$")) {
    const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^\$]+\$)/g);
    if (parts.length > 1) {
      return (
        <>
          {parts.map((part, idx) => {
            if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
              const expr = part.slice(2, -2);
              try {
                const html = katex.renderToString(expr, {
                  throwOnError: false,
                  displayMode: true,
                });
                return (
                  <span
                    key={idx}
                    className="block-katex my-2 text-center"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch {
                return <span key={idx}>{part}</span>;
              }
            } else if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
              const expr = part.slice(1, -1);
              try {
                const html = katex.renderToString(expr, {
                  throwOnError: false,
                  displayMode: false,
                });
                return (
                  <span
                    key={idx}
                    className="inline-katex"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              } catch {
                return <span key={idx}>{part}</span>;
              }
            }
            return <span key={idx}>{part}</span>;
          })}
        </>
      );
    }
  }

  return content;
}

export default function TextRenderer({ richText }: TextRendererProps) {
  if (!Array.isArray(richText) || richText.length === 0) return null;

  // Filter out standalone tag items (e.g. when Notion splits <u> and </u> into separate items)
  const filteredRichText = richText.filter((r) => {
    const isEquation = r.type === "equation" || Boolean(r.equation);
    const content = isEquation
      ? (r.equation?.expression ?? "").trim()
      : (r.text?.content ?? "").trim();
    return !/^<\/?u>$/i.test(content);
  });

  if (filteredRichText.length === 0) return null;

  return (
    <>
      {filteredRichText.map((r, i) => {
        const isEquation = r.type === "equation" || Boolean(r.equation);
        const rawContent = isEquation
          ? r.equation?.expression ?? ""
          : r.text?.content ?? "";

        const hadLiteralUnderline = !isEquation && /<u>|<\/u>/i.test(rawContent);
        const content = hadLiteralUnderline
          ? rawContent.replace(/<\/?u>/gi, "").trim()
          : rawContent;
        const link = r.text?.link?.url;
        const ann = r.annotations ?? {};
        const colorClass =
          ann.color && ann.color !== "default"
            ? NOTION_COLOR_TO_CLASS[ann.color] ?? ""
            : "";

        let node: React.ReactNode = renderContentWithMath(content, isEquation);

        if (link) {
          node = (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-ai)] underline decoration-[var(--accent-ai)]/40 underline-offset-4 hover:decoration-[var(--accent-ai)] transition-colors"
            >
              {node}
            </a>
          );
        }
        if (ann.code) {
          node = (
            <code className="rounded bg-[var(--hover-highlight)] px-1.5 py-0.5 font-mono text-[0.88em] text-[var(--text-primary)] border border-[var(--border-subtle)]">
              {node}
            </code>
          );
        }
        if (ann.bold) {
          node = <strong className="font-semibold text-[var(--text-primary)]">{node}</strong>;
        }
        if (ann.italic) {
          node = <em className="italic opacity-90">{node}</em>;
        }
        if (ann.strikethrough) {
          node = <s className="opacity-70">{node}</s>;
        }
        if (ann.underline || hadLiteralUnderline) {
          node = (
            <span className="underline underline-offset-4 decoration-[var(--border-default)]">
              {node}
            </span>
          );
        }
        if (colorClass && !ann.code) {
          node = <span className={colorClass}>{node}</span>;
        }

        return <span key={i}>{node}</span>;
      })}
    </>
  );
}
