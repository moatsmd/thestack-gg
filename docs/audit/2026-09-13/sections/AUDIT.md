# Remaining sections: audit and implemented improvements

Reviewed and implemented September 13–14, 2026. This continues the approved table-reliability and Learn work. The local production preview is http://localhost:3228. No public deployment was made.

## Flow-by-flow review

1. **Home and navigation.** Replaced empty decorative card outlines with the existing local Forest/Grizzly Bears artwork. Updated tool descriptions for the actual Learn course, dice roll-off and saved token tray. Kept the established dark-and-gold identity. [Before](10-home-before.png) · [After](23-home-after.png).
2. **Cards.** Oversized art pushed Oracle text out of view. The bounded art column now sits alongside details on desktop and stacks on phones. Search/view controls share the site palette. Added a direct card-to-rulings link, correct empty back-face mana/text handling, image dialog semantics, keyboard containment, focus restoration and nested scroll-lock cleanup. Sol Ring search, image Escape/focus return and linked rulings were exercised in the browser. [Before](02-cards-before.png) · [After](17-cards-after.png).
3. **Rules.** Exact `702.1` previously ranked below unrelated references. Exact IDs now rank first, then child rules. Parsing stops before the glossary and excludes section headings. Separate lookup modes use the full page width; result/detail columns no longer duplicate the entire rule as a giant title. Added common-question shortcuts, official source link and distinct initial/no-result states. Browser verified Sol Ring linked lookup and `702.1` as the first selected result. [Before](04-rules-before.png) · [After](18-rules-after.png).
4. **Glossary.** Older keywords were excluded by default, so Banding appeared absent. All three tiers now start enabled, with a clear reset and a note distinguishing frequency from legality. Corrected suspect definitions and examples; removed fabricated Foray, obsolete Substance and unreliable introduction dates. Current collection: 143 entries. Browser verified Banding is found without changing filters. [Before](03-glossary-before.png) · [Mobile after](19-glossary-mobile-after.png).
5. **Tokens.** Added a local saved quantity tray with accessible plus/minus controls, a 999 cap, validated storage, clear/undo and storage-failure feedback. Filtering does not discard the tray. Corrected mixed token variants, abilities and creator links; the 53-entry collection is explicitly curated. Counts are local and do not represent tapped state or synchronize to shared games. Browser added three Treasures, filtered, reloaded, cleared and restored them. [Before](05-tokens-before.png) · [After](16-tokens-after.png) · [320px light mode](21-tokens-light-320-after.png).
6. **Stack.** Starts paused, with previous/next, optional paced playback, reset, current-step narration and a visible life outcome. Playback stops at the end. Reduced-motion preferences are respected. Tighter board space and direct Learn-course link make it easier to follow. Browser reached the final 17-life outcome; tests cover pacing and final-step behavior. [Before](01-stack-before.png) · [Mobile after](22-stack-mobile-after.png).
7. **Codex.** Replaced the token article's unsupported “every token, every set” promise with an accurate guide to common variants and local counts. Corrected Map/explore, Plant, copy-token and ward examples; clarified connection requirements and removed an unsupported testimonial. Preserved article URLs. Escaped existing JSX text so content is included in lint checks. This was a targeted editorial review, not a complete fact-check of every historical or comparative statement in every article. [Before](07-article-before.png) · [After](24-codex-after.png).
8. **Tracker.** Reviewed setup and return-to-table surfaces. Existing development sessions showed the expired/disconnected recovery gate, with reconnect and new-table actions; their saved seats were preserved. This pass did not change synchronization code. The full automated suite covers table recovery, queued operations and seat identity. The earlier reliability audit remains the source of shared-device test evidence. [Setup before](08-tracker-before.png).
9. **Dice.** Reviewed the existing 3D roller and exercised a mobile four-player roll-off: rolls 5, 9, 5, 12 correctly selected Player 4. The recorded round and winner were visible. Adjusted the chooser caption so it also makes sense in the desktop layout. Tie handling remains covered by automated tests. [Before](09-dice-before.png).
10. **About, privacy, terms and settings.** Fixed pale-background/dark-panel combinations and hard-coded text colors, strengthened light-mode primary contrast and global muted dark text, and honored reduced motion across shared animations. Corrected About's font claim and duplicated title. Privacy now describes actual local storage, shared server records, configured expiry and analytics instead of claiming no server data or tracking. Removed the misleading “updated today” footer from Terms. No legal terms were substantively rewritten. [Privacy before](13-privacy-before.png) · [Mobile after](20-privacy-light-mobile-after.png) · [Terms before](14-terms-before.png).

## Verification

- Full Jest suite: **747 passed, 3 skipped**, 75 passing suites. The skipped suite requires an opt-in live Redis service.
- Added regressions were observed failing before the relevant behavior fixes: numbered search/parser boundaries, glossary discovery, controlled Stack playback, token persistence and nested dialog behavior. Final card/dialog group: **30 passed**.
- `npx eslint app components hooks lib content --ext .ts,.tsx`: **0 errors**, 9 existing image-optimization warnings.
- `npm run build`: successful production build, including TypeScript validation.
- `git diff --check`: passed.
- Restarted the production preview on port 3228. All 11 audited route URLs returned HTTP 200; the final production token page was verified in the browser with enabled tray controls and no reported browser console errors.
- Desktop browser inspection plus 390px and 320px responsive checks. No horizontal overflow in the measured mobile glossary, token and Stack flows or group roll-off. Dark mode restored and viewport override removed.
- Independent final code review found focus capture, nested scroll-lock and light token contrast issues; all three were corrected, with failing-then-passing dialog regressions.
- Screenshots are real browser captures. Two transitional captures were rejected and excluded. Earlier before images are desktop only; mobile images document the completed changes rather than a mobile before/after comparison.

## Boundaries and follow-up

- No physical phone sleep/wake, Safari, low-end GPU or field performance verification in this pass. An expired local in-memory session after a server restart is not proof of a phone reconnection failure.
- Token counts stay within one browser origin; no cross-tab merge or shared-player token board is claimed.
- Reference text is concise teaching material, with targeted corrections detailed in [CONTENT-REVIEW.md](CONTENT-REVIEW.md). Use current Oracle text and official rules for exact interactions. `example-review.json` records candidate anomalies, including partial-name lookup false positives; it is not a list of confirmed errors.
- Existing article comparisons and historical claims deserve a separate sourced editorial pass. Device sleep/wake and low-end dice animation remain the highest-value physical-device checks before public release.

## Run it

Development: `npm run dev -- -p 3227 -H 0.0.0.0` (uses `.next-dev`). Production preview: `npm run build`, then `npm run start -- -p 3228 -H 0.0.0.0` (uses `.next`). Do not reuse port 3219. Reload existing previews to load the current build.
