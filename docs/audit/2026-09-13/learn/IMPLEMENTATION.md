# Learn course implementation

The approved review is implemented as a six-chapter interactive course at `/new-players`. The production preview was rebuilt, restarted on port 3228, and verified with HTTP 200 and the new course heading. No deployment or push was performed.

## Delivered

- Real card imagery, a redesigned course home, consistent chapter navigation, readable lesson copy, and light/dark responsive styling.
- Six exercises: identify card stats, play a land and pay for a spell, walk through a turn, predict combat, respond and resolve the stack, and prepare a first game.
- Progress and intermediate exercise state saved after each action. Reload resumes mana taps and stack resolution. Invalid data is sanitized, unavailable storage has a visible fallback, and visiting a chapter does not complete it.
- Duel and four-player Commander setup, a prefilled group d20 handoff, and a link to existing tracker setup. The tracker link does not configure or overwrite an existing game.
- Inline keyboard-operable definitions, polite feedback announcements, rules links, local card assets with artist credits, route metadata and sitemap entries.
- Existing Learn URLs retained. Mobile navigation now calls the section Learn. The standalone stack visualizer links back to the course.

## Verification

| Check | Result |
| --- | --- |
| Full Jest suite | 733 passed, 3 opt-in Redis tests skipped; 74 suites passed |
| Learn tests after final edits | 18 passed across model and component suites |
| TypeScript | `npx tsc --noEmit` passed |
| Lint | Passed; existing image warnings outside Learn remain |
| Final production build | Passed; all seven Learn routes prerendered |
| Production preview | Port 3228 listener and HTTP 200 with new heading verified; course opened in browser |
| Independent code review | Mana feedback, sideways tapping, live turn feedback and persisted-state validation findings fixed; no remaining material issue reported |

Browser checks completed all six exercises. Wrong answers and insufficient mana showed feedback; a reload retained tapped lands, and a reload between stack resolutions preserved the next action. Four-player Commander setup opened Dice in Who goes first mode with four players. Desktop and phone screenshots were inspected; the combat layout had no horizontally overflowing main-content elements at 320px. Light styling and opening/closing a definition with Enter were checked. The production preview uses a separate browser origin from development, so it starts with fresh course progress.

Screenshots are in [after](after/), including course home, desktop basics, mobile casting, turn completion, combat, stack and light-mode basics. Full-page captures can place the fixed site navigation in the middle of the stitched image; that is a capture artifact rather than document-flow content.

## Boundaries

- Progress is local to this browser and origin, not account or cross-device synchronization.
- These are deliberately scoped teaching scenarios, not a complete Magic rules engine. Format-specific details and exceptions are introduced in lesson copy and linked references.
- Physical phone sleep/resume, VoiceOver or other screen readers, actual 200% browser zoom, and real novice playtesting were not performed. Reduced-motion CSS was reviewed, but browser media emulation was not exercised.
- Art is bundled locally with attribution. No new runtime dependencies were added.

## Run again

Use `npm run build`, then `npm run start -- -p 3228 -H 0.0.0.0`. Stop the identified existing preview process before restarting. Development uses port 3227 and `.next-dev`; production uses `.next`. Keep port 3219 untouched.
