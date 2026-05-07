'use client'

import { useState } from 'react'
import { useCardSearch } from '@/hooks/useCardSearch'
import { CardSearchInput } from './CardSearchInput'
import { CardSearchHelp } from './CardSearchHelp'
import { ErrorBanner } from './ErrorBanner'
import { CardDisplay } from './CardDisplay'
import { CardGrid } from './CardGrid'
import { ViewModeToggle, ViewMode } from './ViewModeToggle'
import { CardModal } from './CardModal'
import { ScryfallCard } from '@/types/scryfall'
import { track } from '@/lib/analytics'

export function CardSearch() {
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
    search,
    loadMore,
  } = useCardSearch()

  const [viewMode, setViewMode] = useState<ViewMode>('single')
  const [modalCard, setModalCard] = useState<ScryfallCard | null>(null)

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
  }

  const handleCardClick = (card: ScryfallCard) => {
    track('card_modal_opened', { card: card.name, view: viewMode })
    if (viewMode === 'grid') {
      // In grid view, open modal
      setModalCard(card)
    } else {
      // In single view, select card normally (shouldn't happen, but defensive)
      selectCard(card)
    }
  }

  const handleSearch = () => {
    track('card_lookup', { query, length: query.length })
    search()
  }

  const handleCloseModal = () => {
    setModalCard(null)
  }

  const showToggle = results.length > 1
  const showGrid = viewMode === 'grid' && results.length > 1
  const showSingleCard = selectedCard && (viewMode === 'single' || results.length === 1)

  return (
    <div className="space-y-4" data-testid="card-search">
      <CardSearchInput
        value={query}
        onChange={setQuery}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      <CardSearchHelp />

      {/* View Mode Toggle */}
      {showToggle && (
        <div className="flex justify-center">
          <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {/* Grid View */}
      {showGrid && (
        <CardGrid
          cards={results}
          onCardClick={handleCardClick}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      )}

      {/* Single Card View */}
      {showSingleCard && <CardDisplay card={selectedCard} source="toolkit-search" />}

      {/* Card Modal */}
      {modalCard && (
        <CardModal
          card={modalCard}
          isOpen={true}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
