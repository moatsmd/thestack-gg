import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dice Roller for MTG',
  description:
    'A clean, dark-mode dice roller for Magic: The Gathering \u2014 d4, d6, d8, d10, d12, d20, d100. Roll for first player, planar dice, anything.',
  alternates: { canonical: 'https://www.thestack.gg/dice' },
  openGraph: {
    type: 'website',
    url: 'https://www.thestack.gg/dice',
    title: 'MTG Dice Roller \u00b7 TheStack.gg',
    description:
      'Roll d4 through d100 for Magic: The Gathering. Mobile-friendly, dark-mode by default.',
  },
}

export default function DiceLayout({ children }: { children: React.ReactNode }) {
  return children
}
