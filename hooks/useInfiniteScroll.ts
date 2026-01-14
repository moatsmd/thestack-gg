import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
}

/**
 * Hook for infinite scroll functionality using Intersection Observer
 * Returns a ref callback to attach to the sentinel element
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      // Don't observe if we can't load more
      if (!hasMore || isLoading) {
        return
      }

      // Create new observer
      if (node) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
              onLoadMore()
            }
          },
          { threshold: 1.0 }
        )

        observerRef.current.observe(node)
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return sentinelRef
}
