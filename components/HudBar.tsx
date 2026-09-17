"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ---------------------------------------------------------------------------
// Candlestick data (mirrors original sentiment display style)
// ---------------------------------------------------------------------------
const CANDLES = [
  { top: 4, body: 12, bottom: 6, green: true },
  { top: 8, body: 14, bottom: 4, green: false },
  { top: 2, body: 8,  bottom: 8, green: true },
  { top: 10, body: 16, bottom: 2, green: false },
  { top: 4, body: 10, bottom: 4, green: true },
] as const;

// ---------------------------------------------------------------------------
// Static placeholders
// ---------------------------------------------------------------------------
const FOMO_LEVEL = "GREED";

// ---------------------------------------------------------------------------
// Live crypto price hook
// ---------------------------------------------------------------------------
type PriceStatus = "loading" | "ok" | "error";

interface MarketPrices {
  btc: string;
  eth: string;
  status: PriceStatus;
  updatedAt: Date | null;
}

function useMarketPrices(pollMs = 30_000): MarketPrices {
  const [state, setState] = useState<MarketPrices>({
    btc: "loading...",
    eth: "loading...",
    status: "loading",
    updatedAt: null,
  });

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/market");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        btc: string;
        eth: string;
        updatedAt: string;
      };
      setState({
        btc: data.btc,
        eth: data.eth,
        status: "ok",
        updatedAt: new Date(data.updatedAt),
      });
    } catch {
      setState((prev) => ({
        btc: prev.status === "ok" ? prev.btc : "unavailable",
        eth: prev.status === "ok" ? prev.eth : "unavailable",
        status: "error",
        updatedAt: prev.updatedAt,
      }));
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, pollMs);
    return () => clearInterval(id);
  }, [fetch_, pollMs]);

  return state;
}

// ---------------------------------------------------------------------------
// Live Fear & Greed (FOMO) hook — polls less frequently (e.g. every 5 minutes)
// ---------------------------------------------------------------------------
interface FomoData {
  score: number;
  label: string;
  source: string;
  updatedAt: Date | null;
  fallback: boolean;
  status: PriceStatus;
}

function useFomoData(pollMs = 300_000): FomoData {
  const [state, setState] = useState<FomoData>({
    score: 50,
    label: "loading...",
    source: "unavailable",
    updatedAt: null,
    fallback: false,
    status: "loading",
  });

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch("/api/fomo");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        score: number;
        label: string;
        source: string;
        updatedAt: string;
        fallback: boolean;
      };
      setState({
        score: data.score,
        label: data.label,
        source: data.source,
        updatedAt: new Date(data.updatedAt),
        fallback: data.fallback,
        status: "ok",
      });
    } catch {
      setState((prev) => ({
        ...prev,
        status: "error",
        label: prev.status === "ok" ? prev.label : "unavailable",
      }));
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, pollMs);
    return () => clearInterval(id);
  }, [fetch_, pollMs]);

  return state;
}

// ---------------------------------------------------------------------------
// Relative time ticker
// ---------------------------------------------------------------------------
function useRelativeTime(date: Date | null): string {
  const [label, setLabel] = useState<string>("—");

  useEffect(() => {
    if (!date) return;
    const tick = () => {
      const s = Math.floor((Date.now() - date.getTime()) / 1000);
      setLabel(s < 60 ? `${s}s ago` : `${Math.floor(s / 60)}m ago`);
    };
    tick();
    const id = setInterval(tick, 5_000);
    return () => clearInterval(id);
  }, [date]);

  return label;
}

// ---------------------------------------------------------------------------
// Panel types
// ---------------------------------------------------------------------------
type PanelId = "status" | "ticker" | "sentiment" | "terminal" | "mobile-hud" | null;

interface HudBarProps {
  postCount?: number;
  categoryCounts?: {
    AI: number;
    BC: number;
    PH: number;
    IV: number;
    NT: number;
  };
}

// ---------------------------------------------------------------------------
// Atmospheric Backdrop Component
// ---------------------------------------------------------------------------
function PanelBackdrop({ accentClass }: { accentClass: string }) {
  return (
    <>
      <div className={`absolute top-0 bottom-0 left-0 w-0.5 ${accentClass} opacity-40`} />
      <div className={`absolute top-0 bottom-0 right-0 w-0.5 ${accentClass} opacity-40`} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Individual panels (ONLINE status, BTC ticker, FOMO sentiment, terminal)
// ---------------------------------------------------------------------------
function StatusPanel({
  postCount,
  categoryCounts,
}: {
  postCount: number;
  categoryCounts?: { AI: number; BC: number; PH: number; IV: number; NT: number };
}) {
  const catEntries = categoryCounts
    ? [
        { key: "AI", label: "AI Insights",    count: categoryCounts.AI,  href: "/ai-insights" },
        { key: "BC", label: "Blockchain",      count: categoryCounts.BC,  href: "/blockchain" },
        { key: "PH", label: "Philosophy",      count: categoryCounts.PH,  href: "/philosophy" },
        { key: "IV", label: "Investing",       count: categoryCounts.IV,  href: "/investing" },
        { key: "NT", label: "Sheshin Notes",   count: categoryCounts.NT,  href: "/sheshin-notes" },
      ]
    : null;

  return (
    <div className="relative flex flex-col justify-between min-h-[150px] md:h-auto h-auto p-4 md:p-5 font-mono text-[var(--text-primary)] gap-4 md:gap-3">
      <PanelBackdrop accentClass="bg-[var(--accent-dot)]" />

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-dot)]" />
          System Status · Index Logs
        </span>

        {catEntries ? (
          /* Category breakdown rows */
          <ul className="mt-2.5 flex flex-col gap-1 text-[11px]">
            {catEntries.map(({ key, label, count, href }) => (
              <li key={key} className="flex items-center gap-3">
                <span className="w-8 shrink-0 font-bold text-[var(--accent-philosophy)]">{key}</span>
                <span className="flex-1 text-[var(--text-secondary)]">{label}</span>
                <Link
                  href={href}
                  className="tabular-nums text-[var(--text-primary)] hover:underline transition-colors font-semibold"
                >
                  {count} nodes
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          /* Fallback: static rows */
          <ul className="mt-2.5 flex flex-col gap-1 text-[11px]">
            {[
              { status: "ONLINE",  label: "Reasoning Core" },
              { status: "SYNCING", label: "Vector Index" },
              { status: "FAILED",  label: "Turing Test" },
              { status: "OK",      label: `Total Nodes: ${postCount}` },
            ].map(({ status, label }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="w-16 shrink-0 font-bold text-[var(--text-muted)]">[{status}]</span>
                <span className="text-[var(--text-secondary)]">{label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative z-10 border-t border-[var(--border-subtle)] pt-2">
        <Link
          href="/ai-insights"
          className="block text-center md:inline-block md:text-left text-[9px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          → Access Archive Cores
        </Link>
      </div>
    </div>
  );
}

function TickerPanel({ prices }: { prices: MarketPrices }) {
  const relTime = useRelativeTime(prices.updatedAt);
  return (
    <div className="relative flex flex-col justify-between min-h-[150px] md:h-[160px] h-auto p-4 md:p-5 font-mono text-[var(--text-primary)] gap-4 md:gap-0">
      <PanelBackdrop accentClass="bg-[var(--accent-blockchain)]" />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Market Ticker · Ledger
          </span>
          <span
            className={`text-[9px] tabular-nums ${
              prices.status === "error"
                ? "text-red-500"
                : prices.status === "loading"
                ? "animate-pulse text-[var(--text-muted)]"
                : "text-[var(--text-muted)]"
            }`}
          >
            {prices.status === "loading"
              ? "fetching..."
              : prices.status === "error"
              ? "sync failed"
              : `sync: ${relTime}`}
          </span>
        </div>

        <div className="mt-3 flex flex-col md:flex-row gap-3 md:gap-8">
          {[
            { symbol: "BTC", value: prices.btc, desc: "Primary reserve" },
            { symbol: "ETH", value: prices.eth, desc: "Gas network core" },
          ].map((t) => (
            <div key={t.symbol} className="flex flex-col tabular-nums">
              <span className="text-[9px] font-bold text-[var(--text-muted)]">{t.symbol}</span>
              <span className="text-xl md:text-xl font-extrabold tracking-tight text-[var(--text-primary)] mt-0.5">
                {t.value}
              </span>
              <span className="text-[8px] text-[var(--text-muted)]">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 border-t border-[var(--border-subtle)] pt-2">
        <Link
          href="/blockchain"
          className="block text-center md:inline-block md:text-left text-[9px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          → Inspect Ledger Blocks
        </Link>
      </div>
    </div>
  );
}

function getFomoInterpretation(score: number): string {
  if (score >= 75) {
    return "Market State: Extreme Greed. High susceptibility to corrections.";
  }
  if (score >= 55) {
    return "Market State: Stable Expansion. Capital flow is positive.";
  }
  if (score >= 45) {
    return "Market State: Equilibrium. System state is neutral.";
  }
  if (score >= 25) {
    return "Market State: Anxiety spreading. Hedging protocols active.";
  }
  return "Market State: Extreme Fear. High potential for capitulation/buying windows.";
}

function SentimentPanel({ fomo }: { fomo: FomoData }) {
  const score = fomo.score;
  const filledCount = Math.round(score / 5);
  const emptyCount = 20 - filledCount;
  const barStr = "█".repeat(filledCount) + "░".repeat(emptyCount);
  const relTime = useRelativeTime(fomo.updatedAt);

  return (
    <div className="relative flex flex-col justify-between min-h-[150px] md:h-[160px] h-auto p-4 md:p-5 font-mono text-[var(--text-primary)] gap-4 md:gap-0">
      <PanelBackdrop accentClass="bg-[var(--accent-philosophy)]" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Market Sentiment · Ratio
            </span>
            <span className="text-[9px] tabular-nums text-[var(--text-muted)]">
              {fomo.status === "loading"
                ? "fetching..."
                : `${fomo.source}: ${relTime}${fomo.fallback ? " (fallback)" : ""}`}
            </span>
          </div>
          <div className="mt-3 flex items-end gap-1" style={{ height: 35 }}>
            {CANDLES.map((c, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-3">
                <div
                  className={`w-0.5 flex-shrink-0 ${c.green ? "bg-emerald-500/50" : "bg-red-500/50"}`}
                  style={{ height: Math.max(1, c.top - 2), minHeight: 1 }}
                />
                <div
                  className={`w-full rounded-sm ${c.green ? "bg-emerald-500" : "bg-red-500"}`}
                  style={{ height: Math.max(4, c.body - 2), minHeight: 4 }}
                />
                <div
                  className={`w-0.5 flex-shrink-0 ${c.green ? "bg-emerald-500/50" : "bg-red-500/50"}`}
                  style={{ height: Math.max(1, c.bottom - 2), minHeight: 1 }}
                />
              </div>
            ))}
            <div className="ml-3 flex flex-col justify-end h-full">
              <p className="text-[8px] uppercase tracking-wider text-[var(--text-muted)]">FOMO Class</p>
              <p className="text-[11px] font-bold text-[var(--text-primary)] uppercase mt-0.5">
                {fomo.status === "loading" ? "loading..." : fomo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Tactical visual score readouts */}
        <div className="flex flex-col justify-center">
          <div className="flex flex-col md:flex-row md:items-baseline md:justify-between text-[10px] mb-0.5">
            <span className="text-[var(--text-muted)] uppercase tracking-wider text-[8px]">Index Score</span>
            <span className="font-bold text-[var(--text-primary)] mt-0.5 md:mt-0">{score} / 100</span>
          </div>
          {/* ASCII horizontal progress bar */}
          <div className="text-[10px] sm:text-xs tracking-wider md:tracking-widest text-[var(--accent-philosophy)] mb-1.5 tabular-nums truncate">
            [{barStr}]
          </div>
          <p className="text-[8px] text-[var(--text-secondary)] leading-snug line-clamp-none md:line-clamp-2 italic">
            {getFomoInterpretation(score)}
          </p>
        </div>
      </div>

      <div className="relative z-10 border-t border-[var(--border-subtle)] pt-2">
        <Link
          href="/investing"
          className="block text-center md:inline-block md:text-left text-[9px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          → Optimize Portfolio Weights
        </Link>
      </div>
    </div>
  );
}

function TerminalPanel() {
  return (
    <div className="relative flex flex-col justify-between min-h-[150px] md:h-[160px] h-auto p-4 md:p-5 font-mono text-[var(--text-primary)] gap-4 md:gap-0">
      <PanelBackdrop accentClass="bg-[var(--accent-ai)]" />

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Philosophy · Scripture
        </span>
        <div className="mt-3 flex items-start text-xs text-[var(--text-primary)]">
          <span className="mr-2 font-bold select-none text-[var(--accent-ai)]">&gt;</span>
          <div>
            <p className="leading-relaxed text-[var(--text-primary)] font-medium">
              &quot;What has been will be again, what has been done will be done again; there is nothing new under the sun.&quot;
            </p>
            <p className="mt-1 text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
              — Ecclesiastes 1:9 · Recurring Cycle
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-[var(--border-subtle)] pt-2">
        <Link
          href="/philosophy"
          className="block text-center md:inline-block md:text-left text-[9px] uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          → Deconstruct World Theory
        </Link>
      </div>
    </div>
  );
}

function MobileHudPanel({
  postCount,
  prices,
  fomo,
}: {
  postCount: number;
  prices: MarketPrices;
  fomo: FomoData;
}) {
  const score = fomo.score;
  const filledCount = Math.round(score / 10);
  const emptyCount = 10 - filledCount;
  const barStr = "█".repeat(filledCount) + "░".repeat(emptyCount);

  return (
    <div className="relative flex flex-col gap-4 p-4 font-mono text-[var(--text-primary)] overflow-y-auto max-h-[75vh]">
      <PanelBackdrop accentClass="bg-[var(--accent-dot)]" />

      {/* 1. Status Section */}
      <div className="border-b border-[var(--border-subtle)] pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-dot)]" />
          System Status · Logs
        </span>
        <ul className="mt-2 flex flex-col gap-1 text-[11px]">
          <li className="flex items-center gap-3">
            <span className="w-16 shrink-0 font-bold text-[var(--accent-philosophy)]">ONLINE</span>
            <span className="text-[var(--text-secondary)]">Reasoning Core</span>
          </li>
          <li className="flex items-center gap-3">
            <span className="w-16 shrink-0 font-bold text-[var(--accent-philosophy)]">OK</span>
            <span className="text-[var(--text-secondary)]">Total Nodes: {postCount}</span>
          </li>
        </ul>
      </div>

      {/* 2. Ticker Section */}
      <div className="border-b border-[var(--border-subtle)] pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Market Ticker · Ledger
        </span>
        <div className="mt-2 flex flex-col gap-1.5 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">BTC:</span>
            <span className="font-bold text-[var(--text-primary)]">{prices.btc}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[var(--text-muted)]">ETH:</span>
            <span className="font-bold text-[var(--text-primary)]">{prices.eth}</span>
          </div>
        </div>
      </div>

      {/* 3. Sentiment Section */}
      <div className="border-b border-[var(--border-subtle)] pb-3">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Market Sentiment · Ratio
        </span>
        <div className="mt-2 flex flex-col gap-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-[var(--text-muted)]">FOMO Class: {fomo.label}</span>
            <span className="font-bold text-[var(--text-primary)]">{score} / 100</span>
          </div>
          <div className="text-[11px] tracking-wider text-[var(--accent-philosophy)] mb-1">
            {barStr}
          </div>
          <p className="text-[9px] text-[var(--text-secondary)] leading-snug italic whitespace-normal">
            {getFomoInterpretation(score)}
          </p>
        </div>
      </div>

      {/* 4. Terminal Quote */}
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Philosophy · Scripture
        </span>
        <div className="mt-2 text-xs text-[var(--text-primary)] leading-relaxed">
          &quot;What has been will be again, what has been done will be done again; there is nothing new under the sun.&quot;
        </div>
        <div className="mt-1 text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
          — Ecclesiastes 1:9
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HUD Bar
// ---------------------------------------------------------------------------
export default function HudBar({ postCount = 0, categoryCounts }: HudBarProps) {
  const [activePanel, setActivePanel] = useState<PanelId>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Router-based state checks
  const isHome = pathname === "/";

  // Auto-close active panel when navigating away from Home
  useEffect(() => {
    setActivePanel(null);
  }, [pathname]);

  // Live market and FOMO data
  const prices = useMarketPrices(30_000);
  const fomo = useFomoData(300_000); // 5 minutes refresh interval

  const toggle = useCallback((id: PanelId) => {
    setActivePanel((prev) => (prev === id ? null : id));
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!activePanel) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePanel]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActivePanel(null);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const segmentCls = (id: PanelId, isFirst = false) => {
    if (!isHome) {
      return `select-none ${isFirst ? "pl-0 pr-1.5" : "px-1.5"} py-0.5 rounded font-mono text-[0.72rem] tracking-wider leading-none text-[var(--text-muted)] cursor-default`;
    }
    return `cursor-pointer select-none ${isFirst ? "pl-0 pr-1.5" : "px-1.5"} py-0.5 rounded transition-colors duration-150 font-mono text-[0.72rem] tracking-wider leading-none ${
      activePanel === id
        ? `text-[var(--text-primary)] bg-[var(--hover-highlight)]`
        : `text-[var(--text-muted)] hover:text-[var(--text-primary)]`
    }`;
  };

  const btcLabel = prices.status === "loading" ? "loading..." : prices.btc;

  // Active border class mapping
  const activeShadowClass = "border-[var(--border-subtle)] shadow-xl";

  return (
    <div ref={containerRef} className="relative z-40">
      {/* ── Main HUD strip ─────────────────────────────────────────────── */}
      <div className="w-full border-b-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-base)]/80 backdrop-blur-md">
        <div className="max-w-[760px] mx-auto px-6 py-1.5 flex items-center justify-between font-mono text-[0.72rem] tracking-wider text-[var(--text-muted)]">
          {/* ● ONLINE、NODES、BTC、FOMO 左侧指标群 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ● ONLINE segment */}
            {isHome ? (
              <button
                type="button"
                aria-label="System Status panel"
                aria-expanded={activePanel === "status"}
                onClick={() => toggle("status")}
                className={segmentCls("status", true)}
              >
                <span className="text-[var(--accent-dot)] text-[8px] mr-1.5 animate-pulse">●</span>
                <span>ONLINE</span>
              </button>
            ) : (
              <span className={segmentCls("status", true)}>
                <span className="text-[var(--accent-dot)] opacity-60 text-[8px] mr-1.5">●</span>
                <span>ONLINE</span>
              </span>
            )}

            <span className="text-[var(--border-subtle)] select-none hidden sm:inline">│</span>

            {/* NODES */}
            {isHome ? (
              <button
                type="button"
                aria-label="System Status panel"
                aria-expanded={activePanel === "status"}
                onClick={() => toggle("status")}
                className={`${segmentCls("status")} hidden sm:inline-flex`}
              >
                NODES:&nbsp;<span className="text-[var(--text-secondary)]">{postCount}</span>
              </button>
            ) : (
              <span className={`${segmentCls("status")} hidden sm:inline`}>
                NODES:&nbsp;<span className="text-[var(--text-secondary)]">{postCount}</span>
              </span>
            )}

            <span className="text-[var(--border-subtle)] select-none hidden sm:inline">│</span>

            {/* BTC */}
            {isHome ? (
              <button
                type="button"
                aria-label="Ticker panel"
                aria-expanded={activePanel === "ticker"}
                onClick={() => toggle("ticker")}
                className={`${segmentCls("ticker")} hidden sm:inline-flex`}
              >
                BTC:&nbsp;<span className="text-[var(--text-secondary)]">{btcLabel}</span>
                <span className="ml-0.5 text-[8px] opacity-25">▾</span>
              </button>
            ) : (
              <span className={`${segmentCls("ticker")} hidden sm:inline`}>
                BTC:&nbsp;<span className="text-[var(--text-secondary)]">{btcLabel}</span>
              </span>
            )}

            <span className="text-[var(--border-subtle)] select-none hidden sm:inline">│</span>

            {/* FOMO */}
            {isHome ? (
              <button
                type="button"
                aria-label="Market Sentiment panel"
                aria-expanded={activePanel === "sentiment"}
                onClick={() => toggle("sentiment")}
                className={segmentCls("sentiment")}
              >
                FOMO:&nbsp;<span className="text-[var(--text-secondary)]">{fomo.status === "loading" ? "loading..." : fomo.label}</span>
              </button>
            ) : (
              <span className={segmentCls("sentiment")}>
                FOMO:&nbsp;<span className="text-[var(--text-secondary)]">{fomo.status === "loading" ? "loading..." : fomo.label}</span>
              </span>
            )}

            {/* [->] Mobile expand button */}
            {isHome ? (
              <button
                type="button"
                aria-label="Expand HUD panel"
                aria-expanded={activePanel === "mobile-hud"}
                onClick={() => toggle("mobile-hud")}
                className="lg:hidden select-none px-2 py-0.5 rounded font-mono text-[0.72rem] tracking-wider leading-none text-[var(--text-muted)] hover:text-[var(--text-primary)] focus:outline-none"
              >
                {activePanel === "mobile-hud" ? "[←]" : "[→]"}
              </button>
            ) : (
              <span className="lg:hidden select-none px-2 py-0.5 rounded font-mono text-[0.72rem] tracking-wider leading-none text-[var(--text-muted)] opacity-60 cursor-default">
                {"[→]"}
              </span>
            )}
          </div>

          {/* 右侧经文引用，右边缘与文章列表右侧严格对齐 */}
          <div className="flex items-center gap-2">
            {isHome ? (
              <button
                type="button"
                aria-label="Terminal panel"
                aria-expanded={activePanel === "terminal"}
                onClick={() => toggle("terminal")}
                className={`${segmentCls("terminal")} hidden lg:inline-flex truncate`}
              >
                <span className="opacity-40 mr-1">&gt;</span>
                Ecclesiastes 1:9
              </button>
            ) : (
              <span className={`${segmentCls("terminal")} hidden lg:inline text-[var(--text-muted)] truncate`}>
                <span className="opacity-30 mr-1">&gt;</span>
                Ecclesiastes 1:9
              </span>
            )}

            {activePanel && isHome && (
              <button
                type="button"
                aria-label="Close panel"
                onClick={() => setActivePanel(null)}
                className="px-1.5 py-0.5 font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded border-[0.5px] border-[var(--border-subtle)] bg-[var(--bg-surface)]"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Large drop-down overlay panel (Only rendered on the homepage) ── */}
      {activePanel && isHome && (
        <div
          className="absolute left-0 right-0 top-full z-50 border-b-[0.5px] border-[var(--border-subtle)] border-t-0 bg-[var(--bg-surface)] backdrop-blur-md shadow-2xl transition-all duration-300"
          role="dialog"
          aria-label="HUD detail panel"
        >
          <div className="mx-auto max-w-[760px] px-6">
            {activePanel === "status"    && <StatusPanel postCount={postCount} categoryCounts={categoryCounts} />}
            {activePanel === "ticker"    && <TickerPanel prices={prices} />}
            {activePanel === "sentiment" && <SentimentPanel fomo={fomo} />}
            {activePanel === "terminal"  && <TerminalPanel />}
            {activePanel === "mobile-hud" && <MobileHudPanel postCount={postCount} prices={prices} fomo={fomo} />}
          </div>
        </div>
      )}
    </div>
  );
}
