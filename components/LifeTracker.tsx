'use client'

import { GameState, ExtraCounterType } from '@/types/game'
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
  const [isStatusOpen, setIsStatusOpen] = useState(false)

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

  const handleExtraCounterChange = (playerId: string, counter: ExtraCounterType, delta: number) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) => {
        if (player.id !== playerId) return player
        const current = player.extraCounters?.[counter] ?? 0
        const next = Math.max(0, current + delta)
        return {
          ...player,
          extraCounters: {
            ...(player.extraCounters),
            [counter]: next,
          } as Record<ExtraCounterType, number>,
        }
      }),
    }))
  }

  const handleSetMonarch = (playerId: string | null) => {
    setGameState((prev) => ({
      ...prev,
      tableStatus: { ...prev.tableStatus, monarchId: playerId },
    }))
  }

  const handleSetInitiative = (playerId: string | null) => {
    setGameState((prev) => ({
      ...prev,
      tableStatus: { ...prev.tableStatus, initiativeId: playerId },
    }))
  }

  const handleToggleNight = () => {
    setGameState((prev) => ({
      ...prev,
      tableStatus: { ...prev.tableStatus, isNight: !prev.tableStatus.isNight },
    }))
  }

  const handleToggleCitysBlessing = (playerId: string) => {
    setGameState((prev) => {
      const ids = prev.tableStatus.citysBlessingIds
      const next = ids.includes(playerId)
        ? ids.filter((id) => id !== playerId)
        : [...ids, playerId]
      return { ...prev, tableStatus: { ...prev.tableStatus, citysBlessingIds: next } }
    })
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
            💡 Tip: Tap the CMD badge on a player to track commander damage
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

      {/* Table Status Bar */}
      <div className="mb-4 px-4 pt-4">
        <button
          type="button"
          onClick={() => setIsStatusOpen((o) => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] transition text-sm font-medium"
          data-testid="table-status-toggle"
        >
          <span>Table Status</span>
          <span>{isStatusOpen ? '▲' : '▼'}</span>
          {(gameState.tableStatus.monarchId || gameState.tableStatus.initiativeId) && (
            <span className="w-2 h-2 rounded-full bg-[var(--accent-1)]" />
          )}
        </button>

        {isStatusOpen && (
          <div
            className="mt-2 p-4 arcane-panel mana-border rounded-2xl space-y-3"
            data-testid="table-status-bar"
          >
            {/* Monarch */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">👑 Monarch</p>
              <div className="flex flex-wrap gap-2">
                {gameState.players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSetMonarch(gameState.tableStatus.monarchId === p.id ? null : p.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      gameState.tableStatus.monarchId === p.id
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                    data-testid={`monarch-${p.id}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Initiative */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">⚔ Initiative</p>
              <div className="flex flex-wrap gap-2">
                {gameState.players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSetInitiative(gameState.tableStatus.initiativeId === p.id ? null : p.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      gameState.tableStatus.initiativeId === p.id
                        ? 'bg-blue-400 text-blue-900'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                    data-testid={`initiative-${p.id}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Day/Night */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">🌙 Day / Night</p>
              <button
                type="button"
                onClick={handleToggleNight}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  gameState.tableStatus.isNight
                    ? 'bg-indigo-700 text-white'
                    : 'bg-yellow-300 text-yellow-900'
                }`}
                data-testid="day-night-toggle"
              >
                {gameState.tableStatus.isNight ? '🌙 Night' : '☀️ Day'}
              </button>
            </div>

            {/* City's Blessing */}
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">City&apos;s Blessing</p>
              <div className="flex flex-wrap gap-2">
                {gameState.players.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleToggleCitysBlessing(p.id)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      gameState.tableStatus.citysBlessingIds.includes(p.id)
                        ? 'bg-[var(--accent-2)] text-gray-900'
                        : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                    }`}
                    data-testid={`citys-blessing-${p.id}`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

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
            enabledCounters={gameState.enabledCounters ?? []}
            extraCounters={player.extraCounters}
            onExtraCounterChange={handleExtraCounterChange}
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
