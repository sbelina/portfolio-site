import React from 'react'
import type { PublicEvidence } from '../content/model'
import type { Investigation } from '../content/investigation'
import { MoveTheCheckpoint } from './MoveTheCheckpoint'
const fields = [['observedCondition','Observed condition'],['workingExplanation','Working explanation'],['investigation','Investigation'],['relationshipDiscovered','Relationship discovered'],['response','Response'],['consequence','Consequence'],['notOwned','What I didn’t own'],['measurement','How this was measured'],['limitations','Limitations']] as const
const basisLabels = { owner_estimate: 'Approximate · owner estimate', approximate: 'Approximate', platform_reported: 'Platform-reported', measured: 'Measured' } as const

/** Plain-language names for the evidence vocabulary. The stored values stay precise. */
export const kindLabels: Record<Investigation['statements'][number]['kind'], string> = {
  direct_observation: 'What I saw', measured_result: 'What was measured', documented_outcome: 'What was decided or recorded',
  practitioner_interpretation: 'My interpretation', hypothesis: 'Open question', conceptual_illustration: 'Illustration',
  intended_benefit: 'Intended benefit', unverified: 'Not yet verified',
}
export const contributionLabels: Record<Investigation['statements'][number]['contribution'], string> = {
  identified: 'I identified it', influenced: 'I influenced it', designed_or_facilitated: 'I designed or facilitated it',
  implemented: 'I implemented it', observed_use: 'I observed its use', measured_impact: 'I measured its effect',
}

type Statement = Investigation['statements'][number]

function Sources({ statement, evidence }: { statement: Statement; evidence: PublicEvidence[] }) {
  return <>{statement.evidenceIds.map(id => { const source = evidence.find(item => item.id === id); return source ? <details key={id}><summary>Inspect source: {source.title}</summary><p>{source.source} — {source.locator}</p><p>Limitation: {source.limitations}</p></details> : null })}</>
}

/** One compact line per statement, threaded under the passage it supports; opening it shows my part and the limits. */
function EvidenceThread({ statements, evidence, label }: { statements: Statement[]; evidence: PublicEvidence[]; label: string }) {
  return <aside className="evidence-thread" aria-label={`How I know: ${label}`}>
    {statements.map(statement => <details key={statement.id} className="evidence-note" data-kind={statement.kind}>
      <summary><span className="evidence-kind">{kindLabels[statement.kind]}</span> <span className="evidence-text">{statement.text}</span></summary>
      <p className="evidence-detail"><span>{contributionLabels[statement.contribution]}.</span> {statement.limitation}</p>
      <Sources statement={statement} evidence={evidence}/>
    </details>)}
  </aside>
}

/** Figures are labelled by basis and unit; a figure never stands alone as an outcome claim. */
export function FigureStrip({ figures }: { figures: NonNullable<Investigation['figures']> }) {
  if (!figures.length) return null
  return <section className="investigation-figures" aria-labelledby="investigation-figures-title">
    <h2 id="investigation-figures-title">Figures</h2>
    <ul>{figures.map(figure => <li key={figure.id}>
      <p className="investigation-figure-value"><strong>{figure.value}</strong> <span>{figure.unit}</span></p>
      <p className="investigation-figure-label">{figure.label}</p>
      <p className="investigation-figure-basis">{basisLabels[figure.basis]}. {figure.qualifier}</p>
    </li>)}</ul>
  </section>
}

export function InvestigationNarrative({ narrative, evidence }: { narrative: Investigation; evidence: PublicEvidence[] }) {
  const placed = new Set(fields.filter(([key]) => narrative[key]).map(([key]) => key as string))
  const loose = narrative.statements.filter(statement => !statement.section || !placed.has(statement.section))
  return <div className="investigation-narrative">
    {narrative.figures?.length ? <FigureStrip figures={narrative.figures}/> : null}
    {fields.map(([key,label])=>{
      if (!narrative[key]) return null
      const threaded = narrative.statements.filter(statement => statement.section === key)
      return <React.Fragment key={key}>
        <section><h2>{label}</h2><p>{narrative[key]}</p>{threaded.length ? <EvidenceThread statements={threaded} evidence={evidence} label={label}/> : null}</section>
        {key === 'relationshipDiscovered' && narrative.interactive === 'move-the-checkpoint' ? <MoveTheCheckpoint/> : null}
      </React.Fragment>
    })}
    {loose.length ? <section className="evidence-list"><h2>How I know</h2><ul>{loose.map(statement=><li key={statement.id}>
      <strong>{kindLabels[statement.kind]}</strong><p>{statement.text}</p>
      <small>{contributionLabels[statement.contribution]}. {statement.limitation}</small>
      <Sources statement={statement} evidence={evidence}/>
    </li>)}</ul></section> : null}
  </div>
}
