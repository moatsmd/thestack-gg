'use client'

import { useState } from 'react'
import { GameState, GameType } from '@/types/game'

interface GameSetupProps {
  onStartGame: (gameState: GameState) => void
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [setupStep, setSetupStep] = useState<'mode' | 'solo-type' | 'multi-players' | 'multi-type'>('mode')
  const [playerCount, setPlayerCount] = useState(2)

  const createGameState = (mode: 'solo' | 'multiplayer', gameType: GameType, playerCount: number): GameState => {
    const startingLife = gameType === 'standard' ? 20 : gameType === 'commander' ? 40 : 20

    const players = Array.from({ length: playerCount }, (_, i) => ({
      id: `player-${i + 1}`,
      name: mode === 'solo' ? 'You' : `Player ${i + 1}`,
      currentLife: startingLife,
      lifeHistory: [],
    }))

    return {
      mode,
      gameType,
      startingLife,
      players,
      createdAt: new Date(),
    }
  }

  const handleSoloMode = (gameType: GameType) => {
    const gameState = createGameState('solo', gameType, 1)
    onStartGame(gameState)
  }

  const handleMultiplayerStart = (gameType: GameType) => {
    const gameState = createGameState('multiplayer', gameType, playerCount)
    onStartGame(gameState)
  }

  if (setupStep === 'mode') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h1 className="text-4xl font-bold mb-8">ManaDork</h1>

        <button
          onClick={() => setSetupStep('solo-type')}
          className="w-full max-w-md bg-blue-600 text-white text-2xl font-bold py-8 px-6 rounded-lg hover:bg-blue-700 transition min-h-tap"
        >
          Track My Life
        </button>

        <button
          onClick={() => setSetupStep('multi-players')}
          className="w-full max-w-md bg-gray-600 text-white text-xl font-semibold py-6 px-6 rounded-lg hover:bg-gray-700 transition min-h-tap"
        >
          Track Game (2-4 players)
        </button>
      </div>
    )
  }

  if (setupStep === 'solo-type') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold mb-4">Select Game Mode</h2>

        <button
          onClick={() => handleSoloMode('standard')}
          className="w-full max-w-md bg-green-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-green-700 transition min-h-tap"
        >
          Standard (20 life)
        </button>

        <button
          onClick={() => handleSoloMode('commander')}
          className="w-full max-w-md bg-purple-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-purple-700 transition min-h-tap"
        >
          Commander (40 life)
        </button>

        <button
          onClick={() => handleSoloMode('custom')}
          className="w-full max-w-md bg-orange-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-orange-700 transition min-h-tap"
        >
          Custom
        </button>

        <button
          onClick={() => setSetupStep('mode')}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
      </div>
    )
  }

  if (setupStep === 'multi-players') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold mb-4">How Many Players?</h2>

        {[2, 3, 4].map((count) => (
          <button
            key={count}
            onClick={() => {
              setPlayerCount(count)
              setSetupStep('multi-type')
            }}
            className="w-full max-w-md bg-blue-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-blue-700 transition min-h-tap"
          >
            {count} Players
          </button>
        ))}

        <button
          onClick={() => setSetupStep('mode')}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
      </div>
    )
  }

  if (setupStep === 'multi-type') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold mb-4">Select Game Mode</h2>

        <button
          onClick={() => handleMultiplayerStart('standard')}
          className="w-full max-w-md bg-green-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-green-700 transition min-h-tap"
        >
          Standard (20 life)
        </button>

        <button
          onClick={() => handleMultiplayerStart('commander')}
          className="w-full max-w-md bg-purple-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-purple-700 transition min-h-tap"
        >
          Commander (40 life)
        </button>

        <button
          onClick={() => handleMultiplayerStart('custom')}
          className="w-full max-w-md bg-orange-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-orange-700 transition min-h-tap"
        >
          Custom
        </button>

        <button
          onClick={() => setSetupStep('multi-players')}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
      </div>
    )
  }

  return null
}
