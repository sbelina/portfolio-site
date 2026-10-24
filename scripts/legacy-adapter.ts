import { projects, writings, archiveItems, graphNodes, graphEdges } from '../src/data'
import stableIds from '../content/legacy-ids.json' with { type: 'json' }
import stableBlockIds from '../content/legacy-block-ids.json' with { type: 'json' }
import legacyAnchors from '../content/legacy-anchors.json' with { type: 'json' }
import { entrySchema, entryPath, type Entry } from '../src/content/model'

const ids: Record<string, string> = stableIds
const blockIds: Record<string, string> = stableBlockIds
export function adaptLegacyContent(): Entry[] {
  const rows = [
    ...projects.map(record => ({ legacyId: record.id, kind: 'investigation', format: 'case', title: record.title, summary: record.summary, text: `Observed: ${record.observed}\n\nDiagnosed: ${record.diagnosed}\n\nStructure: ${record.structure}\n\nWhat remains: ${record.remains}` })),
    ...writings.map(record => ({ legacyId: record.id, kind: record.kind === 'Essay' ? 'perspective' : 'observation', format: record.kind === 'Field note' ? 'field_note' : record.kind === 'Essay' ? 'essay' : undefined, title: record.title, summary: record.context, text: record.excerpt })),
    ...archiveItems.map(record => ({ legacyId: record.id, kind: 'reference', title: record.title, summary: record.note, text: record.note })),
  ]
  return rows.map(row => entrySchema.parse({
    schemaVersion: 1, id: ids[row.legacyId], revision: 1, kind: row.kind,
    ...('format' in row ? { format: row.format } : {}), slug: row.legacyId,
    title: row.title, summary: row.summary, editorialState: 'draft', visibility: 'restricted',
    createdAt: null, updatedAt: null, authorIds: [], topicIds: [],
    contribution: 'Legacy prototype import; contribution wording requires review.',
    // Blocks receive recorded immutable identity too; distinct record kinds have distinct namespaces.
    blocks: [{ id: blockIds[row.legacyId], type: 'prose', markdown: row.text }], evidenceIds: [],
  }))
}

export function migrationLedger(homeHtml: string) {
  const drafts = adaptLegacyContent()
  const anchors = [...new Set([...homeHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))]
  return {
    schemaVersion: 1,
    baseline: 'abaa9a9aa28dfc665f8b34816559209c797114b8',
    sourceReview: 'No approved migration wording or separate Emergent source supplied; original public prototype remains unchanged.',
    content: drafts.map(entry => ({ legacyId: entry.slug, originalFormat: writings.find(item => item.id === entry.slug)?.kind ?? archiveItems.find(item => item.id === entry.slug)?.type ?? 'Case', classification: 'proposed mapping; owner review required', contentId: entry.id, oldLocation: archiveItems.some(item => item.id === entry.slug) ? '/#archive' : `/#${entry.slug}`, proposedRoute: entryPath(entry), activeDestination: 'retained legacy home fragment', review: 'unreviewed draft; not selected for publication', dates: 'unknown; no invented dates' })),
    anchors: anchors.filter(id => !id.startsWith('fixture-')).map(id => ({ id, destination: `/#${id}`, source: legacyAnchors.includes(id) ? 'legacy baseline' : 'new reading gateway/bootstrap', verification: 'present in initial home HTML' })),
    graph: graphNodes.map(node => ({ id: node.id, kind: node.kind, href: node.href ?? null, status: 'retained in existing graph; canonical conversion awaits review' })),
    edges: graphEdges.map((edge) => ({ legacyId: `${edge.source}::${edge.target}`, from: edge.source, to: edge.target, label: edge.relation ?? null, status: 'retained; not promoted to approved canonical relationships' })),
    dependencies: ['Owner review of exact canonical text, evidence, rights and contributions', 'Separate Emergent export for feature parity'],
  }
}
