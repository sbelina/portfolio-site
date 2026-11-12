import React, { type CSSProperties } from 'react'
import type { WorkflowComparisonBlock } from '../content/case-blocks'
import { CaseSourceReferences, type EvidenceReference } from './EvidenceInspector'

/** Native radio state survives absent/failed JavaScript and SSR-only private preview. */
export function WorkflowComparison({ block, evidence }: { block: WorkflowComparisonBlock; evidence?: readonly EvidenceReference[] }) {
  const prefix = `workflow-${block.id}`
  const view = (mode: 'before' | 'after') => {
    const account = block[mode]
    return <section id={`${prefix}-${mode}-view`} className={`workflow-state workflow-state--${mode}`} aria-labelledby={`${prefix}-${mode}-heading`}>
      <header className="workflow-state-header">
        <h3 id={`${prefix}-${mode}-heading`}>{account.label}</h3>
        <p>{account.summary}</p>
      </header>
      <ol className="workflow-track" role="list" style={{ '--workflow-columns': Math.min(account.stages.length, 5) } as CSSProperties}>
        {account.stages.map((stage, index) => <li className="workflow-stage" data-stage-id={stage.id} data-checkpoint={stage.checkpoint ? 'true' : 'false'} key={stage.id}>
          <span className="workflow-stage-marker" aria-hidden="true">{index + 1}</span>
          <h4>{stage.action}</h4>
          {stage.checkpoint ? <p className="workflow-checkpoint">Verification checkpoint</p> : null}
          <dl className="workflow-stage-facts">
            <div><dt>Responsible actor</dt><dd>{stage.actor}</dd></div>
            <div><dt>Information available</dt><dd>{stage.information}</dd></div>
            <div><dt>If a defect is discovered here</dt><dd>{stage.consequence}</dd></div>
          </dl>
          <CaseSourceReferences ids={stage.evidenceIds} evidence={evidence}/>
        </li>)}
      </ol>
    </section>
  }
  return <section className="case-study-block workflow-comparison" data-basis={block.basis} aria-labelledby={`${prefix}-title`}>
    <header className="case-block-header">
      <p className="case-block-kicker">Explore the sequence</p>
      <h2 id={`${prefix}-title`}>{block.title}</h2>
      <p>{block.summary}</p>
      <p className="case-model-basis">{block.basis === 'conceptual' ? 'Conceptual model' : 'Documented sequence'} · categorical order, not measured duration.</p>
      <p className="case-block-limitation"><strong>Limitation:</strong> {block.limitation}</p>
    </header>
    <fieldset className="workflow-control">
      <legend>Choose a sequence to inspect</legend>
      <input className="workflow-choice workflow-choice--after" id={`${prefix}-after`} name={prefix} type="radio" value="after" defaultChecked aria-controls={`${prefix}-after-view`}/>
      <label className="workflow-choice-label" htmlFor={`${prefix}-after`}>{block.after.label}<span className="workflow-selected" aria-hidden="true">Selected</span></label>
      <input className="workflow-choice workflow-choice--before" id={`${prefix}-before`} name={prefix} type="radio" value="before" aria-controls={`${prefix}-before-view`}/>
      <label className="workflow-choice-label" htmlFor={`${prefix}-before`}>{block.before.label}<span className="workflow-selected" aria-hidden="true">Selected</span></label>
      <div className="workflow-states">{view('after')}{view('before')}</div>
    </fieldset>
  </section>
}
