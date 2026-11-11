import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { existsSync } from 'node:fs'

const route = '/play/edge-case/'
const samples = (page: Page) => page.locator('.ps-samples')
const status = (page: Page) => page.getByRole('status')

async function hold(page: Page, key: string, ms: number) {
  await page.keyboard.down(key)
  await page.waitForTimeout(ms)
  await page.keyboard.up(key)
}

async function start(page: Page, level?: string) {
  await page.goto(route)
  if (level) {
    await page.getByRole('button', { name: 'Choose level' }).click()
    await page.getByRole('button', { name: new RegExp(level) }).click()
  } else await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.locator('.ps')).toHaveAttribute('data-screen', 'playing')
}

test.describe('Edge Case prototype page', () => {
  test('is absent from production output and the production Worker', async ({ request }) => {
    expect(existsSync('dist/play/edge-case/index.html')).toBe(false)
    expect(existsSync('dist/edge-case.html')).toBe(false)
    const response = await request.get(`http://127.0.0.1:4175${route}`)
    expect(response.status()).toBe(404)
  })

  test('without JavaScript the page explains the game, controls and status, and is not indexable', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
    try {
      const page = await context.newPage()
      await page.goto(route)
      await expect(page.getByRole('heading', { level: 1, name: 'Edge Case' })).toBeVisible()
      await expect(page.getByText('The playable game needs JavaScript.')).toBeVisible()
      await expect(page.getByRole('heading', { name: 'How to play' })).toBeVisible()
      await expect(page.getByText('Unpublished prototype')).toBeVisible()
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
    } finally { await context.close() }
  })

  test('keyboard: play, move to collect a sample, pause, resume and restart', async ({ page }) => {
    await start(page)
    await expect(status(page)).toContainText('Level 000, False Start')
    await expect(samples(page)).toContainText('0/2')
    // Sealed in a pocket: movement goes nowhere until a shift.
    await hold(page, 'ArrowLeft', 300)
    await page.keyboard.press('Shift')
    await expect(status(page)).toContainText('Shifted. One thing moved')
    await hold(page, 'ArrowUp', 260)
    await hold(page, 'ArrowRight', 600)
    await expect(samples(page)).toContainText('1/2')
    await expect(status(page)).toContainText('Sample collected')
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Paused' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Resume' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(page.locator('.ps')).toHaveAttribute('data-screen', 'playing')
    await page.keyboard.press('KeyR')
    await expect(status(page)).toContainText('Attempt 2')
    await expect(samples(page)).toContainText('0/2')
  })

  test('keyboard: Space and Enter shift a junction within reach; the Shift button reports readiness', async ({ page }) => {
    await start(page, '001')
    await expect(page.locator('.ps-action')).toHaveAttribute('data-ready', 'false')
    await hold(page, 'ArrowUp', 900)
    await expect(page.locator('.ps-action')).toHaveAttribute('data-ready', 'true')
    await page.keyboard.press('Space')
    await expect(status(page)).toContainText('Shifted')
  })

  test('the system index shows known and unknown operations, a binary counter, and an uncounted UNKNOWN entry', async ({ page }) => {
    await page.goto(route)
    await page.getByRole('button', { name: 'System index' }).click()
    const index = page.getByRole('dialog', { name: 'System index' })
    await expect(index.getByText('03 / 07')).toBeVisible()
    await expect(index.getByText('3 of 7 known')).toBeAttached()
    await expect(index.getByText('Undiscovered operation')).toHaveCount(4)
    await expect(index.getByText('0000 / 1010')).toBeVisible()
    await expect(index.getByText('Not counted. This list may not describe everything.')).toBeVisible()
    await index.getByLabel('Show unavailable operations').uncheck()
    await expect(index.getByText('Undiscovered operation')).toHaveCount(0)
    await index.getByRole('button', { name: 'Done' }).click()
    // The second visit is a discovery: 0b10.
    await page.getByRole('button', { name: 'System index' }).click()
    await expect(page.getByText('0001 / 1010')).toBeVisible()
    await expect(page.getByRole('dialog', { name: 'System index' }).getByText('There Are 10 Types of Players')).toBeVisible()
    await expect(status(page)).toContainText('Discovery 0x07')
    await page.reload()
    await page.getByRole('button', { name: 'System index' }).click()
    await expect(page.getByText('0001 / 1010')).toBeVisible()
  })

  test('Space on a focused control activates that control, not the game', async ({ page }) => {
    await start(page)
    await page.getByRole('button', { name: 'Pause' }).focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('dialog', { name: 'Paused' })).toBeVisible()
  })

  test('settings persist, and blocked storage never prevents play', async ({ page, browser, baseURL }) => {
    await page.goto(route)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByLabel('Show where tracers go next').uncheck()
    await page.getByLabel('Reduced').check()
    await page.getByRole('button', { name: 'Done' }).click()
    await page.reload()
    await page.getByRole('button', { name: 'Settings' }).click()
    await expect(page.getByLabel('Show where tracers go next')).not.toBeChecked()
    await expect(page.locator('.ps')).toHaveAttribute('data-reduced-motion', 'true')

    const blocked = await browser.newContext({ baseURL })
    try {
      await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } }) })
      const other = await blocked.newPage()
      await start(other)
      await other.keyboard.press('Shift')
      await expect(status(other)).toContainText('Shifted')
      await other.getByRole('button', { name: 'Pause' }).click()
      await other.getByRole('button', { name: 'System index' }).click()
      await expect(other.getByText('03 / 07')).toBeVisible()
    } finally { await blocked.close() }
  })

  test('reduced-motion preference is honoured by default', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, reducedMotion: 'reduce' })
    try {
      const page = await context.newPage()
      await page.goto(route)
      await expect(page.locator('.ps')).toHaveAttribute('data-reduced-motion', 'true')
    } finally { await context.close() }
  })

  test('controls meet touch target size and the title and settings pass automated accessibility checks', async ({ page }) => {
    await page.goto(route)
    for (const box of await page.locator('.ps button').evaluateAll(els => els.map(el => el.getBoundingClientRect()).filter(r => r.width > 0))) {
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.getByRole('button', { name: 'Settings' }).click()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await page.getByRole('button', { name: 'Done' }).click()
    await page.getByRole('button', { name: 'System index' }).click()
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  })

  test('the whole arena and the controls fit one screen at 320px and do not scroll sideways', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 568 }, hasTouch: true })
    try {
      const page = await context.newPage()
      await start(page)
      await page.waitForTimeout(600)
      const fit = await page.evaluate(() => {
        const canvas = document.querySelector('.ps-canvas')!.getBoundingClientRect()
        const controls = document.querySelector('.ps-controls')!.getBoundingClientRect()
        return { overflow: document.documentElement.scrollWidth > innerWidth, canvasTop: canvas.top, controlsBottom: controls.bottom, viewport: innerHeight, canvasBottom: canvas.bottom, controlsTop: controls.top }
      })
      expect(fit.overflow).toBe(false)
      expect(fit.canvasTop).toBeGreaterThanOrEqual(0)
      expect(fit.canvasBottom).toBeLessThanOrEqual(fit.controlsTop)
      expect(fit.controlsBottom).toBeLessThanOrEqual(fit.viewport + 1)
    } finally { await context.close() }
  })
})

test.describe('Edge Case on touch screens', () => {
  test('holding the movement pad moves the player; lifting stops it', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: browser.browserType().name() !== 'firefox' })
    try {
      const page = await context.newPage()
      await page.goto(route)
      await page.getByRole('button', { name: 'Play' }).tap()
      await expect(page.locator('.ps')).toHaveAttribute('data-screen', 'playing')
      await page.getByRole('button', { name: 'Shift' }).tap()
      await expect(status(page)).toContainText('Shifted')
      const pad = page.locator('.ps-pad')
      const press = async (name: string, ms: number) => {
        const box = await page.getByRole('button', { name }).boundingBox()
        const at = { clientX: box!.x + box!.width / 2, clientY: box!.y + box!.height / 2, pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true }
        await pad.dispatchEvent('pointerdown', { ...at, buttons: 1 })
        await page.waitForTimeout(ms)
        await pad.dispatchEvent('pointerup', { ...at, buttons: 0 })
      }
      await press('Move up', 260)
      await press('Move right', 600)
      await expect(samples(page)).toContainText('1/2')
    } finally { await context.close() }
  })
})
