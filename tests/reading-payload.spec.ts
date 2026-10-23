import { expect, test } from '@playwright/test'
import { readingPageData } from '../src/reading/page-data'
import { fixtureProjection } from './fixtures/reading-content'

test('adding unrelated articles does not change an existing article payload or Markdown', () => {
  const projection = structuredClone(fixtureProjection())
  const current = projection.entries[0]
  const before = readingPageData(projection, 'entry', true, current.id)
  projection.entries.push({ ...current, id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', title: 'Unrelated article', path: '/investigations/unrelated/', slug: 'unrelated', blocks: [{ id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', type: 'prose', markdown: 'UNRELATED_BODY_CANARY **rendered too**' }] })
  const after = readingPageData(projection, 'entry', true, current.id)
  expect(after).toEqual(before)
  expect(JSON.stringify(after)).not.toContain('UNRELATED_BODY_CANARY')
  expect(Object.keys(after.renderedMarkdown)).toEqual(current.blocks.filter(block => block.type === 'prose' || block.type === 'callout').map(block => block.id))
  const linked = after.projection.entries.find(entry => entry.id !== current.id)!
  expect(linked).toBeDefined()
  expect(linked).not.toHaveProperty('blocks')
  expect(linked).not.toHaveProperty('contribution')
  expect(linked).not.toHaveProperty('summary')
  expect(linked).not.toHaveProperty('kind')
  expect(JSON.stringify(after)).not.toContain('A proposition to examine')
})

test('collection and not-found payloads contain no article bodies, Markdown or supporting records', () => {
  const projection = fixtureProjection()
  for (const kind of ['collection', 'not-found'] as const) {
    const page = readingPageData(projection, kind, true)
    expect(page.entry).toBeUndefined()
    expect(page.renderedMarkdown).toEqual({})
    expect(page.projection.relationships).toEqual([])
    expect(page.projection.evidence).toEqual([])
    expect(page.projection.assets).toEqual([])
    for (const metadata of page.projection.entries) expect(metadata).not.toHaveProperty('blocks')
  }
})

test('article payload includes only evidence and assets needed by entry blocks or its relationships', () => {
  const projection = structuredClone(fixtureProjection())
  projection.evidence.push({ ...projection.evidence[0], id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', title: 'UNRELATED_EVIDENCE_CANARY', assetIds: [] })
  projection.assets.push({ id: 'ffffffff-ffff-4fff-8fff-ffffffffffff', url: '/media/unrelated.png', mimeType: 'image/png', alt: 'UNRELATED_ASSET_CANARY', decorative: false, credit: 'Synthetic', checksum: '0'.repeat(64) })
  const page = readingPageData(projection, 'entry', true, projection.entries[0].id)
  expect(page.projection.evidence).toHaveLength(1)
  expect(page.projection.assets).toEqual([])
  expect(JSON.stringify(page)).not.toMatch(/UNRELATED_(?:EVIDENCE|ASSET)_CANARY/)
})

// This verifies the actual build bootstrap rather than only the selector helper.
test('built article bootstrap excludes the linked pattern body and collection excludes every body', async ({ request }) => {
  const articleHtml = await (await request.get('/investigations/fixture-claims-handoff/')).text()
  const collectionHtml = await (await request.get('/investigations/')).text()
  const bootstrap = (html: string) => JSON.parse(html.match(/<script id="reading-data" type="application\/json">([\s\S]*?)<\/script>/)![1])
  const article = bootstrap(articleHtml)
  expect(article.entry.slug).toBe('fixture-claims-handoff')
  expect(JSON.stringify(article)).not.toContain('A proposition to examine')
  expect(article.renderedMarkdown['20000000-0000-4000-8000-000000000001']).toBeUndefined()
  expect(article.projection.entries.every((entry: Record<string, unknown>) => !('blocks' in entry))).toBe(true)
  const collection = bootstrap(collectionHtml)
  expect(collection.entry).toBeUndefined()
  expect(collection.renderedMarkdown).toEqual({})
  expect(JSON.stringify(collection)).not.toContain('What did not add up?')
})
