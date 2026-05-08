/**
 * Prose primitives for blog posts.
 *
 * Each post body assembles itself from these. Centralizing the styling here
 * lets every post inherit codex aesthetic (drop-caps, gold-gradient headings,
 * obsidian surfaces) without duplicating className soup in every file.
 */
import Link from 'next/link'
import type { ReactNode } from 'react'

export function Lede({ children }: { children: ReactNode }) {
  return (
    <p className="drop-cap font-prose text-lg md:text-xl leading-snug text-[hsl(38_30%_88%)]/90">
      {children}
    </p>
  )
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="font-prose text-base md:text-lg leading-relaxed text-[hsl(38_30%_88%)]/85 mt-4">
      {children}
    </p>
  )
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-gold-gradient text-2xl md:text-3xl tracking-wide mt-10 mb-3">
      {children}
    </h2>
  )
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3 className="font-display text-[hsl(38_30%_88%)] text-xl md:text-2xl tracking-wide mt-7 mb-2">
      {children}
    </h3>
  )
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="font-prose text-base md:text-lg leading-relaxed text-[hsl(38_30%_88%)]/85 mt-3 space-y-1.5 pl-5 list-disc marker:text-primary/70">
      {children}
    </ul>
  )
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="font-prose text-base md:text-lg leading-relaxed text-[hsl(38_30%_88%)]/85 mt-3 space-y-1.5 pl-5 list-decimal marker:text-primary/70 marker:font-display">
      {children}
    </ol>
  )
}

export function LI({ children }: { children: ReactNode }) {
  return <li>{children}</li>
}

export function Quote({ children, attribution }: { children: ReactNode; attribution?: string }) {
  return (
    <blockquote className="my-6 panel p-5 md:p-6 border-l-2 border-primary/40">
      <p className="font-prose italic text-base md:text-lg leading-relaxed text-[hsl(38_30%_88%)]/90">
        {children}
      </p>
      {attribution && (
        <footer className="font-display tracking-[0.14em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">
          — {attribution}
        </footer>
      )}
    </blockquote>
  )
}

/**
 * Internal CTA card pointing readers at one of the toolkit pages.
 * Keep the prose factual; the panel does the visual lifting.
 */
export function ToolCTA({
  href,
  title,
  body,
  cta = 'Open',
}: {
  href: string
  title: string
  body: string
  cta?: string
}) {
  return (
    <aside className="my-8 panel codex-glow panel-gilded p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
      <div className="flex-1">
        <p className="font-display tracking-[0.14em] uppercase text-xs text-primary/80">
          From the toolkit
        </p>
        <h4 className="font-display text-gold-gradient text-lg md:text-xl tracking-wide mt-1">
          {title}
        </h4>
        <p className="font-prose text-sm md:text-base text-[hsl(38_30%_88%)]/80 mt-1">
          {body}
        </p>
      </div>
      <Link
        href={href}
        className="px-4 py-2 bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md font-medium hover-elevate font-display tracking-wide text-sm whitespace-nowrap"
      >
        {cta}
      </Link>
    </aside>
  )
}

/** Inline link to another page on the site. Use for keyword-rich anchor text. */
export function A({
  href,
  children,
  external = false,
}: {
  href: string
  children: ReactNode
  external?: boolean
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary underline-offset-4 hover:underline"
      >
        {children}
      </a>
    )
  }
  return (
    <Link
      href={href}
      className="text-primary underline-offset-4 hover:underline"
    >
      {children}
    </Link>
  )
}

/** Strong emphasis without resorting to bare `<strong>` for tone consistency. */
export function Em({ children }: { children: ReactNode }) {
  return (
    <strong className="text-[hsl(38_40%_92%)] font-display tracking-wide">
      {children}
    </strong>
  )
}
