# Commander Damage Implementation Plan

**Date:** 2026-01-10
**Feature:** Commander damage tracking (commander mode only)

## 1. Update Types

**Files:** `types/game.ts`

**Tasks:**
1. Add `CommanderDamage` interface with `fromPlayerId` and `amount`.
2. Extend `Player` with optional `commanderDamage?: CommanderDamage[]` and `commanderName?: string`.
3. Ensure existing game state remains valid when new fields are missing.

**Acceptance criteria:**
- TypeScript compiles with no changes required to existing usage.
- New fields are optional and default behavior is unchanged for saved games without them.

## 2. CommanderDamageModal (TDD)

**Files:** `components/CommanderDamageModal.tsx`, tests under the existing test structure.

**Tasks:**
1. Write tests for modal rendering, open/close behavior, and damage controls.
2. Render a modal overlay with header, opponent list, and +/- controls.
3. Show total commander damage received and per-opponent amounts.
4. Clamp damage at 0; prevent negative values.
5. Apply warning styles for 18-20 (yellow) and 21+ (red) totals.

**Acceptance criteria:**
- Tests cover open/close, increment/decrement, and clamping to 0.
- Modal is keyboard and pointer accessible; has explicit close control.
- Warning styles appear at thresholds.

## 3. PlayerCounter Updates

**Files:** `components/PlayerCounter.tsx`, tests.

**Tasks:**
1. Add commander icon in commander mode only.
2. Make player card tap/click open the commander damage modal.
3. Add inline player name editing with save on blur/Enter.
4. Ensure tap targets are at least 48px.

**Acceptance criteria:**
- Icon appears only in commander mode; no change in other modes.
- Clicking/tapping player opens modal.
- Player names persist in state and localStorage.
- Tap targets meet size requirements.

## 4. LifeTracker Integration

**Files:** `components/LifeTracker.tsx`, `hooks/useLocalStorage.ts` (if needed), tests.

**Tasks:**
1. Add state for commander damage per player.
2. Add modal visibility state and selected player.
3. Wire modal callbacks to update player commander damage.
4. Persist commander damage and names via existing localStorage hook.

**Acceptance criteria:**
- Commander damage persists across refreshes.
- No runtime errors when loading legacy state without commander fields.
- Modal state is correctly managed for the selected player.

## 5. Commander Naming

**Files:** `components/CommanderDamageModal.tsx` (or `components/PlayerCounter.tsx`), tests.

**Tasks:**
1. Add inline edit for commander name, defaulting to "Commander" when unset.
2. Store per-player commander name.

**Acceptance criteria:**
- Commander name shows default when missing.
- Inline edits persist and survive reload.

## 6. First-Time Banner

**Files:** `components/LifeTracker.tsx` (or a new component), tests.

**Tasks:**
1. Show a dismissible banner once per device in commander mode.
2. Store `hasSeenCommanderTip` in localStorage.
3. Auto-dismiss after a short timeout and allow manual dismiss.

**Acceptance criteria:**
- Banner appears only in commander mode and only once.
- Dismissal persists across refreshes.

## 7. Visual Warnings on Player Cards

**Files:** `components/PlayerCounter.tsx`, tests.

**Tasks:**
1. Compute total commander damage received.
2. Show yellow warning at 18-20, red at 21+.
3. Display total commander damage on the card.

**Acceptance criteria:**
- Badge colors update when thresholds are crossed.
- Totals are correct and update with modal changes.

## 8. Test Coverage and Manual Verification

**Files:** tests; no production code changes unless needed.

**Tasks:**
1. Add integration tests for full flow (open modal, update damage, persist, reload).
2. Verify name editing for players and commanders.
3. Verify banner behavior.

**Acceptance criteria:**
- All new and existing tests pass.
- Manual checklist from the handoff passes on mobile and desktop.
