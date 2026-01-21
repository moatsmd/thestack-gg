'use client'

import { GameState } from '@/types/game'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { PlayerCounter } from './PlayerCounter'
import { CommanderDamageModal } from './CommanderDamageModal'
import { PoisonCounterModal } from './PoisonCounterModal'
import { ManaPoolModal } from './ManaPoolModal'
import { HelpLegendBanner } from './HelpLegendBanner'
import { ShareGameModal } from './ShareGameModal'
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
  const [selectedPlayerIdForPoison, setSelectedPlayerIdForPoison] = useState<string | null>(null)
  const [selectedPlayerIdForMana, setSelectedPlayerIdForMana] = useState<string | null>(null)
  const [hasSeenCommanderTip, setHasSeenCommanderTip] = useLocalStorage(
    'manadork-has-seen-commander-tip',
    false
  )
  const [showBanner, setShowBanner] = useState(false)
  const [hasSeenHelpLegend, setHasSeenHelpLegend] = useLocalStorage(
    'manadork-has-seen-help-legend',
    false
  )
  const [showHelpLegend, setShowHelpLegend] = useState(false)
  const [shareSessionId, setShareSessionId] = useState<string | null>(null)
  const [shareUrl, setShareUrl] = useState('')
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)

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

  const selectedPlayerForPoison = useMemo(
    () => gameState.players.find((player) => player.id === selectedPlayerIdForPoison),
    [gameState.players, selectedPlayerIdForPoison]
  )

  const selectedPlayerForMana = useMemo(
    () => gameState.players.find((player) => player.id === selectedPlayerIdForMana),
    [gameState.players, selectedPlayerIdForMana]
  )

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

  const handlePoisonCounterChange = (delta: number) => {
    if (!selectedPlayerIdForPoison) {
      return
    }

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === selectedPlayerIdForPoison
          ? { ...player, poisonCounters: Math.max(0, (player.poisonCounters ?? 0) + delta) }
          : player
      ),
    }))
  }

  const handleManaChange = (color: string, delta: number) => {
    if (!selectedPlayerIdForMana) {
      return
    }

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) => {
        if (player.id !== selectedPlayerIdForMana) {
          return player
        }
        const currentPool = player.manaPool ?? {
          white: 0,
          blue: 0,
          black: 0,
          red: 0,
          green: 0,
          colorless: 0,
        }
        return {
          ...player,
          manaPool: {
            ...currentPool,
            [color]: Math.max(0, currentPool[color as keyof typeof currentPool] + delta),
          },
        }
      }),
    }))
  }

  const handleClearManaPool = () => {
    if (!selectedPlayerIdForMana) {
      return
    }

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) =>
        player.id === selectedPlayerIdForMana
          ? {
              ...player,
              manaPool: { white: 0, blue: 0, black: 0, red: 0, green: 0, colorless: 0 },
            }
          : player
      ),
    }))
  }

  const handleDismissBanner = () => {
    setShowBanner(false)
    setHasSeenCommanderTip(true)
  }

  const handleDismissHelpLegend = () => {
    setShowHelpLegend(false)
    setHasSeenHelpLegend(true)
  }

  const handleStartSharing = async () => {
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: gameState }),
      })
      if (!response.ok) {
        return
      }
      const data = await response.json()
      setShareSessionId(data.id)
      setShareUrl(data.shareUrl)
      setIsShareModalOpen(true)
    } catch (error) {
      console.error('Failed to start sharing:', error)
    }
  }

  const handleStopSharing = async () => {
    if (!shareSessionId) {
      setIsShareModalOpen(false)
      return
    }
    try {
      await fetch(`/api/share/${shareSessionId}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to stop sharing:', error)
    } finally {
      setShareSessionId(null)
      setShareUrl('')
      setIsShareModalOpen(false)
    }
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

  useEffect(() => {
    if (!hasSeenHelpLegend) {
      setShowHelpLegend(true)
    }
  }, [hasSeenHelpLegend])

  useEffect(() => {
    if (!shareSessionId) {
      return
    }
    const timeout = window.setTimeout(async () => {
      try {
        await fetch(`/api/share/${shareSessionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: gameState }),
        })
      } catch (error) {
        console.error('Failed to sync share state:', error)
      }
    }, 350)

    return () => window.clearTimeout(timeout)
  }, [gameState, shareSessionId])

  return (
    <div className="min-h-screen flex flex-col arcane-shell text-[var(--ink)]">
      <div className="arcane-panel mana-border px-4 py-3 flex justify-between items-center">
        <div className="text-sm text-[var(--muted)]">
          {gameState.gameType === 'standard' ? 'Standard' : gameState.gameType === 'commander' ? 'Commander' : 'Custom'} ({gameState.startingLife} life)
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (shareSessionId) {
                setIsShareModalOpen(true)
              } else {
                handleStartSharing()
              }
            }}
            className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5"
          >
            Share this game state
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-[var(--accent-3)] hover:bg-[var(--accent-3)]/90 px-4 py-2 rounded text-sm font-semibold text-white"
          >
            Reset Game
          </button>
        </div>
      </div>

      {showBanner && isCommander && (
        <div className="arcane-panel-soft mana-border px-4 py-3 flex justify-between items-center" data-testid="commander-tip-banner">
          <div className="text-sm text-[var(--ink)]">
            💡 Tip: Tap any player to track commander damage
          </div>
          <button
            type="button"
            onClick={handleDismissBanner}
            className="ml-4 rounded-md px-3 py-1 text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)] hover:bg-white/5"
            aria-label="Dismiss tip"
          >
            Got it
          </button>
        </div>
      )}

      {showHelpLegend && (
        <HelpLegendBanner
          isCommander={isCommander}
          onDismiss={handleDismissHelpLegend}
        />
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
            poisonCounters={player.poisonCounters}
            manaPool={player.manaPool}
            onLifeChange={handleLifeChange}
            onOpenCommanderDamage={setSelectedPlayerId}
            onOpenPoisonCounter={setSelectedPlayerIdForPoison}
            onOpenManaPool={setSelectedPlayerIdForMana}
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

      <PoisonCounterModal
        isOpen={Boolean(selectedPlayerForPoison)}
        playerName={selectedPlayerForPoison?.name ?? ''}
        poisonCounters={selectedPlayerForPoison?.poisonCounters ?? 0}
        onChange={handlePoisonCounterChange}
        onClose={() => setSelectedPlayerIdForPoison(null)}
      />

      <ManaPoolModal
        isOpen={Boolean(selectedPlayerForMana)}
        playerName={selectedPlayerForMana?.name ?? ''}
        manaPool={
          selectedPlayerForMana?.manaPool ?? {
            white: 0,
            blue: 0,
            black: 0,
            red: 0,
            green: 0,
            colorless: 0,
          }
        }
        onChange={handleManaChange}
        onClearAll={handleClearManaPool}
        onClose={() => setSelectedPlayerIdForMana(null)}
      />

      <ShareGameModal
        isOpen={isShareModalOpen}
        shareUrl={shareUrl}
        onClose={() => setIsShareModalOpen(false)}
        onStop={handleStopSharing}
      />
    </div>
  )
}
