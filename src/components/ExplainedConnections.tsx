import React from 'react'
import { caseComparisons } from '../content/connections'

export function ExplainedConnections() {
  return <section className="explained-connections" aria-labelledby="distinctions-title">
    <p className="eyebrow">Explore connections</p><h2 id="distinctions-title">Related. Not equivalent.</h2>
    <p>These editorial comparisons connect questions across the work. They are interpretations to inspect, rather than universal causal rules.</p>
    <ul>{Object.entries(caseComparisons).map(([id,pair])=><li key={id}>
      <h3>{pair.left} ≠ {pair.right}</h3><p>{pair.meaning}</p>
      <details><summary>Why distinguish them?</summary><p>{pair.distinction}</p></details>
      <a href={`/#${id}`}>Read the supporting case summary →</a>
    </li>)}</ul>
    <p>Usability ≠ retention and Compliance ≠ comprehension remain additional editorial questions. A telematics manuscript and supporting source review are pending; no causal connection is asserted here.</p>
  </section>
}
