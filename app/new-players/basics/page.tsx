import type { Metadata } from 'next'
import { Lesson } from '@/components/learn/Lesson'

export const metadata: Metadata = { title: 'Meet your cards — Learn Magic', alternates: { canonical: '/new-players/basics' } }

export default function Page() { return <Lesson id="basics" /> }
