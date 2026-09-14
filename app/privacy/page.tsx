import { GoldRule } from '@/components/Fleuron'

export const metadata = {
  title: 'Privacy',
  description: 'How TheStack.gg uses browser storage, shared-game data, and third-party services.',
}

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 pt-6 md:pt-12">
      <header className="text-center mb-8">
        <div className="flex items-center justify-center"><GoldRule /></div>
        <p className="font-display tracking-[0.16em] uppercase text-xs text-muted-foreground mt-3">In Confidence</p>
        <h1 className="font-display text-gold-gradient text-3xl md:text-5xl mt-3 tracking-wide">Privacy</h1>
      </header>

      <article className="panel codex-glow p-6 md:p-10 font-prose text-base leading-relaxed text-foreground/90 space-y-4">
        <p>You can use TheStack.gg without an account. Local tools save data in your browser; sharing a table, recap, or pod also sends game data to our server.</p>

        <h2 className="font-display tracking-wide text-lg mt-6">Saved on your device</h2>
        <p>Browser storage remembers preferences, local games, your seat credentials and pending table changes, dice history, Learn progress, token quantities, and cached card results. Clearing site data removes these local records and may prevent you from returning to the same shared seat. Private browsing and blocked storage can limit saving.</p>

        <h2 className="font-display tracking-wide text-lg mt-6">When you share a game</h2>
        <p>Shared tables store player names, game state, and changes so devices can stay in sync. Recaps and saved pods store the game information you choose to share. Anyone with the relevant viewing link or join code can access that shared information; keep links and codes within your group and avoid using sensitive personal information as player names.</p>
        <p>The application currently configures shared tables to expire after 24 hours, legacy shared snapshots after 5 hours, recaps after 30 days, and saved pods after 90 days. Updates refresh the expiry for legacy snapshots and saved pods. These are application record lifetimes, not a promise about hosting logs or backups.</p>

        <h2 className="font-display tracking-wide text-lg mt-6">Analytics and third parties</h2>
        <p>The site integrates Vercel Web Analytics and Speed Insights for usage and performance measurement. Custom events can include tool use, card names, search queries, and outbound retailer links. Do not enter private information into card or rules searches.</p>
        <p>Card searches, images, and rulings use Scryfall. Search requests go to its API and are subject to its <a className="underline text-primary" href="https://scryfall.com/docs/privacy" target="_blank" rel="noreferrer">privacy policy</a>. Hosting and external services receive the connection information needed to handle requests. Retailer links take you to those retailers, where their own policies apply.</p>

        <h2 className="font-display tracking-wide text-lg mt-6">Contact</h2>
        <p>For privacy questions, email <a className="underline text-primary" href="mailto:hello@thestack.gg">hello@thestack.gg</a>.</p>
        <p className="text-xs text-muted-foreground pt-4">Last updated: September 14, 2026.</p>
      </article>
    </div>
  )
}
