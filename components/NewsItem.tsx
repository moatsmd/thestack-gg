'use client'

import { NewsItem as NewsItemType } from '@/lib/news-fetcher'

interface NewsItemProps {
  item: NewsItemType
}

export function NewsItem({ item }: NewsItemProps) {
  // Format the date to be more readable
  const formattedDate = new Date(item.pubDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
      data-testid="news-item"
    >
      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {item.title}
      </h3>

      {/* Date */}
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{formattedDate}</p>

      {/* External Link Icon */}
      <div className="flex items-center text-teal-600 dark:text-teal-400 text-sm font-medium">
        <span>Read more</span>
        <svg
          className="w-4 h-4 ml-1"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  )
}
