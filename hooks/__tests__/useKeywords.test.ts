import { renderHook, act } from '@testing-library/react'
import { useKeywords } from '../useKeywords'
import { KEYWORDS } from '@/lib/keywords-data'

describe('useKeywords', () => {
  it('returns all keywords by default', () => {
    const { result } = renderHook(() => useKeywords())

    expect(result.current.allKeywords).toEqual(KEYWORDS)
    expect(result.current.filteredKeywords).toEqual(KEYWORDS)
    expect(result.current.query).toBe('')
    expect(result.current.selectedType).toBe('all')
  })

  it('filters keywords by search query', () => {
    const { result } = renderHook(() => useKeywords())

    act(() => {
      result.current.setQuery('fly')
    })

    expect(result.current.query).toBe('fly')
    expect(result.current.filteredKeywords.length).toBeGreaterThan(0)
    expect(result.current.filteredKeywords.length).toBeLessThan(KEYWORDS.length)

    // Should include "Flying" keyword
    const hasFlying = result.current.filteredKeywords.some(
      (kw) => kw.keyword.toLowerCase() === 'flying'
    )
    expect(hasFlying).toBe(true)
  })

  it('filters keywords by type', () => {
    const { result } = renderHook(() => useKeywords())

    act(() => {
      result.current.setType('ability')
    })

    expect(result.current.selectedType).toBe('ability')
    expect(result.current.filteredKeywords.length).toBeGreaterThan(0)

    // All results should be abilities
    const allAbilities = result.current.filteredKeywords.every((kw) => kw.type === 'ability')
    expect(allAbilities).toBe(true)
  })

  it('filters by both query and type', () => {
    const { result } = renderHook(() => useKeywords())

    act(() => {
      result.current.setQuery('strike')
      result.current.setType('ability')
    })

    expect(result.current.filteredKeywords.length).toBeGreaterThan(0)

    // All results should be abilities matching "strike"
    const allValid = result.current.filteredKeywords.every(
      (kw) =>
        kw.type === 'ability' &&
        (kw.keyword.toLowerCase().includes('strike') ||
          kw.definition.toLowerCase().includes('strike'))
    )
    expect(allValid).toBe(true)
  })

  it('returns empty array when no keywords match', () => {
    const { result } = renderHook(() => useKeywords())

    act(() => {
      result.current.setQuery('xyznonexistentkeyword')
    })

    expect(result.current.filteredKeywords).toEqual([])
  })

  it('resets to all keywords when query is cleared', () => {
    const { result } = renderHook(() => useKeywords())

    // Set a query
    act(() => {
      result.current.setQuery('flying')
    })
    expect(result.current.filteredKeywords.length).toBeLessThan(KEYWORDS.length)

    // Clear the query
    act(() => {
      result.current.setQuery('')
    })
    expect(result.current.filteredKeywords).toEqual(KEYWORDS)
  })

  it('returns all keywords when type is set to "all"', () => {
    const { result } = renderHook(() => useKeywords())

    // Set a specific type
    act(() => {
      result.current.setType('action')
    })
    expect(result.current.filteredKeywords.length).toBeLessThan(KEYWORDS.length)

    // Reset to all
    act(() => {
      result.current.setType('all')
    })
    expect(result.current.filteredKeywords).toEqual(KEYWORDS)
  })

  it('filters keywords by type "mechanic"', () => {
    const { result } = renderHook(() => useKeywords())

    act(() => {
      result.current.setType('mechanic')
    })

    expect(result.current.selectedType).toBe('mechanic')
    expect(result.current.filteredKeywords.length).toBeGreaterThan(0)

    // All results should be mechanics
    const allMechanics = result.current.filteredKeywords.every((kw) => kw.type === 'mechanic')
    expect(allMechanics).toBe(true)
  })

  it('filters keywords by type "action"', () => {
    const { result } = renderHook(() => useKeywords())

    act(() => {
      result.current.setType('action')
    })

    expect(result.current.selectedType).toBe('action')
    expect(result.current.filteredKeywords.length).toBeGreaterThan(0)

    // All results should be actions
    const allActions = result.current.filteredKeywords.every((kw) => kw.type === 'action')
    expect(allActions).toBe(true)
  })
})
