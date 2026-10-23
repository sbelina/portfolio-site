/** Public-safe invented data for local fixture builds/tests ONLY. No real approvals. */
import { buildPublicProjection, digestRecord } from '../../src/content/projection'
import type { ContentStore, Entry, ReleaseManifest } from '../../src/content/model'

const date = '2000-01-01T00:00:00Z' // Explicitly synthetic fixture date.
const author = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
const id = { investigation: '11111111-1111-4111-8111-111111111111', pattern: '22222222-2222-4222-8222-222222222222', evidence: '33333333-3333-4333-8333-333333333333' }
const investigation: Entry = {
  schemaVersion: 1, id: id.investigation, revision: 1, kind: 'investigation', format: 'case',
  slug: 'fixture-claims-handoff', title: 'Fixture: claims handoff investigation',
  summary: 'A synthetic paperwork handoff used only to exercise the reading template. No real project claims or metrics are represented.',
  editorialState: 'approved', visibility: 'public', createdAt: date, updatedAt: date,
  authorIds: [author], topicIds: [], contribution: 'Synthetic template demonstration only. This is not an account of Sam’s contribution or an implemented intervention.',
  evidenceIds: [id.evidence],
  blocks: [
    { id: '10000000-0000-4000-8000-000000000001', type: 'prose', markdown: '## What did not add up?\n\nIn this fictional scenario, one role sends paperwork and another role needs to use it. The demonstration asks whether sending something and completing a usable handoff are the same event. No actual organization, participant, or case evidence is represented.\n\nThe text is deliberately modest: a question may deserve investigation without already having an outcome. Opening a disclosure reveals the source and limitation of the example. Following the explained relationship below changes the reading context without turning the interpretation into a measured result.' },
    { id: '10000000-0000-4000-8000-000000000002', type: 'evidence', evidenceId: id.evidence },
    { id: '10000000-0000-4000-8000-000000000003', type: 'callout', label: 'Proposed response', markdown: 'For this fixture, a possible question is: **can the receiving role use the handoff?** This is a proposed question, not a claim that a change was implemented or tested.\n\nA reader can inspect this reasoning as ordinary text, use the section links, open the supporting disclosure, or move to the related pattern. No graph interaction is required. No private evidence or employer information supports this invented example.' },
    { id: '10000000-0000-4000-8000-000000000004', type: 'callout', label: 'Limitations', markdown: 'This is synthetic development content, not a manuscript, approved public case, or measured finding. It cannot establish causation, business impact, or a universal pattern.\n\nFixture-only provenance token: PUBLIC_SAFE_READING_FIXTURE_9b11.' },
  ],
}
const pattern: Entry = {
  ...investigation, id: id.pattern, kind: 'pattern', format: undefined,
  slug: 'fixture-delivered-not-complete', title: 'Fixture: Delivered ≠ Complete',
  summary: 'A provisional interpretation illustrated by one fictional handoff; not an established cross-case finding.',
  contribution: 'Synthetic pattern template, with an explicitly explained connection. No authorship, review, or evidence is attributed to Sam.', evidenceIds: [],
  blocks: [
    { id: '20000000-0000-4000-8000-000000000001', type: 'prose', markdown: '## A proposition to examine\n\nWithin this fictional scenario, delivery alone does not establish that the receiving role can use what arrived. The idea is a question to investigate, not proof about actual claims operations.\n\n**Diagnostic question:** What would the receiving role need to call this handoff complete?' },
    { id: '20000000-0000-4000-8000-000000000002', type: 'callout', label: 'Limitations', markdown: 'One invented example cannot establish a general pattern. There are no measured outcomes or real supporting sources here. The incoming link below preserves the original direction: the example illustrates the pattern; the backlink does not reverse that assertion.' },
  ],
}
export const fixtureStore: ContentStore = {
  entries: [investigation, pattern, { ...investigation, revision: 2, editorialState: 'draft', visibility: 'restricted', title: 'PRIVATE_DRAFT_CANARY_8b72', summary: 'An unselected synthetic private draft must never reach public output.' }],
  relationships: [{ schemaVersion: 1, id: '44444444-4444-4444-8444-444444444444', revision: 1, visibility: 'public', reviewState: 'approved', fromId: id.investigation, toId: id.pattern, type: 'illustrates', rationale: 'In this synthetic example, a handoff is not treated as complete until the receiving role can use it. This illustrates a provisional pattern, not a measured outcome.', evidenceIds: [id.evidence], provenance: 'import' }],
  evidence: [{ schemaVersion: 1, id: id.evidence, revision: 1, visibility: 'public', reviewState: 'approved', title: 'Synthetic handoff scenario', source: 'Public-safe test fixture', locator: 'Synthetic scenario in tests/fixtures/reading-content.ts', observedAt: date, role: 'context', limitations: 'Invented solely to test rendering and disclosure. Not real source evidence or a result.', assetIds: [], rights: 'cleared', redaction: 'not-required', kind: 'reference' }],
  assets: [],
  aliases: [
    { schemaVersion: 1, id: '55555555-5555-4555-8555-555555555555', revision: 1, visibility: 'public', reviewState: 'approved', kind: 'path', path: '/investigations/fixture-old-handoff/', targetId: id.investigation },
    { schemaVersion: 1, id: '66666666-6666-4666-8666-666666666666', revision: 1, visibility: 'public', reviewState: 'approved', kind: 'fragment', fragment: 'fixture-claims-link', targetId: id.investigation },
  ],
}
const refs = <T extends { id: string; revision: number }>(records: T[]) => records.map(record => ({ id: record.id, revision: record.revision, digest: digestRecord(record) }))
export function fixtureProjection() {
  const manifest: ReleaseManifest = { schemaVersion: 1, releaseId: '77777777-7777-4777-8777-777777777777', applicationRevision: '0'.repeat(40), contentRevision: '0'.repeat(40), entries: refs(fixtureStore.entries.filter(entry => entry.revision === 1)), relationships: refs(fixtureStore.relationships), evidence: refs(fixtureStore.evidence), assets: [], aliases: refs(fixtureStore.aliases) }
  return buildPublicProjection(fixtureStore, manifest, [{ candidateDigest: digestRecord(manifest), approvedBy: 'synthetic-test-approver-not-an-owner-approval', approvedAt: date }])
}
