import Image from 'next/image'
import Link from 'next/link'
import { CHAPTERS, lessonHref, TERMS, type LessonId } from '@/lib/learn'
import styles from './learn.module.css'

export function CardImage({ card, name, small = false, tapped = false, priority = false }: { card: string; name: string; small?: boolean; tapped?: boolean; priority?: boolean }) {
  return <div className={`${styles.cardImage} ${small ? styles.smallCard : ''} ${tapped ? styles.tapped : ''}`}><Image src={`/learn/${card}.jpg`} alt={name} width={244} height={340} priority={priority} sizes={small ? '130px' : '(max-width: 600px) 210px, 244px'} /></div>
}

export function Term({ name }: { name: keyof typeof TERMS }) {
  return <details className={styles.term}><summary>{name}</summary><p>{TERMS[name]}</p></details>
}

export function ChapterLinks({ active, completed }: { active?: LessonId; completed: LessonId[] }) {
  return <nav aria-label="Course chapters" className={styles.chapterNav}>{CHAPTERS.map((chapter, index) => <Link key={chapter.id} href={lessonHref(chapter.id)} aria-current={chapter.id === active ? 'page' : undefined}><span className={styles.chapterNumber}>{completed.includes(chapter.id) ? <span aria-label="Completed">✓</span> : `0${index + 1}`}</span><span>{chapter.short}</span><span aria-hidden="true">{chapter.id === active ? '←' : ''}</span></Link>)}</nav>
}

export function Feedback({ children, success = false }: { children: React.ReactNode; success?: boolean }) {
  return <div role="status" aria-live="polite" aria-atomic="true" className={`${styles.feedback} ${success ? styles.success : ''}`}>{children}</div>
}
