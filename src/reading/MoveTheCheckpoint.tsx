import React, { useEffect, useState } from 'react'

type Lens = 'claims' | 'everyday'
type Problem = 'missing' | 'altered' | 'partial'
type Step = { title: string; detail?: string; go?: boolean; check?: boolean }

const lenses: Record<Lens, { label: string; question: string; early: string; late: string; steps: [Step, Step, Step, Step]; go: Step; who: string }> = {
  claims: {
    label: 'The claims case', question: 'Release payment when', early: 'Delivery is recorded', late: 'The salvage partner accepts',
    steps: [{ title: 'Paperwork arrives', detail: 'From the customer' }, { title: 'Delivery recorded', detail: 'The status says sent' }, { title: 'Salvage partner review', detail: 'Decides whether the documents are sufficient', check: true }, { title: 'Claim closed' }],
    go: { title: 'Payment released', go: true }, who: 'the customer',
  },
  everyday: {
    label: 'Everyday terms', question: 'The next step goes ahead when', early: 'It is marked sent', late: 'The receiver confirms it works',
    steps: [{ title: 'Work is handed off', detail: 'A form, a file, a request' }, { title: 'Marked as sent', detail: 'The status says done' }, { title: 'Receiver checks it', detail: 'Can they actually use it?', check: true }, { title: 'Case closed' }],
    go: { title: 'Next step goes ahead', detail: 'Approval, payment, launch', go: true }, who: 'the person who sent it',
  },
}
const problems: Record<Problem, { label: string; phrase: string }> = {
  missing: { label: 'Something’s missing', phrase: 'a missing detail' },
  altered: { label: 'Unreadable or changed by hand', phrase: 'a detail that was unreadable or changed by hand' },
  partial: { label: 'Completed by only one of the people required', phrase: 'a document completed by only one of the people required' },
}

const order = (lens: Lens, late: boolean): Step[] => { const { steps: [a, b, c, d], go } = lenses[lens]; return late ? [a, b, c, go, d] : [a, b, go, c, d] }
const outcome = (lens: Lens, late: boolean, problem: Problem) => late
  ? { good: true, text: `Found before anything goes ahead. The work is still open, so ${problems[problem].phrase} is fixed in the normal flow. Who decides has not changed.` }
  : { good: false, text: `Found after the next step already went ahead. It looked finished, so ${lenses[lens].who} is contacted again about ${problems[problem].phrase}, and the work comes back as rework.` }

function Steps({ steps }: { steps: Step[] }) {
  return <ol className="checkpoint-steps">{steps.map(step => <li key={step.title} data-go={step.go || undefined} data-check={step.check || undefined}>
    <span className="checkpoint-dot" aria-hidden="true"/>
    <span><strong>{step.title}</strong>{step.go ? <em className="checkpoint-tag">goes ahead</em> : null}{step.check ? <em className="checkpoint-tag checkpoint-tag--check">problem found here</em> : null}{step.detail ? <small>{step.detail}</small> : null}</span>
  </li>)}</ol>
}

/**
 * "Move the checkpoint": a conceptual, explorable version of the finding that delivered is not complete.
 * Without JavaScript both orders are shown side by side; after hydration, native radio groups switch
 * the order, the kind of problem and the vocabulary. It encodes no measurements.
 */
export function MoveTheCheckpoint() {
  const [enhanced, setEnhanced] = useState(false)
  const [lens, setLens] = useState<Lens>('claims')
  const [late, setLate] = useState(false)
  const [problem, setProblem] = useState<Problem>('missing')
  useEffect(() => setEnhanced(true), [])
  const result = outcome(lens, late, problem)
  return <section className="checkpoint" aria-labelledby="checkpoint-title">
    <p className="checkpoint-kicker">Try it</p>
    <h2 id="checkpoint-title">Move the checkpoint</h2>
    <p>The same handoff, two orders. Choose when the next step goes ahead and see where a problem surfaces.</p>
    {enhanced ? <>
      <div className="checkpoint-controls">
        <fieldset><legend>See it in</legend>{(Object.keys(lenses) as Lens[]).map(key => <label key={key}><input type="radio" name="checkpoint-lens" checked={lens === key} onChange={() => setLens(key)}/>{lenses[key].label}</label>)}</fieldset>
        <fieldset><legend>{lenses[lens].question}</legend>{[false, true].map(value => <label key={String(value)}><input type="radio" name="checkpoint-order" checked={late === value} onChange={() => setLate(value)}/>{value ? lenses[lens].late : lenses[lens].early}</label>)}</fieldset>
        <fieldset><legend>What’s wrong with the work</legend>{(Object.keys(problems) as Problem[]).map(key => <label key={key}><input type="radio" name="checkpoint-problem" checked={problem === key} onChange={() => setProblem(key)}/>{problems[key].label}</label>)}</fieldset>
      </div>
      <Steps steps={order(lens, late)}/>
      <p className="checkpoint-result" data-good={result.good} aria-live="polite">{result.text}</p>
    </> : <div className="checkpoint-static">
      <div><h3>{lenses.claims.early}</h3><Steps steps={order('claims', false)}/><p className="checkpoint-result" data-good="false">{outcome('claims', false, 'missing').text}</p></div>
      <div><h3>{lenses.claims.late}</h3><Steps steps={order('claims', true)}/><p className="checkpoint-result" data-good="true">{outcome('claims', true, 'missing').text}</p></div>
    </div>}
    <p className="checkpoint-note">Conceptual illustration, not measured data. In this case, missing details were the most common problem, by my account.</p>
  </section>
}
