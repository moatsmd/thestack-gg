import { renderHook, waitFor } from '@testing-library/react'
import { useNews } from '../useNews'

// Mock fetch
global.fetch = jest.fn()

describe('useNews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts with loading state', () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    })

    const { result } = renderHook(() => useNews())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.items).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('loads news items successfully', async () => {
    const mockItems = [
      {
        title: 'Test News 1',
        link: 'https://example.com/news1',
        pubDate: 'Mon, 01 Jan 2024 12:00:00 GMT',
      },
      {
        title: 'Test News 2',
        link: 'https://example.com/news2',
        pubDate: 'Mon, 02 Jan 2024 12:00:00 GMT',
      },
    ]

    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockItems }),
    })

    const { result } = renderHook(() => useNews())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toEqual(mockItems)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useNews())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toEqual([])
    expect(result.current.error).toBe('Network error')
  })

  it('returns empty array when fetch fails', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    })

    const { result } = renderHook(() => useNews())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('calls fetch API on mount', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    })

    renderHook(() => useNews())

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/news')
    })
  })
})
