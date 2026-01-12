import { useState, useCallback, useEffect, useRef } from 'react'
import { ScryfallCard } from '@/types/scryfall'
import { autocomplete, searchCards } from '@/lib/scryfall-api'

export interface UseCardSearchResult {
  query: string
  results: ScryfallCard[]
  suggestions: string[]
  selectedCard: ScryfallCard | null
  isLoading: boolean
  error: string | null
  setQuery: (query: string) => void
  selectCard: (card: ScryfallCard) => void
  clearSelection: () => void
  search: () => Promise<void>
}

const AUTOCOMPLETE_DEBOUNCE_MS = 300

export function useCardSearch(): UseCardSearchResult {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<ScryfallCard[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounced autocomplete
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't autocomplete for empty queries
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await autocomplete(query)
        setSuggestions(results)
      } catch (err) {
        // Silently fail autocomplete - it's not critical
        console.error('Autocomplete error:', err)
        setSuggestions([])
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)
    setError(null)
  }, [])

  const search = useCallback(async () => {
    if (!query.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await searchCards(query)
      setResults(response.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const selectCard = useCallback((card: ScryfallCard) => {
    setSelectedCard(card)
    setSuggestions([])
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCard(null)
  }, [])

  return {
    query,
    results,
    suggestions,
    selectedCard,
    isLoading,
    error,
    setQuery,
    selectCard,
    clearSelection,
    search,
  }
}
