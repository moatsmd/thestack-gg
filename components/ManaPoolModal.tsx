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
  bgColor: string
  textColor: string
}

const manaColors: ManaColor[] = [
  { key: 'white', name: 'White', symbol: '⚪', bgColor: 'bg-gray-50', textColor: 'text-gray-900' },
  { key: 'blue', name: 'Blue', symbol: '🔵', bgColor: 'bg-blue-50', textColor: 'text-blue-900' },
  { key: 'black', name: 'Black', symbol: '⚫', bgColor: 'bg-gray-900', textColor: 'text-white' },
  { key: 'red', name: 'Red', symbol: '🔴', bgColor: 'bg-red-50', textColor: 'text-red-900' },
  { key: 'green', name: 'Green', symbol: '🟢', bgColor: 'bg-green-50', textColor: 'text-green-900' },
  { key: 'colorless', name: 'Colorless', symbol: '◇', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-lg font-semibold text-gray-900">
            {playerName}&apos;s Mana Pool
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
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
                className={`flex items-center justify-between rounded-lg border border-gray-200 p-3 ${color.bgColor}`}
              >
                <div className={`flex items-center gap-3 ${color.textColor}`}>
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
                    className="min-h-tap min-w-tap rounded-md bg-gray-200 px-3 py-2 text-lg font-bold text-gray-700 hover:bg-gray-300"
                    aria-label={`Decrease ${color.name} mana`}
                  >
                    -
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange(color.key, 1)}
                    className="min-h-tap min-w-tap rounded-md bg-gray-900 px-3 py-2 text-lg font-bold text-white hover:bg-gray-800"
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
            className="w-full rounded-md bg-red-600 px-4 py-3 text-sm font-semibold text-white hover:bg-red-700 active:bg-red-800 transition"
            aria-label="Clear all mana"
          >
            Clear All Mana
          </button>
        </div>
      </div>
    </div>
  )
}
