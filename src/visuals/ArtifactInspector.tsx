import React from 'react'
import type { ArtifactInspectorBlock } from '../content/case-blocks'
import { CaseSourceFacts, caseEvidenceLabels, type EvidenceReference } from './EvidenceInspector'

export function ArtifactInspector({ block, evidence }: { block: ArtifactInspectorBlock; evidence?: readonly EvidenceReference[] }) {
  const prefix = `case-artifacts-${block.id}`
  return <section className="case-study-block artifact-inspector" aria-labelledby={`${prefix}-title`}>
    <header className="case-block-header">
      <p className="case-block-kicker">From understanding to action</p>
      <h2 id={`${prefix}-title`}>{block.title}</h2>
      <p>{block.summary}</p>
    </header>
    <ul className="case-inspector-list" role="list">
      {block.artifacts.map(artifact => <li className="case-artifact" data-kind={artifact.kind} key={artifact.id}>
        <p className="case-evidence-kind">{caseEvidenceLabels[artifact.kind]} · {artifact.representation === 'illustrative_reconstruction' ? 'Illustrative reconstruction' : 'Artifact description'}</p>
        <h3>{artifact.title}</h3>
        <p>{artifact.purpose}</p>
        <p className="case-block-limitation"><strong>Limit:</strong> {artifact.limitation}</p>
        <details className="case-inspector-details">
          <summary>Inspect {artifact.title}</summary>
          <dl className="case-facts">
            <div><dt>Intended users</dt><dd><ul>{artifact.audience.map((person, index) => <li key={`${index}-${person}`}>{person}</li>)}</ul></dd></div>
            <div><dt>Design reasoning</dt><dd>{artifact.reasoning}</dd></div>
            <div><dt>My contribution</dt><dd>{artifact.contribution}</dd></div>
            <div><dt>Implementation</dt><dd>{artifact.implementation}</dd></div>
            <div><dt>Retained value</dt><dd>{artifact.retainedValue}</dd></div>
          </dl>
          {artifact.representation === 'illustrative_reconstruction' && artifact.reconstruction ? <div className="case-reconstruction">
            <p className="case-block-kicker">Illustrative reconstruction — not the original artifact</p>
            <p>{artifact.reconstruction}</p>
          </div> : null}
          <div className="case-source-references"><CaseSourceFacts ids={artifact.evidenceIds} evidence={evidence}/></div>
        </details>
      </li>)}
    </ul>
  </section>
}
