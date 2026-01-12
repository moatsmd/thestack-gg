'use client'

import { ReactNode } from 'react'
import { DarkModeProvider } from '@/contexts/DarkModeContext'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DarkModeProvider>
      {children}
    </DarkModeProvider>
  )
}
