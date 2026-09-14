import type { Metadata } from 'next'
import { Lesson } from '@/components/learn/Lesson'

export const metadata: Metadata = { title: 'Find your rhythm — Learn Magic', alternates: { canonical: '/new-players/turn' } }

export default function Page() { return <Lesson id="turn" /> }
