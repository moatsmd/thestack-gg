import { useEffect, useState } from 'react'
import { getComprehensiveRulesText } from '@/lib/comprehensive-rules'
import { ComprehensiveRuleSection, parseComprehensiveRules, searchComprehensiveRules } from '@/lib/rules-parser'

interface UseComprehensiveRulesState {
  sections: ComprehensiveRuleSection[]
  results: ComprehensiveRuleSection[]
  selected: ComprehensiveRuleSection | null
  query: string
  isLoading: boolean
  error: string | null
  setQuery: (value: string) => void
  search: () => void
  selectSection: (section: ComprehensiveRuleSection | null) => void
}

export function useComprehensiveRules(): UseComprehensiveRulesState {
  const [sections, setSections] = useState<ComprehensiveRuleSection[]>([])
  const [results, setResults] = useState<ComprehensiveRuleSection[]>([])
  const [selected, setSelected] = useState<ComprehensiveRuleSection | null>(null)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)

  const loadRules = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setHasAttemptedLoad(true)
      const text = await getComprehensiveRulesText()
      const parsed = parseComprehensiveRules(text)
      setSections(parsed)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rules'
      // Provide more helpful error message for CORS issues
      if (errorMessage.includes('fetch')) {
        setError('Unable to load Comprehensive Rules. This may be due to browser security restrictions. Try using the Card Rulings feature instead.')
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load rules on first mount
  useEffect(() => {
    if (!hasAttemptedLoad) {
      loadRules()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    const nextResults = searchComprehensiveRules(sections, query)
    setResults(nextResults)
    setSelected(nextResults[0] ?? null)
  }

  const selectSection = (section: ComprehensiveRuleSection | null) => {
    setSelected(section)
  }

  return {
    sections,
    results,
    selected,
    query,
    isLoading,
    error,
    setQuery,
    search: handleSearch,
    selectSection,
  }
}
