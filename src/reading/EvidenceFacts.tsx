import React from 'react'
import type { PublicEvidence } from '../content/model'

/** The same selected, public-safe citation fields support every reading layer. */
export function EvidenceFacts({ evidence }: { evidence: PublicEvidence }) {
  const date = new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(evidence.observedAt))
  return <dl className="reading-evidence-facts">
    <div><dt>Source</dt><dd>{evidence.source}</dd></div>
    <div><dt>Source locator</dt><dd>{/^https?:\/\//i.test(evidence.locator) ? <a href={evidence.locator}>{evidence.locator}</a> : evidence.locator}</dd></div>
    <div><dt>Observed or recorded</dt><dd><time dateTime={evidence.observedAt}>{date}</time></dd></div>
    <div><dt>Evidence role</dt><dd>{evidence.role}</dd></div>
    <div><dt>Limitations</dt><dd>{evidence.limitations}</dd></div>
    {evidence.measurement ? <>
      <div><dt>Unit</dt><dd>{evidence.measurement.unit}</dd></div>
      <div><dt>Denominator</dt><dd>{evidence.measurement.denominator}</dd></div>
      <div><dt>Measurement period</dt><dd>{evidence.measurement.period}</dd></div>
      <div><dt>Comparison baseline</dt><dd>{evidence.measurement.baseline}</dd></div>
      <div><dt>Method</dt><dd>{evidence.measurement.method}</dd></div>
    </> : null}
  </dl>
}
