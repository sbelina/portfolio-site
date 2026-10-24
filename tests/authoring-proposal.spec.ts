import { test, expect } from '@playwright/test'
import { entrySchema, storeSchema, type Entry } from '../src/content/model'
import { buildPublicProjection, digestRecord } from '../src/content/projection'
import { fixtureStore } from './fixtures/reading-content'
import { proposedPreviewDecision, proposedSavePrecondition, type ProposedPreviewGrant, type ProposedPreviewRequest } from './support/proposed-authoring'

// Proposal examples; these tests do not exercise real sessions, Git persistence,
// network access control, or deployment. All content is synthetic.
test('incomplete restricted drafts save structurally but cannot become selected public content', () => {
  const draft: Entry = { ...fixtureStore.entries[0], revision: 2, title: '', summary: '', authorIds: [], contribution: undefined, blocks: [], evidenceIds: [], createdAt: null, updatedAt: null, editorialState: 'draft', visibility: 'restricted' }
  expect(entrySchema.safeParse(draft).success).toBe(true)
  expect(entrySchema.safeParse({ ...draft, editorialState: 'approved' }).success).toBe(false)
  const selection = { schemaVersion: 1 as const, releaseId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', applicationRevision: 'a'.repeat(40), contentRevision: 'b'.repeat(40), entries: [{ id: draft.id, revision: draft.revision, digest: digestRecord(draft) }], relationships: [], evidence: [], assets: [], aliases: [] }
  expect(() => buildPublicProjection({ entries: [draft], relationships: [], evidence: [], assets: [], aliases: [] }, selection, [{ candidateDigest: digestRecord(selection), approvedBy: 'synthetic-not-authentication', approvedAt: '2000-01-01T00:00:00Z' }])).toThrow('not approved public')
})

test('proposed save precondition rejects stale revision, moved head, wrong repository and competing creates', () => {
  const actual = { repository: 'synthetic/private', contentId: fixtureStore.entries[0].id, revision: 2, head: 'a'.repeat(40) }
  expect(proposedSavePrecondition(actual, actual)).toBe(true)
  for (const expected of [{ ...actual, revision: 1 }, { ...actual, head: 'b'.repeat(40) }, { ...actual, repository: 'synthetic/other' }, { ...actual, contentId: 'other' }, { ...actual, revision: null }]) {
    expect(proposedSavePrecondition(expected, actual)).toBe(false)
  }
  expect(proposedSavePrecondition({ ...actual, revision: null }, { ...actual, revision: null })).toBe(true)
  // Actual CAS must compare this same head while updating it atomically; a
  // check-then-unconditional-write would still be racy despite this pure test.
})

test('proposed preview policy denies absent, expired, wrong-scope and wrong-candidate grants for pages data and assets', () => {
  const grant: ProposedPreviewGrant = { subject: 'synthetic-owner', repository: 'synthetic/private', candidateDigest: 'c'.repeat(64), expiresAt: 200, capabilities: ['preview:page', 'preview:data', 'preview:asset'] }
  for (const resource of ['page', 'data', 'asset'] as const) {
    const request: ProposedPreviewRequest = { resource, repository: grant.repository, candidateDigest: grant.candidateDigest, now: 100, method: 'GET' }
    expect(proposedPreviewDecision(grant, request).permitted).toBe(true)
    for (const bad of [null, { ...grant, subject: '' }, { ...grant, expiresAt: 100 }, { ...grant, repository: 'synthetic/other' }, { ...grant, candidateDigest: 'd'.repeat(64) }, { ...grant, capabilities: [] }]) {
      expect(proposedPreviewDecision(bad, request).permitted).toBe(false)
    }
    expect(proposedPreviewDecision(grant, { ...request, method: 'POST' }).permitted).toBe(false)
    expect(proposedPreviewDecision(null, request)).toMatchObject({ cacheControl: 'private, no-store', vary: 'Cookie, Authorization' })
  }
})

test('portable synthetic store round-trip preserves text revisions relationships and private fields without making them public', () => {
  const original = storeSchema.parse(structuredClone(fixtureStore))
  const exported = JSON.stringify({ schemaVersion: 1, store: original, storeDigest: digestRecord(original) })
  const envelope = JSON.parse(exported)
  const restored = storeSchema.parse(envelope.store)
  expect(digestRecord(restored)).toBe(envelope.storeDigest)
  expect(restored).toEqual(original)
  restored.entries[0].title += ' altered after export'
  expect(digestRecord(restored)).not.toBe(envelope.storeDigest)
})
