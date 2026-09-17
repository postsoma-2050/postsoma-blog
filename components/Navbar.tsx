"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { RiMenu3Line, RiCloseLine } from "@remixicon/react";
import { Search } from "lucide-react";
import { useState } from "react";
import { CATEGORY_SLUGS, type Category } from "@/lib/design-tokens";
import { openSearchModal } from "@/components/SearchModal";

const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  ...(Object.entries(CATEGORY_SLUGS) as [Category, string][]).map(
    ([label, slug]) => ({ label, href: `/${slug}` })
  ),
  { label: "About", href: "/about" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="relative z-30 w-full border-b-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-base)]/85 backdrop-blur-md"
    >
      <div className="max-w-[760px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* POSTSOMA 2050 Logo: 左边缘与正文文章标题严格垂直对齐 */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 sm:gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--border-default)] rounded-lg"
          aria-label="PostSoma 2050 home"
        >
          <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center overflow-hidden rounded-lg border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] p-0.5 transition-all duration-200 group-hover:border-[var(--border-default)] shadow-sm">
            <Image
              src="/logo.png"
              alt="PostSoma Icon"
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex items-center">
            <span className="font-mono text-base font-bold tracking-widest text-[var(--text-primary)] transition-opacity group-hover:opacity-85">
              POST<span className="text-[var(--accent-ai)]">SOMA</span>
            </span>
            <span className="ml-2 font-mono text-[10px] font-semibold tracking-wider text-[var(--text-muted)] border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)] px-1.5 py-0.5 rounded shadow-sm">
              2050
            </span>
          </div>
        </Link>

        {/* Right side: Mobile only (<1024px) search + menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          {/* Mobile Search Trigger Button */}
          <button
            type="button"
            onClick={openSearchModal}
            className="h-9 w-9 flex items-center justify-center rounded-lg border-[0.5px] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--border-default)]"
            aria-label="Search transmissions (⌘K)"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="h-9 px-2.5 font-mono text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none flex items-center justify-center border-[0.5px] border-[var(--border-subtle)] rounded-lg transition-colors hover:border-[var(--border-default)] focus:ring-2 focus:ring-[var(--border-default)]"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <RiCloseLine className="w-4 h-4" /> : <RiMenu3Line className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{
          height: mobileOpen ? "auto" : 0,
          opacity: mobileOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden border-t border-[var(--border-subtle)] lg:hidden"
      >
        <div className="max-w-[760px] mx-auto px-6 py-3">
          <ul className="flex flex-col gap-0">
            {navLinks.map(({ label, href }) => {
              const isActive =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center py-3 w-full min-h-[44px] font-mono text-sm ${
                      isActive ? "text-[var(--accent-ai)] font-semibold" : "text-[var(--text-secondary)]"
                    } hover:text-[var(--text-primary)] transition-colors`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </motion.header>
  );
}
