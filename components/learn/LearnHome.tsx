'use client'

import Link from 'next/link'
import { CHAPTERS, lessonHref } from '@/lib/learn'
import { useLearn } from './LearnProvider'
import { CardImage } from './LearnUI'
import styles from './learn.module.css'

export function LearnHome() {
  const { progress, ready, saving } = useLearn()
  const started = ready && (progress.current !== 'basics' || Object.keys(progress.exercises).length > 0 || progress.completed.length > 0)
  const finished = progress.completed.length === CHAPTERS.length
  const current = CHAPTERS.find(c => c.id === progress.current)!
  return <div className={styles.root}>
    <header className={styles.homeHero}>
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>The first chapter is yours</p>
        <h1>Learn the cards.<br /><em>Love the game.</em></h1>
        <p className={styles.lede}>Your first spell. Your first clever block. Your first “in response.” Get a feel for Magic, one small adventure at a time.</p>
        <div className={styles.heroActions}><Link className={styles.primary} href={lessonHref(finished ? 'table' : started ? progress.current : 'basics')}>{finished ? 'Return to your table' : started ? 'Resume learning' : 'Start your first lesson'} <span aria-hidden="true">↗</span></Link><span className={styles.quiet}>6 short chapters · About 20 minutes<br />No account. Learn at your own pace.</span></div>
        {started && <p className={styles.resumeNote}>{finished ? 'All six chapters complete. Your table is waiting.' : `Up next: ${current.title}`} · {progress.completed.length} of 6 complete</p>}
        {!saving && <p className={styles.storageNotice}>Progress cannot be saved in this browser. You can still finish the course here.</p>}
      </div>
      <div className={styles.heroCards} aria-label="Magic cards featured in the course"><div className={styles.fanBack}><CardImage card="forest" name="Forest — a basic land that produces green mana" priority /></div><div className={styles.fanFront}><CardImage card="bears" name="Grizzly Bears — a 2/2 creature costing one generic and one green mana" priority /></div><div className={styles.heroCaption}>A land. A creature.<br /><em>A world of possibilities.</em></div></div>
    </header>

    <section className={styles.courseSection} aria-labelledby="course-title">
      <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>From your first card to your first table</p><h2 id="course-title">A little knowledge.<br /><em>A lot of possibility.</em></h2></div><p>Read a little. Try it yourself.<br />Every chapter gives you a move to make.</p></div>
      <div className={styles.courseList}>{CHAPTERS.map((chapter, i) => <Link href={lessonHref(chapter.id)} key={chapter.id} className={styles.courseRow}>
        <span className={styles.rowNumber}>{progress.completed.includes(chapter.id) ? <span aria-label="Completed">✓</span> : `0${i + 1}`}</span>
        <div className={styles.rowCopy}><h3>{chapter.title}</h3><p>{chapter.description}</p></div>
        <span className={styles.rowTime}>{progress.completed.includes(chapter.id) ? 'Completed' : `${chapter.minutes} min`}</span><span className={styles.rowArrow} aria-hidden="true">↗</span>
      </Link>)}</div>
    </section>
    <aside className={styles.referenceShelf}><div><p className={styles.eyebrow}>Already at the table?</p><h2>A little help, right when you need it.</h2><p>Jump straight to a reference or get your game underway.</p></div><div className={styles.referenceLinks}><Link href="/glossary">Look up a keyword ↗</Link><Link href="/stack">See the stack in motion ↗</Link><Link href="/new-players/table">Set up a first game ↗</Link><Link href="/tracker">Open the life tracker ↗</Link></div></aside>
    <p className={styles.credit}>Card imagery via Scryfall. Magic: The Gathering and card artwork © Wizards of the Coast. <Link href="/new-players/basics#card-credits">Card credits</Link></p>
  </div>
}
