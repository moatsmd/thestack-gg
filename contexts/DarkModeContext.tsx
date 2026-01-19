'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface DarkModeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Load dark mode preference from localStorage
    const stored = localStorage.getItem('manadork-dark-mode')
    setIsDarkMode(stored !== null ? stored === 'true' : true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      // Save to localStorage
      localStorage.setItem('manadork-dark-mode', isDarkMode.toString())

      // Update document class
      if (isDarkMode) {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
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
