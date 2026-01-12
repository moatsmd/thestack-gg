'use client'

import { HamburgerMenu } from './HamburgerMenu'

export function ToolkitHeader() {
  return (
    <header
      className="bg-gray-900 text-white border-b border-gray-700"
      data-testid="toolkit-header"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Card Lookup</h1>
          <HamburgerMenu />
        </div>
      </div>
    </header>
  )
}
