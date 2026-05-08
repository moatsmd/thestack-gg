import type { BlogPost } from '@/lib/blog'
import { Lede, P, H2, H3, UL, OL, LI, ToolCTA, A, Em, Quote } from '@/components/blog/Prose'

const post: BlogPost = {
  slug: 'free-browser-mtg-tools-no-install',
  title: 'Free Browser-Based MTG Tools (No Install Required)',
  description:
    'A working list of free, browser-based Magic tools that need no install \u2014 life trackers, card lookup, dice, glossary, stack visualizer, token generator. What each is good for.',
  date: '2026-05-08',
  category: 'Tools',
  readingTime: 8,
  excerpt:
    'A field guide to the free, browser-only MTG tools worth bookmarking \u2014 trackers, card lookup, dice, stack visualizer, and the rest. No install, no sign-up.',
  keyword: 'free browser mtg tools no install',
  body: (
    <>
      <Lede>
        Magic has more software around it than any other tabletop game, and
        most of it wants you to install something. The best of it does not.
        Browser-based tools load in a tab, work on the venue's tablet, and
        leave no trace when the night is over. This is a working list of the
        categories that matter — what each tool type is good for, what to
        watch out for, and where TheStack.gg's own toolkit sits in each
        category.
      </Lede>

      <H2>Card lookup</H2>
      <P>
        Card lookup is the most-used Magic tool in any format. The bar is
        Scryfall, which is the canonical reference for printed text, oracle
        text, rulings, prices, and image search. Their syntax is more
        powerful than any other engine — type, mana value, color identity,
        legality filters, even the artist. For tabletop play, the question is
        usually narrower: what does this card do, what's the current oracle
        text, what are the rulings.
      </P>
      <P>
        TheStack.gg's <A href="/toolkit">card lookup</A> is built for the
        narrower question. You type a name or fragment, get the card, and the
        oracle text is parsed for keywords so any term you don't know is
        clickable straight to the glossary. Fast on mobile, no sign-up.
      </P>
      <P>
        For the deeper Scryfall syntax (advanced searches across the entire
        printed history), use{' '}
        <A href="https://scryfall.com" external>Scryfall directly</A>. We
        wrap the same data for the table-side &ldquo;what does this card
        do&rdquo; question.
      </P>

      <H2>Life trackers</H2>
      <P>
        Covered in detail in the <A href="/blog/best-mtg-life-counter-app-commander">life counter
        comparison</A>. The short version: most mobile life-tracker apps are
        built for 1v1 and pass-the-phone. A browser tracker on a shared
        tablet works better for Commander pods because everyone at the table
        sees the same screen at the same time.
      </P>

      <H2>Stack visualizers</H2>
      <P>
        Stack visualizers are niche but indispensable for the games that need
        them. When three triggers and a counterspell are in the air, drawing
        out the stack on a piece of paper is faster than trying to verbally
        track it. A browser stack visualizer adds the ability to undo,
        rearrange, and step through resolution one object at a time.
      </P>
      <P>
        The detailed walk-through is in the <A href="/blog/how-to-track-the-stack-mtg-priority">stack
        tracking guide</A>. The tool itself is at <A href="/stack">/stack</A>.
      </P>

      <H2>Glossaries and rules references</H2>
      <P>
        For evergreen and returning keywords, a focused glossary beats the
        Comprehensive Rules. For corner cases, the Comp Rules is the
        authority — but most table arguments are not corner cases; they're
        questions like &ldquo;does deathtouch work with trample&rdquo;
        (yes, only one damage required to satisfy lethal) or &ldquo;does
        Ward stop indestructible from saving a creature&rdquo; (Ward fires
        before damage, so yes, the creature is countered or paid for first).
      </P>
      <UL>
        <LI><Em><A href="/glossary">TheStack.gg glossary</A></Em> — 200+ terms with reminder text and examples.</LI>
        <LI><Em>Wiki and rules</Em> — for the long-form deep dive.</LI>
        <LI><Em>Judge resources</Em> — when a game-affecting question hits a tournament.</LI>
      </UL>

      <H2>Token generators</H2>
      <P>
        Covered in the <A href="/blog/mtg-token-generator-every-set">token guide</A>.
        Use a token generator at the LGS to fill in for tokens nobody
        brought; use one in webcam play so the camera can show the table
        what was made; use one during deckbuilding to confirm what tokens
        your build produces.
      </P>

      <H2>Dice and randomizers</H2>
      <P>
        A surprising number of Commander effects need a die roll or coin
        flip. Krark's Thumb, Chaos Orb, Goblin Game, the entirety of any
        Mishra's plot. A browser dice roller with d6, d20, and a coin gets
        you through 99% of the cases without anyone digging in their bag.
      </P>
      <P>
        TheStack.gg's <A href="/dice">dice page</A> gives you weighted-fair
        dice (no streaks because the JS randomizer is good) and a coin flip
        big enough to see across the table.
      </P>

      <H2>Deckbuilders</H2>
      <P>
        Deckbuilding is the one place we don't try to compete. Moxfield,
        Archidekt, EDHREC's deck builder, MTGGoldfish, AetherHub — these are
        purpose-built and great. Pick the one whose interface and pricing
        works for your group. We link out to them from card pages where it
        makes sense.
      </P>

      <H2>What to look for in any browser tool</H2>
      <OL>
        <LI><Em>Loads in under two seconds on a venue tablet.</Em></LI>
        <LI><Em>Works offline after first load (PWA).</Em></LI>
        <LI><Em>No account required to use the core feature.</Em></LI>
        <LI><Em>Mobile-first layout</Em> — phone in landscape works, tablet works, desktop is a bonus.</LI>
        <LI><Em>State persists</Em> across an accidental refresh.</LI>
        <LI><Em>No payments wall on the basics.</Em></LI>
      </OL>

      <H2>The toolkit, in one tab</H2>
      <P>
        TheStack.gg ships the categories above on one site, free, with no
        sign-up: <A href="/tracker">life tracker</A>,{' '}
        <A href="/toolkit">card lookup</A>, <A href="/stack">stack visualizer</A>,{' '}
        <A href="/glossary">glossary</A>, <A href="/tokens">token generator</A>,{' '}
        <A href="/dice">dice</A>, and <A href="/rules">rules lookup</A>. It's
        a PWA, so you can install it from the browser if you want it on a
        home screen, but you don't have to. One URL, one tab, the table is
        running in fifteen seconds.
      </P>

      <ToolCTA
        href="/toolkit"
        title="Open the toolkit"
        body="Card lookup, life tracker, stack visualizer, glossary, tokens, dice. Free, browser-only, no sign-up."
        cta="Open toolkit"
      />

      <Quote>
        The best Magic tool is the one that disappears into the table.
      </Quote>
    </>
  ),
}

export default post
