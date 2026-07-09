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
type PanelId = "status" | "ticker" | "sentiment" | "terminal" | null;

interface HudBarProps {
  postCount?: number;
}

// ---------------------------------------------------------------------------
// Atmospheric Backdrop Component
// ---------------------------------------------------------------------------
function PanelBackdrop({ accentClass }: { accentClass: string }) {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)",
        }}
        aria-hidden
      />
      <div className={`absolute top-0 bottom-0 left-0 w-1 ${accentClass} opacity-50`} />
      <div className={`absolute top-0 bottom-0 right-0 w-1 ${accentClass} opacity-50`} />
    </>
  );
}

// ---------------------------------------------------------------------------
// Individual panels (ONLINE status, BTC ticker, FOMO sentiment, terminal)
// ---------------------------------------------------------------------------
function StatusPanel({ postCount }: { postCount: number }) {
  const items = [
    { status: "ONLINE",  label: "Reasoning Core",     cls: "text-emerald-400" },
    { status: "SYNCING", label: "Vector Index",        cls: "text-amber-400" },
    { status: "FAILED",  label: "Turing Test",         cls: "text-red-400" },
    { status: "OK",      label: `Total Nodes: ${postCount}`, cls: "text-emerald-400" },
  ];
  return (
    <div className="relative flex flex-col justify-between h-[150px] md:h-[160px] p-4 md:p-5 text-emerald-400 font-mono">
      <PanelBackdrop accentClass="bg-emerald-500" />
      
      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400/60 flex items-center gap-2">
          <span className="h-1 w-1 rounded-full bg-emerald-400 animate-ping" />
          SYSTEM_STATUS // LOGS
        </span>
        <ul className="mt-2.5 flex flex-col gap-1 text-[11px]">
          {items.map(({ status, label, cls }) => (
            <li key={label} className="flex items-center gap-3">
              <span className={`w-16 shrink-0 font-bold ${cls}`}>
                [{status}]
              </span>
              <span className="text-text-primary/80">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 border-t border-emerald-500/10 pt-2">
        <Link
          href="/ai-insights"
          className="inline-block text-[9px] uppercase tracking-widest text-emerald-400/50 hover:text-emerald-300 transition-colors"
        >
          → ACCESS ARCHIVE CORES
        </Link>
      </div>
    </div>
  );
}

function TickerPanel({ prices }: { prices: MarketPrices }) {
  const relTime = useRelativeTime(prices.updatedAt);
  return (
    <div className="relative flex flex-col justify-between h-[150px] md:h-[160px] p-4 md:p-5 text-orange-400 font-mono">
      <PanelBackdrop accentClass="bg-orange-500" />

      <div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-orange-400/60">
            MARKET_TICKER // LEDGER
          </span>
          <span
            className={`text-[9px] tabular-nums ${
              prices.status === "error"
                ? "text-red-400/50"
                : prices.status === "loading"
                ? "animate-pulse text-orange-400/30"
                : "text-orange-400/30"
            }`}
          >
            {prices.status === "loading"
              ? "fetching..."
              : prices.status === "error"
              ? "sync failed"
              : `sync: ${relTime}`}
          </span>
        </div>

        <div className="mt-3 flex gap-8">
          {[
            { symbol: "BTC", value: prices.btc, desc: "Primary reserve" },
            { symbol: "ETH", value: prices.eth, desc: "Gas network core" },
          ].map((t) => (
            <div key={t.symbol} className="flex flex-col tabular-nums">
              <span className="text-[9px] font-bold text-orange-400/50">{t.symbol}</span>
              <span className="text-lg md:text-xl font-extrabold tracking-tight text-orange-400 mt-0.5">
                {t.value}
              </span>
              <span className="text-[8px] text-text-secondary/40">{t.desc}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 border-t border-orange-500/10 pt-2">
        <Link
          href="/blockchain"
          className="inline-block text-[9px] uppercase tracking-widest text-orange-400/50 hover:text-orange-300 transition-colors"
        >
          → INTERROGATE LEDGER BLOCKS
        </Link>
      </div>
    </div>
  );
}

function getFomoInterpretation(score: number): string {
  if (score >= 75) {
    return "[!] SYSTEM WARNING: Irrational exuberance detected. High susceptibility to corrections.";
  }
  if (score >= 55) {
    return "[ ] MARKET STATE: Stable expansion. Capital flow is positive.";
  }
  if (score >= 45) {
    return "[ ] MARKET STATE: Equilibrium. System state is neutral.";
  }
  if (score >= 25) {
    return "[ ] MARKET STATE: Anxiety spreading. Hedging protocols active.";
  }
  return "[!] SYSTEM WARNING: Extreme fear. High potential for capitulation/buying windows.";
}

function SentimentPanel({ fomo }: { fomo: FomoData }) {
  const score = fomo.score;
  const filledCount = Math.round(score / 5);
  const emptyCount = 20 - filledCount;
  const barStr = "█".repeat(filledCount) + "░".repeat(emptyCount);
  const relTime = useRelativeTime(fomo.updatedAt);

  return (
    <div className="relative flex flex-col justify-between h-[150px] md:h-[160px] p-4 md:p-5 text-yellow-400 font-mono">
      <PanelBackdrop accentClass="bg-yellow-500" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-yellow-400/60">
              SENTIMENT_ANALYSIS // RATIO
            </span>
            <span className="text-[9px] tabular-nums text-yellow-400/30">
              {fomo.status === "loading"
                ? "fetching..."
                : `${fomo.source}: ${relTime}${fomo.fallback ? " (fallback)" : ""}`}
            </span>
          </div>
          <div className="mt-3 flex items-end gap-1" style={{ height: 35 }}>
            {CANDLES.map((c, i) => (
              <div key={i} className="flex flex-col items-center justify-end w-3">
                <div
                  className={`w-0.5 flex-shrink-0 ${c.green ? "bg-emerald-400/50" : "bg-red-400/50"}`}
                  style={{ height: Math.max(1, c.top - 2), minHeight: 1 }}
                />
                <div
                  className={`w-full rounded-sm ${c.green ? "bg-emerald-500/80" : "bg-red-500/80"}`}
                  style={{ height: Math.max(4, c.body - 2), minHeight: 4 }}
                />
                <div
                  className={`w-0.5 flex-shrink-0 ${c.green ? "bg-emerald-400/50" : "bg-red-400/50"}`}
                  style={{ height: Math.max(1, c.bottom - 2), minHeight: 1 }}
                />
              </div>
            ))}
            <div className="ml-3 flex flex-col justify-end h-full">
              <p className="text-[8px] uppercase tracking-widest text-yellow-400/30">FOMO CLASS</p>
              <p className="text-[11px] font-extrabold text-yellow-400 uppercase mt-0.5">
                {fomo.status === "loading" ? "loading..." : fomo.label}
              </p>
            </div>
          </div>
        </div>

        {/* Tactical visual score readouts */}
        <div className="flex flex-col justify-center">
          <div className="flex items-baseline justify-between text-[10px] mb-0.5">
            <span className="text-yellow-400/50 uppercase tracking-wider text-[8px]">Index Score</span>
            <span className="font-bold text-yellow-400">{score} / 100</span>
          </div>
          {/* Cyberpunk ASCII horizontal progress bar */}
          <div className="text-xs tracking-widest text-yellow-400/80 mb-1.5 tabular-nums">
            [{barStr}]
          </div>
          <p className="text-[8px] text-text-primary/70 leading-snug line-clamp-2 italic">
            {getFomoInterpretation(score)}
          </p>
        </div>
      </div>

      <div className="relative z-10 border-t border-yellow-500/10 pt-2">
        <Link
          href="/investing"
          className="inline-block text-[9px] uppercase tracking-widest text-yellow-400/50 hover:text-yellow-300 transition-colors"
        >
          → OPTIMIZE PORTFOLIO WEIGHTS
        </Link>
      </div>
    </div>
  );
}

function TerminalPanel() {
  return (
    <div className="relative flex flex-col justify-between h-[150px] md:h-[160px] p-4 md:p-5 text-cyan-400 font-mono">
      <PanelBackdrop accentClass="bg-cyan-500" />

      <div>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-cyan-400/60">
          PHILOSOPHY_SHELL // SCRIPTURE
        </span>
        <div className="mt-3 flex items-start text-xs text-cyan-400">
          <span className="mr-2 font-bold select-none">&gt;</span>
          <div>
            <p className="leading-relaxed text-text-primary/95 font-medium">
              &quot;What has been will be again, what has been done will be done again; there is nothing new under the sun.&quot;
            </p>
            <p className="mt-1 text-[9px] text-cyan-400/50 uppercase tracking-widest">
              — Ecclesiastes 1:9 // RECURRING_CYCLE
            </p>
          </div>
          <span
            className="ml-1 inline-block h-[1.1em] w-[0.55em] animate-blink bg-cyan-400 align-middle"
            aria-hidden
          />
        </div>
      </div>

      <div className="relative z-10 border-t border-cyan-500/10 pt-2">
        <Link
          href="/philosophy"
          className="inline-block text-[9px] uppercase tracking-widest text-cyan-400/50 hover:text-cyan-300 transition-colors"
        >
          → DECONSTRUCT WORLD THEORY
        </Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// HUD Bar
// ---------------------------------------------------------------------------
export default function HudBar({ postCount = 0 }: HudBarProps) {
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

  const segmentCls = (id: PanelId, color: string) => {
    if (!isHome) {
      return `select-none px-2 py-0.5 rounded font-mono text-[10px] leading-none text-text-secondary/50 cursor-default`;
    }
    return `cursor-pointer select-none px-2 py-0.5 rounded transition-colors duration-150 font-mono text-[10px] leading-none ${
      activePanel === id
        ? `${color} bg-white/5`
        : `text-text-secondary/70 hover:${color}`
    }`;
  };

  const btcLabel = prices.status === "loading" ? "loading..." : prices.btc;

  // Active border glow class mapping
  const activeShadowClass =
    activePanel === "status"
      ? "border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.12)]"
      : activePanel === "ticker"
      ? "border-orange-500/30 shadow-[0_20px_50px_rgba(249,115,22,0.12)]"
      : activePanel === "sentiment"
      ? "border-yellow-500/30 shadow-[0_20px_50px_rgba(234,179,8,0.12)]"
      : activePanel === "terminal"
      ? "border-cyan-500/30 shadow-[0_20px_50px_rgba(6,182,212,0.12)]"
      : "border-[var(--border-subtle)]";

  return (
    <div ref={containerRef} className="relative z-40">
      {/* ── Main HUD strip ─────────────────────────────────────────────── */}
      <div className="h-8 overflow-hidden border-b border-[var(--border-subtle)] bg-[#0d0d0d]/95 backdrop-blur-sm">
        <div className="hud-ticker flex h-full items-center gap-0 whitespace-nowrap px-2 sm:px-4">

          {/* ● ONLINE segment */}
          {isHome ? (
            <button
              type="button"
              aria-label="System Status panel"
              aria-expanded={activePanel === "status"}
              onClick={() => toggle("status")}
              className={segmentCls("status", "text-emerald-400")}
            >
              <span className="text-emerald-400">●</span>
              <span className="ml-1 text-emerald-400/80">ONLINE</span>
            </button>
          ) : (
            <span className={segmentCls("status", "text-emerald-400")}>
              <span className="text-emerald-400/60">●</span>
              <span className="ml-1 text-text-secondary/50">ONLINE</span>
            </span>
          )}

          <span className="mx-1.5 text-white/10 select-none">│</span>

          {/* NODES */}
          {isHome ? (
            <button
              type="button"
              aria-label="System Status panel"
              aria-expanded={activePanel === "status"}
              onClick={() => toggle("status")}
              className={segmentCls("status", "text-emerald-400")}
            >
              NODES:&nbsp;{postCount}
            </button>
          ) : (
            <span className={segmentCls("status", "text-emerald-400")}>
              NODES:&nbsp;{postCount}
            </span>
          )}

          <span className="mx-1.5 text-white/10 select-none">│</span>

          {/* BTC */}
          {isHome ? (
            <button
              type="button"
              aria-label="Ticker panel"
              aria-expanded={activePanel === "ticker"}
              onClick={() => toggle("ticker")}
              className={segmentCls("ticker", "text-orange-400")}
            >
              BTC:&nbsp;{btcLabel}
              <span className="ml-0.5 text-[8px] opacity-25">▾</span>
            </button>
          ) : (
            <span className={segmentCls("ticker", "text-orange-400")}>
              BTC:&nbsp;{btcLabel}
            </span>
          )}

          <span className="mx-1.5 text-white/10 select-none">│</span>

          {/* FOMO */}
          {isHome ? (
            <button
              type="button"
              aria-label="Market Sentiment panel"
              aria-expanded={activePanel === "sentiment"}
              onClick={() => toggle("sentiment")}
              className={segmentCls("sentiment", "text-yellow-400")}
            >
              FOMO:&nbsp;{fomo.status === "loading" ? "loading..." : fomo.label}
            </button>
          ) : (
            <span className={segmentCls("sentiment", "text-yellow-400")}>
              FOMO:&nbsp;{fomo.status === "loading" ? "loading..." : fomo.label}
            </span>
          )}

          <span className="mx-1.5 text-white/10 select-none">│</span>

          {/* Terminal quote */}
          {isHome ? (
            <button
              type="button"
              aria-label="Terminal panel"
              aria-expanded={activePanel === "terminal"}
              onClick={() => toggle("terminal")}
              className={segmentCls("terminal", "text-cyan-400")}
            >
              <span className="text-cyan-400/60 mr-0.5">&gt;</span>
              &nbsp;Ecclesiastes 1:9
            </button>
          ) : (
            <span className={segmentCls("terminal", "text-cyan-400")}>
              <span className="text-text-secondary/30 mr-0.5">&gt;</span>
              &nbsp;Ecclesiastes 1:9
            </span>
          )}

          {/* Spacer so the strip looks balanced on wide screens */}
          <span className="flex-1" />

          {activePanel && isHome && (
            <button
              type="button"
              aria-label="Close panel"
              onClick={() => setActivePanel(null)}
              className="ml-2 px-2 font-mono text-[10px] text-text-secondary/50 hover:text-text-primary transition-colors"
            >
              [×]
            </button>
          )}
        </div>
      </div>

      {/* ── Large drop-down overlay panel (Only rendered on the homepage) ── */}
      {activePanel && isHome && (
        <div
          className={`absolute left-0 right-0 top-full z-50 border-b border-t-0 bg-[#0f0f0f]/98 backdrop-blur-md transition-all duration-300 ${activeShadowClass}`}
          role="dialog"
          aria-label="HUD detail panel"
        >
          <div className="mx-auto max-w-6xl">
            {activePanel === "status"    && <StatusPanel postCount={postCount} />}
            {activePanel === "ticker"    && <TickerPanel prices={prices} />}
            {activePanel === "sentiment" && <SentimentPanel fomo={fomo} />}
            {activePanel === "terminal"  && <TerminalPanel />}
          </div>
        </div>
      )}
    </div>
  );
}
