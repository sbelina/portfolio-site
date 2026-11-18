import React from 'react'
import type { PublicEvidence } from '../content/model'
import type { Investigation } from '../content/investigation'
const fields = [['observedCondition','Observed condition'],['workingExplanation','Working explanation'],['investigation','Investigation'],['relationshipDiscovered','Relationship discovered'],['response','Response'],['consequence','Consequence'],['notOwned','What I didn’t own'],['measurement','How this was measured'],['limitations','Limitations']] as const
const basisLabels = { owner_estimate: 'Approximate · owner estimate', approximate: 'Approximate', platform_reported: 'Platform-reported', measured: 'Measured' } as const

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
  return <div className="investigation-narrative">
    {narrative.figures?.length ? <FigureStrip figures={narrative.figures}/> : null}
    {fields.map(([key,label])=>narrative[key] ? <section key={key}><h2>{label}</h2><p>{narrative[key]}</p></section> : null)}
    {narrative.statements.length ? <section><h2>Evidence distinctions</h2><ul>{narrative.statements.map(statement=><li key={statement.id}>
      <strong>{statement.kind.replaceAll('_',' ')}</strong><p>{statement.text}</p>
      <small>Contribution: {statement.contribution.replaceAll('_',' ')}. {statement.limitation}</small>
      {statement.evidenceIds.map(id=>{ const source=evidence.find(item=>item.id===id); return source ? <details key={id}><summary>Inspect source: {source.title}</summary><p>{source.source} — {source.locator}</p><p>Limitation: {source.limitations}</p></details> : null })}
    </li>)}</ul></section> : null}
  </div>
}
