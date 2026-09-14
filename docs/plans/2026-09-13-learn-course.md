# Learn Course Implementation Plan

> Execute the approved Learn review in this existing audit checkout. The user approved implementation with “do it”; no additional design or execution approval is needed.

**Goal:** Help a beginner play a first game through six interactive, resumable chapters.

**Architecture:** Keep `/new-players`, `/basics`, `/combat`, and `/stack`; add `/cast`, `/turn`, and `/table`. One course layout provides local progress, common chapter navigation and consistent lesson styling. Lesson exercises use explicit serializable states. Static card images remain available without a live card API. Reuse the dice roll-off via its player-name URL contract; link to existing tracker setup without overwriting a game.

**Tech stack:** Next.js App Router, React, TypeScript, existing typography and colors, CSS module, Jest and Testing Library.

## Checklist

- [x] Write failing state and interaction tests for mana payment, combat, resolution and progress restoration.
- [x] Build validated progress storage and rule-outcome helpers, then pass the state tests.
- [x] Build the common shell, course home, six exercises and inline terms; preserve existing URLs.
- [x] Connect format-aware game setup to dice and tracker; add return-to-course links.
- [x] Verify targeted tests, TypeScript, lint and production build.
- [x] Inspect desktop, phone width, keyboard behavior and reload persistence; review the reduced-motion CSS guard and fix observed issues. Physical assistive-technology and reduced-motion browser checks remain outside this pass.
- [x] Update implementation evidence and leave the refreshed production preview running on port 3228.

## Design

Preserve the gold-and-charcoal codex identity. The landing page uses a large editorial introduction beside real Magic cards, one strong resume/start action and a numbered chapter list. A lesson has a compact course rail, one main interactive table and short supporting notes. Brighter 17–18px text, focus-visible controls and touch-sized actions take priority over ornament. Animations enhance committed state changes and respect reduced motion.

Each chapter has an outcome and a recoverable exercise: identify a card stat, generate the right mana, advance through a legal turn, resolve combat, resolve a response, and choose game setup. Completion requires the intended exercise outcome; visiting a route never completes it. State writes occur with each action, survive reload and tolerate unavailable/corrupt storage. Progress is local to the browser, not an account sync feature.

## Validation commands

`npm test -- --runInBand lib/__tests__/learn.test.ts components/__tests__/LearnCourse.test.tsx`

`npx tsc --noEmit`

`npm run lint`

`npm run build`

Use the browser to complete the learning journey, inspect mobile reflow, open/close definitions with a keyboard, reload a partially completed exercise and verify the tool handoff. No production deployment.
