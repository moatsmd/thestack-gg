'use client'

import { NewsItem } from './NewsItem'
import { NewsItem as NewsItemType } from '@/lib/news-fetcher'

interface NewsSectionProps {
  items: NewsItemType[]
  isLoading: boolean
  error: string | null
}

export function NewsSection({ items, isLoading, error }: NewsSectionProps) {
  if (isLoading) {
    return (
      <section className="w-full max-w-4xl" data-testid="news-section">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Latest from Card Kingdom Blog</h2>

        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="news-loading">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error || items.length === 0) {
    return (
      <section className="w-full max-w-4xl" data-testid="news-section">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Latest from Card Kingdom Blog</h2>

        {/* Error or Fallback Message */}
        <div
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm text-center"
          data-testid="news-error"
        >
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Unable to load latest news at this time.
          </p>
          <a
            href="https://blog.cardkingdom.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-teal-600 dark:text-teal-400 hover:underline font-medium"
          >
            Visit Card Kingdom Blog →
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full max-w-4xl" data-testid="news-section">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Latest from Card Kingdom Blog</h2>

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="news-grid">
        {items.map((item, index) => (
          <NewsItem key={`${item.link}-${index}`} item={item} />
        ))}
      </div>

      {/* Link to More News */}
      <div className="mt-6 text-center">
        <a
          href="https://blog.cardkingdom.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-teal-600 dark:text-teal-400 hover:underline font-medium text-lg"
        >
          View more on Card Kingdom Blog →
        </a>
      </div>
    </section>
  )
}
