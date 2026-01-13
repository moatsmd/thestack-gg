import { renderHook, waitFor } from '@testing-library/react'
import { useNews } from '../useNews'
import * as newsFetcher from '@/lib/news-fetcher'

jest.mock('@/lib/news-fetcher')

describe('useNews', () => {
  const mockFetchWotCNews = newsFetcher.fetchWotCNews as jest.MockedFunction<
    typeof newsFetcher.fetchWotCNews
  >

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('starts with loading state', () => {
    mockFetchWotCNews.mockResolvedValue([])

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

    mockFetchWotCNews.mockResolvedValue(mockItems)

    const { result } = renderHook(() => useNews())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toEqual(mockItems)
    expect(result.current.error).toBeNull()
  })

  it('handles fetch errors gracefully', async () => {
    mockFetchWotCNews.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useNews())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toEqual([])
    expect(result.current.error).toBe('Network error')
  })

  it('returns empty array when fetch fails', async () => {
    mockFetchWotCNews.mockResolvedValue([])

    const { result } = renderHook(() => useNews())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.items).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('calls fetchWotCNews on mount', async () => {
    mockFetchWotCNews.mockResolvedValue([])

    renderHook(() => useNews())

    await waitFor(() => {
      expect(mockFetchWotCNews).toHaveBeenCalledTimes(1)
    })
  })
})
