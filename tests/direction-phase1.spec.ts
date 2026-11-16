import { test, expect } from '@playwright/test'

// Phase 1 of the 16 November direction (docs/codex/NOV-16-DIRECTION-AUDIT.md).
const production = 'http://127.0.0.1:4175'
const fixtures = 'http://127.0.0.1:4174'

test('homepage offers both directions and a labelled observatory without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  try {
    const page = await context.newPage()
    await page.goto(`${production}/`)
    const directions = page.getByRole('navigation', { name: 'Choose a direction' })
    await expect(directions.getByRole('link', { name: /Examine the investigations/ })).toHaveAttribute('href', '/investigations/')
    await expect(directions.getByRole('link', { name: /Related\. Not equivalent\./ })).toHaveAttribute('href', '/patterns/')
    const observatory = page.getByRole('region', { name: 'A separate place for curiosity to operate' })
    await expect(observatory).toContainText('invented for the experiment')
    await expect(observatory).toContainText('not my investigations')
    for (const href of ['/lab/atlas/', '/lab/atlas/text/', '/lab/atlas/je-ne-sais-qua/']) {
      await expect(observatory.locator(`a[href="${href}"]`)).toHaveCount(1)
      expect((await page.request.get(`${production}${href}`)).status(), href).toBe(200)
    }
    // The legacy route inventory stays behind a closed disclosure, after contact.
    await expect(page.locator('.build-index-legacy')).not.toHaveAttribute('open', '')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally { await context.close() }
})

test('empty investigations collection explains itself and leads somewhere real', async ({ page }) => {
  await page.goto(`${production}/investigations/`)
  await expect(page.getByText('No reviewed investigation has been selected for this edition yet.')).toBeVisible()
  const parts = page.getByRole('region', { name: 'What each investigation will show' }).getByRole('listitem')
  await expect(parts).toHaveText([/^Orientation\./, /^Initial interpretation\./, /^Investigation\./, /^Contribution\./, /^What followed\./])
  await expect(page.locator('.reading-cards')).toHaveCount(0)
  const meanwhile = page.getByRole('region', { name: 'Meanwhile' }).getByRole('link')
  await expect(meanwhile).toHaveCount(4)
  for (const href of await meanwhile.evaluateAll(links => links.map(link => link.getAttribute('href')!))) {
    expect((await page.request.get(`${production}${href.split('#')[0]}`)).status(), href).toBe(200)
  }
})

test('owner-review shells exist only in the local fixtures build', async ({ request }) => {
  for (const route of ['/about/', '/learning/']) {
    expect((await request.get(`${production}${route}`)).status(), route).toBe(404)
    const local = await request.get(`${fixtures}${route}`)
    expect(local.status(), route).toBe(200)
    const html = await local.text()
    expect(html).toContain('Local review shell. Not published, not approved.')
    expect(html).toContain('noindex')
  }
  const sitemap = await (await request.get(`${production}/sitemap.xml`)).text()
  expect(sitemap).not.toMatch(/\/(about|learning)\//)
})

test('learning shell keeps practice, method and aspiration apart', async ({ page }) => {
  await page.goto(`${fixtures}/learning/`)
  await expect(page.getByRole('heading', { level: 2 })).toHaveText(['What has been done', 'Methods that carry across settings', 'Questions not yet tested'])
  await expect(page.getByText('Untested concept.')).toBeVisible()
  await expect(page.locator('main')).not.toContainText(/participants (said|reported)|learning gain|improved/i)
})
