import { expect, test } from '@playwright/test'
import { artifactInspectorSchema, caseBlockEvidenceIds, evidenceInspectorSchema, workflowComparisonSchema, type ArtifactInspectorBlock, type EvidenceInspectorBlock, type WorkflowComparisonBlock } from '../src/content/case-blocks'
import { entrySchema, storeSchema, type ContentBlock, type ContentStore, type ReleaseManifest } from '../src/content/model'
import { digestRecord, validateCandidateProjection } from '../src/content/projection'

// Entirely invented content. No real manuscript, metric, employer or approval.
const uuid = (value: number) => `c0000000-0000-4000-8000-${value.toString(16).padStart(12, '0')}`
const date = '2000-01-01T00:00:00Z'
const sourceId = uuid(500)
const stage = () => ({ id: uuid(2), action: 'Prepare a sample', actor: 'Fictional sender', information: 'An invented description is available.', consequence: 'A question could be clarified.', evidenceIds: [] as string[] })
function workflow(): WorkflowComparisonBlock {
  return { id: uuid(1), type: 'workflow_comparison', anchor: 'workflow-example', title: 'Invented sequence comparison', summary: 'A categorical illustration, not recorded operations.', basis: 'conceptual', limitation: 'No observed process, timing, probability or outcome is represented.', before: { label: 'Initial illustration', summary: 'One fictional order.', stages: [stage()] }, after: { label: 'Alternative illustration', summary: 'Another fictional order.', stages: [{ ...stage(), checkpoint: true }] } }
}
function artifacts(): ArtifactInspectorBlock {
  return { id: uuid(20), type: 'artifact_inspector', title: 'Invented resource', summary: 'An explicitly fictional resource description.', artifacts: [{ id: uuid(21), title: 'Sample note', purpose: 'Explain an invented question.', audience: ['Fictional reader'], reasoning: 'The example can be read as text.', contribution: 'A synthetic demonstration, not an author accomplishment.', implementation: 'Not implemented in a real organization.', retainedValue: 'No continued use has been observed.', limitation: 'No real outcome follows from this reconstruction.', representation: 'illustrative_reconstruction', reconstruction: 'Example only: ask which account is being used.', kind: 'conceptual_illustration', evidenceIds: [] }] }
}
function claims(): EvidenceInspectorBlock {
  return { id: uuid(30), type: 'evidence_inspector', title: 'Inspect an invented assertion', summary: 'A source and limit must remain distinct.', claims: [{ id: uuid(31), statement: 'The invented account could prompt a question.', kind: 'hypothesis', contribution: 'identified', sourceSummary: 'Synthetic description, not an operational record.', scope: 'Fictional example only.', period: 'No observation period.', limitation: 'Not an observed effect or implemented change.', evidenceIds: [] }] }
}
function store(blocks: ContentBlock[]): ContentStore {
  return { entries: [{ schemaVersion: 1, id: uuid(100), revision: 1, kind: 'investigation', format: 'case', slug: 'synthetic-case-contract', title: 'Synthetic content-contract test', summary: 'An invented account used to test constraints.', editorialState: 'approved', visibility: 'public', createdAt: date, updatedAt: date, authorIds: [uuid(101)], topicIds: [], contribution: 'Synthetic test only; no real author approval.', blocks, evidenceIds: [] }], relationships: [], evidence: [{ schemaVersion: 1, id: sourceId, revision: 1, visibility: 'public', reviewState: 'approved', title: 'Synthetic source', source: 'Invented test material', locator: 'Synthetic fixture only', observedAt: date, role: 'context', limitations: 'No actual observation or approval.', assetIds: [], rights: 'cleared', redaction: 'not-required', kind: 'reference' }], assets: [], aliases: [] }
}
function selection(input: ContentStore): ReleaseManifest {
  const refs = (records: { id: string; revision: number }[]) => records.map(record => ({ id: record.id, revision: record.revision, digest: digestRecord(record) }))
  return { schemaVersion: 1, releaseId: uuid(200), applicationRevision: 'a'.repeat(40), contentRevision: 'b'.repeat(40), entries: refs(input.entries.filter(entry => entry.visibility === 'public')), relationships: refs(input.relationships), evidence: refs(input.evidence), assets: refs(input.assets), aliases: refs(input.aliases) }
}

test('case blocks validate safe data and preserve explicit unknowns in drafts', () => {
  expect(workflowComparisonSchema.parse(workflow()).after.stages[0].id).toBe(workflow().before.stages[0].id)
  expect(artifactInspectorSchema.safeParse(artifacts()).success).toBe(true)
  const block = claims(); block.claims[0].kind = 'unverified'; block.claims[0].scope = 'Unknown; needs author review.'
  const input = store([workflow(), artifacts(), block]); input.entries[0].editorialState = 'draft'; input.entries[0].visibility = 'restricted'
  expect(storeSchema.safeParse(input).success).toBe(true)
  expect(evidenceInspectorSchema.safeParse({ ...block, publicationApproved: true }).success).toBe(false)
  expect(workflowComparisonSchema.safeParse({ ...workflow(), onSelect: 'executeSomething()' }).success).toBe(false)
})

test('case schemas reject missing labels, ambiguous reconstruction and duplicate child identities', () => {
  const duplicateStage = workflow(); duplicateStage.after.stages.push(duplicateStage.after.stages[0])
  expect(workflowComparisonSchema.safeParse(duplicateStage).success).toBe(false)
  expect(workflowComparisonSchema.safeParse({ ...workflow(), limitation: '   ' }).success).toBe(false)
  const duplicateArtifact = artifacts(); duplicateArtifact.artifacts.push(duplicateArtifact.artifacts[0])
  expect(artifactInspectorSchema.safeParse(duplicateArtifact).success).toBe(false)
  const unlabeled = artifacts(); unlabeled.artifacts[0].representation = 'description'
  expect(artifactInspectorSchema.safeParse(unlabeled).success).toBe(false)
  const missing = artifacts(); delete missing.artifacts[0].reconstruction
  expect(artifactInspectorSchema.safeParse(missing).success).toBe(false)
  const duplicateClaim = claims(); duplicateClaim.claims.push(duplicateClaim.claims[0])
  expect(evidenceInspectorSchema.safeParse(duplicateClaim).success).toBe(false)
})

test('authored anchors reject reserved, duplicate and automatic-anchor collisions without changing legacy reading formats', () => {
  const first = { id: uuid(401), type: 'prose' as const, anchor: 'overview', markdown: 'An invented opening.' }
  const second = { id: uuid(402), type: 'callout' as const, label: 'A limit', markdown: 'No measured result.' }
  expect(entrySchema.safeParse(store([first, second]).entries[0]).success).toBe(true)
  for (const anchor of ['contribution', 'connections', 'reading-main', 'reading-title', 'evidence', 'limitations']) {
    expect(entrySchema.safeParse(store([{ ...first, anchor }, second]).entries[0]).success).toBe(false)
  }
  expect(entrySchema.safeParse(store([first, { ...second, anchor: 'overview' }]).entries[0]).success).toBe(false)
  expect(entrySchema.safeParse(store([{ ...first, anchor: `block-${second.id}` }, second]).entries[0]).success).toBe(false)
  expect(entrySchema.safeParse(store([{ ...first, anchor: '#bad target' }]).entries[0]).success).toBe(false)
  const legacy = store([{ ...second, label: 'Limitations' }, { id: uuid(403), type: 'verse', text: '  One line\n\n\tAnother.' }]).entries[0]
  expect(entrySchema.parse(legacy).blocks[1]).toEqual(legacy.blocks[1])
})

test('all new block references resolve during draft validation and source collection deduplicates IDs', () => {
  const variants: ContentBlock[] = [workflow(), artifacts(), claims()]
  const sequence = variants[0] as WorkflowComparisonBlock
  sequence.before.stages[0].evidenceIds = [sourceId]; sequence.after.stages[0].evidenceIds = [sourceId]
  ;(variants[1] as ArtifactInspectorBlock).artifacts[0].evidenceIds = [sourceId]
  ;(variants[2] as EvidenceInspectorBlock).claims[0].evidenceIds = [sourceId]
  expect(caseBlockEvidenceIds(sequence)).toEqual([sourceId])
  expect(storeSchema.safeParse(store(variants)).success).toBe(true)
  for (const block of variants) {
    const input = store([block]); input.evidence = []
    expect(storeSchema.safeParse(input).success).toBe(false)
  }
})

test('public selection requires selected sources and documented workflow support', () => {
  const block = workflow(); block.before.stages[0].evidenceIds = [sourceId]
  const input = store([block]); const manifest = selection(input); manifest.evidence = []
  expect(() => validateCandidateProjection(input, manifest)).toThrow('Case block references private or unselected evidence')
  block.basis = 'documented'
  const unsupported = store([block])
  expect(() => validateCandidateProjection(unsupported, selection(unsupported))).toThrow('Documented workflow stages require selected evidence')
  block.after.stages[0].evidenceIds = [sourceId]
  const supported = store([block])
  expect(validateCandidateProjection(supported, selection(supported)).entries[0].blocks).toEqual([block])
  supported.evidence[0].visibility = 'restricted'
  expect(() => validateCandidateProjection(supported, selection(supported))).toThrow('Selected supporting record is not approved public content')
})

test('unverified and factual-without-support claims and artifacts cannot enter public selection', () => {
  for (const kind of ['unverified', 'direct_observation', 'documented_outcome'] as const) {
    const assertion = claims(); assertion.claims[0].kind = kind
    const artifact = artifacts(); artifact.artifacts[0].kind = kind
    for (const block of [assertion, artifact]) {
      const input = store([block])
      expect(() => validateCandidateProjection(input, selection(input))).toThrow()
    }
  }
  const positive = artifacts(); positive.artifacts[0].kind = 'documented_outcome'; positive.artifacts[0].evidenceIds = [sourceId]
  const input = store([positive])
  expect(validateCandidateProjection(input, selection(input)).entries[0].blocks).toEqual([positive])
})

test('measured case claims need measurement provenance and intended benefit is not measured impact', () => {
  const block = claims(); block.claims[0].kind = 'measured_result'; block.claims[0].contribution = 'measured_impact'; block.claims[0].evidenceIds = [sourceId]
  const input = store([block])
  expect(() => validateCandidateProjection(input, selection(input))).toThrow('measurement provenance')
  input.evidence[0].kind = 'metric'
  input.evidence[0].measurement = { unit: 'invented test units', denominator: 'invented test sample', period: 'synthetic period', baseline: 'not a real comparison', method: 'synthetic generation only' }
  expect(validateCandidateProjection(input, selection(input)).entries[0].blocks).toEqual([block])
  block.claims[0].kind = 'intended_benefit'
  const inconsistent = store([block]); inconsistent.evidence = input.evidence
  expect(() => validateCandidateProjection(inconsistent, selection(inconsistent))).toThrow('measurement provenance')
})

test('block changes invalidate exact selection while an unselected newer draft coexists with the old revision', () => {
  const input = store([workflow(), artifacts(), claims()]); const manifest = selection(input)
  const newer = structuredClone(input.entries[0]); newer.revision = 2; newer.visibility = 'restricted'; newer.editorialState = 'draft'
  ;(newer.blocks[0] as WorkflowComparisonBlock).after.stages[0].actor = 'PRIVATE_NEWER_DRAFT_CASE_CANARY'
  input.entries.push(newer)
  const projection = validateCandidateProjection(input, manifest)
  expect(JSON.stringify(projection)).not.toContain('PRIVATE_NEWER_DRAFT_CASE_CANARY')
  ;(input.entries[0].blocks[0] as WorkflowComparisonBlock).after.stages[0].actor = 'Changed frozen source'
  expect(() => validateCandidateProjection(input, manifest)).toThrow('Selected revision changed after candidate approval')
  expect(JSON.stringify(projection)).not.toContain('Changed frozen source')
})
