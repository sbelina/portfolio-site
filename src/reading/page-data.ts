// Build-only page selection. Full public indexes remain independent artifacts.
import { diagramEvidenceIds } from '../content/assumed-observed'
import type { PublicEntry, PublicProjection } from '../content/model'
import { renderBlocks } from './render-blocks'

export type LinkedEntry = Pick<PublicEntry, 'id' | 'path' | 'title'> & Partial<Pick<PublicEntry, 'kind' | 'summary' | 'slug'>> & { status?: NonNullable<NonNullable<PublicEntry['investigation']>['status']>; stakes?: string; deepDive?: boolean }
export type ReadingContext = {
  entries: LinkedEntry[]
  relationships: PublicProjection['relationships']
  evidence: PublicProjection['evidence']
  assets: PublicProjection['assets']
}
export type ReadingPageData = {
  kind: 'collection' | 'entry' | 'not-found'
  fixture: boolean
  /** Published synthetic experiment, distinct from an unpublished fixture. */
  illustrative?: boolean
  /** Local owner-review preview of an unapproved candidate; never part of production output. */
  candidate?: boolean
  entry?: PublicEntry
  projection: ReadingContext
  /** Sanitized build-time HTML for current entry blocks only. */
  renderedMarkdown: Record<string, string>
  /** Explicit build context; private entry previews need not expose a collection. */
  inquirySpacePath?: string
}
const metadata = ({ id, kind, path, slug, title, summary, investigation }: PublicEntry): LinkedEntry => ({ id, kind, path, slug, title, summary, ...(investigation?.status ? { status: investigation.status } : {}), ...(investigation?.decision ? { stakes: investigation.decision.stakes } : {}), ...(investigation?.deepDive ? { deepDive: true } : {}) })

export function readingPageData(projection: PublicProjection, kind: ReadingPageData['kind'], fixture: boolean, entryId?: string, inquirySpacePath?: string): ReadingPageData {
  const empty: ReadingContext = { entries: [], relationships: [], evidence: [], assets: [] }
  if (kind === 'not-found') return { kind, fixture, projection: empty, renderedMarkdown: {} }
  if (kind === 'collection') return { kind, fixture, projection: { ...empty, entries: projection.entries.filter(entry => entry.kind === 'investigation' || entry.kind === 'pattern').map(metadata) }, renderedMarkdown: {} }
  const entry = projection.entries.find(item => item.id === entryId)
  if (!entry) throw new Error('Reading entry is not in the selected public projection')
  const relationships = projection.relationships.filter(item => item.fromId === entry.id || item.toId === entry.id)
  const linkedIds = new Set(relationships.flatMap(item => [item.fromId, item.toId]))
  linkedIds.add(entry.id)
  const evidenceIds = new Set([...entry.evidenceIds, ...(entry.investigation?.statements.flatMap(statement => statement.evidenceIds) ?? []), ...relationships.flatMap(item => item.evidenceIds), ...entry.blocks.flatMap(block => block.type === 'evidence' ? [block.evidenceId] : block.type === 'assumed_observed' ? diagramEvidenceIds(block) : [])])
  const evidence = projection.evidence.filter(item => evidenceIds.has(item.id))
  const assetIds = new Set([...evidence.flatMap(item => item.assetIds), ...entry.blocks.flatMap(block => block.type === 'image' ? [block.assetId] : [])])
  return {
    kind, fixture, entry: structuredClone(entry), ...(inquirySpacePath ? { inquirySpacePath } : {}),
    projection: {
      entries: projection.entries.filter(item => linkedIds.has(item.id)).map(({ id, path, title }) => ({ id, path, title })),
      relationships: structuredClone(relationships), evidence: structuredClone(evidence),
      assets: structuredClone(projection.assets.filter(item => assetIds.has(item.id))),
    },
    renderedMarkdown: renderBlocks({ ...projection, entries: [entry] }),
  }
}
