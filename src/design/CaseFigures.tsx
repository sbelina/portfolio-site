import React, { useEffect, useState } from 'react'
import type { Blueprint, Investigation, Composition } from '../content/investigation'
import { Stressed } from '../content/emphasis'

/**
 * Case figures (owner direction, 23 November), each after a reference the owner supplied:
 * the method profile (a survey-types infographic), the process dial (a "typical day" clock),
 * the shared legend (a map legend that encodes certainty) and card thumbnails (case-study galleries).
 * Every one reads completely without JavaScript and encodes no data beyond the case's own approved text.
 */

/** The deck's visual vocabulary, explained once and reused under every figure. */
const legendSwatches = {
  established: <line x1="2" y1="8" x2="30" y2="8" className="pc-legend-ink"/>,
  inferred: <line x1="2" y1="8" x2="30" y2="8" className="pc-legend-ink" strokeDasharray="2 4" strokeLinecap="round"/>,
  thread: <line x1="2" y1="8" x2="30" y2="8" className="pc-legend-thread"/>,
  check: <ellipse cx="16" cy="8" rx="5" ry="7" className="pc-legend-check"/>,
  unknown: <circle cx="16" cy="8" r="6" className="pc-legend-ink" strokeDasharray="2 3"/>,
  turn: <circle cx="16" cy="8" r="5" className="pc-legend-turn"/>,
} as const
export type LegendKind = keyof typeof legendSwatches

export function FigureLegend({ items }: { items: readonly { kind: LegendKind; label: string }[] }) {
  return <ul className="pc-legend" aria-label="Key to this figure">{items.map(item => <li key={item.kind + item.label}>
    <svg viewBox="0 0 32 16" width="32" height="16" aria-hidden="true" focusable="false">{legendSwatches[item.kind]}</svg>{item.label}
  </li>)}</ul>
}

const methodRows = [
  { key: 'how', title: 'How it was gathered', tag: 'Mode' },
  { key: 'when', title: 'When', tag: 'Time' },
  { key: 'who', title: 'From whom', tag: 'Sample' },
  { key: 'learn', title: 'What it could establish', tag: 'Purpose' },
] as const
const glyphs: Record<(typeof methodRows)[number]['key'], React.ReactNode> = {
  how: <><circle cx="10" cy="12" r="4"/><path d="M3 26c1-5 4-7 7-7s6 2 7 7"/><rect x="22" y="8" width="14" height="11"/><path d="M29 19v5M25 24h8"/></>,
  when: <><path d="M3 22H37"/><circle cx="8" cy="22" r="2.5"/><circle cx="20" cy="22" r="2.5"/><circle cx="32" cy="22" r="2.5"/><path d="M8 13h24" strokeDasharray="2 3"/></>,
  who: <>{[0, 1, 2, 3].flatMap(row => [0, 1, 2, 3, 4].map(col => <circle key={`${row}-${col}`} cx={6 + col * 7} cy={6 + row * 6} r="1.8" className={(row + col) % 3 === 0 ? 'pc-glyph-fill' : undefined}/>))}</>,
  learn: <><ellipse cx="20" cy="15" rx="7" ry="11" className="pc-legend-check"/><path d="M3 15H37" strokeDasharray="2 3"/></>,
}
const isUnknown = (tag: string) => /not (stated|sampled|recorded)|unknown/i.test(tag)

/** How the evidence was gathered, as four decisions, each with its tags and one plain sentence. */
export function MethodProfile({ method }: { method: NonNullable<Investigation['method']> }) {
  return <section className="pc-method" id="method" aria-labelledby="pc-method-title">
    <h2 id="pc-method-title">How the evidence was gathered</h2>
    <p className="pc-method-lead">Every account rests on four decisions. A decision that was not recorded says so.</p>
    <div className="pc-method-rows">{methodRows.map(row => <section key={row.key} className="pc-method-row" data-row={row.key} aria-labelledby={`pc-method-${row.key}`}>
      <svg className="pc-method-glyph" viewBox="0 0 40 30" aria-hidden="true" focusable="false">{glyphs[row.key]}</svg>
      <div className="pc-method-body">
        <h3 id={`pc-method-${row.key}`}>{row.title} <span className="pc-method-tag">{row.tag}</span></h3>
        <ul className="pc-method-tags">{method[row.key].tags.map(tag => <li key={tag} data-unknown={isUnknown(tag) || undefined}>{tag}</li>)}</ul>
        <p><Stressed text={method[row.key].note}/></p>
      </div>
    </section>)}</div>
  </section>
}

type View = Blueprint['views'][number]
const polar = (angle: number, radius: number) => [120 + radius * Math.cos((angle - 90) * Math.PI / 180), 120 + radius * Math.sin((angle - 90) * Math.PI / 180)] as const
function arc(start: number, end: number, radius: number) {
  const [x1, y1] = polar(start, radius), [x2, y2] = polar(end, radius)
  return `M${x1.toFixed(2)} ${y1.toFixed(2)}A${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}
/** A stage where something changed reads as the change; its cells still mark where problems can surface. */
const stageMark = (stage: View['stages'][number]) => stage.cells.some(cell => cell.mark === 'change') ? 'change' : stage.cells.some(cell => cell.mark === 'failure') ? 'failure' : undefined

function StageDetail({ stage, lanes }: { stage: View['stages'][number]; lanes: Blueprint['lanes'] }) {
  return <ul className="pc-dial-cells">{stage.cells.map((cell, index) => <li key={index} data-mark={cell.mark}>
    <span className="pc-dial-lane">{lanes.find(lane => lane.id === cell.lane)?.label}{cell.mark ? ` · ${cell.mark === 'failure' ? 'problem can surface' : 'what changed'}` : ''}</span>
    <Stressed text={cell.text}/>
  </li>)}</ul>
}

/** The process as a dial: one segment per stage, before and after. Without JavaScript, both as step lists. */
export function ProcessDial({ blueprint }: { blueprint: Blueprint }) {
  const [enhanced, setEnhanced] = useState(false)
  const [viewId, setViewId] = useState<'before' | 'after'>('after')
  const [step, setStep] = useState(0)
  useEffect(() => setEnhanced(true), [])
  const view = blueprint.views.find(item => item.id === viewId)!
  const stages = view.stages
  const current = stages[Math.min(step, stages.length - 1)]
  const span = 360 / stages.length, gap = 4
  const legend = <FigureLegend items={[{ kind: 'thread', label: 'A problem can surface here' }, { kind: 'check', label: 'Verification moved here' }, { kind: 'established', label: 'A step in the process' }]}/>
  if (!enhanced) return <section className="pc-dial" aria-labelledby="pc-dial-title">
    <h2 id="pc-dial-title">Walk the process</h2>
    <div className="pc-dial-static">{blueprint.views.map(item => <div key={item.id}><h3>{item.label}</h3><ol>{item.stages.map(stage => <li key={stage.label} data-mark={stageMark(stage)}><strong>{stage.label}</strong>{stage.note ? ` · ${stage.note}` : ''}<StageDetail stage={stage} lanes={blueprint.lanes}/></li>)}</ol></div>)}</div>
    {legend}
    <p className="pc-dial-caption">FIG · Documented process · simplified; reconstructed for this portfolio</p>
  </section>
  return <section className="pc-dial" aria-labelledby="pc-dial-title">
    <h2 id="pc-dial-title">Walk the process</h2>
    <fieldset className="pc-dial-controls"><legend>Show the process</legend>{blueprint.views.map(item => <label key={item.id}><input type="radio" name="pc-dial-view" checked={viewId === item.id} onChange={() => { setViewId(item.id); setStep(0) }}/>{item.label}</label>)}</fieldset>
    <div className="pc-dial-stage">
      <div className="pc-dial-face">
        <svg viewBox="0 0 240 240" aria-hidden="true" focusable="false">
          <circle cx="120" cy="120" r="104" className="pc-dial-track"/>
          {Array.from({ length: 48 }, (_, tick) => { const [x1, y1] = polar(tick * 7.5, 112), [x2, y2] = polar(tick * 7.5, tick % 6 === 0 ? 120 : 116); return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} className="pc-dial-tick"/> })}
          {stages.map((stage, index) => <path key={stage.label} d={arc(index * span + gap, (index + 1) * span - gap, 96)} className="pc-dial-segment" data-mark={stageMark(stage)} data-current={index === step || undefined}/>)}
        </svg>
        <div className="pc-dial-center" aria-live="polite"><span className="pc-dial-count">{String(step + 1).padStart(2, '0')} / {String(stages.length).padStart(2, '0')}</span><strong>{current.label}</strong>{current.note ? <span className="pc-dial-note">{current.note}</span> : null}</div>
      </div>
      <div className="pc-dial-side">
        <p className="pc-dial-summary"><Stressed text={view.summary}/></p>
        <StageDetail stage={current} lanes={blueprint.lanes}/>
        <div className="pc-dial-steps"><button type="button" onClick={() => setStep(value => Math.max(0, value - 1))} disabled={step === 0}>Previous step</button><button type="button" onClick={() => setStep(value => Math.min(stages.length - 1, value + 1))} disabled={step >= stages.length - 1}>Next step</button></div>
      </div>
    </div>
    {legend}
    <p className="pc-dial-caption">FIG · Documented process · simplified; reconstructed for this portfolio</p>
  </section>
}

/** A small, decorative mark of the case's own distinction for gallery cards; the pair is given as text. */
export function CaseThumb({ composition, left, right }: { composition: Composition; left: string; right: string }) {
  return <div className="pc-thumb">
    <svg viewBox="0 0 160 48" aria-hidden="true" focusable="false">
      {composition === 'boundary' ? <><path d="M8 24H72M88 24H152" className="pc-legend-ink"/><path d="M80 4V44" className="pc-legend-thread" strokeDasharray="3 4"/></> : null}
      {composition === 'comparison' ? <><ellipse cx="62" cy="24" rx="44" ry="17" className="pc-legend-ink"/><ellipse cx="98" cy="24" rx="44" ry="17" className="pc-legend-check"/></> : null}
      {composition === 'network' ? <>{[[20, 10], [30, 36], [48, 16], [58, 40], [40, 26]].map(([x, y]) => <path key={`${x}${y}`} d={`M${x} ${y}L120 24`} className="pc-legend-ink" strokeDasharray="2 4"/>)}<rect x="112" y="16" width="16" height="16" className="pc-legend-turn"/></> : null}
      {composition === 'revision' ? <><path d="M8 32Q50 4 80 32T152 32" className="pc-legend-ink" strokeDasharray="2 4"/><path d="M8 32Q50 44 80 18T152 32" className="pc-legend-thread"/></> : null}
    </svg>
    <span className="pc-thumb-pair">{left} <span aria-hidden="true">≠</span><span className="pc-sr-only">is not</span> {right}</span>
  </div>
}

/**
 * Before and after, near the top of each case (owner direction, 24 November, after portfolio research:
 * reviewers look for the change first). Built only from the case's approved text: before is the
 * explanation people held, with the two things drawn as one; after is what changed, with them drawn apart.
 * Static, so it reads the same with or without JavaScript.
 */
export function BeforeAfter({ left, right, before, after }: { left: string; right: string; before: string; after: string }) {
  return <section className="pc-ba" aria-labelledby="pc-ba-title">
    <h2 id="pc-ba-title">Before and after</h2>
    <div className="pc-ba-grid">
      <figure className="pc-ba-panel" data-state="before">
        <p className="pc-kicker">Before · taken as one</p>
        <svg viewBox="0 0 240 90" aria-hidden="true" focusable="false"><circle cx="120" cy="45" r="26" className="pc-legend-ink" strokeDasharray="2 4"/><circle cx="124" cy="45" r="26" className="pc-legend-ink" strokeDasharray="2 4"/><circle cx="122" cy="45" r="4" className="pc-ba-dot"/></svg>
        <p className="pc-ba-pair">{left} <span className="pc-ba-sign" aria-hidden="true">=</span><span className="pc-sr-only">was treated as</span> {right}</p>
        <figcaption><Stressed text={before}/></figcaption>
      </figure>
      <figure className="pc-ba-panel" data-state="after">
        <p className="pc-kicker">After · kept apart</p>
        <svg viewBox="0 0 240 90" aria-hidden="true" focusable="false"><line x1="62" y1="45" x2="178" y2="45" className="pc-legend-thread"/><circle cx="120" cy="45" r="9" className="pc-legend-turn" strokeDasharray="2 3"/><circle cx="62" cy="45" r="7" className="pc-ba-dot"/><circle cx="178" cy="45" r="7" className="pc-ba-dot pc-ba-dot--turn"/></svg>
        <p className="pc-ba-pair">{left} <span className="pc-ba-sign" aria-hidden="true">≠</span><span className="pc-sr-only">is not</span> <strong className="pc-turn">{right}</strong></p>
        <figcaption><Stressed text={after}/></figcaption>
      </figure>
    </div>
    <p className="pc-ba-caption">FIG · Before and after · drawn from this case study’s own account</p>
  </section>
}
