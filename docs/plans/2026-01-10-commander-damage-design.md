# Commander Damage Tracking - Design Document

**Date:** 2026-01-10
**Feature:** Commander damage tracking for TheStack.gg MTG Life Tracker

## Goal

Add commander damage tracking to commander mode games, allowing players to track combat damage from each opponent's commander (21 damage = player elimination per official rules).

## User Experience

### Discoverability

**Visual Indicator:**
- Small [SWORD] icon appears in top-right corner of each player card (commander mode only)
- Player names are tappable (underline on hover for desktop)

**First-Time Help:**
- On first commander game, show dismissible banner: "Tip: Tap any player to track commander damage [SWORD]"
- Banner auto-dismisses after 5 seconds or manual dismiss
- Tracked in localStorage (`hasSeenCommanderTip`), only shows once per device

### Interaction Flow

1. **Start commander game** -> Player cards show [SWORD] icon
2. **Tap any player card** -> Commander damage modal opens
3. **View damage list** -> See all opponents and their commander damage dealt
4. **Adjust damage** -> Use +/- buttons to track damage from each commander
5. **Close modal** -> Tap outside or click X button to return to main tracker

### Commander Damage Modal

**Layout:**
- Semi-transparent dark overlay background
- White card centered on screen
- Header: "[Player Name]'s Commander Damage"
- List of opponents:
  - "From [Opponent Name]'s [Commander Name]: X damage"
  - +/- buttons for each (smaller than main life buttons)
- Close button (X) in top-right corner

**Visual Warnings:**
- 18-20 damage: Yellow [WARNING] badge on player card
- 21+ damage: Red [SKULL] badge on player card + red text in modal
- Warning only - game continues (supports house rules)

### Player Renaming

**Any Mode:**
- Tap any player name (main tracker or modal) to edit
- Name field becomes editable input
- Tap outside or press Enter to save
- Defaults: "You" (solo), "Player 1, 2, 3..." (multiplayer)

**Commander Names:**
- Optional field in commander damage modal
- Can name commanders (e.g., "Atraxa", "Edgar Markov")
- Defaults to "Commander" if not set
- Tappable to edit inline

## Architecture

### Data Model

```typescript
interface CommanderDamage {
  fromPlayerId: string  // Which opponent's commander dealt this damage
  amount: number        // Total damage from that commander
}

interface Player {
  id: string
  name: string  // Editable by tapping
  currentLife: number
  lifeHistory: LifeChange[]
  commanderDamage?: CommanderDamage[]  // Optional, only in commander mode
  commanderName?: string  // Optional, user-set
}
```

### Component Changes

**Modified Components:**
- `PlayerCounter.tsx` - Add [SWORD] icon in commander mode, make tappable to open modal, add name editing
- `LifeTracker.tsx` - Manage commander damage state, pass to PlayerCounter

**New Components:**
- `CommanderDamageModal.tsx` - Modal overlay for damage tracking
- `FirstTimeBanner.tsx` (or inline) - Dismissible tip banner

**State Management:**
- All state managed by `LifeTracker` component
- Persisted via existing `useLocalStorage` hook
- Modal open/closed state in local component state

### Persistence

**localStorage key:** `manadork-game-state` (existing)

**New fields in GameState:**
- Players now have optional `commanderDamage` array
- Players now have optional `commanderName` string
- Store `hasSeenCommanderTip` boolean separately

**Migration:**
- Existing saved games won't have these fields (undefined)
- Gracefully handle missing fields
- No breaking changes to existing games

## Scope & Constraints

### In Scope
- Commander damage tracking in commander mode only
- Visual warnings at 18 and 21 damage
- Player and commander name editing
- Modal UI for damage details
- First-time user hint
- Full mobile and desktop support

### Out of Scope
- Commander damage in non-commander modes (can add later if needed)
- Automatic game ending at 21 damage (warning only)
- Commander damage history/undo (not in MVP)
- Partner commanders (can add later)
- Solo mode commander damage (doesn't make sense)

## Testing Strategy

### Unit Tests
- Commander damage state calculations
- Damage increment/decrement logic
- Name editing save/cancel
- Warning threshold detection (18, 21)

### Component Tests
- Modal open/close interactions
- Tap outside to dismiss
- Close button functionality
- Player name editing
- Commander name editing
- +/- button interactions

### Integration Tests
- Full flow: start commander game -> tap player -> add damage -> persist to localStorage -> reload -> verify state
- First-time banner shows once, then never again
- Warning badges appear correctly

### Edge Cases
- Solo mode commander game: Hide tap-to-expand (no opponents to track)
- Negative damage: Prevent going below 0
- Rapid tapping: Proper React state updates (no race conditions)
- localStorage persistence across page refresh
- Missing fields in old saved games (graceful degradation)

## Mobile-First Considerations

- Modal is touch-friendly with large tap targets
- Tap outside works on both mobile and desktop
- Close button (X) provides explicit desktop-friendly exit
- No swipe-only gestures (always have click alternative)
- Responsive modal sizing for small screens
- 48px minimum tap targets on all buttons

## Implementation Notes

**Recommended approach:**
1. Add data model changes to types
2. Build CommanderDamageModal component with TDD
3. Add modal trigger to PlayerCounter
4. Integrate state management in LifeTracker
5. Add player renaming functionality
6. Add first-time banner
7. Add visual warning badges
8. Test on mobile and desktop

**Dependencies:**
- No new external libraries needed
- Uses existing React hooks, Tailwind CSS, localStorage
