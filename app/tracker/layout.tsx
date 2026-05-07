import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MTG Life Tracker',
  description:
    'A beautiful, free Magic: The Gathering life tracker. Track life, commander damage, poison, mana, and energy across two to four players \u2014 in your browser, no install required.',
  alternates: { canonical: 'https://www.thestack.gg/tracker' },
  openGraph: {
    type: 'website',
    url: 'https://www.thestack.gg/tracker',
    title: 'MTG Life Tracker \u00b7 TheStack.gg',
    description:
      'Track life, commander damage, poison, and mana for two to four players. Free, mobile-friendly, dark-mode by default.',
  },
}

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  return children
}
