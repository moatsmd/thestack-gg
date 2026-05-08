import type { BlogPost } from '@/lib/blog'
import { Lede, P, H2, H3, UL, OL, LI, ToolCTA, A, Em, Quote } from '@/components/blog/Prose'

const post: BlogPost = {
  slug: 'mtg-token-generator-every-set',
  title: 'MTG Token Generator: Every Token, Every Set',
  description:
    'A practical guide to MTG tokens — predefined and custom — across every set. How to track Treasures, Clues, Food, Blood, and the rest without losing the board.',
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
        A colorless artifact token with &ldquo;{`{T}`}, sacrifice this token:
        Add one mana of any color.&rdquo; Treasures are the format's universal
        ramp and fixing — every artifact deck makes them, every reanimator
        deck loves them, and every cEDH game has a player at six Treasures
        looking dangerous. Track Treasures with a count, not individual
        tokens. Nobody needs sixteen pebbles on their side of the table.
      </P>

      <H3>Clue</H3>
      <P>
        A colorless artifact with &ldquo;{`{2}`}, sacrifice this token: Draw a
        card.&rdquo; Investigators turn Clues into card advantage. Clues are
        slower than Treasures (two mana plus the sac) but they stockpile, and
        a five-Clue board is a reliable late-game engine.
      </P>

      <H3>Food</H3>
      <P>
        A colorless artifact with &ldquo;{`{2}`}, {`{T}`}, sacrifice this
        token: You gain 3 life.&rdquo; Food shines in life-matters strategies
        and as a chump-block-then-eat substitute. Tracking is similar to
        Treasures and Clues — a single counter per player suffices unless
        Food synergies care about individual tokens.
      </P>

      <H3>Blood</H3>
      <P>
        A colorless artifact with &ldquo;{`{1}`}, {`{T}`}, discard a card,
        sacrifice this token: Draw a card.&rdquo; Blood is rummage-flavored
        — useful for graveyard decks and any plan that wants to cycle the
        top of a hand. Innistrad: Crimson Vow tokens introduced these and
        they have stuck around because rummage at instant speed is rare.
      </P>

      <H3>Map</H3>
      <P>
        A colorless artifact that lets a creature scry and explore. Maps
        printed in Lost Caverns of Ixalan and follow-up sets read &ldquo;{`{1}`},
        {`{T}`}, sacrifice this token: Target creature you control
        explores.&rdquo; Track Maps individually only if you have an
        explore-matters payoff. Otherwise a count works.
      </P>

      <ToolCTA
        href="/tokens"
        title="Generate any token"
        body="Filter by type \u2014 Treasure, Clue, Food, Blood, Map, Soldier, Zombie, and the rest. Drop the right token onto the table without leafing through a binder."
        cta="Open token generator"
      />

      <H2>Creature tokens worth knowing by sight</H2>
      <UL>
        <LI><Em>Soldier</Em> — 1/1 white, the Magic baseline. Anointed Procession decks live here.</LI>
        <LI><Em>Spirit</Em> — 1/1 white flying, common in white-blue tempo and Orzhov go-wide.</LI>
        <LI><Em>Zombie</Em> — 2/2 black. Modern printings sometimes vary; check the source card.</LI>
        <LI><Em>Beast</Em> — 3/3 green. Garruk, Avenger of Zendikar, every green deck.</LI>
        <LI><Em>Plant</Em> — 0/2 green defender, mostly for chumping or sacrifice fodder.</LI>
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
        Add one mana of any color&rdquo; with no tap. Practically identical;
        legally distinct for things that care about &ldquo;Treasure
        token&rdquo; specifically.
      </P>

      <H3>Spirit vs. Spirit-with-flying</H3>
      <P>
        Older spirit tokens were 1/1 colorless. Most modern spirit tokens are
        1/1 white with flying. If a card says &ldquo;create a Spirit token,&rdquo;
        check the printing — it determines color and abilities.
      </P>

      <H3>Copies are token copies</H3>
      <P>
        A copy of a creature created by something like Esika's Chariot is a
        token, even if it copies a non-token creature. It cares about
        &ldquo;create a token&rdquo; effects (Doubling Season makes two) and
        ceases to exist when it leaves the battlefield.
      </P>

      <H2>How to actually track them at the table</H2>
      <OL>
        <LI><Em>Counters for stockpilers</Em> — Treasures, Clues, Food, Blood, Maps. A single number per player is faster than a heap of tokens.</LI>
        <LI><Em>Cards for combat tokens</Em> — Soldiers, Spirits, Beasts. You need to physically tap and untap them. Use real tokens or a stack of basic lands as proxies.</LI>
        <LI><Em>One token, multiple purposes</Em> — a Beast and a Spirit are different. Don't share a single proxy for both.</LI>
        <LI><Em>Note the printing</Em> — &ldquo;Spirit token from Spectral Procession&rdquo; vs. &ldquo;Spirit token from Lingering Souls&rdquo; can matter for triggers like &ldquo;each Spirit token enters with...&rdquo;.</LI>
      </OL>

      <H2>Why a token tool helps</H2>
      <P>
        TheStack.gg's <A href="/tokens">token generator</A> filters by type
        across every set so you can find the exact token a card produces
        without flipping through binders. Useful at LGS nights when nobody
        brought enough Treasures, in remote pods over webcam, and during
        deck-building when you want to know whether your deck makes more
        Spirits or more Soldiers and pick the synergy that supports it.
      </P>
      <P>
        For the printed-card list of every token a deck can produce,
        Scryfall's <A href="https://scryfall.com" external>token search</A> is
        the canonical reference. Our generator is built around tabletop play
        — a faster path from &ldquo;I cast this&rdquo; to &ldquo;here is the
        right token at the right size, on the table.&rdquo;
      </P>
    </>
  ),
}

export default post
