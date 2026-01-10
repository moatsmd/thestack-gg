'use client'

import { useState, useEffect } from 'react'
import { GameState } from '@/types/game'
import { GameSetup } from '@/components/GameSetup'
import { LifeTracker } from '@/components/LifeTracker'

export default function TrackerPage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing game in localStorage
    const stored = localStorage.getItem('manadork-game-state')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setGameState(parsed)
      } catch (error) {
        console.error('Failed to parse stored game state:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleStartGame = (newGameState: GameState) => {
    setGameState(newGameState)
  }

  const handleReset = () => {
    setGameState(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!gameState) {
    return <GameSetup onStartGame={handleStartGame} />
  }

  return <LifeTracker initialGameState={gameState} onReset={handleReset} />
}
