'use client'

import { useState, useMemo } from 'react'
import { KeywordDefinition, KEYWORDS, searchKeywords } from '@/lib/keywords-data'

export interface UseKeywordsResult {
  allKeywords: KeywordDefinition[]
  filteredKeywords: KeywordDefinition[]
  query: string
  selectedType: KeywordDefinition['type'] | 'all'
  setQuery: (query: string) => void
  setType: (type: KeywordDefinition['type'] | 'all') => void
}

export function useKeywords(): UseKeywordsResult {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<KeywordDefinition['type'] | 'all'>('all')

  const filteredKeywords = useMemo(() => {
    // First filter by search query
    let results = query.trim() ? searchKeywords(query) : KEYWORDS

    // Then filter by type if not 'all'
    if (selectedType !== 'all') {
      results = results.filter((kw) => kw.type === selectedType)
    }

    return results
  }, [query, selectedType])

  return {
    allKeywords: KEYWORDS,
    filteredKeywords,
    query,
    selectedType,
    setQuery,
    setType: setSelectedType,
  }
}
