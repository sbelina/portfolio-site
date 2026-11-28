import React from 'react'
import { publicPath } from '../public-path'
import type { InvestigationSummary } from '../content/primary-evidence'
import { plainText } from '../content/emphasis'

/**
 * What changed, before how it was done: the headline figures of approved investigations only.
 * Renders nothing until at least one approved case has a headline figure, so it can never
 * publish an unapproved number. Each figure links to the case that explains it, where its context is given.
 * no per-figure hedge labels. each figure says
 * what it measures (its qualifier), so views read as access and counts read as scope, not impact.
 */
export function ResultsStrip({ investigations }: { investigations: readonly InvestigationSummary[] }) {
  const items = investigations.flatMap(entry => (entry.headlines ?? []).map(figure => ({ figure, entry }))).slice(0, 4)
  if (!items.length) return null
  return <section className="pc-results" aria-labelledby="pc-results-title">
    <h2 id="pc-results-title" className="pc-kicker">What changed</h2>
    <ul>{items.map(({ figure, entry }) => <li key={figure.id}>
      <p className="pc-result-value"><strong>{figure.value}</strong> <span>{figure.unit}</span></p>
      <p className="pc-result-label">{figure.label}</p>
      <p className="pc-result-basis">{figure.qualifier}</p>
      <a href={publicPath(entry.path)}>{plainText(entry.title)} <span aria-hidden="true">→</span></a>
    </li>)}</ul>
  </section>
}
