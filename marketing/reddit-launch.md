# Reddit Launch Posts

These are launch posts for TheStack.gg, drafted for three subreddits. The voice is mine (the creator). Every post leads with a real problem, then mentions the tool, then closes with a transparent disclosure. No pretending to be a user. No sockpuppets.

**Posting cadence:**

- Stagger one post per subreddit, not all on the same day.
- Suggested order: r/Magicdeckbuilding (Mon), r/EDH (Wed), r/magicTCG (Fri).
- Reply to every comment for the first 48 hours.
- If a post is removed, message mods first to ask why before reposting.

**Subreddit rules to verify before posting** (rules change):

- r/magicTCG: no direct self-promo on a young account; long-form posts with substance are fine. Disclose if you built the thing.
- r/EDH: self-promo allowed if it's useful and disclosed; mods enforce a "rule of one" on tool spam.
- r/Magicdeckbuilding: tools welcomed if they help deckbuilding; lead with utility.

---

## r/magicTCG

**Title:** I rebuilt our pod's life tracker after we missed a commander damage kill. Free, browser-only.

**Body:**

Couple months back our pod missed a commander damage kill because the tracker we were using buried the damage count behind a long-press menu. The player who needed to see "17 from Korvold" did not know to long-press. Korvold attacked again, dealt 5, and nobody noticed it was lethal until two turns later.

I'd been thinking about building a Commander tracker for a while and that night pushed me into doing it. The constraint I set was: every piece of state that decides games has to be visible without tapping into a sub-menu. Commander damage on the front of the tile, in a 1×3 grid (one cell per opponent). Poison, monarch, initiative, and the rest one tap away. Big touch targets. Undo. State persists through a refresh.

It's free, browser-only (no install), and works offline once it loads. No account. Open it on any tablet and the table can play a game in fifteen seconds.

There's other stuff on the site too — a stack visualizer for layered triggers, a 200+ term glossary, a token generator filtered by set, basic dice. The tracker is the piece I'd actually defend.

[https://www.thestack.gg/tracker](https://www.thestack.gg/tracker)

I'd genuinely value feedback — what's missing, what's wrong, what does your pod need that no current tracker handles. The site is what it is right now, but I'm in the codebase every week and the wishlist is open.

**Disclosure:** I built it. It's free, no ads, no sign-up, no affiliate links inside the tracker itself. There are TCGplayer affiliate links on the card lookup page (single tag, fully disclosed), which is the only revenue source on the site so far.

---

## r/EDH

**Title:** Free browser commander damage tracker that flags 21 automatically (and a couple other tools)

**Body:**

If your pod has ever missed a 21-commander-damage kill because the tracker buried the count behind a long-press, this might help. I built a free browser-based life tracker built specifically for the Commander format:

- Commander damage in a 3-cell grid on every player tile, visible by default — no long-press to see the number.
- Tile lights up gold the moment any one source hits 21 so the table can't miss lethal.
- Partner commanders track separately (two columns per opponent who runs partners).
- Poison, monarch, initiative, and ETB counters one tap away.
- Long-press to set a specific life total (Necropotence, Phyrexian Arena turn three, etc.).
- Undo button — single most-requested feature for any tracker.
- State persists through accidental refreshes.
- Works offline after first load (PWA).

No account, no sign-up, no ads inside the tracker. Open it on a shared tablet, set up a four-player pod in fifteen seconds, run the game.

[https://www.thestack.gg/tracker](https://www.thestack.gg/tracker)

The same site has a stack visualizer (useful when three triggers and a counterspell are in the air), a 200-term glossary, a token generator filtered by set, and a dice roller. None of them are deckbuilders — Moxfield and Archidekt have that covered and they're great.

**Disclosure:** I built it. It's a side project, no ads on the tracker, only revenue is a TCGplayer affiliate tag on the card lookup page (disclosed inline). Genuinely curious what your pod is missing — happy to take feature requests in the comments.

---

## r/Magicdeckbuilding

**Title:** Free token generator (filtered by set), card lookup with click-through keyword glossary, and a stack visualizer

**Body:**

I've been building a small toolkit for the moments around deckbuilding that the big sites don't quite handle. Three of them might be useful here:

**Token generator** ([thestack.gg/tokens](https://www.thestack.gg/tokens)) — filter by type across every set. When I'm building a Treasure deck I want to know exactly which Treasure printings exist and what art is available; when I'm building a token-go-wide deck I want to see all the Soldier and Spirit variants in one place. Faster than scrolling Scryfall.

**Card lookup with keyword click-through** ([thestack.gg/toolkit](https://www.thestack.gg/toolkit)) — when the oracle text mentions a keyword you're not sure about, the keyword is clickable straight to a definition with reminder text and rules references. Useful when you're brewing in a color or archetype you don't usually play.

**Stack visualizer** ([thestack.gg/stack](https://www.thestack.gg/stack)) — niche, but if you've ever debated with yourself about whether your Doubling Season + token-trigger combo actually works the way you think (replacement effect, doesn't go on the stack — Doubling Season is fine), being able to lay out the interaction visually helps.

The site is browser-only, no install, no sign-up. Free.

For deckbuilding itself I still recommend Moxfield, Archidekt, MTGGoldfish — those are purpose-built and great. This isn't a deckbuilder, it's the cluster of small tools I wished lived next to my deckbuilder.

[https://www.thestack.gg](https://www.thestack.gg)

**Disclosure:** I built it. It's free. The card lookup page has TCGplayer affiliate links (disclosed inline). I'd value feedback on what would actually help your deckbuilding workflow.
