'use client'

import { HamburgerMenu } from './HamburgerMenu'

export function RulesHeader() {
  return (
    <header className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Rules Lookup</h1>
          <HamburgerMenu />
        </div>
      </div>
    </header>
  )
}
