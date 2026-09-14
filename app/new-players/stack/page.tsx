import type { Metadata } from 'next'
import { Lesson } from '@/components/learn/Lesson'

export const metadata: Metadata = { title: 'Have the last word — Learn Magic', alternates: { canonical: '/new-players/stack' } }

export default function Page() { return <Lesson id="stack" /> }
