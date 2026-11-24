import { test, expect } from '@playwright/test'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { auditPublic } from '../scripts/audit-public'

// Phase 1 of the 16 November direction (docs/codex/NOV-16-DIRECTION-AUDIT.md).
const production = 'http://127.0.0.1:4175'
const fixtures = 'http://127.0.0.1:4174'

// The Phase 1 homepage and empty-state checks were superseded by the released evidence-first
// homepage (tests/evidence-first.spec.ts) when main was merged on 19 November.

// The About shell was superseded by the published About page on 24 November (career thread, portrait, counting).
test('owner-review shells exist only in the local fixtures build', async ({ request }) => {
  for (const route of ['/learning/']) {
    expect((await request.get(`${production}${route}`)).status(), route).toBe(404)
    const local = await request.get(`${fixtures}${route}`)
    expect(local.status(), route).toBe(200)
    const html = await local.text()
    expect(html).toContain('Local review shell. Not published, not approved.')
    expect(html).toMatch(/<meta name="robots" content="[^"]*noindex/)
  }
  const sitemap = await (await request.get(`${production}/sitemap.xml`)).text()
  expect(sitemap).not.toMatch(/\/learning\//)
  expect(sitemap).toMatch(/\/about\//)
  expect((await (await request.get(`${fixtures}/route-manifest.json`)).json()).fixture).toBe(true)
})

test('learning shell keeps practice, method and aspiration apart', async ({ page }) => {
  await page.goto(`${fixtures}/learning/`)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(['What has been done', 'Methods that carry across settings', 'Questions not yet tested'])
  await expect(page.getByText('Untested concept.')).toBeVisible()
  await expect(page.locator('main')).not.toContainText(/participants (said|reported)|learning gain|improved/i)
})

test('public audit rejects the owner-review marker if a shell ever reaches output', async () => {
  const folder = await mkdtemp(path.join(tmpdir(), 'audit-'))
  try {
    await writeFile(path.join(folder, 'route-manifest.json'), JSON.stringify({ fixture: false, routes: [] }))
    await writeFile(path.join(folder, 'index.html'), '<p>clean</p>')
    await auditPublic(folder)
    await writeFile(path.join(folder, 'index.html'), '<article data-marker="OWNER_REVIEW_PROPOSAL_16NOV"></article>')
    await expect(auditPublic(folder)).rejects.toThrow('Non-production fixture or unselected draft found in public output')
  } finally { await rm(folder, { recursive: true, force: true }) }
})

test('changed pages reflow at 320px with enlarged text', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    for (const url of [`${production}/`, `${production}/investigations/`, `${fixtures}/learning/`, `${production}/about/`, `${production}/contact/`]) {
      await page.goto(url)
      await page.addStyleTag({ content: ':root{font-size:200%}' })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), url).toBe(true)
    }
  } finally { await context.close() }
})

