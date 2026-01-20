'use client'

import { ReactNode } from 'react'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { BottomNavBar } from './BottomNavBar'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DarkModeProvider>
      <div className="pb-nav min-h-screen">
        {children}
      </div>
      <BottomNavBar />
    </DarkModeProvider>
  )
}
