"use client";

import katex from "katex";
import type { NotionRichText } from "@/lib/notion";

const NOTION_COLOR_TO_CLASS: Record<string, string> = {
  default: "text-[#E0E0E0]",
  gray: "text-gray-400",
  brown: "text-amber-200",
  orange: "text-orange-400",
  yellow: "text-yellow-400",
  green: "text-green-400",
  blue: "text-cyan-400",
  purple: "text-purple-400",
  pink: "text-pink-400",
  red: "text-red-400",
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

/**
 * Renders Notion rich_text array with Cyberpunk theme:
 * Bold = white, Code = pink + dark bg, Underline = border (no <u>), Links = cyan + hover glow.
 * Math equations = KaTeX rendered HTML.
 */
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
              className="text-cyan-400 no-underline hover:text-cyan-300 hover:shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all"
            >
              {node}
            </a>
          );
        }
        if (ann.code) {
          node = (
            <code className="rounded bg-gray-800 px-1 font-mono text-pink-400">
              {node}
            </code>
          );
        }
        if (ann.bold) {
          node = <strong className="font-bold text-white">{node}</strong>;
        }
        if (ann.italic) {
          node = <em className="text-gray-400">{node}</em>;
        }
        if (ann.strikethrough) {
          node = <s>{node}</s>;
        }
        if (ann.underline || hadLiteralUnderline) {
          node = (
            <span className="border-b-2 border-cyan-500 decoration-transparent">
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
