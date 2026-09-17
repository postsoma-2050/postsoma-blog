"use client";

import { RiCompass3Line, RiAlignLeft, RiFlashlightLine, RiNodeTree } from "@remixicon/react";

interface AISummaryData {
  keyTakeaway?: string;
  key_takeaway?: string;
  keyPoints?: string[];
  key_points?: string[];
  readingGuide?: string;
  reading_guide?: string;
}

interface AICardProps {
  rawSummary: string;
  readingTime?: number;
}

export default function AICard({ rawSummary, readingTime }: AICardProps) {
  if (!rawSummary || rawSummary.trim() === "") return null;

  let data: AISummaryData | null = null;
  let isJson = false;

  try {
    data = JSON.parse(rawSummary);
    isJson = typeof data === "object" && data !== null;
  } catch {
    isJson = false;
  }

  // 1. JSON Structured Rendering
  if (isJson && data) {
    const takeaway = data?.keyTakeaway || data?.key_takeaway;
    const points = data?.keyPoints || data?.key_points;
    const guide =
      data?.readingGuide ||
      data?.reading_guide ||
      (readingTime ? `Estimated read: ${readingTime} min` : undefined);

    if (!takeaway && (!points || points.length === 0) && !guide) {
      return null;
    }

    return (
      <section
        className="my-10 rounded-[24px] border-[0.5px] border-[var(--summary-border)] bg-[var(--summary-bg)] backdrop-blur-md shadow-[var(--card-inset)] p-5 sm:p-6 transition-colors"
        aria-label="Executive Summary"
      >
        {/* Top Bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3.5">
          <div className="flex items-center gap-2">
            <RiAlignLeft className="w-4 h-4 text-[var(--text-muted)]" />
            <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-primary)] font-semibold">
              Executive Summary · 導讀綱要
            </span>
          </div>
          {guide && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
              <RiCompass3Line className="w-3.5 h-3.5 opacity-70" />
              <span>{guide}</span>
            </div>
          )}
        </div>

        {/* Key Takeaway */}
        {takeaway && (
          <div className="space-y-1.5">
            <h4 className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <RiFlashlightLine className="w-3.5 h-3.5 opacity-70" />
              Core Takeaway
            </h4>
            <p className="font-sans text-[0.98rem] leading-[1.7] text-[var(--text-secondary)] pl-3.5 border-l-2 border-[var(--border-default)]">
              {takeaway}
            </p>
          </div>
        )}

        {/* Thought Nodes */}
        {points && points.length > 0 && (
          <div className="mt-5 space-y-2.5">
            <h4 className="font-mono text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <RiNodeTree className="w-3.5 h-3.5 opacity-70" />
              Key Insights
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-3.5">
              {points.map((point, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 font-sans text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed"
                >
                  <span className="font-mono text-xs text-[var(--text-muted)] shrink-0 mt-0.5">
                    0{index + 1}.
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    );
  }

  // 2. Plain Text Summary Rendering
  return (
    <section
      className="my-10 rounded-[24px] border-[0.5px] border-[var(--summary-border)] bg-[var(--summary-bg)] backdrop-blur-md shadow-[var(--card-inset)] p-5 sm:p-6 transition-colors"
      aria-label="Executive Summary"
    >
      {/* Top Bar */}
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <RiAlignLeft className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="font-mono text-xs uppercase tracking-wider text-[var(--text-primary)] font-semibold">
            Executive Summary · 內容大綱
          </span>
        </div>
        {readingTime && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--text-muted)]">
            <RiCompass3Line className="w-3.5 h-3.5 opacity-70" />
            <span>約 {readingTime} 分鐘閱讀</span>
          </div>
        )}
      </div>

      <p className="font-sans text-[0.98rem] leading-[1.7] text-[var(--text-secondary)] pl-3.5 border-l-2 border-[var(--border-default)]">
        {rawSummary}
      </p>
    </section>
  );
}
