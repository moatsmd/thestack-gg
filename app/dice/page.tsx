import type { Metadata } from 'next'
import { DiceRoller } from '@/components/DiceRoller'

export const metadata: Metadata = {
  title: 'Dice — ManaDork',
  description: 'Roll any MTG dice type — d4, d6, d8, d10, d12, d20, d100.',
}

export default function DicePage() {
  return <DiceRoller />
}
