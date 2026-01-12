'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Load dark mode preference from localStorage
    const stored = localStorage.getItem('manadork-dark-mode')
    if (stored !== null) {
      setIsDarkMode(stored === 'true')
    }
  }, [])

  useEffect(() => {
    if (isMounted) {
      // Save to localStorage
      localStorage.setItem('manadork-dark-mode', isDarkMode.toString())

      // Update document class
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [isDarkMode, isMounted])

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}
