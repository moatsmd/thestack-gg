'use client'

import { ScryfallCard } from '@/types/scryfall'
import { CompactCard } from './CompactCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

interface CardGridProps {
  cards: ScryfallCard[]
  onCardClick: (card: ScryfallCard) => void
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
}

export function CardGrid({ cards, onCardClick, onLoadMore, hasMore, isLoadingMore }: CardGridProps) {
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  })

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No cards found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Grid of cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        data-testid="card-grid"
      >
        {cards.map((card) => (
          <CompactCard key={card.id} card={card} onClick={onCardClick} />
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-purple-600" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more cards...</p>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && !isLoadingMore && (
        <div
          ref={sentinelRef}
          data-testid="infinite-scroll-sentinel"
          className="h-4"
        />
      )}

      {/* End of results */}
      {!hasMore && cards.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
          End of results ({cards.length} cards)
        </div>
      )}
    </div>
  )
}
