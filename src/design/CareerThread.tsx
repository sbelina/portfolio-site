import React, { useEffect, useState } from 'react'
import { alongside, careerEras, careerNext, type Era } from '../content/career'
import { recruiterContact } from '../content/recruiter'
import { publicPath } from '../public-path'
import { FigureLegend } from './CaseFigures'
import { count } from '../analytics'

/**
 * The career thread, in the deck's drawing vocabulary: one orange
 * thread through the eras, proof as ink points along it, and the next step as an open ring. Choosing an
 * era draws the thread up to it and shows the turn, what I owned and the proof already on the site.
 * Without JavaScript every era is listed in full, and the drawing is at rest.
 */
const stops = [110, 340, 570, 850] as const
const resumeRequest = `mailto:${recruiterContact.email}?subject=${encodeURIComponent('Résumé request')}`

function Drawing({ active }: { active: number | null }) {
  const reach = active === null ? stops[3] : stops[active]
  const proofCount = careerEras.map(era => era.parts.filter(part => part.proof).length)
  return <svg className="pc-career-svg" viewBox="0 0 960 170" aria-hidden="true" focusable="false">
    <path className="pc-career-track" d={`M30 85H${stops[3]}`}/>
    <path className="pc-career-thread" d={`M30 85H${reach}`} key={reach}/>
    {careerEras.map((era, index) => {
      const from = index === 0 ? 30 : stops[index - 1], to = stops[index]
      return <g key={era.id} data-active={active === index || undefined}>
        {Array.from({ length: proofCount[index] }, (_, i) => <circle key={i} className="pc-career-proof" cx={from + ((to - from) * (i + 1)) / (proofCount[index] + 1)} cy="85" r="4"/>)}
        <circle className="pc-career-node" cx={to} cy="85" r={active === index ? 12 : 8}/>
        <text className="pc-career-years" x={to} y="50" textAnchor="middle">{era.years}</text>
        <text className="pc-career-title" x={to} y="126" textAnchor="middle">{era.title.toUpperCase()}</text>
      </g>
    })}
    <g data-active={active === 3 || undefined}>
      <circle className="pc-career-next" cx={stops[3]} cy="85" r={active === 3 ? 16 : 12}/>
      <path className="pc-career-arrow" d={`M${stops[3] + 24} 85H${stops[3] + 72}M${stops[3] + 62} 77L${stops[3] + 72} 85L${stops[3] + 62} 93`}/>
      <text className="pc-career-years" x={stops[3]} y="50" textAnchor="middle">NEXT</text>
      <text className="pc-career-title" x={stops[3]} y="126" textAnchor="middle">SYSTEMS STRATEGY</text>
    </g>
  </svg>
}

function EraBody({ era }: { era: Era }) {
  return <>
    <p className="pc-career-setting">{era.setting}{era.pending ? <span className="pc-career-pending"> · context being written</span> : null}</p>
    <p className="pc-career-turn">{era.turn}</p>
    <p className="pc-career-label">What I owned</p>
    <ul className="pc-career-parts">{era.parts.map(part => <li key={part.text}>{part.text}{part.proof ? <> <a href={publicPath(part.proof.href)}><span className="pc-sr-only">Proof: </span>{part.proof.label} <span aria-hidden="true">→</span></a></> : null}</li>)}</ul>
  </>
}

function NextBody() {
  return <>
    <p className="pc-career-turn">{careerNext.turn}</p>
    <p>{careerNext.text}</p>
    <p className="pc-career-ask"><strong>{careerNext.ask}</strong></p>
    <p className="pc-career-actions"><a className="pc-cta-primary" href={publicPath('/contact/')} data-count="career-next-contact">Start a conversation <span aria-hidden="true">→</span></a> <a href={resumeRequest} data-count="resume-request">Request the full résumé</a></p>
  </>
}

export function CareerThread() {
  const [enhanced, setEnhanced] = useState(false)
  const [active, setActive] = useState(2)
  useEffect(() => setEnhanced(true), [])
  const choose = (index: number) => { setActive(index); count('career-era', String(index)) }
  const legend = <FigureLegend items={[{ kind: 'thread', label: 'The thread through the work' }, { kind: 'established', label: 'Proof on this site' }, { kind: 'unknown', label: 'The next step' }]}/>
  return <section className="pc-career" aria-labelledby="pc-career-title">
    <p className="pc-kicker">The thread</p>
    <h2 id="pc-career-title">From interfaces to the <em className="pc-accent">systems</em> behind them.</h2>
    <p className="pc-career-lead">Each stage changed what I looked for next. In place of a résumé: the turns, what I owned, and the proof already on this site. <a href={resumeRequest} data-count="resume-request">Request the full résumé</a>.</p>
    <div className="pc-career-figure pc-night" data-surface="observatory"><Drawing active={enhanced ? active : null}/></div>
    {legend}
    {enhanced ? <>
      <fieldset className="pc-career-controls"><legend className="pc-sr-only">Choose a stage</legend>
        {[...careerEras.map(era => `${era.years} · ${era.title}`), `${careerNext.title} · ${careerNext.subtitle}`].map((label, index) => <label key={label}><input type="radio" name="pc-career-stage" checked={active === index} onChange={() => choose(index)}/>{label}</label>)}
      </fieldset>
      <div className="pc-career-panel" aria-live="polite">
        {active < 3 ? <><h3>{careerEras[active].title} <span className="pc-career-sub">{careerEras[active].subtitle}</span></h3><EraBody era={careerEras[active]}/></> : <><h3>{careerNext.title} <span className="pc-career-sub">{careerNext.subtitle}</span></h3><NextBody/></>}
      </div>
    </> : <ol className="pc-career-static">
      {careerEras.map(era => <li key={era.id}><p className="pc-kicker">{era.years}</p><h3>{era.title} <span className="pc-career-sub">{era.subtitle}</span></h3><EraBody era={era}/></li>)}
      <li><p className="pc-kicker">Next</p><h3>{careerNext.title} <span className="pc-career-sub">{careerNext.subtitle}</span></h3><NextBody/></li>
    </ol>}
    <p className="pc-career-alongside"><span className="pc-career-label">Alongside:</span> {alongside.text}. <a href={publicPath(alongside.proof.href)}>{alongside.proof.label} <span aria-hidden="true">→</span></a></p>
  </section>
}
