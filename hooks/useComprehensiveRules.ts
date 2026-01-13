import { useState } from 'react'
import { ComprehensiveRuleSection, searchComprehensiveRules } from '@/lib/rules-parser'

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

  const loadRules = async (): Promise<ComprehensiveRuleSection[]> => {
    try {
      setIsLoading(true)
      setError(null)
      setHasAttemptedLoad(true)

      // Fetch from our API route (avoids CORS issues)
      const response = await fetch('/api/rules')
      if (!response.ok) {
        throw new Error(`Failed to fetch rules: ${response.status}`)
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.message || 'Failed to load rules')
      }

      const parsed = data.rules as ComprehensiveRuleSection[]
      setSections(parsed)
      return parsed
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load rules'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Don't auto-load - let user initiate via search
  // This avoids CORS errors on page load

  const handleSearch = async () => {
    // Load rules if not already loaded
    let sectionsToSearch = sections
    if (sections.length === 0 && !hasAttemptedLoad) {
      sectionsToSearch = await loadRules()
    }

    const nextResults = searchComprehensiveRules(sectionsToSearch, query)
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
