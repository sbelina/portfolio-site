import { expect, test } from '@playwright/test'

const links = [
  ['Investigations', '/#work'],
  ['Connections', '/#connections'],
  ['Method', '/#practice'],
  ['Field notes', '/#field-notes'],
  ['Contact', '/#contact'],
] as const

for (const path of [
  '/investigations/',
  '/investigations/fixture-claims-handoff/',
  '/patterns/fixture-delivered-not-complete/',
  '/perspective/fixture-verse-spacing/',
  '/experiments/reveal-hidden-work/',
  '/investigations/navigation-missing/',
]) {
  test(`shared public menu works without JavaScript on ${path}`, async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
    try {
      const page = await context.newPage()
      const response = await page.goto(path)
      expect(response?.status()).toBe(path.includes('navigation-missing') ? 404 : 200)
      const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
      await expect(nav).toHaveCount(1)
      for (const [label, href] of links) {
        const link = nav.getByRole('link', { name: label, exact: true })
        await expect(link).toBeVisible()
        await expect(link).toHaveAttribute('href', href)
      }
      await expect(nav.locator('[aria-current]')).toHaveCount(0)
    } finally { await context.close() }
  })
}

test('subpage menu supports keyboard navigation and visible focus', async ({ page }) => {
  await page.goto('/investigations/fixture-claims-handoff/')
  const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
  await nav.getByRole('link', { name: 'Investigations', exact: true }).focus()
  await page.keyboard.press('Tab')
  const connections = nav.getByRole('link', { name: 'Connections', exact: true })
  await expect(connections).toBeFocused()
  expect(await connections.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Shift+Tab')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/#work$/)
})

test('subpage menu reflows at narrow zoom and touch links work without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 320, height: 740 }, hasTouch: true, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    for (const path of ['/investigations/', '/experiments/reveal-hidden-work/']) {
      await page.goto(path)
      await page.evaluate(() => {
        const style = document.createElement('style')
        style.textContent = ':root { font-size: 200%; }'
        document.head.append(style)
      })
      const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
      for (const link of await nav.getByRole('link').all()) {
        await expect(link).toBeVisible()
        expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    }
    await page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Investigations', exact: true }).tap()
    await expect(page).toHaveURL(/\/#work$/)
  } finally { await context.close() }
})
