import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import HudBar from "@/components/HudBar";
import BodyRouteClass from "@/components/BodyRouteClass";
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
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/favicon.png?v=2", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/favicon.png?v=2", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "PostSoma 2050",
    title: "PostSoma 2050 | Cyberpunk-Humanist Knowledge Garden",
    description: "High-Tech meets High-Touch. AI, Blockchain, Philosophy, Investing, Notes.",
    url: "https://www.postsoma-2050.com",
    images: [
      {
        url: "/no-future.jpg",
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
    images: ["/no-future.jpg"],
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

  return (
    <html lang="en" className="dark">
      <head>
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
        <BodyRouteClass />
        <Navbar />
        <HudBar postCount={postCount} categoryCounts={categoryCounts} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
        <footer className="relative z-10 mt-24 border-t border-white/5 py-12 text-center">
          <div className="flex flex-col items-center space-y-4 font-mono text-sm tracking-wider">
            <p className="text-cyan-400/90 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">
              At PostSoma-2050,
            </p>
            <p className="text-gray-500">Together, we gaze into the abyss,</p>
            <p className="text-gray-500">
              Rediscovering the essence of our existence.
            </p>
            
            {/* Machine & E-E-A-T Navigation links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-400 pt-4">
              <Link href="/about" className="hover:text-cyan-400 transition-colors">
                [ About & E-E-A-T ]
              </Link>
              <a href="/llms.txt" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                [ llms.txt ]
              </a>
              <a href="/llms-full.txt" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                [ llms-full.txt ]
              </a>
              <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                [ Sitemap ]
              </a>
            </div>

            <p className="mt-8 text-[10px] uppercase tracking-widest text-gray-700">
              © 2050 PostSoma-2050. All rights reserved. Built by postsoma-2050.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
