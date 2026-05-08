/**
 * Blog post registry.
 *
 * Posts are TypeScript modules under content/blog/<slug>.tsx that default-export
 * a `BlogPost` object. We import them eagerly here (small set, build-time
 * resolution) so listings, sitemaps, and static-param generation all share a
 * single source of truth.
 *
 * To add a post:
 *   1. Create content/blog/<slug>.tsx exporting `default: BlogPost`
 *   2. Add the import + entry to `posts` below
 *
 * Posts are sorted by date desc.
 */
import type { ReactNode } from 'react'

import bestLifeCounter from '@/content/blog/best-mtg-life-counter-app-commander'
import trackTheStack from '@/content/blog/how-to-track-the-stack-mtg-priority'
import commanderDamage from '@/content/blog/commander-damage-tracker-21-rule'
import tokenGenerator from '@/content/blog/mtg-token-generator-every-set'
import glossary from '@/content/blog/mtg-glossary-200-terms'
import freeBrowserTools from '@/content/blog/free-browser-mtg-tools-no-install'

export type BlogPost = {
  /** URL slug (matches filename and route segment) */
  slug: string
  /** SEO title — keep under 60 chars, primary keyword first */
  title: string
  /** Meta description — 140-160 chars, action-oriented */
  description: string
  /** ISO-8601 publish date (YYYY-MM-DD) */
  date: string
  /** Optional update date — surface this when an evergreen post is refreshed */
  updated?: string
  /** Editorial section/tag, used in card chips */
  category: string
  /** Reading time in minutes (rough, hand-set) */
  readingTime: number
  /** Hand-written one-liner for card hover/preview */
  excerpt: string
  /** Primary keyword targeted (kept here for SEO bookkeeping, not rendered) */
  keyword: string
  /** Rendered article body */
  body: ReactNode
}

const posts: BlogPost[] = [
  bestLifeCounter,
  trackTheStack,
  commanderDamage,
  tokenGenerator,
  glossary,
  freeBrowserTools,
].sort((a, b) => (a.date < b.date ? 1 : -1))

export function getAllPosts(): BlogPost[] {
  return posts
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return posts.find((p) => p.slug === slug)
}

export function getAllPostSlugs(): string[] {
  return posts.map((p) => p.slug)
}
