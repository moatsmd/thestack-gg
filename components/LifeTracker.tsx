'use client'

import { GameState } from '@/types/game'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { PlayerCounter } from './PlayerCounter'

interface LifeTrackerProps {
  initialGameState: GameState
  onReset: () => void
}

export function LifeTracker({ initialGameState, onReset }: LifeTrackerProps) {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    'manadork-game-state',
    initialGameState
  )

  const handleLifeChange = (playerId: string, amount: number) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            currentLife: player.currentLife + amount,
            lifeHistory: [
              ...player.lifeHistory,
              {
                amount,
                timestamp: new Date(),
              },
            ],
          }
        }
        return player
      }),
    }))
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the game?')) {
      localStorage.removeItem('manadork-game-state')
      onReset()
    }
  }

  const isSolo = gameState.mode === 'solo'

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
        <div className="text-sm">
          {gameState.gameType === 'standard' ? 'Standard' : gameState.gameType === 'commander' ? 'Commander' : 'Custom'} ({gameState.startingLife} life)
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          Reset Game
        </button>
      </div>

      <div className={`flex-1 ${isSolo ? '' : 'grid grid-cols-1 md:grid-cols-2'}`}>
        {gameState.players.map((player) => (
          <PlayerCounter
            key={player.id}
            playerId={player.id}
            playerName={player.name}
            currentLife={player.currentLife}
            isSolo={isSolo}
            onLifeChange={handleLifeChange}
          />
        ))}
      </div>
    </div>
  )
}
