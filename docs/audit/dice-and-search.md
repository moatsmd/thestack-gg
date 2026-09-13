# Dice and card search improvements — 2026-09-13

## Dice experience

- Replaced the rotating SVG silhouette with a lazily loaded Three.js WebGL scene. The display uses actual tetrahedral, cubic, octahedral, pentagonal trapezohedral, dodecahedral, and icosahedral solids.
- Gold face inscriptions, d6 pips, complementary opposite-face numbering, resin marbling, clearcoat, warm/cool lighting, an environment map, a felt tray, and cast shadows establish depth while retaining TheStack's gold/obsidian character.
- Dice tumble and bounce along controlled cinematic trajectories, then land on the requested numbered face. This is a choreographed animation, **not a rigid-body physics simulation**. Outcomes come from the dice rules before the visual presentation.
- d100 uses a tens/units pair. `00 + 0` represents 100; all outcomes from 1 through 100 are verified.
- A single canvas handles the entire throw. Rendering stops at rest. Pixel ratio is capped, resize is observed, and geometry, materials, textures, shadow targets, environment maps, and renderer resources are disposed on exit.
- Reduced-motion users get immediate outcomes. If WebGL is unavailable or its context is lost, a readable simple dice view preserves all functions. The fallback is explicitly labeled.
- Added an accessible dice-pool mode for touch devices; right-click queuing remains supported. A throw can contain up to eight dice, including sixteen physical meshes when all eight are percentile pairs. Every mesh settles before the result announcement.

## Who goes first?

- Free roll and roll-off modes share the tray. The roll-off supports 2–8 editable player names, rolls one d20 per player on the current device, and continues only with players tied at the highest value.
- Original player colors persist through tiebreakers. Every round remains visible, and the winner is announced clearly.
- `/dice?players=<URL-encoded JSON string array>` imports tracker names and enters roll-off mode. Reloading the same imported names retains the saved result.
- A new roll-off resets rounds without losing player names. Blank names become `Player N` at the first throw.
- Results, the last ten free rolls, and roll-off rounds are saved to `thestack-dice-v2`. Stored rounds are replay-validated before use. Corrupt records or blocked storage leave a working experience.
- Roll IDs have a fallback for HTTP LAN origins where `crypto.randomUUID()` is unavailable.
- Roll-off outcomes are shared on this device; the feature does not imply simultaneous per-phone rolling.

## Card search

- The browser audit reproduced `Sol Ring` displaying `Solemn Offering`. The previous implementation always selected the first Scryfall result. Exact card names now take precedence over earlier substring matches, while advanced search syntax stays unchanged.
- Search, autocomplete, and pagination responses carry generation checks so an older request cannot replace or append to a newer query.
- Query edits immediately clear the previous card; submission uses the latest input even within one React update batch.
- Selecting a suggestion searches immediately. Pending autocomplete cannot reopen the dropdown after submission. The input now exposes combobox expansion and highlighted-option semantics.

## Verification

- Card search: **63 tests passed**, including nine new reproduced failures for exact names, stale response ordering, suggestion submission, and dropdown behavior.
- Dice and existing fixture suites: **91 tests passed** across eight focused suites. This includes saved winner recovery, repeated ties, blank names, malformed saved records, HTTP UUID fallback, reduced motion, and delayed result disclosure.
- `node --test scripts/test-dice-geometry.mjs`: **6 checks passed**, covering real face counts, every face landing, tetrahedron support, and complementary numbering. Run this with Node 24; its automatic ES module detection may emit a harmless package-type warning.
- `npx tsc --noEmit --pretty false`: **passed** after filling missing baseline test fixture fields.
- Targeted lint passed. Root audit owns the definitive full-suite/build result and desktop/mobile visual evidence.

## Primary API references

- [Three.js MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
- [Three.js Quaternion](https://threejs.org/docs/pages/Quaternion.html)
- [Three.js CanvasTexture](https://threejs.org/docs/pages/CanvasTexture.html)
- [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [Three.js PMREMGenerator](https://threejs.org/docs/pages/PMREMGenerator.html)
- [Three.js RoomEnvironment](https://threejs.org/docs/pages/RoomEnvironment.html)
