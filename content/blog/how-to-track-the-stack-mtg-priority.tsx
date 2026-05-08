import type { BlogPost } from '@/lib/blog'
import { Lede, P, H2, H3, UL, OL, LI, ToolCTA, A, Em, Quote } from '@/components/blog/Prose'

const post: BlogPost = {
  slug: 'how-to-track-the-stack-mtg-priority',
  title: 'How to Track the Stack in MTG: Priority, Triggers, Layers',
  description:
    'A practical guide to tracking the stack in Magic: priority order, triggered abilities, replacement effects, layered continuous effects — with examples and a tool for the table.',
  date: '2026-05-08',
  category: 'Rules',
  readingTime: 12,
  excerpt:
    'Priority, triggers, replacement effects, layers — how the stack actually works at the table, and how to keep it straight when six things resolve in a row.',
  keyword: 'how to track the stack mtg priority',
  body: (
    <>
      <Lede>
        The stack is the part of Magic where new players quietly stop following.
        Three triggered abilities resolve in the wrong order, someone says
        &ldquo;in response,&rdquo; and the table loses the thread. The good
        news is that the stack is not actually complicated — it is a last-in,
        first-out pile of objects with a clean priority loop. The bad news is
        that triggered abilities, replacement effects, and layered continuous
        effects all wear similar costumes, and players conflate them. This is
        a working guide to tracking the stack at a real table, written for
        Commander pods that want fewer arguments and cleaner play.
      </Lede>

      <H2>The mental model: a literal stack of plates</H2>
      <P>
        Spells and abilities go onto the stack one at a time. The most recently
        added one resolves first — last in, first out. Nothing on the stack
        does anything until it resolves. Between every spell or ability, every
        player gets a chance to respond. That is it. The hard part is not the
        rule; the hard part is keeping a clear picture of which plate is on
        top, which players have passed priority, and what the order of events
        will be when the dust settles.
      </P>

      <H3>Priority in one paragraph</H3>
      <P>
        After any player puts a spell or ability on the stack, that same player
        keeps priority — they can do something else before passing. When they
        pass, priority goes to the next player. Once every player passes in a
        row without adding anything, the top object on the stack resolves. Then
        the active player gets priority again. Most arguments at casual tables
        come from skipping that &ldquo;every player passes&rdquo; step.
      </P>

      <Quote>
        If you are not sure whether someone has priority, the answer is almost
        always: the person who just did the thing.
      </Quote>

      <H2>Triggered abilities: not on the stack until they're put there</H2>
      <P>
        A common mistake: a triggered ability fires the moment its condition is
        met. It does not. It triggers — meaning it is queued — and then the
        next time a player would receive priority, the ability is{' '}
        <Em>put on the stack</Em>. This matters because multiple triggers can
        accumulate before anything is put on the stack, and they go on in a
        specific order. The active player puts theirs on first, in any order
        they choose; then each opponent in turn order does the same.
      </P>

      <H3>Worked example: three triggers, one upkeep</H3>
      <OL>
        <LI>You control three permanents that each trigger at the beginning of your upkeep.</LI>
        <LI>All three trigger simultaneously when your upkeep begins.</LI>
        <LI>Before any player gets priority, you choose the order. The one you put on the stack last will resolve first.</LI>
        <LI>Once they're on the stack, you receive priority and can respond before any of them resolve.</LI>
      </OL>
      <P>
        Players who treat triggers as &ldquo;they go on in the order they
        printed on the cards&rdquo; will miss this. The active player has full
        control of their own trigger order. That control is occasionally a
        decisive line of play.
      </P>

      <ToolCTA
        href="/stack"
        title="Visualize the stack"
        body="Add spells and triggers, see priority pass, and step through resolution. Useful for explaining a tricky interaction to a tablemate without rebuilding the board."
        cta="Open visualizer"
      />

      <H2>Replacement effects don't use the stack</H2>
      <P>
        This is the rule that catches people. A replacement effect — anything
        with the word &ldquo;instead&rdquo; or &ldquo;as ... enters&rdquo; — does
        not go on the stack and cannot be responded to. Doubling Season is the
        canonical example. When you would create a token, Doubling Season
        modifies the event before it happens; there is no trigger to counter.
        If you wait for the token to appear and then try to respond, you have
        already missed the window because nothing was ever on the stack.
      </P>

      <H3>How to spot one</H3>
      <UL>
        <LI><Em>&ldquo;If ... would ..., instead ...&rdquo;</Em> — replacement effect.</LI>
        <LI><Em>&ldquo;As [permanent] enters the battlefield ...&rdquo;</Em> — replacement effect.</LI>
        <LI><Em>&ldquo;When ... happens, ...&rdquo;</Em> — triggered ability, uses the stack.</LI>
        <LI><Em>&ldquo;Whenever ...&rdquo;</Em> — triggered ability, uses the stack.</LI>
      </UL>

      <H2>Layered continuous effects: the part nobody loves</H2>
      <P>
        When the board has multiple effects modifying the same permanent, you
        cannot just resolve them in the order they came down. Magic uses a
        seven-layer system to determine the final state of a permanent, and
        the layers always run in the same order regardless of when the effects
        were created. Once you accept the layers, most weird Anointed Procession
        plus Opalescence plus Humility scenarios stop being weird.
      </P>

      <OL>
        <LI><Em>Layer 1</Em> — copy effects (this card becomes a copy of that one).</LI>
        <LI><Em>Layer 2</Em> — control-changing effects.</LI>
        <LI><Em>Layer 3</Em> — text-changing effects.</LI>
        <LI><Em>Layer 4</Em> — type-changing effects.</LI>
        <LI><Em>Layer 5</Em> — color-changing effects.</LI>
        <LI><Em>Layer 6</Em> — ability-adding and ability-removing effects.</LI>
        <LI><Em>Layer 7</Em> — power and toughness, with sub-layers a–d.</LI>
      </OL>
      <P>
        Layer 7 has its own sub-order: characteristic-defining abilities,
        printed-value setters (&ldquo;is 3/3&rdquo;), modifications by static
        effects, and counters last. Power and toughness arguments at the table
        almost always live inside layer 7's sub-layers.
      </P>

      <H2>Tracking it without losing the room</H2>
      <P>
        At the casual table, the trick is not memorizing every rule. It's
        slowing down at three specific moments: when something triggers, when
        someone says &ldquo;in response,&rdquo; and when a permanent's
        characteristics change mid-combat. At those moments, name what's
        happening out loud, in order. &ldquo;That triggers. Before it goes on
        the stack, anything? Okay, on the stack. I have priority. Pass. Pass.
        Pass. Resolves.&rdquo; Boring is the goal.
      </P>

      <H3>A short script that fixes most arguments</H3>
      <UL>
        <LI><Em>&ldquo;Holding priority&rdquo;</Em> — &ldquo;I cast this and before passing I'm going to cast that.&rdquo;</LI>
        <LI><Em>&ldquo;In response&rdquo;</Em> — &ldquo;I'd like to respond before yours resolves.&rdquo;</LI>
        <LI><Em>&ldquo;Floating mana&rdquo;</Em> — &ldquo;Before priority passes, I'm tapping for mana to use later this step.&rdquo;</LI>
        <LI><Em>&ldquo;Letting it resolve&rdquo;</Em> — &ldquo;No response, it resolves.&rdquo;</LI>
      </UL>

      <H2>When to actually open a tool</H2>
      <P>
        Most stack interactions resolve fine with a verbal protocol. Open a
        visualizer when there are three or more objects on the stack, when
        someone is unsure of trigger order, or when a Strionic Resonator copy
        of a copy of a triggered ability is in the air. TheStack.gg's{' '}
        <A href="/stack">stack page</A> is built for that — it lets you add
        spells and triggers, mark which player is the source, and step through
        resolution one object at a time. For the rules text behind any
        keyword, the <A href="/glossary">glossary</A> is a tap away.
      </P>
      <P>
        If you find yourself opening the visualizer often, that is a sign your
        deck is well-built, not that you are slow. The decks that demand the
        most stack tracking are the ones that reward it most.
      </P>
    </>
  ),
}

export default post
