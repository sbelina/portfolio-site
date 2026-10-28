import { test, expect } from '@playwright/test'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { adaptLegacyContent } from '../scripts/legacy-adapter'
import { auditPublic } from '../scripts/audit-public'
import { verifyPublicAssets } from '../scripts/public-assets'
import { renderBlocks } from '../src/reading/render-blocks'
import { fixtureProjection } from './fixtures/reading-content'

test('legacy adapter preserves all records as unreviewed drafts with stable identities', () => {
  const entries = adaptLegacyContent()
  expect(entries).toHaveLength(17)
  expect(new Set(entries.map(entry => entry.id)).size).toBe(17)
  expect(entries.find(entry => entry.slug === 'mundane-evidence')?.format).toBeUndefined() // Notebook is not silently relabelled an essay.
  expect(entries.every(entry => entry.editorialState === 'draft' && entry.visibility === 'restricted' && entry.createdAt === null)).toBe(true)
  expect(adaptLegacyContent().map(entry => entry.id)).toEqual(entries.map(entry => entry.id))
})

test('public renderer removes executable Markdown and unsafe links', () => {
  const projection = structuredClone(fixtureProjection())
  projection.entries[0].blocks = [{ id: '10000000-0000-4000-8000-000000000009', type: 'prose', markdown: 'Useful **reading**. <script>alert(1)</script> <img src=x onerror=alert(2)> [bad](javascript:alert(3)) <a href="https://example.com" onclick="alert(4)">source</a>' }]
  const html = Object.values(renderBlocks(projection)).join('')
  expect(html).toContain('<strong>reading</strong>')
  expect(html).not.toMatch(/<script|onerror|onclick|javascript:/)
})

test('public asset bytes must match the selected derivative checksum', () => {
  const bytes = Buffer.from('synthetic test bytes, not a real image')
  const projection = structuredClone(fixtureProjection())
  projection.assets = [{ id: 'aaaaaaaa-1111-4111-8111-111111111111', url: '/media/example.png', mimeType: 'image/png', checksum: createHash('sha256').update(bytes).digest('hex'), alt: 'Synthetic fixture', decorative: false, credit: 'Synthetic test asset' }]
  expect(verifyPublicAssets(projection, () => bytes)).toHaveLength(1)
  expect(() => verifyPublicAssets(projection, () => Buffer.from('changed'))).toThrow(/checksum/)
})

test('artifact audit rejects leaked fixtures instead of trusting a visibility flag', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'pc-artifact-'))
  try {
    await writeFile(path.join(directory, 'route-manifest.json'), JSON.stringify({ fixture: false }))
    await writeFile(path.join(directory, 'payload.js'), 'PRIVATE_DRAFT_CANARY_8b72')
    await expect(auditPublic(directory)).rejects.toThrow(/fixture or unselected draft/)
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test('a previous slug redirects but no unreviewed real legacy fragment is redirected', async ({ request, page }) => {
  const response = await request.get('/investigations/fixture-old-handoff/', { maxRedirects: 0 })
  expect(response.status()).toBe(301)
  expect(response.headers().location).toMatch(/\/investigations\/fixture-claims-handoff\/$/)
  await page.goto('/#fixture-claims-link')
  await expect(page).toHaveURL(/\/investigations\/fixture-claims-handoff\/$/)
  await page.goto('/#claims-operations')
  await expect(page).toHaveURL(/\/#claims-operations$/)
  await expect(page.locator('#claims-operations')).toBeInViewport()
})

test('unknown prototype-like fragments do not become redirect targets', async ({ page }) => {
  for (const fragment of ['toString', 'constructor', '__proto__']) {
    await page.goto(`/#${fragment}`)
    await expect(page).toHaveURL(new RegExp(`/#${fragment}$`))
    await expect(page.getByRole('heading', { name: 'The visible problem is rarely the one producing the outcome.' })).toBeVisible()
  }
})

test('reading routes never eagerly fetch the home graph bundle', async ({ page, request }) => {
  await page.goto('/investigations/fixture-claims-handoff/')
  const scripts = await page.locator('script[src]').evaluateAll(elements => elements.map(element => element.getAttribute('src')!))
  expect(scripts.some(url => /reading-/.test(url))).toBe(true)
  expect(scripts.some(url => /home-/.test(url))).toBe(false)
  for (const script of scripts) {
    const body = await (await request.get(script)).text()
    expect(body).not.toContain('Follow the relationship, not the category.')
  }
})
