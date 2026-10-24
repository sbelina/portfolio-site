import { test, expect } from '@playwright/test'
import { assetSchema, blockSchema, entrySchema, evidenceSchema, type Asset, type ContentStore, type Entry, type ReleaseManifest } from '../src/content/model'
import { buildPublicProjection, digestRecord } from '../src/content/projection'

// Synthetic, public-safe test records. These are not actual content approvals.
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
const date = '2026-10-23T00:00:00Z'
function entry(n: number, overrides: Partial<Entry> = {}): Entry {
  return { schemaVersion: 1, id: id(n), revision: 1, kind: n === 2 ? 'pattern' : 'investigation', slug: `synthetic-${n}`, title: `Synthetic entry ${n}`, summary: 'Synthetic test summary, not a real finding.', editorialState: 'approved', visibility: 'public', createdAt: date, updatedAt: date, authorIds: [id(90)], topicIds: [], contribution: 'Synthetic fixture author.', blocks: [{ id: id(n + 100), type: 'prose', markdown: 'Synthetic approved revision A.' }], evidenceIds: [], ...overrides }
}
function store(): ContentStore { return { entries: [entry(1), entry(2)], relationships: [], evidence: [], assets: [], aliases: [] } }
function manifest(input: ContentStore): ReleaseManifest {
  const refs = (records: { id: string; revision: number }[]) => records.map(record => ({ id: record.id, revision: record.revision, digest: digestRecord(record) }))
  return { schemaVersion: 1, releaseId: id(80), applicationRevision: 'a'.repeat(40), contentRevision: 'b'.repeat(40), entries: refs(input.entries.filter(record => record.revision === 1)), relationships: refs(input.relationships), evidence: refs(input.evidence), assets: refs(input.assets), aliases: refs(input.aliases) }
}
function approve(selection: ReleaseManifest) { return [{ candidateDigest: digestRecord(selection), approvedBy: 'synthetic-test-approver', approvedAt: date }] }
function project(input: ContentStore) { const selection = manifest(input); return buildPublicProjection(input, selection, approve(selection)) }
const relation = (fromId = id(1), toId = id(2)) => ({ schemaVersion: 1 as const, id: id(50), revision: 1, visibility: 'public' as const, reviewState: 'approved' as const, fromId, toId, type: 'illustrates' as const, rationale: 'Synthetic rationale explaining a specific connection.', evidenceIds: [], provenance: 'owner' as const })
const evidence = () => ({ schemaVersion: 1 as const, id: id(60), revision: 1, visibility: 'public' as const, reviewState: 'approved' as const, title: 'Synthetic reference', source: 'Synthetic source', locator: 'Synthetic public-safe locator', observedAt: date, role: 'context' as const, limitations: 'Synthetic only.', assetIds: [], rights: 'cleared' as const, redaction: 'not-required' as const, kind: 'reference' as const })
function asset(): Asset { return { schemaVersion: 1, id: id(70), revision: 1, visibility: 'public', reviewState: 'approved', kind: 'public_derivative', rights: 'cleared', checksum: 'c'.repeat(64), mimeType: 'image/png', url: '/media/synthetic.png', width: 20, height: 20, alt: 'Synthetic image', decorative: false, credit: 'Synthetic fixture', sourceLocator: 'SYNTHETIC_PRIVATE_ORIGINAL_KEY' } }

test('versioned schemas reject invalid identity, incomplete approved metadata and unknown executable interactions', () => {
  expect(entrySchema.safeParse(entry(1, { id: 'title-derived' })).success).toBe(false)
  expect(entrySchema.safeParse(entry(1, { createdAt: null })).success).toBe(false)
  expect(entrySchema.safeParse(entry(1, { editorialState: 'draft', createdAt: null, updatedAt: null, authorIds: [], contribution: undefined })).success).toBe(true)
  expect(blockSchema.safeParse({ id: id(20), type: 'interaction', component: 'eval', componentVersion: 1, props: { javascript: 'alert(1)' } }).success).toBe(false)
  expect(blockSchema.safeParse({ id: id(20), type: 'interaction', component: 'assumption-comparison', componentVersion: 1, props: { before: 'Assumption', after: 'Observation', extraExecutableCode: 'no' } }).success).toBe(false)
  expect(evidenceSchema.safeParse({ ...evidence(), kind: 'metric' }).success).toBe(false)
  expect(assetSchema.safeParse({ ...asset(), mimeType: 'image/svg+xml', url: '/media/active.svg' }).success).toBe(false)
})

test('projection selects approved revision A while later draft B coexists', () => {
  const input = store()
  input.entries.push(entry(1, { revision: 2, editorialState: 'draft', title: 'SYNTHETIC_UNSELECTED_DRAFT_B', blocks: [{ id: id(101), type: 'prose', markdown: 'SYNTHETIC_UNSELECTED_DRAFT_BODY' }] }))
  const output = project(input)
  expect(output.entries.find(record => record.id === id(1))?.revision).toBe(1)
  expect(JSON.stringify(output)).not.toContain('SYNTHETIC_UNSELECTED_DRAFT')
})

test('public visibility alone does not approve content or a release candidate', () => {
  const input = store(), selection = manifest(input)
  expect(() => buildPublicProjection(input, selection, [])).toThrow('Candidate approval')
  input.entries[0].editorialState = 'draft'
  expect(() => project(input)).toThrow('not approved public')
})

test('candidate approval binds exact content and application selections', () => {
  const input = store(), selection = manifest(input), approvals = approve(selection)
  const changed = structuredClone(selection)
  changed.applicationRevision = 'c'.repeat(40)
  expect(() => buildPublicProjection(input, changed, approvals)).toThrow('Candidate approval')
  const moved = structuredClone(selection)
  moved.entries[0].revision = 2
  expect(() => buildPublicProjection(input, moved, approvals)).toThrow('Candidate approval')
  input.entries[0].summary = 'Changed after approval'
  expect(() => buildPublicProjection(input, selection, approvals)).toThrow('changed after candidate approval')
})

test('returned projection is detached and deeply frozen', () => {
  const input = store(), output = project(input)
  input.entries[0].title = 'Later mutable private-store edit'
  input.entries[0].blocks[0] = { id: id(101), type: 'prose', markdown: 'Later edit' }
  expect(output.entries[0].title).toBe('Synthetic entry 1')
  expect(Object.isFrozen(output)).toBe(true)
  expect(Object.isFrozen(output.entries[0].blocks[0])).toBe(true)
  expect(() => { output.entries[0].title = 'Mutation' }).toThrow()
})

test('duplicate IDs, cross-kind IDs and multiple selected revisions fail clearly', () => {
  const input = store()
  input.entries.push(structuredClone(input.entries[0]))
  expect(() => project(input)).toThrow('Duplicate record identity')
  const crossKind = store()
  crossKind.relationships = [{ ...relation(), id: id(1) }]
  expect(() => project(crossKind)).toThrow('more than one record kind')
  const versions = store()
  versions.entries.push(entry(1, { revision: 2 }))
  const selected = manifest(versions)
  selected.entries.push({ id: id(1), revision: 2, digest: digestRecord(versions.entries[2]) })
  expect(() => buildPublicProjection(versions, selected, approve(selected))).toThrow('Only one revision')
})

test('duplicate slugs and alias collisions cannot claim public routes', () => {
  const input = store()
  input.entries[1].slug = input.entries[0].slug
  expect(() => project(input)).toThrow('Duplicate public slug')
  const aliases = store()
  aliases.aliases.push({ schemaVersion: 1, id: id(71), revision: 1, visibility: 'public', reviewState: 'approved', kind: 'path', path: '/investigations/synthetic-1/', targetId: id(2) })
  expect(() => project(aliases)).toThrow('Alias collides')
})

test('aliases follow stable identity across an editable slug change', () => {
  const input = store()
  input.entries[0].slug = 'renamed-synthetic'
  input.aliases = [{ schemaVersion: 1, id: id(71), revision: 1, visibility: 'public', reviewState: 'approved', kind: 'path', path: '/investigations/synthetic-1/', targetId: id(1) }]
  const output = project(input)
  expect(output.entries[0].id).toBe(id(1))
  expect(output.entries[0].path).toBe('/investigations/renamed-synthetic/')
  expect(output.aliases[0].targetId).toBe(id(1))
})

test('directional assertions retain direction; symmetric assertions normalize duplicates', () => {
  const input = store()
  input.relationships = [relation(id(2), id(1))]
  expect(project(input).relationships[0].fromId).toBe(id(2))
  input.relationships = [{ ...relation(id(2), id(1)), type: 'shares_pattern' }]
  expect(project(input).relationships[0].fromId).toBe(id(1))
  input.relationships.push({ ...relation(), id: id(51), type: 'shares_pattern' })
  expect(() => project(input)).toThrow('Duplicate relationship')
})

test('a selected relationship cannot expose a private or unselected draft endpoint', () => {
  const input = store()
  input.entries.push(entry(3, { editorialState: 'draft', visibility: 'restricted', title: 'SYNTHETIC_RESTRICTED_CANARY' }))
  input.relationships = [relation(id(1), id(3))]
  const selection = manifest(input)
  selection.entries = selection.entries.filter(record => record.id !== id(3))
  expect(() => buildPublicProjection(input, selection, approve(selection))).toThrow('endpoint is private or unselected')
  input.relationships = []
  const safeSelection = manifest(input)
  safeSelection.entries = safeSelection.entries.filter(record => record.id !== id(3))
  expect(JSON.stringify(buildPublicProjection(input, safeSelection, approve(safeSelection)))).not.toContain('SYNTHETIC_RESTRICTED_CANARY')
})

test('supporting evidence and assets must be explicitly selected and public-safe', () => {
  const input = store()
  input.entries[0].evidenceIds = [id(60)]
  input.entries[0].blocks.push({ id: id(30), type: 'evidence', evidenceId: id(60) })
  expect(() => project(input)).toThrow('unselected evidence')
  input.evidence = [evidence()]
  input.evidence[0].rights = 'pending'
  expect(() => project(input)).toThrow('rights or redaction')
  input.evidence[0].rights = 'cleared'
  input.assets = [asset()]
  input.assets[0].kind = 'original'
  expect(() => project(input)).toThrow('public derivatives')
  input.assets[0].kind = 'public_derivative'
  input.evidence[0].assetIds = [id(70)]
  const output = project(input)
  expect(output.assets).toHaveLength(1)
  expect(JSON.stringify(output)).not.toContain('SYNTHETIC_PRIVATE_ORIGINAL_KEY')
})

test('internal notes and unknown fields cannot leak into public records', () => {
  const input = store()
  input.entries[0].internalNotes = 'SYNTHETIC_INTERNAL_NOTES_CANARY'
  expect(JSON.stringify(project(input))).not.toContain('SYNTHETIC_INTERNAL_NOTES_CANARY')
  expect(entrySchema.safeParse({ ...input.entries[0], secretProperty: 'Synthetic unknown field' }).success).toBe(false)
})

test('duplicate fragment aliases and references to missing selected revisions are rejected', () => {
  const input = store()
  input.aliases = [71, 72].map(n => ({ schemaVersion: 1, id: id(n), revision: 1, visibility: 'public', reviewState: 'approved', kind: 'fragment', fragment: 'synthetic-old-anchor', targetId: id(1) }))
  expect(() => project(input)).toThrow('Duplicate fragment alias')
  const selected = manifest(store())
  selected.entries[0].revision = 55
  expect(() => buildPublicProjection(store(), selected, approve(selected))).toThrow('Selected revision is missing')
})

test('block identities are globally unique across a selected release', () => {
  const input = store()
  input.entries[1].blocks[0].id = input.entries[0].blocks[0].id
  expect(() => project(input)).toThrow('Duplicate public block identity')
  expect(entrySchema.safeParse(entry(1, { authorIds: [id(90), id(90)] })).success).toBe(false)
})
