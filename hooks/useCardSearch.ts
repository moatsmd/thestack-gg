import { useState, useCallback, useEffect, useRef } from 'react'
import { ScryfallCard } from '@/types/scryfall'
import { autocomplete, searchCards, fetchSearchPage } from '@/lib/scryfall-api'

export interface UseCardSearchResult {
  query: string
  results: ScryfallCard[]
  suggestions: string[]
  selectedCard: ScryfallCard | null
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  error: string | null
  setQuery: (query: string) => void
  selectCard: (card: ScryfallCard) => void
  clearSelection: () => void
  search: (query?: string) => Promise<void>
  loadMore: () => Promise<void>
}

const AUTOCOMPLETE_DEBOUNCE_MS = 300

export function useCardSearch(): UseCardSearchResult {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<ScryfallCard[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const loadingRef = useRef(false)
  const queryRef = useRef('')
  const generationRef = useRef(0)
  const autocompleteGenerationRef = useRef(0)
  const autocompleteEnabledRef = useRef(true)
  const nextPageRef = useRef<string | null>(null)

  useEffect(() => () => {
    generationRef.current += 1
    autocompleteGenerationRef.current += 1
  }, [])

  // Debounced autocomplete
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Don't autocomplete for empty queries
    if (!query.trim() || !autocompleteEnabledRef.current) {
      setSuggestions([])
      return
    }

    // Set new timer
    const generation = autocompleteGenerationRef.current
    let cancelled = false
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const results = await autocomplete(query)
        if (cancelled || generation !== autocompleteGenerationRef.current) return
        setSuggestions(results)
      } catch (err) {
        if (cancelled || generation !== autocompleteGenerationRef.current) return
        // Silently fail autocomplete - it's not critical
        console.error('Autocomplete error:', err)
        setSuggestions([])
      }
    }, AUTOCOMPLETE_DEBOUNCE_MS)

    // Cleanup
    return () => {
      cancelled = true
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  const setQuery = useCallback((newQuery: string) => {
    if (queryRef.current === newQuery) return
    queryRef.current = newQuery
    generationRef.current += 1
    autocompleteGenerationRef.current += 1
    autocompleteEnabledRef.current = true
    nextPageRef.current = null
    loadingRef.current = false
    setQueryState(newQuery)
    setSuggestions([])
    setResults([])
    setSelectedCard(null)
    setHasMore(false)
    setIsLoading(false)
    setIsLoadingMore(false)
    setError(null)
  }, [])

  const search = useCallback(async (requestedQuery?: string) => {
    if (requestedQuery !== undefined) setQuery(requestedQuery)
    const searchQuery = queryRef.current.trim()
    if (!searchQuery) {
      return
    }

    const generation = ++generationRef.current
    autocompleteGenerationRef.current += 1
    autocompleteEnabledRef.current = false
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    nextPageRef.current = null
    loadingRef.current = false
    setSuggestions([])
    setResults([])
    setSelectedCard(null)
    setHasMore(false)
    setIsLoading(true)
    setIsLoadingMore(false)
    setError(null)

    try {
      const response = await searchCards(searchQuery)
      if (generation !== generationRef.current) return
      // Scryfall's word search can put "Solemn Offering" before "Sol Ring".
      // Prefer the exact requested name without changing advanced query syntax.
      const normalizedQuery = searchQuery.toLowerCase().replace(/\s+/g, ' ')
      const exactMatch = response.data.find((card) => card.name.toLowerCase().replace(/\s+/g, ' ') === normalizedQuery)
      const cards = exactMatch ? [exactMatch, ...response.data.filter((card) => card !== exactMatch)] : response.data
      setResults(cards)
      setHasMore(response.has_more)
      nextPageRef.current = response.next_page || null

      // Automatically select the first result
      if (cards.length > 0) {
        setSelectedCard(cards[0])
        setSuggestions([])
      } else {
        setSelectedCard(null)
        setError('No cards found matching your search')
      }
    } catch (err) {
      if (generation !== generationRef.current) return
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      setResults([])
      setSelectedCard(null)
      setHasMore(false)
      nextPageRef.current = null
    } finally {
      if (generation === generationRef.current) setIsLoading(false)
    }
  }, [setQuery])

  const loadMore = useCallback(async () => {
    // Don't load if there's no more data, no next page URL, or already loading
    const nextPage = nextPageRef.current
    if (!nextPage || loadingRef.current) {
      return
    }

    loadingRef.current = true
    const generation = generationRef.current
    setIsLoadingMore(true)

    try {
      const response = await fetchSearchPage(nextPage)
      if (generation !== generationRef.current) return
      // Append new results to existing results
      setResults(prev => [...prev, ...response.data])
      setHasMore(response.has_more)
      nextPageRef.current = response.next_page || null
    } catch (err) {
      if (generation !== generationRef.current) return
      const message = err instanceof Error ? err.message : 'Failed to load more results'
      setError(message)
      setHasMore(false)
      nextPageRef.current = null
    } finally {
      if (generation === generationRef.current) {
        setIsLoadingMore(false)
        loadingRef.current = false
      }
    }
  }, [])

  const selectCard = useCallback((card: ScryfallCard) => {
    autocompleteGenerationRef.current += 1
    autocompleteEnabledRef.current = false
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
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
    isLoadingMore,
    hasMore,
    error,
    setQuery,
    selectCard,
    clearSelection,
    search,
    loadMore,
  }
}
