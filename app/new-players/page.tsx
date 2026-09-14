import type { Metadata } from 'next'
import { LearnHome } from '@/components/learn/LearnHome'

export const metadata: Metadata = { title: 'Learn Magic', description: 'Learn Magic through six short, interactive lessons. Read cards, cast spells, explore combat and the stack, then join your first table.', alternates: { canonical: '/new-players' } }

export default function LearnPage() { return <LearnHome /> }
