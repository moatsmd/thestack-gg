'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useDarkMode } from '@/contexts/DarkModeContext'
import { useWakeLock } from '@/hooks/useWakeLock'

const navItems = [
  { href: '/', label: 'Home', icon: 'home' },
  { href: '/tracker', label: 'Tracker', icon: 'heart' },
  { href: '/toolkit', label: 'Cards', icon: 'search' },
  { href: '/stack', label: 'Stack', icon: 'layers' },
]

const moreItems = [
  { href: '/glossary', label: 'Keywords', icon: 'book' },
  { href: '/rules', label: 'Rules', icon: 'document' },
  { href: '/new-players', label: 'New Players', icon: 'compass' },
]

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const iconClass = `w-6 h-6 ${className || ''}`

  switch (icon) {
    case 'home':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    case 'heart':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    case 'search':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    case 'layers':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    case 'book':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    case 'document':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    case 'compass':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    case 'more':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
        </svg>
      )
    case 'sun':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'moon':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    case 'screen':
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    default:
      return null
  }
}

export function BottomNavBar() {
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const pathname = usePathname()
  const { isDarkMode, toggleDarkMode } = useDarkMode()
  const { isSupported: isWakeLockSupported, isActive: isWakeLockActive, toggle: toggleWakeLock } = useWakeLock()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  const isMoreActive = moreItems.some((item) => isActive(item.href))

  return (
    <>
      {/* More Menu Overlay */}
      {isMoreOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMoreOpen(false)}
            data-testid="more-menu-backdrop"
          />
          <div
            className="fixed bottom-16 left-0 right-0 mx-4 mb-2 bg-[var(--surface-1)] border border-[var(--ink)]/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            data-testid="more-menu"
          >
            <div className="p-2">
              {moreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                    isActive(item.href)
                      ? 'bg-[var(--accent-1)] text-white'
                      : 'text-[var(--ink)] hover:bg-[var(--surface-2)]'
                  }`}
                >
                  <NavIcon icon={item.icon} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Dark Mode Toggle */}
              <button
                type="button"
                onClick={toggleDarkMode}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-[var(--ink)] hover:bg-[var(--surface-2)] transition"
                data-testid="dark-mode-toggle"
              >
                <span className="flex items-center gap-3">
                  <NavIcon icon={isDarkMode ? 'moon' : 'sun'} />
                  <span className="font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </span>
                <div
                  className={`relative w-10 h-5 rounded-full transition ${
                    isDarkMode ? 'bg-[var(--accent-1)]' : 'bg-[var(--muted)]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                      isDarkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              {/* Screen Wake Lock Toggle */}
              {isWakeLockSupported && (
                <button
                  type="button"
                  onClick={toggleWakeLock}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-[var(--ink)] hover:bg-[var(--surface-2)] transition"
                  data-testid="wake-lock-toggle"
                >
                  <span className="flex items-center gap-3">
                    <NavIcon icon="screen" />
                    <span className="font-medium">Keep Screen On</span>
                  </span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition ${
                      isWakeLockActive ? 'bg-[var(--accent-1)]' : 'bg-[var(--muted)]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        isWakeLockActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Bottom Navigation Bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 bg-[var(--surface-1)] border-t border-[var(--ink)]/10 safe-area-pb bottom-nav"
        data-testid="bottom-nav"
      >
        <div className="flex items-center justify-around h-full max-w-lg mx-auto px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition ${
                isActive(item.href)
                  ? 'text-[var(--accent-1)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <NavIcon icon={item.icon} className={isActive(item.href) ? 'scale-110' : ''} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          ))}

          {/* More Button */}
          <button
            type="button"
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition ${
              isMoreOpen || isMoreActive
                ? 'text-[var(--accent-1)]'
                : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
            aria-label="More options"
            aria-expanded={isMoreOpen}
            data-testid="more-button"
          >
            <NavIcon icon="more" className={isMoreOpen ? 'scale-110' : ''} />
            <span className="text-xs mt-1 font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  )
}
