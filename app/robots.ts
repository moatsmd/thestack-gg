import type { MetadataRoute } from 'next'

const SITE_URL = 'https://www.thestack.gg'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // ephemeral, user-specific, or backend routes \u2014 not useful in search
        disallow: ['/api/', '/share/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
