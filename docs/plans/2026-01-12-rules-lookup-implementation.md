# Rules Lookup (CR + Card Rulings) - Implementation Plan

**Date:** 2026-01-12
**Scope:** Online-only rules lookup with full-text Comprehensive Rules search and Scryfall card rulings display.

## 1) CR Source + Fetch Layer

**Files:** `lib/` (new helper), config constant (new or existing constants file)

**Tasks:**
1. Choose a raw text Comprehensive Rules mirror (GitHub raw URL).
2. Add a fetch helper with 24h localStorage cache + timestamp.
3. Handle fetch failure gracefully (error banner + retry).

**Acceptance criteria:**
- CR text loads from the source and caches locally.
- Cached CR text is used without re-fetching within 24h.
- Errors show a user-friendly message.

## 2) CR Parsing + Full-Text Search

**Files:** `lib/` (parser + search)

**Tasks:**
1. Parse CR text into structured sections: `{ id, title, body }`.
2. Implement case-insensitive full-text search across id/title/body.
3. Rank results with simple scoring (id match > title match > body match).

**Acceptance criteria:**
- Searching “replacement effect” returns multiple sections.
- Searching “603.1” returns that exact section.
- Results include id, title, and preview snippet.

## 3) Card Rulings Integration (Scryfall)

**Files:** existing Scryfall API layer (`lib/scryfall-api.ts`), new hook or extension to `useCardSearch`.

**Tasks:**
1. Add a rulings fetcher (`/cards/{id}/rulings`).
2. Add a rulings panel to the card detail view.
3. Display date + ruling text; show empty state if none.

**Acceptance criteria:**
- Rulings show for cards with rulings.
- No-rulings state is clear and non-blocking.

## 4) UI/UX: Rules Lookup Page

**Files:** `app/rules/page.tsx`, new components under `components/`.

**Tasks:**
1. Build `/rules` page with shared search bar.
2. Desktop: split layout (results list + detail view).
3. Mobile: tabbed “Card” / “Rules” views with sticky search bar.

**Acceptance criteria:**
- UI is responsive and accessible.
- Rules results and card details are both reachable on mobile.

## 5) State + Routing

**Files:** `app/rules/page.tsx`, hooks for URL sync.

**Tasks:**
1. Support URL params: `?card=...` and `?cr=...`.
2. Sync selected item to URL; restore state on reload.

**Acceptance criteria:**
- Deep links load the correct card or rule.
- Reload preserves selected rule/card.

## 6) Tests

**Files:** `lib/__tests__/`, `components/__tests__/`, `app/__tests__/`.

**Tasks:**
1. Unit tests for CR parser + search.
2. Component tests for rules list + detail panel.
3. Integration tests for rulings panel.

**Acceptance criteria:**
- All new tests pass.
- Existing tests remain green.

---

**Notes:** Online-only approach chosen. CR source can be swapped later if needed; keep it in a single constant for maintainability.
