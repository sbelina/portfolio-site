import React, { useEffect, useState } from 'react'
import { Count } from '../design/Interactions'

/**
 * Case visuals (owner direction, 23 November): visual-first readings that never stand in for data.
 * Each renders its complete meaning without JavaScript; after hydration, native radio controls let a
 * reader switch views. Nothing here encodes a measurement.
 */

const questions = {
  agreement: {
    label: 'Ask about agreement',
    wording: '“How much do you agree that the company delivers good service?”',
    measures: 'Whether people accept a statement about the company.',
    supports: 'Which attributes people already associate with the company.',
    cannot: 'Whether that attribute affects their trust, or would change it.',
  },
  influence: {
    label: 'Ask about trust influence',
    wording: '“How much does reliable service affect your trust in this company?”',
    measures: 'Whether people report that an attribute shapes their trust.',
    supports: 'Which attributes people say matter to trust, worth testing further.',
    cannot: 'What actually produces trust. Self-report is not a causal measure.',
  },
} as const
type QuestionKey = keyof typeof questions

function QuestionCard({ id }: { id: QuestionKey }) {
  const question = questions[id]
  return <div className="case-visual-card" data-question={id}>
    <p className="case-visual-wording">{question.wording}</p>
    <dl>
      <div><dt>What it measures</dt><dd>{question.measures}</dd></div>
      <div><dt>What it can support</dt><dd>{question.supports}</dd></div>
      <div><dt>What it cannot support</dt><dd>{question.cannot}</dd></div>
    </dl>
  </div>
}

/** Trust research: the same attribute, asked two ways. Example wording is illustrative, not the instrument. */
export function AskItDifferently() {
  const [enhanced, setEnhanced] = useState(false)
  const [current, setCurrent] = useState<QuestionKey>('agreement')
  useEffect(() => setEnhanced(true), [])
  return <section className="case-visual" aria-labelledby="ask-differently-title">
    <p className="case-visual-kicker">Try it</p>
    <h2 id="ask-differently-title">Ask the question differently</h2>
    <p>The same attribute, asked two ways. Each question supports different conclusions.</p>
    {enhanced ? <>
      <fieldset className="case-visual-controls"><legend>Which question?</legend>{(Object.keys(questions) as QuestionKey[]).map(key => <label key={key}><input type="radio" name="ask-differently" checked={current === key} onChange={() => setCurrent(key)}/>{questions[key].label}</label>)}</fieldset>
      <div aria-live="polite"><QuestionCard id={current}/></div>
    </> : <div className="case-visual-pair"><QuestionCard id="agreement"/><QuestionCard id="influence"/></div>}
    <p className="case-visual-caption">FIG · Conceptual illustration · example wording, not the survey instrument; shows no results</p>
  </section>
}

// Thirty-eight proposals grouped into eight areas. The group sizes are illustrative only; the real
// grouping and the area names are not published.
const groups = [7, 6, 5, 5, 4, 4, 4, 3] as const
const total = groups.reduce((sum, size) => sum + size, 0)

/** Enterprise AI: 38 proposals reorganized into 8 shared challenge areas. */
export function ProposalsToProblems() {
  const [enhanced, setEnhanced] = useState(false)
  const [grouped, setGrouped] = useState(true)
  useEffect(() => setEnhanced(true), [])
  const scattered = <div className="case-dots case-dots--scattered" role="img" aria-label={`${total} separate proposals`}>{Array.from({ length: total }, (_, index) => <span key={index} className="case-dot"/>)}</div>
  const clustered = <ol className="case-dots case-dots--grouped" aria-label="Eight shared challenge areas">{groups.map((size, index) => <li key={index}><span className="case-group-label">Area {index + 1}</span><span className="case-group-dots" aria-hidden="true">{Array.from({ length: size }, (_, dot) => <span key={dot} className="case-dot"/>)}</span><span className="pc-sr-only">, a group of proposals</span></li>)}</ol>
  return <section className="case-visual" aria-labelledby="proposals-title">
    <p className="case-visual-kicker">Try it</p>
    <h2 id="proposals-title">From proposals to problems</h2>
    <p className="case-visual-count"><Count from={38} to={8} label="8 challenge areas"/> <span>challenge areas, from 38 proposals</span></p>
    <p>Thirty-eight proposals read as thirty-eight separate needs. Grouped by the challenge each one addressed, they became eight areas teams could discuss and choose among.</p>
    {enhanced ? <>
      <fieldset className="case-visual-controls"><legend>Show the proposals</legend>{[false, true].map(value => <label key={String(value)}><input type="radio" name="proposals-view" checked={grouped === value} onChange={() => setGrouped(value)}/>{value ? 'Grouped into challenge areas' : 'One by one'}</label>)}</fieldset>
      <div aria-live="polite">{grouped ? clustered : scattered}</div>
    </> : <div className="case-visual-pair"><div><h3>One by one</h3>{scattered}</div><div><h3>Grouped into challenge areas</h3>{clustered}</div></div>}
    <p className="case-visual-caption">FIG · Interpretive synthesis · 38 proposals and 8 areas are counts; group sizes are illustrative and area names are not published</p>
  </section>
}
