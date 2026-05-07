// Generates public/brand/* — SVG masters + PNG exports for the affiliate program
// and other off-site placements.
//
// Run with `node scripts/build-brand-assets.mjs`.
//
// Outputs:
//   public/brand/mark.svg                (transparent mark, square)
//   public/brand/mark-512.png            (transparent)
//   public/brand/mark-1024.png           (transparent)
//   public/brand/mark-on-dark-1024.png   (mark on the codex obsidian board)
//   public/brand/wordmark.svg            (horizontal mark + word, transparent)
//   public/brand/wordmark-1200.png       (transparent)
//   public/brand/wordmark-on-dark-1200.png

import { mkdir, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT = join(__dirname, '..', 'public', 'brand')

// ----- Shared SVG fragments --------------------------------------------------

const defs = `
  <defs>
    <linearGradient id="ts-gold" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(45 85% 78%)" />
      <stop offset="55%" stop-color="hsl(42 75% 58%)" />
      <stop offset="100%" stop-color="hsl(38 65% 38%)" />
    </linearGradient>
    <linearGradient id="ts-gold-soft" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(45 75% 70%)" stop-opacity="0.85" />
      <stop offset="100%" stop-color="hsl(38 60% 40%)" stop-opacity="0.85" />
    </linearGradient>
    <linearGradient id="ts-card-fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(220 18% 13%)" />
      <stop offset="100%" stop-color="hsl(220 22% 8%)" />
    </linearGradient>
    <radialGradient id="ts-ember" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0%" stop-color="hsl(45 95% 80%)" />
      <stop offset="55%" stop-color="hsl(42 80% 58%)" />
      <stop offset="100%" stop-color="hsl(38 70% 40%)" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="ts-board" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="hsl(220 22% 11%)" />
      <stop offset="100%" stop-color="hsl(220 28% 6%)" />
    </linearGradient>
  </defs>
`

// ----- The mark -------------------------------------------------------------
//
// Design: three cards rising on the stack, fanned slightly so they overlap
// and read as a single object. Top card has a small framed inner border (the
// codex feel) and an ember at its upper-right corner — the priority pip.
//
// The cards are large and use generous portion of the canvas so the mark is
// legible at favicon sizes (16-32px) and reads as "stacked cards" at hero
// sizes. Tuned on a 64x64 grid for finer control than the original 32x32.

const markGroup = `
  <!-- Bottom card — laid back, leaning left -->
  <g transform="rotate(-13 32 44) translate(0 0)">
    <rect x="13" y="29" width="38" height="26" rx="3"
          fill="url(#ts-card-fill)" stroke="url(#ts-gold-soft)"
          stroke-width="1.6" />
  </g>
  <!-- Middle card — square to viewer -->
  <g>
    <rect x="14" y="20" width="36" height="28" rx="3"
          fill="url(#ts-card-fill)" stroke="url(#ts-gold)"
          stroke-width="1.8" />
  </g>
  <!-- Top card — leaning slightly right, the freshest spell on the stack -->
  <g transform="rotate(11 32 22)">
    <rect x="18" y="9" width="28" height="28" rx="3"
          fill="url(#ts-card-fill)" stroke="url(#ts-gold)"
          stroke-width="2.2" />
    <rect x="22" y="13" width="20" height="20" rx="1.6"
          fill="none" stroke="url(#ts-gold)"
          stroke-width="0.9" stroke-opacity="0.5" />
  </g>
  <!-- Ember — the priority pip, tucked against the upper-right of the top card -->
  <circle cx="50" cy="9" r="5.6" fill="url(#ts-ember)" />
  <circle cx="50" cy="9" r="2" fill="hsl(48 95% 88%)" />
`

// Square mark — 64x64 design grid, exported into 0..64 viewBox.
const markSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="512" height="512">
  ${defs}
  ${markGroup}
</svg>`

// ----- The wordmark ---------------------------------------------------------
//
// Horizontal lockup — the cascade mark on the left, "TheStack.gg" set in
// Cinzel (the same display face used on the live site hero). 1200x300
// (4:1) reads cleanly in headers and most affiliate-program directories.
//
// Coordinate space: 480x120 design grid. Mark sits in 16..104 (88px tall);
// text starts at x=128 with cap-height aligned to the mark's center. Cinzel
// is an all-caps display face by design, so we use the brand casing the
// site already uses (`TheStack.gg`) — Cinzel renders mixed case just fine,
// it just keeps caps-style proportions throughout.

const wordmarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="1200" height="300">
  ${defs}
  <g transform="translate(16 16)">
    <svg viewBox="0 0 64 64" x="0" y="0" width="88" height="88" overflow="visible">
      ${markGroup}
    </svg>
  </g>
  <text x="122" y="80"
        font-family="Cinzel, 'EB Garamond', 'DejaVu Serif', 'Liberation Serif', Garamond, 'Times New Roman', serif"
        font-size="44" font-weight="600" letter-spacing="1.2"
        fill="url(#ts-gold)">TheStack<tspan fill="url(#ts-gold)" opacity="0.62">.gg</tspan></text>
</svg>`

// ----- On-dark variants -----------------------------------------------------

function onDark(innerSvgFragment, w, h) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    ${defs}
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#ts-board)" />
    ${innerSvgFragment}
  </svg>`
}

const markOnDarkSvg = onDark(
  `<g transform="translate(${(1024 - 720) / 2} ${(1024 - 720) / 2}) scale(${720 / 64})">
     ${markGroup}
   </g>`,
  1024,
  1024
)

// On-dark wordmark: same internal layout, scaled into 1200x300 directly so
// the obsidian board fills the canvas at native pixel size.
const wordmarkOnDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 120" width="1200" height="300">
  ${defs}
  <rect x="0" y="0" width="480" height="120" fill="url(#ts-board)" />
  <g transform="translate(16 16)">
    <svg viewBox="0 0 64 64" x="0" y="0" width="88" height="88" overflow="visible">
      ${markGroup}
    </svg>
  </g>
  <text x="122" y="80"
        font-family="Cinzel, 'EB Garamond', 'DejaVu Serif', 'Liberation Serif', Garamond, 'Times New Roman', serif"
        font-size="44" font-weight="600" letter-spacing="1.2"
        fill="url(#ts-gold)">TheStack<tspan fill="url(#ts-gold)" opacity="0.62">.gg</tspan></text>
</svg>`

// ----- Rasterizer -----------------------------------------------------------
//
// rsvg-convert (librsvg) handles SVG gradients, filters, and embedded fonts
// far more faithfully than ImageMagick. We render at the requested width and
// preserve transparency.

function rasterize(svg, outPath, width) {
  const tmp = join(
    tmpdir(),
    `brand-${Date.now()}-${Math.random().toString(36).slice(2)}.svg`
  )
  writeFileSync(tmp, svg)
  try {
    execFileSync(
      'rsvg-convert',
      ['-w', String(width), '-f', 'png', '-o', outPath, tmp],
      { stdio: 'inherit' }
    )
  } finally {
    try {
      unlinkSync(tmp)
    } catch {}
  }
}

async function main() {
  await mkdir(OUT, { recursive: true })

  // SVG masters
  await writeFile(join(OUT, 'mark.svg'), markSvg)
  await writeFile(join(OUT, 'wordmark.svg'), wordmarkSvg)
  await writeFile(join(OUT, 'mark-on-dark.svg'), markOnDarkSvg)
  await writeFile(join(OUT, 'wordmark-on-dark.svg'), wordmarkOnDarkSvg)

  // PNG exports
  rasterize(markSvg, join(OUT, 'mark-512.png'), 512)
  rasterize(markSvg, join(OUT, 'mark-1024.png'), 1024)
  rasterize(markOnDarkSvg, join(OUT, 'mark-on-dark-1024.png'), 1024)
  rasterize(wordmarkSvg, join(OUT, 'wordmark-1200.png'), 1200)
  rasterize(wordmarkOnDarkSvg, join(OUT, 'wordmark-on-dark-1200.png'), 1200)

  console.log('[brand] wrote SVG + PNG exports to public/brand/')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
