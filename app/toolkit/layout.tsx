import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MTG Card Lookup',
  description:
    'Search any Magic: The Gathering card. Oracle text, rulings, format legality, mana cost, and price \u2014 powered by Scryfall, polished for mobile play.',
  alternates: { canonical: 'https://www.thestack.gg/toolkit' },
  openGraph: {
    type: 'website',
    url: 'https://www.thestack.gg/toolkit',
    title: 'MTG Card Lookup \u00b7 TheStack.gg',
    description:
      'Look up any MTG card \u2014 oracle text, rulings, legality, prices. Fast, free, and right at hand.',
  },
}

export default function ToolkitLayout({ children }: { children: React.ReactNode }) {
  return children
}
