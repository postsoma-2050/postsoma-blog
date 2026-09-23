import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://www.postsoma-2050.com";

export const metadata: Metadata = {
  title: "404 Transmission Lost | PostSoma 2050",
  description: "The requested cognitive signal or article could not be located in the neural archive.",
  alternates: {
    canonical: `${SITE_URL}/404`,
  },
  openGraph: {
    type: "website",
    siteName: "PostSoma 2050",
    title: "404 Transmission Lost | PostSoma 2050",
    description: "The requested cognitive signal or article could not be located in the neural archive.",
    url: `${SITE_URL}/404`,
    locale: "zh_TW",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        secureUrl: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "PostSoma 2050",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "404 Transmission Lost | PostSoma 2050",
    description: "The requested cognitive signal or article could not be located in the neural archive.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="relative font-mono text-xs text-[var(--accent-ai)] tracking-widest uppercase mb-4 px-3 py-1 rounded border border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        {"// SIGNAL DEVIATION 404"}
      </div>
      <h1 className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-[var(--text-primary)] mb-4">
        TRANSMISSION LOST
      </h1>
      <p className="max-w-md text-sm text-[var(--text-secondary)] mb-8 font-mono">
        The cognitive coordinate you are attempting to access does not exist or has been re-indexed.
      </p>
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:border-[var(--accent-ai)] hover:text-[var(--accent-ai)] transition-all shadow-sm"
      >
        ← Return to Terminal
      </Link>
    </main>
  );
}
