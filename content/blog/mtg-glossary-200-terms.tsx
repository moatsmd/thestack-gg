import type { BlogPost } from '@/lib/blog'
import { Lede, P, H2, H3, UL, OL, LI, ToolCTA, A, Em, Quote } from '@/components/blog/Prose'

const post: BlogPost = {
  slug: 'mtg-glossary-200-terms',
  title: 'Magic the Gathering Glossary: 150+ Terms Players Use',
  description:
    'A practical Magic: The Gathering glossary covering the keywords, abilities, and slang players actually use \u2014 with reminder text and rules references.',
  date: '2026-05-08',
  category: 'Reference',
  readingTime: 10,
  excerpt:
    'A working dictionary of the keywords, evergreen abilities, and table slang every player runs into \u2014 with reminder text and rules references.',
  keyword: 'magic the gathering glossary',
  body: (
    <>
      <Lede>
        Magic has more vocabulary than any other game on the shelf. Twenty
        evergreen keywords, dozens of returning ones, set-specific mechanics,
        rules terms that never appear on a card, and a layer of table slang
        on top. The Comprehensive Rules document is exhaustive and unreadable;
        the Wiki is sprawling. This is a practical glossary — the terms
        a player will actually run into across Standard, Modern, and
        especially Commander, with the gist of each one and a pointer to the
        full text where it matters.
      </Lede>

      <H2>The evergreen keywords</H2>
      <P>
        Evergreen keywords appear in nearly every set. If you know these, you
        can read the majority of cards printed today.
      </P>
      <UL>
        <LI><Em>Deathtouch</Em> — any damage from this creature is enough to destroy.</LI>
        <LI><Em>Defender</Em> — can't attack.</LI>
        <LI><Em>Double strike</Em> — deals first-strike and regular damage.</LI>
        <LI><Em>Enchant</Em> — what an Aura attaches to.</LI>
        <LI><Em>Equip</Em> — attach an Equipment to a creature you control.</LI>
        <LI><Em>First strike</Em> — deals damage before creatures without first strike.</LI>
        <LI><Em>Flash</Em> — cast at instant speed.</LI>
        <LI><Em>Flying</Em> — can only be blocked by flying or reach.</LI>
        <LI><Em>Haste</Em> — ignores summoning sickness.</LI>
        <LI><Em>Hexproof</Em> — can't be the target of opponents' spells or abilities.</LI>
        <LI><Em>Indestructible</Em> — damage and &ldquo;destroy&rdquo; effects don't kill it.</LI>
        <LI><Em>Lifelink</Em> — damage dealt also gains the controller life.</LI>
        <LI><Em>Menace</Em> — can't be blocked by fewer than two creatures.</LI>
        <LI><Em>Protection</Em> — can't be blocked by, targeted by, dealt damage by, or attached by the named quality.</LI>
        <LI><Em>Reach</Em> — can block flying creatures.</LI>
        <LI><Em>Trample</Em> — excess damage carries over to the defending player or planeswalker.</LI>
        <LI><Em>Vigilance</Em> — doesn't tap to attack.</LI>
        <LI><Em>Ward</Em> — opponents pay an extra cost to target this permanent.</LI>
      </UL>

      <ToolCTA
        href="/glossary"
        title="Browse the full glossary"
        body="Searchable, with full reminder text, rules references, and examples for every keyword and term \u2014 from Affinity to Ward."
        cta="Open glossary"
      />

      <H2>Returning mechanics worth knowing</H2>
      <P>
        These show up across multiple sets and you'll see them in older cards
        from a long history of printings.
      </P>
      <UL>
        <LI><Em>Affinity</Em> — costs less based on permanents you control of a given type.</LI>
        <LI><Em>Cascade</Em> — when cast, exile cards until you hit a cheaper non-land, cast it for free.</LI>
        <LI><Em>Convoke</Em> — tap creatures to pay for the spell.</LI>
        <LI><Em>Cycling</Em> — pay a cost, discard, draw a card.</LI>
        <LI><Em>Delve</Em> — exile cards from your graveyard to pay generic mana.</LI>
        <LI><Em>Echo</Em> — pay an upkeep cost the turn after you cast it or sacrifice it.</LI>
        <LI><Em>Flashback</Em> — cast a sorcery or instant from your graveyard for an alternate cost.</LI>
        <LI><Em>Kicker</Em> — pay an additional cost for a bonus effect.</LI>
        <LI><Em>Madness</Em> — when you discard, cast it for the madness cost instead.</LI>
        <LI><Em>Morph</Em> — cast face-down as a 2/2 for {`{3}`}, turn face-up later for the morph cost.</LI>
        <LI><Em>Ninjutsu</Em> — return an unblocked attacker to hand and put this in from hand, attacking.</LI>
        <LI><Em>Persist</Em> — when it dies, comes back with a -1/-1 counter.</LI>
        <LI><Em>Proliferate</Em> — choose any number of permanents and players with counters; add another of each kind.</LI>
        <LI><Em>Storm</Em> — copy this spell once for each spell cast before it this turn.</LI>
        <LI><Em>Suspend</Em> — pay the suspend cost, exile with time counters, cast for free when the last comes off.</LI>
        <LI><Em>Undying</Em> — when it dies with no +1/+1 counters, returns with one.</LI>
      </UL>

      <H2>Format and zone vocabulary</H2>
      <UL>
        <LI><Em>Battlefield</Em> — the in-play zone where permanents live.</LI>
        <LI><Em>Stack</Em> — where spells and abilities wait to resolve. See the <A href="/blog/how-to-track-the-stack-mtg-priority">stack guide</A>.</LI>
        <LI><Em>Library</Em> — your face-down deck.</LI>
        <LI><Em>Graveyard</Em> — public discard pile.</LI>
        <LI><Em>Exile</Em> — separate-from-the-game zone, public.</LI>
        <LI><Em>Command zone</Em> — where commanders live in Commander, where emblems and dungeons live in any format.</LI>
        <LI><Em>Hand</Em> — yours is hidden, opponents see only sizes.</LI>
      </UL>

      <H2>Counters and tokens</H2>
      <UL>
        <LI><Em>+1/+1 counter</Em> — increases power and toughness.</LI>
        <LI><Em>-1/-1 counter</Em> — decreases. They cancel +1/+1 counters as a state-based action.</LI>
        <LI><Em>Loyalty counter</Em> — planeswalker resource.</LI>
        <LI><Em>Poison counter</Em> — ten of these and you lose.</LI>
        <LI><Em>Charge counter</Em> — generic, used by many cards.</LI>
        <LI><Em>Treasure / Clue / Food / Blood / Map token</Em> — see the <A href="/blog/mtg-token-generator-every-set">token guide</A>.</LI>
      </UL>

      <H2>Mechanic terms that don't appear on cards</H2>
      <P>
        These show up in articles, on streams, and at the table — but you
        won't find them in the rules text.
      </P>
      <UL>
        <LI><Em>Blowout</Em> — a play that wrecks an opponent's plan in one move.</LI>
        <LI><Em>Bounce</Em> — return a permanent to its owner's hand.</LI>
        <LI><Em>Cantrip</Em> — a spell that draws a card on top of its main effect.</LI>
        <LI><Em>Card advantage</Em> — drawing or making more cards than your opponent.</LI>
        <LI><Em>Combo</Em> — two or more cards that together create a winning interaction.</LI>
        <LI><Em>Dies trigger</Em> — an ability that triggers when a creature goes to the graveyard from the battlefield.</LI>
        <LI><Em>ETB</Em> — &ldquo;enters the battlefield&rdquo; trigger.</LI>
        <LI><Em>LTB</Em> — &ldquo;leaves the battlefield&rdquo; trigger.</LI>
        <LI><Em>Fizzle</Em> — a spell whose targets all become illegal before resolution.</LI>
        <LI><Em>Hate</Em> — a card aimed at disrupting a specific strategy (graveyard hate, artifact hate).</LI>
        <LI><Em>Mulligan</Em> — redrawing your opening hand for a one-card penalty.</LI>
        <LI><Em>Ramp</Em> — accelerating mana production.</LI>
        <LI><Em>Tempo</Em> — denying an opponent's effective turns.</LI>
        <LI><Em>Tutor</Em> — a card that searches for a specific card.</LI>
        <LI><Em>Wheel</Em> — discard hand, draw seven (Wheel of Fortune-style).</LI>
        <LI><Em>Wrath</Em> — a board wipe (Wrath of God-style).</LI>
      </UL>

      <H2>Commander-only terms</H2>
      <UL>
        <LI><Em>Color identity</Em> — every mana symbol on a card; commanders restrict the deck to their color identity.</LI>
        <LI><Em>Command tax</Em> — each time you cast your commander from the command zone, the cost increases by {`{2}`}.</LI>
        <LI><Em>Commander damage</Em> — 21 from a single commander kills the player. See the <A href="/blog/commander-damage-tracker-21-rule">21-rule guide</A>.</LI>
        <LI><Em>Partner</Em> — a keyword letting two specific commanders share the role.</LI>
        <LI><Em>Background</Em> — Choose a Background pairs a commander with a Background enchantment for color identity.</LI>
        <LI><Em>Friends forever / Doctor's companion</Em> — partner-style mechanics tied to flavor.</LI>
        <LI><Em>cEDH</Em> — competitive Commander, optimized to win as fast as possible.</LI>
      </UL>

      <H2>Why we built our own glossary</H2>
      <P>
        Existing glossaries are exhaustive but built for reading. Ours is built
        for the table — searchable, fast on mobile, with the rules-relevant
        text first and color-pie flavor second. The full <A href="/glossary">glossary
        page</A> covers every term in this article and another hundred-plus,
        with examples and a search box that handles partial matches and
        common typos.
      </P>
      <P>
        If a term in this list does not have a full entry in the on-site
        glossary, that is a gap we want to close — let us know. Coverage of
        the working vocabulary of the game is the only metric that matters
        for a tool like this.
      </P>
    </>
  ),
}

export default post
