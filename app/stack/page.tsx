'use client'

import { useState } from 'react'
import { AddToStackModal } from '@/components/AddToStackModal'
import { PriorityIndicator } from '@/components/PriorityIndicator'
import { QuickAddButtons } from '@/components/QuickAddButtons'
import { ResolutionHistory } from '@/components/ResolutionHistory'
import { StackControls } from '@/components/StackControls'
import { StackView } from '@/components/StackView'
import { useStack } from '@/hooks/useStack'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export default function StackPage() {
  const {
    state,
    addItem,
    resolveTop,
    passPriority,
    clearStack,
    resetStack,
    addPlayer,
    removePlayer,
    updatePlayerName,
  } = useStack()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isResolving, setIsResolving] = useState(false)
  const [resolvingId, setResolvingId] = useState<string | null>(null)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [hasDismissedHelp, setHasDismissedHelp] = useLocalStorage(
    'manadork-stack-help-dismissed',
    false
  )

  const defaultControllerId = state.priorityPlayerId || state.players[0]?.id || ''

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      return
    }

    addPlayer(newPlayerName)
    setNewPlayerName('')
  }

  const handleRemovePlayer = (playerId: string) => {
    if (state.players.length <= 1) {
      return
    }

    if (window.confirm('Remove this player?')) {
      removePlayer(playerId)
    }
  }

  const handleResolve = () => {
    if (isResolving || state.items.length === 0) {
      return
    }

    const topItem = state.items[state.items.length - 1]
    if (!topItem) {
      return
    }

    setIsResolving(true)
    setResolvingId(topItem.id)

    window.setTimeout(() => {
      resolveTop()
      setResolvingId(null)
      setIsResolving(false)
    }, 420)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 text-gray-900 dark:text-white transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
            The Stack
          </p>
          <h1 className="text-4xl md:text-5xl font-bold">Stack Visualizer</h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-2xl">
            Track spells and abilities in the order they resolve. Add effects, pass priority,
            and clear the stack when the turn is over.
          </p>
        </header>

        {!hasDismissedHelp && (
          <div className="arcane-panel mana-border rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">How to use</p>
                <h2 className="text-2xl font-semibold text-[var(--ink)]">Run the stack</h2>
              </div>
              <button
                type="button"
                onClick={() => setHasDismissedHelp(true)}
                className="min-h-tap px-3 py-2 rounded-lg border border-white/10 text-[var(--muted)] hover:text-[var(--ink)]"
              >
                Got it
              </button>
            </div>
            <ol className="space-y-2 text-sm text-[var(--muted)]">
              <li>1. Add spells or abilities with quick buttons or full search.</li>
              <li>2. Respond by stacking more effects on top.</li>
              <li>3. Resolve the top item to move it into history.</li>
            </ol>
          </div>
        )}

        <PriorityIndicator
          players={state.players}
          priorityPlayerId={state.priorityPlayerId}
          onPass={passPriority}
        />

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <StackView items={state.items} players={state.players} resolvingId={resolvingId} />

            <StackControls
              hasItems={state.items.length > 0}
              isResolving={isResolving}
              onResolve={handleResolve}
              onClear={clearStack}
              onNewStack={resetStack}
            />

            <ResolutionHistory items={state.resolved} players={state.players} />
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Players</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Manage controllers
                </p>
              </div>

              <div className="space-y-3">
                {state.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={player.name}
                      onChange={(event) => updatePlayerName(player.id, event.target.value)}
                      className="flex-1 min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id)}
                      disabled={state.players.length <= 1}
                      className="min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(event) => setNewPlayerName(event.target.value)}
                  className="flex-1 min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                  placeholder="Add a player"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="min-h-tap rounded-lg bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 transition"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Quick Add</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  Common stack actions
                </p>
              </div>
              <QuickAddButtons
                players={state.players}
                defaultControllerId={defaultControllerId}
                onAdd={addItem}
              />
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="w-full min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Add Spell or Ability
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddToStackModal
        isOpen={isAddModalOpen}
        players={state.players}
        defaultControllerId={defaultControllerId}
        onAdd={addItem}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
