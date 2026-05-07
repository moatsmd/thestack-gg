'use client'

import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'

/**
 * 2D die with framer-motion spring physics: an SVG silhouette of the
 * appropriate polygon (triangle for d4, square for d6, hexagon for d20...)
 * tumbles, wobbles, and bounces while rolling, then settles. The rolled
 * number fades in over the silhouette once the spin is done.
 *
 * Deliberately not a 3D model — the point is anticipation + payoff and a
 * recognizable shape per die type, not a physics sim.
 *
 * Ported from the original workspace prototype that the user signed off on,
 * keyed to TheStack.gg's existing accent-1 (candlegold) CSS variable.
 */
export function Die3D({
  value,
  rolling,
  size = 200,
  faces = 20,
}: {
  value: number
  rolling: boolean
  size?: number
  faces?: number
}) {
  const reduce = useReducedMotion()

  // Each die type gets a recognizable silhouette
  const polygon = useMemo(() => silhouettePoints(faces, size * 0.42), [faces, size])

  // Random wobble path so each roll feels different.
  // Recomputed whenever rolling kicks off or value changes, never per render.
  const wobble = useMemo(() => {
    const rx = (Math.random() * 2 - 1) * 18
    const ry = (Math.random() * 2 - 1) * 18
    const rz = 360 + Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)
    return { rx, ry, rz }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolling, value])

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${rolling ? 'Rolling' : 'Result'} d${faces}: ${value}`}
    >
      {/* "dN" tag floats above */}
      <div
        className="absolute left-1/2 -translate-x-1/2 text-[10px] tracking-[0.28em] uppercase pointer-events-none"
        style={{ top: -22, color: 'hsl(45 70% 60% / 0.85)', fontFamily: 'var(--font-heading), serif' }}
      >
        d{faces}
      </div>

      {/* The die — SVG silhouette, outer rotation */}
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={
          rolling && !reduce
            ? { rotate: wobble.rz, scale: [1, 1.06, 0.96, 1.02, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={
          rolling && !reduce
            ? { duration: 0.85, ease: [0.18, 0.7, 0.25, 1] }
            : { type: 'spring', stiffness: 240, damping: 18, mass: 0.7 }
        }
      >
        {/* Inner translation jitter, layered on top of the rotation */}
        <motion.div
          animate={
            rolling && !reduce
              ? { x: [0, 6, -8, 4, -2, 0], y: [0, -5, 4, -3, 2, 0] }
              : { x: 0, y: 0 }
          }
          transition={rolling ? { duration: 0.85, ease: 'easeOut' } : { duration: 0.2 }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`-${size / 2} -${size / 2} ${size} ${size}`}
            style={{ display: 'block' }}
          >
            <defs>
              <linearGradient id={`dieFill-${faces}`} x1="0" y1="-1" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38 35% 22%)" />
                <stop offset="55%" stopColor="hsl(36 28% 14%)" />
                <stop offset="100%" stopColor="hsl(34 22% 8%)" />
              </linearGradient>
              <linearGradient id={`dieStroke-${faces}`} x1="0" y1="-1" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(45 80% 65%)" />
                <stop offset="100%" stopColor="hsl(38 50% 30%)" />
              </linearGradient>
              <radialGradient id={`dieGleam-${faces}`} cx="0.3" cy="0.3" r="0.7">
                <stop offset="0%" stopColor="hsl(45 70% 55% / 0.28)" />
                <stop offset="60%" stopColor="hsl(45 70% 55% / 0)" />
              </radialGradient>
              <filter id={`dieGlow-${faces}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* The polygon outline with gold stroke and candlelit glow */}
            <polygon
              points={polygon}
              fill={`url(#dieFill-${faces})`}
              stroke={`url(#dieStroke-${faces})`}
              strokeWidth={3}
              strokeLinejoin="round"
              filter={`url(#dieGlow-${faces})`}
            />
            {/* Faceted highlight inside */}
            <polygon
              points={polygon}
              fill={`url(#dieGleam-${faces})`}
              stroke="none"
            />
            {/* Inner faceting lines from each vertex to centre — hints at
                3D facets without modeling them */}
            <FacetingLines points={polygon} />
          </svg>
        </motion.div>
      </motion.div>

      {/* The number — fades in once the spin settles */}
      <div className="absolute inset-0 grid place-items-center pointer-events-none">
        <AnimatePresence mode="wait">
          {!rolling && (
            <motion.span
              key={`val-${value}-${faces}`}
              initial={{ opacity: 0, scale: 0.5, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.85, filter: 'blur(4px)' }}
              transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
              className="tabular-nums"
              style={{
                fontFamily: 'var(--font-heading), serif',
                fontSize: value >= 100 ? size * 0.32 : size * 0.5,
                color: 'hsl(45 85% 65%)',
                textShadow:
                  '0 0 24px hsl(42 75% 55% / 0.55), 0 2px 8px hsl(0 0% 0% / 0.7)',
                fontWeight: 700,
                letterSpacing: '0.02em',
                lineHeight: 1,
              }}
            >
              {value}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Floor shadow — squashes and stretches with the bounce */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 rounded-[50%]"
        style={{
          bottom: -size * 0.06,
          width: size * 0.7,
          height: size * 0.08,
          background:
            'radial-gradient(ellipse, hsl(0 0% 0% / 0.6), transparent 70%)',
          filter: 'blur(6px)',
        }}
        animate={
          rolling
            ? { scaleX: [1, 0.7, 1.15, 1], opacity: [0.7, 0.4, 0.85, 0.7] }
            : { scaleX: 1, opacity: 0.7 }
        }
        transition={{ duration: 0.85, ease: 'easeOut' }}
      />
    </div>
  )
}

/**
 * Build a polygon path for each die type that reads as that die's "shape".
 * d4 → upward triangle, d6 → square, d8 → diamond (octahedron silhouette),
 * d10 → elongated hexagon (kite-like), d12 → pentagon, d20 → hexagon
 * (icosahedron silhouette), d100 → near-circle decagon.
 */
function silhouettePoints(faces: number, r: number): string {
  let n: number
  let rotation = -Math.PI / 2 // start straight up by default
  switch (faces) {
    case 4:
      n = 3
      rotation = -Math.PI / 2
      break
    case 6:
      n = 4
      rotation = -Math.PI / 4 // square
      break
    case 8:
      n = 4
      rotation = -Math.PI / 2 // diamond
      break
    case 10:
      n = 6
      rotation = -Math.PI / 2 // elongated hexagon
      break
    case 12:
      n = 5
      rotation = -Math.PI / 2 // pentagon
      break
    case 20:
      n = 6
      rotation = -Math.PI / 6 // hexagon
      break
    case 100:
      n = 10
      rotation = -Math.PI / 2 // near-circle
      break
    default:
      n = 6
  }
  const pts: string[] = []
  for (let i = 0; i < n; i++) {
    const ang = rotation + (i / n) * Math.PI * 2
    let rr = r
    // Slightly elongate the d10 vertically to feel kite-like
    if (faces === 10) rr = i % 2 === 0 ? r * 1.15 : r * 0.95
    const x = Math.cos(ang) * rr
    const y = Math.sin(ang) * rr
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return pts.join(' ')
}

/** A few interior lines from polygon vertices to centre to suggest facets. */
function FacetingLines({ points }: { points: string }) {
  const verts = points.split(' ').map((p) => p.split(',').map(Number) as [number, number])
  return (
    <g opacity={0.35}>
      {verts.map(([x, y], i) => (
        <line
          key={i}
          x1={x}
          y1={y}
          x2={0}
          y2={0}
          stroke="hsl(40 50% 35%)"
          strokeWidth={1}
        />
      ))}
    </g>
  )
}
