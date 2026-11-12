import { test, expect } from '@playwright/test'
import { enter, escapeTo, holdUntil, keyUntil, menu, menuCard, presetSettings, route, shell, start, status } from './support/edge-case-ui'

// Interface rules: hints (§11), run records (§12) and controls (§12a) in tests/EDGE-CASE-MECHANICS.md.
const tip = (page: import('@playwright/test').Page) => page.locator('.ec-rail-line.is-hint')

test('N1 N3: level 000 gives no instruction at first, then escalating hints in the message rail while no junction has been turned', async ({ page }) => {
  // The fake clock renders every frame of 46 s of play; WebKit needs longer than the default timeout.
  test.slow()
  await page.clock.install()
  await start(page)
  await page.clock.runFor(10_000)
  await expect(tip(page)).toHaveCount(0)
  await page.clock.runFor(6_000)
  await expect(tip(page)).toContainText('Not every wall here is a wall.')
  await expect(status(page)).toContainText('Hint: Not every wall here is a wall.')
  await page.clock.runFor(15_000)
  await expect(tip(page)).toContainText('The cross with the orange pivot can turn.')
  await page.clock.runFor(15_000)
  await expect(tip(page)).toContainText('Keep pushing into one of its arms. It turns the way you push.')
  // Progress (a turn) removes the hint; it never changed the simulation.
  await page.keyboard.down('ArrowRight')
  await page.clock.runFor(1_000)
  await page.keyboard.up('ArrowRight')
  await expect(status(page)).toContainText('The junction turned')
  await expect(tip(page)).toHaveCount(0)
})

test('N1: pausing does not count as being stuck; hints can be switched off in Gameplay', async ({ page }) => {
  // Fast-forwards about 110 s of rendered play; WebKit needs longer than the default timeout.
  test.slow()
  await page.clock.install()
  await start(page)
  await page.keyboard.press('Escape')
  await page.clock.runFor(60_000)
  await menuCard(page).getByRole('button', { name: 'Resume' }).click()
  await page.clock.runFor(1_000)
  await expect(tip(page)).toHaveCount(0)
  await page.keyboard.press('Escape')
  await menu(page, 'Settings', 'Gameplay')
  await menuCard(page).getByLabel('Offer hints when I seem stuck').uncheck()
  await escapeTo(page, 'Settings'); await escapeTo(page, 'Paused'); await escapeTo(page, 'playing')
  await page.clock.runFor(50_000)
  await expect(tip(page)).toHaveCount(0)
})

test('N3: a hint can be requested early from the pause menu', async ({ page }) => {
  await start(page)
  await page.keyboard.press('Escape')
  await menu(page, 'Show a hint')
  await expect(tip(page)).toContainText('Hint 1')
  await expect(shell(page)).toHaveAttribute('data-screen', 'playing')
})

test('L1 L2: a failed attempt is logged with a snapshot that can be saved as a PNG', async ({ page }) => {
  await start(page)
  await holdUntil(page, 'ArrowRight', () => expect(status(page)).toContainText('The junction turned'))
  // Walk into the tracer's lane and wait for it.
  await page.keyboard.down('ArrowUp'); await page.waitForTimeout(700); await page.keyboard.up('ArrowUp')
  await expect(page.getByRole('dialog', { name: 'Caught by a tracer' })).toBeVisible({ timeout: 10_000 })
  await page.getByRole('button', { name: 'Snapshot' }).click()
  const record = page.getByRole('dialog', { name: 'Field record' })
  await expect(record.getByRole('img', { name: /Field record for 000 False Start: caught after/ })).toBeVisible()
  const download = page.waitForEvent('download')
  await record.getByRole('button', { name: 'Save image' }).click()
  expect((await download).suggestedFilename()).toMatch(/^edge-case-000-failed-.*\.png$/)
  await record.getByRole('button', { name: 'Back' }).click()
  await page.keyboard.press('KeyR')
  await page.keyboard.press('Escape')
  await menu(page, 'Field log')
  const log = menuCard(page)
  await expect(log.getByText('caught by a tracer')).toBeVisible()
  await expect(log.getByRole('table')).toContainText('000')
})

test('L4: standings show best time, fewest actions and ways found out of an unknown total', async ({ page }) => {
  await page.addInitScript(() => {
    const won = (seconds: number, method: string, shifts: number) => ({ id: `${seconds}${method}`, level: 'shift-happens', code: '010', title: 'Shift Happens', outcome: 'won', seconds, shifts, gateTurns: method === 'Pivot' ? 1 : 0, attempt: 1, hints: 0, discoveries: [], method, at: '2026-11-11T12:00:00Z', thumb: '' })
    localStorage.setItem('edge-case:log:v1', JSON.stringify([won(31.2, 'Pivot', 0), won(22.4, 'Carried exit + Exception', 2)]))
  })
  await page.goto(route)
  await enter(page)
  await menu(page, 'Field log')
  const row = menuCard(page).getByRole('row', { name: /010/ })
  await expect(row).toContainText('22.4 s')
  await expect(row).toContainText('1')
  await expect(row).toContainText('2 / ?')
  await expect(menuCard(page).getByText('Carried exit + Exception · rank #1 of 2')).toBeVisible()
})

test('I2: the movement control can sit on either side, and the choice persists', async ({ page }) => {
  await presetSettings(page, { movement: 'pad' })
  await page.goto(route)
  await enter(page)
  const pad = page.locator('.ps-pad'), controls = page.locator('.ec-controls')
  const side = async () => { const p = (await pad.boundingBox())!, c = (await controls.boundingBox())!; return p.x + p.width / 2 < c.x + c.width / 2 ? 'left' : 'right' }
  expect(await side()).toBe('left')
  await menu(page, 'Settings', 'Controls')
  await menuCard(page).getByLabel('Movement control on the right').check()
  expect(await side()).toBe('right')
  await page.reload()
  await enter(page)
  expect(await side()).toBe('right')
})

test('I1: the joystick follows the finger and moves the player; lifting stops it', async ({ browser, baseURL }) => {
  // Reduced motion keeps measured positions stable.
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    await page.goto(route)
    await enter(page)
    await menu(page, 'Settings', 'Controls')
    await menuCard(page).getByLabel('Joystick that follows your finger').check()
    await escapeTo(page, 'Settings'); await escapeTo(page, 'EDGE CASE')
    await expect(page.locator('.ps-pad')).toHaveCount(0)
    await menuCard(page).getByRole('button', { name: 'Play', exact: true }).click()
    // Keyboard still works in joystick mode: push east into the arm to leave the start pocket.
    await holdUntil(page, 'ArrowRight', () => expect(status(page)).toContainText('The junction turned'))
    const zone = page.locator('.ps-stick')
    const box = (await zone.boundingBox())!
    const at = (x: number, y: number, buttons: number) => ({ clientX: box.x + x, clientY: box.y + y, pointerId: 11, pointerType: 'touch', isPrimary: true, buttons, bubbles: true })
    // Land anywhere: the base appears under the finger.
    await zone.dispatchEvent('pointerdown', at(40, 60, 1))
    await expect(zone).toHaveAttribute('data-held', 'true')
    const base = await page.locator('.ps-stick-base').evaluate(el => new DOMMatrix(getComputedStyle(el).transform))
    expect(base.m41).toBeCloseTo(40, 0)
    expect(base.m42).toBeCloseTo(60, 0)
    // Drive the finger from inside the page, checked every frame: drag far up (the base
    // trails the finger) until the player enters row 4, then drag right until the sample is collected.
    await page.evaluate(({ x, y }) => new Promise<void>((resolve, reject) => {
      const zone = document.querySelector('.ps-stick')!, root = document.querySelector('.ec-shell')!
      const move = (dx: number, dy: number) => zone.dispatchEvent(new PointerEvent('pointermove', { clientX: x + dx, clientY: y + dy, pointerId: 11, pointerType: 'touch', isPrimary: true, buttons: 1, bubbles: true }))
      move(40, 10)
      let turned = false
      const deadline = performance.now() + 8000
      const frame = () => {
        if (!turned && /,4$/.test(root.getAttribute('data-player-tile') ?? '')) { turned = true; move(90, 60) }
        if (document.querySelector('.ps-samples')?.textContent?.includes('1/2')) return resolve()
        if (performance.now() > deadline) return reject(new Error(`stuck at ${root.getAttribute('data-player-tile')}`))
        requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    }), { x: box.x, y: box.y })
    await zone.dispatchEvent('pointerup', at(90, 60, 0))
    await expect(zone).not.toHaveAttribute('data-held', 'true')
    // Released: the player brakes to a stop (P2).
    const stopped = await shell(page).getAttribute('data-player-tile')
    await page.waitForTimeout(400)
    await expect(shell(page)).toHaveAttribute('data-player-tile', stopped!)
  } finally { await context.close() }
})

/** Dispatch touch-like pointer events on the touch surface, in arena tile units. */
async function touchAt(page: import('@playwright/test').Page) {
  const surface = page.locator('.ec-touch')
  const canvas = (await page.locator('.ps-canvas').boundingBox())!
  const tileSize = canvas.width / 9
  const at = (id: number, tx: number, ty: number, buttons = 1) => ({ clientX: canvas.x + tx * tileSize, clientY: canvas.y + ty * tileSize, pointerId: id, pointerType: 'touch', isPrimary: id === 1, buttons, bubbles: true })
  return { surface, at, tileSize }
}

test('V1 V2: routes are hidden in play; holding Space reveals the system without stopping time', async ({ page }) => {
  await start(page, '010')
  await expect(shell(page)).toHaveAttribute('data-reveal', 'false')
  await page.keyboard.down('Space')
  await expect(shell(page)).toHaveAttribute('data-reveal', 'true')
  await expect(page.locator('.ec-rail')).toContainText('Complete: 0 of 2 samples')
  await expect(shell(page)).toHaveAttribute('data-screen', 'playing')
  await page.keyboard.up('Space')
  await expect(shell(page)).toHaveAttribute('data-reveal', 'false')
})

test('V2 I5: two fingers pinching in reveal the system until a finger lifts', async ({ page }) => {
  await start(page, '010')
  const { surface, at } = await touchAt(page)
  await surface.dispatchEvent('pointerdown', at(1, 2, 7))
  await surface.dispatchEvent('pointerdown', at(2, 7, 7))
  await surface.dispatchEvent('pointermove', at(1, 3, 7))
  await surface.dispatchEvent('pointermove', at(2, 6, 7))
  await expect(shell(page)).toHaveAttribute('data-reveal', 'true')
  await surface.dispatchEvent('pointerup', at(2, 6, 7, 0))
  await expect(shell(page)).toHaveAttribute('data-reveal', 'false')
  await surface.dispatchEvent('pointerup', at(1, 3, 7, 0))
  // A pinch is never also a tap.
  await expect(page.locator('.ec-rail')).not.toContainText('Inspect')
})

test('V3: a tap inspects what is under it and never moves you', async ({ page }) => {
  await start(page, '010')
  const { surface, at } = await touchAt(page)
  const before = await shell(page).getAttribute('data-player-tile')
  await surface.dispatchEvent('pointerdown', at(1, 4, 3))
  await surface.dispatchEvent('pointerup', at(1, 4, 3, 0))
  await expect(page.locator('.ec-rail')).toContainText('Junction: push one of its arms to turn it, either way.')
  await surface.dispatchEvent('pointerdown', at(1, 4.5, 2.5))
  await surface.dispatchEvent('pointerup', at(1, 4.5, 2.5, 0))
  await expect(page.locator('.ec-rail')).toContainText('Exit: leave any time. Complete needs 2 of 3 samples; you have 0.')
  await expect(shell(page)).toHaveAttribute('data-player-tile', before!)
})

test('I4: on touch screens the floating pad is the default and appears under the thumb', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, isMobile: browser.browserType().name() !== 'firefox', reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    // Version-1 settings that chose the fixed pad move to the device default once.
    await page.addInitScript(() => localStorage.setItem('edge-case:v1', JSON.stringify({ settings: { movement: 'pad' }, completed: [], discovered: [], indexOpens: 0 })))
    await start(page)
    const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches)
    test.skip(!coarse, 'This engine does not report a coarse pointer for emulated touch')
    await expect(page.locator('.ps-pad')).toHaveCount(0)
    await expect(page.locator('.ec-controls')).toHaveCount(0)
    await holdUntil(page, 'ArrowRight', () => expect(status(page)).toContainText('The junction turned'))
    const { surface, at } = await touchAt(page)
    // Land anywhere, then drag: the pad appears where the thumb landed.
    await surface.dispatchEvent('pointerdown', at(1, 6, 8))
    await surface.dispatchEvent('pointermove', at(1, 6, 7.5))
    await expect(surface).toHaveAttribute('data-held', 'true')
    // The drag moves the player north out of the pocket (row 5).
    await expect(shell(page)).toHaveAttribute('data-player-tile', /^\d+,[0-4]$/)
    await surface.dispatchEvent('pointerup', at(1, 6, 7.5, 0)).catch(() => {})
    await expect(page.locator('.ec-touch[data-held="true"]')).toHaveCount(0)
  } finally { await context.close() }
})

test('S4: leaving through the exit without enough samples is logged as partial', async ({ page }) => {
  await start(page)
  // Out of the sealed pocket, up to the floor below the tracer's lane (row 3).
  await holdUntil(page, 'ArrowRight', () => expect(status(page)).toContainText('The junction turned clockwise'))
  await keyUntil(page, 'ArrowUp', 'data-player-tile', /^4,3$/)
  // Cross only while the tracer is at the far east end of its lane.
  await expect(shell(page)).toHaveAttribute('data-tracer-tiles', /^7,2$/, { timeout: 10_000 })
  await keyUntil(page, 'ArrowUp', 'data-screen', /^won$/)
  const card = page.getByRole('dialog', { name: 'Left early' })
  await expect(card).toContainText('Partial: 0 of 2 samples.')
  await card.getByRole('button', { name: 'Menu' }).click()
  await menu(page, 'Field log')
  await expect(menuCard(page).getByText(/left early · partial/)).toBeVisible()
  // Partial runs are logged but never ranked: the 000 standing stays empty.
  await expect(menuCard(page).getByRole('row', { name: /000/ })).toContainText('—')
})
