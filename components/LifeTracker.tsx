'use client'

import { GameState } from '@/types/game'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { PlayerCounter } from './PlayerCounter'
import { CommanderDamageModal } from './CommanderDamageModal'
import { useMemo, useState, useEffect } from 'react'

interface LifeTrackerProps {
  initialGameState: GameState
  onReset: () => void
}

export function LifeTracker({ initialGameState, onReset }: LifeTrackerProps) {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    'manadork-game-state',
    initialGameState
  )
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [hasSeenCommanderTip, setHasSeenCommanderTip] = useLocalStorage(
    'manadork-has-seen-commander-tip',
    false
  )
  const [showBanner, setShowBanner] = useState(false)

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
  const isCommander = gameState.gameType === 'commander'

  const selectedPlayer = useMemo(
    () => gameState.players.find((player) => player.id === selectedPlayerId),
    [gameState.players, selectedPlayerId]
  )

  const opponents = useMemo(() => {
    if (!selectedPlayer) {
      return []
    }
    return gameState.players
      .filter((player) => player.id !== selectedPlayer.id)
      .map((player) => ({
        id: player.id,
        name: player.name,
        commanderName: player.commanderName,
      }))
  }, [gameState.players, selectedPlayer])

  const handleCommanderDamageChange = (fromPlayerId: string, delta: number) => {
    if (!selectedPlayer) {
      return
    }

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) => {
        if (player.id !== selectedPlayer.id) {
          return player
        }

        const existing = player.commanderDamage ?? []
        const entry = existing.find((item) => item.fromPlayerId === fromPlayerId)
        const nextAmount = Math.max(0, (entry?.amount ?? 0) + delta)
        const updated = existing
          .filter((item) => item.fromPlayerId !== fromPlayerId)
          .concat(nextAmount > 0 ? [{ fromPlayerId, amount: nextAmount }] : [])

        return {
          ...player,
          commanderDamage: updated,
        }
      }),
    }))
  }

  const handlePlayerNameChange = (playerId: string, name: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId ? { ...player, name } : player
      ),
    }))
  }

  const handleCommanderNameChange = (playerId: string, commanderName: string) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === playerId ? { ...player, commanderName } : player
      ),
    }))
  }

  const handleDismissBanner = () => {
    setShowBanner(false)
    setHasSeenCommanderTip(true)
  }

  useEffect(() => {
    if (isCommander && !hasSeenCommanderTip) {
      setShowBanner(true)
      const timer = setTimeout(() => {
        setShowBanner(false)
        setHasSeenCommanderTip(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isCommander, hasSeenCommanderTip, setHasSeenCommanderTip])

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

      {showBanner && isCommander && (
        <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center" data-testid="commander-tip-banner">
          <div className="text-sm">
            💡 Tip: Tap any player to track commander damage
          </div>
          <button
            type="button"
            onClick={handleDismissBanner}
            className="ml-4 rounded-md px-3 py-1 text-sm font-semibold hover:bg-blue-700"
            aria-label="Dismiss tip"
          >
            Got it
          </button>
        </div>
      )}

      <div className={`flex-1 ${isSolo ? '' : 'grid grid-cols-1 md:grid-cols-2'}`}>
        {gameState.players.map((player) => (
          <PlayerCounter
            key={player.id}
            playerId={player.id}
            playerName={player.name}
            currentLife={player.currentLife}
            isSolo={isSolo}
            isCommander={isCommander}
            commanderDamage={player.commanderDamage}
            onLifeChange={handleLifeChange}
            onOpenCommanderDamage={setSelectedPlayerId}
            onNameChange={handlePlayerNameChange}
          />
        ))}
      </div>

      <CommanderDamageModal
        isOpen={Boolean(selectedPlayer && isCommander)}
        playerName={selectedPlayer?.name ?? ''}
        opponents={opponents}
        commanderDamage={selectedPlayer?.commanderDamage ?? []}
        onChange={handleCommanderDamageChange}
        onCommanderNameChange={handleCommanderNameChange}
        onClose={() => setSelectedPlayerId(null)}
      />
    </div>
  )
}
