// Invented for the explicit local fixture build; no owner manuscript or metric.
import type { Entry, Evidence } from '../../src/content/model'
const id = (n: number) => `a1c10000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`
const prose = (n: number, anchor: string, title: string, text: string) => ({ id: id(n), type: 'prose' as const, anchor, markdown: `## ${title}\n\n${text}` })
const step = (n: number, action: string, actor: string, checkpoint = false) => ({ id: id(n), action, actor, information: 'The fictional request note is available to this role.', consequence: checkpoint ? 'There is an opportunity to ask for clarification here.' : 'A later handoff might require follow-up.', checkpoint, evidenceIds: [] })
export function workflowFixture(): Entry {
  return {
    schemaVersion: 1, id: id(1), revision: 1, kind: 'investigation', format: 'case', slug: 'fixture-checkpoint-study', title: 'Fixture: a lending-desk checkpoint',
    summary: 'An invented account for inspecting sequence, resources and limitations; not an actual investigation or outcome.',
    editorialState: 'approved', visibility: 'public', createdAt: '2000-01-01T00:00:00Z', updatedAt: '2000-01-01T00:00:00Z', authorIds: [id(2)], topicIds: [], evidenceIds: [],
    contribution: 'Synthetic template authorship only. No investigation or improvement is attributed to Sami.',
    blocks: [
      prose(10, 'visible-problem', 'The visible problem', 'A fictional lending desk sends a kit with a request note. The receiver might still need clarification. This is a scripted possibility, not an observed rate. CHECKPOINT_FIXTURE_11NOV is a production-excluded test marker.'),
      prose(11, 'investigation', 'Investigating the account', 'Which role has information to check the request? No interviews, operational records or participants support this fixture.'),
      prose(12, 'reframe', 'Reframing the question', 'The question shifts from whether an item is sent to where its meaning could be checked. This is a model to inspect, not a causal finding.'),
      { id: id(13), type: 'workflow_comparison', anchor: 'workflow', title: 'Explore the checkpoint sequence', summary: 'Choose an account. Roles and explanations stay with its sequence.', basis: 'conceptual', limitation: 'Categorical order only. No lengths represent time, cost, probability or benefit.',
        before: { label: 'Late verification', summary: 'The check occurs after the receiver has the kit in this invented account.', stages: [step(101, 'Prepare the request', 'Requester'), step(102, 'Send the kit', 'Coordinator'), step(103, 'Receive the kit', 'Receiver'), step(104, 'Check the request', 'Receiver', true)] },
        after: { label: 'Earlier verification', summary: 'This invented alternative allows the requester to amend the note before sending.', stages: [{ ...step(111, 'Prepare the request', 'Requester'), evidenceIds: [id(401)] }, step(112, 'Check the request', 'Requester and coordinator', true), step(113, 'Send the kit', 'Coordinator'), step(114, 'Receive the kit', 'Receiver')] },
      },
      prose(14, 'collective-understanding', 'Collective understanding', 'A hypothetical conversation could surface different meanings of a complete request. This is a possibility, not a meeting that occurred.'),
      { id: id(15), type: 'artifact_inspector', anchor: 'artifacts', title: 'Inspect the supporting resources', summary: 'Invented resources illustrate different functions; they do not establish adoption.', artifacts: [
        { id: id(201), title: 'Fictional request cue card', purpose: 'Make the check understandable.', audience: ['Requester', 'Coordinator'], reasoning: 'A short prompt can sit beside the request.', contribution: 'Invented for a component test.', implementation: 'No organization adopted it.', retainedValue: 'No continued use or effectiveness observed.', limitation: 'Not an original artifact or adoption evidence.', representation: 'illustrative_reconstruction', reconstruction: 'What is requested? What would the receiver need to know? What remains uncertain?', kind: 'conceptual_illustration', evidenceIds: [] },
        { id: id(202), title: 'Fictional receiver note', purpose: 'Record an exception without treating it as every request.', audience: ['Receiver'], reasoning: 'Exceptions need context.', contribution: 'Invented template.', implementation: 'No real implementation.', retainedValue: 'No sustainment claim.', limitation: 'No employer or participant source supports it.', representation: 'description', kind: 'conceptual_illustration', evidenceIds: [] },
      ] },
      prose(16, 'implementation', 'Implementation and trade-offs', 'An earlier check might require effort before sending. This hypothetical trade-off is not a measured delay or a promise every request improves.'),
      { id: id(17), type: 'evidence_inspector', anchor: 'evidence-review', title: 'Evidence and limitations', summary: 'Conceptual statements, not measurements or real case claims.', claims: [
        { id: id(301), statement: 'A different checkpoint changes the illustrated opportunity for clarification.', kind: 'conceptual_illustration', contribution: 'designed_or_facilitated', sourceSummary: 'Invented lending-desk script.', scope: 'One synthetic account.', period: 'No observation period.', limitation: 'No real reduction or measured benefit follows.', evidenceIds: [] },
        { id: id(302), statement: 'A surviving resource is not itself evidence of effectiveness.', kind: 'practitioner_interpretation', contribution: 'identified', sourceSummary: 'Conceptual distinction, not a project result.', scope: 'Fixture only.', period: 'No measured period.', limitation: 'No adoption or impact asserted.', evidenceIds: [] },
      ] },
      prose(18, 'reflection', 'Reflection and transfer', 'What evidence would distinguish a plausible diagram from a working intervention? No reader-comprehension result exists.'),
      prose(19, 'continue-exploring', 'Continue exploring', '[Explore investigations](/investigations/) or [read the inquiry practice](/practice/). No unapproved case destination is invented.'),
    ],
  }
}

export function workflowFixtureEvidence(): Evidence {
  return { schemaVersion: 1, id: id(401), revision: 1, visibility: 'public', reviewState: 'approved', title: 'Synthetic source attached only to a stage', source: 'Invented lending-desk script', locator: 'Fictional note before the sending handoff', observedAt: '2000-01-01T00:00:00Z', role: 'context', limitations: 'No real observation or operational measurement.', assetIds: [], rights: 'cleared', redaction: 'not-required', kind: 'reference' }
}
