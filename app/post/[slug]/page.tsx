import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeSlug from "rehype-slug";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { getPostBySlug, getRelatedPosts } from "@/lib/posts";
import {
  getPublishedPosts,
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
import PostHeader from "@/components/post/PostHeader";
import PostMediaGallery from "@/components/post/PostMediaGallery";

import {
  SITE_URL,
  getArticleOgImage,
  buildArticleJsonLd,
  getHeadingsFromMarkdown,
  preprocessUnderlineTags,
} from "@/lib/post-helpers";

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
  const ogImage = getArticleOgImage(post);

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

// Pre-render top 100 latest articles at build time to ensure instant 0.05s load time
// while keeping build resource consumption low. Remaining older articles are rendered on-demand.
export async function generateStaticParams() {
  try {
    const posts = await getPublishedPosts();
    return posts.slice(0, 100).map((post) => ({ slug: post.slug }));
  } catch (err) {
    console.warn("⚠️ Failed to pre-render static posts at build time:", err);
    return [];
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  // Parallelize block fetching and related posts fetching
  const [blocks, relatedPosts] = await Promise.all([
    post.id ? getPostBlocks(post.id) : Promise.resolve([]),
    getRelatedPosts(post, 6),
  ]);

  const useBlocks = blocks.length > 0;
  const markdown =
    !useBlocks && post.id ? await getPostMarkdown(post.id) : "";

  const headings = useBlocks
    ? getHeadingsFromBlocks(blocks)
    : getHeadingsFromMarkdown(markdown);

  const readingTime = useBlocks
    ? estimateReadingTimeFromBlocks(blocks)
    : estimateReadingTimeFromString(markdown);

  const accent = CATEGORY_ACCENTS[post.category];
  const categorySlug = CATEGORY_SLUGS[post.category];
  const articleImage = getArticleOgImage(post);
  const articleJsonLd = buildArticleJsonLd(post, categorySlug, articleImage);

  return (
    <div className="min-h-screen pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <TableOfContents headings={headings} />

      <div className="mx-auto max-w-[700px] px-4 sm:px-6 pt-6 sm:pt-14">
        <PostHeader
          post={post}
          categorySlug={categorySlug}
          readingTime={readingTime}
        />

        <PostMediaGallery
          media={post.media}
          postId={post.id}
          postName={post.name}
        />

        <AICard rawSummary={post.aiSummary ?? ""} readingTime={readingTime} />

        {useBlocks ? (
          <article>
            <NotionRenderer blocks={blocks} accent={accent} />
          </article>
        ) : markdown ? (
          <article className="prose prose-lg max-w-none prose-headings:font-mono prose-headings:text-[var(--text-primary)] prose-a:text-[var(--accent-ai)] hover:prose-a:opacity-80 prose-img:rounded-xl prose-img:mx-auto">
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
