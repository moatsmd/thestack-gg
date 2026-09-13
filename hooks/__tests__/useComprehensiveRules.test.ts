import { renderHook, act, waitFor } from '@testing-library/react'
import { useComprehensiveRules } from '../useComprehensiveRules'

// Mock fetch
global.fetch = jest.fn()

const mockParsedRules = [
  {
    id: '603.1',
    title: 'Triggered Abilities',
    body: 'Triggered abilities have a trigger condition and an effect.',
  },
  {
    id: '603.2',
    title: 'Triggered Abilities',
    body: 'Triggered abilities can trigger only once each time their trigger condition is met.',
  },
]

describe('useComprehensiveRules', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('does not auto-load rules on mount', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ rules: mockParsedRules, cached: false }),
    })

    const { result } = renderHook(() => useComprehensiveRules())

    // Rules should not load automatically
    expect(result.current.sections).toHaveLength(0)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('loads and searches rules when search is triggered', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ rules: mockParsedRules, cached: false }),
    })

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
    expect(global.fetch).toHaveBeenCalledWith('/api/rules')
    expect(result.current.sections).toHaveLength(2)
    expect(result.current.results.length).toBeGreaterThan(0)
    expect(result.current.results[0].id).toBe('603.1')
  })
})

it('retries the rules request after a transient failure', async () => {
  ;(global.fetch as jest.Mock).mockReset()
    .mockRejectedValueOnce(new Error('Connection lost'))
    .mockResolvedValueOnce({ ok: true, json: async () => ({ rules: mockParsedRules }) })
  const { result } = renderHook(() => useComprehensiveRules())
  act(() => result.current.setQuery('603.1'))
  await act(async () => { await result.current.search() })
  expect(result.current.error).toBe('Connection lost')
  await act(async () => { await result.current.search() })
  expect(global.fetch).toHaveBeenCalledTimes(2)
  expect(result.current.error).toBeNull()
  expect(result.current.selected?.id).toBe('603.1')
})

it('shares one rules load between overlapping searches and displays the latest query', async () => {
  let finish!: (value: unknown) => void
  ;(global.fetch as jest.Mock).mockReset().mockReturnValue(new Promise(resolve => { finish = resolve }))
  const { result } = renderHook(() => useComprehensiveRules())
  let first!: ReturnType<typeof result.current.search>
  let second!: ReturnType<typeof result.current.search>
  act(() => {
    result.current.setQuery('603.1')
    first = result.current.search()
    result.current.setQuery('603.2')
    second = result.current.search()
  })
  expect(global.fetch).toHaveBeenCalledTimes(1)
  await act(async () => {
    finish({ ok: true, json: async () => ({ rules: mockParsedRules }) })
    await Promise.all([first, second])
  })
  expect(result.current.selected?.id).toBe('603.2')
})

it('uses a query edited while the rules are still loading', async () => {
  let finish!: (value: unknown) => void
  ;(global.fetch as jest.Mock).mockReset().mockReturnValue(new Promise(resolve => { finish = resolve }))
  const { result } = renderHook(() => useComprehensiveRules())
  act(() => result.current.setQuery('603.1'))
  let pending!: ReturnType<typeof result.current.search>
  act(() => { pending = result.current.search() })
  act(() => result.current.setQuery('603.2'))
  await act(async () => {
    finish({ ok: true, json: async () => ({ rules: mockParsedRules }) })
    await pending
  })
  expect(result.current.selected?.id).toBe('603.2')
})
