'use client'

import { HamburgerMenu } from './HamburgerMenu'

export function RulesHeader() {
  return (
    <header className="border-b border-white/10 bg-[var(--surface-1)]/95 text-[var(--ink)] backdrop-blur transition-colors">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">Card Rulings</h1>
          <HamburgerMenu />
        </div>
      </div>
    </header>
  )
}
