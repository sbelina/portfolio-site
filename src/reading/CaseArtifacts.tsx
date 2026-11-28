import React from 'react'
import type { Investigation } from '../content/investigation'
import { Stressed } from '../content/emphasis'

type Artifact = NonNullable<Investigation['artifacts']>[number]

/** Who acted at each step, always in words beside the mark (never colour alone). */
export const stepByLabels: Record<NonNullable<Artifact['steps']>[number]['by'], string> = {
  me: 'My part', others: 'Others', shared: 'Shared', open: 'Not yet confirmed',
}

/**
 * Working artifacts: each is a figure with its provenance label first,
 * a real table or an ordered list of steps, and what it does not claim. Readable without script or colour.
 */
export function CaseArtifacts({ artifacts }: { artifacts: NonNullable<Investigation['artifacts']> }) {
  if (!artifacts.length) return null
  return <section id="artifacts" className="case-artifacts" aria-labelledby="case-artifacts-title">
    <h2 id="case-artifacts-title">Working artifacts</h2>
    {artifacts.map(artifact => <figure key={artifact.id} id={`artifact-${artifact.id}`} className="case-artifact" aria-labelledby={`artifact-${artifact.id}-title`}>
      <p className="case-artifact-label">{artifact.label}</p>
      <h3 id={`artifact-${artifact.id}-title`}>{artifact.title}</h3>
      {artifact.intro ? <p><Stressed text={artifact.intro}/></p> : null}
      {artifact.table ? <div className="case-artifact-scroll" role="region" aria-labelledby={`artifact-${artifact.id}-title`} tabIndex={0}>
        <table>
          <thead><tr>{artifact.table.columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead>
          <tbody>{artifact.table.rows.map((row, index) => <tr key={index}>{row.map((cell, column) => column === 0 ? <th key={column} scope="row"><Stressed text={cell}/></th> : <td key={column}><Stressed text={cell}/></td>)}</tr>)}</tbody>
        </table>
      </div> : null}
      {artifact.steps ? <ol className="case-artifact-steps">{artifact.steps.map(step => <li key={step.title} data-by={step.by}>
        <span className="case-artifact-by">{stepByLabels[step.by]}</span>
        <strong>{step.title}</strong>
        {step.text ? <span><Stressed text={step.text}/></span> : null}
      </li>)}</ol> : null}
      {artifact.note ? <figcaption className="case-artifact-note"><Stressed text={artifact.note}/></figcaption> : null}
    </figure>)}
  </section>
}
