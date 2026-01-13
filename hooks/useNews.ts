'use client'

import { useState, useEffect } from 'react'

export interface NewsItem {
  title: string
  link: string
  pubDate: string
  description?: string
  category?: string
}

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

        // Fetch from our API route (avoids CORS issues)
        const response = await fetch('/api/news')
        if (!response.ok) {
          throw new Error(`Failed to fetch news: ${response.status}`)
        }

        const data = await response.json()
        if (data.error) {
          throw new Error(data.message || 'Failed to load news')
        }

        setItems(data.items || [])
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
