'use client'

interface PlayerCounterProps {
  playerId: string
  playerName: string
  currentLife: number
  isSolo: boolean
  onLifeChange: (playerId: string, amount: number) => void
}

export function PlayerCounter({
  playerId,
  playerName,
  currentLife,
  isSolo,
  onLifeChange,
}: PlayerCounterProps) {
  const handleIncrement = () => {
    onLifeChange(playerId, 1)
  }

  const handleDecrement = () => {
    onLifeChange(playerId, -1)
  }

  const lifeColorClass = currentLife < 0 ? 'text-red-600' : 'text-gray-900'
  const lifeSizeClass = isSolo ? 'text-9xl' : 'text-6xl'

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Player name */}
      <div className="text-xl font-semibold text-gray-600 mb-4">
        {playerName}
      </div>

      {/* Life total */}
      <div className={`font-bold ${lifeSizeClass} ${lifeColorClass} mb-8`}>
        {currentLife}
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={handleDecrement}
          className="flex-1 bg-red-600 text-white text-4xl font-bold py-8 rounded-lg hover:bg-red-700 active:bg-red-800 transition min-h-tap"
          aria-label="-"
        >
          -
        </button>
        <button
          onClick={handleIncrement}
          className="flex-1 bg-green-600 text-white text-4xl font-bold py-8 rounded-lg hover:bg-green-700 active:bg-green-800 transition min-h-tap"
          aria-label="+"
        >
          +
        </button>
      </div>
    </div>
  )
}
