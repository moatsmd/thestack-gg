'use client'

import { useEffect, useRef } from 'react'

// Nested dialogs can unmount in either order during navigation.
let scrollLocks = 0
let originalOverflow = ''
function lockScroll() {
  if (scrollLocks === 0) {
    originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  scrollLocks += 1
  return () => {
    scrollLocks -= 1
    if (scrollLocks === 0) document.body.style.overflow = originalOverflow
  }
}

/** Focus containment and return for the surrounding modal dialog. */
export function DialogFocus({ onClose }: { onClose: () => void }) {
  const marker = useRef<HTMLSpanElement>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    const dialog = marker.current?.closest<HTMLElement>('[role="dialog"]')
    if (!dialog) return
    const previous = document.activeElement as HTMLElement | null
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex="0"]',
    )).filter(element => !element.hidden)
    const first = focusable()[0]
    first?.focus()
    const unlockScroll = lockScroll()
    const keydown = (event: KeyboardEvent) => {
      // A zoomed image can sit inside a card-detail dialog. Only the topmost
      // modal handles Escape/Tab; the underlying dialog keeps its focus state.
      const dialogs = document.querySelectorAll('[role="dialog"][aria-modal="true"]')
      if (dialogs.length && dialogs[dialogs.length - 1] !== dialog) return
      if (event.key === 'Escape') { event.preventDefault(); close.current(); return }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0], last = items[items.length - 1]
      if (!first) { event.preventDefault(); return }
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', keydown)
    return () => {
      document.removeEventListener('keydown', keydown)
      unlockScroll()
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  return <span ref={marker} hidden />
}
