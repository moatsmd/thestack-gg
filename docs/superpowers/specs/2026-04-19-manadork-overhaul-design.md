# ManaDork Overhaul — Design Spec
**Date:** 2026-04-19  
**Status:** Approved

## Overview

A comprehensive content and feature overhaul to make ManaDork the go-to MTG companion app for both Commander and competitive players. The core app shell, tech stack, and design language are preserved. Six areas of change.

---

## 1. Tech Stack (No Changes)

- Next.js 14 (App Router), React 18, TypeScript
- Tailwind CSS 3, CSS custom properties for theming
- Scryfall API for card data (existing caching + rate limiting preserved)
- localStorage for all persistence
- No new dependencies, no new APIs

---

## 2. Glossary Overhaul

### Data Model

Add one field to `KeywordDefinition` in `lib/keywords-data.ts`:

```ts
tier: 'evergreen' | 'returning' | 'retired'
```

Add an optional field for Scryfall jump-to-search:

```ts
scryfallQuery?: string  // e.g. 'o:flying', 'o:energy'
```

### Coverage: 43 → ~220 entries

**Evergreen (~15):** All existing keywords tagged as `evergreen`. These never rotate off cards. Examples: Flying, Trample, Haste, Deathtouch, Indestructible, Hexproof, Ward, Lifelink, Vigilance, Reach, Menace, Flash, First Strike, Double Strike, Defender.

**Returning/Major (~120):** Keywords that appear on current or recent cards, including set mechanics that have returned or are widely known. Includes but not limited to:
- Classic returning: Flashback, Kicker, Cycling, Morph, Megamorph, Buyback, Replicate, Splice, Overload, Jump-start, Rebound
- Graveyard: Dredge, Madness, Escape, Embalm, Eternalize, Disturb, Unearth
- Counters/resources: Proliferate, Energy, Experience, Adapt, Graft, Modular, Persist, Undying, Wither, Infect, Toxic, Rad
- Creature abilities: Ninjutsu, Crew (Vehicles), Bestow, Dash, Blitz, Connive, Training, Backup
- Card advantage: Surveil, Investigate, Explore, Learn (Lesson), Foretell, Plot, Discover
- Combat: Battalion, Bloodrush, Exert, Foray, Raid, Ferocious
- Permanents: Saga chapters, Companion, Mutate, Meld, Daybound/Nightbound, Disturb
- Tokens/artifacts: Treasure, Clue, Food, Blood, Map tokens (as mechanics)
- Stack/timing: Storm, Cascade, Suspend, Spectacle, Spree
- Other: Devotion, Delirium, Threshold, Hellbent, Metalcraft, Morbid, Formidable, Undergrowth, Convoke, Delve, Improvise, Affinity (for artifacts)

**Retired/Parasitic (~85):** Keywords that no longer appear on new cards. Shown only when "Retired" filter is active. Examples: Shadow, Horsemanship, Phasing, Cumulative Upkeep, Banding, Echo, Fading, Vanishing, Flanking, Bushido, Soulshift, Offering, Forecast, Bloodthirst, Absorb, Rampage, Substance, Landhome, Bands with Other, Enchant World, Intimidate, Fear, Shroud.

### Filter UI

Two filter rows:
1. **Type** (existing): All | Ability | Action | Mechanic
2. **Tier** (new): Evergreen | Returning | Retired (multi-select, defaults to Evergreen + Returning active, Retired off)

Each keyword card shows a small tier badge: green dot for evergreen, blue for returning, gray for retired.

### Scryfall Links

Each entry with a `scryfallQuery` shows a "See cards →" link that navigates to `/toolkit?q={scryfallQuery}`, opening the card search pre-filled. No new page or API needed.

---

## 3. Tracker Enhancements

### Per-Player Optional Counters

Four new counter types, hidden by default, opt-in per game in Game Setup:

| Counter | Symbol | Notes |
|---|---|---|
| Energy | ⚡ | Kaladesh, recent sets |
| Experience | ★ | Commander cards (Meren, Ezuri, etc.) |
| Rad | ☢ | Fallout crossover |
| Ticket | 🎟 | Unfinity |

Each appears as a small +/- row beneath the life counter on the PlayerCounter card when enabled. Configuration lives in game setup ("Which extra counters does this game use?").

### Table-Wide Status Effects

A collapsible "Table Status" bar above the player grid, hidden until any status is activated via a "Table Status" button in the tracker header.

| Status | Behavior |
|---|---|
| Monarch 👑 | One player holds it; tap to transfer |
| Initiative ⚔ | One player holds it; tap to transfer |
| Day/Night 🌙 | Single toggle for whole table; tap cycles day → night → day |
| City's Blessing | Per-player toggle (has 10+ permanents) |

Status effects persist in localStorage with the rest of game state.

### No Dungeon Tracker

Dungeon state (Dungeon of the Mad Mage, Dungeon of Yore, Undercity) is complex enough to warrant its own future feature. Not in this scope.

---

## 4. Dice Roller (`/dice`)

### UI

- 7 large tap-target buttons: d4, d6, d8, d10, d12, d20, d100
- Each button shows a die icon and label
- Single roll: tap a die → result displayed large in center with a ~300ms count-up animation
- Multi-die mode: tap multiple dice to queue them (badge shows count), tap "Roll X dice" to execute; shows individual results and total
- Roll history: last 10 rolls listed below with die type, result, and time

### No extras

No probability calculators, no modifiers, no saved configurations. Speed and simplicity.

---

## 5. Token Reference (`/tokens`)

### Data

Static file `lib/tokens-data.ts` with ~150 common tokens. Each entry:

```ts
interface TokenDefinition {
  name: string
  colors: ('W' | 'U' | 'B' | 'R' | 'G' | 'C')[]  // C = colorless
  type: 'creature' | 'artifact' | 'enchantment' | 'emblem'
  power?: string            // e.g. '1', '*'
  toughness?: string
  typeLine: string          // e.g. 'Creature — Goblin'
  abilities: string[]       // e.g. ['Haste', 'Trample']
  madeBy: string[]          // 2-3 example card names
}
```

### UI

- Search bar: filter by token name instantly
- Filters: color (W/U/B/R/G/colorless/multi) and type (creature/artifact/enchantment/emblem)
- Each token shown as a card with name, color pip(s), type line, P/T if creature, abilities, and "Made by" list
- Tapping a card name in "Made by" navigates to `/toolkit?q={cardName}` for the card lookup

### Coverage Focus

Commander and competitive staples first: Goblin, Zombie, Soldier, Spirit, Angel, Dragon, Beast, Insect, Saproling, Plant, Elemental, Thopter, Bird, Human, Knight, Warrior; Artifact tokens: Treasure, Clue, Food, Blood, Map, Gold, Powerstone; special: Copy token rules explanation, Emblem reference.

---

## 6. Stack Page Redesign (`/stack`)

### From interactive tool → static reference card

The interactive stack visualizer (LIFO management, priority buttons, resolution history) is removed entirely. The `/stack` route becomes a clean static reference.

### Content

- **Visual diagram:** Stack as a vertical column, spells entering at top, resolving from top down (LIFO). Clear arrows and labels.
- **Priority flow:** Active Player → each other player in turn order → back to Active Player. Visual loop diagram.
- **Key rules (scannable bullets):**
  - Both players receive priority before anything resolves
  - Either player can respond by adding to the stack
  - Split second: no spells or activated abilities can be added while it's on the stack
  - Mana abilities don't use the stack (instant speed, no response window)
  - State-based actions aren't stack items — they happen automatically
  - Hexproof/shroud protect from targeting but not from triggered abilities that don't target
- **Common scenarios (2-3 examples):**
  - "Opponent casts Counterspell on your spell — you still have priority to respond"
  - "A triggered ability goes on the stack — both players get priority before it resolves"
  - "You cast two spells in a row — second spell resolves first"

### Implementation

Static page, no hooks, no state. Pure JSX + Tailwind. Styled to match the app's dark theme with the existing color palette.

---

## 7. Navigation Restructure

### Bottom Nav (5 items — mobile thumb zone)

| Slot | Route | Icon |
|---|---|---|
| Tracker | `/tracker` | Heart |
| Cards | `/toolkit` | Search |
| Dice | `/dice` | Dice |
| Glossary | `/glossary` | Book |
| More | drawer | Menu |

### More Drawer

Implemented as a bottom sheet that slides up from the "More" bottom nav button — not a hamburger menu (the hamburger was removed in a prior refactor). The sheet overlays the page with a backdrop, dismisses on backdrop tap or swipe down.

Items:
- Stack Reference (`/stack`)
- Rules Lookup (`/rules`)
- Tokens (`/tokens`)
- New Players (`/new-players`)

### Home

`/` remains but is no longer a nav item. Reachable via app logo/wordmark in the page header. The home page can be simplified or kept as-is.

---

## Success Criteria

- Glossary covers all major MTG mechanics a player would encounter, with clear tier indicators
- A player can look up any common keyword, counter type, or token without leaving the app
- The tracker handles any Commander or 60-card game without needing paper supplements
- The dice roller is fast enough to replace reaching for physical dice mid-game
- The stack page is immediately useful as a reference without requiring interaction
