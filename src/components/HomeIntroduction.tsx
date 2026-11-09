import React, { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { IntroExperience } from './IntroExperience'

const memoryKey = 'producing-curiosity:intro-seen'
class IntroRecovery extends Component<{ children: ReactNode; recover: () => void }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { this.props.recover() }
  render() { return this.state.failed ? null : this.props.children }
}

/** Deterministic initial HTML; storage is a visit preference, never manuscript storage. */
export function useHomeIntroduction() {
  const [visible, setVisible] = useState(false)
  const [ready, setReady] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const initialized = useRef(false)
  const restoreFocus = useRef(false)
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      const show = !location.hash && navigation?.type !== 'back_forward' && !matchMedia('(prefers-reduced-motion: reduce)').matches && localStorage.getItem(memoryKey) !== 'true' && sessionStorage.getItem(memoryKey) !== 'true'
      localStorage.setItem(memoryKey, 'true')
      setVisible(show)
    } catch { setVisible(false) }
    setReady(true)
  }, [])
  const complete = useCallback(() => {
    restoreFocus.current = true
    setVisible(false)
  }, [])
  useEffect(() => {
    if (visible || !restoreFocus.current) return
    const frame = requestAnimationFrame(() => {
      restoreFocus.current = false
      const main = document.getElementById('index')
      main?.focus({ preventScroll: true })
      main?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [visible])
  const replay = useCallback(() => {
    restoreFocus.current = false
    window.scrollTo({ top: 0, behavior: 'instant' })
    setReplayKey(value => value + 1)
    setVisible(true)
  }, [])
  return { visible, ready, replayKey, complete, replay }
}

export function HomeIntroduction({ replayKey, complete }: { replayKey: number; complete: () => void }) {
  const host = useRef<HTMLDivElement>(null)
  useEffect(() => { host.current?.querySelector<HTMLButtonElement>('.question-trigger')?.focus({ preventScroll: true }) }, [])
  return <div className="pc-site pc-intro" data-surface="observatory" ref={host}>
    <IntroRecovery key={replayKey} recover={complete}><IntroExperience diveMode="explicit" forceReplayKey={replayKey} onComplete={complete}/></IntroRecovery>
  </div>
}
