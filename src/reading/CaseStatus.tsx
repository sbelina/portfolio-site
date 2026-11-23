import React from 'react'
import type { Investigation } from '../content/investigation'

export type CaseStatusValue = NonNullable<Investigation['status']>

/** The kind, in words, so the tag never relies on colour. */
export const statusKindLabels: Record<CaseStatusValue['kind'], string> = {
  in_use: 'In use', adopted: 'Adopted', recurring: 'Recurring', follow_on: 'Led to further work', recognized: 'Recognized', proposal: 'Proposal',
}

/** One short status tag: what became of the work. */
export function CaseStatus({ status }: { status: CaseStatusValue }) {
  const kind = statusKindLabels[status.kind]
  const repeats = status.label.toLowerCase().startsWith(kind.toLowerCase())
  return <span className="case-status" data-status={status.kind}>
    {repeats ? null : <span className="case-status-kind">{kind}</span>}
    <span className="case-status-label">{status.label}</span>
  </span>
}
