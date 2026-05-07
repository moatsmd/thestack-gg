'use client'

import { useEffect, useRef, useState } from 'react'
import { Die3D } from './Die3D'
import { GoldRule } from './Fleuron'

type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100

/**
 * Time the dice silhouette tumbles before the rolled number fades in.
 * Matches the 0.85s framer-motion spin transition in <Die3D />, with a small
 * buffer so the number's blur-fade-in starts after the spin clearly settles.
 * Reduced-motion users skip the animation entirely.
 */
const ROLL_MS = 900

interface RollEntry {
  id: string
  die: DieType
  result: number
  timestamp: number
}

const DICE: DieType[] = [4, 6, 8, 10, 12, 20, 100]

function rollDie(sides: DieType): number {
  return Math.floor(Math.random() * sides) + 1
}

/** Small button-grid icon for each die type. The big animated die in the
    result panel is <Die3D /> in components/Die3D.tsx. */
function DieSvg({ sides }: { sides: DieType }) {
  const shapes: Record<DieType, React.ReactNode> = {
    4: <polygon points="12,2 22,20 2,20" fill="none" stroke="currentColor" strokeWidth={1.5} />,
    6: <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth={1.5} />,
    8: <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth={1.5} />,
    10: <polygon points="12,2 21,8 18,19 6,19 3,8" fill="none" stroke="currentColor" strokeWidth={1.5} />,
    12: <polygon points="12,2 19,5 22,12 19,19 12,22 5,19 2,12 5,5" fill="none" stroke="currentColor" strokeWidth={1.5} />,
    20: <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="none" stroke="currentColor" strokeWidth={1.5} />,
    100: <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.5} />,
  }
  return (
    <svg viewBox="0 0 24 24" className="w-8 h-8 mb-1">
      {shapes[sides]}
    </svg>
  )
}

export function DiceRoller() {
  const [lastResult, setLastResult] = useState<number | null>(null)
  const [lastDie, setLastDie] = useState<DieType | null>(null)
  const [history, setHistory] = useState<RollEntry[]>([])
  const [queue, setQueue] = useState<DieType[]>([])
  const [isRolling, setIsRolling] = useState(false)
  const rollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) clearTimeout(rollTimerRef.current)
    }
  }, [])

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
  }

  const commitRoll = (results: { die: DieType; result: number }[]) => {
    const entries: RollEntry[] = results.map(({ die, result }) => ({
      id: crypto.randomUUID(),
      die,
      result,
      timestamp: Date.now(),
    }))
    const total = results.reduce((sum, r) => sum + r.result, 0)
    const lastDieType = results[results.length - 1].die

    // Skip animation in jsdom / SSR / prefers-reduced-motion → settle immediately.
    const shouldAnimate =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!shouldAnimate) {
      setLastDie(lastDieType)
      setLastResult(total)
      setHistory((prev) => [...entries, ...prev].slice(0, 10))
      setQueue([])
      return
    }

    // Show the wobble + hide the number, then fade the final value in.
    setLastDie(lastDieType)
    setLastResult(null)
    setIsRolling(true)
    setQueue([])

    if (rollTimerRef.current) clearTimeout(rollTimerRef.current)
    rollTimerRef.current = setTimeout(() => {
      setLastResult(total)
      setIsRolling(false)
      setHistory((prev) => [...entries, ...prev].slice(0, 10))
    }, ROLL_MS)
  }

  const handleDieClick = (sides: DieType) => {
    commitRoll([{ die: sides, result: rollDie(sides) }])
  }

  const handleQueueDie = (sides: DieType) => {
    setQueue((prev) => [...prev, sides])
  }

  const handleRollQueue = () => {
    if (queue.length === 0) return
    commitRoll(queue.map((die) => ({ die, result: rollDie(die) })))
  }

  const queueCounts = queue.reduce<Partial<Record<DieType, number>>>((acc, d) => {
    acc[d] = (acc[d] ?? 0) + 1
    return acc
  }, {} as Partial<Record<DieType, number>>)

  return (
    <div className="min-h-screen text-[hsl(38_30%_88%)]">
      <div className="max-w-lg mx-auto px-4 pt-6 md:pt-12 pb-8 space-y-6">

        <header className="text-center">
          <div className="flex items-center justify-center"><GoldRule /></div>
          <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">Cast the Bones</p>
          <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Dice</h1>
          <p className="font-prose italic text-[hsl(38_30%_88%)]/80 mt-1">Tap a face. Read your fate.</p>
        </header>

        <div
          className="panel codex-glow panel-gilded p-8 text-center flex flex-col items-center justify-center"
          style={{ minHeight: 280 }}
          aria-live="polite"
        >
          {lastDie !== null && (lastResult !== null || isRolling) ? (
            <Die3D
              value={lastResult ?? 0}
              rolling={isRolling}
              size={200}
              faces={lastDie}
            />
          ) : (
            <span
              data-testid="roll-result"
              className="font-display text-6xl text-[hsl(38_15%_60%)]/60"
            >
              —
            </span>
          )}
          {/* Off-screen authoritative result — carries data-testid so tests
              and screen readers always read "<number>" exactly when settled,
              independent of <Die3D>'s visual markup. Hidden during rolls. */}
          {lastResult !== null && (
            <span
              data-testid="roll-result"
              className="sr-only"
            >
              {lastResult}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {DICE.map((sides) => (
            <button
              key={sides}
              type="button"
              onClick={() => handleDieClick(sides)}
              onContextMenu={(e) => { e.preventDefault(); handleQueueDie(sides) }}
              className="relative flex flex-col items-center justify-center py-4 panel-elevated hover-elevate active-elevate-2 transition font-display tracking-wider text-[hsl(38_30%_88%)]"
              data-testid={`die-d${sides}`}
              title={`Roll d${sides}`}
            >
              <span className="text-primary"><DieSvg sides={sides} /></span>
              <span className="text-xs text-[hsl(38_15%_60%)]">d{sides}</span>
              {(queueCounts[sides] ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                  {queueCounts[sides]}
                </span>
              )}
            </button>
          ))}
        </div>

        {queue.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-[hsl(38_15%_60%)] text-center font-prose italic">
              Queued: {queue.map((d) => `d${d}`).join(', ')}
            </p>
            <button
              type="button"
              onClick={handleRollQueue}
              className="w-full py-4 rounded-md bg-primary text-primary-foreground font-display tracking-wide text-lg hover-elevate active-elevate-2 transition"
              data-testid="roll-queue"
            >
              Roll {queue.length} {queue.length === 1 ? 'die' : 'dice'}
            </button>
            <button
              type="button"
              onClick={() => setQueue([])}
              className="w-full py-2 text-sm text-[hsl(38_15%_60%)] hover:text-[hsl(38_30%_88%)] transition font-display tracking-wide"
            >
              Clear queue
            </button>
          </div>
        )}

        {history.length > 0 && (
          <section className="panel p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-display tracking-[0.18em] uppercase text-[10px] text-[hsl(38_15%_60%)]">Roll history</p>
            </div>
            <ul className="divide-y divide-[hsl(40_30%_18%)]">
              {history.map((entry) => (
                <li
                  key={entry.id}
                  className="py-2 flex items-center justify-between text-sm"
                  data-testid="history-entry"
                >
                  <span className="text-[hsl(38_15%_60%)] font-display tracking-wider">d{entry.die}</span>
                  <span className="font-display text-lg text-[hsl(38_30%_88%)] tabular-nums">{entry.result}</span>
                  <span className="text-[hsl(38_15%_60%)] text-xs font-prose">{formatTime(entry.timestamp)}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  )
}
