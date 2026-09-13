import { useCallback, useEffect, useRef, useState } from 'react'
import { ComprehensiveRuleSection, searchComprehensiveRules } from '@/lib/rules-parser'

interface UseComprehensiveRulesState {
  sections: ComprehensiveRuleSection[]
  results: ComprehensiveRuleSection[]
  selected: ComprehensiveRuleSection | null
  query: string
  isLoading: boolean
  error: string | null
  setQuery: (value: string) => void
  search: () => Promise<void>
  selectSection: (section: ComprehensiveRuleSection | null) => void
}

export function useComprehensiveRules(): UseComprehensiveRulesState {
  const [sections, setSections] = useState<ComprehensiveRuleSection[]>([])
  const [results, setResults] = useState<ComprehensiveRuleSection[]>([])
  const [selected, setSelected] = useState<ComprehensiveRuleSection | null>(null)
  const [query, setQueryState] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const loaded = useRef<ComprehensiveRuleSection[] | null>(null)
  const pendingLoad = useRef<Promise<ComprehensiveRuleSection[]> | null>(null)
  const latestQuery = useRef('')
  const latestSearch = useRef(0)
  const lifecycle = useRef(0)

  useEffect(() => () => {
    lifecycle.current += 1
    latestSearch.current += 1
    pendingLoad.current = null
  }, [])

  const setQuery = useCallback((value: string) => {
    latestQuery.current = value
    setQueryState(value)
  }, [])

  // Fetch lazily, coalesce concurrent searches, and cache only successes.
  // A transient network failure must leave the next search free to retry.
  const loadRules = useCallback((): Promise<ComprehensiveRuleSection[]> => {
    if (loaded.current) return Promise.resolve(loaded.current)
    if (pendingLoad.current) return pendingLoad.current
    const generation = lifecycle.current
    setIsLoading(true)
    setError(null)
    const job = (async () => {
      try {
        const response = await fetch('/api/rules')
        if (!response.ok) throw new Error(`Failed to fetch rules: ${response.status}`)
        const data = await response.json()
        if (data.error) throw new Error(data.message || 'Failed to load rules')
        const parsed = data.rules as ComprehensiveRuleSection[]
        if (generation === lifecycle.current) {
          loaded.current = parsed
          setSections(parsed)
        }
        return parsed
      } catch (err) {
        if (generation === lifecycle.current) setError(err instanceof Error ? err.message : 'Failed to load rules')
        return []
      } finally {
        if (generation === lifecycle.current) setIsLoading(false)
      }
    })()
    pendingLoad.current = job
    void job.finally(() => { if (pendingLoad.current === job) pendingLoad.current = null })
    return job
  }, [])

  const search = useCallback(async () => {
    const searchId = ++latestSearch.current
    const sectionsToSearch = await loadRules()
    if (searchId !== latestSearch.current) return
    const nextResults = searchComprehensiveRules(sectionsToSearch, latestQuery.current)
    setResults(nextResults)
    setSelected(nextResults[0] ?? null)
  }, [loadRules])

  return {
    sections, results, selected, query, isLoading, error, setQuery, search,
    selectSection: setSelected,
  }
}
