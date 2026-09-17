import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t-[0.5px] border-[var(--border-subtle)] py-12 text-center">
      <div className="mx-auto max-w-[760px] px-6 flex flex-col items-center space-y-3 font-mono text-sm tracking-wider">
        <p className="text-[var(--text-primary)] font-semibold">
          At PostSoma 2050,
        </p>
        <p className="text-[var(--text-secondary)]">Together, we gaze into the abyss,</p>
        <p className="text-[var(--text-secondary)]">
          Rediscovering the essence of our existence.
        </p>
        
        {/* Editorial & Machine navigation links */}
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-xs text-[var(--text-muted)] pt-4">
          <Link href="/about" className="hover:text-[var(--text-primary)] transition-colors">
            About &amp; E-E-A-T
          </Link>
          <span className="opacity-30 select-none">/</span>
          <a
            href="/llms.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            llms.txt
          </a>
          <span className="opacity-30 select-none">/</span>
          <a
            href="/llms-full.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            llms-full.txt
          </a>
          <span className="opacity-30 select-none">/</span>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--text-primary)] transition-colors"
          >
            Sitemap
          </a>
        </div>

        <p className="mt-8 font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          © 2050 PostSoma-2050. All rights reserved. Crafted by postsoma-2050.
        </p>
      </div>
    </footer>
  );
}
