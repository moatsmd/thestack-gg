# Site fonts

Cinzel, IM Fell English, and Cormorant Garamond are distributed under the SIL Open Font License. Their original license/copyright notices are included alongside these files.

These are the same unmodified WOFF2 assets emitted by the site's successful Next.js 15.5.25 local production build on 2026-11-03. Latin, Latin Extended, Cyrillic, Cyrillic Extended, and Vietnamese subsets are retained where supplied; `app/fonts.css` preserves the generated weight/style/unicode ranges and fallback metrics. File names were made descriptive; font contents were not modified.

Upstream families and licenses:

- https://github.com/google/fonts/tree/main/ofl/cinzel
- https://github.com/google/fonts/tree/main/ofl/imfellenglish
- https://github.com/google/fonts/tree/main/ofl/cormorantgaramond

Vendoring removes the build's dependency on Google Fonts responses. The production build previously failed when Next's Google loader expected a filename extension on an extensionless font URL, matching https://github.com/vercel/next.js/pull/100277. This preserves existing typography without a framework upgrade or a patched dependency.
