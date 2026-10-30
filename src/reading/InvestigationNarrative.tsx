import React from 'react'
import type { PublicEvidence } from '../content/model'
import type { Investigation } from '../content/investigation'
const fields = [['observedCondition','Observed condition'],['workingExplanation','Working explanation'],['investigation','Investigation'],['relationshipDiscovered','Relationship discovered'],['response','Response'],['consequence','Consequence'],['limitations','Limitations']] as const
export function InvestigationNarrative({ narrative, evidence }: { narrative: Investigation; evidence: PublicEvidence[] }) {
  return <div className="investigation-narrative">
    {fields.map(([key,label])=>narrative[key] ? <section key={key}><h2>{label}</h2><p>{narrative[key]}</p></section> : null)}
    {narrative.statements.length ? <section><h2>Evidence distinctions</h2><ul>{narrative.statements.map(statement=><li key={statement.id}>
      <strong>{statement.kind.replaceAll('_',' ')}</strong><p>{statement.text}</p>
      <small>Contribution: {statement.contribution.replaceAll('_',' ')}. {statement.limitation}</small>
      {statement.evidenceIds.map(id=>{ const source=evidence.find(item=>item.id===id); return source ? <details key={id}><summary>Inspect source: {source.title}</summary><p>{source.source} — {source.locator}</p><p>Limitation: {source.limitations}</p></details> : null })}
    </li>)}</ul></section> : null}
  </div>
}
