import type { Metadata } from 'next'
import { Lesson } from '@/components/learn/Lesson'

export const metadata: Metadata = { title: 'Take your seat — Learn Magic', alternates: { canonical: '/new-players/table' } }

export default function Page() { return <Lesson id="table" /> }
