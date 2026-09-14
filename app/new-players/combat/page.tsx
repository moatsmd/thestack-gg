import type { Metadata } from 'next'
import { Lesson } from '@/components/learn/Lesson'

export const metadata: Metadata = { title: 'Enter the fray — Learn Magic', alternates: { canonical: '/new-players/combat' } }

export default function Page() { return <Lesson id="combat" /> }
