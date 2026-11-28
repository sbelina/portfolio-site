import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import { Stressed } from '../content/emphasis'
import { FigureLegend } from './CaseFigures'

/**
 * Interaction components. Each renders its complete meaning as HTML
 * first; JavaScript only adds a control. Styles live in motion.css. None of them encodes data.
 */

/** 2 + E · The deck's imagery: faint strands, a lens (a check), a plane (a commitment) and the orange thread. */
export function StrandLine({ caption = 'FIG · Conceptual illustration · strands are not data' }: { caption?: string }) {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    // The travelling mark is SMIL; pause it for readers who ask for reduced motion.
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) ref.current?.pauseAnimations?.()
  }, [])
  const thread = 'M12 118 C 92 34, 168 170, 268 100 S 420 96, 548 96'
  return <figure className="pc-strand">
    <svg ref={ref} viewBox="0 0 560 190" role="img" aria-labelledby="pc-strand-title">
      <title id="pc-strand-title">Many faint strands cross a lens and a plane. One orange thread runs through them and settles into a calm line.</title>
      <path className="pc-strand-faint" d="M12 44 C 120 12, 180 150, 300 76 S 470 30, 548 112"/>
      <path className="pc-strand-faint" d="M12 150 C 96 176, 170 30, 290 126 S 440 168, 548 70"/>
      <path className="pc-strand-faint" d="M12 90 C 110 70, 200 178, 310 46 S 470 140, 548 150"/>
      <ellipse className="pc-strand-lens" cx="268" cy="100" rx="20" ry="56"/>
      <rect className="pc-strand-plane" x="392" y="58" width="12" height="80"/>
      <path className="pc-strand-thread" pathLength={1} d={thread}/>
      <circle className="pc-strand-mark" r="5"><animateMotion dur="6s" repeatCount="indefinite" path={thread}/></circle>
      <text x="232" y="180">LENS · A CHECK</text><text x="362" y="180">PLANE · A COMMITMENT</text><text x="12" y="180">THE THREAD I FOLLOWED</text>
    </svg>
    <FigureLegend items={[{ kind: 'thread', label: 'The thread followed' }, { kind: 'check', label: 'A check' }, { kind: 'inferred', label: 'Strands: variation, not data' }]}/>
    <figcaption>{caption}</figcaption>
  </figure>
}

/** 4 · How I know, in layers: what was observed, how it was interpreted, what was decided. */
export function LayerStack({ observed, interpreted, decided }: { observed: string; interpreted: string; decided: string }) {
  const [enhanced, setEnhanced] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => setEnhanced(true), [])
  const layers = [['observed', 'Observed', observed], ['interpreted', 'Interpreted', interpreted], ['decided', 'Decided', decided]] as const
  return <section className="pc-layers" aria-labelledby="pc-layers-title" data-enhanced={enhanced ? 'true' : undefined} data-open={open ? 'true' : undefined}>
    <h2 id="pc-layers-title">Observed, interpreted, decided</h2>
    <p>Three layers of the same case, kept apart: what was seen, what it was taken to mean, and what was chosen.</p>
    <div className="pc-layers-stage"><ol className="pc-layers-stack">{layers.map(([key, label, text]) => <li key={key} data-layer={key}><span className="pc-layers-name">{label}</span><Stressed text={text}/></li>)}</ol></div>
    {enhanced ? <button type="button" aria-pressed={open} onClick={() => setOpen(value => !value)}>{open ? 'Stack the layers' : 'Pull the layers apart'}</button> : null}
  </section>
}

/** 5 · An annotated plate: a schematic with numbered pins, and notes joined by leader lines. */
export function AnnotatedPlate({ title, parts, caption }: { title: string; parts: readonly { pin: string; note: string; detail: string }[]; caption: string }) {
  return <section className="pc-plate" aria-label={title}>
    <figure className="pc-plate-figure" aria-hidden="true">{parts.map((part, index) => <div key={part.pin} data-pin={index + 1}>{part.pin}</div>)}</figure>
    <ol className="pc-plate-notes">{parts.map(part => <li key={part.pin}><strong>{part.note}</strong>{part.detail}</li>)}</ol>
    <p className="pc-plate-label">{caption}</p>
  </section>
}

/** D · Source markers that open in place. Native popover: works without JavaScript, closes with Escape. */
export function SourceCites({ sources, idPrefix }: { sources: readonly { id: string; title: string; source: string; locator: string; limitations: string }[]; idPrefix: string }) {
  return <>{sources.map((source, index) => {
    const id = `${idPrefix}-${index + 1}`
    return <React.Fragment key={source.id}>
      <button type="button" className="pc-cite" popoverTarget={id} aria-label={`Source ${index + 1}: ${source.title}`}>[{index + 1}]</button>
      {/* Spans, not div and p: the citation sits inside a paragraph, where block elements are invalid HTML and break hydration. */}
      <span id={id} popover="auto" className="pc-source pc-flow" role="note">
        <span className="pc-source-line"><strong>{source.title}</strong></span>
        <span className="pc-source-line">{source.source}. {source.locator}.</span>
        <span className="pc-source-line">{source.limitations}</span>
        <button type="button" popoverTarget={id} popoverTargetAction="hide">Close</button>
      </span>
    </React.Fragment>
  })}</>
}

/** F · A number that resolves from one value to another as it scrolls in. The resting value is the real one. */
export function Count({ from, to, label }: { from: number; to: number; label: string }) {
  return <span className="pc-count" role="img" aria-label={label} style={{ '--pc-count-from': from, '--pc-count-to': to } as React.CSSProperties}/>
}

/**
 * J · A figure pinned beside the text, switching state as the reader passes each section.
 * Without JavaScript both states are shown, the current one unmarked.
 */
export function PinnedStory({ children, states, sectionState }: { children: ReactNode; states: readonly { id: 'before' | 'after'; label: string; summary: string }[]; sectionState: Readonly<Record<string, 'before' | 'after'>> }) {
  const text = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'before' | 'after' | undefined>(undefined)
  useEffect(() => {
    const sections = Object.keys(sectionState).map(id => text.current?.querySelector<HTMLElement>(`#${CSS.escape(id)}`)).filter((section): section is HTMLElement => !!section)
    if (!sections.length || !('IntersectionObserver' in window)) return
    setState('before')
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) setState(sectionState[entry.target.id])
    }, { rootMargin: '-35% 0px -55% 0px' })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [sectionState])
  return <div className="pc-pinned">
    <div className="pc-pinned-text" ref={text}>{children}</div>
    <aside className="pc-pin pc-stack" aria-label="The process, before and after" data-state={state} data-enhanced={state ? 'true' : undefined}>
      <span className="pc-pin-kicker">Where the case is</span>
      {states.map(item => <p key={item.id} className="pc-pin-state" data-state={item.id} aria-current={state === item.id ? 'step' : undefined}><strong>{item.label}</strong><Stressed text={item.summary}/></p>)}
    </aside>
  </div>
}
