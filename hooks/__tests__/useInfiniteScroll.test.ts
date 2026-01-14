import { renderHook, act } from '@testing-library/react'
import { useInfiniteScroll } from '../useInfiniteScroll'

describe('useInfiniteScroll', () => {
  let mockIntersectionObserver: jest.Mock

  beforeEach(() => {
    mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })
    window.IntersectionObserver = mockIntersectionObserver as any
  })

  it('creates IntersectionObserver with correct options', () => {
    const onLoadMore = jest.fn()
    const { result } = renderHook(() => useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false }))

    // Simulate ref attachment
    const mockElement = document.createElement('div')
    act(() => {
      result.current(mockElement)
    })

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 1.0 }
    )
  })

  it('calls onLoadMore when sentinel is visible and hasMore is true', () => {
    const onLoadMore = jest.fn()
    let observerCallback: IntersectionObserverCallback = () => {}

    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }
    })

    const { result } = renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    )

    // Simulate ref attachment
    const mockElement = document.createElement('div')
    act(() => {
      result.current(mockElement)
    })

    // Trigger intersection
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = jest.fn()
    let observerCallback: IntersectionObserverCallback = () => {}

    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }
    })

    renderHook(() => useInfiniteScroll({ onLoadMore, hasMore: false, isLoading: false }))

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('observes the sentinel element when attached', () => {
    const onLoadMore = jest.fn()
    const mockObserve = jest.fn()
    const mockDisconnect = jest.fn()

    mockIntersectionObserver.mockImplementation(() => ({
      observe: mockObserve,
      unobserve: jest.fn(),
      disconnect: mockDisconnect,
    }))

    const { result } = renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    )

    const mockElement = document.createElement('div')
    act(() => {
      result.current(mockElement)
    })

    expect(mockObserve).toHaveBeenCalledWith(mockElement)
  })

  it('disconnects observer on cleanup', () => {
    const onLoadMore = jest.fn()
    const mockDisconnect = jest.fn()

    mockIntersectionObserver.mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: mockDisconnect,
    }))

    const { result, unmount } = renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    )

    // Attach element to create observer
    const mockElement = document.createElement('div')
    act(() => {
      result.current(mockElement)
    })

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })
})
