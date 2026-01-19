'use client'

import { useState } from 'react'

export function CardSearchHelp() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className="rounded-lg border border-white/10 bg-[var(--surface-1)] overflow-hidden transition-colors"
      data-testid="card-search-help"
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
        aria-expanded={isExpanded}
        aria-controls="search-help-content"
      >
        <span className="text-sm font-semibold text-[var(--ink)]">Search Help</span>
        <span className="text-[var(--muted)] text-lg font-bold" aria-hidden="true">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div id="search-help-content" className="px-4 py-3 border-t border-white/10">
          <p className="text-sm text-[var(--muted)] mb-3">
            Use Scryfall search syntax to find specific cards:
          </p>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li>
              <code className="bg-white/5 px-2 py-1 rounded">legal:commander</code>
              <span className="ml-2">— Commander-legal cards</span>
            </li>
            <li>
              <code className="bg-white/5 px-2 py-1 rounded">c:blue</code>
              <span className="ml-2">— Blue cards</span>
            </li>
            <li>
              <code className="bg-white/5 px-2 py-1 rounded">t:creature</code>
              <span className="ml-2">— Creature type</span>
            </li>
            <li>
              <code className="bg-white/5 px-2 py-1 rounded">o:draw</code>
              <span className="ml-2">— Contains &quot;draw&quot; in text</span>
            </li>
            <li>
              <code className="bg-white/5 px-2 py-1 rounded">cmc=3</code>
              <span className="ml-2">— CMC equals 3</span>
            </li>
            <li className="pt-2 border-t border-white/10">
              <strong>Combine searches:</strong>
              <div className="mt-1">
                <code className="bg-white/5 px-2 py-1 rounded text-xs">
                  legal:commander c:blue t:creature o:draw
                </code>
              </div>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
