import { expect, test } from '@playwright/test'
import { readFile, access } from 'node:fs/promises'
import { projects, graphNodes } from '../src/data'

const thesis = 'The visible problem is rarely the one producing the outcome.'
const legacyCases = ['claims-operations', 'brand-research', 'enterprise-ai', 'documentation-recovery', 'civic-service', 'accessibility-ai']

test('review candidate keeps legacy identities while removing misleading public claims', async () => {
  expect(projects.map(project => project.id)).toEqual(legacyCases)
  for (const id of legacyCases) expect(graphNodes.find(node => node.id === id)?.href).toBe(`#${id}`)
  const html = await readFile('dist/index.html', 'utf8')
  expect(html).toContain(thesis)
  expect(html).toContain('I swim upstream toward the problem.')
  expect(html).not.toContain('18% → 7.6%')
  expect(html).not.toContain('PASS → FAIL')
  expect(html).not.toContain('agent was adopted')
  expect(html).not.toContain('research recovery method for claims')
  await expect(access('dist/investigations/telematics/index.html')).rejects.toThrow()
  await expect(access('dist/patterns/related-not-equivalent/index.html')).rejects.toThrow()
  const projection = JSON.parse(await readFile('dist/public-content.json', 'utf8'))
  expect(projection.entries).toEqual([])
  expect(projection.relationships).toEqual([])
  const ledger = JSON.parse(await readFile('docs/codex/generated/migration-ledger.json', 'utf8'))
  expect(ledger.content).toHaveLength(17)
  expect(ledger.content.find((entry: { legacyId: string }) => entry.legacyId === 'documentation-recovery')).toMatchObject({
    contentId: '33e3550d-6b04-4a91-878c-0225b464914d',
    proposedRoute: null,
    oldLocation: '/#documentation-recovery',
  })
  const review = JSON.parse(await readFile('docs/codex/page-review.json', 'utf8'))
  expect(review.pages.filter((entry: { kind: string }) => entry.kind === 'investigation')
    .map((entry: { id: string }) => entry.id).sort()).toEqual([
    'accessibility-ai', 'brand-research', 'civic-service', 'claims-operations', 'enterprise-ai', 'telematics',
  ])
  for (const entry of review.pages) expect(entry.approval).toBeNull()
})

test('first reading gives thesis, work and connections without opening intro or graph', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  try {
    const page = await context.newPage()
    const response = await page.goto('/')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { name: thesis })).toBeVisible()
    await expect(page.getByText('I swim upstream toward the problem.')).toBeVisible()
    const investigations = page.getByRole('link', { name: 'Explore investigations' })
    const connections = page.getByRole('link', { name: 'Explore connections' })
    await expect(investigations).toHaveAttribute('href', '#work')
    await expect(connections).toHaveAttribute('href', '#connections')
    await investigations.click()
    await expect(page.locator('#claims-operations')).toBeVisible()
    await page.getByRole('link', { name: 'How I investigate' }).click()
    await expect(page.getByRole('heading', { name: 'Investigate. Translate. Implement.' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Investigate', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Translate', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Implement', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
  } finally { await context.close() }
})

test('primary routes remain in the first screen at desktop and narrow width', async ({ browser, baseURL }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 320, height: 740 }]) {
    const context = await browser.newContext({ baseURL, viewport, javaScriptEnabled: false, reducedMotion: 'reduce' })
    try {
      const page = await context.newPage()
      await page.goto('/')
      for (const name of ['Explore investigations', 'Explore connections']) {
        const link = page.getByRole('link', { name })
        const bounds = await link.boundingBox()
        expect(bounds).not.toBeNull()
        expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
    } finally { await context.close() }
  }
})

test('all old case fragments retain useful home destinations and new unpublished routes return 404', async ({ page, request }) => {
  for (const id of legacyCases) {
    await page.goto(`/#${id}`)
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
  for (const path of ['/investigations/telematics/', '/patterns/related-not-equivalent/']) {
    expect((await request.get(path)).status()).toBe(404)
  }
})
