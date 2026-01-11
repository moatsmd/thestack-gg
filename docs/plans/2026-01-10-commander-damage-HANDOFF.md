# Commander Damage Feature - Session Handoff

**Date:** 2026-01-10
**Status:** Design complete, ready for implementation setup
**Next Session Flag:** Use whatever flag you need

## What We've Completed

### 1. Design Phase ✅
- Created comprehensive design document: `docs/plans/2026-01-10-commander-damage-design.md`
- Design covers:
  - Data model changes (CommanderDamage interface, Player interface updates)
  - UI/UX flow (tap player → modal → track damage from each opponent)
  - Discoverability (⚔️ icon + first-time hint banner)
  - Player/commander renaming
  - Visual warnings (18+ yellow, 21+ red)
  - Testing strategy and edge cases

### 2. Preparation ✅
- Added `.worktrees` to `.gitignore` (committed: 2d2263e)
- User chose project-local `.worktrees/` directory for isolated workspace

## Where We Are Right Now

**About to:** Create git worktree for feature implementation

**Command ready to run:**
```bash
git worktree add .worktrees/commander-damage -b feature/commander-damage
```

## What Happens Next

### Step 1: Create Worktree (in new session)

```bash
# Create isolated workspace
git worktree add .worktrees/commander-damage -b feature/commander-damage

# Navigate to worktree
cd .worktrees/commander-damage

# Install dependencies
npm install

# Verify clean test baseline
npm test
```

**Expected:** All existing tests should pass (clean baseline)

### Step 2: Write Implementation Plan

Use `superpowers:writing-plans` skill to create detailed step-by-step implementation plan.

**Plan should cover:**
1. Update TypeScript types (add CommanderDamage interface, update Player)
2. Build CommanderDamageModal component (TDD)
3. Add modal trigger to PlayerCounter (⚔️ icon, tap handler)
4. Integrate commander damage state in LifeTracker
5. Add player renaming functionality
6. Add first-time banner ("Tip: Tap any player to track commander damage")
7. Add visual warning badges (18+ yellow, 21+ red)
8. Test on mobile and desktop

**Save plan to:** `docs/plans/2026-01-10-commander-damage-implementation.md`

### Step 3: Execute Plan

Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement:

**Subagent-Driven (recommended):**
- Dispatch fresh subagent per task
- Two-stage review after each: spec compliance, then code quality
- Fast iteration in same session
- Controller reads plan once, extracts all tasks

**Executing Plans (alternative):**
- Batch execution with checkpoints
- Good for parallel session work

### Step 4: Test & Verify

**Manual testing checklist:**
- Start commander game (2-4 players)
- Verify ⚔️ icon appears on player cards
- Tap player → modal opens
- Add commander damage from each opponent
- Verify damage persists after page refresh
- Test visual warnings (18+ yellow, 21+ red)
- Test player renaming (tap name → edit → save)
- Test commander naming
- Verify first-time banner shows once, then never again
- Test on mobile device and desktop

### Step 5: Merge & Deploy

**When complete:**
1. Run full test suite in worktree
2. Use `superpowers:finishing-a-development-branch` skill
3. Options: merge to main, create PR, or cleanup
4. Push to GitHub → Vercel auto-deploys

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
- `PlayerCounter.tsx` - Add tap handler, ⚔️ icon, name editing
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

## Commands Quick Reference

```bash
# In new session, navigate to project
cd C:\Users\moats\ManaDork

# Create worktree
git worktree add .worktrees/commander-damage -b feature/commander-damage
cd .worktrees/commander-damage
npm install
npm test

# Write implementation plan (use skill)
# Use superpowers:writing-plans

# Execute plan (use skill)
# Use superpowers:subagent-driven-development

# When done
# Use superpowers:finishing-a-development-branch
```

## Important Notes

- User has `--dangerously-skip-permissions` flag preference
- User is not experienced with programming, wants guidance
- Mobile-first design is critical (48px tap targets)
- Always provide desktop alternatives to mobile gestures
- Test-driven development (write tests first)
- Frequent commits with clear messages

## Questions to Ask in New Session

None needed - design is approved, ready to execute. Just:

1. Announce using `using-git-worktrees` skill (resume where we left off)
2. Create worktree
3. Use `writing-plans` skill to create implementation plan
4. Get user approval on execution approach (subagent-driven vs executing-plans)
5. Execute!

## Files to Reference

- Design doc: `docs/plans/2026-01-10-commander-damage-design.md`
- Existing types: `types/game.ts`
- Existing components: `components/PlayerCounter.tsx`, `components/LifeTracker.tsx`
- Existing hook: `hooks/useLocalStorage.ts`

Good luck with the new session!
