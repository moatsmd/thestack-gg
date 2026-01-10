# Life Tracker Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a mobile-first MTG life tracker with solo and multiplayer modes, localStorage persistence, and responsive design.

**Architecture:** Next.js app with TypeScript, React hooks for state management, localStorage for persistence. Solo tracking as primary UX, multiplayer as secondary. TDD approach with component testing.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, React Testing Library, Jest

---

## Task 1: Project Setup & Configuration

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.js`
- Create: `tailwind.config.ts`
- Create: `.gitignore`

**Step 1: Initialize Next.js with TypeScript**

Run: `npx create-next-app@latest . --typescript --tailwind --app --no-src --import-alias "@/*"`

When prompted:
- Would you like to use TypeScript? Yes
- Would you like to use ESLint? Yes
- Would you like to use Tailwind CSS? Yes
- Would you like to use `src/` directory? No
- Would you like to use App Router? Yes
- Would you like to customize the default import alias? No

Expected: Next.js project initialized with TypeScript and Tailwind

**Step 2: Install testing dependencies**

Run: `npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom`

Expected: Testing libraries installed

**Step 3: Create Jest configuration**

Create: `jest.config.js`

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

module.exports = createJestConfig(customJestConfig)
```

**Step 4: Create Jest setup file**

Create: `jest.setup.js`

```javascript
import '@testing-library/jest-dom'
```

**Step 5: Add test script to package.json**

Modify: `package.json`

Add to scripts section:
```json
"test": "jest",
"test:watch": "jest --watch"
```

**Step 6: Update Tailwind config for mobile-first**

Modify: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Ensure good tap targets for mobile
      minHeight: {
        'tap': '48px',
      },
      minWidth: {
        'tap': '48px',
      },
    },
  },
  plugins: [],
};
export default config;
```

**Step 7: Commit initial setup**

```bash
git add .
git commit -m "feat: initialize Next.js project with TypeScript and testing

- Next.js 14 with App Router
- TypeScript configuration
- Tailwind CSS with mobile-first extensions
- Jest and React Testing Library setup

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 2: Type Definitions

**Files:**
- Create: `types/game.ts`
- Create: `types/__tests__/game.test.ts`

**Step 1: Write test for type definitions**

Create: `types/__tests__/game.test.ts`

```typescript
import { GameState, Player, LifeChange } from '../game'

describe('Game Types', () => {
  it('should create valid GameState for solo mode', () => {
    const state: GameState = {
      mode: 'solo',
      gameType: 'standard',
      startingLife: 20,
      players: [],
      createdAt: new Date(),
    }

    expect(state.mode).toBe('solo')
    expect(state.startingLife).toBe(20)
  })

  it('should create valid Player', () => {
    const player: Player = {
      id: '1',
      name: 'Test Player',
      currentLife: 20,
      lifeHistory: [],
    }

    expect(player.id).toBe('1')
    expect(player.currentLife).toBe(20)
  })

  it('should create valid LifeChange', () => {
    const change: LifeChange = {
      amount: -3,
      timestamp: new Date(),
    }

    expect(change.amount).toBe(-3)
    expect(change.timestamp).toBeInstanceOf(Date)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test types/__tests__/game.test.ts`

Expected: FAIL with "Cannot find module '../game'"

**Step 3: Create type definitions**

Create: `types/game.ts`

```typescript
export type GameMode = 'solo' | 'multiplayer'
export type GameType = 'standard' | 'commander' | 'custom'

export interface LifeChange {
  amount: number
  timestamp: Date
}

export interface Player {
  id: string
  name: string
  currentLife: number
  lifeHistory: LifeChange[]
}

export interface GameState {
  mode: GameMode
  gameType: GameType
  startingLife: number
  players: Player[]
  createdAt: Date
}
```

**Step 4: Run test to verify it passes**

Run: `npm test types/__tests__/game.test.ts`

Expected: PASS (all 3 tests pass)

**Step 5: Commit**

```bash
git add types/
git commit -m "feat: add TypeScript type definitions for game state

- GameState, Player, LifeChange interfaces
- GameMode and GameType union types
- Tests validating type structure

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 3: localStorage Hook

**Files:**
- Create: `hooks/useLocalStorage.ts`
- Create: `hooks/__tests__/useLocalStorage.test.tsx`

**Step 1: Write failing test for useLocalStorage hook**

Create: `hooks/__tests__/useLocalStorage.test.tsx`

```typescript
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '../useLocalStorage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should return initial value when no stored value exists', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('initial')
  })

  it('should store and retrieve value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('new value')
    })

    expect(result.current[0]).toBe('new value')
    expect(localStorage.getItem('test-key')).toBe(JSON.stringify('new value'))
  })

  it('should load existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored value'))

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    expect(result.current[0]).toBe('stored value')
  })

  it('should handle localStorage not available gracefully', () => {
    const mockGetItem = jest.spyOn(Storage.prototype, 'getItem')
    mockGetItem.mockImplementation(() => {
      throw new Error('localStorage not available')
    })

    const { result } = renderHook(() => useLocalStorage('test-key', 'fallback'))

    expect(result.current[0]).toBe('fallback')

    mockGetItem.mockRestore()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test hooks/__tests__/useLocalStorage.test.tsx`

Expected: FAIL with "Cannot find module '../useLocalStorage'"

**Step 3: Implement useLocalStorage hook**

Create: `hooks/useLocalStorage.ts`

```typescript
import { useState, useEffect } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      setStoredValue(value)

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
```

**Step 4: Run test to verify it passes**

Run: `npm test hooks/__tests__/useLocalStorage.test.tsx`

Expected: PASS (all 4 tests pass)

**Step 5: Commit**

```bash
git add hooks/
git commit -m "feat: add useLocalStorage hook with error handling

- Custom hook for localStorage persistence
- Handles localStorage unavailable gracefully
- SSR-safe (checks for window)
- Comprehensive tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 4: Game Setup Component

**Files:**
- Create: `components/GameSetup.tsx`
- Create: `components/__tests__/GameSetup.test.tsx`

**Step 1: Write failing test for GameSetup**

Create: `components/__tests__/GameSetup.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameSetup } from '../GameSetup'
import { GameState } from '@/types/game'

describe('GameSetup', () => {
  const mockOnStart = jest.fn()

  beforeEach(() => {
    mockOnStart.mockClear()
  })

  it('should render solo and multiplayer options', () => {
    render(<GameSetup onStartGame={mockOnStart} />)

    expect(screen.getByText(/Track My Life/i)).toBeInTheDocument()
    expect(screen.getByText(/Track Game/i)).toBeInTheDocument()
  })

  it('should show game mode selection when solo is clicked', async () => {
    const user = userEvent.setup()
    render(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track My Life/i))

    expect(screen.getByText(/Standard/i)).toBeInTheDocument()
    expect(screen.getByText(/Commander/i)).toBeInTheDocument()
    expect(screen.getByText(/Custom/i)).toBeInTheDocument()
  })

  it('should start solo standard game with 20 life', async () => {
    const user = userEvent.setup()
    render(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Standard/i))

    expect(mockOnStart).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'solo',
        gameType: 'standard',
        startingLife: 20,
        players: expect.arrayContaining([
          expect.objectContaining({
            currentLife: 20,
          })
        ])
      })
    )
  })

  it('should start solo commander game with 40 life', async () => {
    const user = userEvent.setup()
    render(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Commander/i))

    expect(mockOnStart).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'solo',
        gameType: 'commander',
        startingLife: 40,
      })
    )
  })

  it('should show player count selection for multiplayer', async () => {
    const user = userEvent.setup()
    render(<GameSetup onStartGame={mockOnStart} />)

    await user.click(screen.getByText(/Track Game/i))

    expect(screen.getByText(/2 Players/i)).toBeInTheDocument()
    expect(screen.getByText(/3 Players/i)).toBeInTheDocument()
    expect(screen.getByText(/4 Players/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test components/__tests__/GameSetup.test.tsx`

Expected: FAIL with "Cannot find module '../GameSetup'"

**Step 3: Implement GameSetup component**

Create: `components/GameSetup.tsx`

```typescript
'use client'

import { useState } from 'react'
import { GameState, GameType } from '@/types/game'

interface GameSetupProps {
  onStartGame: (gameState: GameState) => void
}

export function GameSetup({ onStartGame }: GameSetupProps) {
  const [setupStep, setSetupStep] = useState<'mode' | 'solo-type' | 'multi-players' | 'multi-type'>('mode')
  const [playerCount, setPlayerCount] = useState(2)

  const createGameState = (mode: 'solo' | 'multiplayer', gameType: GameType, playerCount: number): GameState => {
    const startingLife = gameType === 'standard' ? 20 : gameType === 'commander' ? 40 : 20

    const players = Array.from({ length: playerCount }, (_, i) => ({
      id: `player-${i + 1}`,
      name: mode === 'solo' ? 'You' : `Player ${i + 1}`,
      currentLife: startingLife,
      lifeHistory: [],
    }))

    return {
      mode,
      gameType,
      startingLife,
      players,
      createdAt: new Date(),
    }
  }

  const handleSoloMode = (gameType: GameType) => {
    const gameState = createGameState('solo', gameType, 1)
    onStartGame(gameState)
  }

  const handleMultiplayerStart = (gameType: GameType) => {
    const gameState = createGameState('multiplayer', gameType, playerCount)
    onStartGame(gameState)
  }

  if (setupStep === 'mode') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h1 className="text-4xl font-bold mb-8">ManaDork</h1>

        <button
          onClick={() => setSetupStep('solo-type')}
          className="w-full max-w-md bg-blue-600 text-white text-2xl font-bold py-8 px-6 rounded-lg hover:bg-blue-700 transition min-h-tap"
        >
          Track My Life
        </button>

        <button
          onClick={() => setSetupStep('multi-players')}
          className="w-full max-w-md bg-gray-600 text-white text-xl font-semibold py-6 px-6 rounded-lg hover:bg-gray-700 transition min-h-tap"
        >
          Track Game (2-4 players)
        </button>
      </div>
    )
  }

  if (setupStep === 'solo-type') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold mb-4">Select Game Mode</h2>

        <button
          onClick={() => handleSoloMode('standard')}
          className="w-full max-w-md bg-green-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-green-700 transition min-h-tap"
        >
          Standard (20 life)
        </button>

        <button
          onClick={() => handleSoloMode('commander')}
          className="w-full max-w-md bg-purple-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-purple-700 transition min-h-tap"
        >
          Commander (40 life)
        </button>

        <button
          onClick={() => setSetupStep('mode')}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
      </div>
    )
  }

  if (setupStep === 'multi-players') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold mb-4">How Many Players?</h2>

        {[2, 3, 4].map((count) => (
          <button
            key={count}
            onClick={() => {
              setPlayerCount(count)
              setSetupStep('multi-type')
            }}
            className="w-full max-w-md bg-blue-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-blue-700 transition min-h-tap"
          >
            {count} Players
          </button>
        ))}

        <button
          onClick={() => setSetupStep('mode')}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
      </div>
    )
  }

  if (setupStep === 'multi-type') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
        <h2 className="text-2xl font-bold mb-4">Select Game Mode</h2>

        <button
          onClick={() => handleMultiplayerStart('standard')}
          className="w-full max-w-md bg-green-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-green-700 transition min-h-tap"
        >
          Standard (20 life)
        </button>

        <button
          onClick={() => handleMultiplayerStart('commander')}
          className="w-full max-w-md bg-purple-600 text-white text-xl font-bold py-6 px-6 rounded-lg hover:bg-purple-700 transition min-h-tap"
        >
          Commander (40 life)
        </button>

        <button
          onClick={() => setSetupStep('multi-players')}
          className="mt-4 text-gray-600 hover:text-gray-800"
        >
          Back
        </button>
      </div>
    )
  }

  return null
}
```

**Step 4: Run test to verify it passes**

Run: `npm test components/__tests__/GameSetup.test.tsx`

Expected: PASS (all 6 tests pass)

**Step 5: Commit**

```bash
git add components/
git commit -m "feat: add GameSetup component with solo/multiplayer flows

- Mode selection (solo vs multiplayer)
- Game type selection (Standard/Commander)
- Player count for multiplayer
- Mobile-friendly large touch targets
- Comprehensive tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 5: Player Counter Component (Solo)

**Files:**
- Create: `components/PlayerCounter.tsx`
- Create: `components/__tests__/PlayerCounter.test.tsx`

**Step 1: Write failing test for PlayerCounter**

Create: `components/__tests__/PlayerCounter.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlayerCounter } from '../PlayerCounter'

describe('PlayerCounter', () => {
  const mockOnLifeChange = jest.fn()

  const defaultProps = {
    playerId: 'player-1',
    playerName: 'Test Player',
    currentLife: 20,
    isSolo: true,
    onLifeChange: mockOnLifeChange,
  }

  beforeEach(() => {
    mockOnLifeChange.mockClear()
  })

  it('should display current life total', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should call onLifeChange with +1 when plus button clicked', async () => {
    const user = userEvent.setup()
    render(<PlayerCounter {...defaultProps} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    expect(mockOnLifeChange).toHaveBeenCalledWith('player-1', 1)
  })

  it('should call onLifeChange with -1 when minus button clicked', async () => {
    const user = userEvent.setup()
    render(<PlayerCounter {...defaultProps} />)

    const minusButton = screen.getByRole('button', { name: /-/i })
    await user.click(minusButton)

    expect(mockOnLifeChange).toHaveBeenCalledWith('player-1', -1)
  })

  it('should render in solo mode with large font', () => {
    const { container } = render(<PlayerCounter {...defaultProps} isSolo={true} />)

    const lifeDisplay = screen.getByText('20')
    expect(lifeDisplay).toHaveClass('text-9xl')
  })

  it('should render in multiplayer mode with smaller font', () => {
    const { container } = render(<PlayerCounter {...defaultProps} isSolo={false} />)

    const lifeDisplay = screen.getByText('20')
    expect(lifeDisplay).toHaveClass('text-6xl')
  })

  it('should display player name', () => {
    render(<PlayerCounter {...defaultProps} />)

    expect(screen.getByText('Test Player')).toBeInTheDocument()
  })

  it('should handle negative life values', () => {
    render(<PlayerCounter {...defaultProps} currentLife={-5} />)

    expect(screen.getByText('-5')).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test components/__tests__/PlayerCounter.test.tsx`

Expected: FAIL with "Cannot find module '../PlayerCounter'"

**Step 3: Implement PlayerCounter component**

Create: `components/PlayerCounter.tsx`

```typescript
'use client'

interface PlayerCounterProps {
  playerId: string
  playerName: string
  currentLife: number
  isSolo: boolean
  onLifeChange: (playerId: string, amount: number) => void
}

export function PlayerCounter({
  playerId,
  playerName,
  currentLife,
  isSolo,
  onLifeChange,
}: PlayerCounterProps) {
  const handleIncrement = () => {
    onLifeChange(playerId, 1)
  }

  const handleDecrement = () => {
    onLifeChange(playerId, -1)
  }

  const lifeColorClass = currentLife < 0 ? 'text-red-600' : 'text-gray-900'
  const lifeSizeClass = isSolo ? 'text-9xl' : 'text-6xl'

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {/* Player name */}
      <div className="text-xl font-semibold text-gray-600 mb-4">
        {playerName}
      </div>

      {/* Life total */}
      <div className={`font-bold ${lifeSizeClass} ${lifeColorClass} mb-8`}>
        {currentLife}
      </div>

      {/* Controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={handleDecrement}
          className="flex-1 bg-red-600 text-white text-4xl font-bold py-8 rounded-lg hover:bg-red-700 active:bg-red-800 transition min-h-tap"
          aria-label="-"
        >
          -
        </button>
        <button
          onClick={handleIncrement}
          className="flex-1 bg-green-600 text-white text-4xl font-bold py-8 rounded-lg hover:bg-green-700 active:bg-green-800 transition min-h-tap"
          aria-label="+"
        >
          +
        </button>
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test components/__tests__/PlayerCounter.test.tsx`

Expected: PASS (all 7 tests pass)

**Step 5: Commit**

```bash
git add components/PlayerCounter.tsx components/__tests__/PlayerCounter.test.tsx
git commit -m "feat: add PlayerCounter component for life tracking

- Large, readable life total display
- Plus/minus buttons with good tap targets
- Solo vs multiplayer rendering modes
- Negative life support with red color
- Comprehensive tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 6: Life Tracker Main Component

**Files:**
- Create: `components/LifeTracker.tsx`
- Create: `components/__tests__/LifeTracker.test.tsx`

**Step 1: Write failing test for LifeTracker**

Create: `components/__tests__/LifeTracker.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LifeTracker } from '../LifeTracker'
import { GameState } from '@/types/game'

describe('LifeTracker', () => {
  const mockOnReset = jest.fn()

  const soloGameState: GameState = {
    mode: 'solo',
    gameType: 'standard',
    startingLife: 20,
    players: [
      {
        id: 'player-1',
        name: 'You',
        currentLife: 20,
        lifeHistory: [],
      },
    ],
    createdAt: new Date(),
  }

  const multiplayerGameState: GameState = {
    mode: 'multiplayer',
    gameType: 'commander',
    startingLife: 40,
    players: [
      {
        id: 'player-1',
        name: 'Player 1',
        currentLife: 40,
        lifeHistory: [],
      },
      {
        id: 'player-2',
        name: 'Player 2',
        currentLife: 40,
        lifeHistory: [],
      },
    ],
    createdAt: new Date(),
  }

  beforeEach(() => {
    mockOnReset.mockClear()
    localStorage.clear()
  })

  it('should render solo player counter', () => {
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('You')).toBeInTheDocument()
  })

  it('should update life when buttons are clicked', async () => {
    const user = userEvent.setup()
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    expect(screen.getByText('21')).toBeInTheDocument()
  })

  it('should persist life changes to localStorage', async () => {
    const user = userEvent.setup()
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)

    const stored = localStorage.getItem('manadork-game-state')
    expect(stored).toBeTruthy()

    const parsed = JSON.parse(stored!)
    expect(parsed.players[0].currentLife).toBe(21)
  })

  it('should render multiple players in multiplayer mode', () => {
    render(<LifeTracker initialGameState={multiplayerGameState} onReset={mockOnReset} />)

    expect(screen.getByText('Player 1')).toBeInTheDocument()
    expect(screen.getByText('Player 2')).toBeInTheDocument()
  })

  it('should show reset button', () => {
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    expect(screen.getByText(/Reset/i)).toBeInTheDocument()
  })

  it('should call onReset when reset is confirmed', async () => {
    const user = userEvent.setup()

    // Mock window.confirm to return true
    jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const resetButton = screen.getByText(/Reset/i)
    await user.click(resetButton)

    expect(mockOnReset).toHaveBeenCalled()
  })

  it('should not reset when confirmation is cancelled', async () => {
    const user = userEvent.setup()

    // Mock window.confirm to return false
    jest.spyOn(window, 'confirm').mockReturnValue(false)

    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const resetButton = screen.getByText(/Reset/i)
    await user.click(resetButton)

    expect(mockOnReset).not.toHaveBeenCalled()
  })

  it('should track life history', async () => {
    const user = userEvent.setup()
    render(<LifeTracker initialGameState={soloGameState} onReset={mockOnReset} />)

    const plusButton = screen.getByRole('button', { name: /\+/i })
    await user.click(plusButton)
    await user.click(plusButton)

    const stored = localStorage.getItem('manadork-game-state')
    const parsed = JSON.parse(stored!)

    expect(parsed.players[0].lifeHistory).toHaveLength(2)
    expect(parsed.players[0].lifeHistory[0].amount).toBe(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test components/__tests__/LifeTracker.test.tsx`

Expected: FAIL with "Cannot find module '../LifeTracker'"

**Step 3: Implement LifeTracker component**

Create: `components/LifeTracker.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { GameState } from '@/types/game'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { PlayerCounter } from './PlayerCounter'

interface LifeTrackerProps {
  initialGameState: GameState
  onReset: () => void
}

export function LifeTracker({ initialGameState, onReset }: LifeTrackerProps) {
  const [gameState, setGameState] = useLocalStorage<GameState>(
    'manadork-game-state',
    initialGameState
  )

  const handleLifeChange = (playerId: string, amount: number) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((player) => {
        if (player.id === playerId) {
          return {
            ...player,
            currentLife: player.currentLife + amount,
            lifeHistory: [
              ...player.lifeHistory,
              {
                amount,
                timestamp: new Date(),
              },
            ],
          }
        }
        return player
      }),
    }))
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the game?')) {
      localStorage.removeItem('manadork-game-state')
      onReset()
    }
  }

  const isSolo = gameState.mode === 'solo'

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-3 flex justify-between items-center">
        <div className="text-sm">
          {gameState.gameType === 'standard' ? 'Standard' : 'Commander'}
          {' '}({gameState.startingLife} life)
        </div>
        <button
          onClick={handleReset}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm font-semibold"
        >
          Reset Game
        </button>
      </div>

      {/* Player counters */}
      <div className={`flex-1 ${isSolo ? '' : 'grid grid-cols-1 md:grid-cols-2'}`}>
        {gameState.players.map((player) => (
          <PlayerCounter
            key={player.id}
            playerId={player.id}
            playerName={player.name}
            currentLife={player.currentLife}
            isSolo={isSolo}
            onLifeChange={handleLifeChange}
          />
        ))}
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test components/__tests__/LifeTracker.test.tsx`

Expected: PASS (all 9 tests pass)

**Step 5: Commit**

```bash
git add components/LifeTracker.tsx components/__tests__/LifeTracker.test.tsx
git commit -m "feat: add LifeTracker component with state management

- Manages game state with localStorage persistence
- Handles life changes and history tracking
- Reset functionality with confirmation
- Solo and multiplayer layouts
- Comprehensive tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 7: Main Tracker Page

**Files:**
- Create: `app/tracker/page.tsx`
- Create: `app/__tests__/tracker-page.test.tsx`

**Step 1: Write failing test for tracker page**

Create: `app/__tests__/tracker-page.test.tsx`

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TrackerPage from '../tracker/page'

describe('Tracker Page', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should show game setup when no active game exists', () => {
    render(<TrackerPage />)

    expect(screen.getByText(/Track My Life/i)).toBeInTheDocument()
  })

  it('should start a solo game when setup is completed', async () => {
    const user = userEvent.setup()
    render(<TrackerPage />)

    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Standard/i))

    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /\+/i })).toBeInTheDocument()
  })

  it('should resume game from localStorage if exists', () => {
    const existingGame = {
      mode: 'solo',
      gameType: 'commander',
      startingLife: 40,
      players: [
        {
          id: 'player-1',
          name: 'You',
          currentLife: 35,
          lifeHistory: [{ amount: -5, timestamp: new Date().toISOString() }],
        },
      ],
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('manadork-game-state', JSON.stringify(existingGame))

    render(<TrackerPage />)

    expect(screen.getByText('35')).toBeInTheDocument()
  })

  it('should return to setup when game is reset', async () => {
    const user = userEvent.setup()

    // Mock window.confirm
    jest.spyOn(window, 'confirm').mockReturnValue(true)

    render(<TrackerPage />)

    // Start game
    await user.click(screen.getByText(/Track My Life/i))
    await user.click(screen.getByText(/Standard/i))

    // Reset game
    await user.click(screen.getByText(/Reset Game/i))

    // Should be back at setup
    expect(screen.getByText(/Track My Life/i)).toBeInTheDocument()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test app/__tests__/tracker-page.test.tsx`

Expected: FAIL with "Cannot find module '../tracker/page'"

**Step 3: Implement tracker page**

Create: `app/tracker/page.tsx`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { GameState } from '@/types/game'
import { GameSetup } from '@/components/GameSetup'
import { LifeTracker } from '@/components/LifeTracker'

export default function TrackerPage() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing game in localStorage
    const stored = localStorage.getItem('manadork-game-state')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setGameState(parsed)
      } catch (error) {
        console.error('Failed to parse stored game state:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const handleStartGame = (newGameState: GameState) => {
    setGameState(newGameState)
  }

  const handleReset = () => {
    setGameState(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!gameState) {
    return <GameSetup onStartGame={handleStartGame} />
  }

  return <LifeTracker initialGameState={gameState} onReset={handleReset} />
}
```

**Step 4: Run test to verify it passes**

Run: `npm test app/__tests__/tracker-page.test.tsx`

Expected: PASS (all 4 tests pass)

**Step 5: Commit**

```bash
git add app/tracker/ app/__tests__/
git commit -m "feat: add tracker page with game state management

- Loads existing game from localStorage
- Setup to tracker flow
- Reset back to setup flow
- Loading state handling
- Comprehensive tests

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 8: Home Page & Layout

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Create: `app/globals.css`

**Step 1: Update root layout with mobile meta tags**

Modify: `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ManaDork - MTG Life Tracker",
  description: "Mobile-friendly Magic: The Gathering life tracker and toolkit",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#1f2937',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ManaDork',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

**Step 2: Create home page with navigation**

Modify: `app/page.tsx`

```typescript
import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <h1 className="text-6xl font-bold mb-4">ManaDork</h1>
      <p className="text-xl text-gray-300 mb-12 text-center max-w-md">
        Your mobile-friendly Magic: The Gathering toolkit
      </p>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Link
          href="/tracker"
          className="bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-8 px-6 rounded-lg text-center transition min-h-tap"
        >
          Life Tracker
        </Link>

        <div className="mt-8 text-center text-gray-400 text-sm">
          <p>More features coming soon:</p>
          <p className="mt-2">Card Lookup • Rules Reference • Deck Tracking</p>
        </div>
      </div>
    </div>
  )
}
```

**Step 3: Ensure globals.css has Tailwind directives**

Modify: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Prevent zoom on input focus (iOS) */
@layer base {
  input,
  select,
  textarea {
    font-size: 16px;
  }
}

/* Prevent pull-to-refresh on mobile */
body {
  overscroll-behavior-y: contain;
}
```

**Step 4: Test home page manually**

Run: `npm run dev`

Visit: `http://localhost:3000`

Expected: Home page displays with "Life Tracker" button that links to `/tracker`

**Step 5: Commit**

```bash
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: add home page and mobile-optimized layout

- Landing page with navigation to life tracker
- Mobile meta tags for PWA-ready setup
- Prevent zoom and pull-to-refresh on mobile
- Dark theme with gradient background

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 9: Manual Testing & Bug Fixes

**Files:**
- Various (as needed)

**Step 1: Run all tests**

Run: `npm test`

Expected: All tests pass

**Step 2: Test in development**

Run: `npm run dev`

Visit: `http://localhost:3000`

**Test scenarios:**
1. Navigate to Life Tracker
2. Start solo standard game (20 life)
3. Increment and decrement life
4. Refresh page - should resume game
5. Reset game - should return to setup
6. Start multiplayer game with 3 players
7. Test each player's counter independently
8. Test on mobile device or browser mobile view

**Step 3: Test mobile responsiveness**

- Open Chrome DevTools
- Toggle device toolbar (Ctrl+Shift+M)
- Test various screen sizes:
  - iPhone SE (375x667)
  - iPhone 12 Pro (390x844)
  - Pixel 5 (393x851)
  - iPad (768x1024)

**Step 4: Fix any bugs discovered**

If bugs are found:
1. Write a failing test that reproduces the bug
2. Fix the bug
3. Verify test passes
4. Commit with descriptive message

**Step 5: Create bug fix commits as needed**

```bash
git add [files]
git commit -m "fix: [description of bug fix]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Task 10: Production Build & Documentation

**Files:**
- Create: `README.md`
- Create: `.env.example`

**Step 1: Create README**

Create: `README.md`

```markdown
# ManaDork

A mobile-first Magic: The Gathering toolkit, starting with a comprehensive life tracker.

## Features

### Life Tracker (MVP)
- **Solo Mode**: Track your own life on your phone
- **Multiplayer Mode**: Track 2-4 players on one device
- **Game Modes**: Standard (20 life), Commander (40 life)
- **Persistence**: Auto-saves game state to resume after refresh
- **Mobile-Optimized**: Large touch targets, readable from across the table

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **State**: React hooks + localStorage

## Roadmap

- [ ] PWA support (installable app)
- [ ] Commander damage tracking
- [ ] Poison counter tracking
- [ ] User accounts
- [ ] Deck win/loss tracking
- [ ] Card lookup (Scryfall integration)
- [ ] Rules reference
- [ ] Terminology lookup

## Contributing

This is a personal project, but suggestions and bug reports are welcome via GitHub issues.

## License

MIT
```

**Step 2: Test production build**

Run: `npm run build`

Expected: Build completes successfully with no errors

Run: `npm start`

Expected: Production server starts and app works correctly

**Step 3: Commit documentation**

```bash
git add README.md
git commit -m "docs: add README with setup and feature documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Step 4: Create final verification commit**

Run: `npm test && npm run build`

Expected: All tests pass and build succeeds

```bash
git commit --allow-empty -m "chore: verify MVP complete - all tests pass and build succeeds

✅ Project setup complete
✅ Type definitions with tests
✅ localStorage hook with tests
✅ GameSetup component with tests
✅ PlayerCounter component with tests
✅ LifeTracker component with tests
✅ Tracker page with tests
✅ Home page and mobile layout
✅ Production build successful
✅ README documentation

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## Success Criteria

The MVP is complete when:

- ✅ All tests pass (`npm test`)
- ✅ Production build succeeds (`npm run build`)
- ✅ Solo life tracking works smoothly
- ✅ Multiplayer (2-4 players) tracking works
- ✅ Life changes persist across page refreshes
- ✅ Reset functionality works with confirmation
- ✅ Mobile-responsive on phones and tablets
- ✅ Touch targets meet 48px minimum
- ✅ App is usable during actual gameplay

## Next Steps After MVP

1. **Deploy**: Deploy to Vercel (free tier)
2. **PWA**: Add next-pwa for installable app
3. **Enhanced Features**: Commander damage, poison counters
4. **User Accounts**: Integrate Supabase for auth and cloud sync
5. **Card Lookup**: Integrate Scryfall API

---

**End of Implementation Plan**
