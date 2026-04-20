import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Stack — ManaDork',
  description: 'How MTG stack and priority work, explained simply.',
}

export default function StackPage() {
  return (
    <div className="min-h-screen arcane-shell text-[var(--ink)] transition-colors">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

        {/* Header */}
        <header className="arcane-panel mana-border rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.5em] text-[var(--muted)]">Reference</p>
          <h1 className="mt-2 text-3xl font-bold text-[var(--ink)]">The Stack</h1>
          <p className="mt-2 text-[var(--muted)]">
            Spells and abilities go on the stack. They resolve in reverse order —
            <strong className="text-[var(--ink)]"> last in, first out</strong> (LIFO).
          </p>
        </header>

        {/* LIFO Diagram */}
        <section className="arcane-panel mana-border rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-[var(--ink)]">How the Stack Works</h2>
          <div className="flex flex-col items-center gap-1 py-4">
            {[
              { label: 'Spell C', note: '← resolves first', color: 'bg-[var(--accent-1)]' },
              { label: 'Spell B', note: '', color: 'bg-[var(--accent-2)]/70' },
              { label: 'Spell A', note: '← cast first', color: 'bg-[var(--surface-2)]' },
            ].map(({ label, note, color }) => (
              <div key={label} className="flex items-center gap-3 w-full max-w-xs">
                <div
                  className={`flex-1 px-4 py-3 rounded-lg ${color} text-[var(--ink)] font-semibold text-center`}
                >
                  {label}
                </div>
                {note && (
                  <span className="text-xs text-[var(--muted)] whitespace-nowrap">{note}</span>
                )}
              </div>
            ))}
            <div className="mt-3 text-xs text-[var(--muted)] text-center">
              ▲ New spells added on top · Resolved from the top down ▲
            </div>
          </div>
        </section>

        {/* Priority Flow */}
        <section
          className="arcane-panel mana-border rounded-2xl p-6 space-y-4"
          data-testid="priority-flow"
        >
          <h2 className="text-lg font-bold text-[var(--ink)]">Priority Flow</h2>
          <p className="text-[var(--muted)] text-sm">
            Before anything on the stack resolves, each player must pass priority in turn order.
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="px-3 py-2 rounded-lg bg-[var(--accent-1)] text-white">Active Player</span>
            <span className="text-[var(--muted)]">→</span>
            <span className="px-3 py-2 rounded-lg bg-[var(--surface-2)] text-[var(--ink)]">Each other player (in turn order)</span>
            <span className="text-[var(--muted)]">→</span>
            <span className="px-3 py-2 rounded-lg bg-[var(--accent-1)]/50 text-[var(--ink)]">Back to Active Player</span>
          </div>
          <p className="text-sm text-[var(--muted)]">
            When all players pass priority in succession without adding to the stack, the top item resolves. Then priority restarts.
          </p>
        </section>

        {/* Key Rules */}
        <section
          className="arcane-panel mana-border rounded-2xl p-6 space-y-3"
          data-testid="key-rules"
        >
          <h2 className="text-lg font-bold text-[var(--ink)]">Key Rules</h2>
          <ul className="space-y-2 text-sm text-[var(--muted)]">
            <li className="flex gap-2">
              <span className="text-[var(--accent-2)] font-bold mt-0.5">•</span>
              <span>Both players receive priority before anything resolves — either can respond.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent-2)] font-bold mt-0.5">•</span>
              <span>
                <strong className="text-[var(--ink)]">Split second</strong>: no spells or activated abilities can be added to the stack while a split-second spell is on it. Triggered abilities still trigger.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent-2)] font-bold mt-0.5">•</span>
              <span>
                <strong className="text-[var(--ink)]">Mana abilities</strong> don't use the stack — they resolve immediately with no response window.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent-2)] font-bold mt-0.5">•</span>
              <span>
                <strong className="text-[var(--ink)]">State-based actions</strong> (creature at 0 toughness, player at 0 life, etc.) are not stack items — they happen automatically before any player receives priority.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent-2)] font-bold mt-0.5">•</span>
              <span>
                Hexproof and shroud protect from targeted spells and abilities, but <em>not</em> from triggered abilities that don't target.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--accent-2)] font-bold mt-0.5">•</span>
              <span>
                You can respond to your own spells — add another spell or ability to the stack before the first one resolves.
              </span>
            </li>
          </ul>
        </section>

        {/* Common Scenarios */}
        <section
          className="arcane-panel mana-border rounded-2xl p-6 space-y-4"
          data-testid="scenarios"
        >
          <h2 className="text-lg font-bold text-[var(--ink)]">Common Scenarios</h2>
          <div className="space-y-4 text-sm">
            <div className="border-l-2 border-[var(--accent-1)] pl-4">
              <p className="font-semibold text-[var(--ink)] mb-1">Opponent casts Counterspell on your spell</p>
              <p className="text-[var(--muted)]">
                Counterspell goes on top of your spell. You still have priority — you can cast another spell or ability before the Counterspell resolves. If you do nothing, Counterspell resolves first and counters your spell.
              </p>
            </div>
            <div className="border-l-2 border-[var(--accent-2)] pl-4">
              <p className="font-semibold text-[var(--ink)] mb-1">A triggered ability goes on the stack</p>
              <p className="text-[var(--muted)]">
                The trigger goes on the stack and both players receive priority before it resolves. Either player can add more spells or abilities in response.
              </p>
            </div>
            <div className="border-l-2 border-[var(--surface-2)] pl-4">
              <p className="font-semibold text-[var(--ink)] mb-1">You cast two spells in a row</p>
              <p className="text-[var(--muted)]">
                The second spell goes on top of the first. Your second spell resolves first, then your first spell resolves.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
