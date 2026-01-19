'use client'

import { useState } from 'react'
import { ScryfallCard } from '@/types/scryfall'
import { CardLegalityDisplay } from './CardLegalityDisplay'
import { OracleTextWithKeywords } from './OracleTextWithKeywords'

interface CardDisplayProps {
  card: ScryfallCard
}

export function CardDisplay({ card }: CardDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentFaceIndex, setCurrentFaceIndex] = useState(0)

  // Determine if card has multiple faces
  const hasMultipleFaces = card.card_faces && card.card_faces.length > 1
  const currentFace = hasMultipleFaces ? card.card_faces![currentFaceIndex] : null

  // Get image URI - prefer card face if available, otherwise use main card
  const imageUri = currentFace?.image_uris?.normal || card.image_uris?.normal
  const largeImageUri = currentFace?.image_uris?.large || card.image_uris?.large || imageUri

  // Get card properties - prefer current face if available
  const name = currentFace?.name || card.name
  const manaCost = currentFace?.mana_cost || card.mana_cost
  const typeLine = currentFace?.type_line || card.type_line
  const oracleText = currentFace?.oracle_text || card.oracle_text

  // Format price
  const price = card.prices.usd
    ? `$${parseFloat(card.prices.usd).toFixed(2)}`
    : card.prices.eur
      ? `€${parseFloat(card.prices.eur).toFixed(2)}`
      : null

  const handleToggleFace = () => {
    if (hasMultipleFaces) {
      setCurrentFaceIndex((prev) => (prev + 1) % card.card_faces!.length)
    }
  }

  return (
    <>
      <div
        className="rounded-lg bg-white dark:bg-[var(--surface-1)] shadow-lg overflow-hidden border border-white/10"
        data-testid="card-display"
      >
        {/* Card Image */}
        {imageUri ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Expand card image"
            >
              <img
                src={imageUri}
                alt={name}
                className="w-full h-auto"
                data-testid="card-image"
              />
            </button>
            {hasMultipleFaces && (
              <button
                type="button"
                onClick={handleToggleFace}
                className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-md hover:bg-black/80 text-sm font-medium"
                data-testid="flip-card-button"
              >
                Flip Card
              </button>
            )}
          </div>
        ) : (
          <div className="w-full aspect-[5/7] bg-gray-200 dark:bg-gray-900 flex items-center justify-center" data-testid="no-image">
            <span className="text-gray-500 dark:text-gray-400">No image available</span>
          </div>
        )}

        {/* Card Details */}
        <div className="p-4 space-y-4">
          {/* Card Header */}
          <div data-testid="card-header">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h2 className="text-xl font-bold text-[var(--ink)]" data-testid="card-name">
                {name}
              </h2>
              {manaCost && (
                <span className="text-[var(--muted)] font-mono text-sm whitespace-nowrap" data-testid="card-mana-cost">
                  {manaCost}
                </span>
              )}
            </div>
            <div className="text-[var(--muted)] text-sm" data-testid="card-type-line">
              {typeLine}
            </div>
          </div>

          {/* Oracle Text */}
          {oracleText && (
            <div className="border-t border-white/10 pt-3">
              <OracleTextWithKeywords
                oracleText={oracleText}
                className="text-sm text-[var(--ink)] whitespace-pre-line"
                data-testid="card-oracle-text"
              />
            </div>
          )}

          {/* Legalities */}
          <div className="border-t border-white/10 pt-3">
            <h3 className="text-sm font-semibold text-[var(--ink)] mb-2">Format Legality</h3>
            <CardLegalityDisplay legalities={card.legalities} />
          </div>

          {/* Metadata */}
          <div className="border-t border-white/10 pt-3 text-sm text-[var(--muted)] space-y-1" data-testid="card-metadata">
            <div>
              <span className="font-medium">Set:</span> {card.set_name} ({card.set.toUpperCase()})
            </div>
            <div>
              <span className="font-medium">Rarity:</span>{' '}
              <span className="capitalize" data-testid="card-rarity">{card.rarity}</span>
            </div>
            {price && (
              <div data-testid="card-price">
                <span className="font-medium">Price:</span> {price}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {isModalOpen && largeImageUri && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsModalOpen(false)}
          data-testid="card-image-modal"
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 bg-black/70 text-white px-4 py-2 rounded-md hover:bg-black/80 text-sm font-medium"
              aria-label="Close fullscreen image"
            >
              Close
            </button>
            <img
              src={largeImageUri}
              alt={name}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}
