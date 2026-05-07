import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MTG Keyword Glossary',
  description:
    'Every Magic: The Gathering keyword and ability \u2014 evergreen, returning, and retired \u2014 with reminder text, examples, and the year each was introduced.',
  alternates: { canonical: 'https://www.thestack.gg/glossary' },
  openGraph: {
    type: 'website',
    url: 'https://www.thestack.gg/glossary',
    title: 'MTG Keyword Glossary \u00b7 TheStack.gg',
    description:
      'Searchable, filterable glossary of every keyword and ability in Magic: The Gathering.',
  },
}

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children
}
