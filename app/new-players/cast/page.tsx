import type { Metadata } from 'next'
import { Lesson } from '@/components/learn/Lesson'

export const metadata: Metadata = { title: 'Cast your first spell — Learn Magic', alternates: { canonical: '/new-players/cast' } }

export default function Page() { return <Lesson id="cast" /> }
