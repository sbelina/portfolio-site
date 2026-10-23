import React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const STEPS = [
  'step 1: question the boundaries',
  'step 2: test the limits',
  'step 3: recognize patterns',
  'step 4: dive in',
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
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)
  const suppressClickRef = useRef(false)
  const timersRef = useRef<Set<number>>(new Set())
  const [phase, setPhase] = useState<Phase>('question')
  const [revealed, setRevealed] = useState(false)
  const [step, setStep] = useState(0)
  const [attempt, setAttempt] = useState(0)
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
    setAttempt(0)
    setEffect('idle')
    setStatus('')
    setDiveProgress(0)
    setDiving(false)
    setDrag({ x: 0, y: 0 })
    pointerStartRef.current = null
    suppressClickRef.current = false
    lockRef.current = false
    schedule(() => setRevealed(true), reducedMotion ? 0 : 680)
  }, [clearTimers, reducedMotion, schedule])

  useEffect(() => {
    reset()
    return clearTimers
  }, [forceReplayKey, reset, clearTimers])

  const advanceAttempt = useCallback(
    (nextVector = { x: 0.12, y: -1 }) => {
      if (phase !== 'steps' || step >= 3 || lockRef.current) return
      lockRef.current = true
      setVector(nextVector)

      const nextAttempt = attempt + 1
      const nextEffect: Effect = nextAttempt === 1 ? 'resist-one' : nextAttempt === 2 ? 'resist-two' : 'breakthrough'
      setAttempt(nextAttempt)
      setEffect(nextEffect)

      if (nextAttempt < 3) {
        setStatus(nextAttempt === 1 ? 'The surface yields in that direction, then returns.' : 'The surface yields farther, then returns.')
        schedule(() => {
          setEffect('idle')
          lockRef.current = false
        }, reducedMotion ? 180 : 720)
        return
      }

      setStatus(step === 2 ? 'Pattern recognized. The page opens.' : 'The boundary opens. The next step appears.')
      schedule(() => {
        const nextStep = step + 1
        setStep(nextStep)
        setAttempt(0)
        setEffect('idle')
        if (nextStep === 3) setPhase('dive')
        lockRef.current = false
      }, reducedMotion ? 220 : 820)
    },
    [attempt, phase, reducedMotion, step, schedule],
  )

  useEffect(() => {
    if (phase !== 'steps' || step >= 3) return
    const shell = shellRef.current
    if (!shell) return

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8 && Math.abs(event.deltaX) < 8) return
      event.preventDefault()
      const magnitude = Math.max(Math.abs(event.deltaX), Math.abs(event.deltaY), 1)
      advanceAttempt({
        x: clamp(event.deltaX / magnitude, -1, 1),
        y: clamp(-event.deltaY / magnitude, -1, 1),
      })
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (!['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) return
      const target = event.target as HTMLElement | null
      if (event.altKey || event.ctrlKey || event.metaKey ||
        target?.closest('a, button, input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      advanceAttempt({ x: 0.16, y: -1 })
    }

    shell.addEventListener('wheel', onWheel, { passive: false })
    shell.addEventListener('keydown', onKeyDown)

    return () => {
      shell.removeEventListener('wheel', onWheel)
      shell.removeEventListener('keydown', onKeyDown)
    }
  }, [advanceAttempt, phase, step])

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
    schedule(() => setDiving(true), reducedMotion ? 0 : 2200)
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
      const progress = clamp((now - startedAt) / 1600, 0, 1)
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

  const begin = () => {
    setPhase('steps')
    setStatus('Step 1. Try to move through the page.')
  }

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
          className={`intro-field effect-${effect} intro-tone--${introTone}${phase === 'steps' ? ' intro-field--draggable' : ''}`}
          onPointerDown={(event) => {
            suppressClickRef.current = false
            if (phase !== 'steps' || lockRef.current || event.button !== 0 || !event.isPrimary) return
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
                advanceAttempt()
              }
              return
            }
            suppressClickRef.current = true
            const magnitude = Math.max(Math.abs(x), Math.abs(y), 1)
            advanceAttempt({ x: clamp(x / magnitude, -1, 1), y: clamp(y / magnitude, -1, 1) })
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
          onClick={() => { if (phase === 'steps') advanceAttempt() }}
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
              {phase === 'question' ? (
                <p className={`question ${revealed ? 'is-revealed' : ''}`}>
                  <button
                    type="button"
                    className="question-trigger"
                    aria-label="Begin exploring the question"
                    onClick={begin}
                  >
                    how does one produce curiosity<span className="question-mark" aria-hidden="true">?</span>
                  </button>
                </p>
              ) : (
                <div className="step-copy">
                  {step < 3 ? (
                    <button className="step-prompt" type="button" onClick={(event) => { event.stopPropagation(); advanceAttempt() }}>{STEPS[step]}</button>
                  ) : <p>{STEPS[step]}</p>}
                  {step < 3 ? <p className="intro-hint">Click, drag, scroll, or use the keyboard.</p> : null}
                  {step === 3 ? (
                    <button type="button" className="dive-arrow" aria-label="Dive into the portfolio" onClick={dive}>
                      <span aria-hidden="true">↓</span>
                    </button>
                  ) : null}
                </div>
              )}
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

        {phase === 'steps' && step < 3 ? (
          <button className="assistive-attempt" type="button" onClick={() => advanceAttempt({ x: 0.16, y: -1 })}>
            Test the boundary
          </button>
        ) : null}

        <p className="sr-only" aria-live="polite">{status}</p>
      </div>
    </section>
  )
}
