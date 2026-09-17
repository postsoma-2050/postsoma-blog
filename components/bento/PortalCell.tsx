"use client";

import React from "react";

export default function PortalCell() {
  return (
    <div className="pt-10 pb-6 border-t-[0.5px] border-[var(--border-subtle)]">
      <a
        href="https://postsoma-2050.website"
        target="_blank"
        rel="noopener noreferrer"
        style={{ "--hover-color": "var(--accent-philosophy)" } as React.CSSProperties}
        className="group relative block -mx-4 px-5 py-4 rounded-[20px] transition-all duration-150 ease-out hover:bg-black/[0.035] dark:hover:bg-white/[0.04] hover:-translate-y-0.5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* 左侧：微型状态 + 项目名称与定位 */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider uppercase text-[var(--text-muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-philosophy)] animate-pulse" />
              <span className="font-semibold text-[var(--text-primary)]">POSTSOMA MATRIX</span>
              <span className="opacity-40">/</span>
              <span>MASTER SYSTEM</span>
            </div>
            <div className="flex items-center gap-2">
              <h3 className="font-sans text-[1.1rem] font-semibold text-[var(--text-primary)] group-hover:text-[var(--hover-color)] transition-colors">
                Armory Deployed Tools
              </h3>
            </div>
            <p className="font-sans text-[0.85rem] text-[var(--text-secondary)] leading-relaxed line-clamp-1">
              The full production nexus of web instruments, AI agents, and deployed artifacts.
            </p>
          </div>

          {/* 右侧：极简外跳微标 */}
          <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px] text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors pt-1 sm:pt-0">
            <span>ENTER ARMORY</span>
            <svg 
              className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </div>
        </div>
      </a>
    </div>
  );
}
