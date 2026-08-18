import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { RiTimerLine, RiMusic2Line, RiAttachment2, RiArrowLeftLine } from "@remixicon/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import {
  getPostBlocks,
  getHeadingsFromBlocks,
  getPostMarkdown,
  estimateReadingTimeFromBlocks,
  estimateReadingTimeFromString,
} from "@/lib/notion";
import { CATEGORY_ACCENTS, CATEGORY_SLUGS } from "@/lib/design-tokens";
import TableOfContents from "@/components/TableOfContents";
import NotionRenderer from "@/components/NotionRenderer";
import AICard from "@/components/AICard";
import FurtherReadSection from "@/components/FurtherReadSection";

const SITE_URL = "https://www.postsoma-2050.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  const title = post.name;
  const description = post.summary ?? `Read "${post.name}" on PostSoma 2050.`;
  const canonicalUrl = `${SITE_URL}/post/${post.slug}`;
  const ogImage =
    post.media.find((m) => m.kind === "image")?.url ?? `${SITE_URL}/no-future.jpg`;

  return {
    title,
    description,
    keywords: post.tags.length > 0 ? post.tags : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      siteName: "PostSoma 2050",
      publishedTime: post.publishedDate ?? undefined,
      tags: post.tags.length > 0 ? post.tags : undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const revalidate = 604800; // 7 days fallback, rely primarily on On-Demand ISR Webhook
export const dynamicParams = true; // Allow on-demand ISR for slugs not pre-built

function getHeadingsFromMarkdown(markdown: string) {
  const headingLines = markdown.match(/^(#{1,3})\s+(.*)$/gm) || [];
  return headingLines.map((line) => {
    const level = line.match(/^(#{1,3})/)?.[0].length || 0;
    const text = line.replace(/^(#{1,3})\s+/, "");
    const slug = text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-\u4e00-\u9fa5]/g, "");
    return { text, level, slug };
  });
}

function preprocessUnderlineTags(md: string): string {
  return md.replace(
    /<u>([\s\S]*?)<\/u>/gi,
    '<span class="border-b-2 border-cyan-500">$1</span>'
  );
}

// Return empty array: skip pre-rendering all posts at build time.
// Pages are rendered on-demand (ISR) when first visited, then cached for `revalidate` seconds.
// This avoids hammering the Notion API with 280+ concurrent requests during Vercel SSG builds.
export async function generateStaticParams() {
  return [];
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const blocks = post.id ? await getPostBlocks(post.id) : [];
  const useBlocks = blocks.length > 0;
  const markdown =
    !useBlocks && post.id ? await getPostMarkdown(post.id) : "";

  const headings = useBlocks
    ? getHeadingsFromBlocks(blocks)
    : getHeadingsFromMarkdown(markdown);

  const readingTime = useBlocks
    ? estimateReadingTimeFromBlocks(blocks)
    : estimateReadingTimeFromString(markdown);

  const relatedPosts = await getRelatedPosts(post, 6);

  const accent = CATEGORY_ACCENTS[post.category];
  const categorySlug = CATEGORY_SLUGS[post.category];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/post/${post.slug}#article`,
        "url": `${SITE_URL}/post/${post.slug}`,
        "headline": post.name,
        "description": post.summary ?? `Read "${post.name}" on PostSoma 2050.`,
        "datePublished": post.publishedDate ?? undefined,
        "keywords": post.tags.length > 0 ? post.tags.join(", ") : undefined,
        "author": {
          "@type": "Person",
          "name": "postsoma-2050",
          "url": `${SITE_URL}/about`
        },
        "publisher": {
          "@type": "Organization",
          "name": "PostSoma 2050",
          "url": SITE_URL,
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": `${SITE_URL}/post/${post.slug}`
        },
        "image": post.media.find((m) => m.kind === "image")?.url ?? `${SITE_URL}/no-future.jpg`
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": SITE_URL
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": post.category,
            "item": `${SITE_URL}/${categorySlug}`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.name,
            "item": `${SITE_URL}/post/${post.slug}`
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <TableOfContents headings={headings} />

      <div className="mx-auto max-w-4xl px-0 sm:px-6 pt-6 sm:pt-12">
        <header className="mb-12 text-center">
          <Link
            href={`/${categorySlug}`}
            className="inline-flex items-center font-mono text-sm text-text-secondary hover:text-text-primary transition-colors"
            style={{ color: accent }}
          >
            <RiArrowLeftLine className="w-4 h-4 mr-1" />
            {post.category}
          </Link>
          <h1 className="mt-4 font-mono text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            {post.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2 font-mono text-sm text-text-secondary">
            {post.publishedDate && <time>{post.publishedDate}</time>}
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <RiTimerLine className="w-4 h-4 text-cyan-400" />
              {readingTime} min read / {readingTime} 分鐘
            </span>
            {post.tags.length > 0 && (
              <>
                <span>·</span>
                {post.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </>
            )}
          </div>
        </header>

        {/* Media section */}
        {post.media.length > 0 && (
          <section className="mb-10 mt-2 space-y-5">
            {post.media.map((item, idx) => {
              if (item.kind === "image") {
                return (
                  <div
                    key={idx}
                    className="relative w-full overflow-hidden rounded-lg"
                    style={{
                      border: "1px solid var(--border-subtle)",
                      boxShadow: "0 0 18px 2px rgba(0, 240, 255, 0.12)",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.url}
                      alt={item.name ?? "Post media"}
                      className="w-full h-auto rounded-lg"
                      loading="lazy"
                    />
                  </div>
                );
              }
              if (item.kind === "video") {
                return (
                  <div
                    key={idx}
                    className="overflow-hidden rounded-lg"
                    style={{ border: "1px solid var(--border-subtle)" }}
                  >
                    <video
                      src={item.url}
                      controls
                      preload="metadata"
                      className="w-full rounded-lg"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                );
              }
              if (item.kind === "audio") {
                return (
                  <div
                    key={idx}
                    className="rounded-lg px-4 py-3"
                    style={{
                      border: "1px solid var(--border-subtle)",
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    {item.name && (
                      <p className="mb-2 font-mono text-xs text-text-secondary flex items-center gap-1.5">
                        <RiMusic2Line className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{item.name}</span>
                      </p>
                    )}
                    <audio src={item.url} controls preload="metadata" className="w-full">
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                );
              }
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-4 py-3 font-mono text-sm text-text-secondary transition-colors hover:text-text-primary"
                  style={{
                    border: "1px solid var(--border-subtle)",
                    background: "rgba(255,255,255,0.03)",
                  }}
                >
                  <RiAttachment2 className="w-4 h-4 text-cyan-400" />
                  <span>{item.name ?? "Download file"}</span>
                </a>
              );
            })}
          </section>
        )}

        <AICard rawSummary={post.aiSummary ?? ""} readingTime={readingTime} />

        {useBlocks ? (
          <article>
            <NotionRenderer blocks={blocks} accent={accent} />
          </article>
        ) : markdown ? (
          <article className="prose prose-invert prose-lg max-w-none prose-headings:font-mono prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-lg prose-img:mx-auto">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex]}
              components={{
                a: ({ node, ...props }) => (
                  <a target="_blank" rel="noopener noreferrer" {...props} />
                ),
              }}
            >
              {preprocessUnderlineTags(markdown)}
            </ReactMarkdown>
          </article>
        ) : post.summary ? (
          <p className="text-text-secondary">{post.summary}</p>
        ) : (
          <p className="text-text-secondary">
            (Post body: connect Notion or add content.)
          </p>
        )}

        {/* Further Read Section */}
        {relatedPosts && relatedPosts.length > 0 && (
          <FurtherReadSection 
            initialRelatedPosts={relatedPosts} 
            currentPostSlug={post.slug} 
            accent={accent} 
          />
        )}
      </div>
    </div>
  );
}
