'use client'

interface PoisonCounterModalProps {
  isOpen: boolean
  playerName: string
  poisonCounters: number
  onChange: (delta: number) => void
  onClose: () => void
}

export function PoisonCounterModal({
  isOpen,
  playerName,
  poisonCounters,
  onChange,
  onClose,
}: PoisonCounterModalProps) {
  if (!isOpen) {
    return null
  }

  const warningLevel = poisonCounters >= 10 ? 'danger' : poisonCounters >= 8 ? 'warning' : 'none'

  const handleDecrease = () => {
    if (poisonCounters <= 0) {
      return
    }
    onChange(-1)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white shadow-lg">
        <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3">
          <div className="text-lg font-semibold text-gray-900">
            {playerName}&apos;s Poison Counters
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-4 rounded-md px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
            aria-label="Close poison counters"
          >
            Close
          </button>
        </div>

        <div className="px-4 py-6">
          <div
            data-testid="poison-counter-display"
            data-warning-level={warningLevel}
            className={`mb-6 rounded-md px-4 py-6 text-center ${
              warningLevel === 'danger'
                ? 'bg-red-100 text-red-700'
                : warningLevel === 'warning'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
            }`}
          >
            <div className="text-6xl font-bold mb-2">☠️</div>
            <div className="text-5xl font-bold">{poisonCounters}</div>
            <div className="text-sm font-semibold mt-2">
              {poisonCounters >= 10 ? 'LETHAL!' : poisonCounters >= 8 ? 'WARNING' : 'Poison Counters'}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleDecrease}
              className="flex-1 min-h-tap rounded-md bg-gray-200 px-4 py-3 text-2xl font-bold text-gray-700 hover:bg-gray-300 active:bg-gray-400 transition"
              aria-label="Decrease poison counters"
            >
              -
            </button>
            <button
              type="button"
              onClick={() => onChange(1)}
              className="flex-1 min-h-tap rounded-md bg-gray-900 px-4 py-3 text-2xl font-bold text-white hover:bg-gray-800 active:bg-gray-700 transition"
              aria-label="Increase poison counters"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
