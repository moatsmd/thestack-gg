# Learn experience review

Reviewed September 13, 2026 against the local production preview at http://localhost:3228, the four Learn source pages, and the linked Stack visualizer. This is a review and proposed direction; application code was not changed.

The section has a recognizable Magic-inspired identity and a useful topic outline. It does not yet deliver its promise of a guided introduction. It assumes vocabulary before teaching it, compresses several rules incorrectly, and provides little opportunity to make a decision or discover whether you understood the lesson.

## Journey and evidence

Screenshots were captured during this review and inspected from the saved files. Desktop used the existing browser size (1083 by 908 CSS pixels including the scrollbar); phone-width review used 390 by 844. Full-page captures contain the fixed navigation at its capture position and should not be interpreted as a navigation bar permanently interrupting the document.

| Step | Surface | Health | Evidence and finding |
| --- | --- | --- | --- |
| 1 | Learn landing | Needs substantial improvement | [Desktop](01-learn-desktop.png), [mobile](01-learn-mobile.png). Stronger gold-and-charcoal styling than the lessons, but three equally weighted topic cards replace a clear starting action. Intro and cards explain the syllabus before helping someone play. The first lesson begins about 552 pixels down on mobile; the whole page is about 3607 pixels tall. |
| 2 | Basics | High priority | [Desktop](02-basics-desktop.png), [mobile](02-basics-mobile.png). Clear headings, but no illustrated card anatomy, mana payment, opening-hand walkthrough, or battlefield example. Newcomers encounter priority, sorceries and triggers before learning them. The sequential zone arrow implies one path for all cards. |
| 3 | Combat | High priority | [Desktop](03-combat-desktop.png), [mobile](03-combat-mobile.png). Short, readable topic grouping, but no creatures, damage assignment example, or decision to try. The page never demonstrates a normal attack and block before adding keywords. Summoning sickness wording needs correction. |
| 4 | Stack and Priority | High priority | [Desktop](04-stack-desktop.png), [mobile](04-stack-mobile.png). Correct central LIFO concept, but the unnamed A/B example has no effects, targets or observable consequence. It can suggest that the entire stack resolves as one uninterrupted action. Two links repeat the same practice destination. |
| 5 | Practice handoff | Useful foundation, incomplete learning loop | [Desktop](05-practice-desktop.png), [mobile viewport](05-practice-mobile.png). The visualizer supplies an actual spell sequence and playback controls. It lacks a question, learner feedback, completion state and direct return to the lesson. On mobile the explanatory sequence sits below the large visualizer. |
| 6 | Mobile discovery and navigation | Functional with friction | [Menu](06-mobile-menu.png). More → New Players works, but the desktop label is Learn. Lesson controls work on retest. Basics places Next around 1883 pixels down the document, with no local chapter navigation at the top. |

## Highest-impact findings

### P1: Correct the rules before expanding the course

The most consequential statements are in `app/new-players/page.tsx:33` and `:51`, `app/new-players/basics/page.tsx:26`, `app/new-players/combat/page.tsx:26`, and `app/new-players/stack/page.tsx:6`.

- Casting: choose targets during casting, before paying costs; opponents cannot interrupt the casting procedure. Generating mana beforehand is optional, not a requirement.
- Triggers: include “at” as well as “when/whenever”; waiting triggers are stacked before a player receives priority, not when priority is passed.
- Priority: no priority during untap, and usually none during cleanup. Everyone must pass consecutively for one top item to resolve.
- Summoning sickness: concerns continuous control since the start of the controller's latest turn, attacking and tap/untap-symbol abilities; it does not prohibit every way a creature can become tapped.
- Zones: show separate paths for lands, permanent spells and instant/sorcery spells.
- Setup: label format-specific instructions. Choose the starting player before opening hands; distinguish two-player first-turn draw rules from multiplayer.

Verified against the [official Comprehensive Rules](https://media.wizards.com/2026/downloads/MagicCompRules%2020260819.txt), especially 103, 117, 302.6, 305, 601 and 603. Further editorial work should handle exceptions progressively, without making universal claims that later lessons must undo.

### P1: Teach a playable sequence

The course jumps to turn structure without showing how to read or use one card. There are no interactive exercises in the three lessons, no feedback, and no saved learning state. A person can read everything without ever demonstrating that they can pay a cost, choose an attacker, or predict a resolution.

Introduce each idea with a visible table state, one plain-language explanation and one action. Follow the action with a specific explanation of what happened. Make mistakes recoverable and let the learner retry. Keep an optional concise reference view for people who already play.

### P1: Make setup relevant to the user's table

The generic checklist prescribes a 60-card deck and coin flip, while this product supports multiplayer table tooling and the user's group uses a highest-d20 roll-off. Offer an explicit two-player/Commander setup choice; explain the selected format's setup without blending rules. Connect the ready-to-play endpoint to the existing roll-off and tracker. Do not make someone complete a course to reach the tools.

### P2: Bring the lesson presentation up to the landing page

The landing uses the newer panel treatment; lesson pages use the older `arcane-shell`/`arcane-panel` treatment. Their warmer, grainier backgrounds, muted body text and pill controls produce a noticeable visual change. Preserve the dark codex identity, but use one lesson shell, consistent typography and spacing, and a strong primary action.

Measured lesson body copy is 14px and rgb(138, 120, 96). It looks subdued in the inspected dark-theme captures. Use approximately 17–18px lesson copy, a comfortable reading width, brighter instructional text and gold for emphasis. This is a readability finding, not a measured WCAG contrast failure. Use real card examples and purposeful diagrams to explain rules; ornament should support those examples.

### P2: Keep orientation and progress visible

Use consistent Learn naming, a chapter list, estimated lesson lengths, explicit learning goals, and a Continue action. Put a compact Previous/Next area within reach without conflicting with the existing fixed tool navigation. Save completed lessons and the current exercise locally, with a versioned schema and graceful fallback if storage is unavailable. Define success as resuming the same lesson after reload or phone sleep; cross-device progress would need a separate product decision.

Glossary definitions should open inline with keyboard and touch support, so understanding a word does not require leaving the lesson. The current course sends readers out to a full glossary or practice page without retaining a course context.

## Recommended course

| Chapter | The learner does something concrete |
| --- | --- |
| 1. Meet your cards | Inspect a creature card; identify cost, type, power and toughness. |
| 2. Your first spell | Play a land, tap for mana and cast an affordable creature. See why another card is unaffordable. |
| 3. Take a turn | Advance a visible turn rail and make legal choices at each step. |
| 4. Attack and block | Choose an attacker and blocker, predict the outcome, then reveal damage. Add keywords one at a time. |
| 5. Respond to a spell | Choose a response and predict which spell resolves next. Reuse and extend the existing visualizer. |
| 6. Join your first table | Select the format, review setup, use the group's d20 roll-off and open the life tracker. |

Start each chapter with a 2–4 minute target, one outcome and one worked example. The home screen should lead with Start your first game or Resume learning, followed by chapter progress and a smaller reference library. Completion should reflect exercises actually attempted, not scrolling to the bottom. No account requirement is necessary for the first version.

## Implementation order and acceptance criteria

1. Correct the rules and consolidate repeated teaching copy. Have rule-sensitive examples checked against numbered official rules.
2. Build one excellent Basics lesson as the reusable pattern: readable shell, card example, small interaction, feedback, glossary and saved progress.
3. Apply that pattern to combat and stack, including reduced-motion and keyboard alternatives to every animated interaction.
4. Connect format-aware setup, group roll-off and tracker; finish mobile navigation and course completion.

Acceptance should include a first-time player completing a mana-payment task, predicting a simple combat result, and identifying the next stack resolution without coaching. Verify keyboard focus, screen-reader feedback, 200% zoom, phone-width reflow, interrupted-session resume and storage-unavailable behavior. For exercises, test the rule outcomes and state transitions, not the decorative layout.

## Verification and limits

- Inspected all four Learn pages at desktop and phone width, plus the practice destination and mobile menu. Basics and landing had no horizontal document overflow in measured phone-width states. Basics action links measured 48px tall.
- Successfully navigated More → New Players → Basics → Combat → Stack and Priority → Stack Visualizer on retest. Pause changed to Play in the visualizer. This was not an exhaustive test of animation sequencing.
- Early desktop activations of the Basics card and Next link stayed on the same page; direct navigation worked and the later mobile sequence succeeded. Browser error logs and server error log supplied no explanation. Record this as an unresolved intermittent preview observation, not a confirmed production defect or a diagnosed cause.
- The audit used the local preview and matching teaching content in source; it did not verify the deployed site. No physical-phone, real learner, screen-reader or full WCAG audit was performed. Light theme and exhaustive zoom testing remain open.
- No application code, dependencies or production settings were changed. The preview remains available at http://localhost:3228/new-players.
