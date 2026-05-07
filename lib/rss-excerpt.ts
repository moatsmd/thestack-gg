/**
 * Decode common HTML entities to plain text.
 *
 * Covers what shows up in WordPress RSS feeds (Card Kingdom blog):
 * named entities, smart quotes, em/en dashes, and ellipsis. Also unwraps
 * CDATA sections.
 */
export function decodeHtml(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, '\u2019')
    .replace(/&#8216;/g, '\u2018')
    .replace(/&#8220;/g, '\u201C')
    .replace(/&#8221;/g, '\u201D')
    .replace(/&#8211;/g, '\u2013')
    .replace(/&#8212;/g, '\u2014')
    .replace(/&#8230;/g, '\u2026')
    .replace(/&apos;/g, "'")
}

/**
 * Strip HTML from an RSS description and return a short plain-text excerpt
 * suitable for a card preview. WordPress RSS feeds dump full article HTML
 * (img/srcset/figure/p) into the description field, so we have to clean it
 * before rendering.
 */
export function extractExcerpt(html: string, maxLength = 220): string {
  const text = decodeHtml(html)
    // Drop entire <figure>, <script>, <style>, and HTML comments so their
    // inner text doesn't survive tag stripping below.
    .replace(/<figure[\s\S]*?<\/figure>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    // Strip remaining tags.
    .replace(/<[^>]+>/g, ' ')
    // Collapse whitespace.
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  // Truncate at a word boundary, then add an ellipsis.
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).replace(
    /[\s.,;:!?\u2013\u2014-]+$/,
    ''
  ) + '\u2026'
}
