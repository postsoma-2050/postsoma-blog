---
name: geo-seo-optimization
description: Standardized SEO (Search Engine Optimization) and GEO (Generative Engine Optimization) guidelines, schema templates, crawler rules, and E-E-A-T audit criteria for web applications.
---

# GEO & SEO Optimization Skill Guide

This skill defines the technical standards, Schema.org JSON-LD templates, AI crawler access rules, LLM knowledge feeding formats (`llms.txt`, `llms-full.txt`), and E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) guidelines for the **PostSoma 2050** ecosystem.

---

## 1. AI Crawler Access Control (`robots.txt` / `robots.ts`)

To ensure maximum visibility across AI search engines (Perplexity, ChatGPT, Claude, Apple Intelligence, Gemini), the project explicitly grants crawl permissions to primary AI web spiders.

### Allowed Bots
- `GPTBot` (OpenAI / ChatGPT)
- `PerplexityBot` (Perplexity AI)
- `ClaudeBot` & `anthropic-ai` (Anthropic / Claude)
- `Applebot-Extended` (Apple Intelligence)
- `Google-Extended` (Gemini / Google AI)
- `Amazonbot` (Amazon AI / Alexa)
- `Bytespider` (ByteDance AI)
- `CCBot` (Common Crawl)
- `Diffbot` (Diffbot Knowledge Graph)

### Rule Implementation
```typescript
import type { MetadataRoute } from "next";

const SITE_URL = "https://www.postsoma-2050.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
      {
        userAgent: [
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
          "Applebot-Extended",
          "Google-Extended",
          "Amazonbot",
          "Bytespider",
          "CCBot",
          "Diffbot",
        ],
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

---

## 2. LLM Machine Knowledge Feeding (`llms.txt` & `llms-full.txt`)

LLM crawlers perform low-latency text ingestion via standardized `llms.txt` and `llms-full.txt` files placed at the root of `public/`.

### Requirements
1. **`public/llms.txt`**: Concise Markdown directory index listing key domains, author information, category pages, E-E-A-T `/about` entry, and AI citation guidelines.
2. **`public/llms-full.txt`**: Full-text structured Markdown corpus detailing the entire PostSoma 2050 ecosystem, taxonomy, editorial principles, category deep dives, and machine navigation tree.

---

## 3. Schema.org JSON-LD Standardized Templates

### 3.1 Site-wide WebSite & Organization Schema (`app/layout.tsx`)
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.postsoma-2050.com/#website",
      "url": "https://www.postsoma-2050.com",
      "name": "PostSoma 2050",
      "description": "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
      "publisher": { "@id": "https://www.postsoma-2050.com/#organization" },
      "inLanguage": "zh-TW"
    },
    {
      "@type": "Organization",
      "@id": "https://www.postsoma-2050.com/#organization",
      "name": "PostSoma 2050",
      "url": "https://www.postsoma-2050.com",
      "logo": "https://www.postsoma-2050.com/logo.png",
      "founder": {
        "@type": "Person",
        "name": "postsoma-2050",
        "url": "https://www.postsoma-2050.com/about"
      }
    }
  ]
}
```

### 3.2 Article / BlogPosting Schema (`app/post/[slug]/page.tsx`)
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "Title",
  "description": "Summary",
  "url": "https://www.postsoma-2050.com/post/slug",
  "datePublished": "2026-07-29",
  "author": {
    "@type": "Person",
    "name": "James Wei",
    "url": "https://www.postsoma-2050.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "PostSoma 2050",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.postsoma-2050.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.postsoma-2050.com/post/slug"
  }
}
```

---

## 4. E-E-A-T Audit Checklist

- [x] **Author Profile**: Clear biographical background for postsoma-2050 on `/about`.
- [x] **Editorial & Privacy Ethics**: Explicit declaration of evidence-first, non-hyped writing and data privacy policy.
- [x] **Academic & AI Citation Guidelines**: Clear formats (APA, IEEE, AI Attribution) for LLM and human citation.
- [x] **Machine Feed Navigation**: Direct links to `llms.txt` and `llms-full.txt` in Footer and About page.

---

## 5. Technical Validation

1. **Canonical URLs**: Every page must output `<link rel="canonical" href="https://www.postsoma-2050.com/..." />`.
2. **Sitemap Matching**: All `<loc>` tags in `sitemap.xml` must strictly match the canonical domain.
3. **Build Health**: Zero ESLint warnings, zero TypeScript errors on `npm run build`.
