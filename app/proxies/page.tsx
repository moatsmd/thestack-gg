import type { Metadata } from 'next'
import { ProxyWorkshop } from '@/components/proxies/ProxyWorkshop'

export const metadata: Metadata = {
  title: 'Proxy Workshop',
  description: 'Prepare a proxy deck: check your list, choose card backs, compare printing estimates, and export an ordering plan.',
  alternates: { canonical: '/proxies' },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function ProxiesPage() { return <ProxyWorkshop /> }
