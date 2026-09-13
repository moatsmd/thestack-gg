'use client'

import { ReactNode } from 'react'
import { DarkModeProvider } from '@/contexts/DarkModeContext'
import { BottomNavBar } from './BottomNavBar'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <DarkModeProvider>
      <div className="min-h-[100dvh] flex flex-col">
        <a href="#main-content" className="skip-link">Skip to content</a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex-1 pb-28 md:pb-12">{children}</main>
        <SiteFooter />
      </div>
      <BottomNavBar />
    </DarkModeProvider>
  )
}
