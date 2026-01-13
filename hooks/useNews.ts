'use client'

import { useState, useEffect } from 'react'
import { fetchWotCNews, NewsItem } from '@/lib/news-fetcher'

export interface UseNewsResult {
  items: NewsItem[]
  isLoading: boolean
  error: string | null
}

export function useNews(): UseNewsResult {
  const [items, setItems] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNews() {
      try {
        setIsLoading(true)
        setError(null)
        const newsItems = await fetchWotCNews()
        setItems(newsItems)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load news'
        setError(errorMessage)
        console.error('Error loading news:', err)
        // Don't throw - just set empty array and error state
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadNews()
  }, [])

  return { items, isLoading, error }
}
