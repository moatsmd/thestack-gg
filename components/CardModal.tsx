'use client'

import { DialogFocus } from './DialogFocus'
import { ScryfallCard } from '@/types/scryfall'
import { CardDisplay } from './CardDisplay'

interface CardModalProps {
  card: ScryfallCard
  isOpen: boolean
  onClose: () => void
}

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      data-testid="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <DialogFocus onClose={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-transparent"
        data-testid="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          aria-label="Close modal"
        >
          Close
        </button>

        {/* Card display */}
        <div id="modal-title">
          <CardDisplay key={card.id} card={card} />
        </div>
      </div>
    </div>
  )
}
