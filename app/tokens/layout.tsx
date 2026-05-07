import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MTG Token Reference',
  description:
    'Browse every common Magic: The Gathering token \u2014 by color, type, power/toughness, abilities, and the cards that create them.',
  alternates: { canonical: 'https://www.thestack.gg/tokens' },
  openGraph: {
    type: 'website',
    url: 'https://www.thestack.gg/tokens',
    title: 'MTG Token Reference \u00b7 TheStack.gg',
    description:
      'A searchable reference of every common MTG token, by color, type, and source card.',
  },
}

export default function TokensLayout({ children }: { children: React.ReactNode }) {
  return children
}
