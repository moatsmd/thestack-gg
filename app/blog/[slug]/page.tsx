import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Fleuron, GoldRule } from '@/components/Fleuron'
import { getAllPostSlugs, getPostBySlug, getAllPosts } from '@/lib/blog'

type Params = { slug: string }

export function generateStaticParams(): Params[] {
  return getAllPostSlugs().map((slug) => ({ slug }))
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const post = getPostBySlug(params.slug)
  if (!post) return {}
  const url = `https://www.thestack.gg/blog/${post.slug}`
  return {
    title: `${post.title} | TheStack.gg`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  }
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

export default function BlogPostPage({ params }: { params: Params }) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  // JSON-LD Article schema for richer Search result rendering
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: { '@type': 'Organization', name: 'TheStack.gg' },
    publisher: {
      '@type': 'Organization',
      name: 'TheStack.gg',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.thestack.gg/brand/mark-512.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.thestack.gg/blog/${post.slug}`,
    },
  }

  // Pull two related posts (newest other posts) for the bottom block
  const related = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2)

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-12 pb-20">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-6">
        <Link
          href="/blog"
          className="font-display tracking-[0.14em] uppercase text-xs text-[hsl(38_15%_60%)] hover:text-primary transition-colors"
        >
          ← The Codex
        </Link>
      </nav>

      <header className="text-center mb-8">
        <div className="flex items-center justify-center">
          <GoldRule />
        </div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">
          {post.category}
        </p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-3 mt-5 font-display tracking-[0.12em] uppercase text-[10px] md:text-xs text-[hsl(38_15%_60%)]">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.updated && post.updated !== post.date && (
            <>
              <span aria-hidden="true">•</span>
              <span>Updated {formatDate(post.updated)}</span>
            </>
          )}
          <span aria-hidden="true">•</span>
          <span>{post.readingTime} min read</span>
        </div>
      </header>

      <article className="panel codex-glow panel-gilded p-6 md:p-10">
        {post.body}
        <div className="flex items-center justify-center mt-10">
          <Fleuron />
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-12">
          <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] text-center">
            Continue reading
          </p>
          <ul className="grid gap-5 md:grid-cols-2 mt-4">
            {related.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="panel p-5 block h-full hover-elevate"
                >
                  <p className="font-display tracking-[0.14em] uppercase text-[10px] text-primary/80">
                    {p.category}
                  </p>
                  <h3 className="font-display text-[hsl(38_30%_88%)] text-lg tracking-wide mt-2">
                    {p.title}
                  </h3>
                  <p className="font-prose text-sm text-[hsl(38_30%_88%)]/75 mt-2">
                    {p.excerpt}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
