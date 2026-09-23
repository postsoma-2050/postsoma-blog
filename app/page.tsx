import type { Metadata } from "next";
import HeroSearch from "@/components/HeroSearch";
import HorizontalRail from "@/components/HorizontalRail";
import CuratedPostList from "@/components/CuratedPostList";
import PortalCell from "@/components/bento/PortalCell";
import { getPublishedPosts } from "@/lib/notion";

export const revalidate = 604800; // 7 days fallback, rely primarily on On-Demand ISR Webhook

export const metadata: Metadata = {
  title: "PostSoma 2050 | Cyberpunk-Humanist Knowledge Garden",
  description:
    "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
  alternates: {
    canonical: "https://www.postsoma-2050.com",
  },
  openGraph: {
    type: "website",
    siteName: "PostSoma 2050",
    title: "PostSoma 2050 | Cyberpunk-Humanist Knowledge Garden",
    description:
      "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
    url: "https://www.postsoma-2050.com",
    locale: "zh_TW",
    images: [
      {
        url: "https://www.postsoma-2050.com/og-image.png",
        secureUrl: "https://www.postsoma-2050.com/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "PostSoma 2050 — Cyberpunk-Humanist Knowledge Garden",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostSoma 2050 | Cyberpunk-Humanist Knowledge Garden",
    description:
      "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
    images: ["https://www.postsoma-2050.com/og-image.png"],
  },
};

const homeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Blog",
  "@id": "https://www.postsoma-2050.com/#blog",
  "name": "PostSoma 2050",
  "url": "https://www.postsoma-2050.com",
  "description": "Cyberpunk-Humanist Knowledge Garden. High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
  "publisher": {
    "@type": "Organization",
    "name": "PostSoma 2050",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.postsoma-2050.com/logo.png"
    }
  },
  "author": {
    "@type": "Person",
    "name": "postsoma-2050",
    "url": "https://www.postsoma-2050.com/about"
  }
};

/**
 * Deterministically samples `count` elements from `pool` using the current UTC date as seed.
 * Guarantees zero SSR hydration mismatch while ensuring fresh daily serendipitous discovery.
 */
function getDailySample<T>(pool: T[], count: number = 6): T[] {
  if (pool.length <= count) return pool;
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}-${now.getUTCMonth() + 1}-${now.getUTCDate()}`;
  let seed = 0;
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed << 5) - seed + dateStr.charCodeAt(i);
    seed |= 0;
  }
  let s = Math.abs(seed) || 1234567;
  const copy = [...pool];
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = Math.floor(((s - 1) / 2147483646) * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export default async function HomePage() {
  const posts = await getPublishedPosts();
  
  // Sort strictly by published date descending (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    const timeA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
    const timeB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
    return timeB - timeA;
  });

  // 1. Top Horizontal Rail: Exclusively the 8 latest transmissions
  const latestPosts = sortedPosts.slice(0, 8);

  // 2. Bottom Random Flow: Candidate archive pool strictly excluding the 8 latest
  const archivePool = sortedPosts.length > 8 ? sortedPosts.slice(8) : sortedPosts;

  // Deterministically sample 6 random nodes for initial SSR load based on date seed
  const initialRandomPosts = getDailySample(archivePool, 6);

  return (
    <div className="space-y-16 sm:space-y-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* ── 1. Hero 终端检索 ──────────────────────────────────────────────── */}
      <HeroSearch postCount={posts.length} />

      {/* ── 2. 横向滑动精选轨道（严格 8 篇最新节点，100ms 物理抬升） ──────── */}
      <HorizontalRail posts={latestPosts} title="Latest Transmissions" />

      {/* ── 3. 随机探索文章流（排除最新 8 篇，严格 6 篇，支持一键洗牌） ─────── */}
      <CuratedPostList
        posts={archivePool}
        initialPosts={initialRandomPosts}
        totalCount={posts.length}
      />

      {/* ── 4. 底部系统外链入口 ───────────────────────────────────────────── */}
      <section aria-label="Portals">
        <PortalCell />
      </section>
    </div>
  );
}
