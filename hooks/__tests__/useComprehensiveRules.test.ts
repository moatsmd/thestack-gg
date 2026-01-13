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

  it('loads and parses rules on mount', async () => {
    mockGetComprehensiveRulesText.mockResolvedValue(sampleRules)

    const { result } = renderHook(() => useComprehensiveRules())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.sections).toHaveLength(2)
    expect(result.current.error).toBeNull()
  })

  it('searches rules by query', async () => {
    mockGetComprehensiveRulesText.mockResolvedValue(sampleRules)

    const { result } = renderHook(() => useComprehensiveRules())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    act(() => {
      result.current.setQuery('603.1')
    })

    act(() => {
      result.current.search()
    })

    expect(result.current.results[0].id).toBe('603.1')
  })
})
