import { GoldRule } from '@/components/Fleuron'

export const metadata = {
  title: 'Privacy | TheStack.gg',
  description: 'TheStack.gg respects your privacy — no accounts, no tracking, no ads.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">In Confidence</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Privacy</h1>
      </header>

      <article className="panel codex-glow p-6 md:p-10 font-prose text-base leading-relaxed text-[hsl(38_30%_88%)]/90 space-y-4">
        <p>TheStack.gg is built to respect your privacy. We do not require accounts and we do not store personal data on our servers.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">What we collect</h3>
        <p>We do not collect personally identifiable information. Anonymous, aggregated traffic metrics may be used to keep the site running smoothly.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">Cookies & storage</h3>
        <p>The site uses minimal browser storage to remember your preferences (such as theme). It does not use third-party tracking cookies.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">Third-party services</h3>
        <p>Card data is fetched directly from Scryfall&apos;s public API. By using Card Lookup, your queries are sent to Scryfall and are subject to their privacy policy.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">Contact</h3>
        <p>Questions about privacy? Reach out via our community channels in the footer.</p>

        <p className="text-xs text-[hsl(38_15%_60%)] pt-4">Last updated: today.</p>
      </article>
    </div>
  )
}
