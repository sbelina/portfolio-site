/** Stable ID reserved for the Claims operations investigation (see docs/codex/review-candidates/claims-operations.md). */
export const claimsInvestigationId = '6c2f9e3e-23c0-4362-ada4-7d18a6ed998a'

export type CaseBrief = { tension: string; call: string; result: string; evidence: string }
export type InvestigationSummary = { id: string; path: string; title: string; summary: string; brief?: CaseBrief }
export type PrimaryEvidence =
  | { status: 'approved'; href: string; title: string; description: string; brief?: CaseBrief }
  | { status: 'previous-edition'; href: string; title: string; description: string; boundary: string }

/**
 * Summaries already shown in the reviewed previous edition. They are links into the
 * immutable archive, not new claims: this list adds no case wording of its own beyond
 * the archived titles, and it never stands in for an approved full investigation.
 */
export const previousEditionSummaries = [
  { anchor: 'claims-operations', label: 'Claims operations', title: 'When “complete” still generated work.' },
  { anchor: 'documentation-recovery', label: 'Claims knowledge work', title: 'Make the next handoff easier to understand.' },
  { anchor: 'brand-research', label: 'Perception mapping + trust research', title: 'Agreement and trust were different questions.' },
  { anchor: 'enterprise-ai', label: 'Enterprise AI program', title: 'A decision model became the team structure.' },
  { anchor: 'civic-service', label: 'Civic service', title: 'Voting questions did not follow service categories.' },
  { anchor: 'accessibility-ai', label: 'Accessibility in AI-assisted development', title: 'A person noticed a question the checks did not settle.' },
] as const

/** Callers pass the archive's review path (content/build-archive.json) so this module stays JSON-free for tests. */
export const previousEditionHref = (archivePath: string, anchor: string) => `${archivePath}#${anchor}`

/**
 * The homepage's primary evidence action. Entries reach this function only through the
 * validated public projection, so any entry here is selected, approved public content.
 * Claims leads when it is approved; otherwise the first approved investigation leads.
 * With no approved investigation, the action goes to the previous edition's Claims
 * summary and says plainly that the full case is unpublished.
 */
export function primaryEvidence(investigations: readonly InvestigationSummary[], archivePath: string): PrimaryEvidence {
  const approved = investigations.find(entry => entry.id === claimsInvestigationId) ?? investigations[0]
  if (approved) return { status: 'approved', href: approved.path, title: approved.title, description: approved.summary, ...(approved.brief ? { brief: approved.brief } : {}) }
  return {
    status: 'previous-edition',
    href: previousEditionHref(archivePath, 'claims-operations'),
    title: 'Claims operations: when “complete” still generated work',
    description: 'The question, my contribution, and what remains unverified, from the previous edition’s case summary.',
    boundary: 'Summary only. The full case has not been published; it awaits source and publication review.',
  }
}
