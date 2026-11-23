/** Stable ID reserved for the Claims operations investigation (see docs/codex/review-candidates/claims-operations.md). */
export const claimsInvestigationId = '6c2f9e3e-23c0-4362-ada4-7d18a6ed998a'

export type CaseBrief = { tension: string; call: string; result: string; evidence: string }
export type CaseStatusSummary = { kind: 'in_use' | 'adopted' | 'recurring' | 'follow_on' | 'recognized' | 'proposal'; label: string }
export type HeadlineFigure = { id: string; value: string; unit: string; label: string; basis: 'owner_estimate' | 'approximate' | 'platform_reported' | 'measured'; qualifier: string }
export type InvestigationSummary = {
  id: string; path: string; title: string; summary: string
  slug?: string; stakes?: string; deepDive?: boolean
  brief?: CaseBrief; status?: CaseStatusSummary; headlines?: HeadlineFigure[]
}

/** The homepage's three selected investigations (owner priority): Claims, trust research, enterprise AI. */
export const selectedSlugs = ['claims-operations', 'brand-research', 'enterprise-ai'] as const

/** Selected cases in priority order, from the approved projection only. Unapproved cases never appear. */
export function selectedInvestigations(investigations: readonly InvestigationSummary[]) {
  const chosen = selectedSlugs.map(slug => investigations.find(entry => entry.slug === slug)).filter((entry): entry is InvestigationSummary => !!entry)
  return chosen.length ? chosen : investigations.slice(0, 3)
}

/** Where the homepage sends someone who wants evidence: the Claims case when approved, otherwise the collection. */
export function primaryEvidenceHref(investigations: readonly InvestigationSummary[]) {
  return (investigations.find(entry => entry.id === claimsInvestigationId) ?? investigations[0])?.path ?? '/investigations/'
}
