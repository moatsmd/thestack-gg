/* Lightweight test stub for framer-motion.
 *
 * Real framer-motion's AnimatePresence + mode="wait" keeps both old and new
 * children in the DOM during transitions, which makes wizard step assertions
 * extremely flaky in jsdom (no real animation timers). The visual fidelity of
 * the production build is unaffected — this stub is only used inside Jest. */

import * as React from 'react'

const passThrough = (Tag: any) =>
  React.forwardRef<any, any>(function MotionTag(
    {
      // strip animation-only props so jsdom doesn't warn
      animate,
      initial,
      exit,
      transition,
      whileTap,
      whileHover,
      whileFocus,
      whileInView,
      variants,
      layout,
      layoutId,
      drag,
      dragConstraints,
      onDragEnd,
      onAnimationStart,
      onAnimationComplete,
      ...rest
    },
    ref
  ) {
    return <Tag ref={ref} {...rest} />
  })

const motionProxy: any = new Proxy(
  {},
  {
    get: (_t, key: string) => passThrough(key as any),
  }
)

export const motion = motionProxy
export const AnimatePresence: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>
export const useReducedMotion = () => false
export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => undefined,
  set: () => undefined,
})
export const useMotionValue = (v: any) => ({ get: () => v, set: () => undefined, on: () => () => undefined })
export const useTransform = () => ({ get: () => 0, set: () => undefined, on: () => () => undefined })
export const LazyMotion: React.FC<{ children?: React.ReactNode }> = ({ children }) => <>{children}</>
export const domAnimation = {}
export const domMax = {}

export default { motion, AnimatePresence }
