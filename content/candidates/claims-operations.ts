/**
 * Claims operations: UNAPPROVED publication candidate for local preview only.
 *
 * Mirrors docs/codex/review-candidates/claims-operations-publication-candidate.md.
 * Every statement is owner-reported; no source evidence is attached, so the
 * projection validator rejects this entry (editorialState 'review', visibility
 * 'restricted'). Only `npm run build:candidate` renders it, into dist-candidate/,
 * which is noindex and marked non-production for the public artifact audit.
 * Internal figures appear only as rounded/averaged owner estimates (owner direction,
 * 16 November); exact values stay in the owner's private notes, outside this repository.
 */
import type { Entry, PublicProjection } from '../../src/content/model'
import { entryPath } from '../../src/content/model'

export const claimsCandidateToken = 'CLAIMS_CANDIDATE_UNAPPROVED_16NOV'
const drafted = '2026-11-16T00:00:00Z'
const redrafted = '2026-11-20T00:00:00Z'

export const claimsCandidate: Entry = {
  schemaVersion: 1,
  id: '6c2f9e3e-23c0-4362-ada4-7d18a6ed998a',
  revision: 2,
  kind: 'investigation',
  format: 'case',
  slug: 'claims-operations',
  title: 'When “complete” still generated work.',
  summary: 'Payment now waits until paperwork is confirmed sufficient, and the guide built collectively from administrators’ knowledge has been in use across four offices for more than two years.',
  editorialState: 'review',
  visibility: 'restricted',
  createdAt: drafted,
  updatedAt: redrafted,
  authorIds: [],
  topicIds: [],
  contribution: 'I identified the problem without an assignment, built the evidence record, brought it to management, and led the change that moved verification before payment, aligning three departments on one definition of complete. I facilitated the administrator knowledge sessions and wrote the paperwork guide, the support training deck that trainers adapted, and early versions of the customer cover letter.',
  evidenceIds: [],
  investigation: {
    schemaVersion: 1,
    composition: 'boundary',
    visual: {
      left: 'Delivered',
      right: 'Verified',
      explanation: 'A delivery status records a handoff. Verification checks that the paperwork is sufficient.',
    },
    observedCondition: 'In the total-loss process, title and transfer paperwork moved from customers through the claims team to a salvage partner, which decides whether documents are sufficient. A delivery could be recorded, and payment released, before that decision. Problems such as a missing detail, a detail that was unreadable or changed by hand, or a document completed by only one of the people required to complete it then went back to customers to fix, after the claim appeared finished.',
    workingExplanation: 'Practitioner interpretation: the recorded handoff and the later acceptance check described different states. Treating “delivered” as “complete” moved the point of discovery to after payment, when correction is harder for everyone.',
    investigation: 'I began without an assignment. I kept a log of recurring exceptions, then clarified the process with the teams it touched (adjusters, administrative staff and the salvage partner) to see where each one believed the work was finished. I brought the resulting evidence about payment timing to management.',
    relationshipDiscovered: 'Delivered ≠ verified. The status the system reported and the state the next step depended on were related but not equivalent. The gap was a question of when sufficiency was checked, not who had authority.',
    response: 'Two connected responses, kept separate. Review timing: leadership chose to verify before paying. Adjusters now verify the paperwork before payment, and the salvage partner checks it when something is uncertain; the local manager backed the change and formed a training team. Decision authority did not change: the salvage partner decides sufficiency, and adjusters release payment. Shared practitioner knowledge: I facilitated meetings in which administrators surfaced the practical knowledge, examples and procedural differences behind the process. This informed three distinct resources: a paperwork guide, a total-loss support training deck and an administrative onboarding program. The error-log categories did not become the guide’s structure. Separately, I redesigned the customer cover letter to reduce the decisions customers had to make after a total loss; a later national version was produced by a process team and is not attributed to me here.',
    consequence: '“Complete” now means verified: adjusters verify the paperwork before paying, so problems are found before a claim looks finished rather than after it closes. The guide, built collectively from administrators’ knowledge, joined new-cohort onboarding within weeks and is still shared by supervisors across four offices more than two years later.',
    differently: 'I would agree a definition of an exception with the team, and record a baseline, before the change. Then the effect of moving the checkpoint could have been measured instead of estimated.',
    limitations: 'Several changes happened close together (review timing, training, the guide, the letter), so no single change can be credited with any later difference. Any change in how long payment takes has not been measured. Contributions by managers, trainers, adjusters, the salvage partner and the process team are their own.',
    brief: {
      tension: 'Paperwork could be marked delivered, and payment released, before anyone confirmed it was sufficient. Errors surfaced later, as rework for customers and staff.',
      call: 'Without an assignment, I logged the exceptions, traced each handoff, recommended verifying before paying, helped turn administrators’ knowledge into a guide, and took it to other teams in a roadshow I organized and delivered.',
      result: 'Payment now waits for verification, so problems are found before a claim looks finished. The guide joined new-hire onboarding within weeks and, 2+ years on, supervisors still share it across four offices.',
      evidence: 'My exception log, walk-throughs with adjusters, administrative staff and the salvage partner, and administrator knowledge sessions. Sources are pending review.',
    },
    notOwned: 'I didn’t own the decision: management chose to change the review timing. The salvage partner decides whether paperwork is sufficient, adjusters release payment, trainers deliver the training, and a process team built the later national letter.',
    measurement: 'Nothing here was measured in a controlled way. The figures are rounded owner estimates; each still needs its source, unit and period. Two rework observations exist, but they cover different scopes, so neither is shown and they are never compared.',
    figures: [
      { id: 'bdf2bbe1-ba80-477f-9b3e-82542a2c03b9', value: '700+', unit: 'views since it was shared', label: 'Paperwork guide access, estimated from about 30 views a month over 2+ years', basis: 'owner_estimate', qualifier: 'A running total estimated from an average, not a counted figure. Access, not use or effect.', headline: true, evidenceIds: [] },
      { id: 'fc27c92c-bd02-4066-b346-5bd85ccc12cc', value: '2+', unit: 'years in use across four offices', label: 'Guides and training in continued use (owner-reported)', basis: 'owner_estimate', qualifier: 'Use, not effectiveness. Confirm the scope applies to each resource.', headline: true, evidenceIds: [] },
    ],
    blueprint: {
      title: 'Pay, then verify. Verify, then pay.',
      caption: 'The same total-loss paperwork, before and after. The difference is when the paperwork is verified relative to payment, and what now helps people get it right.',
      provenance: 'Reconstructed for this portfolio from project notes and my portfolio deck; it was not drawn at the time. A simplified documented process: roles are generic, no partner is named, and it shows where problems could enter and surface, not how often they happened.',
      shift: 'What moved: before, payment came first and verification after it, sometimes after the claim closed. After, verification comes first and payment waits for it.',
      lanes: [
        { id: 'customer', label: 'Customer', lineAfter: 'Line of interaction' },
        { id: 'frontstage', label: 'Frontstage: letters and requests', lineAfter: 'Line of visibility' },
        { id: 'team', label: 'Claims team' },
        { id: 'partner', label: 'Salvage partner' },
      ],
      views: [
        {
          id: 'before', label: 'Before: pay → verify',
          summary: '“Complete” meant delivered, so payment could go out before the paperwork was verified. Problems surfaced at salvage review, sometimes after the claim had closed.',
          stages: [
            { label: 'Total loss', cells: [
              { lane: 'customer', text: 'Learns the vehicle is a total loss.' },
              { lane: 'frontstage', text: 'A cover letter and a request for the title and transfer paperwork.' },
            ] },
            { label: 'Mailed back', cells: [
              { lane: 'customer', text: 'Completes the paperwork and mails it back.' },
              { lane: 'customer', mark: 'failure', text: 'Missing mileage.' },
              { lane: 'customer', mark: 'failure', text: 'Wrong or missing sections.' },
              { lane: 'customer', mark: 'failure', text: 'Missing signatures.' },
              { lane: 'customer', mark: 'failure', text: 'Wrong return carrier.' },
              { lane: 'frontstage', text: 'The letter leaves several decisions to the customer.' },
            ] },
            { label: 'Paid', note: 'Not yet verified', cells: [
              { lane: 'team', mark: 'failure', text: 'Delivery is recorded as complete, and payment goes out before the paperwork is verified.' },
            ] },
            { label: 'Salvage review', cells: [
              { lane: 'partner', text: 'Reviews whether the paperwork is sufficient.' },
              { lane: 'partner', mark: 'failure', text: 'Defects are caught here, after payment.' },
            ] },
            { label: 'Rework', note: 'After the claim closed', cells: [
              { lane: 'customer', mark: 'failure', text: 'Could be asked to fix paperwork for a claim that looked finished.' },
              { lane: 'frontstage', text: 'Follow-up requests to fix the paperwork.' },
              { lane: 'team', text: 'The admin team follows up until the paperwork is fixed.' },
            ] },
          ],
        },
        {
          id: 'after', label: 'After: verify → pay',
          summary: '“Complete” now means verified. Adjusters verify the paperwork before paying, the salvage partner checks it when something is uncertain, and payment goes out once the vehicle is picked up. Trade-off: customers wait before payment, not after closing.',
          stages: [
            { label: 'Total loss', cells: [
              { lane: 'customer', text: 'Learns the vehicle is a total loss.' },
              { lane: 'frontstage', mark: 'change', text: 'A redesigned cover letter asks the customer to make fewer decisions. (My early versions; a later national version is a process team’s work.)' },
            ] },
            { label: 'Photo reviewed', note: 'Verification moved upstream', cells: [
              { lane: 'customer', text: 'Completes the paperwork and sends a photo of it.' },
              { lane: 'customer', mark: 'failure', text: 'The same defects can still happen.' },
              { lane: 'team', mark: 'change', text: 'An adjuster reviews the photo and verifies the paperwork before paying.' },
              { lane: 'team', mark: 'change', text: 'Admins, claims reps and support teams use the guide; it is part of new-cohort onboarding.' },
            ] },
            { label: 'Salvage, if uncertain', cells: [
              { lane: 'partner', mark: 'change', text: 'Checks the paperwork when something is uncertain.' },
              { lane: 'customer', text: 'May be asked to fix paperwork, now before payment.' },
            ] },
            { label: 'Paid once picked up', note: 'Payment waits for verification', cells: [
              { lane: 'team', mark: 'change', text: 'Payment goes out once the paperwork is verified and the vehicle is picked up.' },
              { lane: 'customer', text: 'Waits before payment, not after closing.' },
            ] },
          ],
        },
      ],
    },
    status: { kind: 'in_use', label: 'In use 2+ years across four offices' },
    deepDive: true,
    interactive: 'move-the-checkpoint',
    statements: [
      { id: 'ed50dcf8-47c0-4ddd-af83-b910c458ad12', section: 'observedCondition', kind: 'direct_observation', contribution: 'identified', evidenceIds: [], text: 'A delivery could be recorded, and payment released, before the salvage partner decided the paperwork was sufficient.', limitation: 'Source pending. Describes the earlier process, not every claim.' },
      { id: '3fb07550-5e1f-4326-b8dd-b01b62502d25', section: 'observedCondition', kind: 'direct_observation', contribution: 'identified', evidenceIds: [], text: 'Paperwork with missing details, details that were unreadable or changed by hand, or completion by only one of the people required was returned to customers to correct. Missing details were the most common.', limitation: 'Source pending. The ranking is my account, not a measured frequency.' },
      { id: '2f19d6f6-513f-4e67-a16b-7739f23d0334', section: 'investigation', kind: 'direct_observation', contribution: 'identified', evidenceIds: [], text: 'I began the work unassigned and kept a log of recurring exceptions.', limitation: 'Source pending. The log’s definition and time window still need to be stated.' },
      { id: 'ae635309-53e4-4323-8609-4495f4e57fe1', section: 'workingExplanation', kind: 'practitioner_interpretation', contribution: 'identified', evidenceIds: [], text: 'The recorded handoff and the acceptance check described different states.', limitation: 'Interpretation. Other causes of rework were not examined here.' },
      { id: '9fa22fd6-7311-4b3f-b078-159e33f558a2', section: 'response', kind: 'documented_outcome', contribution: 'influenced', evidenceIds: [], text: 'Leadership chose to verify before paying: adjusters verify the paperwork before payment, and the salvage partner checks it when uncertain.', limitation: 'Source pending. Implementation date and scope still need to be stated.' },
      { id: 'df37a6b3-f276-4fc5-81b5-026de7435747', section: 'investigation', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [], text: 'I facilitated administrator meetings that surfaced practical knowledge and procedural differences.', limitation: 'Source pending. Participation is not evidence of learning.' },
      { id: '41e8eff7-7faa-4350-8ba8-827721641966', section: 'response', kind: 'direct_observation', contribution: 'implemented', evidenceIds: [], text: 'The paperwork guide, support training deck and onboarding program are distinct resources for different audiences.', limitation: 'Source pending. The reach of one is never combined with another.' },
      { id: '22229e3b-c7e6-4193-8855-b09427098bdd', section: 'consequence', kind: 'documented_outcome', contribution: 'observed_use', evidenceIds: [], text: 'Trainers teach from a deck built from my training deck.', limitation: 'Source pending. Use is not effectiveness.' },
      { id: 'f3a8f704-380a-45f6-a9b7-2ced77765186', section: 'consequence', kind: 'documented_outcome', contribution: 'observed_use', evidenceIds: [], text: 'Supervisors continue to share the guide across four offices, more than two years after it was posted.', limitation: 'Distribution and continued use, not measured effectiveness.' },
      { id: 'd3279eeb-0fe7-467a-8b6e-47436d8a0f65', section: 'consequence', kind: 'hypothesis', contribution: 'designed_or_facilitated', evidenceIds: [], text: 'Making practitioner knowledge shareable may reduce reliance on a few experienced individuals.', limitation: 'Not measured; an open question, not a finding.' },
    ],
  },
  blocks: [
    { id: '625493f4-3f5a-417b-a243-e1ad631300a4', type: 'callout', label: 'Review status', markdown: `**Unapproved candidate, shown for owner review only.** No statement on this page has an attached source yet, and none of it is approved for publication. Publication requires verified sources, a privacy review and an authenticated owner approval of this exact revision.\n\nCandidate token: ${claimsCandidateToken}.` },
    { id: 'e685e069-41d9-480e-b564-73d500d0a9b9', type: 'callout', label: 'Purpose and its limit', markdown: 'This case shows evidence of **facilitation**: administrators’ practical knowledge shaped shared resources. Whether that made the team more independently capable is not established here.' },
  ],
}

/** Local-preview projection. Deliberately bypasses approval; never use for production output. */
export function claimsCandidatePreviewProjection(): PublicProjection {
  const { editorialState: _state, visibility: _visibility, internalNotes: _notes, ...entry } = claimsCandidate
  return {
    schemaVersion: 1,
    entries: [{ ...entry, path: entryPath(claimsCandidate), contribution: claimsCandidate.contribution ?? '' }],
    relationships: [], evidence: [], assets: [], aliases: [],
  }
}
