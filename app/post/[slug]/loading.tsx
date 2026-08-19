export default function PostLoading() {
  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 pt-6 sm:pt-12">
        {/* 1. Header Skeleton */}
        <header className="mb-10 text-center">
          {/* Category link skeleton */}
          <div className="mx-auto mb-4 h-5 w-28 animate-pulse rounded bg-cyan-950/40 border border-cyan-500/20" />

          {/* Title skeleton */}
          <div className="mx-auto mb-3 h-10 w-4/5 max-w-2xl animate-pulse rounded bg-white/10" />
          <div className="mx-auto mb-4 h-8 w-3/5 max-w-lg animate-pulse rounded bg-white/5" />

          {/* Meta line skeleton */}
          <div className="mx-auto flex items-center justify-center gap-3">
            <div className="h-4 w-20 animate-pulse rounded bg-white/5" />
            <span className="text-white/10">·</span>
            <div className="h-4 w-24 animate-pulse rounded bg-white/5" />
            <span className="text-white/10">·</span>
            <div className="h-4 w-16 animate-pulse rounded bg-white/5" />
          </div>
        </header>

        {/* 2. Cyberpunk Decryption Stream Status Card */}
        <div className="mb-10 relative overflow-hidden rounded-lg border border-cyan-500/30 bg-cyan-950/15 p-5 font-mono text-xs shadow-[0_0_30px_rgba(0,240,255,0.08)] backdrop-blur-sm">
          {/* Scanline background */}
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.2) 2px, rgba(0,240,255,0.2) 4px)",
            }}
          />

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-[11px]">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                NEURAL_LINK // ACCESSING ARCHIVE BLOCKS
              </span>
              <span className="text-[10px] text-cyan-400/60 uppercase tracking-widest hidden sm:inline">
                SYS.DECRYPTOR_V2
              </span>
            </div>

            <p className="text-gray-300 text-xs flex items-center gap-2">
              <span className="text-cyan-400 font-bold">&gt;</span>
              <span className="animate-pulse text-cyan-200">
                Fetching neural memory nodes from Notion database core...
              </span>
            </p>

            {/* ASCII progress bar */}
            <div className="flex items-center gap-3 text-cyan-400/80 text-[11px] tabular-nums">
              <span className="text-cyan-400 font-bold">STREAM:</span>
              <div className="h-2 flex-1 rounded bg-black/60 overflow-hidden border border-cyan-500/20">
                <div className="h-full w-2/3 bg-gradient-to-r from-cyan-600 via-cyan-400 to-white animate-pulse" />
              </div>
              <span className="text-[10px] text-cyan-400/70">DECRYPTING...</span>
            </div>
          </div>
        </div>

        {/* 3. AI Card Skeleton */}
        <div className="mb-10 rounded-xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-cyan-400/30 animate-pulse" />
            <div className="h-4 w-28 rounded bg-cyan-400/20 animate-pulse" />
          </div>
          <div className="h-3 w-full rounded bg-white/5 animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-white/5 animate-pulse" />
        </div>

        {/* 4. Article Body Skeletons */}
        <div className="space-y-6 pt-2">
          <div className="space-y-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[96%] animate-pulse rounded bg-white/5" />
            <div className="h-4 w-[92%] animate-pulse rounded bg-white/5" />
            <div className="h-4 w-[85%] animate-pulse rounded bg-white/5" />
          </div>

          <div className="my-8 h-48 sm:h-64 w-full animate-pulse rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
            <span className="font-mono text-xs text-white/20 uppercase tracking-widest">
              [ MEDIA_BUFFER // RENDERING VISUAL NODE ]
            </span>
          </div>

          <div className="space-y-2.5">
            <div className="h-4 w-full animate-pulse rounded bg-white/10" />
            <div className="h-4 w-[98%] animate-pulse rounded bg-white/5" />
            <div className="h-4 w-[94%] animate-pulse rounded bg-white/5" />
            <div className="h-4 w-[78%] animate-pulse rounded bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  );
}
