'use client'

import Link from 'next/link'
import { canPayBears, combatOutcome, emptyExercise, resolveBearsStack } from '@/lib/learn'
import { useExercise, useLearn } from './LearnProvider'
import { CardImage, Feedback, Term } from './LearnUI'
import styles from './learn.module.css'

export function CardLesson() {
  const { state, save } = useExercise('basics')
  const answers = [
    { label: 'Mana cost', text: 'The cost is what you pay to cast the spell: one mana of any type plus one green mana. Look at the bottom right for combat stats.' },
    { label: 'Card type', text: '“Creature — Bear” tells you what this card is. Creatures can attack and block. Their combat stats are at the bottom right.' },
    { label: 'Power and toughness', text: 'Exactly. The 2/2 means it deals 2 damage in combat and normally dies if it has 2 or more damage marked on it. The first number is power; the second is toughness.' },
  ]
  return <>
    <p className={styles.intro}>Meet Grizzly Bears. A simple creature, and a perfect place to begin. Its frame tells you what it costs, what it does, and how it fares in a fight.</p>
    <section className={styles.workbench} aria-label="Read a Magic card">
      <div className={styles.cardStudy}><div className={styles.studyCard}><CardImage card="bears" name="Grizzly Bears: cost {1}{G}, Creature — Bear, power 2, toughness 2" priority /><span className={styles.cardAnnotation}>Find the 2/2 ↗</span></div><div className={styles.studyNotes}>
        <p className={styles.eyebrow}>Your first read</p><h2>How much damage can these Bears deal in combat?</h2><p>Choose the part of the card that tells you.</p>
        <div className={styles.answers}>{answers.map((answer, index) => <button className={styles.answer} key={answer.label} aria-pressed={state.choice === answer.label} onClick={() => save({ ...state, choice: answer.label, step: index === 2 ? 1 : 0 }, index === 2)}><span className={styles.choiceLetter} aria-hidden="true">{String.fromCharCode(65 + index)}</span>{answer.label}<span aria-hidden="true">↗</span></button>)}</div>
      </div></div>
      <Feedback success={state.step === 1}>{answers.find(a => a.label === state.choice)?.text || 'Take a look at the card, then make your choice. A wrong answer is just another way to learn.'}</Feedback>
    </section>
    <div className={styles.noteGrid}><section><h3>A card changes roles</h3><p>In your hand, Bears is a card you could cast. On the stack, it’s a spell waiting to resolve. On the battlefield, it’s a creature permanent.</p></section><section><h3>Not every card takes the same path</h3><p>Lands go straight from your hand to the battlefield. Instants and sorceries usually go from the stack to the graveyard after resolving.</p></section></div>
    <div className={styles.termRow}><Term name="Spell" /><Term name="Permanent" /><Term name="Graveyard" /></div>
  </>
}

export function CastLesson() {
  const { state, save } = useExercise('cast')
  const mana = [...(state.flags.includes('forest') ? ['G'] : []), ...(state.flags.includes('island') ? ['U'] : [])]
  const cast = state.step === 2
  const tap = (land: string) => { if (!state.flags.includes(land) && !cast) save({ ...state, choice: '', flags: [...state.flags, land] }) }
  const pay = () => {
    if (!canPayBears(mana)) { save({ ...state, choice: mana.length === 1 ? 'one-more' : 'need-mana' }); return }
    save({ ...state, step: 2, choice: 'cast' }, true)
  }
  return <>
    <p className={styles.intro}>Lands make mana. Mana pays for spells. You already have an Island in play, and you haven’t played a land this turn. Let’s get those Bears onto the battlefield.</p>
    <section className={styles.workbench} aria-label="Mana payment exercise">
      <div className={styles.benchHeading}><span className={styles.eyebrow}>{cast ? 'Your battlefield' : 'Your main phase · The stack is empty'}</span><span className={styles.manaPool}>Mana available <b>{cast ? '0' : mana.length}</b><span>{cast ? 'Paid 1 + G' : mana.join(' + ') || '—'}</span></span></div>
      <div className={styles.castBoard}>
        <div><p className={styles.zoneLabel}>{state.step === 0 ? 'In your hand' : 'Land played this turn'}</p><CardImage card="forest" name="Forest — tap to add one green mana" small tapped={state.flags.includes('forest')} />{state.step === 0 ? <button className={styles.primary} onClick={() => save({ ...state, step: 1 })}>Play Forest</button> : <button className={styles.secondary} disabled={cast || state.flags.includes('forest')} aria-pressed={state.flags.includes('forest')} aria-label="Tap Forest for green mana" onClick={() => tap('forest')}>{state.flags.includes('forest') ? 'Tapped · G' : 'Tap for G'}</button>}</div>
        <div><p className={styles.zoneLabel}>Already on the battlefield</p><CardImage card="island" name="Island — tap to add one blue mana" small tapped={state.flags.includes('island')} /><button className={styles.secondary} disabled={cast || state.step === 0 || state.flags.includes('island')} aria-pressed={state.flags.includes('island')} aria-label="Tap Island for blue mana" onClick={() => tap('island')}>{state.flags.includes('island') ? 'Tapped · U' : 'Tap for U'}</button></div>
        <div className={cast ? styles.arrived : ''}><p className={styles.zoneLabel}>{cast ? 'Creature on the battlefield' : 'In your hand · Cost 1 + G'}</p><CardImage card="bears" name="Grizzly Bears — costs one generic and one green mana" small /><button className={styles.primary} disabled={state.step === 0 || cast} onClick={pay}>{cast ? 'Bears is in play ✓' : 'Cast Grizzly Bears'}</button></div>
      </div>
      <Feedback success={cast}>{cast ? 'Grizzly Bears resolves after both players pass. Your two mana are spent; both lands stay tapped. The Bears is now on the battlefield, ready to block—but it can’t attack this turn without haste.' : state.choice === 'one-more' ? mana.includes('G') ? 'You need one more mana. The 1 can be paid with any type, so blue mana from your Island works.' : 'You still need green mana. Blue can pay the generic 1, but the G must be paid with green. Tap your Forest.' : state.choice === 'need-mana' ? 'Tap your lands first in this exercise. You need two mana in total, including one green.' : state.step === 0 ? 'First, play your Forest. Playing a land does not use the stack and does not cost mana.' : 'Tap both lands, then cast Grizzly Bears. G pays the green symbol; U pays the generic 1.'}</Feedback>
      <button className={styles.textButton} onClick={() => save(emptyExercise())}>↺ Try the casting exercise again</button>
    </section>
    <div className={styles.noteGrid}><section><h3>Your lands stay with you</h3><p>Tapping a land makes mana. Spending that mana does not discard the land. You’ll usually untap it at the start of your next turn.</p></section><section><h3>A little timing detail</h3><p>You can also generate mana during the casting process. Choose targets before paying costs; other players respond after you finish casting and pass priority.</p></section></div><div className={styles.termRow}><Term name="Mana" /><Term name="Tap" /><Term name="Summoning sickness" /></div>
  </>
}

const TURN = [
  { title: 'Beginning', text: 'It’s your next turn. Your lands are tapped from last turn. What happens first?', good: 'Untap my permanents', wrong: 'Draw before untapping', explanation: 'Untap comes first. Then upkeep begins, followed by the draw step. Players don’t get priority during untap.', result: 'Your lands are upright again.' },
  { title: 'Upkeep & draw', text: 'There are no upkeep triggers in this example. After everyone passes in upkeep, what is your normal draw-step action?', good: 'Draw one card', wrong: 'Refill my hand to seven', explanation: 'You normally draw one card, not a fresh hand. The starting player skips the first draw in a two-player game.', result: 'One new card joins your hand.' },
  { title: 'First main', text: 'You have priority and the stack is empty. You haven’t played a land this turn. What can you do?', good: 'Play a land', wrong: 'Play every land in my hand', explanation: 'Normally you may play one land on your turn, during a main phase with an empty stack and priority.', result: 'You’ve used your land play for this turn.' },
  { title: 'Combat', text: 'Your Bears has been under your control since this turn began. It’s untapped, and the opponent has no creatures. Try an attack.', good: 'Attack with Grizzly Bears', wrong: 'Attack with my Island', explanation: 'Creatures attack; an ordinary Island is a land, not a creature. Eligible attackers tap unless they have vigilance.', result: 'The unblocked Bears deals 2 damage. Your opponent goes from 20 to 18.' },
  { title: 'Second main', text: 'Combat is over. You already played a land this turn. Which statement is right?', good: 'I can cast another creature if I can pay', wrong: 'I get a second land play', explanation: 'You get another main phase, not another land allowance. Normal sorcery timing applies here too.', result: 'You choose to save your remaining cards.' },
  { title: 'Ending', text: 'Everyone is done with the end step. You have eight cards in hand and no effect changing your maximum hand size. What happens in cleanup?', good: 'Discard one card', wrong: 'Keep all eight automatically', explanation: 'The normal maximum hand size is seven. Cleanup also removes marked damage and ends “until end of turn” effects.', result: 'Your turn is complete. The next player begins.' },
]

export function TurnLesson() {
  const { state, save } = useExercise('turn')
  const step = Math.min(state.step, TURN.length)
  const active = TURN[Math.min(step, TURN.length - 1)]
  return <><p className={styles.intro}>A turn has a rhythm: ready your cards, draw, build your board, attack, then prepare for what comes next. Walk through one simple two-player turn.</p>
    <section className={styles.workbench} aria-label="Turn walkthrough"><ol className={styles.turnRail}>{TURN.map((phase, index) => <li key={phase.title} aria-current={index === step ? 'step' : undefined} className={index < step ? styles.phaseDone : ''}><span>{index < step ? '✓' : index + 1}</span>{phase.title}</li>)}</ol>
      <div className={styles.turnStage}><div className={styles.turnCards}><CardImage card={step < 2 ? 'forest' : 'bears'} name={step < 2 ? 'Forest, your land' : 'Grizzly Bears, your creature'} small tapped={step === 0 || step >= 4} /><div><span className={styles.zoneLabel}>Opponent’s life</span><strong className={styles.lifeNumber}>{step >= 4 ? '18' : '20'}</strong></div></div><div><p className={styles.eyebrow}>{step === TURN.length ? 'A whole turn, well played' : `Step ${step + 1} · ${active.title}`}</p><h2>{step === TURN.length ? 'You’ve found the rhythm.' : active.text}</h2>{step < TURN.length && <div className={styles.answers}><button className={styles.answer} onClick={() => save({ ...state, step: step + 1, choice: 'correct' }, step + 1 === TURN.length)}>{active.good} <span aria-hidden="true">→</span></button><button className={styles.answer} onClick={() => save({ ...state, choice: 'wrong' })}>{active.wrong}</button></div>}</div></div>
      <Feedback success={step === TURN.length}>{state.choice === 'wrong' ? active.explanation : step > 0 ? `${TURN[step - 1].result}${step < TURN.length ? ` Next: ${active.title}. ${active.text}` : ''}` : 'Make a choice to move through the turn. These are normal rules; individual cards can change them.'}</Feedback><button className={styles.textButton} onClick={() => save(emptyExercise())}>↺ Walk through another turn</button>
    </section><div className={styles.noteGrid}><section><h3>There are chances to respond</h3><p>Players normally receive priority during upkeep, draw, main phases and combat steps. Nobody receives priority during untap; cleanup usually has none either.</p></section><section><h3>Say the next step aloud</h3><p>“Go to combat?” gives the table a clear chance to act before attackers are declared. Good communication makes the rules easier to follow.</p></section></div><div className={styles.termRow}><Term name="Priority" /><Term name="Triggered ability" /></div></>
}

export function CombatLesson() {
  const { state, save } = useExercise('combat')
  const giant = state.flags.includes('giant')
  const unblocked = state.flags.includes('unblocked')
  const result = combatOutcome(giant ? 3 : 2, giant ? 3 : 2, unblocked ? null : 2, unblocked ? null : 2)
  const answer = unblocked ? 'The opponent takes damage' : giant ? 'Only the blocker dies' : 'Both creatures die'
  const resolved = state.step === 1
  const change = (flag: string) => save({ step: 0, choice: '', flags: state.flags.includes(flag) ? state.flags.filter(f => f !== flag) : [...state.flags, flag] })
  return <><p className={styles.intro}>You choose your attackers. The defending player chooses blockers. Creatures deal damage equal to their power at the same time in a normal combat damage step.</p>
    <section className={styles.workbench} aria-label="Combat exercise"><div className={styles.benchHeading}><p className={styles.eyebrow}>One attack. Make your prediction.</p><button className={styles.secondary} aria-pressed={giant} onClick={() => change('giant')}>{giant ? 'Use 2/2 Bears instead' : 'Try a 3/3 Hill Giant'}</button></div>
      <div className={styles.combatBoard}><div className={resolved && result.attackerDies ? styles.defeated : ''}><span className={styles.zoneLabel}>Your attacker · Already able to attack</span><CardImage card={giant ? 'giant' : 'bears'} name={giant ? 'Hill Giant, 3/3 tapped attacker' : 'Grizzly Bears, 2/2 tapped attacker'} small tapped /><p className={styles.stat}>{giant ? '3 / 3' : '2 / 2'}</p><p>{resolved ? result.attackerDies ? 'Destroyed → graveyard' : `${result.attackerDamage} damage marked · survives` : 'Power / toughness'}</p></div><span className={styles.combatArrow} aria-hidden="true">→</span><div className={resolved && result.blockerDies ? styles.defeated : ''}><span className={styles.zoneLabel}>{unblocked ? 'Defending player' : 'Their blocker'}</span>{unblocked ? <div className={styles.playerPortrait}><span>Opponent</span><strong>{20 - (resolved ? result.playerDamage : 0)}</strong><span>life</span></div> : <CardImage card="bears" name="Grizzly Bears, 2/2 blocker" small />}<p className={styles.stat}>{unblocked ? 'Unblocked' : '2 / 2'}</p><p>{resolved && !unblocked ? `${result.blockerDamage} damage · destroyed` : unblocked ? 'No blocker assigned' : 'Power / toughness'}</p></div></div>
      <button className={styles.textButton} aria-pressed={unblocked} onClick={() => change('unblocked')}>{unblocked ? 'Assign a 2/2 blocker' : 'See an unblocked attack'}</button>
      <h2 className={styles.question}>What happens when damage is dealt?</h2><div className={styles.answerGrid}>{['Both creatures die', 'Only the blocker dies', 'The opponent takes damage'].map(choice => <button className={styles.answer} aria-pressed={state.choice === choice} key={choice} onClick={() => save({ ...state, choice, step: choice === answer ? 1 : 0 }, choice === answer)}>{choice}</button>)}</div>
      <Feedback success={resolved}>{resolved ? unblocked ? `Right. The unblocked attacker deals ${result.playerDamage} damage to the opponent.` : giant ? 'Right. Hill Giant deals 3 damage to the Bears and receives 2 damage. Bears dies; the Giant survives as a 3/3 with 2 damage marked. Damage does not reduce its toughness.' : 'Right. Each 2/2 deals 2 damage to the other at the same time. Both have lethal damage and are destroyed. No damage gets through to the opponent.' : state.choice ? 'Look at both power and toughness. A blocked attacker normally deals its damage to its blocker, not the player. Compare each creature’s damage with the other’s toughness, then try again.' : 'Assume no abilities or other effects. Make a prediction, then try changing the attacker or removing the blocker.'}</Feedback>
    </section><div className={styles.noteGrid}><section><h3>Blocking doesn’t tap a creature</h3><p>An untapped creature can block even if it just entered. An ordinary tapped creature cannot block. Attackers tap when declared unless they have vigilance.</p></section><section><h3>Damage is temporary</h3><p>Surviving creatures keep marked damage until cleanup. A second spell can finish a damaged creature before then. Toughness itself hasn’t changed.</p></section></div><div className={styles.termRow}><Term name="Summoning sickness" /><Term name="Vigilance" /><Term name="Trample" /><Term name="First strike" /></div></>
}

export function StackLesson() {
  const { state, save } = useExercise('stack')
  const growth = state.flags.includes('growth')
  const step = Math.min(state.step, 3)
  const result = resolveBearsStack(growth)
  const resolved = step === 3
  const respond = () => save({ step: 1, choice: '', flags: ['growth'] })
  return <><p className={styles.intro}>Your opponent casts Lightning Bolt at your 2/2 Bears, then passes priority. You have Giant Growth and one green mana ready. Can you save your creature?</p>
    <section className={styles.workbench} aria-label="Stack response exercise"><div className={styles.benchHeading}><span className={styles.eyebrow}>{resolved ? 'The stack is empty' : 'Top resolves first'}</span><span className={styles.pill}>{step < 2 ? 'Bears: 2/2' : growth ? 'Bears: 5/5' : 'Bears: 2/2'}</span></div>
      <div className={styles.stackBoard}><div className={styles.stackItems}>
        {growth && step === 1 && <div className={`${styles.spellItem} ${styles.greenSpell}`}><CardImage card="growth" name="Giant Growth: target creature gets +3/+3 until end of turn" small /><div><span className={styles.eyebrow}>02 · Your response</span><h3>Giant Growth</h3><p>Target: your Bears<br />+3/+3 until end of turn</p><b>Resolves next ↓</b></div></div>}
        {step < 3 && <div className={`${styles.spellItem} ${styles.redSpell}`}><CardImage card="bolt" name="Lightning Bolt: deals 3 damage to any target" small /><div><span className={styles.eyebrow}>01 · Their spell</span><h3>Lightning Bolt</h3><p>Target: your Bears<br />3 damage</p></div></div>}
        {resolved && <div className={styles.stackEmpty}><span className={styles.largeCheck}>{growth ? '✓' : '↺'}</span><h2>{growth ? 'Your Bears lives.' : 'The Bolt was lethal.'}</h2><p>{growth ? '5/5 with 3 damage marked. A response made the difference.' : 'A 2/2 with 3 damage is destroyed. Try responding before the Bolt resolves.'}</p></div>}
      </div><div className={styles.stackDecision}><p className={styles.eyebrow}>Your move</p><h2>{step === 0 ? 'There’s still time.' : step === 1 ? 'Which spell resolves first?' : step === 2 ? 'You get another chance to act.' : 'One item at a time.'}</h2>
        {step === 0 ? <><p>Giant Growth costs one green mana. It can make your Bears large enough to survive 3 damage.</p><button className={styles.primary} onClick={respond}>Cast Giant Growth</button><button className={styles.secondary} onClick={() => save({ step: 3, choice: 'passed', flags: [] })}>Pass without responding</button></> : step === 1 ? <><p>Both players have now passed in succession. Choose the top item.</p><button className={styles.answer} onClick={() => save({ ...state, step: 2, choice: 'growth' })}>Resolve Giant Growth</button><button className={styles.answer} onClick={() => save({ ...state, choice: 'bolt-first' })}>Resolve Lightning Bolt first</button></> : step === 2 ? <><p>Giant Growth has resolved. Bears is 5/5. Priority returns to the active player, then passes around again. No one has another response in this example.</p><button className={styles.primary} onClick={() => save({ ...state, step: 3, choice: 'resolved' }, true)}>Both pass · resolve Lightning Bolt</button></> : <button className={styles.secondary} onClick={() => save(emptyExercise())}>Try the response again</button>}
      </div></div>
      <Feedback success={resolved && result.survives}>{state.choice === 'bolt-first' ? 'The last spell added resolves first. Giant Growth is above Lightning Bolt. Choose Giant Growth, then players get priority again.' : resolved ? growth ? 'You saved the Bears. Giant Growth resolved first, raising it to 5/5. Lightning Bolt then dealt 3 damage. In cleanup, the damage is removed as the +3/+3 effect ends.' : 'Both players passed on Lightning Bolt. It resolved for 3 damage and the Bears died. A response had to happen before it resolved.' : step === 2 ? 'The stack pauses between resolutions. It does not resolve all at once.' : step === 1 ? 'Giant Growth is above Lightning Bolt. Both spells have already been cast and paid for.' : 'Choose a response or see what happens if you pass. Nothing is locked in until you act.'}</Feedback>
    </section><div className={styles.noteGrid}><section><h3>Some things don’t use the stack</h3><p>Playing a land and using mana abilities happen without waiting for responses. Static abilities apply continuously. Spells and most activated or triggered abilities use the stack.</p></section><section><h3>Want another example?</h3><p>See a counterspell battle in the full visualizer. Your place in this chapter stays saved.</p><Link className={styles.inlineLink} href="/stack?from=learn">Open the Stack visualizer ↗</Link></section></div><div className={styles.termRow}><Term name="Priority" /><Term name="Triggered ability" /></div></>
}

export function TableLesson() {
  const { progress, setFormat } = useLearn()
  const { state, save } = useExercise('table')
  const commander = progress.format === 'commander'
  const checks = ['Choose a starting player', 'Prepare and shuffle your decks', 'Draw opening hands and take mulligans', 'Set starting life totals']
  const names = Array.from({ length: commander ? 4 : 2 }, (_, i) => `Player ${i + 1}`)
  const allChecked = checks.every((_, index) => state.flags.includes(String(index)))
  const toggle = (index: number) => {
    const flag = String(index)
    const flags = state.flags.includes(flag) ? state.flags.filter(f => f !== flag) : [...state.flags, flag]
    save({ ...state, flags, step: 0 })
  }
  return <><p className={styles.intro}>You know enough to begin. You don’t need to know every card or rule. Pick the kind of table you’re joining, keep a reference nearby, and play your first game.</p>
    <section className={styles.workbench} aria-label="First game setup"><div className={styles.formatChoices} role="group" aria-label="Game format"><button aria-pressed={!commander} onClick={() => { setFormat('duel'); save(emptyExercise()) }}><span className={styles.eyebrow}>Two players</span><h2>A classic duel</h2><p>60-card constructed · 20 life</p></button><button aria-pressed={commander} onClick={() => { setFormat('commander'); save(emptyExercise()) }}><span className={styles.eyebrow}>A four-player table</span><h2>Commander night</h2><p>100 cards including commander · 40 life</p></button></div>
      <div className={styles.setupFacts}><div><strong>{commander ? '40' : '20'}</strong><span>starting life</span></div><div><strong>{commander ? '100' : '60+'}</strong><span>cards in your deck</span></div><div><strong>7</strong><span>cards in your opening hand</span></div></div>
      <ol className={styles.checklist}>{checks.map((label, index) => <li key={label}><label><input type="checkbox" checked={state.flags.includes(String(index))} onChange={() => toggle(index)} /><span><b>{label}</b><small>{index === 0 ? 'Use a mutually agreed method. At your table, the highest d20 roll starts; reroll ties.' : index === 1 ? commander ? '100 cards total. Usually one commander; obey color identity and singleton rules, except basic lands and card-specific exceptions.' : 'A 60-card minimum for constructed; up to four of a named card, except basic lands and card-specific exceptions. Limited formats usually use 40.' : index === 2 ? commander ? 'In multiplayer, the first mulligan is free. Later mulligans reduce your kept hand by one each. The starting player still draws on their first turn.' : 'For a mulligan: shuffle back, draw seven, then put one card on the bottom for each mulligan once you keep. The starting player skips their first draw.' : commander ? '40 life each. Track commander combat damage separately: 21 from a single commander makes a player lose.' : '20 life each. Use the tracker for life changes and keep your board visible.'}</small></span></label>{index === 0 && <Link className={styles.inlineLink} href={`/dice?players=${encodeURIComponent(JSON.stringify(names))}`}>Open your group d20 roll-off ↗</Link>}</li>)}</ol>
      <button className={styles.primary} disabled={!allChecked} onClick={() => save({ ...state, step: 1 }, true)}>I’m ready for my first game</button>
      <Feedback success={state.step === 1}>{state.step === 1 ? 'Your table is ready. Open the tracker, choose Multiplayer, and select the player count and format above. Enjoy the game—and come back whenever you need a reminder.' : allChecked ? 'All set. Confirm that you’re ready to finish this chapter.' : 'Work through the checklist at your own pace. Tick each step as you prepare your table.'}</Feedback>
    </section><div className={styles.tableCta}><div><p className={styles.eyebrow}>Put your knowledge into play</p><h2>The table is yours.</h2><p>{commander ? 'Choose Multiplayer → 4 players → Commander in the tracker.' : 'Choose Multiplayer → 2 players → Standard in the tracker.'} Existing games are kept until you choose to start a new one.</p></div><Link href="/tracker" className={styles.primary}>Open the life tracker ↗</Link></div><div className={styles.noteGrid}><section><h3>Say what you’re doing</h3><p>“Cast this, targeting that.” “Move to combat?” “Any responses?” A few words make a friendly game much easier to follow.</p></section><section><h3>Keep learning together</h3><p>If something surprises you, look up the card or keyword. Agree on a ruling, keep playing, and revisit tricky interactions afterward.</p><Link className={styles.inlineLink} href="/glossary">Keep the glossary nearby ↗</Link></section></div></>
}
