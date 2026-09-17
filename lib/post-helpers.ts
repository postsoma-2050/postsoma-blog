import type { Post } from "@/lib/posts";

export const SITE_URL = "https://www.postsoma-2050.com";

export function getArticleOgImage(post: Post): string {
  const firstImage = post.media.find((m) => m.kind === "image");
  const isFirstImageNotion =
    firstImage &&
    (firstImage.url.includes("amazonaws.com") ||
      firstImage.url.includes("notion.so") ||
      firstImage.url.includes("X-Amz-Expires"));
  return firstImage
    ? isFirstImageNotion && post.id
      ? `${SITE_URL}/api/image?pageId=${post.id}&mediaIndex=0`
      : firstImage.url
    : `${SITE_URL}/no-future.jpg`;
}

export function buildArticleJsonLd(
  post: Post,
  categorySlug: string,
  articleImage: string
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${SITE_URL}/post/${post.slug}#article`,
        url: `${SITE_URL}/post/${post.slug}`,
        headline: post.name,
        description: post.summary ?? `Read "${post.name}" on PostSoma 2050.`,
        datePublished: post.publishedDate ?? undefined,
        keywords: post.tags.length > 0 ? post.tags.join(", ") : undefined,
        author: {
          "@type": "Person",
          name: "postsoma-2050",
          url: `${SITE_URL}/about`,
        },
        publisher: {
          "@type": "Organization",
          name: "PostSoma 2050",
          url: SITE_URL,
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`,
          },
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": `${SITE_URL}/post/${post.slug}`,
        },
        image: articleImage,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: post.category,
            item: `${SITE_URL}/${categorySlug}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: post.name,
            item: `${SITE_URL}/post/${post.slug}`,
          },
        ],
      },
    ],
  };
}

export function getHeadingsFromMarkdown(markdown: string) {
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

export function preprocessUnderlineTags(md: string): string {
  return md.replace(
    /<u>([\s\S]*?)<\/u>/gi,
    '<span class="border-b-2 border-cyan-500">$1</span>'
  );
}
