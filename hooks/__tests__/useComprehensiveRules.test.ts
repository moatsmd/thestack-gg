import { renderHook, act, waitFor } from '@testing-library/react'
import { useComprehensiveRules } from '../useComprehensiveRules'
import * as rulesApi from '@/lib/comprehensive-rules'

jest.mock('@/lib/comprehensive-rules')

const mockGetComprehensiveRulesText =
  rulesApi.getComprehensiveRulesText as jest.MockedFunction<
    typeof rulesApi.getComprehensiveRulesText
  >

const sampleRules = `
603.1. Triggered abilities have a trigger condition and an effect.
603.2. Triggered abilities can trigger only once each time their trigger condition is met.
`

describe('useComprehensiveRules', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not auto-load rules on mount', async () => {
    mockGetComprehensiveRulesText.mockResolvedValue(sampleRules)

    const { result } = renderHook(() => useComprehensiveRules())

    // Rules should not load automatically
    expect(result.current.sections).toHaveLength(0)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(mockGetComprehensiveRulesText).not.toHaveBeenCalled()
  })

  it('loads and searches rules when search is triggered', async () => {
    mockGetComprehensiveRulesText.mockResolvedValue(sampleRules)

    const { result } = renderHook(() => useComprehensiveRules())

    // Set query
    act(() => {
      result.current.setQuery('603.1')
    })

    // Trigger search (which should load rules first)
    await act(async () => {
      await result.current.search()
    })

    // Wait for loading to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Rules should be loaded and searched
    expect(mockGetComprehensiveRulesText).toHaveBeenCalled()
    expect(result.current.sections).toHaveLength(2)
    expect(result.current.results.length).toBeGreaterThan(0)
    expect(result.current.results[0].id).toBe('603.1')
  })
})
