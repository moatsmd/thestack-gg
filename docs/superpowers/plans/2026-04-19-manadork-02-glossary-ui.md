# ManaDork Overhaul — Plan 2: Glossary UI

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a tier filter row to the glossary (Evergreen / Returning / Retired), show a color-coded tier badge on each keyword card, and add a Scryfall deeplink for keywords that have a `scryfallQuery`.

**Architecture:** `useKeywords` gains `selectedTiers` state (multi-select, defaults to `['evergreen', 'returning']`). `glossary/page.tsx` renders a second filter row. `KeywordCard` grows a tier badge (green/blue/gray dot) and an optional "See cards →" link that routes to `/toolkit?q={scryfallQuery}`.

**Tech Stack:** Next.js 14 App Router, React 18, TypeScript, Tailwind CSS 3.

**Prerequisite:** Plan 1 complete — all keywords have a `tier` field.

---

## File Map

| File | Action |
|---|---|
| `hooks/useKeywords.ts` | Modify: add `selectedTiers` multi-select state and filter logic |
| `app/glossary/page.tsx` | Modify: add tier filter row below type filter |
| `components/KeywordCard.tsx` | Modify: add tier badge + optional Scryfall link |
| `app/__tests__/glossary.test.tsx` | Modify: add tier filter tests; update stale assertions |

---

### Task 5: Tier filter — hook and glossary page

**Files:**
- Modify: `hooks/useKeywords.ts`
- Modify: `app/glossary/page.tsx`
- Modify: `app/__tests__/glossary.test.tsx`

- [ ] **Step 1: Write failing tests**

In `app/__tests__/glossary.test.tsx`, add inside the existing `describe` block:

```tsx
it('renders tier filter buttons', () => {
  renderWithProviders(<GlossaryPage />)
  expect(screen.getByTestId('filter-tier-evergreen')).toBeInTheDocument()
  expect(screen.getByTestId('filter-tier-returning')).toBeInTheDocument()
  expect(screen.getByTestId('filter-tier-retired')).toBeInTheDocument()
})

it('retired keywords are hidden by default', async () => {
  const { KEYWORDS } = require('@/lib/keywords-data')
  const retiredKeyword = KEYWORDS.find((kw: any) => kw.tier === 'retired')
  renderWithProviders(<GlossaryPage />)
  // Retired keyword should not appear in default view
  await waitFor(() => {
    const cards = screen.getAllByTestId('keyword-card')
    const names = cards.map((c) => c.querySelector('h3')?.textContent)
    expect(names).not.toContain(retiredKeyword.keyword)
  })
})

it('shows retired keywords when retired tier is enabled', async () => {
  const user = userEvent.setup()
  const { KEYWORDS } = require('@/lib/keywords-data')
  const retiredKeyword = KEYWORDS.find((kw: any) => kw.tier === 'retired')
  renderWithProviders(<GlossaryPage />)
  const retiredButton = screen.getByTestId('filter-tier-retired')
  await user.click(retiredButton)
  await waitFor(() => {
    const cards = screen.getAllByTestId('keyword-card')
    const names = cards.map((c) => c.querySelector('h3')?.textContent)
    expect(names).toContain(retiredKeyword.keyword)
  })
})
```

Also update the stale test at the bottom of the file — the existing `highlights selected filter button` test checks `bg-teal-600` but the actual class is `bg-[var(--accent-2)]`. Replace that assertion:

```tsx
// Find and replace:
// expect(allButton).toHaveClass('bg-teal-600')
// with:
expect(allButton).toHaveClass('bg-[var(--accent-2)]')
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/glossary.test.tsx --testNamePattern="renders tier filter" --no-coverage 2>&1 | tail -10
```

Expected: FAIL — tier filter buttons not found.

- [ ] **Step 3: Update `hooks/useKeywords.ts`**

Replace the entire file:

```ts
'use client'

import { useState, useMemo } from 'react'
import { KeywordDefinition, KEYWORDS, searchKeywords } from '@/lib/keywords-data'

export type KeywordTier = KeywordDefinition['tier']

export interface UseKeywordsResult {
  allKeywords: KeywordDefinition[]
  filteredKeywords: KeywordDefinition[]
  query: string
  selectedType: KeywordDefinition['type'] | 'all'
  selectedTiers: KeywordTier[]
  setQuery: (query: string) => void
  setType: (type: KeywordDefinition['type'] | 'all') => void
  toggleTier: (tier: KeywordTier) => void
}

export function useKeywords(): UseKeywordsResult {
  const [query, setQuery] = useState('')
  const [selectedType, setSelectedType] = useState<KeywordDefinition['type'] | 'all'>('all')
  const [selectedTiers, setSelectedTiers] = useState<KeywordTier[]>(['evergreen', 'returning'])

  const filteredKeywords = useMemo(() => {
    let results = query.trim() ? searchKeywords(query) : KEYWORDS

    if (selectedType !== 'all') {
      results = results.filter((kw) => kw.type === selectedType)
    }

    results = results.filter((kw) => selectedTiers.includes(kw.tier))

    return results
  }, [query, selectedType, selectedTiers])

  const toggleTier = (tier: KeywordTier) => {
    setSelectedTiers((prev) =>
      prev.includes(tier) ? prev.filter((t) => t !== tier) : [...prev, tier]
    )
  }

  return {
    allKeywords: KEYWORDS,
    filteredKeywords,
    query,
    selectedType,
    selectedTiers,
    setQuery,
    setType: setSelectedType,
    toggleTier,
  }
}
```

- [ ] **Step 4: Update `app/glossary/page.tsx`**

Replace the entire file:

```tsx
'use client'

import { useState, useEffect } from 'react'
import { GlossaryHeader } from '@/components/GlossaryHeader'
import { KeywordCard } from '@/components/KeywordCard'
import { useKeywords } from '@/hooks/useKeywords'
import { KeywordDefinition } from '@/lib/keywords-data'
import type { KeywordTier } from '@/hooks/useKeywords'

export default function GlossaryPage() {
  const { filteredKeywords, query, selectedType, selectedTiers, setQuery, setType, toggleTier } = useKeywords()
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(debouncedQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedQuery, setQuery])

  const tierConfig: { tier: KeywordTier; label: string; activeClass: string; testId: string }[] = [
    { tier: 'evergreen', label: 'Evergreen', activeClass: 'bg-green-600 text-white', testId: 'filter-tier-evergreen' },
    { tier: 'returning', label: 'Returning', activeClass: 'bg-blue-600 text-white', testId: 'filter-tier-returning' },
    { tier: 'retired', label: 'Retired', activeClass: 'bg-[var(--muted)] text-white', testId: 'filter-tier-retired' },
  ]

  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] transition-colors">
      <GlossaryHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 space-y-4 arcane-panel mana-border rounded-2xl p-6">
          {/* Search Input */}
          <div>
            <label htmlFor="keyword-search" className="sr-only">
              Search keywords
            </label>
            <input
              id="keyword-search"
              type="text"
              placeholder="Search keywords..."
              value={debouncedQuery}
              onChange={(e) => setDebouncedQuery(e.target.value)}
              className="w-full px-4 py-2 border border-white/10 rounded-lg bg-[var(--surface-1)] text-[var(--ink)] focus:ring-2 focus:ring-[var(--accent-2)] focus:border-transparent"
              data-testid="keyword-search"
            />
          </div>

          {/* Type Filter Row */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setType('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                selectedType === 'all'
                  ? 'bg-[var(--accent-2)] text-gray-900'
                  : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
              }`}
              data-testid="filter-all"
            >
              All
            </button>
            {(['ability', 'action', 'mechanic'] as const).map((t) => {
              const activeColors = { ability: 'bg-blue-600 text-white', action: 'bg-green-600 text-white', mechanic: 'bg-purple-600 text-white' }
              return (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    selectedType === t
                      ? activeColors[t]
                      : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                  }`}
                  data-testid={`filter-${t}`}
                >
                  {t === 'ability' ? 'Abilities' : t === 'action' ? 'Actions' : 'Mechanics'}
                </button>
              )
            })}
          </div>

          {/* Tier Filter Row */}
          <div className="flex flex-wrap gap-2">
            {tierConfig.map(({ tier, label, activeClass, testId }) => (
              <button
                key={tier}
                onClick={() => toggleTier(tier)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedTiers.includes(tier)
                    ? activeClass
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:bg-[var(--surface-1)]'
                }`}
                data-testid={testId}
                aria-pressed={selectedTiers.includes(tier)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-[var(--muted)] mb-4">
          Showing {filteredKeywords.length} keyword{filteredKeywords.length !== 1 ? 's' : ''}
        </p>

        {/* Keywords Grid */}
        {filteredKeywords.length > 0 ? (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            data-testid="keywords-grid"
          >
            {filteredKeywords.map((keyword) => (
              <KeywordCard key={keyword.keyword} keyword={keyword} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 text-[var(--muted)]"
            data-testid="empty-state"
          >
            <p className="text-lg font-semibold mb-2">No keywords found</p>
            <p>Try adjusting your search or filter</p>
          </div>
        )}
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Run all glossary tests**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/glossary.test.tsx --no-coverage 2>&1 | tail -25
```

Expected: all tests pass.

- [ ] **Step 6: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
cd C:/Users/moats/ManaDork && git add hooks/useKeywords.ts app/glossary/page.tsx app/__tests__/glossary.test.tsx && git commit -m "feat(glossary): add tier multi-select filter (Evergreen/Returning/Retired, defaults to evergreen+returning)"
```

---

### Task 6: KeywordCard — tier badge and Scryfall link

**Files:**
- Modify: `components/KeywordCard.tsx`
- Modify: `app/__tests__/glossary.test.tsx`

- [ ] **Step 1: Write failing tests**

In `app/__tests__/glossary.test.tsx`, add:

```tsx
it('keyword cards show a tier badge', () => {
  renderWithProviders(<GlossaryPage />)
  const badges = screen.getAllByTestId('tier-badge')
  expect(badges.length).toBeGreaterThan(0)
})

it('scryfall link appears on keywords with scryfallQuery', () => {
  const { KEYWORDS } = require('@/lib/keywords-data')
  const withQuery = KEYWORDS.find((kw: any) => kw.scryfallQuery)
  if (!withQuery) return // skip if data not yet loaded
  renderWithProviders(<GlossaryPage />)
  const links = screen.queryAllByTestId('scryfall-link')
  expect(links.length).toBeGreaterThan(0)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/glossary.test.tsx --testNamePattern="tier badge" --no-coverage 2>&1 | tail -10
```

Expected: FAIL — `tier-badge` not found.

- [ ] **Step 3: Replace `components/KeywordCard.tsx`**

```tsx
'use client'

import Link from 'next/link'
import { KeywordDefinition } from '@/lib/keywords-data'

interface KeywordCardProps {
  keyword: KeywordDefinition
}

const typeBadgeColor: Record<KeywordDefinition['type'], string> = {
  ability: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  action: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
  mechanic: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
}

const tierDot: Record<KeywordDefinition['tier'], { dot: string; label: string }> = {
  evergreen: { dot: 'bg-green-500', label: 'Evergreen' },
  returning: { dot: 'bg-blue-500', label: 'Returning' },
  retired: { dot: 'bg-gray-400', label: 'Retired' },
}

export function KeywordCard({ keyword }: KeywordCardProps) {
  const { dot, label } = tierDot[keyword.tier]

  return (
    <div
      className="bg-white dark:bg-[var(--surface-1)] border border-white/10 rounded-lg p-4 shadow-sm hover:shadow-md transition"
      data-testid="keyword-card"
    >
      {/* Name, type badge, tier dot */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-[var(--ink)]">{keyword.keyword}</h3>
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
            title={label}
            aria-label={`Tier: ${label}`}
            data-testid="tier-badge"
          />
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold uppercase ${typeBadgeColor[keyword.type]}`}
        >
          {keyword.type}
        </span>
      </div>

      {/* Definition */}
      <p className="text-[var(--muted)] mb-2">{keyword.definition}</p>

      {/* Reminder Text */}
      {keyword.reminder && (
        <p className="text-sm text-[var(--muted)] italic mb-2">({keyword.reminder})</p>
      )}

      {/* Example and Introduced */}
      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)] mb-2">
        {keyword.example && (
          <div>
            <span className="font-semibold">Example: </span>
            <span>{keyword.example}</span>
          </div>
        )}
        {keyword.introduced && (
          <div>
            <span className="font-semibold">Introduced: </span>
            <span>{keyword.introduced}</span>
          </div>
        )}
      </div>

      {/* Scryfall link */}
      {keyword.scryfallQuery && (
        <Link
          href={`/toolkit?q=${encodeURIComponent(keyword.scryfallQuery)}`}
          className="text-xs text-[var(--accent-2)] hover:underline"
          data-testid="scryfall-link"
        >
          See cards →
        </Link>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Run all glossary tests**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/glossary.test.tsx --no-coverage 2>&1 | tail -25
```

Expected: all pass.

- [ ] **Step 5: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
cd C:/Users/moats/ManaDork && git add components/KeywordCard.tsx app/__tests__/glossary.test.tsx && git commit -m "feat(glossary): add tier badge (green/blue/gray dot) and Scryfall deeplink to KeywordCard"
```
