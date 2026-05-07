import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Stack \u2014 How Magic\u2019s Spell Sequencing Works',
  description:
    'Last in, first out. A clear, animated walkthrough of how the stack works in Magic: The Gathering \u2014 spells, abilities, priority, and resolution.',
  alternates: { canonical: 'https://www.thestack.gg/stack' },
  openGraph: {
    type: 'article',
    url: 'https://www.thestack.gg/stack',
    title: 'How the Stack Works in MTG \u00b7 TheStack.gg',
    description:
      'An animated, plain-English explainer of the MTG stack: spells, abilities, priority, and resolution.',
  },
}

export default function StackLayout({ children }: { children: React.ReactNode }) {
  return children
}
