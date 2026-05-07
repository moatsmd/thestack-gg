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
        <SiteHeader />
        <main className="flex-1 pb-28 md:pb-12">{children}</main>
        <SiteFooter />
      </div>
      <BottomNavBar />
    </DarkModeProvider>
  )
}
