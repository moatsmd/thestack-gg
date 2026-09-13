# Supporting tools and site shell audit — 2026-09-13

## Fixed

- **Screen-on recovery:** `useWakeLock` treated browser release as the player switching the preference off. Preserve requested state separately from the actual sentinel, reacquire on foreground return, deduplicate pending requests, and release late results after cancellation or unmount. `isEnabled` reports the preference; `isActive` reports an acquired lock.
- **Lost local counter updates:** `useLocalStorage` evaluated functional updaters against a render closure. Three batched decrements from 40 saved 39. A synchronously updated reference now composes each operation, including callbacks retaining an older setter, and persists 37.
- **Keyboard navigation:** the More drawer lacked dialog semantics, Escape dismissal, focus placement/containment/return, and scroll containment. Added these, a visible close control, accessible toggle states, and current-page announcements.
- **Mobile shell:** allow browser zoom, fit the drawer above the bottom safe area, constrain it to the viewport, keep the footer clear of the persistent navigation, and defer the wide desktop navigation until it has sufficient room.
- **Discoverability:** the homepage advertised implemented Pod Sync as coming soon. Replace the outdated roadmap panel with a live three-step shared-table guide and tracker entry point. Preserve the gold/obsidian visual identity.
- **Trust and accessibility:** replace empty social links with working internal destinations, add a skip link and visible focus outlines, label the home link and navigation landmarks, and honor reduced-motion preferences in the homepage's decorative motion and CSS transitions.

## Verification

- Before fixes: hook suite reproduced 7 failing tests, including wake-after-sleep and batched-update losses. Navigation suite reproduced 3 failing accessibility regressions.
- After fixes: `npm test -- --runInBand hooks/__tests__/useWakeLock.test.ts hooks/__tests__/useLocalStorage.test.tsx components/__tests__/LifeTracker.test.tsx app/__tests__/nav.test.tsx` — **47 tests pass**.
- Targeted `next lint` across the eight edited production modules — **no warnings or errors**.
- `git diff --check` — no whitespace errors.
- Raw repository `tsc --noEmit` currently includes tests without Jest globals/types, so it is not a clean baseline check. No dependency or TypeScript configuration changes made in this subtask.
- Root audit owns live desktop/mobile browser validation and integration/build verification. These unit checks do not establish actual iOS/Android sleep behavior.

## Integration note

The tracker and bottom navigation may each instantiate the wake-lock hook. Each instance safely owns its sentinel; sharing a single screen-on preference across all controls would require a common provider if desired in a later change.
