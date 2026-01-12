'use client'

import Link from 'next/link'

export function ToolkitHeader() {
  return (
    <header
      className="bg-gray-900 text-white border-b border-gray-700"
      data-testid="toolkit-header"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition"
            aria-label="Back to home"
          >
            ← Back
          </Link>
          <div className="flex-1 text-center text-xl font-bold">
            Card Lookup
          </div>
          <div className="w-16" />
        </div>
      </div>
    </header>
  )
}
