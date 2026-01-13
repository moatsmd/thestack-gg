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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadRules = async () => {
      try {
        setIsLoading(true)
        const text = await getComprehensiveRulesText()
        const parsed = parseComprehensiveRules(text)

        if (!isMounted) {
          return
        }

        setSections(parsed)
        setError(null)
      } catch (err) {
        if (!isMounted) {
          return
        }
        setError(err instanceof Error ? err.message : 'Failed to load rules')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadRules()

    return () => {
      isMounted = false
    }
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
