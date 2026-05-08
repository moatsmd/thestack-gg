import type { Recap } from '@/types/replay'
import { buildLifeSeries } from '@/lib/recap-analysis'

const PLAYER_COLORS = [
  'hsl(42 75% 55%)', // gold (primary)
  'hsl(200 80% 65%)', // blue
  'hsl(0 70% 60%)', // red
  'hsl(140 50% 60%)', // green
  'hsl(280 60% 70%)', // purple
  'hsl(30 70% 60%)', // orange
]

type Props = {
  recap: Recap
  /** Inner width of the graph in px. Height is derived. */
  width?: number
  height?: number
}

/**
 * Hand-rolled SVG life graph. No charting dependency.
 *
 * One polyline per player. X axis is event sequence (life-affecting events
 * only). Y axis is life total, scaled with a small headroom above starting
 * life and below the lowest seen value.
 */
export function RecapLifeGraph({ recap, width = 720, height = 280 }: Props) {
  const series = buildLifeSeries(recap)
  const padding = { top: 16, right: 16, bottom: 28, left: 36 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom

  const xMax = Math.max(1, series.points.length - 1)
  const yMin = Math.min(0, series.min - 2)
  const yMax = Math.max(recap.startingLife + 2, series.max + 2)
  const yRange = Math.max(1, yMax - yMin)

  const xPos = (i: number) => padding.left + (i / xMax) * innerW
  const yPos = (life: number) =>
    padding.top + innerH - ((life - yMin) / yRange) * innerH

  const ticks = computeTicks(yMin, yMax)

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Life totals over the course of the game"
      className="w-full h-auto"
    >
      <rect x={0} y={0} width={width} height={height} fill="transparent" />

      {/* Y-axis gridlines + labels */}
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={padding.left}
            x2={padding.left + innerW}
            y1={yPos(t)}
            y2={yPos(t)}
            stroke="hsl(38 15% 60% / 0.18)"
            strokeWidth={1}
          />
          <text
            x={padding.left - 8}
            y={yPos(t) + 4}
            textAnchor="end"
            fontSize={11}
            fill="hsl(38 15% 60%)"
            fontFamily="var(--font-prose), serif"
          >
            {t}
          </text>
        </g>
      ))}

      {/* Zero line emphasis if visible */}
      {yMin <= 0 && yMax >= 0 && (
        <line
          x1={padding.left}
          x2={padding.left + innerW}
          y1={yPos(0)}
          y2={yPos(0)}
          stroke="hsl(0 70% 60% / 0.4)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      )}

      {/* Per-player lines */}
      {recap.players.map((player, idx) => {
        const color = PLAYER_COLORS[idx % PLAYER_COLORS.length]
        const path = series.points
          .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i).toFixed(1)} ${yPos(pt.values[player.id] ?? recap.startingLife).toFixed(1)}`)
          .join(' ')
        return (
          <g key={player.id}>
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End-of-line dot */}
            <circle
              cx={xPos(series.points.length - 1)}
              cy={yPos(series.points[series.points.length - 1]?.values[player.id] ?? recap.startingLife)}
              r={3.5}
              fill={color}
            />
          </g>
        )
      })}

      {/* Player legend */}
      <g>
        {recap.players.map((player, idx) => {
          const color = PLAYER_COLORS[idx % PLAYER_COLORS.length]
          const x = padding.left + idx * 130
          const y = height - 8
          return (
            <g key={player.id}>
              <line x1={x} x2={x + 14} y1={y} y2={y} stroke={color} strokeWidth={2} />
              <text
                x={x + 18}
                y={y + 3.5}
                fontSize={11}
                fill="hsl(38 30% 88% / 0.85)"
                fontFamily="var(--font-prose), serif"
              >
                {player.name}
              </text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/** Pick 4–6 round-number ticks across [yMin, yMax]. */
function computeTicks(yMin: number, yMax: number): number[] {
  const range = yMax - yMin
  let step = 5
  if (range > 60) step = 20
  else if (range > 30) step = 10
  const start = Math.ceil(yMin / step) * step
  const ticks: number[] = []
  for (let v = start; v <= yMax; v += step) {
    ticks.push(v)
  }
  return ticks
}
