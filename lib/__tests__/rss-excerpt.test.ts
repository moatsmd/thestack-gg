import { extractExcerpt, decodeHtml } from '../rss-excerpt'

describe('extractExcerpt', () => {
  it('strips img and figure markup completely', () => {
    const html = `<p><img width="100" height="56" src="https://example.com/x.jpg" srcset="..." /></p>
<figure class="wp-block-image"><img src="https://example.com/y.png" /><figcaption><a href="...">Caption text</a></figcaption></figure>
<p>The actual lede sentence is here.</p>`
    const out = extractExcerpt(html)
    expect(out).not.toMatch(/<[^>]+>/) // no tags
    expect(out).not.toMatch(/srcset/)
    expect(out).not.toMatch(/wp-content/)
    expect(out).toContain('The actual lede sentence is here.')
  })

  it('decodes HTML entities (curly quotes, ampersands, em-dashes)', () => {
    const html =
      '<p>Pro Tour &#8211; the world&#8217;s best players &amp; their decks.</p>'
    const out = extractExcerpt(html)
    expect(out).toBe(
      'Pro Tour \u2013 the world\u2019s best players & their decks.'
    )
  })

  it('unwraps CDATA', () => {
    const html = '<![CDATA[<p>Inside CDATA &amp; tags.</p>]]>'
    expect(extractExcerpt(html)).toBe('Inside CDATA & tags.')
  })

  it('truncates at a word boundary with an ellipsis', () => {
    const long = '<p>' + 'word '.repeat(100) + '</p>'
    const out = extractExcerpt(long, 50)
    expect(out.length).toBeLessThanOrEqual(51)
    expect(out.endsWith('\u2026')).toBe(true)
    expect(out).not.toMatch(/word$/) // no trailing partial word
  })

  it('returns short text untouched', () => {
    expect(extractExcerpt('<p>Short.</p>')).toBe('Short.')
  })

  it('collapses whitespace from messy HTML', () => {
    const html = '<p>One.</p>\n\n<p>  Two.   </p>\n<p>\tThree.</p>'
    expect(extractExcerpt(html)).toBe('One. Two. Three.')
  })

  it('handles a real Card Kingdom-style payload end-to-end', () => {
    const real = `<p><img width="100" height="56" src="https://blog.cardkingdom.com/wp-content/uploads/2026/05/img.jpg" class="attachment-post-thumbnail size-post-thumbnail wp-post-image" alt="" decoding="async" srcset="https://blog.cardkingdom.com/wp-content/uploads/2026/05/img.jpg 100w, https://blog.cardkingdom.com/wp-content/uploads/2026/05/img-2.jpg 300w" sizes="(max-width: 100px) 100vw, 100px" /></p>
<p><!-- wp:paragraph --></p>
<p>One interesting thing about competitive <em>Magic</em> compared to seasonal sports competition is that not all event weeks are created equal.</p>
<p><!-- /wp:paragraph --></p>`
    const out = extractExcerpt(real)
    expect(out).not.toMatch(/srcset|wp-content|<|>/)
    expect(out.startsWith('One interesting thing about competitive')).toBe(true)
  })

  it('decodeHtml leaves plain text untouched', () => {
    expect(decodeHtml('No entities here.')).toBe('No entities here.')
  })
})
