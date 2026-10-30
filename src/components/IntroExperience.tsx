import React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const STEPS = [
  'step 1: question the boundaries',
  'step 2: test the limits',
  'step 3: recognize patterns',
  'dive in',
]

type Phase = 'question' | 'steps' | 'dive'
type Effect = 'idle' | 'resist-one' | 'resist-two' | 'breakthrough'

type Props = {
  forceReplayKey: number
  onComplete: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export function IntroExperience({ forceReplayKey, onComplete }: Props) {
  const shellRef = useRef<HTMLElement>(null)
  const lockRef = useRef(false)
  const completedRef = useRef(0)
  const wheelReadyAtRef = useRef(0)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)
  const timersRef = useRef<Set<number>>(new Set())
  const [phase, setPhase] = useState<Phase>('question')
  const [revealed, setRevealed] = useState(false)
  const [step, setStep] = useState(0)
  const [effect, setEffect] = useState<Effect>('idle')
  const [vector, setVector] = useState({ x: 0.12, y: -1 })
  const [status, setStatus] = useState('')
  const [diveProgress, setDiveProgress] = useState(0)
  const [diving, setDiving] = useState(false)
  const [drag, setDrag] = useState({ x: 0, y: 0 })

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current.clear()
  }, [])

  const schedule = useCallback((callback: () => void, delay: number) => {
    const timer = window.setTimeout(() => {
      timersRef.current.delete(timer)
      callback()
    }, delay)
    timersRef.current.add(timer)
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    window.scrollTo({ top: 0, behavior: 'instant' })
    setPhase('question')
    setRevealed(false)
    setStep(0)
    setEffect('idle')
    setStatus('')
    setDiveProgress(0)
    setDiving(false)
    setDrag({ x: 0, y: 0 })
    pointerStartRef.current = null
    suppressClickRef.current = false
    lockRef.current = false
    completedRef.current = 0
    wheelReadyAtRef.current = 0
    schedule(() => setRevealed(true), reducedMotion ? 0 : 680)
  }, [clearTimers, reducedMotion, schedule])

  useEffect(() => {
    reset()
    return clearTimers
  }, [forceReplayKey, reset, clearTimers])

  // Each accepted action completes one authored step. Only the final dive is automatic.
  const begin = useCallback((nextVector = { x: 0.12, y: -1 }) => {
    if (lockRef.current || completedRef.current >= 3) return
    const completed = ++completedRef.current
    if (completed === 1) clearTimers()
    setRevealed(true)
    setVector(nextVector)
    setPhase('steps')
    setStep(Math.min(completed, 2))
    setEffect(completed === 1 ? 'resist-one' : completed === 2 ? 'resist-two' : 'breakthrough')
    setStatus(completed === 1 ? 'Question the boundaries. Step 2: test the limits. Activate to continue.' : completed === 2 ? 'Test the limits. Step 3: recognize patterns. Activate to continue.' : 'Recognize patterns. The page opens automatically.')
    if (completed === 3) {
      lockRef.current = true
      if (reducedMotion) { onComplete(); return }
      schedule(() => {
        setStep(3)
        setEffect('idle')
        setPhase('dive')
        setStatus('The page opens.')
      }, 650)
    }
  }, [clearTimers, reducedMotion, onComplete, schedule])

  useEffect(() => {
    if (phase === 'dive') return
    const shell = shellRef.current
    if (!shell) return

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8 && Math.abs(event.deltaX) < 8) return
      event.preventDefault()
      const now = performance.now()
      const ready = now >= wheelReadyAtRef.current
      wheelReadyAtRef.current = now + 250
      if (!ready) return
      const magnitude = Math.max(Math.abs(event.deltaX), Math.abs(event.deltaY), 1)
      begin({
        x: clamp(event.deltaX / magnitude, -1, 1),
        y: clamp(-event.deltaY / magnitude, -1, 1),
      })
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) return
      const target = event.target as HTMLElement | null
      if (event.repeat || event.altKey || event.ctrlKey || event.metaKey ||
        target?.closest('a, button, input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      begin({ x: 0.16, y: -1 })
    }

    shell.addEventListener('wheel', onWheel, { passive: false })
    shell.addEventListener('keydown', onKeyDown)

    return () => {
      shell.removeEventListener('wheel', onWheel)
      shell.removeEventListener('keydown', onKeyDown)
    }
  }, [begin, phase])

  useEffect(() => {
    if (phase !== 'dive' || diving) return

    const onScroll = () => {
      const shell = shellRef.current
      if (!shell) return
      const rect = shell.getBoundingClientRect()
      const scrollable = Math.max(shell.offsetHeight, 1)
      const progressed = clamp(-rect.top / scrollable, 0, 1)
      setDiveProgress(progressed)
      if (progressed > 0.985) onComplete()
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onComplete, phase, diving])

  useEffect(() => {
    if (phase !== 'dive') return
    schedule(() => setDiving(true), reducedMotion ? 0 : 150)
  }, [phase, reducedMotion, schedule])

  useEffect(() => {
    if (!diving) return
    if (reducedMotion) {
      onComplete()
      return
    }
    const shell = shellRef.current
    if (!shell) return
    const start = window.scrollY
    const target = shell.offsetTop + shell.offsetHeight
    const startedAt = performance.now()
    let frame = 0
    const move = (now: number) => {
      const progress = clamp((now - startedAt) / 900, 0, 1)
      // Continuous movement through the short passage; no blank scroll interval.
      const eased = progress * progress * (3 - 2 * progress)
      setDiveProgress(eased)
      window.scrollTo({ top: start + (target - start) * eased, behavior: 'instant' })
      if (progress < 1) frame = requestAnimationFrame(move)
      else onComplete()
    }
    frame = requestAnimationFrame(move)
    return () => cancelAnimationFrame(frame)
  }, [diving, reducedMotion, onComplete])

  const skip = () => {
    clearTimers()
    onComplete()
  }

  const dive = () => setDiving(true)

  const yieldDistance = effect === 'resist-one' ? 14 : effect === 'resist-two' ? 28 : effect === 'breakthrough' ? 44 : 0
  const dx = yieldDistance * vector.x
  const dy = yieldDistance * vector.y
  const crossX = yieldDistance * -vector.y * 0.24
  const crossY = yieldDistance * vector.x * 0.24
  const scale = effect === 'breakthrough' ? 1.038 : effect === 'resist-two' ? 1.012 : effect === 'resist-one' ? 1.006 : 1
  const diveScale = 1 + diveProgress * 0.34

  const promptText = phase === 'question' ? 'how does one produce curiosity?' : STEPS[step]
  const introTone = phase === 'question'
    ? 'unresolved'
    : effect === 'breakthrough' || step === 3
      ? 'holds'
      : effect === 'resist-one' || effect === 'resist-two'
        ? 'pressure'
        : 'unresolved'

  return (
    <section
      ref={shellRef}
      className={`intro-shell ${phase === 'dive' ? 'intro-shell--dive' : 'intro-shell--locked'}`}
      style={{ '--dive-progress': diveProgress } as React.CSSProperties}
      aria-label="Producing Curiosity introduction"
    >
      <div className="intro-stage">
        <button className="skip-link" type="button" onClick={skip} onPointerUp={(event) => {
          if (event.pointerType === 'touch') {
            event.preventDefault()
            skip()
          }
        }}>Skip introduction</button>

        <div
          className={`intro-field effect-${effect} intro-tone--${introTone}${phase !== 'dive' && !lockRef.current ? ' intro-field--draggable' : ''}`}
          onPointerDown={(event) => {
            suppressClickRef.current = false
            if (phase === 'dive' || lockRef.current || event.button !== 0 || !event.isPrimary) return
            pointerStartRef.current = { x: event.clientX, y: event.clientY }
          }}
          onPointerMove={(event) => {
            const start = pointerStartRef.current
            if (!start) return
            const x = event.clientX - start.x
            const y = event.clientY - start.y
            if (Math.hypot(x, y) < 12) return
            event.currentTarget.setPointerCapture(event.pointerId)
            setDrag({ x: clamp(x * .25, -44, 44), y: clamp(y * .25, -44, 44) })
          }}
          onPointerUp={(event) => {
            const start = pointerStartRef.current
            pointerStartRef.current = null
            setDrag({ x: 0, y: 0 })
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
            if (!start) return
            const x = event.clientX - start.x
            const y = event.clientY - start.y
            if (Math.hypot(x, y) < 22) {
              if (event.pointerType === 'touch') {
                event.preventDefault()
                suppressClickRef.current = true
                begin()
              }
              return
            }
            suppressClickRef.current = true
            const magnitude = Math.max(Math.abs(x), Math.abs(y), 1)
            begin({ x: clamp(x / magnitude, -1, 1), y: clamp(y / magnitude, -1, 1) })
          }}
          onPointerCancel={() => {
            pointerStartRef.current = null
            setDrag({ x: 0, y: 0 })
          }}
          onClickCapture={(event) => {
            if (!suppressClickRef.current) return
            suppressClickRef.current = false
            event.preventDefault()
            event.stopPropagation()
          }}
          onClick={() => begin()}
          style={{
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            '--cross-x': `${crossX}px`,
            '--cross-y': `${crossY}px`,
            '--effect-scale': scale,
            '--dive-scale': diveScale,
            '--dive-progress': diveProgress,
            '--drag-x': `${drag.x}px`,
            '--drag-y': `${drag.y}px`,
          } as React.CSSProperties}
        >
          <div className="intro-source-wrap">
            <div className="mirror-stack" aria-hidden="true">
              <div className="mirror mirror-a">{promptText}</div>
              <div className="mirror mirror-b">{promptText}</div>
              <div className="mirror mirror-c">{promptText}</div>
            </div>

            <div className="intro-source">
              <div className={phase === 'question' ? `question ${revealed ? 'is-revealed' : ''}` : 'step-copy'}>
                {phase === 'question' ? <p className="intro-hint">Step 1: question the boundaries</p> : null}
                <button
                  type="button"
                  className={phase === 'question' ? 'question-trigger' : 'question-trigger step-prompt'}
                  aria-label={phase === 'question' ? 'Begin exploring the question' : STEPS[step]}
                  disabled={effect === 'breakthrough' || phase === 'dive'}
                  onKeyDown={event => { if (event.repeat) event.preventDefault() }}
                  onClick={event => { event.stopPropagation(); begin() }}
                >
                  {phase === 'question' ? <>how does one produce curiosity<span className="question-mark" aria-hidden="true">?</span></> : STEPS[step]}
                </button>
                {phase !== 'dive' && effect !== 'breakthrough' ? <p className="intro-hint">One action per step. Activate the phrase, drag, or swipe. Keyboard: Enter or Space. Skip at any time.</p> : null}
                {phase === 'dive' ? <button type="button" className="dive-arrow" aria-label="Dive into the portfolio" onClick={event => { event.stopPropagation(); dive() }}><span aria-hidden="true">↓</span></button> : null}
              </div>
            </div>
          </div>

          <div className="depth-field" aria-hidden="true">
            <span className="depth-ring depth-ring--one" />
            <span className="depth-ring depth-ring--two" />
            <span className="depth-ring depth-ring--three" />
            <span className="depth-axis depth-axis--one" />
            <span className="depth-axis depth-axis--two" />
            <span className="depth-token depth-token--a depth-token--unresolved">signal</span>
            <span className="depth-token depth-token--b depth-token--unresolved">evidence</span>
            <span className="depth-token depth-token--c depth-token--pressure">turn</span>
            <span className="depth-token depth-token--d depth-token--holds">structure</span>
          </div>
          {phase === 'dive' ? <div className="dive-passage" aria-hidden="true" /> : null}
        </div>

        <p className="sr-only" aria-live="polite">{status}</p>
      </div>
    </section>
  )
}
