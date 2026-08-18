import Link from "next/link";
import HeroCell from "@/components/bento/HeroCell";
import PortalCell from "@/components/bento/PortalCell";
import LatestTransmissions from "@/components/LatestTransmissions";
import SignalNoise from "@/components/SignalNoise";
import { getPublishedPosts } from "@/lib/notion";

export const revalidate = 604800; // 7 days fallback, rely primarily on On-Demand ISR Webhook

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

export default async function HomePage() {
  const posts = await getPublishedPosts();
  
  // Sort strictly by published date descending (newest first)
  const sortedPosts = [...posts].sort((a, b) => {
    const timeA = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
    const timeB = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
    return timeB - timeA;
  });

  const latestPosts = sortedPosts.slice(0, 3);
  const latestSlugs = new Set(latestPosts.map((p) => p.slug));

  return (
    <div className="space-y-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <Link
        href="/sheshin-notes"
        className="group cursor-pointer block"
      >
        <div className="h-full flex flex-col justify-between rounded border border-cyan-400/70 animate-hero-heartbeat">
          <HeroCell asChild />
        </div>
      </Link>

      {/* ── LATEST_TRANSMISSIONS ─────────────────────────────────────────── */}
      <div className="mt-6">
        <LatestTransmissions latestPosts={latestPosts} />
      </div>

      {/* ── SIGNAL_NOISE ─────────────────────────────────────────────────── */}
      <div className="mt-6">
        <SignalNoise allPosts={posts} latestSlugs={latestSlugs} />
      </div>

      {/* ── PORTALS ──────────────────────────────────────────────────────── */}
      <section aria-label="Portals" className="mt-8">
        <div className="mb-3 flex items-center gap-3">
          <span className="font-mono text-xs font-bold tracking-widest text-text-secondary/40">
            {"[ \u2197 ]"}
          </span>
          <h2 className="font-mono text-sm font-bold uppercase tracking-widest text-text-primary">
            PORTALS
          </h2>
          <span className="font-mono text-xs text-text-secondary/50">
            {"// SYS.REDIRECT"}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent hidden sm:block" />
        </div>
        <PortalCell />
      </section>
    </div>
  );
}
