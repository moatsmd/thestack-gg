# Commander Damage Feature - Session Handoff

**Date:** 2026-01-10
**Status:** Implementation in progress
**Next Session Flag:** --dangerously-skip-permissions
**Working Directory:** C:\Users\moats\ManaDork\.worktrees\commander-damage
**Branch:** feature/commander-damage

---

## TL;DR for Agents

**What:** Add commander damage tracking to MTG life tracker app
**Where:** `.worktrees/commander-damage` (already created)
**Next:**
1. `cd C:\Users\moats\ManaDork\.worktrees\commander-damage`
2. Continue commander naming, first-time banner, and warning badges
3. Complete remaining tests and manual checklist
4. Merge when complete

**Design doc:** `docs/plans/2026-01-10-commander-damage-design.md`

---

## What We've Completed

### 1. Design Phase �o.
- Created comprehensive design document: `docs/plans/2026-01-10-commander-damage-design.md`
- Design covers:
  - Data model changes (CommanderDamage interface, Player interface updates)
  - UI/UX flow (tap player �+' modal �+' track damage from each opponent)
  - Discoverability (�s"�,? icon + first-time hint banner)
  - Player/commander renaming
  - Visual warnings (18+ yellow, 21+ red)
  - Testing strategy and edge cases

### 2. Preparation �o.
- Added `.worktrees` to `.gitignore` (committed: 2d2263e)
- User chose project-local `.worktrees/` directory for isolated workspace

### 3. Worktree Setup �o.
- Created worktree at `.worktrees/commander-damage`
- New branch created: `feature/commander-damage`
- Verified `.worktrees` is in gitignore
- Worktree files ready (package.json, all source files present)

### 4. Implementation Plan �o.
- Created implementation plan: `docs/plans/2026-01-10-commander-damage-implementation.md`

### 5. Baseline Setup �o.
- Installed dependencies in worktree
- Baseline tests pass (`npm test`)
- LocalStorage test console noise addressed

### 6. Types & Modal �o.
- Updated `types/game.ts` with `CommanderDamage`, `commanderDamage?`, and `commanderName?`
- Added `CommanderDamageModal` component + tests

### 7. Player & LifeTracker Integration �o.
- `PlayerCounter` now supports commander mode UI, card click handler, and inline name editing
- `LifeTracker` manages commander modal state and persists commander damage
- Added/updated tests for `PlayerCounter` and `LifeTracker`

### 8. Commander Name Handler �o.
- Added `handleCommanderNameChange` function in `LifeTracker.tsx` (LifeTracker.tsx:107)
- Function updates player's `commanderName` field in game state
- Ready to be wired to UI components

## Where We Are Right Now

**Ready for:** Wire up commander name editing UI, add banner, add warning badges

**Current state:**
- Worktree exists at: `C:\Users\moats\ManaDork\.worktrees\commander-damage`
- Branch: `feature/commander-damage`
- Dependencies: Installed
- Tests: Passing (39 tests pass) �o.
- Latest change: Added `handleCommanderNameChange` handler to LifeTracker

**Remaining tasks:**
1. Pass `handleCommanderNameChange` to CommanderDamageModal and add inline edit UI for commander names
2. Add first-time banner component for commander mode tip (with localStorage persistence)
3. Add visual warning badges (18+ yellow, 21+ red) to PlayerCounter
4. Display total commander damage on player cards
5. Write tests for all new features
6. Manual verification and merge

## What Happens Next

### Step 1: Install Dependencies & Verify Baseline �o. DONE

**Note for agents:** You may need to handle npm commands differently on Windows. If working in Git Bash, npm might not be available. User can run these from PowerShell/CMD if needed.

```bash
# Navigate to worktree (if not already there)
cd C:\Users\moats\ManaDork\.worktrees\commander-damage

# Install dependencies
npm install

# Verify clean test baseline
npm test
```

**Expected:** All existing tests should pass (clean baseline). If they don't, report failures before proceeding.

### Step 2: Create Implementation Plan �o. DONE

**Goal:** Write a detailed, step-by-step implementation plan covering all tasks.

**Agent instructions:** Create file `docs/plans/2026-01-10-commander-damage-implementation.md`

**Plan must include these tasks (break into smaller steps as appropriate):**
1. **Types**: Update `types/game.ts`
   - Add `CommanderDamage` interface
   - Update `Player` interface with optional `commanderDamage` and `commanderName` fields
   - Ensure backward compatibility (fields are optional)

2. **CommanderDamageModal Component**: Create `components/CommanderDamageModal.tsx`
   - Display list of opponents
   - Allow incrementing/decrementing damage from each opponent
   - Show total commander damage received
   - Visual warnings (18+ yellow background, 21+ red background)
   - "Close" or "Done" button
   - Write tests FIRST (TDD approach)

3. **PlayerCounter Updates**: Modify `components/PlayerCounter.tsx`
   - Add �s"�,? icon (only in commander mode)
   - Add tap/click handler to open modal
   - Add player name editing (tap name �+' inline edit �+' save)
   - Ensure 48px tap targets for mobile

4. **LifeTracker Integration**: Modify `components/LifeTracker.tsx`
   - Add state for commander damage tracking
   - Add modal visibility state
   - Pass damage handlers to modal
   - Persist to localStorage via existing hook

5. **Commander Naming**: Add to PlayerCounter or modal
   - Optional field "Commander Name"
   - Defaults to "Commander" if not set

6. **First-Time Banner**: Add to LifeTracker
   - Show once: "Tip: Tap any player to track commander damage"
   - Store `hasSeenCommanderTip` in localStorage
   - Dismissible
   - Only show in commander mode

7. **Visual Warnings**: Implement in PlayerCounter
   - 18+ damage: Yellow badge/background
   - 21+ damage: Red badge/background
   - Show total commander damage received

8. **Testing**: Write tests for each component
   - Unit tests for all new components
   - Integration tests for state management
   - Test localStorage persistence
   - Test visual warnings at thresholds

**Save plan to:** `docs/plans/2026-01-10-commander-damage-implementation.md`

**Format:** Use numbered tasks with clear acceptance criteria. Each task should be independently implementable and testable.

### Step 3: Execute Implementation

**Agent instructions:** Implement the plan task-by-task. Follow TDD (write tests first).

**Workflow:**
1. Read the implementation plan
2. For each task:
   - Write tests first (if applicable)
   - Implement the feature
   - Run tests to verify
   - Commit with clear message
3. After each major component, verify it works
4. Keep commits small and focused

### Step 4: Test & Verify

**Manual testing checklist:**
- Start commander game (2-4 players)
- Verify �s"�,? icon appears on player cards
- Tap player �+' modal opens
- Add commander damage from each opponent
- Verify damage persists after page refresh
- Test visual warnings (18+ yellow, 21+ red)
- Test player renaming (tap name �+' edit �+' save)
- Test commander naming
- Verify first-time banner shows once, then never again
- Test on mobile device and desktop

### Step 5: Merge & Deploy

**When complete:**
1. Run full test suite in worktree
2. Use `superpowers:finishing-a-development-branch` skill
3. Options: merge to main, create PR, or cleanup
4. Push to GitHub �+' Vercel auto-deploys

## Key Design Decisions (Reference)

### Data Model
```typescript
interface CommanderDamage {
  fromPlayerId: string  // Which opponent dealt this damage
  amount: number        // Total damage from that commander
}

interface Player {
  id: string
  name: string  // NOW EDITABLE
  currentLife: number
  lifeHistory: LifeChange[]
  commanderDamage?: CommanderDamage[]  // NEW - optional
  commanderName?: string  // NEW - optional
}
```

### Scope Constraints
- **Commander mode only** - Don't show in standard/solo games
- **Warning only at 21 damage** - Game continues (house rules friendly)
- **Optional commander names** - Defaults to "Commander" if not set
- **No commander damage in solo mode** - Doesn't make sense (no opponents)

### Component Architecture
- `PlayerCounter.tsx` - Add tap handler, �s"�,? icon, name editing
- `CommanderDamageModal.tsx` - NEW component for damage tracking
- `LifeTracker.tsx` - Manage commander damage state
- First-time banner (inline or separate component)

### Persistence
- Uses existing `useLocalStorage` hook
- Store in existing `manadork-game-state` key
- New fields are optional (graceful degradation for old saves)
- Store `hasSeenCommanderTip` separately

## Tech Stack (Reference)

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS
- **Testing:** Jest + React Testing Library
- **State:** React hooks + localStorage
- **Deployment:** Vercel (auto-deploy from GitHub)

## Current Project State

**Live site:** https://manadork.vercel.app (waiting for DNS to point thestack.gg)
**GitHub:** User has repo set up with Vercel auto-deploy
**Main branch:** All MVP features complete and working
**Domain:** thestack.gg purchased, DNS propagating (user waiting for TTL)

## Resume Instructions for Any Agent

**Worktree is already created.** Start here:

```bash
# Navigate to worktree
cd C:\Users\moats\ManaDork\.worktrees\commander-damage

# Verify you're on the right branch
git branch --show-current
# Should show: feature/commander-damage

# Install dependencies (may need PowerShell/CMD on Windows)
npm install

# Verify test baseline
npm test
# All existing tests should pass
```

**Next steps:**
1. Wire up commander name editing UI:
   - Update `CommanderDamageModal.tsx` to accept `onCommanderNameChange` prop
   - Pass `handleCommanderNameChange` from LifeTracker to modal
   - Add inline edit field for each opponent's commander name in modal
   - Display current commander name with edit ability
   - Write tests for commander name editing and persistence

2. Add first-time banner in commander mode:
   - Create banner component or add inline to LifeTracker
   - Show "Tip: Tap any player to track commander damage" message
   - Store `hasSeenCommanderTip` in localStorage
   - Make it dismissible and auto-hide after shown once
   - Only show in commander mode
   - Write tests for banner behavior

3. Add visual warning badges on player cards:
   - Calculate total commander damage received per player in PlayerCounter
   - Add yellow badge/background for 18-20 damage
   - Add red badge/background for 21+ damage
   - Display total commander damage on player card
   - Write tests for visual warnings at thresholds

4. Run full test suite and verify all tests pass
5. Manual testing checklist (see below)
6. Commit frequently with clear messages
7. When done, merge back to master using `superpowers:finishing-a-development-branch` skill

## Commands Quick Reference

```bash
# Navigate to worktree (always start here)
cd C:\Users\moats\ManaDork\.worktrees\commander-damage

# Run tests
npm test

# Run dev server (for manual testing)
npm run dev

# Build for production
npm run build

# Lint
npm run lint

# Commit changes
git add .
git commit -m "feat: your message here"

# When complete, switch back to main and merge
cd C:\Users\moats\ManaDork
git checkout master
git merge feature/commander-damage
git push

# Clean up worktree after merge
git worktree remove .worktrees/commander-damage
git branch -d feature/commander-damage
```

## Important Notes

- User has `--dangerously-skip-permissions` flag preference
- User is not experienced with programming, wants guidance
- Mobile-first design is critical (48px tap targets)
- Always provide desktop alternatives to mobile gestures
- Test-driven development (write tests first)
- Frequent commits with clear messages

## Quick Start for Next Agent

**Worktree already exists!** No setup needed. Just:

1. Navigate to `.worktrees/commander-damage`
2. Install dependencies if needed: `npm install`
3. Run tests: `npm test`
4. Continue remaining tasks (commander naming, banner, warning badges)
5. Commit frequently
6. When done, merge back to master

**No questions needed** - design is approved, scope is clear. Just execute!

## Files to Reference

- Design doc: `docs/plans/2026-01-10-commander-damage-design.md`
- Implementation plan: `docs/plans/2026-01-10-commander-damage-implementation.md`
- Existing types: `types/game.ts`
- Existing components: `components/PlayerCounter.tsx`, `components/LifeTracker.tsx`, `components/CommanderDamageModal.tsx`
- Existing hook: `hooks/useLocalStorage.ts`

Good luck with the new session!
## Worktree Status (Last Updated: 2026-01-10)

**Worktree:** `C:\Users\moats\ManaDork\.worktrees\commander-damage`
**Branch:** `feature/commander-damage`

**Changed files:**
- `components/CommanderDamageModal.tsx` (new file)
- `components/__tests__/CommanderDamageModal.test.tsx` (new file)
- `components/PlayerCounter.tsx` (modified)
- `components/__tests__/PlayerCounter.test.tsx` (modified)
- `components/LifeTracker.tsx` (modified - added handleCommanderNameChange)
- `components/__tests__/LifeTracker.test.tsx` (modified)
- `hooks/__tests__/useLocalStorage.test.tsx` (modified)
- `types/game.ts` (modified - added CommanderDamage interface and Player fields)

**Tests status:**
- `npm test` - All 39 tests passing ✓
- Last verified: 2026-01-10

**Implementation status:**
- ✓ Types updated (CommanderDamage, commanderDamage?, commanderName?)
- ✓ CommanderDamageModal created with damage tracking
- ✓ PlayerCounter updated with commander mode support
- ✓ LifeTracker integrated with modal state and persistence
- ✓ handleCommanderNameChange function added
- ⏳ Commander name editing UI (needs to be wired up)
- ⏳ First-time banner (not started)
- ⏳ Visual warning badges on player cards (not started)
