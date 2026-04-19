# ManaDork Overhaul — Plan 3: Tracker Enhancements

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add four opt-in per-player extra counters (Energy, Experience, Rad, Ticket) and a collapsible table-wide status bar (Monarch, Initiative, Day/Night, City's Blessing) to the life tracker. Both features persist in localStorage with the existing game state.

**Architecture:** 
- `types/game.ts` gains `enabledCounters` on `GameState` and `extraCounters` on `Player`, plus a `TableStatus` interface stored on `GameState`.
- `GameSetup.tsx` gets a new step to select which extra counters the game uses.
- `PlayerCounter.tsx` renders the extra counter rows when counters are enabled.
- `LifeTracker.tsx` grows a collapsible `TableStatusBar` section and handlers for the new state.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS 3, localStorage via `useLocalStorage` hook.

---

## File Map

| File | Action |
|---|---|
| `types/game.ts` | Modify: add `ExtraCounterType`, `TableStatus`, `enabledCounters`, `extraCounters`, `tableStatus` |
| `components/GameSetup.tsx` | Modify: add extra-counters selection step (step 4 for multiplayer, step 3 for solo) |
| `components/PlayerCounter.tsx` | Modify: accept and render `extraCounters` with +/- controls |
| `components/LifeTracker.tsx` | Modify: manage extra counter state, add `TableStatusBar` |
| `app/__tests__/tracker.test.tsx` | Create: tests for extra counters and table status |

---

### Task 7: Extend game types

**Files:**
- Modify: `types/game.ts`

- [ ] **Step 1: Write failing test — new types exist**

Create `app/__tests__/tracker.test.tsx`:

```tsx
import { GameState, Player, ExtraCounterType, TableStatus } from '@/types/game'

describe('game types', () => {
  it('GameState accepts enabledCounters field', () => {
    const state: GameState = {
      mode: 'multiplayer',
      gameType: 'commander',
      startingLife: 40,
      enabledCounters: ['energy', 'experience'],
      tableStatus: {
        monarchId: null,
        initiativeId: null,
        isNight: false,
        citysBlessingIds: [],
      },
      players: [],
      createdAt: new Date(),
    }
    expect(state.enabledCounters).toEqual(['energy', 'experience'])
    expect(state.tableStatus.monarchId).toBeNull()
  })

  it('Player accepts extraCounters field', () => {
    const player: Player = {
      id: 'p1',
      name: 'Alice',
      currentLife: 40,
      lifeHistory: [],
      extraCounters: { energy: 3, experience: 1, rad: 0, ticket: 0 },
    }
    expect(player.extraCounters?.energy).toBe(3)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tracker.test.tsx --no-coverage 2>&1 | tail -15
```

Expected: FAIL — types not found.

- [ ] **Step 3: Replace `types/game.ts`**

```ts
export type GameMode = 'solo' | 'multiplayer'
export type GameType = 'standard' | 'commander' | 'custom'
export type ExtraCounterType = 'energy' | 'experience' | 'rad' | 'ticket'

export const EXTRA_COUNTER_CONFIG: Record<ExtraCounterType, { symbol: string; label: string }> = {
  energy:     { symbol: '⚡', label: 'Energy' },
  experience: { symbol: '★', label: 'Experience' },
  rad:        { symbol: '☢', label: 'Rad' },
  ticket:     { symbol: '🎟', label: 'Ticket' },
}

export interface LifeChange {
  amount: number
  timestamp: Date
}

export interface CommanderDamage {
  fromPlayerId: string
  amount: number
}

export interface ManaPool {
  white: number
  blue: number
  black: number
  red: number
  green: number
  colorless: number
}

export interface TableStatus {
  monarchId: string | null
  initiativeId: string | null
  isNight: boolean
  citysBlessingIds: string[]
}

export interface Player {
  id: string
  name: string
  currentLife: number
  lifeHistory: LifeChange[]
  commanderDamage?: CommanderDamage[]
  commanderName?: string
  poisonCounters?: number
  manaPool?: ManaPool
  extraCounters?: Record<ExtraCounterType, number>
}

export interface GameState {
  mode: GameMode
  gameType: GameType
  startingLife: number
  enabledCounters: ExtraCounterType[]
  tableStatus: TableStatus
  players: Player[]
  createdAt: Date
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tracker.test.tsx --no-coverage 2>&1 | tail -15
```

Expected: PASS.

- [ ] **Step 5: Fix TypeScript errors from downstream consumers**

`GameSetup.tsx` calls `createGameState` which now needs to include `enabledCounters` and `tableStatus`. Open `components/GameSetup.tsx` and update the `createGameState` function:

```ts
// Find this function and replace it:
const createGameState = (mode: 'solo' | 'multiplayer', gameType: GameType, playerCount: number, counters: ExtraCounterType[] = []): GameState => {
  const startingLife = gameType === 'standard' ? 20 : gameType === 'commander' ? 40 : 20

  const players = Array.from({ length: playerCount }, (_, i) => ({
    id: `player-${i + 1}`,
    name: mode === 'solo' ? 'You' : `Player ${i + 1}`,
    currentLife: startingLife,
    lifeHistory: [],
    extraCounters: counters.length > 0
      ? Object.fromEntries(counters.map((c) => [c, 0])) as Record<ExtraCounterType, number>
      : undefined,
  }))

  return {
    mode,
    gameType,
    startingLife,
    enabledCounters: counters,
    tableStatus: {
      monarchId: null,
      initiativeId: null,
      isNight: false,
      citysBlessingIds: [],
    },
    players,
    createdAt: new Date(),
  }
}
```

Also add the import at the top of `GameSetup.tsx`:
```ts
import { GameState, GameType, ExtraCounterType } from '@/types/game'
```

- [ ] **Step 6: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -30
```

Fix any remaining errors (the callers of `handleSoloMode` / `handleMultiplayerStart` may need updating to pass an empty `counters` array — update as needed).

- [ ] **Step 7: Commit**

```bash
cd C:/Users/moats/ManaDork && git add types/game.ts components/GameSetup.tsx app/__tests__/tracker.test.tsx && git commit -m "feat(tracker): add ExtraCounterType, TableStatus, and enabledCounters to game types"
```

---

### Task 8: GameSetup — extra counters selection step

**Files:**
- Modify: `components/GameSetup.tsx`

- [ ] **Step 1: Write failing test**

In `app/__tests__/tracker.test.tsx`, add:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GameSetup } from '@/components/GameSetup'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

const renderSetup = (onStart = jest.fn()) =>
  render(<DarkModeProvider><GameSetup onStartGame={onStart} /></DarkModeProvider>)

describe('GameSetup extra counters', () => {
  it('shows extra counter step when playing multiplayer commander', async () => {
    const user = userEvent.setup()
    renderSetup()
    // Click Multiplayer
    await user.click(screen.getByText(/multiplayer/i))
    // Select player count (2 is default, click Next or similar)
    const nextBtn = screen.queryByText(/next/i) ?? screen.queryByText(/continue/i)
    if (nextBtn) await user.click(nextBtn)
    // Select Commander
    await user.click(screen.getByText(/commander/i))
    // Should now show counter selection
    expect(screen.getByTestId('extra-counters-step')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tracker.test.tsx --testNamePattern="extra counter step" --no-coverage 2>&1 | tail -15
```

Expected: FAIL.

- [ ] **Step 3: Update `components/GameSetup.tsx`**

Read the full current file first (`components/GameSetup.tsx`), then apply these changes:

**a) Update the `setupStep` type** to include the new step:

```ts
const [setupStep, setSetupStep] = useState<'mode' | 'solo-type' | 'multi-players' | 'multi-type' | 'counters'>('mode')
```

**b) Add counter state:**

```ts
const [selectedCounters, setSelectedCounters] = useState<ExtraCounterType[]>([])
```

**c) Update `stepIndex` to count to 4 for multiplayer:**

```ts
const stepIndex = setupStep === 'mode'
  ? 1
  : setupStep === 'solo-type' || setupStep === 'multi-players'
    ? 2
    : setupStep === 'multi-type'
      ? 3
      : 4
```

**d) Update `StepIndicator` to show 4 dots for multiplayer:**

```tsx
const StepIndicator = () => (
  <div className="flex items-center justify-center gap-2">
    {[1, 2, 3, 4].map((step) => (
      <span
        key={step}
        className={`h-3 w-3 rotate-45 border border-white/30 ${
          step <= stepIndex ? 'bg-[var(--accent-1)]' : 'bg-transparent'
        }`}
      />
    ))}
  </div>
)
```

**e) Update `handleMultiplayerStart` to go to counter step instead of starting immediately:**

```ts
const handleMultiplayerType = (gameType: GameType) => {
  setSelectedGameType(gameType) // add this state variable
  setSetupStep('counters')
}
```

Add state: `const [selectedGameType, setSelectedGameType] = useState<GameType>('standard')`

**f) Render the counter selection step** — add this block inside the component's return, before the final `null`:

```tsx
if (setupStep === 'counters') {
  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] px-4 py-10">
      <div className="mx-auto flex max-w-xl flex-col gap-6">
        <header className="arcane-panel mana-border rounded-3xl px-6 py-8 text-center">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Life tracker</p>
          <h1 className="mt-3 text-4xl font-semibold text-[var(--ink)]">Extra Counters</h1>
          <div className="frame-divider mt-4 w-20 mx-auto" />
          <div className="mt-4"><StepIndicator /></div>
          <p className="mt-4 text-[var(--muted)]">Select any optional counter types for this game.</p>
        </header>

        <div
          className="arcane-panel mana-border rounded-2xl p-6 space-y-3"
          data-testid="extra-counters-step"
        >
          {(Object.entries(EXTRA_COUNTER_CONFIG) as [ExtraCounterType, { symbol: string; label: string }][]).map(([type, { symbol, label }]) => {
            const isSelected = selectedCounters.includes(type)
            return (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setSelectedCounters((prev) =>
                    prev.includes(type) ? prev.filter((c) => c !== type) : [...prev, type]
                  )
                }
                className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition ${
                  isSelected
                    ? 'border-[var(--accent-1)] bg-[var(--accent-1)]/10 text-[var(--ink)]'
                    : 'border-white/10 text-[var(--muted)] hover:bg-[var(--surface-2)]'
                }`}
                data-testid={`counter-option-${type}`}
                aria-pressed={isSelected}
              >
                <span className="text-2xl">{symbol}</span>
                <span className="font-medium">{label}</span>
                {isSelected && <span className="ml-auto text-[var(--accent-1)] font-bold">✓</span>}
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const gameState = createGameState('multiplayer', selectedGameType, playerCount, selectedCounters)
            onStartGame(gameState)
          }}
          className="w-full px-6 py-4 rounded-2xl bg-[var(--accent-1)] text-white text-xl font-bold hover:bg-[var(--accent-1)]/90 transition"
        >
          Start Game
        </button>
      </div>
    </div>
  )
}
```

Also add the missing import at the top:
```ts
import { GameState, GameType, ExtraCounterType, EXTRA_COUNTER_CONFIG } from '@/types/game'
```

- [ ] **Step 4: Run tests**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tracker.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: all pass.

- [ ] **Step 5: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 6: Commit**

```bash
cd C:/Users/moats/ManaDork && git add components/GameSetup.tsx app/__tests__/tracker.test.tsx && git commit -m "feat(tracker): add extra counter selection step to GameSetup"
```

---

### Task 9: PlayerCounter extra counters + LifeTracker TableStatus bar

**Files:**
- Modify: `components/PlayerCounter.tsx`
- Modify: `components/LifeTracker.tsx`

- [ ] **Step 1: Write failing tests**

In `app/__tests__/tracker.test.tsx`, add:

```tsx
import { PlayerCounter } from '@/components/PlayerCounter'

describe('PlayerCounter extra counters', () => {
  const baseProps = {
    playerId: 'p1',
    playerName: 'Alice',
    currentLife: 40,
    isSolo: false,
    isCommander: true,
    enabledCounters: ['energy', 'experience'] as ExtraCounterType[],
    extraCounters: { energy: 2, experience: 1, rad: 0, ticket: 0 } as Record<ExtraCounterType, number>,
    onLifeChange: jest.fn(),
    onOpenCommanderDamage: jest.fn(),
    onOpenPoisonCounter: jest.fn(),
    onOpenManaPool: jest.fn(),
    onNameChange: jest.fn(),
    onExtraCounterChange: jest.fn(),
  }

  it('shows energy counter row when enabled', () => {
    render(<DarkModeProvider><PlayerCounter {...baseProps} /></DarkModeProvider>)
    expect(screen.getByTestId('extra-counter-energy')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument() // current value
  })

  it('does not show rad counter when not enabled', () => {
    render(<DarkModeProvider><PlayerCounter {...baseProps} /></DarkModeProvider>)
    expect(screen.queryByTestId('extra-counter-rad')).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tracker.test.tsx --testNamePattern="extra counter" --no-coverage 2>&1 | tail -15
```

Expected: FAIL.

- [ ] **Step 3: Update `components/PlayerCounter.tsx`**

Add new props to the interface and render extra counters below the life total:

```tsx
'use client'

import { useEffect, useState } from 'react'
import { CommanderDamage, ExtraCounterType, ManaPool, EXTRA_COUNTER_CONFIG } from '@/types/game'

interface PlayerCounterProps {
  playerId: string
  playerName: string
  currentLife: number
  isSolo: boolean
  isCommander: boolean
  commanderDamage?: CommanderDamage[]
  poisonCounters?: number
  manaPool?: ManaPool
  enabledCounters?: ExtraCounterType[]
  extraCounters?: Record<ExtraCounterType, number>
  onLifeChange: (playerId: string, amount: number) => void
  onOpenCommanderDamage: (playerId: string) => void
  onOpenPoisonCounter: (playerId: string) => void
  onOpenManaPool: (playerId: string) => void
  onNameChange: (playerId: string, name: string) => void
  onExtraCounterChange: (playerId: string, counter: ExtraCounterType, delta: number) => void
}

export function PlayerCounter({
  playerId,
  playerName,
  currentLife,
  isSolo,
  isCommander,
  commanderDamage = [],
  poisonCounters = 0,
  manaPool,
  enabledCounters = [],
  extraCounters,
  onLifeChange,
  onOpenCommanderDamage,
  onOpenPoisonCounter,
  onOpenManaPool,
  onNameChange,
  onExtraCounterChange,
}: PlayerCounterProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState(playerName)

  const maxCommanderDamage = commanderDamage.length > 0
    ? Math.max(...commanderDamage.map((entry) => entry.amount))
    : 0
  const commanderWarningLevel = maxCommanderDamage >= 21 ? 'danger' : maxCommanderDamage >= 18 ? 'warning' : 'none'
  const poisonWarningLevel = poisonCounters >= 10 ? 'danger' : poisonCounters >= 8 ? 'warning' : 'none'
  const totalMana = manaPool ? Object.values(manaPool).reduce((sum, n) => sum + n, 0) : 0

  useEffect(() => {
    if (!isEditingName) setNameDraft(playerName)
  }, [playerName, isEditingName])

  const handleNameSubmit = () => {
    const trimmed = nameDraft.trim()
    const nextName = trimmed.length > 0 ? trimmed : playerName
    onNameChange(playerId, nextName)
    setNameDraft(nextName)
    setIsEditingName(false)
  }

  const lifeColorClass = currentLife < 0 ? 'text-red-600 dark:text-red-400' : 'text-[var(--ink)]'
  const lifeSizeClass = isSolo ? 'text-9xl' : 'text-6xl'

  return (
    <div
      className="arcane-panel mana-border flex flex-col items-center justify-center h-full p-4 rounded-2xl hover:bg-white/5 transition"
      data-testid="player-card"
      onClick={() => isCommander && onOpenCommanderDamage(playerId)}
      role={isCommander ? 'button' : undefined}
      tabIndex={isCommander ? 0 : undefined}
      onKeyDown={(event) => {
        if (!isCommander) return
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpenCommanderDamage(playerId)
        }
      }}
    >
      {/* Name row */}
      <div className="flex items-center gap-2 mb-4">
        {isEditingName ? (
          <input
            aria-label="Player name"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleNameSubmit() }
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-base font-semibold text-gray-700 focus:border-gray-500 focus:outline-none dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
          />
        ) : (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setNameDraft(playerName); setIsEditingName(true) }}
            className="text-xl font-semibold text-[var(--muted)] hover:text-[var(--ink)]"
            aria-label="Edit player name"
          >
            {playerName}
          </button>
        )}
        {isCommander && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onOpenCommanderDamage(playerId) }}
            className="rounded-full border border-white/10 px-2 py-1 text-xs font-semibold text-[var(--muted)]"
            aria-label="Open commander damage"
          >
            CMD
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenPoisonCounter(playerId) }}
          className="rounded-full border border-white/10 px-2 py-1 text-xs font-semibold text-[var(--muted)]"
          aria-label="Open poison counters"
        >
          ☠️
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenManaPool(playerId) }}
          className="rounded-full border border-white/10 px-2 py-1 text-xs font-semibold text-[var(--muted)]"
          aria-label="Open mana pool"
        >
          💎
        </button>
      </div>

      {/* Life total */}
      <div className={`font-bold ${lifeSizeClass} ${lifeColorClass} mb-4 drop-shadow-sm`}>
        {currentLife}
      </div>

      {/* Commander damage badge */}
      {isCommander && maxCommanderDamage > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenCommanderDamage(playerId) }}
          className={`rounded-full px-4 py-2 text-sm font-semibold mb-4 cursor-pointer hover:opacity-80 transition ${
            commanderWarningLevel === 'danger'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-100'
              : commanderWarningLevel === 'warning'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-100'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
          data-testid="commander-damage-badge"
          aria-label="Open commander damage"
        >
          ⚔️ {maxCommanderDamage} CMD Damage (max)
        </button>
      )}

      {/* Poison badge */}
      {poisonCounters > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenPoisonCounter(playerId) }}
          className={`rounded-full px-4 py-2 text-sm font-semibold mb-4 cursor-pointer hover:opacity-80 transition ${
            poisonWarningLevel === 'danger'
              ? 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-100'
              : poisonWarningLevel === 'warning'
                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/60 dark:text-yellow-100'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
          data-testid="poison-badge"
          aria-label="Open poison counters"
        >
          ☠️ {poisonCounters} Poison
        </button>
      )}

      {/* Mana badge */}
      {totalMana > 0 && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpenManaPool(playerId) }}
          className="rounded-full px-4 py-2 text-sm font-semibold mb-4 bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-100 cursor-pointer hover:opacity-80 transition"
          data-testid="mana-badge"
          aria-label="Open mana pool"
        >
          💎 {totalMana} Mana
        </button>
      )}

      {/* Extra counter rows */}
      {enabledCounters.length > 0 && (
        <div
          className="w-full max-w-md space-y-1 mb-4"
          onClick={(e) => e.stopPropagation()}
        >
          {enabledCounters.map((counterType) => {
            const { symbol, label } = EXTRA_COUNTER_CONFIG[counterType]
            const value = extraCounters?.[counterType] ?? 0
            return (
              <div
                key={counterType}
                className="flex items-center justify-between gap-2 px-3 py-1 rounded-lg bg-[var(--surface-2)]"
                data-testid={`extra-counter-${counterType}`}
              >
                <span className="text-sm font-medium text-[var(--muted)]">
                  {symbol} {label}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onExtraCounterChange(playerId, counterType, -1)}
                    className="w-7 h-7 rounded-full bg-[var(--accent-3)] text-white font-bold hover:opacity-80 transition"
                    aria-label={`Decrease ${label}`}
                  >
                    −
                  </button>
                  <span className="w-6 text-center font-bold text-[var(--ink)]">{value}</span>
                  <button
                    type="button"
                    onClick={() => onExtraCounterChange(playerId, counterType, 1)}
                    className="w-7 h-7 rounded-full bg-[var(--accent-2)] text-gray-900 font-bold hover:opacity-80 transition"
                    aria-label={`Increase ${label}`}
                  >
                    +
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Life controls */}
      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={(e) => { e.stopPropagation(); onLifeChange(playerId, -1) }}
          className="flex-1 bg-[var(--accent-3)] text-white text-4xl font-bold py-8 rounded-lg hover:bg-[var(--accent-3)]/90 active:bg-[var(--accent-3)] transition min-h-tap"
          aria-label="-"
        >
          -
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onLifeChange(playerId, 1) }}
          className="flex-1 bg-[var(--accent-2)] text-gray-900 text-4xl font-bold py-8 rounded-lg hover:bg-[var(--accent-2)]/90 active:bg-[var(--accent-2)] transition min-h-tap"
          aria-label="+"
        >
          +
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Update `components/LifeTracker.tsx`**

Read the full current `LifeTracker.tsx` file, then apply these changes:

**a) Add `handleExtraCounterChange` handler** after `handleLifeChange`:

```ts
const handleExtraCounterChange = (playerId: string, counter: ExtraCounterType, delta: number) => {
  setGameState((prev) => ({
    ...prev,
    players: prev.players.map((player) => {
      if (player.id !== playerId) return player
      const current = player.extraCounters?.[counter] ?? 0
      const next = Math.max(0, current + delta)
      return {
        ...player,
        extraCounters: {
          ...(player.extraCounters ?? { energy: 0, experience: 0, rad: 0, ticket: 0 }),
          [counter]: next,
        } as Record<ExtraCounterType, number>,
      }
    }),
  }))
}
```

**b) Add `tableStatus` handlers** after `handleExtraCounterChange`:

```ts
const handleSetMonarch = (playerId: string | null) => {
  setGameState((prev) => ({
    ...prev,
    tableStatus: { ...prev.tableStatus, monarchId: playerId },
  }))
}

const handleSetInitiative = (playerId: string | null) => {
  setGameState((prev) => ({
    ...prev,
    tableStatus: { ...prev.tableStatus, initiativeId: playerId },
  }))
}

const handleToggleNight = () => {
  setGameState((prev) => ({
    ...prev,
    tableStatus: { ...prev.tableStatus, isNight: !prev.tableStatus.isNight },
  }))
}

const handleToggleCitysBlessing = (playerId: string) => {
  setGameState((prev) => {
    const ids = prev.tableStatus.citysBlessingIds
    const next = ids.includes(playerId)
      ? ids.filter((id) => id !== playerId)
      : [...ids, playerId]
    return { ...prev, tableStatus: { ...prev.tableStatus, citysBlessingIds: next } }
  })
}
```

**c) Add TableStatus bar JSX** above the player grid. Add `[isStatusOpen, setIsStatusOpen]` useState.

Insert this block in the JSX return, between the header and the player grid:

```tsx
{/* Table Status Bar */}
{gameState.tableStatus && (
  <div className="mb-4">
    <button
      type="button"
      onClick={() => setIsStatusOpen((o) => !o)}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)] transition text-sm font-medium"
      data-testid="table-status-toggle"
    >
      <span>Table Status</span>
      <span>{isStatusOpen ? '▲' : '▼'}</span>
      {/* Active indicator dots */}
      {(gameState.tableStatus.monarchId || gameState.tableStatus.initiativeId) && (
        <span className="w-2 h-2 rounded-full bg-[var(--accent-1)]" />
      )}
    </button>

    {isStatusOpen && (
      <div
        className="mt-2 p-4 arcane-panel mana-border rounded-2xl space-y-3"
        data-testid="table-status-bar"
      >
        {/* Monarch */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">👑 Monarch</p>
          <div className="flex flex-wrap gap-2">
            {gameState.players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSetMonarch(gameState.tableStatus.monarchId === p.id ? null : p.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  gameState.tableStatus.monarchId === p.id
                    ? 'bg-yellow-400 text-yellow-900'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                data-testid={`monarch-${p.id}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Initiative */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">⚔ Initiative</p>
          <div className="flex flex-wrap gap-2">
            {gameState.players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSetInitiative(gameState.tableStatus.initiativeId === p.id ? null : p.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  gameState.tableStatus.initiativeId === p.id
                    ? 'bg-blue-400 text-blue-900'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                data-testid={`initiative-${p.id}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Day/Night */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">🌙 Day / Night</p>
          <button
            type="button"
            onClick={handleToggleNight}
            className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
              gameState.tableStatus.isNight
                ? 'bg-indigo-700 text-white'
                : 'bg-yellow-300 text-yellow-900'
            }`}
            data-testid="day-night-toggle"
          >
            {gameState.tableStatus.isNight ? '🌙 Night' : '☀️ Day'}
          </button>
        </div>

        {/* City's Blessing */}
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] mb-1">City's Blessing</p>
          <div className="flex flex-wrap gap-2">
            {gameState.players.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleToggleCitysBlessing(p.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                  gameState.tableStatus.citysBlessingIds.includes(p.id)
                    ? 'bg-[var(--accent-2)] text-gray-900'
                    : 'bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                data-testid={`citys-blessing-${p.id}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
)}
```

**d) Update `PlayerCounter` call** to pass the new props:

```tsx
<PlayerCounter
  // existing props...
  enabledCounters={gameState.enabledCounters ?? []}
  extraCounters={player.extraCounters}
  onExtraCounterChange={handleExtraCounterChange}
/>
```

**e) Add missing state and import** at top of LifeTracker:

```ts
import { GameState, ExtraCounterType } from '@/types/game'
const [isStatusOpen, setIsStatusOpen] = useState(false)
```

- [ ] **Step 5: Run all tracker tests**

```bash
cd C:/Users/moats/ManaDork && npx jest app/__tests__/tracker.test.tsx --no-coverage 2>&1 | tail -20
```

Expected: all pass.

- [ ] **Step 6: Verify TypeScript**

```bash
cd C:/Users/moats/ManaDork && npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Step 7: Commit**

```bash
cd C:/Users/moats/ManaDork && git add components/PlayerCounter.tsx components/LifeTracker.tsx app/__tests__/tracker.test.tsx && git commit -m "feat(tracker): add extra counter rows per player + collapsible TableStatus bar (Monarch, Initiative, Day/Night, City's Blessing)"
```
