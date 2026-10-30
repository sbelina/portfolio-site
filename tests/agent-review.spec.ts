import { expect, test } from '@playwright/test'

test('tag and trace navigation is immediate with reduced or unavailable motion preferences', async ({ browser, baseURL }) => {
  for (const unavailable of [false, true]) {
    const context = await browser.newContext({ baseURL, reducedMotion: 'reduce' })
    try {
      const page = await context.newPage()
      await page.goto('/#claims-operations')
      await expect(page.locator('.site-header')).toHaveAttribute('data-measured', 'true')
      await page.evaluate((unavailable) => {
        const state = window as Window & { scrollBehaviors: ScrollBehavior[] }
        state.scrollBehaviors = []
        const original = Element.prototype.scrollIntoView
        Element.prototype.scrollIntoView = function (options) {
          if (typeof options === 'object') state.scrollBehaviors.push(options.behavior ?? 'auto')
          original.call(this, options)
        }
        if (unavailable) window.matchMedia = () => { throw new Error('Unavailable motion API') }
      }, unavailable)
      const lastBehavior = () => page.evaluate(() => (window as Window & { scrollBehaviors: ScrollBehavior[] }).scrollBehaviors.at(-1))
      await page.locator('#claims-operations').getByRole('button', { name: '#systems', exact: true }).click()
      await expect(page.locator('.graph-explanation')).toContainText('#systems')
      expect(await lastBehavior()).toBe('instant')
      await page.locator('#the-bends .trace-note').click()
      await expect(page.locator('.graph-explanation')).toContainText('The Bends')
      expect(await lastBehavior()).toBe('instant')
    } finally { await context.close() }
  }
})

test('graph selection preserves edge direction from either endpoint', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#connections')
  await page.getByRole('button', { name: 'tag: #decision. Select to trace connections.', exact: true }).click()
  const trace = page.locator('.trace-links')
  await expect(trace).toContainText('#evidence informs #decision')
  await expect(trace).not.toContainText('#decision informs #evidence')
  await trace.getByRole('button', { name: 'Inspect #evidence. #evidence informs #decision.', exact: true }).click()
  await expect(trace).toContainText('#evidence informs #decision')
  await expect(trace).not.toContainText('#decision informs #evidence')
  await page.setViewportSize({ width: 320, height: 740 })
  await page.addStyleTag({ content: ':root {font-size:200%} * {letter-spacing:.12em!important;word-spacing:.16em!important}' })
  await page.getByText('Browse the same system as text', { exact: true }).click()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('static graph text preserves directed statements and labels topic associations', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto('/#connections')
    await page.getByText('Browse the same system as text', { exact: true }).click()
    const list = page.locator('.connections-list')
    await expect(list).toContainText('#evidence informs #decision')
    await expect(list).not.toContainText('#decision informs #evidence')
    await expect(list).toContainText('Topic association: Claims operations and #systems')
  } finally { await context.close() }
})
