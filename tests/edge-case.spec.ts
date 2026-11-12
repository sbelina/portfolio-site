import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { existsSync } from 'node:fs'
import { enter, escapeTo, holdUntil, menu, menuCard, presetSettings, route, samples, shell, start, status } from './support/edge-case-ui'

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

  test('M1 M2: Enter fills the window over an inert page; Exit and Back return with focus on Continue', async ({ page }) => {
    await page.goto(route)
    await expect(shell(page)).toHaveCount(0)
    await enter(page)
    await expect(shell(page)).toHaveAttribute('role', 'dialog')
    await expect(page.locator('#root')).toHaveAttribute('inert', '')
    // It fills the window (which may itself have become the whole screen in true full screen).
    const box = (await shell(page).boundingBox())!
    const [width, height] = await page.evaluate(() => [innerWidth, innerHeight])
    expect(box.width).toBeCloseTo(width, 0)
    expect(box.height).toBeCloseTo(height, 0)
    // Start a level, then leave from the pause menu: the level stays paused.
    await menuCard(page).getByRole('button', { name: 'Play', exact: true }).click()
    await page.keyboard.press('Escape')
    await expect(menuCard(page).getByRole('heading', { name: 'Paused' })).toBeVisible()
    await menu(page, 'Exit to page')
    await expect(shell(page)).toHaveCount(0)
    const again = page.getByRole('button', { name: /^Continue/ })
    await expect(again).toBeFocused()
    await expect(again).toContainText('000 False Start, paused')
    await expect(page.locator('#root')).not.toHaveAttribute('inert', '')
    // Browser Back also leaves the game rather than the page.
    await enter(page)
    await page.goBack()
    await expect(shell(page)).toHaveCount(0)
    expect(page.url()).toContain(route)
  })

  test('M3: the nested menu moves with arrows, opens with Right or Enter, goes back with Escape, and shows where you are', async ({ page }) => {
    await page.goto(route)
    await enter(page)
    await expect(menuCard(page).getByRole('button', { name: 'Play', exact: true })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(menuCard(page).getByRole('button', { name: /^Levels/ })).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('ArrowUp')
    await expect(menuCard(page).getByRole('button', { name: /^Exit to page/ })).toBeFocused()
    // Settings › Controls via keyboard.
    for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowDown')
    await expect(menuCard(page).getByRole('button', { name: /^Settings/ })).toBeFocused()
    await page.keyboard.press('ArrowRight')
    await expect(menuCard(page).getByRole('navigation', { name: 'Menu location' })).toHaveText(/Edge Case\s*›?\s*Settings/)
    await page.keyboard.press('Enter')
    await expect(menuCard(page).getByRole('heading', { name: 'Controls' })).toBeVisible()
    await expect(menuCard(page).getByRole('navigation', { name: 'Menu location' })).toContainText('Controls')
    await page.keyboard.press('Escape')
    await expect(menuCard(page).getByRole('heading', { name: 'Settings' })).toBeVisible()
    await page.keyboard.press('Backspace')
    await expect(menuCard(page).getByRole('heading', { name: 'EDGE CASE' })).toBeVisible()
    // Escape at the top of the title menu leaves the game.
    await page.keyboard.press('Escape')
    await expect(shell(page)).toHaveCount(0)
  })

  test('M6: dark (observatory) by default; light in Settings › Display persists; both pass automated checks', async ({ page }) => {
    await page.goto(route)
    await enter(page)
    const background = () => shell(page).evaluate(el => getComputedStyle(el).backgroundColor)
    await expect(shell(page)).toHaveAttribute('data-surface', 'observatory')
    expect(await background()).toBe('rgb(17, 23, 22)')
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#111716')
    expect((await new AxeBuilder({ page }).include('.ec-shell').analyze()).violations).toEqual([])
    await menu(page, 'Settings', 'Display')
    await menuCard(page).getByLabel('Light (paper)').check()
    await expect(shell(page)).not.toHaveAttribute('data-surface', 'observatory')
    expect(await background()).toBe('rgb(243, 239, 231)')
    expect((await new AxeBuilder({ page }).include('.ec-shell').analyze()).violations).toEqual([])
    await page.reload()
    await enter(page)
    expect(await background()).toBe('rgb(243, 239, 231)')
    // Leaving restores the page's own toolbar colour.
    await page.keyboard.press('Escape')
    await expect(shell(page)).toHaveCount(0)
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#f3efe7')
  })

  test('M4: settings are grouped into Controls, Sound, Display and Gameplay, each with its own screen', async ({ page }) => {
    await page.goto(route)
    await enter(page)
    await menu(page, 'Settings')
    for (const [group, label] of [['Controls', 'Joystick that follows your finger'], ['Sound', 'Sound'], ['Display', 'Always show the system’s paths (otherwise pinch or hold Space to reveal)'], ['Gameplay', 'Offer hints when I seem stuck']]) {
      await menu(page, group)
      await expect(menuCard(page).getByLabel(label, { exact: true })).toBeVisible()
      await menuCard(page).getByRole('button', { name: 'Back', exact: true }).click()
    }
  })

  test('keyboard: play, move to collect a sample, pause, resume and restart', async ({ page }) => {
    await start(page)
    await expect(status(page)).toContainText('Level 000, False Start')
    await expect(samples(page)).toContainText('0/2')
    // Sealed in a pocket: walls do nothing; pushing east into the arm turns the door clockwise.
    await holdUntil(page, 'ArrowRight', () => expect(status(page)).toContainText('The junction turned clockwise. One thing moved with it.'))
    await holdUntil(page, 'ArrowUp', () => expect(shell(page)).toHaveAttribute('data-player-tile', /^\d+,4$/))
    await holdUntil(page, 'ArrowRight', () => expect(samples(page)).toContainText('1/2'))
    await page.keyboard.press('Escape')
    await expect(menuCard(page).getByRole('button', { name: 'Resume' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(shell(page)).toHaveAttribute('data-screen', 'playing')
    await page.keyboard.press('KeyR')
    await expect(status(page)).toContainText('Attempt 2')
    await expect(samples(page)).toContainText('0/2')
  })

  test('PU1 PU2: pushing an arm turns the junction the way you push, either way, with no other control', async ({ page }) => {
    await start(page)
    await expect(page.getByRole('button', { name: /shift/i })).toHaveCount(0)
    await holdUntil(page, 'ArrowDown', () => expect(status(page)).toContainText('turned counter-clockwise'))
    // Carried into the south-west pocket; a still-held push may walk straight out of its open south side.
    await expect(shell(page)).toHaveAttribute('data-player-tile', /^3,(6|7)$/)
    await holdUntil(page, 'ArrowUp', () => expect(status(page)).toContainText('turned clockwise'))
  })

  test('the system index shows known and unknown operations, a binary counter, and an uncounted UNKNOWN entry', async ({ page }) => {
    await page.goto(route)
    await enter(page)
    await menu(page, 'System index')
    const index = menuCard(page)
    await expect(index.getByText('05 / 09')).toBeVisible()
    await expect(index.getByText('5 of 9 known')).toBeAttached()
    await expect(index.getByText('Undiscovered operation')).toHaveCount(4)
    await expect(index.getByText('0000 / 1010')).toBeVisible()
    await expect(index.getByText('Not counted. This list may not describe everything.')).toBeVisible()
    await index.getByLabel('Show unavailable operations').uncheck()
    await expect(index.getByText('Undiscovered operation')).toHaveCount(0)
    await index.getByRole('button', { name: 'Back', exact: true }).click()
    // The second visit is a discovery: 0b10.
    await menu(page, 'System index')
    await expect(menuCard(page).getByText('0001 / 1010')).toBeVisible()
    await expect(menuCard(page).getByText('There Are 10 Types of Players')).toBeVisible()
    await expect(status(page)).toContainText('Discovery 0x07')
    await page.reload()
    await expect(page.getByText('Discoveries 0001 / 1010')).toBeVisible()
  })

  test('Space on a focused control activates that control, not the game', async ({ page }) => {
    await start(page)
    await page.getByRole('button', { name: 'Menu', exact: true }).focus()
    await page.keyboard.press('Space')
    await expect(menuCard(page).getByRole('heading', { name: 'Paused' })).toBeVisible()
  })

  test('settings persist, and blocked storage never prevents play', async ({ page, browser, baseURL }) => {
    await page.goto(route)
    await enter(page)
    await menu(page, 'Settings', 'Display')
    await expect(menuCard(page).getByLabel('Always show the system’s paths (otherwise pinch or hold Space to reveal)')).not.toBeChecked()
    await menuCard(page).getByLabel('Always show the system’s paths (otherwise pinch or hold Space to reveal)').check()
    await menuCard(page).getByLabel('Reduced').check()
    await page.reload()
    await enter(page)
    await menu(page, 'Settings', 'Display')
    await expect(menuCard(page).getByLabel('Always show the system’s paths (otherwise pinch or hold Space to reveal)')).toBeChecked()
    await expect(shell(page)).toHaveAttribute('data-reduced-motion', 'true')

    const blocked = await browser.newContext({ baseURL })
    try {
      await blocked.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('blocked') } }) })
      const other = await blocked.newPage()
      await start(other)
      await holdUntil(other, 'ArrowRight', () => expect(status(other)).toContainText('The junction turned'))
      await other.keyboard.press('Escape')
      await menu(other, 'System index')
      await expect(menuCard(other).getByText('05 / 09')).toBeVisible()
    } finally { await blocked.close() }
  })

  test('reduced-motion preference is honoured by default', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, reducedMotion: 'reduce' })
    try {
      const page = await context.newPage()
      await page.goto(route)
      await enter(page)
      await expect(shell(page)).toHaveAttribute('data-reduced-motion', 'true')
    } finally { await context.close() }
  })

  test('controls meet touch target size; the page, menus, settings and index pass automated accessibility checks', async ({ page }) => {
    await page.goto(route)
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
    await start(page)
    for (const box of await page.locator('.ec-shell button').evaluateAll(els => els.map(el => el.getBoundingClientRect()).filter(r => r.width > 0))) {
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
    await page.keyboard.press('Escape')
    expect((await new AxeBuilder({ page }).include('.ec-shell').analyze()).violations).toEqual([])
    await menu(page, 'Settings', 'Controls')
    expect((await new AxeBuilder({ page }).include('.ec-shell').analyze()).violations).toEqual([])
    await escapeTo(page, 'Settings'); await escapeTo(page, 'Paused')
    await menu(page, 'System index')
    expect((await new AxeBuilder({ page }).include('.ec-shell').analyze()).violations).toEqual([])
  })

  test('M5: the frame, rail, arena and controls fit one 320 × 568 screen without overlapping or scrolling sideways', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 320, height: 568 }, hasTouch: true })
    try {
      const page = await context.newPage()
      await start(page)
      await page.waitForTimeout(300)
      const fit = await page.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect()
        // The floating pad needs no controls row; fixed controls sit below the arena.
        const controls = document.querySelector('.ec-controls')?.getBoundingClientRect() ?? { top: innerHeight, bottom: innerHeight }
        return { overflow: document.documentElement.scrollWidth > innerWidth, frame: r('.ec-frame'), rail: r('.ec-rail'), canvas: r('.ps-canvas'), controls, viewport: innerHeight }
      })
      expect(fit.overflow).toBe(false)
      expect(fit.rail.top).toBeGreaterThanOrEqual(fit.frame.bottom - 1)
      // Messages never cover the world layer.
      expect(fit.canvas.top).toBeGreaterThanOrEqual(fit.rail.bottom - 1)
      expect(fit.canvas.bottom).toBeLessThanOrEqual(fit.controls.top + 1)
      expect(fit.controls.bottom).toBeLessThanOrEqual(fit.viewport + 1)
    } finally { await context.close() }
  })
})

test.describe('Edge Case on touch screens', () => {
  test('holding the movement pad moves the player; lifting stops it', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: browser.browserType().name() !== 'firefox' })
    try {
      const page = await context.newPage()
      await presetSettings(page, { movement: 'pad' })
      await page.goto(route)
      await page.getByRole('button', { name: /^Enter/ }).tap()
      await menuCard(page).getByRole('button', { name: 'Play', exact: true }).tap()
      await expect(shell(page)).toHaveAttribute('data-screen', 'playing')
      const pad = page.locator('.ps-pad')
      const pressUntil = async (name: string, condition: () => Promise<unknown>) => {
        const box = await page.getByRole('button', { name }).boundingBox()
        const at = { clientX: box!.x + box!.width / 2, clientY: box!.y + box!.height / 2, pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true }
        await pad.dispatchEvent('pointerdown', { ...at, buttons: 1 })
        try { await condition() } finally { await pad.dispatchEvent('pointerup', { ...at, buttons: 0 }) }
      }
      await pressUntil('Move right', () => expect(status(page)).toContainText('The junction turned clockwise'))
      await pressUntil('Move up', () => expect(shell(page)).toHaveAttribute('data-player-tile', /^\d+,4$/))
      await pressUntil('Move right', () => expect(samples(page)).toContainText('1/2'))
    } finally { await context.close() }
  })
})
