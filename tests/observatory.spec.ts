import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Observatory hub (16 November IA decision; docs/codex/NOV-16-DIRECTION-AUDIT.md).
const production = 'http://127.0.0.1:4175'
const members = ['/lab/atlas/', '/lab/atlas/text/', '/lab/atlas/je-ne-sais-qua/', '/lab/edge-case/', '/experiments/reveal-hidden-work/']

test('hub lists every experiment with native links, labels and no JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    const response = await page.goto(`${production}/lab/`)
    expect(response?.status()).toBe(200)
    expect(response?.headers()['x-robots-tag']).toContain('noindex')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Observatory*')
    await expect(page.getByText('Everything here is invented or illustrative.')).toBeVisible()
    const index = page.locator('.pc-observatory-index')
    for (const href of members) {
      await expect(index.locator(`a[href="${href}"]`)).toHaveCount(1)
      expect((await page.request.get(`${production}${href}`)).status(), href).toBe(200)
    }
    await expect(index.getByRole('link', { name: 'Edge Case — experimental', exact: true })).toHaveAttribute('href', '/lab/edge-case/')
    expect(await (await page.request.get(`${production}/sitemap.xml`)).text()).not.toMatch(/\/lab\//)
  } finally { await context.close() }
})

test('every observatory page marks its section in the primary menu', async ({ page }) => {
  for (const route of members) {
    await page.goto(`${production}${route}`)
    const link = page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Observatory — experimental', exact: true })
    await expect(link, route).toHaveAttribute('aria-current', 'true')
  }
})

test('game page offers global navigation and a way back to the hub', async ({ page }) => {
  await page.goto(`${production}/lab/edge-case/`)
  await expect(page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link')).toHaveCount(5)
  await page.getByRole('link', { name: '← Observatory' }).click()
  await expect(page).toHaveURL(`${production}/lab/`)
})

test('hub has no automatically detectable accessibility violations', async ({ page }) => {
  await page.goto(`${production}/lab/`)
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})

test('the production build serves a playable game: Enter opens the full-window shell', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto(`${production}/lab/edge-case/`)
  await page.getByRole('button', { name: /^(Enter|Continue)/ }).click()
  await expect(page.locator('.ec-shell')).toHaveAttribute('role', 'dialog')
  await expect(page.locator('.ec-menu').getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})
