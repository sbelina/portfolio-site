import { expect, test } from '@playwright/test'
import { entrySchema, relationshipSchema, type Entry, type Relationship } from '../src/content/model'
import { explorationSchema, inquirySpaceSchema, type InquirySpace } from '../src/content/inquiry-space'

// Invented contract examples only. No owner manuscript or real evidence.
const id = (value: number) => `00000000-0000-4000-8000-${String(value).padStart(12, '0')}`
const date = '2000-01-01T00:00:00Z'
const space = (overrides: Partial<InquirySpace> = {}): InquirySpace => ({ schemaVersion: 1, presentation: 'fragment', form: 'glimmer', epistemicMode: 'expression', featured: false, ...overrides })
function fragment(overrides: Partial<Entry> = {}): Entry {
  return {
    schemaVersion: 1, id: id(1), revision: 1, kind: 'observation', format: 'field_note',
    slug: 'synthetic-inquiry-fragment', title: 'A fictional listening post', summary: 'An invented fragment for contract testing.',
    editorialState: 'approved', visibility: 'public', createdAt: date, updatedAt: date,
    authorIds: [id(90)], topicIds: [], inquirySpace: space(), evidenceIds: [],
    blocks: [{ id: id(2), type: 'prose', markdown: 'A bell rings beside an unnamed path.' }], ...overrides,
  }
}
function pairing(overrides: Partial<Relationship> = {}): Relationship {
  return {
    schemaVersion: 1, id: id(3), revision: 1, visibility: 'restricted', reviewState: 'proposed',
    fromId: id(1), toId: id(4), type: 'paired_with', rationale: 'A speculative editorial juxtaposition of invented fragments.',
    evidenceIds: [], provenance: 'owner', exploration: { schemaVersion: 1, level: 'resonance', boundary: 'No common mechanism or causal relation has been established.', featured: false }, ...overrides,
  }
}

test('fragment presentation preserves existing content identity and needs no professional contribution', () => {
  for (const kind of ['observation', 'perspective', 'reference'] as const) {
    const parsed = entrySchema.parse(fragment({ kind }))
    expect(parsed.id).toBe(id(1)); expect(parsed.format).toBe('field_note')
    expect(parsed.contribution).toBeUndefined(); expect(parsed.evidenceIds).toEqual([])
  }
  const plain = fragment({ inquirySpace: undefined, contribution: 'Synthetic authorship context.' })
  expect(entrySchema.parse(plain).inquirySpace).toBeUndefined()
  expect(entrySchema.safeParse({ ...plain, contribution: undefined }).success).toBe(false)
})

test('art has optional context and no required scientific maturity progression or evidence score', () => {
  const forms = ['glimmer', 'question', 'contradiction', 'resonance', 'conjecture', 'expression', 'prototype'] as const
  const modes = ['expression', 'open_question', 'interpretation', 'hypothesis', 'evidence_backed'] as const
  for (const form of forms) for (const epistemicMode of modes) {
    const result = inquirySpaceSchema.parse(space({ form, epistemicMode }))
    expect(result.origin).toBeUndefined(); expect(result.possibleExplanations).toBeUndefined()
  }
  expect(inquirySpaceSchema.safeParse({ ...space(), evidenceScore: .9 }).success).toBe(false)
})

test('approved fragments can be an image, literal verse or one prompt without explanation fields', () => {
  const image = fragment({ blocks: [{ id: id(2), type: 'image', assetId: id(6) }] })
  expect(entrySchema.safeParse(image).success).toBe(true) // Projection must validate its actual selected asset.
  const verse = '  A fictional line—still open,\n\n\tand a second.'
  const poem = entrySchema.parse(fragment({ kind: 'perspective', format: 'poetry', blocks: [{ id: id(2), type: 'verse', text: verse }] }))
  expect(poem.blocks[0]).toEqual({ id: id(2), type: 'verse', text: verse })
  expect(entrySchema.safeParse(fragment({ blocks: [], inquirySpace: space({ form: 'question', epistemicMode: 'open_question', prompt: 'Which sound did the fictional listener miss?' }) })).success).toBe(true)
})

test('incomplete drafts save while approved fragments still require intentional content and attribution', () => {
  const incomplete = fragment({ editorialState: 'draft', title: '', summary: '', createdAt: null, updatedAt: null, authorIds: [], blocks: [], inquirySpace: space({ prompt: '', origin: '' }) })
  expect(entrySchema.safeParse(incomplete).success).toBe(true)
  expect(entrySchema.safeParse(fragment({ blocks: [], inquirySpace: space({ prompt: ' \n\t ' }) })).success).toBe(false)
  expect(entrySchema.safeParse(fragment({ blocks: [{ id: id(2), type: 'prose', markdown: ' \n ' }] })).success).toBe(false)
  expect(entrySchema.safeParse(fragment({ blocks: [], inquirySpace: space({ origin: 'A contextual note does not replace the fragment.' }) })).success).toBe(false)
  for (const overrides of [{ title: '' }, { summary: '' }, { authorIds: [] }, { createdAt: null }, { updatedAt: null }]) {
    expect(entrySchema.safeParse(fragment(overrides)).success).toBe(false)
  }
  expect(entrySchema.safeParse(fragment({ format: 'poetry', blocks: [], inquirySpace: space({ prompt: 'A question cannot silently replace a promised poem.' }) })).success).toBe(false)
})

test('fragment eligibility cannot exempt formal investigations or disguise experiments', () => {
  for (const kind of ['investigation', 'pattern', 'experiment'] as const) {
    expect(entrySchema.safeParse(fragment({ kind, editorialState: 'draft' })).success).toBe(false)
    expect(entrySchema.safeParse(fragment({ kind })).success).toBe(false)
  }
  const exhibit = fragment({ kind: 'experiment', inquirySpace: space({ presentation: 'exhibit', form: 'prototype' }) })
  expect(entrySchema.safeParse(exhibit).success).toBe(false) // No professional-contribution exemption for exhibits.
  expect(entrySchema.safeParse({ ...exhibit, contribution: 'An invented prototype, not a demonstrated benefit.' }).success).toBe(true)
  expect(entrySchema.safeParse({ ...exhibit, kind: 'reference', contribution: 'Synthetic context.' }).success).toBe(false)
})

test('strict presentation metadata rejects unknown authority and executable fields while preserving literal text', () => {
  for (const extra of [{ approved: true }, { visibility: 'public' }, { evidenceScore: 1 }, { onSelect: 'alert(1)' }, { component: 'eval' }]) {
    expect(inquirySpaceSchema.safeParse({ ...space(), ...extra }).success).toBe(false)
  }
  expect(inquirySpaceSchema.safeParse({ ...space(), presentation: '<script>bad()</script>' }).success).toBe(false)
  expect(inquirySpaceSchema.safeParse({ ...space(), epistemicMode: 'verified-by-agent' }).success).toBe(false)
  expect(inquirySpaceSchema.safeParse({ ...space(), featured: 'true' }).success).toBe(false)
  expect(inquirySpaceSchema.safeParse(space({ prompt: 'x'.repeat(1001) })).success).toBe(false)
  expect(inquirySpaceSchema.safeParse(space({ origin: 'x'.repeat(4001) })).success).toBe(false)
  const literal = '  <script>fictional text, never instructions</script>\n'
  expect(inquirySpaceSchema.parse(space({ prompt: literal })).prompt).toBe(literal)
})

test('authored pairing meaning remains distinct from editorial approval', () => {
  const proposed = relationshipSchema.parse(pairing())
  expect(proposed.reviewState).toBe('proposed'); expect(proposed.exploration?.level).toBe('resonance')
  const reviewed = relationshipSchema.parse(pairing({ reviewState: 'approved' }))
  expect(reviewed.reviewState).toBe('approved'); expect(reviewed.exploration?.level).toBe('resonance')
  expect(reviewed.type).toBe('paired_with'); expect(reviewed.evidenceIds).toEqual([])
  const supported = relationshipSchema.parse(pairing({ exploration: { schemaVersion: 1, level: 'supported', boundary: 'Source checking belongs to the selected projection.', featured: false } }))
  expect(supported.reviewState).toBe('proposed') // A level label grants no publication or source authority.
})

test('pairing metadata cannot silently change existing relationship assertions', () => {
  expect(relationshipSchema.safeParse(pairing({ rationale: ' \n\t ' })).success).toBe(false)
  expect(relationshipSchema.safeParse(pairing({ exploration: undefined })).success).toBe(false)
  for (const type of ['supports', 'challenges', 'extends', 'illustrates', 'contradicts', 'depends_on', 'emerged_from', 'shares_pattern'] as const) {
    expect(relationshipSchema.safeParse(pairing({ type })).success).toBe(false)
    expect(relationshipSchema.safeParse(pairing({ type, exploration: undefined })).success).toBe(true)
  }
  expect(relationshipSchema.safeParse(pairing({ toId: id(1) })).success).toBe(false)
  expect(explorationSchema.safeParse({ schemaVersion: 1, level: 'resonance', boundary: ' \n ', featured: false }).success).toBe(false)
  expect(explorationSchema.safeParse({ schemaVersion: 1, level: 'supported', boundary: 'A bounded assertion.', featured: false, approved: true }).success).toBe(false)
  expect(explorationSchema.safeParse({ schemaVersion: 1, level: 'eval()', boundary: 'A bounded assertion.', featured: false }).success).toBe(false)
})
