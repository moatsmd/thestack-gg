'use client'

import { ManaPool } from '@/types/game'

interface ManaPoolModalProps {
  isOpen: boolean
  playerName: string
  manaPool: ManaPool
  onChange: (color: string, delta: number) => void
  onClearAll: () => void
  onClose: () => void
}

interface ManaColor {
  key: keyof ManaPool
  name: string
  symbol: string
  accent: string
}

const manaColors: ManaColor[] = [
  { key: 'white', name: 'White', symbol: '⚪', accent: 'border-l-4 border-yellow-300' },
  { key: 'blue', name: 'Blue', symbol: '🔵', accent: 'border-l-4 border-sky-400' },
  { key: 'black', name: 'Black', symbol: '⚫', accent: 'border-l-4 border-slate-500' },
  { key: 'red', name: 'Red', symbol: '🔴', accent: 'border-l-4 border-rose-400' },
  { key: 'green', name: 'Green', symbol: '🟢', accent: 'border-l-4 border-emerald-400' },
  { key: 'colorless', name: 'Colorless', symbol: '◇', accent: 'border-l-4 border-gray-300' },
]

export function ManaPoolModal({
  isOpen,
  playerName,
  manaPool,
  onChange,
  onClearAll,
  onClose,
}: ManaPoolModalProps) {
  if (!isOpen) {
    return null
  }

  const handleDecrease = (color: string, currentAmount: number) => {
    if (currentAmount <= 0) {
      return
    }
    onChange(color, -1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-[var(--surface-1)] text-[var(--ink)] shadow-lg border border-white/10">
        <div className="flex items-start justify-between border-b border-white/10 px-4 py-3">
          <div className="text-lg font-semibold text-[var(--ink)]">
            {playerName}&apos;s Mana Pool
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-md px-3 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5"
            aria-label="Close mana pool"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-4 space-y-3">
          {manaColors.map((color) => {
            const amount = manaPool[color.key]

            return (
              <div
                key={color.key}
                className={`flex items-center justify-between rounded-lg border border-white/10 p-3 bg-[var(--surface-2)] ${color.accent}`}
              >
                <div className="flex items-center gap-3 text-[var(--ink)]">
                  <div className="text-2xl">{color.symbol}</div>
                  <div>
                    <div className="text-sm font-medium">{color.name}</div>
                    <div className="text-2xl font-bold">{amount}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDecrease(color.key, amount)}
                    className="min-h-tap min-w-tap rounded-md bg-[var(--surface-1)] px-3 py-2 text-lg font-bold text-[var(--muted)] hover:bg-white/5"
                    aria-label={`Decrease ${color.name} mana`}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(color.key, 1)}
                    className="min-h-tap min-w-tap rounded-md bg-[var(--accent-2)] px-3 py-2 text-lg font-bold text-gray-900 hover:bg-[var(--accent-2)]/90"
                    aria-label={`Increase ${color.name} mana`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}

          <button
            type="button"
            onClick={onClearAll}
            className="w-full rounded-md bg-[var(--accent-3)] px-4 py-3 text-sm font-semibold text-white hover:bg-[var(--accent-3)]/90 active:bg-[var(--accent-3)] transition"
            aria-label="Clear all mana"
          >
            Clear All Mana
          </button>
        </div>
      </div>
    </div>
  )
}
