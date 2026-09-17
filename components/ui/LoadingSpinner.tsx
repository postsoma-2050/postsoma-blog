export function LoadingSpinner({
  className = "w-7 h-7",
  text = "TRANSMITTING...",
}: {
  className?: string;
  text?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 animate-in fade-in duration-200">
      {/* 极简工匠 SVG Tail-Spin Loader */}
      <svg
        viewBox="0 0 38 38"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} stroke-[var(--text-secondary)]`}
      >
        <defs>
          <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="spinner-grad">
            <stop stopColor="currentColor" stopOpacity="0" offset="0%" />
            <stop stopColor="currentColor" stopOpacity=".2" offset="63.147%" />
            <stop stopColor="currentColor" stopOpacity="1" offset="100%" />
          </linearGradient>
        </defs>
        <g fill="none" fillRule="evenodd">
          <g transform="translate(1 1)">
            <path
              d="M36 18c0-9.94-8.06-18-18-18"
              id="Oval-2"
              stroke="url(#spinner-grad)"
              strokeWidth="2.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </path>
            <circle fill="currentColor" cx="36" cy="18" r="1.5">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 18 18"
                to="360 18 18"
                dur="0.8s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        </g>
      </svg>

      {/* 微型工匠提示字 */}
      {text && (
        <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)] uppercase select-none animate-pulse">
          {text}
        </span>
      )}
    </div>
  );
}
