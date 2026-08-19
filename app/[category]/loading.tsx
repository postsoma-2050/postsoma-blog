export default function CategoryLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-12">
      {/* Category Header Skeleton */}
      <header className="mb-8 border-b border-white/10 pb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-widest">
            SYS.CATEGORY // ARCHIVE INDEX
          </span>
        </div>
        <div className="h-9 w-64 animate-pulse rounded bg-white/10 mb-3" />
        <div className="h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />

        {/* Sub-category pill filters skeleton */}
        <div className="mt-6 flex flex-wrap gap-2">
          <div className="h-7 w-16 animate-pulse rounded-full bg-cyan-500/20 border border-cyan-500/30" />
          <div className="h-7 w-24 animate-pulse rounded-full bg-white/5 border border-white/10" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-white/5 border border-white/10" />
          <div className="h-7 w-28 animate-pulse rounded-full bg-white/5 border border-white/10" />
        </div>
      </header>

      {/* Grid of PostCard skeletons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col h-48 rounded border border-white/5 bg-neutral-900/60 p-4 relative overflow-hidden"
          >
            <div className="h-3 w-20 bg-white/10 rounded animate-pulse mb-3" />
            <div className="h-5 w-4/5 bg-white/15 rounded animate-pulse mb-2" />
            <div className="h-5 w-3/5 bg-white/10 rounded animate-pulse mb-4" />
            <div className="h-3 w-full bg-white/5 rounded animate-pulse mb-2" />
            <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
            <div className="mt-auto flex gap-2 pt-3 border-t border-white/5">
              <div className="h-3 w-12 bg-white/5 rounded" />
              <div className="h-3 w-16 bg-white/5 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
