'use client'

import { useState } from 'react'

type DieType = 4 | 6 | 8 | 10 | 12 | 20 | 100

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

function DieSvg({ sides }: { sides: DieType }) {
  const shapes: Record<DieType, React.ReactNode> = {
    4: <polygon points="12,2 22,20 2,20" fill="none" stroke="currentColor" strokeWidth="1.5" />,
    6: <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />,
    8: <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth="1.5" />,
    10: <polygon points="12,2 21,8 18,19 6,19 3,8" fill="none" stroke="currentColor" strokeWidth="1.5" />,
    12: <polygon points="12,2 19,5 22,12 19,19 12,22 5,19 2,12 5,5" fill="none" stroke="currentColor" strokeWidth="1.5" />,
    20: <polygon points="12,2 22,8 22,16 12,22 2,16 2,8" fill="none" stroke="currentColor" strokeWidth="1.5" />,
    100: <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />,
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
    setLastResult(total)
    setLastDie(results[results.length - 1].die)
    setHistory((prev) => [...entries, ...prev].slice(0, 10))
    setQueue([])
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
    <div className="min-h-screen arcane-shell text-[var(--ink)] transition-colors">
      <div className="max-w-lg mx-auto px-4 py-10 space-y-8">

        <header className="arcane-panel mana-border rounded-2xl p-6 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Dice</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--ink)]">Dice Roller</h1>
        </header>

        <div className="arcane-panel mana-border rounded-2xl p-8 text-center">
          {lastResult !== null ? (
            <>
              <p className="text-sm text-[var(--muted)] mb-2">d{lastDie}</p>
              <p
                className="text-8xl font-bold text-[var(--ink)]"
                data-testid="roll-result"
              >
                {lastResult}
              </p>
            </>
          ) : (
            <p
              className="text-6xl font-bold text-[var(--muted)]"
              data-testid="roll-result"
            >
              —
            </p>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3">
          {DICE.map((sides) => (
            <button
              key={sides}
              type="button"
              onClick={() => handleDieClick(sides)}
              onContextMenu={(e) => { e.preventDefault(); handleQueueDie(sides) }}
              className="relative flex flex-col items-center justify-center py-4 rounded-2xl arcane-panel mana-border hover:bg-white/5 active:scale-95 transition font-bold text-[var(--ink)]"
              data-testid={`die-d${sides}`}
              title={`Roll d${sides}`}
            >
              <DieSvg sides={sides} />
              <span className="text-sm">d{sides}</span>
              {(queueCounts[sides] ?? 0) > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--accent-1)] text-white text-xs flex items-center justify-center font-bold">
                  {queueCounts[sides]}
                </span>
              )}
            </button>
          ))}
        </div>

        {queue.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-[var(--muted)] text-center">
              Queued: {queue.map((d) => `d${d}`).join(', ')}
            </p>
            <button
              type="button"
              onClick={handleRollQueue}
              className="w-full py-4 rounded-2xl bg-[var(--accent-1)] text-white font-bold text-lg hover:bg-[var(--accent-1)]/90 transition"
              data-testid="roll-queue"
            >
              Roll {queue.length} {queue.length === 1 ? 'die' : 'dice'}
            </button>
            <button
              type="button"
              onClick={() => setQueue([])}
              className="w-full py-2 rounded-xl text-sm text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              Clear queue
            </button>
          </div>
        )}

        {history.length > 0 && (
          <section className="arcane-panel mana-border rounded-2xl p-4 space-y-2">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)]">History</p>
            {history.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between text-sm"
                data-testid="history-entry"
              >
                <span className="text-[var(--muted)]">d{entry.die}</span>
                <span className="font-bold text-[var(--ink)]">{entry.result}</span>
                <span className="text-[var(--muted)] text-xs">{formatTime(entry.timestamp)}</span>
              </div>
            ))}
          </section>
        )}

      </div>
    </div>
  )
}
