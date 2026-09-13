'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { DieResult, DieType } from '@/lib/dice-rolloff'
import type { createDiceScene } from '@/lib/dice-scene'

export function DiceTray({ dice, rolling, rollId, reducedMotion = false }: { dice: DieResult[]; rolling: boolean; rollId: number; reducedMotion?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<ReturnType<typeof createDiceScene> | null>(null)
  const latestRef = useRef({ dice, rolling, rollId, reducedMotion })
  latestRef.current = { dice, rolling, rollId, reducedMotion }
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading')
  useEffect(() => {
    let cancelled = false
    if (!('WebGL2RenderingContext' in window)) { setStatus('fallback'); return }
    import('@/lib/dice-scene').then(({ createDiceScene }) => {
      if (cancelled || !containerRef.current) return
      sceneRef.current = createDiceScene(containerRef.current, () => setStatus('fallback'))
      const current = latestRef.current
      sceneRef.current.update(current.dice, current.rolling, current.rollId, current.reducedMotion)
      setStatus('ready')
    }).catch(() => { if (!cancelled) setStatus('fallback') })
    return () => { cancelled = true; sceneRef.current?.dispose(); sceneRef.current = null }
  }, [])
  useEffect(() => { sceneRef.current?.update(dice, rolling, rollId, reducedMotion) }, [dice, rolling, rollId, reducedMotion])
  return (
    <div className="relative w-full h-[320px] sm:h-[410px] overflow-hidden" role="img" aria-label={rolling ? 'Dice tumbling across the tray' : dice.map(({ die, result }) => `d${die}: ${result}`).join(', ')}>
      <div ref={containerRef} aria-hidden="true" className={`absolute inset-0 ${status === 'fallback' ? 'invisible' : ''}`} />
      {status !== 'ready' && (
        <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[radial-gradient(ellipse_at_center,#17362f_0%,#111c1b_60%,#111617_100%)]">
          <div className="flex flex-wrap justify-center gap-3 px-8">
            {dice.map(({ die, result }, index) => <div key={index} className="w-20 h-24 border border-amber-200/40 bg-emerald-950/50 grid place-content-center text-center rotate-3 shadow-xl"><span className="font-display text-4xl text-amber-100">{rolling ? '·' : result}</span><span className="text-xs text-amber-200/60">d{die}</span></div>)}
          </div>
          <span className="text-xs text-amber-100/50">{status === 'loading' ? 'Preparing the tray…' : 'Simple dice view'}</span>
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none shadow-[inset_0_0_70px_20px_rgba(9,13,14,0.75)]" />
      <span aria-hidden="true" className="absolute top-5 left-5 font-display text-[9px] tracking-[0.32em] uppercase text-amber-100/40">The rolling table</span>
      <span aria-hidden="true" className="absolute bottom-4 right-5 font-display text-[9px] tracking-[0.22em] uppercase text-amber-100/40">{rolling ? 'In motion' : 'At rest'}</span>
    </div>
  )
}

export function Die3D({ value, rolling, faces = 20 }: { value: number; rolling: boolean; size?: number; faces?: number }) {
  const dice = useMemo(() => [{ die: faces as DieType, result: Math.max(1, value) }], [faces, value])
  return <DiceTray dice={dice} rolling={rolling} rollId={value} />
}
