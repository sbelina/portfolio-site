import React, { useEffect, useState } from 'react'
import { count } from '../analytics'

/**
 * Related. Not equivalent. as a field to explore.
 *
 * Each published case is one point of light: two related things that someone took for one. The reader
 * chooses a point, says whether the two are the same, and the point splits to show where they part.
 * Predicting first is the pattern of the New York Times' "You Draw It" and Nicky Case's explorables:
 * it raises surprise and engagement, though studies do not show better recall, so the full text is
 * always one disclosure away. The field is drawn on the observatory surface, after the constellation
 * references the owner supplied; numbered frames mark the chosen point.
 *
 * Without JavaScript, every point is already split and every pair is listed as text with its link.
 * Pairs come only from approved case visuals; no relationship between cases is drawn or implied.
 */
export type FieldPair = { slug: string; label: string; left: string; right: string; explanation: string; changed?: string; href: string }

/** Fixed positions in a 800 × 440 field; the layout is composition, not data. */
const spots: readonly (readonly [number, number])[] = [[150, 120], [395, 78], [640, 132], [232, 312], [500, 268], [612, 366]]
const split = 46

/** A seeded scatter of dust, identical on server and client. */
const dust = Array.from({ length: 110 }, (_, index) => {
  const a = Math.sin(index * 12.9898) * 43758.5453, b = Math.sin(index * 78.233) * 12345.6789
  return { x: Math.round((a - Math.floor(a)) * 800), y: Math.round((b - Math.floor(b)) * 440), r: index % 9 === 0 ? 1.6 : index % 3 === 0 ? 1 : .6 }
})

type Answer = 'same' | 'different'

export function RelatedField({ pairs }: { pairs: readonly FieldPair[] }) {
  const items = pairs.slice(0, spots.length)
  const [enhanced, setEnhanced] = useState(false)
  const [chosen, setChosen] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, Answer>>({})
  useEffect(() => setEnhanced(true), [])
  // Without JavaScript the resting state is complete: every point split, every pair labelled.
  const isSplit = (slug: string) => !enhanced || slug in answers
  const current = items.find(item => item.slug === chosen)
  const splitCount = items.filter(item => item.slug in answers).length
  const index = current ? items.indexOf(current) : -1
  const answer = (value: Answer) => { if (!current) return; count('field-split', `${current.slug} ${value}`); setAnswers(previous => ({ ...previous, [current.slug]: value })) }
  const splitAll = () => { count('field-split-all'); setAnswers(previous => Object.fromEntries(items.map(item => [item.slug, previous[item.slug] ?? 'different']))) }
  const complete = enhanced && splitCount === items.length

  return <div className="pc-field" data-enhanced={enhanced || undefined} data-complete={complete || undefined}>
    <div className="pc-field-stage pc-night" data-surface="observatory">
      <svg viewBox="0 0 800 440" aria-hidden="true" focusable="false" className="pc-field-sky">
        {dust.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} className="pc-field-dust"/>)}
        {complete ? <path className="pc-field-pattern" d={`M${items.map((_, i) => spots[i].join(' ')).join(' L')}`}/> : null}
        {items.map((item, i) => {
          const [x, y] = spots[i]
          const open = isSplit(item.slug), active = item.slug === chosen
          return <g key={item.slug} className="pc-field-star" data-split={open || undefined} data-active={active || undefined} transform={`translate(${x} ${y})`}>
            {active ? <g className="pc-field-frame"><rect x={-split - 30} y={-34} width={(split + 30) * 2} height={68}/><text x={-split - 30} y={-40}>{String(i + 1).padStart(2, '0')}</text></g> : null}
            <circle r="16" className="pc-field-halo"/>
            <line x1={-split} x2={split} y1="0" y2="0" className="pc-field-thread"/>
            <circle r="8" className="pc-field-gap"/>
            <g className="pc-field-left"><circle r="5" className="pc-field-body"/>{open ? <text y="22" textAnchor="middle">{item.left}</text> : null}</g>
            <g className="pc-field-right"><circle r="5" className="pc-field-body pc-field-body--turn"/>{open ? <text y="-14" textAnchor="middle">{item.right}</text> : null}</g>
          </g>
        })}
      </svg>
      {enhanced ? <ul className="pc-field-points" aria-label="Six points, one per case study">{items.map((item, i) => <li key={item.slug} style={{ left: `${spots[i][0] / 8}%`, top: `${spots[i][1] / 4.4}%` }}>
        <button type="button" aria-pressed={item.slug === chosen} onClick={() => setChosen(item.slug)}>
          <span className="pc-sr-only">{item.label}: {item.left} and {item.right}{item.slug in answers ? ', split' : ''}</span>
        </button>
      </li>)}</ul> : null}
      <p className="pc-field-caption">FIG · Six case studies · each point is two related things taken for one</p>
    </div>

    {enhanced ? <div className="pc-field-panel" aria-live="polite">
      {!current ? <>
        <p className="pc-kicker">{splitCount ? `${splitCount} of ${items.length} split` : 'Choose a point'}</p>
        <p className="pc-field-prompt">Each point of light is <strong>two things someone took for one</strong>. Choose one and decide: the same thing, or not?</p>
      </> : !(current.slug in answers) ? <>
        <p className="pc-kicker">{String(index + 1).padStart(2, '0')} · {current.label}</p>
        <p className="pc-field-question"><strong>{current.left}</strong> and <strong>{current.right}</strong>. <em>The same thing?</em></p>
        <p className="pc-field-answers pc-cluster"><button type="button" onClick={() => answer('same')}>The same</button><button type="button" onClick={() => answer('different')}>Not the same</button></p>
      </> : <>
        <p className="pc-kicker">{String(index + 1).padStart(2, '0')} · {current.label} · {splitCount} of {items.length} split</p>
        <p className="pc-field-question"><strong>{current.left}</strong> <span aria-hidden="true">≠</span><span className="pc-sr-only">is not</span> <strong className="pc-turn">{current.right}</strong></p>
        <p>{answers[current.slug] === 'same' ? 'That is the assumption this case study began with. ' : 'Right, and in practice they were treated as one. '}{current.explanation}</p>
        {current.changed ? <p><span className="pc-field-label">What changed:</span> {current.changed}</p> : null}
        <p><a className="pc-text-link" href={current.href}>Read the case study <span aria-hidden="true">→</span></a></p>
      </>}
      {complete ? <p className="pc-field-pattern-note">Six settings, one pattern: <strong>the work begins where two related things were taken for one.</strong></p> : null}
      <p className="pc-field-tools pc-cluster">{splitCount < items.length ? <button type="button" className="pc-field-quiet" onClick={splitAll}>Split them all</button> : <button type="button" className="pc-field-quiet" onClick={() => { setAnswers({}); setChosen(null) }}>Start again</button>}</p>
    </div> : null}

    <details className="pc-field-text pc-disclosure" open={!enhanced || undefined}>
      <summary>Read all six as text</summary>
      <ul className="pc-pattern-pairs" aria-label="Each case study's distinction">{items.map(item => <li key={item.slug}>
        <span className="pc-kicker">{item.label}</span>
        <a href={item.href}><strong>{item.left}</strong> <span aria-hidden="true">≠</span><span className="pc-sr-only">is not</span> <strong className="pc-turn">{item.right}</strong></a>
        <span className="pc-pattern-why">{item.explanation}</span>
      </li>)}</ul>
    </details>
  </div>
}

/**
 * The hero's visual: the same
 * six case studies, already split, at rest. It is a picture, not a control; its link leads to the
 * interactive field further down, and every pair is also given there as text.
 */
/** A taller, two-column layout for the narrow hero column, so every label has room. */
const previewSpots: readonly (readonly [number, number])[] = [[210, 80], [570, 150], [230, 250], [580, 320], [210, 420], [570, 490]]

export function FieldPreview({ pairs, href }: { pairs: readonly FieldPair[]; href: string }) {
  const items = pairs.slice(0, previewSpots.length)
  return <figure className="pc-field-preview">
    <div className="pc-field-stage pc-night" data-surface="observatory">
      <svg viewBox="0 0 800 560" role="img" aria-label={`Six case studies, each two related things taken for one: ${items.map(item => `${item.left} and ${item.right}`).join('; ')}.`} className="pc-field-sky">
        {dust.map((star, i) => <circle key={i} cx={star.x} cy={star.y * 1.27} r={star.r} className="pc-field-dust"/>)}
        <path className="pc-field-pattern" d={`M${items.map((_, i) => previewSpots[i].join(' ')).join(' L')}`}/>
        {items.map((item, i) => <g key={item.slug} className="pc-field-star" data-split="" transform={`translate(${previewSpots[i][0]} ${previewSpots[i][1]})`}>
          <line x1={-split} x2={split} y1="0" y2="0" className="pc-field-thread"/>
          <circle r="8" className="pc-field-gap"/>
          <g className="pc-field-left"><circle r="5" className="pc-field-body"/><text y="30" textAnchor="middle">{item.left}</text></g>
          <g className="pc-field-right"><circle r="5" className="pc-field-body pc-field-body--turn"/><text y="-16" textAnchor="middle">{item.right}</text></g>
        </g>)}
      </svg>
    </div>
    <figcaption><span className="pc-field-preview-label">Six case studies. Each began where two related things were <em>taken for one</em>.</span> <a href={href}>Split them yourself <span aria-hidden="true">↓</span></a></figcaption>
  </figure>
}
