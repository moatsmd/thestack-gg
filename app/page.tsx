'use client'

import Link from 'next/link'
import { HamburgerMenu } from '@/components/HamburgerMenu'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white transition-colors">
      {/* Hamburger Menu */}
      <div className="fixed top-4 right-4 z-10">
        <HamburgerMenu />
      </div>

      <h1 className="text-6xl font-bold mb-4">TheStack.gg</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 text-center max-w-md">
        Your mobile-friendly Magic: The Gathering toolkit
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link
          href="/tracker"
          className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-8 px-6 rounded-lg text-center transition min-h-tap"
        >
          Life Tracker
        </Link>

        <Link
          href="/toolkit"
          className="bg-purple-600 hover:bg-purple-700 text-white text-2xl font-bold py-8 px-6 rounded-lg text-center transition min-h-tap"
        >
          Card Lookup
        </Link>

        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>More features coming soon:</p>
          <p className="mt-2">Deck Tracking</p>
        </div>
      </div>
    </div>
  )
}
