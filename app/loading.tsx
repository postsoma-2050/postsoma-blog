export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative flex flex-col items-center gap-4 font-mono">
        {/* Pulsing ring indicator */}
        <div className="relative flex h-14 w-14 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-25" />
          <span className="relative inline-flex rounded-full h-8 w-8 bg-cyan-500/20 border border-cyan-400 items-center justify-center text-cyan-300 text-xs shadow-[0_0_15px_rgba(0,240,255,0.5)]">
            ●
          </span>
        </div>

        {/* Status text */}
        <div className="text-center space-y-1">
          <p className="text-xs uppercase font-bold tracking-widest text-cyan-400 animate-pulse">
            [ POSTSOMA_2050 // LOADING NODE ]
          </p>
          <p className="text-[10px] text-text-secondary/60">
            Establishing secure connection to Notion neural database...
          </p>
        </div>
      </div>
    </div>
  );
}
