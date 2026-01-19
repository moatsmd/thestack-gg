'use client'

import { useEffect, useState } from 'react'
import type { StackItemInput, StackItemType, StackPlayer } from '@/types/stack'

interface QuickAddPreset {
  id: string
  label: string
  type: StackItemType
  prompt: string
}

const PRESETS: QuickAddPreset[] = [
  { id: 'counter', label: 'Counter', type: 'spell', prompt: 'What are you countering?' },
  { id: 'destroy', label: 'Destroy', type: 'spell', prompt: 'What are you destroying?' },
  { id: 'damage', label: 'Damage', type: 'spell', prompt: 'Target and amount?' },
  { id: 'draw', label: 'Draw', type: 'spell', prompt: 'How many cards?' },
  { id: 'trigger', label: 'Trigger', type: 'triggered', prompt: 'What triggered?' },
  { id: 'activate', label: 'Activate', type: 'activated', prompt: 'What ability?' },
]

interface QuickAddButtonsProps {
  players: StackPlayer[]
  defaultControllerId: string
  onAdd: (item: StackItemInput) => void
}

export function QuickAddButtons({ players, defaultControllerId, onAdd }: QuickAddButtonsProps) {
  const [activePreset, setActivePreset] = useState<QuickAddPreset | null>(null)
  const [name, setName] = useState('')
  const [targetDescription, setTargetDescription] = useState('')
  const [controllerId, setControllerId] = useState('')

  useEffect(() => {
    setControllerId(defaultControllerId || players[0]?.id || '')
  }, [defaultControllerId, players])

  const openPreset = (preset: QuickAddPreset) => {
    setActivePreset(preset)
    setName(preset.label)
    setTargetDescription('')
  }

  const closePreset = () => {
    setActivePreset(null)
    setName('')
    setTargetDescription('')
  }

  const handleAdd = () => {
    if (!activePreset || !controllerId || !name.trim()) {
      return
    }

    onAdd({
      type: activePreset.type,
      name: name.trim(),
      controllerId,
      targetDescription: targetDescription.trim() || undefined,
    })
    closePreset()
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => openPreset(preset)}
            className="min-h-tap whitespace-nowrap rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            + {preset.label}
          </button>
        ))}
      </div>

      {activePreset && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Quick Add: {activePreset.label}
            </p>
            <button
              type="button"
              onClick={closePreset}
              className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Cancel
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Name</label>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
              placeholder={activePreset.label}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Controller</label>
            <select
              value={controllerId}
              onChange={(event) => setControllerId(event.target.value)}
              className="w-full min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
            >
              {players.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Target</label>
            <input
              type="text"
              value={targetDescription}
              onChange={(event) => setTargetDescription(event.target.value)}
              className="w-full min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
              placeholder={activePreset.prompt}
            />
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!controllerId || !name.trim()}
            className="w-full min-h-tap rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Add to Stack
          </button>
        </div>
      )}
    </div>
  )
}
