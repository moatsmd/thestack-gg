import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MTG Comprehensive Rules',
  description:
    'The complete Magic: The Gathering Comprehensive Rules \u2014 searchable, mobile-friendly, kept current with the latest WotC release.',
  alternates: { canonical: 'https://www.thestack.gg/rules' },
  openGraph: {
    type: 'website',
    url: 'https://www.thestack.gg/rules',
    title: 'MTG Comprehensive Rules \u00b7 TheStack.gg',
    description:
      'Search the full Magic: The Gathering rulebook. Always up to date, always at hand.',
  },
}

export default function RulesLayout({ children }: { children: React.ReactNode }) {
  return children
}
