'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { CHAPTERS, lessonHref, type LessonId } from '@/lib/learn'
import { useLearn } from './LearnProvider'
import { ChapterLinks } from './LearnUI'
import { CardLesson, CastLesson, CombatLesson, StackLesson, TableLesson, TurnLesson } from './exercises'
import styles from './learn.module.css'

const exercises = { basics: CardLesson, cast: CastLesson, turn: TurnLesson, combat: CombatLesson, stack: StackLesson, table: TableLesson }

export function Lesson({ id }: { id: LessonId }) {
  const { progress, ready, saving, visit } = useLearn()
  const index = CHAPTERS.findIndex(c => c.id === id)
  const chapter = CHAPTERS[index]
  const Exercise = exercises[id]
  const done = progress.completed.includes(id)
  useEffect(() => { if (ready) visit(id) }, [ready, id, visit])
  return <div className={styles.root}>
    <div className={styles.courseTop}><Link href="/new-players" className={styles.back}>← All chapters</Link><span>{progress.completed.length} of 6 complete</span><progress aria-label="Course progress" max={6} value={progress.completed.length} /></div>
    <div className={styles.lessonLayout}>
      <aside className={styles.sidebar}><p className={styles.eyebrow}>Your first game</p><ChapterLinks active={id} completed={progress.completed} /><p className={styles.saveLabel}>{saving ? 'Your place is saved on this device.' : 'Saving is unavailable. Keep this tab open.'}</p></aside>
      <article className={styles.lessonBody}>
        <details className={styles.mobileChapters}><summary>Chapter {index + 1} of 6 · {chapter.short}</summary><ChapterLinks active={id} completed={progress.completed} /></details>
        <header className={styles.lessonHeader}><p className={styles.eyebrow}>Chapter 0{index + 1} <span> / </span> {chapter.minutes} minute adventure</p><h1>{chapter.title}<span className={styles.titleDot}>.</span></h1><p>{chapter.outcome}</p></header>
        {!saving && <p className={styles.storageNotice}>Progress cannot be saved in this browser. Keep this tab open to continue your lesson.</p>}
        {ready ? <Exercise key={id} /> : <p className={styles.loading} aria-busy="true">Opening your chapter…</p>}
        <footer className={styles.lessonFooter}>
          <div><span className={styles.eyebrow}>{done ? 'Chapter complete' : 'Explore at your pace'}</span><p>{done ? 'Nicely played. Take that knowledge to the next chapter.' : 'Try the exercise above, or explore another chapter. Nothing is locked.'}</p></div>
          <div className={styles.footerActions}>{index > 0 && <Link className={styles.secondary} href={lessonHref(CHAPTERS[index - 1].id)}>← Previous</Link>}<Link className={done ? styles.primary : styles.secondary} href={index < 5 ? lessonHref(CHAPTERS[index + 1].id) : '/new-players'}>{index < 5 ? 'Next chapter →' : 'Back to your course'}</Link></div>
        </footer>
        <details id="card-credits" className={styles.sources}><summary>Rules &amp; card credits</summary><p>Introductory examples assume no other effects unless stated. Card text can change the usual rules. <a href="https://magic.wizards.com/en/rules" target="_blank" rel="noreferrer">Official rules</a>: sections {chapter.rule}.</p><p>Card images via Scryfall; artwork © Wizards of the Coast. Grizzly Bears: D. J. Cleland-Hura. Forest and Island: Bastien Grivet. Hill Giant: Kev Walker. Lightning Bolt: Milivoj Ćeran. Giant Growth: Andreia Ugrai.</p></details>
      </article>
    </div>
  </div>
}
