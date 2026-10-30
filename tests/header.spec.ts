import { expect, test } from '@playwright/test'

test('home header stays available and condenses without removing menu links', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#index')
  const header = page.locator('.site-header')
  await expect(header).toHaveAttribute('data-compact', 'false')
  const expanded = (await header.boundingBox())!.height
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('index')!.offsetTop + 700, behavior: 'instant' }))
  await expect(header).toHaveAttribute('data-compact', 'true')
  expect((await header.boundingBox())!.height).toBeLessThan(expanded)
  expect(Math.abs((await header.boundingBox())!.y)).toBeLessThan(2)
  await expect(header.getByRole('link')).toHaveCount(6)
  for (const link of await header.getByRole('navigation').getByRole('link').all()) await expect(link).toBeVisible()
  await page.evaluate(() => window.scrollTo({ top: document.getElementById('index')!.offsetTop, behavior: 'instant' }))
  await expect(header).toHaveAttribute('data-compact', 'false')
})

test('keyboard menu activation leaves the destination clear of the sticky header', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/#index')
  const link = page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Investigations', exact: true })
  await link.focus()
  expect(await link.evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#work$/)
  await expect.poll(async () => (await page.locator('#work').boundingBox())!.y).toBeGreaterThanOrEqual(0)
  const bottom = (await page.locator('.site-header').boundingBox())!
  expect((await page.locator('#work-title').boundingBox())!.y).toBeGreaterThanOrEqual(bottom.y + bottom.height)
})

test('home menu supports narrow touch and enlarged reduced-motion reading', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 800 }, hasTouch: true, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    await page.goto('/#index')
    await expect(page.locator('.site-header')).toHaveAttribute('data-measured', 'true')
    await expect(page.locator('main')).toBeFocused()
    await page.evaluate(() => window.scrollTo({ top: 700, behavior: 'instant' }))
    await expect(page.locator('.site-header')).toHaveAttribute('data-compact', 'true')
    const menu = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
    for (const link of await menu.getByRole('link').all()) {
      expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
      expect(await link.evaluate(el => getComputedStyle(el).animationName)).toBe('none')
    }
    await menu.getByRole('link', { name: 'Investigations', exact: true }).tap()
    await expect(page).toHaveURL(/#work$/)
    await page.addStyleTag({ content: ':root {font-size:200%} * {letter-spacing:.12em!important;word-spacing:.16em!important}' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const header = page.locator('.site-header')
    await expect(header).toHaveAttribute('data-oversized', 'true')
    expect(await header.evaluate(el => getComputedStyle(el).position)).toBe('static')
  } finally { await context.close() }
})

test('no-JavaScript enlarged narrow menu cannot obscure reading destinations', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 320, height: 800 } })
  try {
    const page = await context.newPage()
    await page.goto('/')
    await page.evaluate(() => {
      const style = document.createElement('style')
      style.textContent = ':root {font-size:200%}'
      document.head.append(style)
    })
    expect(await page.locator('.site-header').evaluate(el => getComputedStyle(el).position)).toBe('static')
    await page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'Investigations', exact: true }).click()
    await expect(page).toHaveURL(/#work$/)
    await expect(page.locator('#work-title')).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally { await context.close() }
})

test('no-JavaScript homepage keeps a sticky native menu and readable anchor destinations', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } })
  try {
    const page = await context.newPage()
    await page.goto('/')
    const menu = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
    await expect(menu.getByRole('link')).toHaveCount(5)
    await menu.getByRole('link', { name: 'Contact', exact: true }).click()
    await expect(page).toHaveURL(/#contact$/)
    const header = (await page.locator('.site-header').boundingBox())!
    // Sticky containment ends with main; near the footer it can rise offscreen.
    expect(header.y).toBeGreaterThanOrEqual(0)
    expect((await page.locator('#contact').boundingBox())!.y).toBeGreaterThanOrEqual(header.height)
  } finally { await context.close() }
})

test('short viewports keep the full menu in normal flow', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 400 })
  await page.goto('/#index')
  expect(await page.locator('.site-header').evaluate(el => getComputedStyle(el).position)).toBe('static')
  await expect(page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link')).toHaveCount(5)
})
