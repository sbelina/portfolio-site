import { createHash } from 'node:crypto'
import { diagramEvidenceIds } from './assumed-observed'
import { approvalSchema, entryPath, manifestSchema, storeSchema, type CandidateApproval, type ContentStore, type PublicAlias, type PublicProjection, type RecordRef, type ReleaseManifest } from './model'
export type { PublicEntry, PublicRelationship, PublicEvidence, PublicAsset, PublicAlias, PublicProjection } from './model'

/** Stable canonical JSON for exact-revision integrity. Not an authentication mechanism. */
export function digestRecord(value: unknown): string {
  const canonical = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(canonical)
    if (item && typeof item === 'object') return Object.fromEntries(Object.entries(item).filter(([, v]) => v !== undefined).sort(([a], [b]) => a.localeCompare(b)).map(([key, val]) => [key, canonical(val)]))
    return item
  }
  return createHash('sha256').update(JSON.stringify(canonical(value))).digest('hex')
}

function frozen<T>(value: T): T {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(frozen)
    Object.freeze(value)
  }
  return value
}

/**
 * Mechanical projection boundary. Approvals must come from a trusted caller.
 * W4 must authenticate the approver and protect the release workflow; a JSON
 * approvedBy field, manifest, or this pure function cannot authorize publication.
 */
export function validateCandidateProjection(input: ContentStore, selection: ReleaseManifest): PublicProjection {
  const store = storeSchema.parse(input)
  const manifest = manifestSchema.parse(selection)
  const allIdentities = new Map<string, string>()
  const select = <T extends { id: string; revision: number }>(records: T[], refs: RecordRef[], category: string): T[] => {
    const byRevision = new Map<string, T>()
    for (const record of records) {
      const key = `${record.id}:${record.revision}`
      if (byRevision.has(key)) throw new Error('Duplicate record identity and revision')
      if (allIdentities.has(record.id) && allIdentities.get(record.id) !== category) throw new Error('Identity belongs to more than one record kind')
      allIdentities.set(record.id, category)
      byRevision.set(key, record)
    }
    const selectedIds = new Set<string>()
    return refs.map(ref => {
      if (selectedIds.has(ref.id)) throw new Error('Only one revision per identity may be selected')
      selectedIds.add(ref.id)
      const record = byRevision.get(`${ref.id}:${ref.revision}`)
      if (!record) throw new Error('Selected revision is missing')
      if (digestRecord(record) !== ref.digest) throw new Error('Selected revision changed after candidate approval')
      return record
    })
  }
  const entries = select(store.entries, manifest.entries, 'entry')
  const relationships = select(store.relationships, manifest.relationships, 'relationship')
  const evidence = select(store.evidence, manifest.evidence, 'evidence')
  const assets = select(store.assets, manifest.assets, 'asset')
  const aliases = select(store.aliases, manifest.aliases, 'alias')
  for (const entry of entries) if (entry.visibility !== 'public' || entry.editorialState !== 'approved') throw new Error('Selected entry is not approved public content')
  for (const record of [...relationships, ...evidence, ...assets, ...aliases]) {
    if (record.visibility !== 'public' || record.reviewState !== 'approved') throw new Error('Selected supporting record is not approved public content')
  }
  for (const record of evidence) if (record.rights !== 'cleared' || record.redaction === 'pending') throw new Error('Evidence publication rights or redaction are unresolved')
  for (const record of assets) if (record.rights !== 'cleared' || record.kind !== 'public_derivative') throw new Error('Only rights-cleared public derivatives can be projected')
  const entryIds = new Set(entries.map(entry => entry.id))
  const evidenceIds = new Set(evidence.map(record => record.id))
  const assetIds = new Set(assets.map(record => record.id))
  const assertReferences = (ids: string[], allowed: Set<string>, message: string) => {
    if (ids.some(id => !allowed.has(id))) throw new Error(message)
  }
  const occupiedRoutes = new Set(['/', '/investigations/', '/patterns/'])
  const occupiedSlugs = new Set<string>()
  const occupiedBlocks = new Set<string>()
  for (const entry of entries) {
    if (occupiedSlugs.has(entry.slug)) throw new Error('Duplicate public slug ownership')
    occupiedSlugs.add(entry.slug)
    const path = entryPath(entry)
    if (occupiedRoutes.has(path)) throw new Error('Duplicate public route ownership')
    occupiedRoutes.add(path)
    assertReferences(entry.evidenceIds, evidenceIds, 'Entry references unselected evidence')
    if (entry.investigation) {
      if (entry.kind !== 'investigation' || entry.format === 'poetry') throw new Error('Investigation narratives belong only to non-poetry investigations')
      for (const field of ['observedCondition', 'investigation', 'relationshipDiscovered', 'limitations'] as const) if (!entry.investigation[field]?.trim()) throw new Error('Selected investigation narrative is incomplete')
      for (const statement of entry.investigation.statements) {
        assertReferences(statement.evidenceIds, evidenceIds, 'Statement references unselected evidence')
        if (statement.kind === 'unverified') throw new Error('Unverified statements cannot enter a selected investigation')
        if (['direct_observation', 'measured_result', 'documented_outcome'].includes(statement.kind) && !statement.evidenceIds.length) throw new Error('Factual statements require selected evidence')
        if (statement.kind === 'measured_result' || statement.contribution === 'measured_impact') {
          if (statement.kind !== 'measured_result' || !statement.evidenceIds.some(id => evidence.some(e => e.id === id && e.kind === 'metric' && e.measurement))) throw new Error('Measured impact requires measurement provenance')
        }
      }
    }
    for (const block of entry.blocks) {
      if (occupiedBlocks.has(block.id)) throw new Error('Duplicate public block identity')
      occupiedBlocks.add(block.id)
      if (block.type === 'assumed_observed') assertReferences(diagramEvidenceIds(block), evidenceIds, 'Diagram references private or unselected evidence')
      if (block.type === 'evidence') assertReferences([block.evidenceId], evidenceIds, 'Evidence block references unselected evidence')
      if (block.type === 'image') assertReferences([block.assetId], assetIds, 'Image block references unselected asset')
    }
  }
  const edgeKeys = new Set<string>()
  for (const relationship of relationships) {
    assertReferences([relationship.fromId, relationship.toId], entryIds, 'Relationship endpoint is private or unselected')
    assertReferences(relationship.evidenceIds, evidenceIds, 'Relationship references unselected evidence')
    if (relationship.type === 'shares_pattern' && relationship.fromId > relationship.toId) [relationship.fromId, relationship.toId] = [relationship.toId, relationship.fromId]
    const key = `${relationship.type}:${relationship.fromId}:${relationship.toId}`
    if (edgeKeys.has(key)) throw new Error('Duplicate relationship assertion')
    edgeKeys.add(key)
  }
  for (const record of evidence) assertReferences(record.assetIds, assetIds, 'Evidence references unselected asset')
  const fragments = new Set<string>()
  for (const alias of aliases) {
    assertReferences([alias.targetId], entryIds, 'Alias target is private or unselected')
    if (alias.kind === 'path') {
      if (occupiedRoutes.has(alias.path)) throw new Error('Alias collides with canonical route or alias')
      occupiedRoutes.add(alias.path)
    } else {
      if (fragments.has(alias.fragment)) throw new Error('Duplicate fragment alias ownership')
      fragments.add(alias.fragment)
    }
  }
  const urls = new Set<string>()
  for (const asset of assets) {
    if (urls.has(asset.url)) throw new Error('Duplicate public asset URL ownership')
    urls.add(asset.url)
  }
  const projection: PublicProjection = {
    schemaVersion: 1,
    entries: entries.map(entry => ({ id: entry.id, revision: entry.revision, kind: entry.kind, ...(entry.investigation ? { investigation: structuredClone(entry.investigation) } : {}), ...(entry.format ? { format: entry.format } : {}), slug: entry.slug, path: entryPath(entry), title: entry.title, summary: entry.summary, contribution: entry.contribution ?? '', createdAt: entry.createdAt, updatedAt: entry.updatedAt, authorIds: [...entry.authorIds], topicIds: [...entry.topicIds], blocks: structuredClone(entry.blocks), evidenceIds: [...entry.evidenceIds] })),
    relationships: relationships.map(record => ({ id: record.id, fromId: record.fromId, toId: record.toId, type: record.type, rationale: record.rationale, evidenceIds: [...record.evidenceIds] })),
    evidence: evidence.map(record => ({ id: record.id, title: record.title, source: record.source, locator: record.locator, observedAt: record.observedAt, role: record.role, limitations: record.limitations, assetIds: [...record.assetIds], kind: record.kind, ...(record.measurement ? { measurement: { ...record.measurement } } : {}) })),
    assets: assets.map(record => ({ id: record.id, url: record.url, mimeType: record.mimeType, ...(record.width ? { width: record.width } : {}), ...(record.height ? { height: record.height } : {}), alt: record.alt, decorative: record.decorative, credit: record.credit, checksum: record.checksum })),
    aliases: aliases.map((record): PublicAlias => record.kind === 'path' ? { id: record.id, kind: 'path', path: record.path, targetId: record.targetId } : { id: record.id, kind: 'fragment', fragment: record.fragment, targetId: record.targetId }),
  }
  // Freeze a detached allowlisted copy; later private-store edits cannot mutate it.
  return frozen(projection)
}

/** A mechanically valid candidate is not authenticated approval. Trusted callers
 * supply authenticated approval provenance; this helper verifies only integrity. */
export function buildPublicProjection(input: ContentStore, selection: ReleaseManifest, approvals: CandidateApproval[]): PublicProjection {
  const manifest = manifestSchema.parse(selection)
  const trustedApprovals = approvals.map(approval => approvalSchema.parse(approval))
  if (!trustedApprovals.some(approval => approval.candidateDigest === digestRecord(manifest))) throw new Error('Candidate approval does not match exact selection')
  return validateCandidateProjection(input, manifest)
}
