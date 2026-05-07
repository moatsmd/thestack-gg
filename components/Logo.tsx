type LogoProps = {
  size?: number
  withWord?: boolean
  className?: string
}

/**
 * TheStack.gg mark.
 *
 * Three cascading cards on the stack — bottom card laid back, middle card
 * upright, top card leaning forward like the next spell to resolve. A small
 * ember sits at the apex (the priority pip).
 *
 * Designed on a 32x32 grid. Scales cleanly from 16px (favicon) to 1024px+
 * (affiliate submissions). Uses currentColor for ember tone in monochrome
 * contexts; gold gradient otherwise.
 */
export function Logo({ size = 32, withWord = false, className = '' }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-3 ${className}`}
      aria-label="TheStack.gg"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="ts-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(45 85% 78%)" />
            <stop offset="55%" stopColor="hsl(42 75% 58%)" />
            <stop offset="100%" stopColor="hsl(38 65% 38%)" />
          </linearGradient>
          <linearGradient id="ts-card-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(220 18% 13%)" />
            <stop offset="100%" stopColor="hsl(220 22% 8%)" />
          </linearGradient>
          <radialGradient id="ts-ember" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="hsl(45 95% 80%)" />
            <stop offset="60%" stopColor="hsl(42 80% 58%)" />
            <stop offset="100%" stopColor="hsl(38 70% 40%)" stopOpacity="0" />
          </radialGradient>
          <filter id="ts-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="0.55" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#ts-glow)">
          {/* Bottom card — laid back, leaning left */}
          <g transform="rotate(-14 16 22)">
            <rect
              x="6.5"
              y="14.5"
              width="19"
              height="13"
              rx="1.6"
              fill="url(#ts-card-fill)"
              stroke="url(#ts-gold)"
              strokeWidth="1.1"
              strokeOpacity="0.6"
            />
          </g>

          {/* Middle card — square to the viewer */}
          <rect
            x="8"
            y="10"
            width="16"
            height="14"
            rx="1.5"
            fill="url(#ts-card-fill)"
            stroke="url(#ts-gold)"
            strokeWidth="1.2"
            strokeOpacity="0.85"
          />

          {/* Top card — leaning forward, rising onto the stack */}
          <g transform="rotate(10 16 10)">
            <rect
              x="9.5"
              y="4.5"
              width="13"
              height="13.5"
              rx="1.5"
              fill="url(#ts-card-fill)"
              stroke="url(#ts-gold)"
              strokeWidth="1.3"
            />
            {/* Inner border on the top card — gives the codex feel */}
            <rect
              x="11"
              y="6"
              width="10"
              height="10.5"
              rx="0.8"
              fill="none"
              stroke="url(#ts-gold)"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />
          </g>
        </g>

        {/* Ember — the priority pip */}
        <circle cx="20.2" cy="6.6" r="2.4" fill="url(#ts-ember)" />
        <circle cx="20.2" cy="6.6" r="0.85" fill="hsl(48 95% 88%)" />
      </svg>
      {withWord && (
        <span className="font-display text-gold-gradient text-lg tracking-wide font-semibold">
          TheStack<span className="opacity-70">.gg</span>
        </span>
      )}
    </span>
  )
}
