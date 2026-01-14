'use client'

import { useState } from 'react'
import { useCardSearch } from '@/hooks/useCardSearch'
import { CardSearchInput } from './CardSearchInput'
import { CardSearchHelp } from './CardSearchHelp'
import { ErrorBanner } from './ErrorBanner'
import { CardDisplay } from './CardDisplay'
import { CardGrid } from './CardGrid'
import { ViewModeToggle, ViewMode } from './ViewModeToggle'

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

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
  }

  const handleCardClick = (card: typeof selectedCard) => {
    selectCard(card!)
    setViewMode('single') // Switch to single view when card selected
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
        onSearch={search}
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
      {showSingleCard && <CardDisplay card={selectedCard} />}
    </div>
  )
}
