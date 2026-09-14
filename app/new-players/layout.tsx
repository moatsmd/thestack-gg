import { LearnProvider } from '@/components/learn/LearnProvider'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return <LearnProvider>{children}</LearnProvider>
}
