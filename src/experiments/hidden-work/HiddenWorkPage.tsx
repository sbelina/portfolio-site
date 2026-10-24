import React, { useEffect, useRef, useState } from 'react'
import { ExperimentNote } from '../../components/ExperimentNote'
import { hiddenWork, processGeometry } from './content'
import type { MotionLayer } from './sketch'

type MotionState = 'idle' | 'loading' | 'playing' | 'complete' | 'unavailable'

export function HiddenWorkPage() {
  const [enhanced, setEnhanced] = useState(false)
  const [open, setOpen] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(true)
  const [visible, setVisible] = useState(false)
  const [foreground, setForeground] = useState(true)
  const [motion, setMotion] = useState<MotionState>('idle')
  const details = useRef<HTMLDetailsElement>(null)
  const summary = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const layer = useRef<MotionLayer | null>(null)
  const active = open && !reduced && !paused && visible && foreground

  useEffect(() => {
    // A native disclosure may already have been opened before hydration.
    setOpen(details.current?.open ?? false)
    setEnhanced(true)
    // A missing preference/visibility API fails to the complete static explanation.
    try {
      const media = matchMedia('(prefers-reduced-motion: reduce)')
      const update = () => setReduced(media.matches)
      update(); media.addEventListener('change', update)
      return () => media.removeEventListener('change', update)
    } catch { setReduced(true) }
  }, [])
  useEffect(() => {
    const visibility = () => setForeground(document.visibilityState === 'visible')
    visibility(); document.addEventListener('visibilitychange', visibility)
    return () => document.removeEventListener('visibilitychange', visibility)
  }, [])
  useEffect(() => {
    if (!open || !host.current || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: .05 })
    observer.observe(host.current)
    return () => { observer.disconnect(); setVisible(false) }
  }, [open])
  useEffect(() => {
    if (!open || reduced) {
      layer.current?.destroy(); layer.current = null; setMotion('idle')
    }
  }, [open, reduced])
  // Abandoned/hidden/reduced-motion imports cannot mount a sketch.
  useEffect(() => {
    if (!active || layer.current) return
    let cancelled = false
    setMotion('loading')
    import('./sketch').then(({ createMotion }) => {
      if (cancelled || !host.current) return
      layer.current = createMotion(host.current, hiddenWork, () => setMotion('complete'))
      layer.current.setRunning(true)
      setMotion('playing')
    }).catch(() => { if (!cancelled) setMotion('unavailable') })
    return () => { cancelled = true }
  }, [active])
  useEffect(() => { layer.current?.setRunning(active) }, [active])
  useEffect(() => () => { layer.current?.destroy() }, [])

  const reset = () => {
    if (details.current) details.current.open = false
    setOpen(false); setPaused(false)
    summary.current?.focus({ preventScroll: true })
  }
  const status = reduced ? 'Static view · reduced motion or motion unavailable'
    : motion === 'unavailable' ? 'Motion unavailable · the full explanation remains below'
    : motion === 'complete' ? 'Trace complete · the full explanation stays in place'
    : !foreground || !visible ? 'Motion paused while out of view'
    : paused ? 'Motion paused · the explanation stays in place'
    : motion === 'loading' ? 'Loading optional motion · the explanation is ready'
    : 'Tracing illustrative relationships'

  return <>
    <a className="main-skip-link" href="#experiment">Skip to experiment</a>
    <main className="hidden-work-page" id="experiment" tabIndex={-1}>
      <header className="experiment-header"><a href="/#index">△ Producing Curiosity</a><a href="/#work">Back to the portfolio</a></header>
      <p className="eyebrow">An interaction experiment · illustrative content</p>
      <h1>{hiddenWork.title}</h1>
      <p className="experiment-question">{hiddenWork.question}</p>
      <p className="experiment-lead">A tidy sequence can leave out the work between its labels. Open the layer beneath this one; the original stays in sight.</p>
      <p className="experiment-limitation">{hiddenWork.provenance.description}</p>

      <section className="process-experiment" aria-label="Illustrative process">
        <div className="process-overview">
          <p className="track-label">Simplified process <span>— categorical sequence</span></p>
          <svg className="overview-line" viewBox="0 0 800 36" aria-hidden="true" preserveAspectRatio="none"><path d="M133 18H667"/><circle cx="133" cy="18" r="4"/><circle cx="400" cy="18" r="4"/><circle cx="667" cy="18" r="4"/></svg>
          <ol className="process-stages">{hiddenWork.stages.map(stage => <li key={stage.id}>{stage.label}</li>)}</ol>
        </div>
        <details className="work-disclosure" ref={details} onToggle={event => setOpen(event.currentTarget.open)}>
          <summary ref={summary}>Reveal the hidden work <span aria-hidden="true">↳</span></summary>
          <div className="hidden-layer">
            <h2>The work beneath the labels</h2>
            <p>The faint upper track is the same original sequence. Dashed connections below are illustrative. Violet marks an unresolved question, coral marks friction, and teal marks a learning opportunity.</p>
            <div className="process-drawing" aria-hidden="true">
              <svg viewBox="0 0 800 300" preserveAspectRatio="none">
                <path className="initial-trace" d="M133 45H667"/>
                {processGeometry(hiddenWork).map(path => <path key={path.id} className={`work-path work-path--${path.kind}`} d={`M${path.from.x} ${path.from.y}L${path.to.x} ${path.to.y}`}/>)}
                {hiddenWork.stages.map((stage, i) => <circle key={stage.id} className="initial-trace" cx={(i + .5) * 800 / hiddenWork.stages.length} cy="45" r="5"/>)}
                {processGeometry(hiddenWork).map(path => <circle className={`work-node work-path--${path.kind}`} key={path.id} cx={path.to.x} cy={path.to.y} r="5"/>)}
              </svg>
              <div className="motion-host" ref={host}/>
              <div className="diagram-labels">
                {hiddenWork.stages.map(stage => <div key={stage.id}><span className="diagram-stage">{stage.label}</span>{hiddenWork.work.filter(item => item.stageId === stage.id).map(item => <span className={`diagram-work meaning--${item.meaning}`} key={item.id}>{item.label}</span>)}</div>)}
              </div>
            </div>
            <p className="narrow-diagram-note">Simplified connection sketch. Read the labels and full account below.</p>
            {enhanced && <div className="motion-controls">
              <button type="button" disabled={reduced || motion === 'complete' || motion === 'unavailable' || motion === 'loading'} onClick={() => setPaused(value => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button>
              <button type="button" onClick={reset}>Reset experiment</button>
              <p role="status" aria-live="polite">{status}</p>
            </div>}
            <div className="work-accounts">{hiddenWork.stages.map(stage => <section key={stage.id} aria-labelledby={`stage-${stage.id}`}>
              <h3 id={`stage-${stage.id}`}>{stage.label}</h3>
              {hiddenWork.work.filter(item => item.stageId === stage.id).map(item => <article key={item.id}>
                <p className={`work-meaning meaning--${item.meaning}`}>{item.meaning === 'learning' ? '◇ Learning opportunity' : item.meaning === 'friction' ? '↶ Friction / rework' : '? Unresolved'}</p>
                <h4>{item.label}</h4><p>{item.explanation}</p>
              </article>)}
            </section>)}</div>
            <h3>Why these steps connect</h3>
            <ul className="relationship-list">{hiddenWork.relationships.map(relationship => <li key={relationship.id}><strong>Illustrative {relationship.kind}.</strong> {relationship.explanation}</li>)}</ul>
            <p className="experiment-limitation">{hiddenWork.provenance.limitation}</p>
          </div>
        </details>
      </section>
      <section className="experiment-reading" aria-labelledby="reading-question">
        <h2 id="reading-question">What would make this more than an illustration?</h2>
        <p>A real account needs source passages, people’s descriptions of the work, and reviewed relationships. This prototype tests a way to reveal those accounts; it supplies none of that evidence itself.</p>
        <p>The next question is whether readers can distinguish the simplified view, the extra work, and the limits of the explanation. No reader study or improved comprehension is claimed.</p>
      </section>
    </main>
    <footer className="site-footer experiment-footer"><span>© {new Date().getFullYear()} Sami Belina</span><a href="/#index">Return to the portfolio</a><ExperimentNote/><p className="motion-license">Optional motion: <a href="https://p5js.org/">p5.js</a> 1.11.13 · <a href="/licenses/p5-LGPL-2.1.txt">LGPL-2.1</a> · <a href="https://github.com/processing/p5.js/tree/v1.11.13">library source</a></p></footer>
  </>
}
