'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from './Logo'

const desktopNav = [
  { href: '/tracker', label: 'Tracker' },
  { href: '/toolkit', label: 'Cards' },
  { href: '/glossary', label: 'Glossary' },
  { href: '/stack', label: 'Stack' },
  { href: '/rules', label: 'Rules' },
  { href: '/tokens', label: 'Tokens' },
  { href: '/new-players', label: 'Learn' },
  { href: '/blog', label: 'Codex' },
  { href: '/dice', label: 'Dice' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 backdrop-blur-md transition-colors ${
        scrolled
          ? 'bg-[hsl(220_15%_7%/0.85)] border-b border-[hsl(40_30%_20%/0.6)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 md:px-8 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3"
          data-testid="link-home"
        >
          <Logo size={26} />
          <span className="font-display text-base tracking-wide hidden sm:inline text-[hsl(38_30%_88%)]">
            TheStack<span className="text-[hsl(42_75%_55%/0.7)]">.gg</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm text-[hsl(38_15%_60%)]">
          {desktopNav.map((item) => {
            const active =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded-md transition-colors hover:text-[hsl(38_30%_88%)] hover:bg-[hsl(220_15%_13%/0.7)] ${
                  active ? 'text-[hsl(42_75%_65%)]' : ''
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
