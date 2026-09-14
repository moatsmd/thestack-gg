'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { emptyExercise, emptyProgress, LEARN_STORAGE_KEY, parseProgress, type ExerciseState, type LearnProgress, type LessonId } from '@/lib/learn'

type CourseContext = { progress: LearnProgress; ready: boolean; saving: boolean; visit: (id: LessonId) => void; exercise: (id: LessonId, next: ExerciseState, complete?: boolean) => void; setFormat: (format: LearnProgress['format']) => void }
const Context = createContext<CourseContext | null>(null)

export function LearnProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState(emptyProgress)
  const current = useRef(progress)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(true)
  useEffect(() => {
    try { current.current = parseProgress(localStorage.getItem(LEARN_STORAGE_KEY)); setProgress(current.current) } catch { setSaving(false) }
    setReady(true)
    const refresh = (event: StorageEvent) => {
      if (event.key !== LEARN_STORAGE_KEY) return
      current.current = parseProgress(event.newValue)
      setProgress(current.current)
    }
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [])
  const update = useCallback((change: (previous: LearnProgress) => LearnProgress) => {
    const next = change(current.current)
    current.current = next
    setProgress(next)
    try { localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(next)); setSaving(true) } catch { setSaving(false) }
  }, [])
  const visit = useCallback((id: LessonId) => update(p => ({ ...p, current: id })), [update])
  const exercise = useCallback((id: LessonId, state: ExerciseState, complete = false) => update(p => ({ ...p, current: id, exercises: { ...p.exercises, [id]: state }, completed: complete ? [...new Set([...p.completed, id])] : p.completed })), [update])
  const setFormat = useCallback((format: LearnProgress['format']) => update(p => ({ ...p, format })), [update])
  return <Context.Provider value={{ progress, ready, saving, visit, exercise, setFormat }}>{children}</Context.Provider>
}

export function useLearn() {
  const value = useContext(Context)
  if (!value) throw new Error('Learn components require LearnProvider')
  return value
}

export function useExercise(id: LessonId) {
  const course = useLearn()
  return { state: course.progress.exercises[id] ?? emptyExercise(), done: course.progress.completed.includes(id), save: (state: ExerciseState, complete = false) => course.exercise(id, state, complete) }
}
