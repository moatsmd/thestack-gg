# ManaDork Life Tracker - Design Document

**Date:** 2026-01-09
**Feature:** Life Tracker MVP

## Overview

ManaDork is a comprehensive Magic: The Gathering toolkit with mobile-first design. This document covers the initial MVP: a life tracker supporting solo and multiplayer game tracking.

## Technology Stack

- **Frontend:** Next.js 14+ (App Router), React, TypeScript
- **Styling:** Tailwind CSS (mobile-first, accessibility built-in)
- **State Management:** React hooks (useState, useEffect)
- **Persistence:** localStorage
- **Future:** PWA support, Supabase for accounts

## Project Structure

```
ManaDork/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout, mobile meta tags
│   │   ├── page.tsx             # Home/landing page
│   │   └── tracker/
│   │       └── page.tsx         # Life tracker main page
│   ├── components/
│   │   ├── LifeTracker.tsx      # Main tracker component
│   │   ├── PlayerCounter.tsx    # Individual player life display
│   │   └── GameSetup.tsx        # Initial setup (players, mode)
│   ├── hooks/
│   │   └── useLocalStorage.tsx  # Persistence helper
│   └── types/
│       └── game.ts              # TypeScript interfaces
├── public/                      # Static assets
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## User Experience Flow

### Game Setup Screen

**Solo Tracking (Primary):**
- BIG primary button: "Track My Life"
- Quick mode selection: Standard (20), Commander (40), Custom
- Optional player name input
- Immediate start

**Multiplayer Tracking (Secondary):**
- Smaller button: "Track Game (2-4 players)"
- Select player count (2-4)
- Select game mode
- Start tracking

### Solo Tracker Interface (PRIMARY USE CASE)

**Full-Screen Layout:**
- Massive life total (center, huge font)
- Large +/- buttons (bottom half, split left/right)
- Top bar: mode indicator, reset button
- Minimal, clean design
- Maximum use of screen space

**Interaction:**
- Tap + to increase life
- Tap - to decrease life
- Reset with confirmation
- Resume game after refresh

### Multi-Player Tracker Interface

**Layout by Player Count:**
- **2 players:** Vertical split, one side upside-down (players face their controls)
- **3-4 players:** Grid layout, smaller but thumb-friendly

**Per-Player Display:**
- Player name/number (tap to edit)
- Large life total
- +/- buttons on sides
- Settings icon for future features (commander damage, poison)

### Mobile-First Details

- Minimum tap target: 48x48px (accessibility)
- High-contrast, large text
- Works in portrait and landscape
- No accidental taps
- Visual feedback on life changes (green for gain, red for loss)

## Data Model

### TypeScript Interfaces

```typescript
interface GameState {
  mode: 'solo' | 'multiplayer';
  gameType: 'standard' | 'commander' | 'custom';
  startingLife: number;
  players: Player[];
  createdAt: Date;
}

interface Player {
  id: string;
  name: string;
  currentLife: number;
  lifeHistory: LifeChange[];
}

interface LifeChange {
  amount: number;
  timestamp: Date;
}
```

## State Management

**Flow:**
1. Setup phase builds initial GameState
2. React useState holds current game state
3. Life changes update player life + append to history
4. useEffect auto-saves to localStorage on every change
5. On load, check localStorage for active game and offer resume

**Features Enabled:**
- Undo last change (pop from lifeHistory)
- Reset game (clear state, return to setup)
- Resume game (load from localStorage)
- All operations local, works offline

## Error Handling

### LocalStorage Issues
- Check availability (private mode may block)
- Fallback to session-only storage
- User warning if persistence unavailable

### Data Validation
- Validate loaded game state structure
- If corrupted → start fresh, don't crash
- Log errors to console for debugging

### User Input Boundaries
- Life total: Allow negative (valid in MTG)
- No upper limit (infinite life combos exist)
- Custom starting life: 1-999 range

### User Protection
- Confirmation on reset game
- Browser prompt on navigate away
- No confirmation on life changes (too disruptive)

### Device/Screen Handling
- Prevent screen sleep during game (future: Wake Lock API)
- Handle orientation changes
- Support screens down to 320px width

## Testing Strategy

### Manual Testing Focus (MVP)

**Solo Tracker:**
- Start with each mode (Standard/Commander/Custom)
- Increase/decrease life multiple times
- Test negative life values
- Close browser, reopen (test persistence)
- Reset and restart
- Test on actual mobile device

**Multi-Player Tracker:**
- Test 2, 3, and 4 player modes
- Verify independent counters
- Test persistence with multiple players

**Mobile/Responsive:**
- Portrait and landscape orientation
- Button tap targets (easy to press)
- Text readability from distance
- Small screen compatibility

**Edge Cases:**
- Page refresh during game
- Clear browser data
- Incognito/private mode
- Rapid button tapping

## Future Enhancements (Not MVP)

- PWA support (installable app, offline mode)
- Undo/redo functionality
- Commander damage tracking
- Poison counter tracking
- Game history (requires accounts)
- Shared multiplayer tracking (real-time sync)
- Card lookup integration
- Rules/terminology lookup
- Deck win/loss tracking

## Success Criteria

MVP is successful when:
- Solo tracker works smoothly on mobile
- Life tracking is fast and accurate
- Persistence works reliably
- App is usable during actual gameplay
- UI is accessible and easy to use across table
