type LogoProps = {
  size?: number
  withWord?: boolean
  className?: string
}

export function Logo({ size = 32, withWord = false, className = '' }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="TheStack.gg"
    >
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="goldStroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(45 80% 75%)" />
            <stop offset="100%" stopColor="hsl(38 65% 45%)" />
          </linearGradient>
          <filter id="logoGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g
          stroke="url(#goldStroke)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          fill="none"
          filter="url(#logoGlow)"
        >
          <rect x="7" y="13" width="18" height="11" rx="1.5" />
          <rect x="9" y="9" width="14" height="11" rx="1.5" fill="hsl(220 15% 9%)" />
          <rect x="11" y="5" width="10" height="11" rx="1.5" fill="hsl(220 15% 11%)" />
        </g>
        <circle cx="16" cy="10.5" r="1.1" fill="hsl(42 75% 55%)" />
      </svg>
      {withWord && (
        <span className="font-display text-gold-gradient text-lg tracking-wide font-semibold">
          TheStack<span className="opacity-70">.gg</span>
        </span>
      )}
    </span>
  )
}
