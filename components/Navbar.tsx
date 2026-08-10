"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { RiMenu3Line, RiCloseLine } from "@remixicon/react";
import { useState } from "react";
import { CATEGORY_SLUGS, type Category } from "@/lib/design-tokens";

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
      className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-bg/95 backdrop-blur-sm"
    >
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-accent-ai focus:ring-offset-2 focus:ring-offset-bg"
          aria-label="PostSoma 2050 home"
        >
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center overflow-hidden rounded-lg border border-cyan-500/30 bg-bg-secondary p-0.5 shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all duration-300 group-hover:border-cyan-400 group-hover:shadow-[0_0_18px_rgba(0,240,255,0.5)]">
            <Image
              src="/logo.png"
              alt="PostSoma Icon"
              width={44}
              height={44}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex items-center">
            <span className="font-mono text-base font-bold tracking-widest text-text-primary transition-colors group-hover:text-cyan-300 sm:text-lg">
              POST<span className="text-cyan-400">SOMA</span>
            </span>
            <span className="ml-2 font-mono text-[10px] font-semibold tracking-wider text-cyan-400 border border-cyan-500/40 bg-cyan-950/60 px-1.5 py-0.5 rounded shadow-[0_0_8px_rgba(0,240,255,0.2)] sm:text-xs">
              2050
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ label, href }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="focus:outline-none focus-visible:ring-0"
                >
                  <motion.span
                    className={`relative block px-3 py-2 font-mono text-sm transition-colors ${isActive
                      ? "text-accent-ai"
                      : "text-text-secondary hover:text-text-primary"
                      }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {label}
                    {isActive && (
                      <motion.span
                        layoutId="navbar-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-ai"
                        style={{
                          boxShadow: "0 0 12px 2px #00F0FF, 0 0 24px 4px rgba(0, 240, 255, 0.4)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </motion.span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen((o) => !o)}
          className="font-mono text-xs uppercase tracking-wider text-text-primary hover:text-accent-ai focus:outline-none md:hidden px-3 h-11 flex items-center justify-center border border-[var(--border-subtle)] rounded transition-colors hover:border-accent-ai focus:ring-2 focus:ring-accent-ai focus:ring-offset-2 focus:ring-offset-bg"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <RiCloseLine className="w-5 h-5" /> : <RiMenu3Line className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <motion.div
        initial={false}
        animate={{
          height: mobileOpen ? "auto" : 0,
          opacity: mobileOpen ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden border-t border-[var(--border-subtle)] md:hidden"
      >
        <ul className="flex flex-col gap-0 px-4 py-3">
          {navLinks.map(({ label, href }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center py-3 w-full min-h-[44px] font-mono text-sm ${isActive ? "text-accent-ai" : "text-text-secondary"
                    } hover:text-text-primary`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.header>
  );
}
