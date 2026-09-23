import { Suspense } from "react";
import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "katex/dist/katex.min.css";
import Navbar from "@/components/Navbar";
import HudBar from "@/components/HudBar";
import FloatingDock from "@/components/FloatingDock";
import SearchModal, { type SearchablePost } from "@/components/SearchModal";
import BodyRouteClass from "@/components/BodyRouteClass";
import Footer from "@/components/Footer";
import CyberTopLoader from "@/components/CyberTopLoader";
import { getPublishedPosts, getArticleCountByCategory } from "@/lib/notion";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.postsoma-2050.com"),
  title: {
    default: "PostSoma 2050 | Cyberpunk-Humanist Knowledge Garden",
    template: "%s | PostSoma 2050",
  },
  description:
    "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
  icons: {
    icon: [
      { url: "/favicon.svg?v=5",       type: "image/svg+xml" },
      { url: "/favicon-16x16.png?v=5", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32x32.png?v=5", type: "image/png", sizes: "32x32" },
      { url: "/favicon.png?v=5",       type: "image/png", sizes: "192x192" },
      { url: "/favicon.ico?v=5", sizes: "48x48" },
    ],
    shortcut: ["/favicon-32x32.png?v=5"],
    apple: [
      { url: "/apple-touch-icon.png?v=5", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    siteName: "PostSoma 2050",
    title: "PostSoma 2050 | Cyberpunk-Humanist Knowledge Garden",
    description: "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
    url: "https://www.postsoma-2050.com",
    images: [
      {
        url: "https://www.postsoma-2050.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "PostSoma 2050",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PostSoma 2050 | Cyberpunk-Humanist Knowledge Garden",
    description: "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
    images: ["https://www.postsoma-2050.com/og-image.png"],
  },
  alternates: {
    canonical: "https://www.postsoma-2050.com",
  },
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.postsoma-2050.com/#website",
      "url": "https://www.postsoma-2050.com",
      "name": "PostSoma 2050",
      "description":
        "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
      "publisher": { "@id": "https://www.postsoma-2050.com/#organization" },
      "inLanguage": "zh-TW",
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
        "url": "https://www.postsoma-2050.com/about",
      },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [posts, categoryCounts] = await Promise.all([
    getPublishedPosts(),
    getArticleCountByCategory(),
  ]);
  const postCount = posts.length;

  // Lightweight posts payload for search modal (name, slug, category, summary, publishedDate, tags)
  // Ensures full markdown and heavy fields are stripped to preserve initial load performance
  const searchablePosts: SearchablePost[] = posts.map((p) => ({
    name: p.name,
    slug: p.slug,
    category: p.category,
    summary: p.summary,
    publishedDate: p.publishedDate,
    tags: p.tags,
  }));

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          id="theme-initializer"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var t=s==='light'||s==='dark'?s:'dark';document.documentElement.setAttribute('data-theme',t);if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}document.documentElement.style.colorScheme=t}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NKX5918K1C"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-NKX5918K1C');
          `}
        </Script>
      </head>
      <body
        className={`${jetbrainsMono.variable} ${inter.variable} min-h-screen bg-bg font-sans text-text-primary antialiased`}
      >
        <Suspense fallback={null}>
          <CyberTopLoader />
        </Suspense>
        <BodyRouteClass />
        <SearchModal posts={searchablePosts} />
        <Navbar />
        <HudBar postCount={postCount} categoryCounts={categoryCounts} />
        <FloatingDock />
        <main className="mx-auto max-w-[760px] px-6 py-8">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
