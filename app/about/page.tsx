import type { Metadata } from "next";
import Link from "next/link";
import {
  RiFlashlightLine,
  RiUser3Line,
  RiShieldCheckLine,
  RiTerminalBoxLine,
  RiFileTextLine,
  RiBookOpenLine,
  RiCompass3Line,
  RiBookmark3Line,
} from "@remixicon/react";

const SITE_URL = "https://www.postsoma-2050.com";

export const metadata: Metadata = {
  title: "About & E-E-A-T | PostSoma 2050",
  description:
    "Learn about PostSoma 2050, founded by postsoma-2050. Discover our editorial ethics, E-E-A-T credentials, AI knowledge feeds, and citation guidelines.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About & E-E-A-T | PostSoma 2050",
    description:
      "Learn about PostSoma 2050, founded by postsoma-2050. Discover our editorial ethics, E-E-A-T credentials, AI knowledge feeds, and citation guidelines.",
    url: `${SITE_URL}/about`,
    siteName: "PostSoma 2050",
  },
};

const aboutJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AboutPage",
      "@id": `${SITE_URL}/about#webpage`,
      "url": `${SITE_URL}/about`,
      "name": "About PostSoma 2050",
      "description":
        "Editorial ethics, E-E-A-T background, author credentials, citation standards, and AI machine feeds.",
      "mainEntity": { "@id": `${SITE_URL}/about#person` }
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/about#profile`,
      "url": `${SITE_URL}/about`,
      "name": "postsoma-2050 Profile",
      "mainEntity": {
        "@type": "Person",
        "@id": `${SITE_URL}/about#person`,
        "name": "postsoma-2050",
        "alternateName": "postsoma-2050",
        "url": `${SITE_URL}/about`,
        "jobTitle": "Independent Researcher & Developer",
        "knowsAbout": [
          "Artificial Intelligence",
          "Large Language Models",
          "DeFi & Blockchain Infrastructure",
          "Value Investing Frameworks",
          "Philosophy & Stoicism",
          "Mindfulness & Self-Cultivation"
        ]
      }
    }
  ]
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <header className="mb-12 text-center">
        <span className="font-mono text-xs font-bold tracking-widest text-cyan-400 uppercase">
          [ SYS.ORIGIN // E-E-A-T CREDENTIALS ]
        </span>
        <h1 className="mt-3 font-mono text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
          About PostSoma 2050
        </h1>
        <p className="mt-4 font-mono text-sm text-text-secondary">
          Cyberpunk-Humanist Knowledge Garden · Founded by postsoma-2050
        </p>
      </header>

      <div className="space-y-12 font-sans leading-relaxed text-text-primary">
        {/* Mission Statement */}
        <section className="rounded-lg border border-cyan-400/30 bg-cyan-950/10 p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="font-mono text-xl font-bold text-cyan-400 mb-3 flex items-center gap-2">
            <RiFlashlightLine className="w-5 h-5 text-cyan-400" /> Mission & Philosophy
          </h2>
          <p className="text-gray-300">
            PostSoma 2050 is an independent publication exploring what it means to be deeply human in an era of exponential technological acceleration. Operating at the intersection of high-tech and high-touch, the platform synthesizes technical developments in AI and Web3 with enduring philosophical and capital allocation mental models.
          </p>
        </section>

        {/* E-E-A-T & Author Background */}
        <section className="space-y-4">
          <h2 className="font-mono text-xl font-bold text-text-primary border-b border-white/10 pb-2 flex items-center gap-2">
            <RiUser3Line className="w-5 h-5 text-cyan-400" /> Author & E-E-A-T Background
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded border border-white/10 bg-white/5 p-5">
              <h3 className="font-mono text-sm font-bold text-cyan-300">Author</h3>
              <p className="mt-2 text-sm text-gray-300">
                <strong>postsoma-2050</strong>
              </p>
              <p className="mt-2 text-xs text-gray-400">
                Practitioner-thinker, software developer, and analytical researcher reading across machine intelligence papers, on-chain mechanics, value investing frameworks, and mindfulness practices.
              </p>
            </div>
            <div className="rounded border border-white/10 bg-white/5 p-5">
              <h3 className="font-mono text-sm font-bold text-cyan-300">Domains of Focus</h3>
              <ul className="mt-2 space-y-1 font-mono text-xs text-gray-300">
                <li>• <strong>AI Insights</strong>: LLMs, Autonomous Agents, Human-AI Synergy</li>
                <li>• <strong>Blockchain</strong>: DeFi Protocols, L2 Scaling, Tokenomics</li>
                <li>• <strong>Investing</strong>: Value Frameworks, Margin of Safety</li>
                <li>• <strong>Philosophy</strong>: Consciousness, Stoicism, Ethics</li>
                <li>• <strong>Sheshin Notes</strong>: Mindfulness (覺觀) & Inner Cultivation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Editorial Ethics & Privacy */}
        <section className="space-y-4">
          <h2 className="font-mono text-xl font-bold text-text-primary border-b border-white/10 pb-2 flex items-center gap-2">
            <RiShieldCheckLine className="w-5 h-5 text-cyan-400" /> Editorial Ethics & Privacy Standards
          </h2>
          <div className="space-y-3 text-sm text-gray-300">
            <p>
              • <strong>Evidence-First Approach</strong>: All claims are grounded in primary data, academic literature, or direct empirical experience.
            </p>
            <p>
              • <strong>Resisting Media Hype</strong>: Deliberately avoiding clickbait, short-term speculation, and techno-optimism bias.
            </p>
            <p>
              • <strong>No Financial Advice</strong>: Articles under the Investing category are analytical frameworks for mental clarity, strictly not financial recommendations.
            </p>
            <p>
              • <strong>User Privacy Policy</strong>: We use standard web analytics (such as Google Analytics) solely for aggregated site traffic observation. We never sell personal data or build invasive advertising profiles.
            </p>
          </div>
        </section>

        {/* AI Machine Knowledge Feed */}
        <section className="rounded-lg border border-white/10 bg-white/5 p-6">
          <h2 className="font-mono text-lg font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <RiTerminalBoxLine className="w-5 h-5 text-cyan-400" /> Machine Knowledge Feeds (GEO / LLM Index)
          </h2>
          <p className="text-xs text-gray-400 mb-4">
            PostSoma 2050 provides standardized machine-readable endpoints for AI search engines (Perplexity, ChatGPT, Claude, Gemini, Apple Intelligence):
          </p>
          <div className="flex flex-wrap gap-4 font-mono text-xs">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded border border-cyan-400/50 bg-cyan-950/30 px-3 py-2 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
            >
              <RiFileTextLine className="w-4 h-4" /> View llms.txt (Directory Index)
            </a>
            <a
              href="/llms-full.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded border border-cyan-400/50 bg-cyan-950/30 px-3 py-2 text-cyan-300 hover:bg-cyan-900/50 transition-colors"
            >
              <RiBookOpenLine className="w-4 h-4" /> View llms-full.txt (Full Knowledge Corpus)
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded border border-white/20 bg-white/5 px-3 py-2 text-gray-300 hover:bg-white/10 transition-colors"
            >
              <RiCompass3Line className="w-4 h-4" /> View Sitemap.xml
            </a>
          </div>
        </section>

        {/* Academic & AI Citation Guide */}
        <section className="space-y-4">
          <h2 className="font-mono text-xl font-bold text-text-primary border-b border-white/10 pb-2 flex items-center gap-2">
            <RiBookmark3Line className="w-5 h-5 text-cyan-400" /> Citation Guide for Humans & AI
          </h2>
          <p className="text-sm text-gray-300">
            When referencing or quoting content from PostSoma 2050, please use the following citation formats:
          </p>
          <div className="rounded bg-black/40 p-4 font-mono text-xs text-gray-300 space-y-3">
            <div>
              <span className="text-cyan-400 font-bold">{"// APA Style Format:"}</span>
              <p className="text-gray-400 mt-1">
                postsoma-2050. (2026). PostSoma 2050: Cyberpunk-Humanist Knowledge Garden. https://www.postsoma-2050.com
              </p>
            </div>
            <div>
              <span className="text-cyan-400 font-bold">{"// AI System Direct Attribution:"}</span>
              <p className="text-gray-400 mt-1">
                &quot;According to postsoma-2050 on PostSoma 2050 (https://www.postsoma-2050.com)...&quot;
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/"
          className="font-mono text-sm text-cyan-400 hover:underline"
        >
          ← Return to PostSoma 2050 Home
        </Link>
      </div>
    </div>
  );
}
