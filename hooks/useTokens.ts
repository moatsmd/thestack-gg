'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { TokenDefinition, TokenColor, TokenType } from '@/types/tokens'
import { TOKENS, searchTokens } from '@/lib/tokens-data'

export interface UseTokensResult {
  filteredTokens: TokenDefinition[]
  query: string
  selectedColors: TokenColor[]
  selectedTypes: TokenType[]
  setQuery: (q: string) => void
  toggleColor: (color: TokenColor) => void
  toggleType: (type: TokenType) => void
}

export function useTokens(): UseTokensResult {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedColors, setSelectedColors] = useState<TokenColor[]>([])
  const [selectedTypes, setSelectedTypes] = useState<TokenType[]>([])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const filteredTokens = useMemo(() => {
    let results = debouncedQuery.trim() ? searchTokens(debouncedQuery) : TOKENS

    if (selectedColors.length > 0) {
      results = results.filter((t) =>
        selectedColors.some((c) => t.colors.includes(c))
      )
    }

    if (selectedTypes.length > 0) {
      results = results.filter((t) => selectedTypes.includes(t.type))
    }

    return results
  }, [debouncedQuery, selectedColors, selectedTypes])

  const toggleColor = useCallback((color: TokenColor) =>
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    ), [])

  const toggleType = useCallback((type: TokenType) =>
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    ), [])

  return { filteredTokens, query, selectedColors, selectedTypes, setQuery, toggleColor, toggleType }
}
