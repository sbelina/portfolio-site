import { z } from 'zod'

export const uuidSchema = z.uuid().regex(/^[0-9a-f-]+$/, 'UUIDs use canonical lowercase spelling')
export const digestSchema = z.string().regex(/^[a-f0-9]{64}$/)
const timestamp = z.iso.datetime({ offset: true })
const visibility = z.enum(['public', 'restricted'])
const reviewState = z.enum(['proposed', 'approved', 'rejected'])
const base = { schemaVersion: z.literal(1), id: uuidSchema, revision: z.number().int().positive() }
const text = z.string().max(200_000)
const ids = z.array(uuidSchema).refine(values => new Set(values).size === values.length, { message: 'Duplicate referenced identity' })
const dates = { createdAt: timestamp.nullable(), updatedAt: timestamp.nullable() }

export const blockSchema = z.discriminatedUnion('type', [
  z.strictObject({ id: uuidSchema, type: z.literal('prose'), markdown: text }),
  z.strictObject({ id: uuidSchema, type: z.literal('callout'), label: z.string().min(1), markdown: text }),
  z.strictObject({ id: uuidSchema, type: z.literal('evidence'), evidenceId: uuidSchema }),
  z.strictObject({ id: uuidSchema, type: z.literal('image'), assetId: uuidSchema, caption: text.optional() }),
  // A registered, data-only component; arbitrary component names/props are rejected.
  z.strictObject({ id: uuidSchema, type: z.literal('interaction'), component: z.literal('assumption-comparison'), componentVersion: z.literal(1), props: z.strictObject({ before: text, after: text }) }),
])
export type ContentBlock = z.infer<typeof blockSchema>

export const entrySchema = z.strictObject({
  ...base, ...dates,
  kind: z.enum(['investigation', 'pattern', 'perspective', 'observation', 'experiment', 'reference']),
  format: z.enum(['case', 'field_note', 'essay']).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  title: z.string().max(300), summary: z.string().max(2000),
  editorialState: z.enum(['draft', 'review', 'approved', 'withdrawn']), visibility,
  authorIds: ids, topicIds: ids,
  contribution: text.optional(), blocks: z.array(blockSchema), evidenceIds: ids,
  internalNotes: text.optional(),
}).superRefine((entry, ctx) => {
  if (entry.editorialState !== 'draft' && (!entry.createdAt || !entry.updatedAt)) {
    ctx.addIssue({ code: 'custom', path: ['createdAt'], message: 'Only unreviewed drafts may have unknown dates' })
  }
  if (entry.editorialState === 'approved') {
    for (const field of ['title', 'summary', 'contribution', 'createdAt', 'updatedAt'] as const) {
      if (!entry[field]?.trim()) ctx.addIssue({ code: 'custom', path: [field], message: 'Approved entries require this field' })
    }
    if (!entry.authorIds.length) ctx.addIssue({ code: 'custom', path: ['authorIds'], message: 'Approved entries require attribution' })
  }
  if (new Set(entry.blocks.map(block => block.id)).size !== entry.blocks.length) {
    ctx.addIssue({ code: 'custom', path: ['blocks'], message: 'Duplicate block identity' })
  }
})
export type Entry = z.infer<typeof entrySchema>

export const relationshipSchema = z.strictObject({
  ...base, visibility, reviewState,
  fromId: uuidSchema, toId: uuidSchema,
  type: z.enum(['supports', 'challenges', 'extends', 'illustrates', 'contradicts', 'depends_on', 'emerged_from', 'shares_pattern']),
  rationale: z.string().min(1).max(10_000), evidenceIds: ids,
  provenance: z.enum(['owner', 'import', 'assistant_suggestion']),
  internalNotes: text.optional(),
}).refine(record => record.fromId !== record.toId, { message: 'Self relationships are not allowed' })
export type Relationship = z.infer<typeof relationshipSchema>

export const evidenceSchema = z.strictObject({
  ...base, visibility, reviewState,
  title: z.string().min(1), source: z.string().min(1), locator: z.string().min(1),
  observedAt: timestamp, role: z.enum(['supports', 'challenges', 'context']),
  limitations: text, assetIds: ids,
  rights: z.enum(['cleared', 'pending', 'restricted']),
  redaction: z.enum(['not-required', 'reviewed', 'pending']),
  kind: z.enum(['reference', 'observation', 'metric']),
  measurement: z.strictObject({ unit: z.string().min(1), denominator: z.string().min(1), period: z.string().min(1), baseline: z.string().min(1), method: z.string().min(1) }).optional(),
  internalNotes: text.optional(),
}).superRefine((record, ctx) => {
  if (record.kind === 'metric' && !record.measurement) ctx.addIssue({ code: 'custom', path: ['measurement'], message: 'Metrics require measurement provenance' })
})
export type Evidence = z.infer<typeof evidenceSchema>

export const assetSchema = z.strictObject({
  ...base, visibility, reviewState,
  kind: z.enum(['original', 'public_derivative']),
  rights: z.enum(['cleared', 'pending', 'restricted']),
  checksum: digestSchema,
  mimeType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'image/avif']),
  // Local immutable public URLs only; no active SVG or private source keys.
  url: z.string().regex(/^\/media\/[a-zA-Z0-9_-]+\.(?:png|jpg|jpeg|webp|avif)$/),
  width: z.number().int().positive().optional(), height: z.number().int().positive().optional(),
  alt: z.string().max(2000), decorative: z.boolean(), credit: z.string().min(1),
  sourceLocator: text.optional(), internalNotes: text.optional(),
}).refine(record => record.decorative || record.alt.trim().length > 0, { message: 'Informative assets need alternative text' })
export type Asset = z.infer<typeof assetSchema>

const aliasBase = { ...base, visibility, reviewState, targetId: uuidSchema }
export const aliasSchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...aliasBase, kind: z.literal('path'), path: z.string().regex(/^\/(?:investigations|patterns|perspective|notes|experiments|references)\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/) }),
  z.strictObject({ ...aliasBase, kind: z.literal('fragment'), fragment: z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/) }),
])
export type Alias = z.infer<typeof aliasSchema>

export const storeSchema = z.strictObject({
  entries: z.array(entrySchema), relationships: z.array(relationshipSchema),
  evidence: z.array(evidenceSchema), assets: z.array(assetSchema), aliases: z.array(aliasSchema),
})
export type ContentStore = z.infer<typeof storeSchema>
export const recordRefSchema = z.strictObject({ id: uuidSchema, revision: z.number().int().positive(), digest: digestSchema })
export type RecordRef = z.infer<typeof recordRefSchema>
export const manifestSchema = z.strictObject({
  schemaVersion: z.literal(1), releaseId: uuidSchema,
  applicationRevision: z.string().regex(/^[a-f0-9]{40}$/), contentRevision: z.string().regex(/^[a-f0-9]{40}$/),
  entries: z.array(recordRefSchema), relationships: z.array(recordRefSchema), evidence: z.array(recordRefSchema), assets: z.array(recordRefSchema), aliases: z.array(recordRefSchema),
})
export type ReleaseManifest = z.infer<typeof manifestSchema>
export const approvalSchema = z.strictObject({ candidateDigest: digestSchema, approvedBy: z.string().min(1), approvedAt: timestamp })
export type CandidateApproval = z.infer<typeof approvalSchema>

export type PublicEntry = Pick<Entry, 'id' | 'revision' | 'kind' | 'slug' | 'title' | 'summary' | 'createdAt' | 'updatedAt' | 'authorIds' | 'topicIds' | 'blocks' | 'evidenceIds'> & { path: string; contribution: string }
export type PublicRelationship = Pick<Relationship, 'id' | 'fromId' | 'toId' | 'type' | 'rationale' | 'evidenceIds'>
export type PublicEvidence = Pick<Evidence, 'id' | 'title' | 'source' | 'locator' | 'observedAt' | 'role' | 'limitations' | 'assetIds' | 'kind' | 'measurement'>
export type PublicAsset = Pick<Asset, 'id' | 'url' | 'mimeType' | 'width' | 'height' | 'alt' | 'decorative' | 'credit' | 'checksum'>
export type PublicAlias = Pick<Alias, 'id' | 'targetId'> & ({ kind: 'path'; path: string } | { kind: 'fragment'; fragment: string })
export type PublicProjection = { schemaVersion: 1; entries: PublicEntry[]; relationships: PublicRelationship[]; evidence: PublicEvidence[]; assets: PublicAsset[]; aliases: PublicAlias[] }

const prefixes: Record<Entry['kind'], string> = { investigation: 'investigations', pattern: 'patterns', perspective: 'perspective', observation: 'notes', experiment: 'experiments', reference: 'references' }
export function entryPath(entry: Pick<Entry, 'kind' | 'slug'>) { return `/${prefixes[entry.kind]}/${entry.slug}/` }
