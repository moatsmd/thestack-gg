'use client'

import { ScryfallCard } from '@/types/scryfall'

interface CompactCardProps {
  card: ScryfallCard
  onClick: (card: ScryfallCard) => void
}

export function CompactCard({ card, onClick }: CompactCardProps) {
  // Determine if card has multiple faces
  const hasMultipleFaces = card.card_faces && card.card_faces.length > 1
  const firstFace = hasMultipleFaces ? card.card_faces![0] : null

  // Get card properties - prefer first face if available
  const imageUri = firstFace?.image_uris?.small || card.image_uris?.small
  const name = firstFace?.name || card.name
  const manaCost = firstFace?.mana_cost || card.mana_cost
  const typeLine = firstFace?.type_line || card.type_line

  return (
    <button
      type="button"
      onClick={() => onClick(card)}
      className="group relative rounded-lg overflow-hidden bg-white dark:bg-[var(--surface-1)] border border-white/10 shadow-md hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--accent-4)]"
      data-testid="compact-card"
      aria-label={`View details for ${name}`}
    >
      {/* Card Image */}
      <div className="aspect-[5/7] relative overflow-hidden bg-gray-200 dark:bg-gray-900">
        {imageUri ? (
          <img
            src={imageUri}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Card Info */}
      <div className="p-2 space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold text-[var(--ink)] text-left line-clamp-2 flex-1">
            {name}
          </h3>
          {manaCost && (
            <span className="text-xs text-[var(--muted)] font-mono whitespace-nowrap">
              {manaCost}
            </span>
          )}
        </div>
        <p className="text-xs text-[var(--muted)] text-left line-clamp-1">
          {typeLine}
        </p>
      </div>

      {/* Multi-faced indicator */}
      {hasMultipleFaces && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          DFC
        </div>
      )}
    </button>
  )
}
