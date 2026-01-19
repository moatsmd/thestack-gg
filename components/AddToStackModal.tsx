'use client'

import { useEffect, useState } from 'react'
import type { StackItemInput, StackItemType, StackPlayer } from '@/types/stack'
import type { ScryfallCard } from '@/types/scryfall'
import { useCardSearch } from '@/hooks/useCardSearch'
import { CardSearchInput } from '@/components/CardSearchInput'
import { CardGrid } from '@/components/CardGrid'

const DEFAULT_TYPE: StackItemType = 'spell'

const getCardFace = (card: ScryfallCard) => {
  if (card.card_faces && card.card_faces.length > 0) {
    return card.card_faces[0]
  }
  return card
}

const getCardImage = (card: ScryfallCard) => {
  const face = getCardFace(card)
  return face.image_uris?.normal || face.image_uris?.small || card.image_uris?.normal || card.image_uris?.small
}

const getCardOracleText = (card: ScryfallCard) => {
  const face = getCardFace(card)
  return face.oracle_text || card.oracle_text
}

const getSuggestedType = (card: ScryfallCard): StackItemType => {
  const line = card.type_line || ''
  if (line.includes('Instant') || line.includes('Sorcery')) {
    return 'spell'
  }
  return DEFAULT_TYPE
}

interface AddToStackModalProps {
  isOpen: boolean
  players: StackPlayer[]
  defaultControllerId: string
  onAdd: (item: StackItemInput) => void
  onClose: () => void
}

export function AddToStackModal({
  isOpen,
  players,
  defaultControllerId,
  onAdd,
  onClose,
}: AddToStackModalProps) {
  const {
    query,
    results,
    suggestions,
    selectedCard,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    setQuery,
    selectCard,
    clearSelection,
    search,
    loadMore,
  } = useCardSearch()

  const [name, setName] = useState('')
  const [type, setType] = useState<StackItemType>(DEFAULT_TYPE)
  const [controllerId, setControllerId] = useState('')
  const [targetDescription, setTargetDescription] = useState('')

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setName('')
    setType(DEFAULT_TYPE)
    setControllerId(defaultControllerId || players[0]?.id || '')
    setTargetDescription('')
    clearSelection()
    setQuery('')
  }, [isOpen, defaultControllerId, players, clearSelection, setQuery])

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
    setTimeout(() => {
      search()
    }, 0)
  }

  const handleCardSelect = (card: ScryfallCard) => {
    selectCard(card)
    setName(getCardFace(card).name || card.name)
    setType(getSuggestedType(card))
  }

  const handleAdd = () => {
    if (!name.trim() || !controllerId) {
      return
    }

    const nextItem: StackItemInput = {
      type,
      name: name.trim(),
      controllerId,
      targetDescription: targetDescription.trim() || undefined,
      cardId: selectedCard?.id,
      oracleText: selectedCard ? getCardOracleText(selectedCard) : undefined,
      imageUri: selectedCard ? getCardImage(selectedCard) : undefined,
    }

    onAdd(nextItem)
    onClose()
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">Add to Stack</p>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Spell or Ability</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-tap min-w-tap rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Search Scryfall</label>
            <CardSearchInput
              value={query}
              onChange={setQuery}
              suggestions={suggestions}
              onSelectSuggestion={handleSelectSuggestion}
              onSearch={search}
              isLoading={isLoading}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            )}
            {results.length > 0 && (
              <CardGrid
                cards={results}
                onCardClick={handleCardSelect}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            )}
          </div>

          {selectedCard && (
            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {getCardImage(selectedCard) && (
                  <img
                    src={getCardImage(selectedCard)}
                    alt={selectedCard.name}
                    className="w-full md:w-48 rounded-lg object-cover"
                  />
                )}
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedCard.name}
                  </p>
                  {getCardOracleText(selectedCard) && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                      {getCardOracleText(selectedCard)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Name</label>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
                placeholder="Name the spell or ability"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">Type</label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value as StackItemType)}
                className="w-full min-h-tap rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-white"
              >
                <option value="spell">Spell</option>
                <option value="activated">Activated</option>
                <option value="triggered">Triggered</option>
              </select>
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
                placeholder="Optional target"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!name.trim() || !controllerId}
            className="w-full min-h-tap rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Add to Stack
          </button>
        </div>
      </div>
    </div>
  )
}
