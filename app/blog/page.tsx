import Link from 'next/link'
import type { Metadata } from 'next'
import { Fleuron, GoldRule } from '@/components/Fleuron'
import { getAllPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'The Codex — Articles & Guides | TheStack.gg',
  description:
    'Long-form guides for Magic: The Gathering players — Commander damage, the stack, life trackers, tokens, glossary, and the best free browser tools.',
  alternates: { canonical: 'https://www.thestack.gg/blog' },
  openGraph: {
    title: 'The Codex — Articles & Guides | TheStack.gg',
    description:
      'Long-form guides for Magic: The Gathering players — Commander damage, the stack, life trackers, tokens, glossary, and the best free browser tools.',
    url: 'https://www.thestack.gg/blog',
    type: 'website',
  },
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00Z')
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-24">
      <header className="text-center mb-10">
        <div className="flex items-center justify-center">
          <GoldRule />
        </div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">
          The Codex
        </p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">
          Articles &amp; Guides
        </h1>
        <p className="font-prose text-base md:text-lg text-[hsl(38_30%_88%)]/80 mt-4 max-w-2xl mx-auto">
          Field notes from the workshop — practical guides for Commander, the stack,
          token economies, and the moments around the table that need a clean tool.
        </p>
        <div className="flex items-center justify-center mt-6">
          <Fleuron />
        </div>
      </header>

      <ul className="grid gap-5 md:grid-cols-2">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="panel codex-glow p-6 md:p-7 block h-full hover-elevate"
              data-testid={`link-post-${post.slug}`}
            >
              <p className="font-display tracking-[0.14em] uppercase text-[10px] md:text-xs text-primary/80">
                {post.category}
              </p>
              <h2 className="font-display text-gold-gradient text-xl md:text-2xl tracking-wide mt-2">
                {post.title}
              </h2>
              <p className="font-prose text-base text-[hsl(38_30%_88%)]/80 mt-3 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="flex items-center gap-3 mt-5 font-display tracking-[0.12em] uppercase text-[10px] text-[hsl(38_15%_60%)]">
                <span>{formatDate(post.date)}</span>
                <span aria-hidden="true">•</span>
                <span>{post.readingTime} min read</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
