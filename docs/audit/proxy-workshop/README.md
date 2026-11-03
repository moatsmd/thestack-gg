# Proxy Workshop

Standalone route: `/proxies`. U.S. delivery, USD. No navigation or sitemap entry; route metadata sets robots and Googlebot to `noindex, nofollow`. This is a public URL, not an access-controlled page.

## Delivered

- Plain-text paste / upload, quantity aggregation, section filters, basic-land exclusion, and 1–5 copies. Invalid rows are visible and block exports. Limits: 100 KB, 500 unique rows, 2,000 imported cards.
- Explicit Scryfall review using collection batches of 75, a 550 ms inter-batch pause, cancellation on edits, and a 45-second timeout. Full split/DFC names are looked up by front name and verified against the full response. Exact set/collector hints are checked; wrong names or printings are not silently substituted.
- Three original 1500 × 2100 PNG card-back designs and local PNG/JPEG upload. Real double-faced reverses override generic backs, or each face can become a separate physical card. Split/adventure cards do not inflate counts. Meld/token rows can require manual work.
- PrintMTG / PrintingProxies quantity tiers in integer cents; MPC requires a configuration-specific quote. Shipping and tax remain unknown until entered. Changed quantities, backs, or face settings clear manual quotes.
- TXT list, front/back CSV checklist, JSON setup plan, and back-art download. CSV cells are formula-neutralized. Files are handoff aids, not an image package, MPCFill XML, or completed order.
- Browser-local draft with guarded storage. Uploaded images and manual quotes are deliberately not persisted. Reload requires a fresh card review.

## Price and workflow sources checked 2026-11-03

- https://printmtg.com/ — published non-foil tier schedule, deck-list import, version selection, current no-foil limitation, custom-order returns. The one-card price is not published in the tier table, so it remains unknown.
- https://www.printingproxies.com/ — official indexed page states $2/card, $1.50 at 10+, $1 at 50+, $0.75 at 200+. Direct research fetch was blocked with 403; the comparison links the original site for checkout confirmation.
- https://www.printingproxies.com/how-to-place-an-order/ — official indexed workflow covers deck import, versions, and card backs. Custom uploaded-back support is explicitly left for confirmation.
- https://www.makeplayingcards.com/design/custom-blank-card.html — 63 × 88 mm, individual fronts/backs, stock and finish options, current template/bleed guidance. Dynamic price variants were not mapped reliably; no fabricated MPC estimate.
- https://www.makeplayingcards.com/pay_terms.aspx — customer artwork responsibility and rejection policy.
- https://mpcfill.com/ and https://github.com/chilli-axe/mpc-autofill/releases/ — separate art selection and XML generation workflow; no claim that this app generates MPCFill XML.

## Verification

33 focused Jest assertions passed, including quantity boundaries, malformed imports, duplicate printings, DFC vs split counts, CSV protection, and front-name API lookup without silently accepting the wrong full name.

Full repository suite: **786 passed, 3 opt-in Redis tests skipped**. TypeScript and focused ESLint passed. Production build passed; the existing nine `next/no-img-element` warnings in unrelated components remain.

`smoke.cjs` runs in an isolated Playwright browser context. Evidence in `evidence/result.json` includes live Scryfall lookup, DFC/split counts, sideboard/basic/copy controls, custom-back upload, PNG dimensions, CSV/JSON downloads, published/manual prices, stale quote clearing, saved draft reload, invalid-line blocking, network failure and recovery, noindex, no navigation link, 390px/320px reflow, and light appearance. Screenshots are local audit artifacts. No order was submitted.

PowerShell example (use the Playwright module and browser installed on your machine):

```powershell
$env:PLAYWRIGHT_MODULE = '<path to playwright module>'
$env:PLAYWRIGHT_CHROMIUM = '<path to chromium executable>'
$env:BASE_URL = 'http://127.0.0.1:3227'
node docs/audit/proxy-workshop/smoke.cjs
```

## Limits

The list review does not validate deck legality or provider catalog availability. Exact artwork, bleed/crop, stock, per-card reverse assignment, shipping, taxes, and final proofs must be checked in the provider. No physical print, physical-phone, or screen-reader validation was performed. Prices are dated snapshots and need maintenance as vendors change tiers. No automatic orders, uploads to printers, or infrastructure/database changes are involved.

## Release

Production publication and live verification are recorded after deployment. Existing uncommitted dice-camera and cache-version changes are excluded from this feature commit.
