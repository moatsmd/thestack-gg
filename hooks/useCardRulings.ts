'use client'

import { useEffect, useState } from 'react'
import { getCardRulings } from '@/lib/scryfall-api'
import { ScryfallCard, ScryfallRuling } from '@/types/scryfall'

interface UseCardRulingsState {
  rulings: ScryfallRuling[]
  isLoading: boolean
  error: string | null
}

export function useCardRulings(card: ScryfallCard | null): UseCardRulingsState {
  const [rulings, setRulings] = useState<ScryfallRuling[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadRulings = async () => {
      if (!card?.rulings_uri) {
        setRulings([])
        setIsLoading(false)
        setError(null)
        return
      }

      try {
        setIsLoading(true)
        const response = await getCardRulings(card.rulings_uri)
        if (!isMounted) {
          return
        }
        setRulings(response.data)
        setError(null)
      } catch (err) {
        if (!isMounted) {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to load rulings')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadRulings()

    return () => {
      isMounted = false
    }
  }, [card?.rulings_uri])

  return {
    rulings,
    isLoading,
    error,
  }
}
