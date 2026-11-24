/** Stable ID reserved for the Claims operations investigation (see docs/codex/review-candidates/claims-operations.md). */
export const claimsInvestigationId = '6c2f9e3e-23c0-4362-ada4-7d18a6ed998a'

export type CaseBrief = { tension: string; call: string; result: string; evidence: string }
export type CaseStatusSummary = { kind: 'in_use' | 'adopted' | 'recurring' | 'follow_on' | 'recognized' | 'proposal'; label: string }
export type HeadlineFigure = { id: string; value: string; unit: string; label: string; basis: 'owner_estimate' | 'approximate' | 'platform_reported' | 'measured'; qualifier: string }
export type InvestigationSummary = {
  id: string; path: string; title: string; summary: string
  slug?: string; stakes?: string; deepDive?: boolean
  /** The case's own distinction (approved visual): left ≠ right, and why. */
  visual?: { left: string; right: string; explanation: string }
  composition?: 'boundary' | 'comparison' | 'network' | 'revision'
  brief?: CaseBrief; status?: CaseStatusSummary; headlines?: HeadlineFigure[]
}

/**
 * How readers find work (owner direction, 23 November): by the setting they recognize and the kind of work
 * they hire for, not by internal shorthand. "Claims" alone read as claims-as-assertions on an evidence site.
 */
export const caseLabels: Readonly<Record<string, string>> = {
  'claims-operations': 'Insurance operations', 'brand-research': 'Customer research', 'enterprise-ai': 'Enterprise innovation',
  telematics: 'Product research', 'civic-service': 'Civic engagement', 'accessibility-ai': 'AI-assisted development',
  'operational-friction': 'Insurance operations', 'knowledge-binder': 'Insurance operations', 'knowledge-publishing': 'Consumer technology',
}
/** The kind of work each case shows, in the terms job descriptions use. */
export const caseWork: Readonly<Record<string, string>> = {
  'claims-operations': 'Process & service design', 'brand-research': 'Survey & measurement design', 'enterprise-ai': 'Opportunity synthesis & facilitation',
  telematics: 'Usability research & findings recovery', 'civic-service': 'Service & content design', 'accessibility-ai': 'Accessibility evaluation',
  'operational-friction': 'Operational automation', 'knowledge-binder': 'Knowledge architecture', 'knowledge-publishing': 'Content governance & learning design',
}
/** "Setting · kind of work", for card labels. */
export const caseLabel = (slug?: string) => slug && caseLabels[slug] ? [caseLabels[slug], caseWork[slug]].filter(Boolean).join(' · ') : undefined

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
