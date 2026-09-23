import type { MetadataRoute } from "next";

const SITE_URL = "https://www.postsoma-2050.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og", "/api/image"],
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
          "Twitterbot",
          "facebookexternalhit",
          "LinkedInBot",
          "TelegramBot",
          "WhatsApp",
          "Discordbot",
        ],
        allow: ["/", "/api/og", "/api/image"],
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
