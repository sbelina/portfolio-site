import React from 'react'
import type { PublicEvidence } from '../content/model'
import type { Investigation } from '../content/investigation'
import { MoveTheCheckpoint } from './MoveTheCheckpoint'
import { ServiceBlueprint } from './ServiceBlueprint'
import { AskItDifferently, ProposalsToProblems } from './CaseVisuals'
type Field = 'observedCondition' | 'workingExplanation' | 'investigation' | 'relationshipDiscovered' | 'response' | 'consequence' | 'notOwned' | 'measurement' | 'limitations'
/**
 * Every case answers four questions, in this order, then says what I'd do differently.
 * Caveats (ownership, measurement, limits) gather in How I know at the end, not up front.
 */
const questions: { id: string; title: string; fields: readonly Field[] }[] = [
  { id: 'problem', title: 'What was the problem', fields: ['observedCondition', 'workingExplanation'] },
  { id: 'how-i-knew', title: 'How I knew', fields: ['investigation', 'relationshipDiscovered'] },
  { id: 'what-i-did', title: 'What I did', fields: ['response'] },
  { id: 'what-changed', title: 'What changed', fields: ['consequence'] },
]
const caveats = [['notOwned', 'What I didn’t own'], ['measurement', 'How this was measured'], ['limitations', 'Limitations']] as const
const fields: readonly Field[] = [...questions.flatMap(question => question.fields), ...caveats.map(([key]) => key)]
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

const optionLabels = { considered: 'Considered', recommended: 'Recommended', chosen: 'Chosen', not_chosen: 'Not chosen' } as const
/** How far each implication is established. Shown in words beside every item, never by colour alone. */
export const implicationLabels = { resource: 'Resource implication', observed_change: 'Observed change', measured: 'Measured result', unproven: 'Not established' } as const

/** The institutional decision layer: stakes, options, ownership, what changed and how far each implication is established. */
export function DecisionLayer({ decision }: { decision: NonNullable<Investigation['decision']> }) {
  return <section id="decision" className="investigation-decision" aria-labelledby="investigation-decision-title">
    <h2 id="investigation-decision-title">The decision</h2>
    <dl className="investigation-decision-facts">
      <div><dt>What was at stake</dt><dd>{decision.stakes}</dd></div>
      <div><dt>The explanation people held</dt><dd>{decision.prevailing}</dd></div>
    </dl>
    <h3>Options, and what became of each</h3>
    <ul className="investigation-options">{decision.alternatives.map(item => <li key={item.option} data-status={item.status}><span className="investigation-option-status">{optionLabels[item.status]}</span> <strong>{item.option}.</strong> {item.note}</li>)}</ul>
    <dl className="investigation-decision-facts">
      <div><dt>Who decided</dt><dd>{decision.ownership}</dd></div>
      <div><dt>What changed in practice</dt><dd>{decision.implementation}</dd></div>
    </dl>
    <h3>Resource implications</h3>
    <ul className="investigation-implications">{decision.implications.map(item => <li key={item.text} data-kind={item.kind}><span className="investigation-implication-kind">{implicationLabels[item.kind]}</span> {item.text}</li>)}</ul>
  </section>
}

/** Contents for the reading's table of contents, in the order the case is told. */
export function narrativeContents(narrative: Investigation) {
  return [
    ...(narrative.brief ? [{ id: 'investigation-glance-title', title: 'At a glance' }] : []),
    ...(narrative.decision ? [{ id: 'decision', title: 'The decision' }] : []),
    ...(narrative.blueprint ? [{ id: 'blueprint', title: 'Service blueprint: before and after' }] : []),
    ...questions.filter(question => question.fields.some(key => narrative[key])).map(({ id, title }) => ({ id, title })),
    ...(narrative.differently ? [{ id: 'differently', title: 'What I’d do differently' }] : []),
    ...(caveats.some(([key]) => narrative[key]) || narrative.statements.some(statement => !statement.section) ? [{ id: 'how-i-know', title: 'How I know' }] : []),
  ]
}

/** The case at a glance, result first: what changed, then the problem, what I did and how I knew. */
export function CaseGlance({ brief }: { brief: NonNullable<Investigation['brief']> }) {
  return <section className="investigation-glance" aria-labelledby="investigation-glance-title">
    <h2 id="investigation-glance-title">At a glance</h2>
    <dl>{([['What changed', brief.result], ['The problem', brief.tension], ['What I did', brief.call], ['How I knew', brief.evidence]] as const).map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
  </section>
}

export function InvestigationNarrative({ narrative, evidence }: { narrative: Investigation; evidence: PublicEvidence[] }) {
  const placed = new Set(fields.filter(key => narrative[key]))
  const loose = narrative.statements.filter(statement => !statement.section || !placed.has(statement.section as Field))
  const passage = (key: Field, label: string) => {
    const threaded = narrative.statements.filter(statement => statement.section === key)
    return <React.Fragment key={key}>
      <p>{narrative[key]}</p>
      {threaded.length ? <EvidenceThread statements={threaded} evidence={evidence} label={label}/> : null}
      {key === 'relationshipDiscovered' && narrative.interactive === 'move-the-checkpoint' ? <MoveTheCheckpoint/> : null}
      {key === 'relationshipDiscovered' && narrative.interactive === 'ask-it-differently' ? <AskItDifferently/> : null}
      {key === 'relationshipDiscovered' && narrative.interactive === 'proposals-to-problems' ? <ProposalsToProblems/> : null}
    </React.Fragment>
  }
  const hasCaveats = caveats.some(([key]) => narrative[key]) || loose.length > 0
  return <div className="investigation-narrative">
    {narrative.brief ? <CaseGlance brief={narrative.brief}/> : null}
    {narrative.decision ? <DecisionLayer decision={narrative.decision}/> : null}
    {narrative.figures?.length ? <FigureStrip figures={narrative.figures}/> : null}
    {narrative.blueprint ? <ServiceBlueprint blueprint={narrative.blueprint}/> : null}
    {questions.map(question => question.fields.some(key => narrative[key])
      ? <section key={question.id} id={question.id} className="investigation-question"><h2>{question.title}</h2>{question.fields.filter(key => narrative[key]).map(key => passage(key, question.title))}</section>
      : null)}
    {narrative.differently ? <section id="differently" className="investigation-question investigation-differently"><h2>What I’d do differently</h2><p>{narrative.differently}</p></section> : null}
    {hasCaveats ? <section id="how-i-know" className="investigation-how-i-know" aria-labelledby="how-i-know-title"><h2 id="how-i-know-title">How I know</h2>
      {caveats.map(([key, label]) => narrative[key] ? <section key={key}><h3>{label}</h3>{passage(key, label)}</section> : null)}
      {loose.length ? <section className="evidence-list"><h3>Other statements and their limits</h3><ul>{loose.map(statement=><li key={statement.id}>
        <strong>{kindLabels[statement.kind]}</strong><p>{statement.text}</p>
        <small>{contributionLabels[statement.contribution]}. {statement.limitation}</small>
        <Sources statement={statement} evidence={evidence}/>
      </li>)}</ul></section> : null}
    </section> : null}
  </div>
}
