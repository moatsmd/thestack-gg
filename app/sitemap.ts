import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

const SITE_URL = 'https://www.thestack.gg'

/**
 * Routes we want indexed. Excludes /share/[id] (per-game ephemeral state) and
 * any /api/* routes. Glossary, rules, tokens are filterable single pages so
 * we list them once \u2014 individual keyword/rule URLs will be added when we
 * introduce those routes in a later phase.
 */
const ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/tracker', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/toolkit', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/stack', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/glossary', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/rules', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/tokens', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/dice', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/new-players', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/new-players/basics', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/new-players/combat', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/new-players/stack', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/blog', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const staticRoutes: MetadataRoute.Sitemap = ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date((post.updated ?? post.date) + 'T12:00:00Z'),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}
