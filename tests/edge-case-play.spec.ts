import { test, expect, type Page } from '@playwright/test'

// Interface rules: hints (§11) and run records (§12) in tests/EDGE-CASE-MECHANICS.md.
const route = '/play/edge-case/'
const status = (page: Page) => page.getByRole('status')
const tip = (page: Page) => page.locator('.ps-tip')

test('N1 N3: level 000 gives no instruction at first, then escalating hints while SHIFT is not found', async ({ page }) => {
  // The fake clock renders every frame of 46 s of play; WebKit needs longer than the default timeout.
  test.slow()
  await page.clock.install()
  await page.goto(route)
  await page.getByRole('button', { name: 'Play' }).click()
  await expect(page.locator('.ps')).toHaveAttribute('data-screen', 'playing')
  await page.clock.runFor(10_000)
  await expect(tip(page)).toHaveCount(0)
  await page.clock.runFor(6_000)
  await expect(tip(page)).toContainText('Walls are not the only structure here.')
  await expect(status(page)).toContainText('Hint: Walls are not the only structure here.')
  await page.clock.runFor(15_000)
  await expect(tip(page)).toContainText('The orange pivot belongs to something that turns.')
  await page.clock.runFor(15_000)
  await expect(tip(page)).toContainText('press Shift, Space or Enter, or the Shift button')
  // Progress removes the hint; it never changed the simulation.
  await page.keyboard.press('Shift')
  await page.clock.runFor(200)
  await expect(tip(page)).toHaveCount(0)
})

test('N1: pausing does not count as being stuck', async ({ page }) => {
  await page.clock.install()
  await page.goto(route)
  await page.getByRole('button', { name: 'Play' }).click()
  await page.keyboard.press('Escape')
  await page.clock.runFor(60_000)
  await page.getByRole('button', { name: 'Resume' }).click()
  await page.clock.runFor(1_000)
  await expect(tip(page)).toHaveCount(0)
})

test('N3: a hint can be requested early from the pause menu', async ({ page }) => {
  await page.goto(route)
  await page.getByRole('button', { name: 'Play' }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Show a hint' }).click()
  await expect(tip(page)).toContainText('Hint 1')
  await expect(page.locator('.ps')).toHaveAttribute('data-screen', 'playing')
})

test('L1 L2: a failed attempt is logged with a snapshot that can be saved as a PNG', async ({ page }) => {
  await page.goto(route)
  await page.getByRole('button', { name: 'Play' }).click()
  await page.keyboard.press('Shift')
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
  await page.getByRole('button', { name: 'Field log' }).click()
  const log = page.getByRole('dialog', { name: 'Field log' })
  await expect(log.getByText('caught by a tracer')).toBeVisible()
  await expect(log.getByRole('table')).toContainText('000')
})

test('L4: standings show best time, fewest actions and ways found out of an unknown total', async ({ page }) => {
  await page.addInitScript(() => {
    const won = (seconds: number, method: string, shifts: number) => ({ id: `${seconds}${method}`, level: 'shift-happens', code: '010', title: 'Shift Happens', outcome: 'won', seconds, shifts, gateTurns: method === 'Pivot' ? 1 : 0, attempt: 1, hints: 0, discoveries: [], method, at: '2026-11-11T12:00:00Z', thumb: '' })
    localStorage.setItem('edge-case:log:v1', JSON.stringify([won(31.2, 'Pivot', 0), won(22.4, 'Carried exit + Exception', 2)]))
  })
  await page.goto(route)
  await page.getByRole('button', { name: 'Field log' }).click()
  const row = page.getByRole('dialog', { name: 'Field log' }).getByRole('row', { name: /010/ })
  await expect(row).toContainText('22.4 s')
  await expect(row).toContainText('1')
  await expect(row).toContainText('2 / ?')
  await expect(page.getByText('Carried exit + Exception · rank #1 of 2')).toBeVisible()
})

test('I2: control sides can be swapped in settings and persist', async ({ page }) => {
  await page.goto(route)
  const pad = page.locator('.ps-pad'), shift = page.locator('.ps-action')
  expect((await pad.boundingBox())!.x).toBeLessThan((await shift.boundingBox())!.x)
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByLabel('Movement right, Shift left').check()
  await page.getByRole('button', { name: 'Done' }).click()
  expect((await pad.boundingBox())!.x).toBeGreaterThan((await shift.boundingBox())!.x)
  await page.reload()
  expect((await pad.boundingBox())!.x).toBeGreaterThan((await shift.boundingBox())!.x)
})

test('I1: the joystick follows the finger and moves the player; lifting stops it', async ({ browser, baseURL }) => {
  // Reduced motion makes the scroll-into-view on Play instant, so measured positions are stable.
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 664 }, hasTouch: true, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    await page.goto(route)
    await page.getByRole('button', { name: 'Settings' }).click()
    await page.getByLabel('Joystick that follows your finger').check()
    await page.getByRole('button', { name: 'Done' }).click()
    await expect(page.locator('.ps-pad')).toHaveCount(0)
    await page.getByRole('button', { name: 'Play' }).click()
    await page.getByRole('button', { name: 'Shift' }).click()
    const zone = page.locator('.ps-stick')
    const box = (await zone.boundingBox())!
    const at = (x: number, y: number, buttons: number) => ({ clientX: box.x + x, clientY: box.y + y, pointerId: 11, pointerType: 'touch', isPrimary: true, buttons, bubbles: true })
    // Land anywhere: the base appears under the finger.
    await zone.dispatchEvent('pointerdown', at(40, 60, 1))
    await expect(zone).toHaveAttribute('data-held', 'true')
    const base = await page.locator('.ps-stick-base').evaluate(el => new DOMMatrix(getComputedStyle(el).transform))
    expect(base.m41).toBeCloseTo(40, 0)
    expect(base.m42).toBeCloseTo(60, 0)
    const section = page.locator('.ps')
    // Drive the finger from inside the page, checked every frame: drag far up (the base
    // trails the finger) until the player enters row 4, then drag right until the sample is collected.
    await page.evaluate(({ x, y }) => new Promise<void>((resolve, reject) => {
      const zone = document.querySelector('.ps-stick')!, root = document.querySelector('.ps')!
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
    const stopped = await section.getAttribute('data-player-tile')
    await page.waitForTimeout(400)
    await expect(section).toHaveAttribute('data-player-tile', stopped!)
    await expect(page.locator('.ps-samples')).toContainText('1/2')
  } finally { await context.close() }
})
