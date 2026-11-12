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

/** Hold a key until a condition holds (condition-driven, never a fixed duration). */
async function holdUntil(page: Page, key: string, condition: () => Promise<unknown>) {
  await page.keyboard.down(key)
  try { await condition() } finally { await page.keyboard.up(key) }
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
    // Sealed in a pocket: walls do nothing; pushing east into the arm turns the door clockwise.
    await hold(page, 'ArrowLeft', 300)
    await holdUntil(page, 'ArrowRight', () => expect(status(page)).toContainText('The junction turned clockwise. One thing moved with it.'))
    const section = page.locator('.ps')
    await holdUntil(page, 'ArrowUp', () => expect(section).toHaveAttribute('data-player-tile', /^\d+,4$/))
    await holdUntil(page, 'ArrowRight', () => expect(samples(page)).toContainText('1/2'))
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

  test('PU1 PU2: pushing an arm turns the junction the way you push, either way, with no other control', async ({ page }) => {
    await start(page)
    await expect(page.getByRole('button', { name: /shift/i })).toHaveCount(0)
    const section = page.locator('.ps')
    // From the north-west pocket, pushing south turns counter-clockwise into the south-west pocket.
    await holdUntil(page, 'ArrowDown', () => expect(status(page)).toContainText('turned counter-clockwise'))
    // Carried into the south-west pocket; a still-held push may walk straight out of its open south side.
    await expect(section).toHaveAttribute('data-player-tile', /^3,(6|7)$/)
    // Pushing north into the arm turns it back clockwise.
    await holdUntil(page, 'ArrowUp', () => expect(status(page)).toContainText('turned clockwise'))
    await expect(section).toHaveAttribute('data-player-tile', /^3,(5|4)$/)
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
      await holdUntil(other, 'ArrowRight', () => expect(status(other)).toContainText('The junction turned'))
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
      const pad = page.locator('.ps-pad')
      const section = page.locator('.ps')
      // Hold a pad direction until a condition holds, then lift.
      const pressUntil = async (name: string, condition: () => Promise<unknown>) => {
        const box = await page.getByRole('button', { name }).boundingBox()
        const at = { clientX: box!.x + box!.width / 2, clientY: box!.y + box!.height / 2, pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true }
        await pad.dispatchEvent('pointerdown', { ...at, buttons: 1 })
        try { await condition() } finally { await pad.dispatchEvent('pointerup', { ...at, buttons: 0 }) }
      }
      await pressUntil('Move right', () => expect(status(page)).toContainText('The junction turned clockwise'))
      await pressUntil('Move up', () => expect(section).toHaveAttribute('data-player-tile', /^\d+,4$/))
      await pressUntil('Move right', () => expect(samples(page)).toContainText('1/2'))
    } finally { await context.close() }
  })
})
