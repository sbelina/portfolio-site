import React from 'react'
import type { EvidenceInspectorBlock } from '../content/case-blocks'
import type { PublicEvidence } from '../content/model'
import { EvidenceFacts } from '../reading/EvidenceFacts'

export type EvidenceReference = PublicEvidence

export const caseEvidenceLabels: Record<EvidenceInspectorBlock['claims'][number]['kind'], string> = {
  direct_observation: 'Observed',
  measured_result: 'Measured observation',
  documented_outcome: 'Documented outcome',
  practitioner_interpretation: 'Interpretation',
  hypothesis: 'Hypothesis',
  conceptual_illustration: 'Conceptual illustration',
  intended_benefit: 'Intended benefit',
  unverified: 'Not established',
}

const contributionLabels: Record<EvidenceInspectorBlock['claims'][number]['contribution'], string> = {
  identified: 'Identified',
  influenced: 'Influenced a decision',
  designed_or_facilitated: 'Designed or facilitated',
  implemented: 'Implemented',
  observed_use: 'Observed use',
  measured_impact: 'Measured impact',
}

/** Names come from the selected page context, never from a private source lookup. */
export function CaseSourceFacts({ ids, evidence = [] }: { ids: string[]; evidence?: readonly EvidenceReference[] }) {
  return ids.length ? <ul>{ids.map(id => {
      const source = evidence.find(item => item.id === id)
      return <li key={id}>{source ? <><h4>{source.title}</h4><EvidenceFacts evidence={source}/></> : 'Source reference unavailable in this reading.'}</li>
    })}</ul> : null
}

export function CaseSourceReferences({ ids, evidence = [] }: { ids: string[]; evidence?: readonly EvidenceReference[] }) {
  if (!ids.length) return null
  return <details className="case-source-references">
    <summary>Supporting source references ({ids.length})</summary>
    <CaseSourceFacts ids={ids} evidence={evidence}/>
  </details>
}

export function EvidenceInspector({ block, evidence }: { block: EvidenceInspectorBlock; evidence?: readonly EvidenceReference[] }) {
  const prefix = `case-evidence-${block.id}`
  return <section className="case-study-block evidence-inspector" aria-labelledby={`${prefix}-title`}>
    <header className="case-block-header">
      <p className="case-block-kicker">Inspect the evidence</p>
      <h2 id={`${prefix}-title`}>{block.title}</h2>
      <p>{block.summary}</p>
    </header>
    <ul className="case-inspector-list" role="list">
      {block.claims.map(claim => <li className="case-evidence-claim" data-kind={claim.kind} key={claim.id}>
        <p className="case-evidence-kind">{caseEvidenceLabels[claim.kind]}</p>
        <h3>{claim.statement}</h3>
        <p className="case-block-limitation"><strong>What this does not establish:</strong> {claim.limitation}</p>
        <dl className="case-facts case-evidence-scope">
          <div><dt>Scope</dt><dd>{claim.scope}</dd></div>
          <div><dt>Period</dt><dd>{claim.period}</dd></div>
        </dl>
        <details className="case-inspector-details case-source-references">
          <summary>How was this known—and what is missing?</summary>
          <dl className="case-facts">
            <div><dt>Source account</dt><dd>{claim.sourceSummary}</dd></div>
            <div><dt>Contribution</dt><dd>{contributionLabels[claim.contribution]}</dd></div>
          </dl>
          <CaseSourceFacts ids={claim.evidenceIds} evidence={evidence}/>
        </details>
      </li>)}
    </ul>
  </section>
}
