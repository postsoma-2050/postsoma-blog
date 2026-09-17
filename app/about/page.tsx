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
    <div className="mx-auto max-w-[760px] px-4 py-10 sm:px-6 sm:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />

      <header className="mb-14 text-center">
        <span className="font-mono text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
          Origin · E-E-A-T Credentials
        </span>
        <h1 className="mt-3 font-sans text-3xl sm:text-4xl font-semibold tracking-tight text-[var(--text-primary)]">
          About PostSoma 2050
        </h1>
        <p className="mt-3 font-mono text-sm text-[var(--text-secondary)]">
          Cyberpunk-Humanist Knowledge Garden · Founded by postsoma-2050
        </p>
      </header>

      <div className="space-y-12 font-sans leading-relaxed text-[var(--text-primary)]">
        {/* Mission Statement */}
        <section className="rounded-2xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 sm:p-8 shadow-sm">
          <h2 className="font-sans text-xl font-semibold text-[var(--text-primary)] mb-3 flex items-center gap-2 tracking-tight">
            <RiFlashlightLine className="w-5 h-5 text-[var(--accent-dot)]" /> Mission &amp; Philosophy
          </h2>
          <p className="text-[var(--text-secondary)] leading-[1.8] text-[1.02rem]">
            PostSoma 2050 is an independent publication exploring what it means to be deeply human in an era of exponential technological acceleration. Operating at the intersection of high-tech and high-touch, the platform synthesizes technical developments in AI and Web3 with enduring philosophical and capital allocation mental models.
          </p>
        </section>

        {/* E-E-A-T & Author Background */}
        <section className="space-y-4">
          <h2 className="font-sans text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2 tracking-tight">
            <RiUser3Line className="w-5 h-5 text-[var(--accent-dot)]" /> Author &amp; E-E-A-T Background
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Author Profile</h3>
              <p className="mt-2 text-base font-semibold text-[var(--text-primary)]">
                postsoma-2050
              </p>
              <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Practitioner-thinker, software developer, and analytical researcher reading across machine intelligence papers, on-chain mechanics, value investing frameworks, and mindfulness practices.
              </p>
            </div>
            <div className="rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-sm">
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Domains of Focus</h3>
              <ul className="mt-2.5 space-y-1.5 font-sans text-xs sm:text-sm text-[var(--text-secondary)]">
                <li>• <strong className="text-[var(--text-primary)] font-medium">AI Insights</strong>: LLMs, Autonomous Agents, Human-AI Synergy</li>
                <li>• <strong className="text-[var(--text-primary)] font-medium">Blockchain</strong>: DeFi Protocols, L2 Scaling, Tokenomics</li>
                <li>• <strong className="text-[var(--text-primary)] font-medium">Investing</strong>: Value Frameworks, Margin of Safety</li>
                <li>• <strong className="text-[var(--text-primary)] font-medium">Philosophy</strong>: Consciousness, Stoicism, Ethics</li>
                <li>• <strong className="text-[var(--text-primary)] font-medium">Sheshin Notes</strong>: Mindfulness (覺觀) &amp; Inner Cultivation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Editorial Ethics & Privacy */}
        <section className="space-y-4">
          <h2 className="font-sans text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2 tracking-tight">
            <RiShieldCheckLine className="w-5 h-5 text-[var(--accent-dot)]" /> Editorial Ethics &amp; Privacy Standards
          </h2>
          <div className="space-y-3.5 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
            <p>
              • <strong className="text-[var(--text-primary)] font-medium">Evidence-First Approach</strong>: All claims are grounded in primary data, academic literature, or direct empirical experience.
            </p>
            <p>
              • <strong className="text-[var(--text-primary)] font-medium">Resisting Media Hype</strong>: Deliberately avoiding clickbait, short-term speculation, and techno-optimism bias.
            </p>
            <p>
              • <strong className="text-[var(--text-primary)] font-medium">No Financial Advice</strong>: Articles under the Investing category are analytical frameworks for mental clarity, strictly not financial recommendations.
            </p>
            <p>
              • <strong className="text-[var(--text-primary)] font-medium">User Privacy Policy</strong>: We use standard web analytics solely for aggregated site traffic observation. We never sell personal data or build invasive advertising profiles.
            </p>
          </div>
        </section>

        {/* AI Machine Knowledge Feed */}
        <section className="rounded-2xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-sm">
          <h2 className="font-sans text-lg font-semibold text-[var(--text-primary)] mb-2 flex items-center gap-2 tracking-tight">
            <RiTerminalBoxLine className="w-5 h-5 text-[var(--accent-dot)]" /> Machine Knowledge Feeds (GEO / LLM Index)
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">
            PostSoma 2050 provides standardized machine-readable endpoints for AI search engines (Perplexity, ChatGPT, Claude, Gemini, Apple Intelligence):
          </p>
          <div className="flex flex-wrap gap-3 font-mono text-xs">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3.5 py-2.5 text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--hover-highlight)] transition-colors shadow-sm"
            >
              <RiFileTextLine className="w-4 h-4 text-[var(--accent-dot)]" /> View llms.txt (Directory Index)
            </a>
            <a
              href="/llms-full.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3.5 py-2.5 text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--hover-highlight)] transition-colors shadow-sm"
            >
              <RiBookOpenLine className="w-4 h-4 text-[var(--accent-dot)]" /> View llms-full.txt (Full Corpus)
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-raised)] px-3.5 py-2.5 text-[var(--text-primary)] hover:border-[var(--border-default)] hover:bg-[var(--hover-highlight)] transition-colors shadow-sm"
            >
              <RiCompass3Line className="w-4 h-4 text-[var(--accent-dot)]" /> View Sitemap.xml
            </a>
          </div>
        </section>

        {/* Academic & AI Citation Guide */}
        <section className="space-y-4">
          <h2 className="font-sans text-xl font-semibold text-[var(--text-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center gap-2 tracking-tight">
            <RiBookmark3Line className="w-5 h-5 text-[var(--accent-dot)]" /> Citation Guide for Humans &amp; AI
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)]">
            When referencing or quoting content from PostSoma 2050, please use the following citation formats:
          </p>
          <div className="rounded-xl border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 font-mono text-xs text-[var(--text-secondary)] space-y-4 shadow-sm">
            <div>
              <span className="text-[var(--text-primary)] font-semibold">{"// APA Style Format:"}</span>
              <p className="text-[var(--text-secondary)] mt-1 select-all">
                postsoma-2050. (2026). PostSoma 2050: Cyberpunk-Humanist Knowledge Garden. https://www.postsoma-2050.com
              </p>
            </div>
            <div>
              <span className="text-[var(--text-primary)] font-semibold">{"// AI System Direct Attribution:"}</span>
              <p className="text-[var(--text-secondary)] mt-1 select-all">
                &quot;According to postsoma-2050 on PostSoma 2050 (https://www.postsoma-2050.com)...&quot;
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16 text-center">
        <Link
          href="/"
          className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          ← Return to PostSoma 2050 Home
        </Link>
      </div>
    </div>
  );
}
