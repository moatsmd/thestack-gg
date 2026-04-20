'use client'

import { useState, useMemo, useCallback } from 'react'
import { KeywordDefinition, KEYWORDS, searchKeywords } from '@/lib/keywords-data'

export type KeywordTier = KeywordDefinition['tier']

export interface UseKeywordsResult {
  allKeywords: KeywordDefinition[]
  filteredKeywords: KeywordDefinition[]
  query: string
  selectedType: KeywordDefinition['type'] | 'all'
  selectedTiers: KeywordTier[]
  setQuery: (query: string) => void
  setType: (type: KeywordDefinition['type'] | 'all') => void
  toggleTier: (tier: KeywordTier) => void
}

export function useKeywords(): UseKeywordsResult {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<KeywordDefinition['type'] | 'all'>('all')
  const [selectedTiers, setSelectedTiers] = useState<KeywordTier[]>(['evergreen', 'returning'])

  const filteredKeywords = useMemo(() => {
    let results = query.trim() ? searchKeywords(query) : KEYWORDS

    if (selectedType !== 'all') {
      results = results.filter((kw) => kw.type === selectedType)
    }

    results = results.filter((kw) => selectedTiers.includes(kw.tier))

    return results
  }, [query, selectedType, selectedTiers])

  const toggleTier = useCallback((tier: KeywordTier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    )
  }, [])

  return {
    allKeywords: KEYWORDS,
    filteredKeywords,
    query,
    selectedType,
    selectedTiers,
    setQuery,
    setType: setSelectedType,
    toggleTier,
  }
}
