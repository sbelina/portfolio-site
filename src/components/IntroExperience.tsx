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
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const [phase, setPhase] = useState<Phase>('question')
  const [revealed, setRevealed] = useState(false)
  const [step, setStep] = useState(0)
  const [attempt, setAttempt] = useState(0)
  const [effect, setEffect] = useState<Effect>('idle')
  const [vector, setVector] = useState({ x: 0.12, y: -1 })
  const [status, setStatus] = useState('')
  const [diveProgress, setDiveProgress] = useState(0)

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  const reset = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    setPhase('question')
    setRevealed(false)
    setStep(0)
    setAttempt(0)
    setEffect('idle')
    setStatus('')
    setDiveProgress(0)
    lockRef.current = false
    window.setTimeout(() => setRevealed(true), 680)
  }, [])

  useEffect(() => reset(), [forceReplayKey, reset])

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
        window.setTimeout(() => {
          setEffect('idle')
          lockRef.current = false
        }, reducedMotion ? 180 : 720)
        return
      }

      setStatus(step === 2 ? 'Pattern recognized. The page opens.' : 'The boundary opens. The next step appears.')
      window.setTimeout(() => {
        const nextStep = step + 1
        setStep(nextStep)
        setAttempt(0)
        setEffect('idle')
        if (nextStep === 3) setPhase('dive')
        lockRef.current = false
      }, reducedMotion ? 220 : 820)
    },
    [attempt, phase, reducedMotion, step],
  )

  useEffect(() => {
    if (phase !== 'steps' || step >= 3) return

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
      if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
      event.preventDefault()
      advanceAttempt({ x: 0.16, y: -1 })
    }

    const onTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    const onTouchEnd = (event: TouchEvent) => {
      const start = touchStartRef.current
      const touch = event.changedTouches[0]
      touchStartRef.current = null
      if (!start || !touch) return
      const dx = touch.clientX - start.x
      const dy = touch.clientY - start.y
      if (Math.hypot(dx, dy) < 22) return
      event.preventDefault()
      const magnitude = Math.max(Math.abs(dx), Math.abs(dy), 1)
      advanceAttempt({ x: clamp(dx / magnitude, -1, 1), y: clamp(dy / magnitude, -1, 1) })
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: false })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [advanceAttempt, phase, step])

  useEffect(() => {
    if (phase !== 'dive') return

    const onScroll = () => {
      const shell = shellRef.current
      if (!shell) return
      const rect = shell.getBoundingClientRect()
      const scrollable = Math.max(shell.offsetHeight - window.innerHeight, 1)
      const progressed = clamp(-rect.top / scrollable, 0, 1)
      setDiveProgress(progressed)
      if (progressed > 0.985) onComplete()
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [onComplete, phase])

  const begin = () => {
    setPhase('steps')
    setStatus('Step 1. Try to move through the page.')
  }

  const skip = () => {
    setPhase('dive')
    setStep(3)
    setStatus('Introduction skipped.')
    requestAnimationFrame(() => {
      const shell = shellRef.current
      if (!shell) return
      window.scrollTo({ top: shell.offsetTop + shell.offsetHeight, behavior: reducedMotion ? 'auto' : 'smooth' })
      onComplete()
    })
  }

  const dive = () => {
    window.scrollBy({ top: window.innerHeight * 0.78, behavior: reducedMotion ? 'auto' : 'smooth' })
  }

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
      aria-label="Producing Curiosity introduction"
    >
      <div className="intro-stage">
        <button className="skip-link" type="button" onClick={skip}>Skip introduction</button>

        <div
          className={`intro-field effect-${effect} intro-tone--${introTone}`}
          style={{
            '--dx': `${dx}px`,
            '--dy': `${dy}px`,
            '--cross-x': `${crossX}px`,
            '--cross-y': `${crossY}px`,
            '--effect-scale': scale,
            '--dive-scale': diveScale,
            '--dive-progress': diveProgress,
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
                  <span>how does one produce curiosity</span>
                  <button
                    type="button"
                    className="question-mark"
                    aria-label="Begin exploring the question"
                    onClick={begin}
                  >
                    ?
                  </button>
                </p>
              ) : (
                <div className="step-copy">
                  <p>{STEPS[step]}</p>
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
