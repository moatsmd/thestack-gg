import type { BlogPost } from '@/lib/blog'
import { Lede, P, H2, H3, UL, OL, LI, ToolCTA, A, Em, Quote } from '@/components/blog/Prose'
import { ManaSymbol } from '@/components/ManaSymbol'

const post: BlogPost = {
  slug: 'mtg-token-generator-every-set',
  title: 'MTG Tokens: A Practical Guide for Your Table',
  description:
    'A practical guide to common MTG tokens and their variants. How to track Treasures, Clues, Food, Blood, and the rest without losing the board.',
  date: '2026-05-08',
  category: 'Tools',
  readingTime: 7,
  excerpt:
    'Treasures, Clues, Food, Blood, and the rest \u2014 a practical guide to tracking MTG tokens at the table without losing count.',
  keyword: 'mtg token generator every set',
  body: (
    <>
      <Lede>
        Tokens used to be the side dish of Magic. They are now half the meal.
        A typical Commander game generates Treasures from one player, Clues
        from another, Soldiers in waves of three, and a Beast or two from
        whichever green deck is at the table. The official tokens are
        beautiful and you almost never have them. This is a practical guide
        to managing tokens at the table — what kinds exist, what each one
        does, and how to track them without filling your playmat with a
        chaotic mound of cardboard.
      </Lede>

      <H2>The five most common tokens, and what they do</H2>

      <H3>Treasure</H3>
      <P>
        A colorless artifact token with &ldquo;<ManaSymbol symbol="{T}" />, sacrifice this token:
        Add one mana of any color.&rdquo; Treasures are the format&apos;s universal
        ramp and fixing — every artifact deck makes them, every reanimator
        deck loves them, and every cEDH game has a player at six Treasures
        looking dangerous. Track Treasures with a count, not individual
        tokens. Nobody needs sixteen pebbles on their side of the table.
      </P>

      <H3>Clue</H3>
      <P>
        A colorless artifact with &ldquo;<ManaSymbol symbol="{2}" />, sacrifice this token: Draw a
        card.&rdquo; Investigators turn Clues into card advantage. Clues are
        slower than Treasures (two mana plus the sac) but they stockpile, and
        a five-Clue board is a reliable late-game engine.
      </P>

      <H3>Food</H3>
      <P>
        A colorless artifact with &ldquo;<ManaSymbol symbol="{2}" />, <ManaSymbol symbol="{T}" />, sacrifice this
        token: You gain 3 life.&rdquo; Food shines in life-matters strategies
        and when you need life in a pinch. Ordinary Food tokens are not creatures and cannot block. Tracking is similar to
        Treasures and Clues — a single counter per player suffices unless
        Food synergies care about individual tokens.
      </P>

      <H3>Blood</H3>
      <P>
        A colorless artifact with &ldquo;<ManaSymbol symbol="{1}" />, <ManaSymbol symbol="{T}" />, discard a card,
        sacrifice this token: Draw a card.&rdquo; Blood is rummage-flavored
        — useful for graveyard decks and any plan that wants to cycle the
        top of a hand. Innistrad: Crimson Vow tokens introduced these and
        they have stuck around because rummage at instant speed is rare.
      </P>

      <H3>Map</H3>
      <P>
        A colorless artifact that lets a creature explore. Maps
        printed in Lost Caverns of Ixalan and follow-up sets read &ldquo;<ManaSymbol symbol="{1}" />,
        <ManaSymbol symbol="{T}" />, sacrifice this token: Target creature you control
        explores. Activate only as a sorcery.&rdquo; Track Maps individually only if you have an
        explore-matters payoff. Otherwise a count works.
      </P>

      <ToolCTA
        href="/tokens"
        title="Find a token. Keep the count."
        body="Browse common variants, check their source cards, and save quantities in a token tray on this browser."
        cta="Open token tray"
      />

      <H2>Creature tokens worth knowing by sight</H2>
      <UL>
        <LI><Em>Soldier</Em> — 1/1 white, the Magic baseline. Anointed Procession decks live here.</LI>
        <LI><Em>Spirit</Em> — 1/1 white flying, common in white-blue tempo and Orzhov go-wide.</LI>
        <LI><Em>Zombie</Em> — 2/2 black. Modern printings sometimes vary; check the source card.</LI>
        <LI><Em>Beast</Em> — 3/3 green. Made by cards such as Garruk Wildspeaker.</LI>
        <LI><Em>Plant</Em> — Often 0/1 green, as with Avenger of Zendikar. Check the source for other variants.</LI>
        <LI><Em>Goblin</Em> — 1/1 red, sometimes 1/1 with relevant text.</LI>
        <LI><Em>Knight</Em> — 2/2 white with vigilance, sometimes other variants.</LI>
        <LI><Em>Elemental</Em> — power and toughness vary wildly; always check the source.</LI>
      </UL>

      <H2>Tokens with rules-text traps</H2>
      <P>
        Most tokens are simple. A few read closer to a creature card and trip
        people up.
      </P>

      <H3>Treasures vs. Gold</H3>
      <P>
        Gold tokens (older sets) and Treasure tokens (modern) both produce
        mana when sacrificed, but Gold reads &ldquo;sacrifice this artifact:
        Add one mana of any color&rdquo; with no tap. The tap cost matters when a token is tapped or becomes a creature with summoning sickness; they are also
        legally distinct for things that care about &ldquo;Treasure
        token&rdquo; specifically.
      </P>

      <H3>Similar bodies, different creature types</H3>
      <P>
        Spirit tokens can differ in color, size, and abilities. Lingering Souls
        creates 1/1 white Spirits with flying; Meloku the Clouded Mirror creates
        1/1 blue Illusions with flying. Read the creating effect before grouping
        similar-looking creatures together.
      </P>

      <H3>Copies are token copies</H3>
      <P>
        An effect that creates a token copy makes a token, even when the original
        is a card. Follow its targeting restrictions: Esika&apos;s Chariot can
        copy a token you control, not an arbitrary nontoken creature. A token
        that leaves the battlefield ceases to exist the next time state-based
        actions are checked.
      </P>

      <H2>How to actually track them at the table</H2>
      <OL>
        <LI><Em>Counters for stockpilers</Em> — Treasures, Clues, Food, Blood, Maps. A single number per player is faster than a heap of tokens.</LI>
        <LI><Em>Cards for combat tokens</Em> — Soldiers, Spirits, Beasts. You need to physically tap and untap them. Use real tokens or a stack of basic lands as proxies.</LI>
        <LI><Em>One token, multiple purposes</Em> — a Beast and a Spirit are different. Don&apos;t share a single proxy for both.</LI>
        <LI><Em>Read the source</Em> — keep tokens with different colors, abilities, counters, or tapped states separate. A quantity alone cannot represent all of those differences.</LI>
      </OL>

      <H2>Why a token tool helps</H2>
      <P>
        TheStack.gg&apos;s <A href="/tokens">token reference and tray</A> covers a
        curated selection of common variants. Filter by name, color, or type,
        then add quantities to your saved tray. Counts stay on this browser;
        they are not shared with a tracker table. Use physical markers for
        tapped state, counters, and distinct creatures.
      </P>
      <P>
        For variants outside this collection, use
        {' '}<A href="https://scryfall.com/search?q=t%3Atoken" external>Scryfall&apos;s token search</A>
        {' '}and the creating card&apos;s current Oracle text. The tray is a
        quantity aid, not a complete catalog or printable token generator.
      </P>
    </>
  ),
}

export default post
