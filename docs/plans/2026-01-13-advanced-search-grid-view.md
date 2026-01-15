# Advanced Search with Grid View Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add multi-card grid view with infinite scroll for advanced Scryfall search queries

**Architecture:** Extend existing search to display multiple results in responsive grid. Add view toggle (single/grid), compact card component, infinite scroll pagination, and modal expansion for card details.

**Tech Stack:** React, TypeScript, Next.js 14, Scryfall API, Tailwind CSS, Intersection Observer API

---

## Current State Analysis

**Already Working:**
- ✅ `useCardSearch` hook uses Scryfall's advanced syntax (`searchCards(query)`)
- ✅ `searchCards()` API function supports full syntax (o:draw, c:blue, etc.)
- ✅ Hook stores `results` array with all cards
- ✅ Pagination data available (`has_more`, `next_page`)
- ✅ CardSearchHelp documents syntax examples

**What's Missing:**
- ❌ Only shows first result, ignores rest
- ❌ No grid view for multiple cards
- ❌ No pagination/infinite scroll
- ❌ No compact card component

## Tasks Overview

1. **Add Pagination to useCardSearch Hook** - Support loading more results
2. **Create CompactCard Component** - Smaller card preview for grid
3. **Create CardGrid Component** - Grid layout with infinite scroll
4. **Add View Mode Toggle** - Switch between single and grid view
5. **Update CardSearch Component** - Integrate grid view and toggle
6. **Add Expand Modal** - Full card view from compact card

---

## Task 1: Add Pagination to useCardSearch Hook

**Files:**
- Modify: `hooks/useCardSearch.ts:1-120`
- Test: `hooks/__tests__/useCardSearch.test.ts`

### Step 1: Write failing test for loadMore function

Create `hooks/__tests__/useCardSearch.test.ts` if it doesn't exist:

```typescript
import { renderHook, act, waitFor } from '@testing-library/react'
import { useCardSearch } from '../useCardSearch'

// Mock the scryfall-api
jest.mock('@/lib/scryfall-api')
import * as scryfallApi from '@/lib/scryfall-api'

const mockSearchCards = scryfallApi.searchCards as jest.MockedFunction<typeof scryfallApi.searchCards>
const mockAutocomplete = scryfallApi.autocomplete as jest.MockedFunction<typeof scryfallApi.autocomplete>

describe('useCardSearch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAutocomplete.mockResolvedValue([])
  })

  it('loads more results when loadMore is called', async () => {
    // First page response
    const firstPageCards = [
      { id: '1', name: 'Card 1', type_line: 'Creature' } as any,
      { id: '2', name: 'Card 2', type_line: 'Creature' } as any,
    ]
    const secondPageCards = [
      { id: '3', name: 'Card 3', type_line: 'Creature' } as any,
    ]

    mockSearchCards
      .mockResolvedValueOnce({
        object: 'list',
        total_cards: 3,
        has_more: true,
        next_page: 'https://api.scryfall.com/cards/search?page=2',
        data: firstPageCards,
      })
      .mockResolvedValueOnce({
        object: 'list',
        total_cards: 3,
        has_more: false,
        data: secondPageCards,
      })

    const { result } = renderHook(() => useCardSearch())

    // Search initial query
    act(() => {
      result.current.setQuery('o:draw')
    })
    await act(async () => {
      await result.current.search()
    })

    await waitFor(() => {
      expect(result.current.results).toHaveLength(2)
    })

    // Load more results
    await act(async () => {
      await result.current.loadMore()
    })

    await waitFor(() => {
      expect(result.current.results).toHaveLength(3)
      expect(result.current.hasMore).toBe(false)
    })
  })

  it('does not load more when hasMore is false', async () => {
    mockSearchCards.mockResolvedValue({
      object: 'list',
      total_cards: 1,
      has_more: false,
      data: [{ id: '1', name: 'Card 1' } as any],
    })

    const { result } = renderHook(() => useCardSearch())

    act(() => {
      result.current.setQuery('test')
    })
    await act(async () => {
      await result.current.search()
    })

    const initialCallCount = mockSearchCards.mock.calls.length

    await act(async () => {
      await result.current.loadMore()
    })

    expect(mockSearchCards.mock.calls.length).toBe(initialCallCount)
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- hooks/__tests__/useCardSearch.test.ts`

Expected: FAIL with "result.current.loadMore is not a function" or "result.current.hasMore is undefined"

### Step 3: Add loadMore functionality to hook

Modify `hooks/useCardSearch.ts`:

```typescript
export interface UseCardSearchResult {
  query: string
  results: ScryfallCard[]
  suggestions: string[]
  selectedCard: ScryfallCard | null
  isLoading: boolean
  isLoadingMore: boolean  // NEW
  hasMore: boolean        // NEW
  error: string | null
  setQuery: (query: string) => void
  selectCard: (card: ScryfallCard) => void
  clearSelection: () => void
  search: () => Promise<void>
  loadMore: () => Promise<void>  // NEW
}

export function useCardSearch(): UseCardSearchResult {
  const [query, setQueryState] = useState('')
  const [results, setResults] = useState<ScryfallCard[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedCard, setSelectedCard] = useState<ScryfallCard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)  // NEW
  const [hasMore, setHasMore] = useState(false)              // NEW
  const [nextPage, setNextPage] = useState<string | null>(null)  // NEW
  const [error, setError] = useState<string | null>(null)

  // ... existing autocomplete useEffect ...

  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery)
    setError(null)
  }, [])

  const search = useCallback(async () => {
    if (!query.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await searchCards(query)
      setResults(response.data)
      setHasMore(response.has_more)      // NEW
      setNextPage(response.next_page || null)  // NEW

      // Automatically select the first result
      if (response.data.length > 0) {
        setSelectedCard(response.data[0])
        setSuggestions([])
      } else {
        setSelectedCard(null)
        setError('No cards found matching your search')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Search failed'
      setError(message)
      setResults([])
      setSelectedCard(null)
      setHasMore(false)     // NEW
      setNextPage(null)     // NEW
    } finally {
      setIsLoading(false)
    }
  }, [query])

  const loadMore = useCallback(async () => {  // NEW
    if (!hasMore || !nextPage || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    setError(null)

    try {
      const response = await fetch(nextPage)
      if (!response.ok) {
        throw new Error('Failed to load more results')
      }

      const data = await response.json()

      setResults(prev => [...prev, ...data.data])
      setHasMore(data.has_more)
      setNextPage(data.next_page || null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more'
      setError(message)
    } finally {
      setIsLoadingMore(false)
    }
  }, [hasMore, nextPage, isLoadingMore])

  const selectCard = useCallback((card: ScryfallCard) => {
    setSelectedCard(card)
    setSuggestions([])
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCard(null)
  }, [])

  return {
    query,
    results,
    suggestions,
    selectedCard,
    isLoading,
    isLoadingMore,  // NEW
    hasMore,        // NEW
    error,
    setQuery,
    selectCard,
    clearSelection,
    search,
    loadMore,       // NEW
  }
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- hooks/__tests__/useCardSearch.test.ts`

Expected: PASS - All tests green

### Step 5: Commit

```bash
git add hooks/useCardSearch.ts hooks/__tests__/useCardSearch.test.ts
git commit -m "feat: add pagination support to useCardSearch hook"
```

---

## Task 2: Create CompactCard Component

**Files:**
- Create: `components/CompactCard.tsx`
- Create: `components/__tests__/CompactCard.test.tsx`

### Step 1: Write failing test for CompactCard

Create `components/__tests__/CompactCard.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompactCard } from '../CompactCard'
import { ScryfallCard } from '@/types/scryfall'

const mockCard: ScryfallCard = {
  id: '1',
  name: 'Lightning Bolt',
  type_line: 'Instant',
  mana_cost: '{R}',
  oracle_text: 'Lightning Bolt deals 3 damage to any target.',
  image_uris: {
    small: 'https://example.com/small.jpg',
    normal: 'https://example.com/normal.jpg',
    large: 'https://example.com/large.jpg',
    png: 'https://example.com/card.png',
    art_crop: 'https://example.com/art.jpg',
    border_crop: 'https://example.com/border.jpg',
  },
  set_name: 'Alpha',
  set: 'lea',
  rarity: 'common',
  legalities: {},
  prices: { usd: '1.50' },
} as ScryfallCard

describe('CompactCard', () => {
  it('renders card name and image', () => {
    render(<CompactCard card={mockCard} onClick={() => {}} />)

    expect(screen.getByText('Lightning Bolt')).toBeInTheDocument()
    expect(screen.getByAltText('Lightning Bolt')).toBeInTheDocument()
    expect(screen.getByAltText('Lightning Bolt')).toHaveAttribute('src', mockCard.image_uris?.small)
  })

  it('displays mana cost', () => {
    render(<CompactCard card={mockCard} onClick={() => {}} />)

    expect(screen.getByText('{R}')).toBeInTheDocument()
  })

  it('displays type line', () => {
    render(<CompactCard card={mockCard} onClick={() => {}} />)

    expect(screen.getByText('Instant')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = jest.fn()

    render(<CompactCard card={mockCard} onClick={handleClick} />)

    await user.click(screen.getByTestId('compact-card'))

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(mockCard)
  })

  it('shows placeholder when no image available', () => {
    const cardWithoutImage = { ...mockCard, image_uris: undefined }

    render(<CompactCard card={cardWithoutImage} onClick={() => {}} />)

    expect(screen.getByText('No image')).toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- components/__tests__/CompactCard.test.tsx`

Expected: FAIL with "Cannot find module '../CompactCard'"

### Step 3: Create CompactCard component

Create `components/CompactCard.tsx`:

```typescript
'use client'

import { ScryfallCard } from '@/types/scryfall'

interface CompactCardProps {
  card: ScryfallCard
  onClick: (card: ScryfallCard) => void
}

export function CompactCard({ card, onClick }: CompactCardProps) {
  // Determine if card has multiple faces
  const hasMultipleFaces = card.card_faces && card.card_faces.length > 1
  const firstFace = hasMultipleFaces ? card.card_faces![0] : null

  // Get card properties - prefer first face if available
  const imageUri = firstFace?.image_uris?.small || card.image_uris?.small
  const name = firstFace?.name || card.name
  const manaCost = firstFace?.mana_cost || card.mana_cost
  const typeLine = firstFace?.type_line || card.type_line

  return (
    <button
      type="button"
      onClick={() => onClick(card)}
      className="group relative rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-md hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
      data-testid="compact-card"
    >
      {/* Card Image */}
      <div className="aspect-[5/7] relative overflow-hidden bg-gray-200 dark:bg-gray-700">
        {imageUri ? (
          <img
            src={imageUri}
            alt={name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
            No image
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      </div>

      {/* Card Info */}
      <div className="p-2 space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white text-left line-clamp-2 flex-1">
            {name}
          </h3>
          {manaCost && (
            <span className="text-xs text-gray-600 dark:text-gray-400 font-mono whitespace-nowrap">
              {manaCost}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-600 dark:text-gray-400 text-left line-clamp-1">
          {typeLine}
        </p>
      </div>

      {/* Multi-faced indicator */}
      {hasMultipleFaces && (
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          DFC
        </div>
      )}
    </button>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- components/__tests__/CompactCard.test.tsx`

Expected: PASS - All tests green

### Step 5: Commit

```bash
git add components/CompactCard.tsx components/__tests__/CompactCard.test.tsx
git commit -m "feat: create CompactCard component for grid view"
```

---

## Task 3: Create CardGrid Component

**Files:**
- Create: `components/CardGrid.tsx`
- Create: `components/__tests__/CardGrid.test.tsx`
- Create: `hooks/useInfiniteScroll.ts`
- Create: `hooks/__tests__/useInfiniteScroll.test.ts`

### Step 1: Write failing test for useInfiniteScroll hook

Create `hooks/__tests__/useInfiniteScroll.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react'
import { useInfiniteScroll } from '../useInfiniteScroll'

describe('useInfiniteScroll', () => {
  let mockIntersectionObserver: jest.Mock

  beforeEach(() => {
    mockIntersectionObserver = jest.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    })
    window.IntersectionObserver = mockIntersectionObserver as any
  })

  it('creates IntersectionObserver with correct options', () => {
    const onLoadMore = jest.fn()
    renderHook(() => useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false }))

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      { threshold: 1.0 }
    )
  })

  it('calls onLoadMore when sentinel is visible and hasMore is true', () => {
    const onLoadMore = jest.fn()
    let observerCallback: IntersectionObserverCallback = () => {}

    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }
    })

    const { result } = renderHook(() =>
      useInfiniteScroll({ onLoadMore, hasMore: true, isLoading: false })
    )

    // Simulate ref attachment
    const mockElement = document.createElement('div')
    act(() => {
      result.current(mockElement)
    })

    // Trigger intersection
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('does not call onLoadMore when hasMore is false', () => {
    const onLoadMore = jest.fn()
    let observerCallback: IntersectionObserverCallback = () => {}

    mockIntersectionObserver.mockImplementation((callback) => {
      observerCallback = callback
      return {
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      }
    })

    renderHook(() => useInfiniteScroll({ onLoadMore, hasMore: false, isLoading: false }))

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(onLoadMore).not.toHaveBeenCalled()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- hooks/__tests__/useInfiniteScroll.test.ts`

Expected: FAIL with "Cannot find module '../useInfiniteScroll'"

### Step 3: Create useInfiniteScroll hook

Create `hooks/useInfiniteScroll.ts`:

```typescript
import { useEffect, useRef, useCallback } from 'react'

interface UseInfiniteScrollOptions {
  onLoadMore: () => void
  hasMore: boolean
  isLoading: boolean
}

/**
 * Hook for infinite scroll functionality using Intersection Observer
 * Returns a ref callback to attach to the sentinel element
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null)

  const sentinelRef = useCallback(
    (node: HTMLElement | null) => {
      // Disconnect previous observer
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      // Don't observe if we can't load more
      if (!hasMore || isLoading) {
        return
      }

      // Create new observer
      if (node) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting && hasMore && !isLoading) {
              onLoadMore()
            }
          },
          { threshold: 1.0 }
        )

        observerRef.current.observe(node)
      }
    },
    [hasMore, isLoading, onLoadMore]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return sentinelRef
}
```

### Step 4: Run test to verify hook passes

Run: `npm test -- hooks/__tests__/useInfiniteScroll.test.ts`

Expected: PASS - Hook tests green

### Step 5: Write failing test for CardGrid component

Create `components/__tests__/CardGrid.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardGrid } from '../CardGrid'
import { ScryfallCard } from '@/types/scryfall'

const mockCards: ScryfallCard[] = [
  {
    id: '1',
    name: 'Card 1',
    type_line: 'Creature',
    image_uris: { small: 'img1.jpg' } as any,
  } as ScryfallCard,
  {
    id: '2',
    name: 'Card 2',
    type_line: 'Instant',
    image_uris: { small: 'img2.jpg' } as any,
  } as ScryfallCard,
]

describe('CardGrid', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }))
  })

  it('renders all cards in grid', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
      />
    )

    expect(screen.getByText('Card 1')).toBeInTheDocument()
    expect(screen.getByText('Card 2')).toBeInTheDocument()
  })

  it('calls onCardClick when card is clicked', async () => {
    const user = userEvent.setup()
    const handleCardClick = jest.fn()

    render(
      <CardGrid
        cards={mockCards}
        onCardClick={handleCardClick}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
      />
    )

    await user.click(screen.getByText('Card 1'))

    expect(handleCardClick).toHaveBeenCalledWith(mockCards[0])
  })

  it('shows loading spinner when isLoadingMore is true', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={true}
        isLoadingMore={true}
      />
    )

    expect(screen.getByText(/loading more/i)).toBeInTheDocument()
  })

  it('shows sentinel element when hasMore is true', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={true}
        isLoadingMore={false}
      />
    )

    expect(screen.getByTestId('infinite-scroll-sentinel')).toBeInTheDocument()
  })

  it('does not show sentinel when hasMore is false', () => {
    render(
      <CardGrid
        cards={mockCards}
        onCardClick={() => {}}
        onLoadMore={() => {}}
        hasMore={false}
        isLoadingMore={false}
      />
    )

    expect(screen.queryByTestId('infinite-scroll-sentinel')).not.toBeInTheDocument()
  })
})
```

### Step 6: Run test to verify it fails

Run: `npm test -- components/__tests__/CardGrid.test.tsx`

Expected: FAIL with "Cannot find module '../CardGrid'"

### Step 7: Create CardGrid component

Create `components/CardGrid.tsx`:

```typescript
'use client'

import { ScryfallCard } from '@/types/scryfall'
import { CompactCard } from './CompactCard'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'

interface CardGridProps {
  cards: ScryfallCard[]
  onCardClick: (card: ScryfallCard) => void
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
}

export function CardGrid({ cards, onCardClick, onLoadMore, hasMore, isLoadingMore }: CardGridProps) {
  const sentinelRef = useInfiniteScroll({
    onLoadMore,
    hasMore,
    isLoading: isLoadingMore,
  })

  if (cards.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No cards found
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Grid of cards */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
        data-testid="card-grid"
      >
        {cards.map((card) => (
          <CompactCard key={card.id} card={card} onClick={onCardClick} />
        ))}
      </div>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-purple-600" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Loading more cards...</p>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && !isLoadingMore && (
        <div
          ref={sentinelRef}
          data-testid="infinite-scroll-sentinel"
          className="h-4"
        />
      )}

      {/* End of results */}
      {!hasMore && cards.length > 0 && (
        <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
          End of results ({cards.length} cards)
        </div>
      )}
    </div>
  )
}
```

### Step 8: Run test to verify it passes

Run: `npm test -- components/__tests__/CardGrid.test.tsx`

Expected: PASS - All tests green

### Step 9: Commit

```bash
git add hooks/useInfiniteScroll.ts hooks/__tests__/useInfiniteScroll.test.ts
git add components/CardGrid.tsx components/__tests__/CardGrid.test.tsx
git commit -m "feat: create CardGrid component with infinite scroll"
```

---

## Task 4: Add View Mode Toggle

**Files:**
- Create: `components/ViewModeToggle.tsx`
- Create: `components/__tests__/ViewModeToggle.test.tsx`

### Step 1: Write failing test for ViewModeToggle

Create `components/__tests__/ViewModeToggle.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ViewModeToggle } from '../ViewModeToggle'

describe('ViewModeToggle', () => {
  it('renders both view mode buttons', () => {
    render(<ViewModeToggle mode="single" onModeChange={() => {}} />)

    expect(screen.getByRole('button', { name: /single card/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /grid view/i })).toBeInTheDocument()
  })

  it('highlights active mode', () => {
    const { rerender } = render(<ViewModeToggle mode="single" onModeChange={() => {}} />)

    const singleButton = screen.getByRole('button', { name: /single card/i })
    const gridButton = screen.getByRole('button', { name: /grid view/i })

    // Single mode active
    expect(singleButton).toHaveClass('bg-purple-600')
    expect(gridButton).not.toHaveClass('bg-purple-600')

    // Switch to grid mode
    rerender(<ViewModeToggle mode="grid" onModeChange={() => {}} />)

    expect(singleButton).not.toHaveClass('bg-purple-600')
    expect(gridButton).toHaveClass('bg-purple-600')
  })

  it('calls onModeChange when button clicked', async () => {
    const user = userEvent.setup()
    const handleModeChange = jest.fn()

    render(<ViewModeToggle mode="single" onModeChange={handleModeChange} />)

    await user.click(screen.getByRole('button', { name: /grid view/i }))

    expect(handleModeChange).toHaveBeenCalledWith('grid')
  })

  it('does not call onModeChange when clicking active button', async () => {
    const user = userEvent.setup()
    const handleModeChange = jest.fn()

    render(<ViewModeToggle mode="single" onModeChange={handleModeChange} />)

    await user.click(screen.getByRole('button', { name: /single card/i }))

    expect(handleModeChange).not.toHaveBeenCalled()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- components/__tests__/ViewModeToggle.test.tsx`

Expected: FAIL with "Cannot find module '../ViewModeToggle'"

### Step 3: Create ViewModeToggle component

Create `components/ViewModeToggle.tsx`:

```typescript
'use client'

type ViewMode = 'single' | 'grid'

interface ViewModeToggleProps {
  mode: ViewMode
  onModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onModeChange }: ViewModeToggleProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1"
      role="group"
      aria-label="View mode"
    >
      <button
        type="button"
        onClick={() => mode !== 'single' && onModeChange('single')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'single'
            ? 'bg-purple-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Single card view"
        aria-pressed={mode === 'single'}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="4" y="4" width="16" height="16" strokeWidth="2" rx="2" />
          </svg>
          Single
        </span>
      </button>

      <button
        type="button"
        onClick={() => mode !== 'grid' && onModeChange('grid')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === 'grid'
            ? 'bg-purple-600 text-white'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Grid view"
        aria-pressed={mode === 'grid'}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1" />
            <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1" />
            <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1" />
            <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1" />
          </svg>
          Grid
        </span>
      </button>
    </div>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- components/__tests__/ViewModeToggle.test.tsx`

Expected: PASS - All tests green

### Step 5: Commit

```bash
git add components/ViewModeToggle.tsx components/__tests__/ViewModeToggle.test.tsx
git commit -m "feat: create ViewModeToggle component"
```

---

## Task 5: Update CardSearch Component

**Files:**
- Modify: `components/CardSearch.tsx:1-44`
- Modify: `components/__tests__/CardSearch.test.tsx` (if exists, otherwise create)

### Step 1: Write failing test for view mode toggle in CardSearch

Create or update `components/__tests__/CardSearch.test.tsx`:

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardSearch } from '../CardSearch'

// Mock child components
jest.mock('../CardSearchInput', () => ({
  CardSearchInput: ({ value, onChange, onSearch }: any) => (
    <div>
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button data-testid="search-button" onClick={onSearch}>
        Search
      </button>
    </div>
  ),
}))

jest.mock('../CardSearchHelp', () => ({
  CardSearchHelp: () => <div>Search Help</div>,
}))

jest.mock('../CardDisplay', () => ({
  CardDisplay: ({ card }: any) => <div data-testid="card-display">{card.name}</div>,
}))

jest.mock('../CardGrid', () => ({
  CardGrid: ({ cards }: any) => (
    <div data-testid="card-grid">
      {cards.map((card: any) => (
        <div key={card.id}>{card.name}</div>
      ))}
    </div>
  ),
}))

jest.mock('../ViewModeToggle', () => ({
  ViewModeToggle: ({ mode, onModeChange }: any) => (
    <div>
      <button onClick={() => onModeChange('single')}>Single</button>
      <button onClick={() => onModeChange('grid')}>Grid</button>
      <span data-testid="current-mode">{mode}</span>
    </div>
  ),
}))

jest.mock('../ErrorBanner', () => ({
  ErrorBanner: ({ message }: any) => <div data-testid="error-banner">{message}</div>,
}))

// Mock hook
jest.mock('@/hooks/useCardSearch')
import { useCardSearch } from '@/hooks/useCardSearch'

const mockUseCardSearch = useCardSearch as jest.MockedFunction<typeof useCardSearch>

describe('CardSearch', () => {
  const defaultHookReturn = {
    query: '',
    results: [],
    suggestions: [],
    selectedCard: null,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    error: null,
    setQuery: jest.fn(),
    selectCard: jest.fn(),
    clearSelection: jest.fn(),
    search: jest.fn(),
    loadMore: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCardSearch.mockReturnValue(defaultHookReturn)
  })

  it('shows view mode toggle when multiple results exist', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ],
    })

    render(<CardSearch />)

    expect(screen.getByText('Single')).toBeInTheDocument()
    expect(screen.getByText('Grid')).toBeInTheDocument()
  })

  it('does not show toggle when only one result', () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [{ id: '1', name: 'Card 1' } as any],
    })

    render(<CardSearch />)

    expect(screen.queryByText('Grid')).not.toBeInTheDocument()
  })

  it('shows grid view when grid mode selected', async () => {
    const user = userEvent.setup()

    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [
        { id: '1', name: 'Card 1' } as any,
        { id: '2', name: 'Card 2' } as any,
      ],
    })

    render(<CardSearch />)

    // Click grid button
    await user.click(screen.getByText('Grid'))

    await waitFor(() => {
      expect(screen.getByTestId('card-grid')).toBeInTheDocument()
    })
  })

  it('shows single card view in single mode', async () => {
    mockUseCardSearch.mockReturnValue({
      ...defaultHookReturn,
      results: [{ id: '1', name: 'Card 1' } as any],
      selectedCard: { id: '1', name: 'Card 1' } as any,
    })

    render(<CardSearch />)

    expect(screen.getByTestId('card-display')).toBeInTheDocument()
    expect(screen.queryByTestId('card-grid')).not.toBeInTheDocument()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- components/__tests__/CardSearch.test.tsx`

Expected: FAIL with test assertions failing (no toggle shown, no grid view, etc.)

### Step 3: Update CardSearch component

Modify `components/CardSearch.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useCardSearch } from '@/hooks/useCardSearch'
import { CardSearchInput } from './CardSearchInput'
import { CardSearchHelp } from './CardSearchHelp'
import { ErrorBanner } from './ErrorBanner'
import { CardDisplay } from './CardDisplay'
import { CardGrid } from './CardGrid'
import { ViewModeToggle } from './ViewModeToggle'

type ViewMode = 'single' | 'grid'

export function CardSearch() {
  const {
    query,
    results,
    suggestions,
    selectedCard,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    setQuery,
    selectCard,
    search,
    loadMore,
  } = useCardSearch()

  const [viewMode, setViewMode] = useState<ViewMode>('single')

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
  }

  const handleCardClick = (card: typeof selectedCard) => {
    selectCard(card!)
    setViewMode('single') // Switch to single view when card selected
  }

  const showToggle = results.length > 1
  const showGrid = viewMode === 'grid' && results.length > 1
  const showSingleCard = selectedCard && (viewMode === 'single' || results.length === 1)

  return (
    <div className="space-y-4" data-testid="card-search">
      <CardSearchInput
        value={query}
        onChange={setQuery}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onSearch={search}
        isLoading={isLoading}
      />

      <CardSearchHelp />

      {/* View Mode Toggle */}
      {showToggle && (
        <div className="flex justify-center">
          <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {/* Grid View */}
      {showGrid && (
        <CardGrid
          cards={results}
          onCardClick={handleCardClick}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      )}

      {/* Single Card View */}
      {showSingleCard && <CardDisplay card={selectedCard} />}
    </div>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- components/__tests__/CardSearch.test.tsx`

Expected: PASS - All tests green

### Step 5: Run all tests to verify nothing broke

Run: `npm test`

Expected: All tests pass (300+ tests)

### Step 6: Commit

```bash
git add components/CardSearch.tsx components/__tests__/CardSearch.test.tsx
git commit -m "feat: integrate grid view and toggle into CardSearch"
```

---

## Task 6: Add Expand Modal

**Files:**
- Create: `components/CardModal.tsx`
- Create: `components/__tests__/CardModal.test.tsx`
- Modify: `components/CardSearch.tsx` (integrate modal)

### Step 1: Write failing test for CardModal

Create `components/__tests__/CardModal.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CardModal } from '../CardModal'
import { ScryfallCard } from '@/types/scryfall'

const mockCard: ScryfallCard = {
  id: '1',
  name: 'Lightning Bolt',
  type_line: 'Instant',
} as ScryfallCard

describe('CardModal', () => {
  it('renders modal when open', () => {
    render(<CardModal card={mockCard} isOpen={true} onClose={() => {}} />)

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Lightning Bolt')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<CardModal card={mockCard} isOpen={false} onClose={() => {}} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<CardModal card={mockCard} isOpen={true} onClose={handleClose} />)

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when backdrop clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<CardModal card={mockCard} isOpen={true} onClose={handleClose} />)

    await user.click(screen.getByTestId('modal-backdrop'))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when card content clicked', async () => {
    const user = userEvent.setup()
    const handleClose = jest.fn()

    render(<CardModal card={mockCard} isOpen={true} onClose={handleClose} />)

    await user.click(screen.getByTestId('modal-content'))

    expect(handleClose).not.toHaveBeenCalled()
  })
})
```

### Step 2: Run test to verify it fails

Run: `npm test -- components/__tests__/CardModal.test.tsx`

Expected: FAIL with "Cannot find module '../CardModal'"

### Step 3: Create CardModal component

Create `components/CardModal.tsx`:

```typescript
'use client'

import { useEffect } from 'react'
import { ScryfallCard } from '@/types/scryfall'
import { CardDisplay } from './CardDisplay'

interface CardModalProps {
  card: ScryfallCard
  isOpen: boolean
  onClose: () => void
}

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      data-testid="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-transparent"
        data-testid="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-black/70 hover:bg-black/80 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          aria-label="Close modal"
        >
          Close
        </button>

        {/* Card display */}
        <div id="modal-title">
          <CardDisplay card={card} />
        </div>
      </div>
    </div>
  )
}
```

### Step 4: Run test to verify it passes

Run: `npm test -- components/__tests__/CardModal.test.tsx`

Expected: PASS - All tests green

### Step 5: Update CardSearch to use modal

Modify `components/CardSearch.tsx`:

```typescript
'use client'

import { useState } from 'react'
import { useCardSearch } from '@/hooks/useCardSearch'
import { CardSearchInput } from './CardSearchInput'
import { CardSearchHelp } from './CardSearchHelp'
import { ErrorBanner } from './ErrorBanner'
import { CardDisplay } from './CardDisplay'
import { CardGrid } from './CardGrid'
import { ViewModeToggle } from './ViewModeToggle'
import { CardModal } from './CardModal'  // NEW
import { ScryfallCard } from '@/types/scryfall'  // NEW

type ViewMode = 'single' | 'grid'

export function CardSearch() {
  const {
    query,
    results,
    suggestions,
    selectedCard,
    isLoading,
    isLoadingMore,
    hasMore,
    error,
    setQuery,
    selectCard,
    search,
    loadMore,
  } = useCardSearch()

  const [viewMode, setViewMode] = useState<ViewMode>('single')
  const [modalCard, setModalCard] = useState<ScryfallCard | null>(null)  // NEW

  const handleSelectSuggestion = (suggestion: string) => {
    setQuery(suggestion)
  }

  const handleCardClick = (card: ScryfallCard) => {  // MODIFIED
    if (viewMode === 'grid') {
      // In grid view, open modal
      setModalCard(card)
    } else {
      // In single view, select card normally
      selectCard(card)
    }
  }

  const handleCloseModal = () => {  // NEW
    setModalCard(null)
  }

  const showToggle = results.length > 1
  const showGrid = viewMode === 'grid' && results.length > 1
  const showSingleCard = selectedCard && (viewMode === 'single' || results.length === 1)

  return (
    <div className="space-y-4" data-testid="card-search">
      <CardSearchInput
        value={query}
        onChange={setQuery}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
        onSearch={search}
        isLoading={isLoading}
      />

      <CardSearchHelp />

      {/* View Mode Toggle */}
      {showToggle && (
        <div className="flex justify-center">
          <ViewModeToggle mode={viewMode} onModeChange={setViewMode} />
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {/* Grid View */}
      {showGrid && (
        <CardGrid
          cards={results}
          onCardClick={handleCardClick}
          onLoadMore={loadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
        />
      )}

      {/* Single Card View */}
      {showSingleCard && <CardDisplay card={selectedCard} />}

      {/* Card Modal */}
      {modalCard && (
        <CardModal
          card={modalCard}
          isOpen={!!modalCard}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
```

### Step 6: Run tests to verify everything works

Run: `npm test`

Expected: All tests pass

### Step 7: Commit

```bash
git add components/CardModal.tsx components/__tests__/CardModal.test.tsx components/CardSearch.tsx
git commit -m "feat: add modal for expanded card view in grid"
```

---

## Final Verification

### Manual Testing Checklist

1. **Advanced Search:**
   - [ ] Search `o:draw` returns multiple cards
   - [ ] Search `c:blue t:creature` returns blue creatures
   - [ ] Search `legal:commander cmc<=3` returns filtered results
   - [ ] Combined queries work correctly

2. **Grid View:**
   - [ ] Toggle appears when 2+ results
   - [ ] Grid shows 2-5 columns based on screen size
   - [ ] Cards have hover effect
   - [ ] Clicking card opens modal

3. **Infinite Scroll:**
   - [ ] Scrolling to bottom loads more cards
   - [ ] Loading spinner appears while loading
   - [ ] "End of results" message when no more
   - [ ] Handles errors gracefully

4. **Single View:**
   - [ ] Toggle switches to single card view
   - [ ] First result automatically selected
   - [ ] Full card details visible

5. **Modal:**
   - [ ] Opens when clicking grid card
   - [ ] Shows full CardDisplay
   - [ ] Closes on backdrop click
   - [ ] Closes on ESC key
   - [ ] Closes on Close button

6. **Responsive:**
   - [ ] Mobile: 2 columns
   - [ ] Tablet: 3-4 columns
   - [ ] Desktop: 4-5 columns
   - [ ] Modal works on all sizes

7. **Dark Mode:**
   - [ ] All components support dark mode
   - [ ] Toggle visible in dark mode
   - [ ] Modal backdrop works in dark mode

### Run Final Tests

```bash
npm test
npm run build
```

Expected: All tests pass, no build errors

### Commit and Push

```bash
git add .
git commit -m "feat: complete advanced search with grid view and infinite scroll"
git push origin HEAD
```

---

## Architecture Summary

**New Components:**
- `CompactCard` - Small card preview for grid
- `CardGrid` - Grid layout with infinite scroll
- `ViewModeToggle` - Switch between single/grid
- `CardModal` - Fullscreen card view

**New Hooks:**
- `useInfiniteScroll` - Intersection Observer for pagination

**Modified Components:**
- `CardSearch` - Integrated grid view and modal
- `useCardSearch` - Added pagination support

**Data Flow:**
```
User searches "o:draw"
  → useCardSearch.search()
  → Scryfall API returns 175 results (first page)
  → results state = [cards 1-175]
  → hasMore = true, next_page = URL

User toggles to grid view
  → viewMode = 'grid'
  → CardGrid renders all 175 cards

User scrolls to bottom
  → Intersection Observer triggers
  → useCardSearch.loadMore()
  → Fetch next_page URL
  → Append new cards to results
  → hasMore = updated, next_page = new URL

User clicks card in grid
  → Opens CardModal
  → Shows full CardDisplay
```

**Performance:**
- Lazy loading images in grid
- Intersection Observer (native, no library)
- localStorage caching from existing scryfall-api
- Rate limiting (75ms) from existing scryfall-api

**Accessibility:**
- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels on buttons
- Focus management in modal
- Screen reader friendly

## Dependencies

No new dependencies needed - uses existing:
- React (hooks, state)
- TypeScript
- Tailwind CSS
- Intersection Observer API (native)
