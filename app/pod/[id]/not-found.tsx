import Link from 'next/link'
import { GoldRule } from '@/components/Fleuron'

export default function PodNotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 pt-16 text-center">
      <div className="flex items-center justify-center"><GoldRule /></div>
      <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">
        Pod not found
      </p>
      <h1 className="font-display text-gold-gradient text-3xl md:text-4xl mt-3 tracking-wide">
        This pod has expired or never existed
      </h1>
      <p className="font-prose text-[hsl(38_30%_88%)]/80 mt-3">
        Pods stay live for 90 days past their most recent game. Track a new pod
        and start a fresh history.
      </p>
      <Link
        href="/tracker"
        className="inline-block mt-6 px-5 py-2.5 bg-[hsl(42_75%_55%)] text-[hsl(220_15%_7%)] rounded-md font-medium hover-elevate"
      >
        Open the tracker \u2192
      </Link>
    </div>
  )
}
