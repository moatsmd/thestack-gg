import type { BlogPost } from '@/lib/blog'
import { Lede, P, H2, H3, UL, OL, LI, ToolCTA, A, Em, Quote } from '@/components/blog/Prose'

const post: BlogPost = {
  slug: 'commander-damage-tracker-21-rule',
  title: 'Commander Damage Tracker: The 21-Damage Rule, Explained',
  description:
    'How the 21 commander damage rule actually works in Magic, the edge cases that catch tables, and a clean tracker that flags lethal automatically.',
  date: '2026-05-08',
  category: 'Rules',
  readingTime: 8,
  excerpt:
    'A clean explanation of the 21 commander damage rule, the edge cases nobody remembers, and a tracker that flags lethal so the table doesn\u2019t miss it.',
  keyword: 'commander damage tracker 21 rule',
  body: (
    <>
      <Lede>
        Commander damage is the format's signature win condition and the
        statistic groups most often track wrong. The rule is short — a player
        who has been dealt 21 or more combat damage by the same commander loses
        the game — but the edge cases around partners, voltron equipment,
        damage doubling, and indestructibility have caused more than a few
        table arguments. Here is the rule, the corner cases that matter, and
        how to track it without anyone needing a notepad.
      </Lede>

      <H2>The rule itself, in one sentence</H2>
      <Quote attribution="Commander rules, paraphrased">
        A player who has been dealt 21 or more combat damage by the same
        commander over the course of the game loses the game.
      </Quote>
      <P>
        Three words in that sentence do most of the work. <Em>Combat</Em>{' '}
        damage — non-combat damage from a commander does not count.{' '}
        <Em>Same commander</Em> — totals are tracked per commander, not per
        player, and partners count separately. <Em>Over the course of the
        game</Em> — the total persists across blink effects, returning from the
        command zone, and changes of control.
      </P>

      <H2>The edge cases that decide games</H2>

      <H3>Partner commanders track separately</H3>
      <P>
        A player with two partner commanders has two damage tallies against
        each opponent. Either partner reaching 21 against an opponent kills
        them. This means the player on partners is effectively running two
        voltron threats from the table's perspective, and each needs its own
        line on the tracker.
      </P>

      <H3>Trample and infect rules still apply</H3>
      <P>
        Trample damage that lands on the player counts as commander damage.
        Damage from a commander with infect goes to the player as poison
        counters, not as life loss — but combat damage is combat damage, so
        infect damage from a commander still adds to that commander's total
        toward the 21 threshold. A player can theoretically lose to ten
        infect-damage hits and a single normal-damage hit from the same infect
        commander.
      </P>

      <H3>Damage doublers</H3>
      <P>
        Fiendish Hunter-style replacement effects (&ldquo;deals double
        damage&rdquo;) modify the damage event before it happens. The result
        is what counts. A 7/7 commander with a damage-doubler attached deals
        14 damage on a connect, all of which counts toward the commander's
        total.
      </P>

      <H3>Lifelink and damage prevention</H3>
      <P>
        Lifelink does not change the damage event; the commander still dealt
        the printed amount, even though the controller gained life. Prevention
        effects do reduce the actual damage dealt, so prevented damage does
        not count toward the 21 threshold. If the damage was prevented, the
        commander did not deal it.
      </P>

      <H3>Going to the command zone resets nothing</H3>
      <P>
        The most common misconception. A commander returning to the command
        zone does not zero out the damage tally. The next time the same
        commander connects, the count picks up where it left off. Bouncing,
        flickering, and re-casting all leave the totals intact.
      </P>

      <ToolCTA
        href="/tracker"
        title="Auto-flag lethal commander damage"
        body="Each player tile shows commander damage from each opponent in a 3-cell grid. Hit 21 and the tile lights up gold so the table sees lethal at a glance."
        cta="Open the tracker"
      />

      <H2>How tables get this wrong</H2>
      <P>
        Three patterns we see at unfamiliar pods, all preventable.
      </P>
      <UL>
        <LI><Em>The shared notepad</Em> — one player tracking damage for everyone, scribbling tallies in the margin. Works until they make a mistake nobody can audit.</LI>
        <LI><Em>The dice tower</Em> — using d20s on each player's mat to track damage from each opponent. Falls apart when someone bumps the table.</LI>
        <LI><Em>The honor system</Em> — &ldquo;I think I'm at like fifteen?&rdquo; — fine for casual, terrible for cEDH or any game where commander damage is a real win condition.</LI>
      </UL>

      <H2>What a tracker should actually do</H2>
      <OL>
        <LI><Em>Show all incoming commander damage at once</Em> — a 1×3 grid per player, one cell per opponent. No long-press, no sub-menu.</LI>
        <LI><Em>Highlight thresholds</Em> — visually mark anything at or above 21 so the table cannot miss lethal.</LI>
        <LI><Em>Show partner damage separately</Em> — two columns per opponent who runs partners.</LI>
        <LI><Em>Persist across refreshes</Em> — phones go to sleep, browsers crash. The tracker should not.</LI>
        <LI><Em>Undo</Em> — single most-requested feature for any tracker, anywhere.</LI>
      </OL>

      <H3>Why we put commander damage on the front of the tile</H3>
      <P>
        TheStack.gg's <A href="/tracker">life tracker</A> shows the commander
        damage grid by default on every player tile, and turns the tile gold
        the moment any one source hits 21. We tried hiding it behind a
        long-press in v1 and watched two pods miss lethal damage in a single
        evening. Visibility is the whole point of a damage tracker; if you
        have to dig for the number, the number is not doing its job.
      </P>

      <H2>The short version</H2>
      <UL>
        <LI>21 combat damage from the same commander = that player loses.</LI>
        <LI>Partners track separately.</LI>
        <LI>Damage to and from the command zone does not reset the count.</LI>
        <LI>Doublers, trample, and infect all add to the total; prevention does not.</LI>
        <LI>Lifelink does not change what the commander dealt.</LI>
      </UL>
      <P>
        Track it on a tool the whole table can see, flag thresholds visually,
        and stop having the &ldquo;wait, was that lethal?&rdquo; conversation
        on turn nine.
      </P>
    </>
  ),
}

export default post
