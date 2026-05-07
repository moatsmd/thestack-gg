import { GoldRule } from '@/components/Fleuron'

export const metadata = {
  title: 'Terms | TheStack.gg',
  description: 'Terms of use for TheStack.gg.',
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-[hsl(38_15%_60%)] mt-3">House Rules</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Terms</h1>
      </header>

      <article className="panel codex-glow p-6 md:p-10 font-prose text-base leading-relaxed text-[hsl(38_30%_88%)]/90 space-y-4">
        <p>TheStack.gg is provided as-is for the love of Magic: The Gathering and the people who play it. By using the site, you agree to the following.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">Use</h3>
        <p>The tools here are intended as a convenience for casual and competitive play. They are not an official rules arbiter. For tournament rulings, consult the comprehensive rules and a head judge.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">Intellectual Property</h3>
        <p>Magic: The Gathering, including card names, artwork, and rules, is © Wizards of the Coast. TheStack.gg is unaffiliated with Wizards of the Coast. Card data is provided by Scryfall and credited accordingly.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">Liability</h3>
        <p>The site is offered without warranty. We are not responsible for misplays, missed triggers, or misread cards.</p>

        <h3 className="font-display tracking-wide text-lg text-[hsl(38_30%_88%)] mt-6">Changes</h3>
        <p>We may update these terms as the project evolves.</p>

        <p className="text-xs text-[hsl(38_15%_60%)] pt-4">Last updated: today.</p>
      </article>
    </div>
  )
}
