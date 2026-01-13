'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useDarkMode } from '@/contexts/DarkModeContext'

export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={toggleMenu}
        className="p-2 text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition"
        aria-label="Menu"
        aria-expanded={isOpen}
        data-testid="hamburger-button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeMenu}
            data-testid="menu-backdrop"
          />

          {/* Menu Panel */}
          <nav
            className="fixed top-0 right-0 h-full w-64 bg-gray-900 shadow-xl z-50 border-l border-gray-700"
            data-testid="hamburger-menu"
          >
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Menu</h2>
              <button
                type="button"
                onClick={closeMenu}
                className="p-2 text-white hover:text-gray-300 transition"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="py-4">
              <Link
                href="/"
                onClick={closeMenu}
                className="block px-6 py-3 text-white hover:bg-gray-800 transition"
              >
                🏠 Home
              </Link>
              <Link
                href="/tracker"
                onClick={closeMenu}
                className="block px-6 py-3 text-white hover:bg-gray-800 transition"
              >
                ❤️ Life Tracker
              </Link>
              <Link
                href="/toolkit"
                onClick={closeMenu}
                className="block px-6 py-3 text-white hover:bg-gray-800 transition"
              >
                🔍 Card Lookup
              </Link>
              <Link
                href="/rules"
                onClick={closeMenu}
                className="block px-6 py-3 text-white hover:bg-gray-800 transition"
              >
                Card Rulings
              </Link>

              {/* Dark Mode Toggle */}
              <div className="border-t border-gray-700 mt-4 pt-4">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="flex items-center justify-between w-full px-6 py-3 text-white hover:bg-gray-800 transition"
                  data-testid="dark-mode-toggle"
                >
                  <span className="flex items-center gap-2">
                    {isDarkMode ? '🌙' : '☀️'} Dark Mode
                  </span>
                  <div
                    className={`relative w-12 h-6 rounded-full transition ${
                      isDarkMode ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        isDarkMode ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </>
      )}
    </>
  )
}
