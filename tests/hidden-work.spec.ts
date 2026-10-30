import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { hiddenWork, processGeometry } from '../src/experiments/hidden-work/content'

const url = '/experiments/reveal-hidden-work/'
const reveal = 'Reveal the hidden work'
const sketchRequest = /\/assets\/sketch-[^/]+\.js/

test('portable data has unique identities, valid relationships and explicit illustrative provenance', () => {
  const ids = [...hiddenWork.stages, ...hiddenWork.work].map(item => item.id)
  expect(new Set(ids).size).toBe(ids.length)
  expect(hiddenWork.provenance.status).toBe('illustrative')
  for (const item of hiddenWork.work) expect(hiddenWork.stages.some(stage => stage.id === item.stageId)).toBe(true)
  for (const path of processGeometry(hiddenWork)) {
    expect(ids).toContain(hiddenWork.relationships.find(item => item.id === path.id)!.from)
    expect(path.from).toBeDefined(); expect(path.to).toBeDefined()
  }
})

test('direct HTML includes useful reading, no intro, real 404 and separate lazy sketch', async ({ page, request }) => {
  const response = await request.get(url)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('Find missing context')
  expect(html).toContain('Why these steps connect')
  expect(html).not.toMatch(/src="[^"]*sketch-/)
  expect(html).not.toMatch(/rel="modulepreload"[^>]*sketch-/)
  expect((await request.get('/experiments/does-not-exist/')).status()).toBe(404)
  const requests: string[] = []
  page.on('request', r => { if (sketchRequest.test(r.url())) requests.push(r.url()) })
  await page.goto('/#index')
  await expect(page.getByRole('heading', { name: 'The visible problem is rarely the one producing the outcome.' })).toBeVisible()
  expect(requests).toEqual([])
  await page.goto(url)
  await expect(page.getByRole('heading', { name: reveal, exact: true })).toBeVisible()
  await expect(page.getByRole('region', { name: 'Producing Curiosity introduction' })).toHaveCount(0)
  expect(requests).toEqual([])
})

test('one keyboard action reveals all work in place; pause, resume and reset keep native focus', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  await page.goto(url)
  const trigger = page.locator('.work-disclosure > summary')
  await trigger.scrollIntoViewIfNeeded()
  await trigger.focus()
  const before = await trigger.boundingBox()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
  expect((await trigger.boundingBox())!.y).toBeCloseTo(before!.y, 0)
  await expect(trigger).toBeFocused()
  await page.locator('.process-drawing').scrollIntoViewIfNeeded()
  await expect(page.locator('canvas')).toHaveCount(1)
  const pause = page.getByRole('button', { name: 'Pause motion' })
  await pause.focus(); await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'Resume motion' })).toBeEnabled()
  await expect(page.getByRole('status')).toContainText('paused')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Pause motion' })).toBeEnabled()
  await page.getByRole('button', { name: 'Reset experiment' }).click()
  await expect(trigger).toBeFocused()
  await expect(page.locator('.work-disclosure')).not.toHaveAttribute('open', '')
  await expect(page.locator('canvas')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('drawing actually stops offscreen and on pause, finishes once, and is removed on reduced motion', async ({ page }) => {
  await page.goto(url)
  await page.locator('.work-disclosure > summary').click()
  await page.locator('.process-drawing').scrollIntoViewIfNeeded()
  await expect(page.locator('canvas')).toHaveCount(1)
  const pixels = () => page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => canvas.toDataURL())
  await page.getByRole('button', { name: 'Pause motion' }).click()
  const paused = await pixels()
  await page.waitForTimeout(180)
  expect(await pixels()).toBe(paused)
  await page.getByRole('button', { name: 'Resume motion' }).click()
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await expect(page.getByRole('status')).toContainText('out of view')
  const background = await pixels()
  await page.waitForTimeout(180)
  expect(await pixels()).toBe(background)
  await page.evaluate(() => {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.locator('.experiment-footer').scrollIntoViewIfNeeded()
  await expect(page.getByRole('status')).toContainText('out of view')
  const offscreen = await pixels()
  await page.waitForTimeout(180)
  expect(await pixels()).toBe(offscreen)
  await page.locator('.process-drawing').scrollIntoViewIfNeeded()
  await expect(page.getByRole('status')).toContainText('Trace complete', { timeout: 7000 })
  const finished = await pixels()
  await page.waitForTimeout(180)
  expect(await pixels()).toBe(finished)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
})

test('reduced motion reveals all content without fetching p5', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const requests: string[] = []
  page.on('request', r => { if (sketchRequest.test(r.url())) requests.push(r.url()) })
  await page.goto(url)
  await page.locator('.work-disclosure > summary').click()
  await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
  await expect(page.getByRole('status')).toContainText('Static view')
  await expect(page.getByRole('button', { name: 'Pause motion' })).toBeDisabled()
  expect(requests).toEqual([])
})

test('failed optional import leaves full static reading usable', async ({ page }) => {
  await page.route(sketchRequest, route => route.abort())
  await page.goto(url)
  await page.locator('.work-disclosure > summary').click()
  await page.locator('.process-drawing').scrollIntoViewIfNeeded()
  await expect(page.getByRole('status')).toContainText('Motion unavailable')
  await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
  await page.getByRole('button', { name: 'Reset experiment' }).click()
  await expect(page.locator('.work-disclosure > summary')).toBeFocused()
})

test('closing during a deferred import cannot mount an abandoned sketch', async ({ page }) => {
  let release!: () => void
  const hold = new Promise<void>(resolve => { release = resolve })
  let started!: () => void
  const requested = new Promise<void>(resolve => { started = resolve })
  await page.route(sketchRequest, async route => { started(); await hold; await route.continue() })
  await page.goto(url)
  const trigger = page.locator('.work-disclosure > summary')
  await trigger.click()
  await page.locator('.process-drawing').scrollIntoViewIfNeeded()
  await requested
  await trigger.click()
  release()
  await expect(page.locator('.work-disclosure')).not.toHaveAttribute('open', '')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('canvas')).toHaveCount(0)
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`native reveal before hydration survives delayed JavaScript with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion })
    let release!: () => void
    const hold = new Promise<void>(resolve => { release = resolve })
    await page.route('**/assets/*.js', async route => { await hold; await route.continue() })
    const sketches: string[] = []
    page.on('request', request => { if (sketchRequest.test(request.url())) sketches.push(request.url()) })
    await page.goto(url, { waitUntil: 'commit' })
    await page.locator('.work-disclosure > summary').click()
    await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Reset experiment' })).toHaveCount(0)
    release()
    await page.waitForLoadState('load')
    await expect(page.getByRole('button', { name: 'Reset experiment' })).toBeVisible()
    await page.locator('.process-drawing').scrollIntoViewIfNeeded()
    if (reducedMotion === 'reduce') {
      await expect(page.getByRole('status')).toContainText('Static view')
      await expect(page.locator('canvas')).toHaveCount(0)
      expect(sketches).toEqual([])
    } else {
      await expect(page.locator('canvas')).toHaveCount(1)
      await page.getByRole('button', { name: 'Pause motion' }).click()
      await expect(page.getByRole('button', { name: 'Resume motion' })).toBeVisible()
    }
    await page.getByRole('button', { name: 'Reset experiment' }).click()
    await expect(page.locator('canvas')).toHaveCount(0)
    await expect(page.locator('.work-disclosure > summary')).toBeFocused()
  })
}

for (const failure of ['missing', 'constructor', 'observe'] as const) {
  test(`resize API ${failure} failure retains static reading without leaking a canvas`, async ({ page }) => {
    await page.addInitScript(mode => {
      const NativeResizeObserver = window.ResizeObserver
      Object.defineProperty(window, 'ResizeObserver', {
        configurable: true,
        value: mode === 'missing' ? undefined : mode === 'constructor'
          ? class { constructor() { throw new Error('Simulated resize constructor failure') } }
          : class extends NativeResizeObserver { observe() { throw new Error('Simulated observe failure') } },
      })
    }, failure)
    await page.goto(url)
    await page.locator('.work-disclosure > summary').click()
    await page.locator('.process-drawing').scrollIntoViewIfNeeded()
    await expect(page.getByRole('status')).toContainText('Motion unavailable')
    await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
    await expect(page.locator('canvas')).toHaveCount(0)
    await page.getByRole('button', { name: 'Reset experiment' }).click()
    await expect(page.locator('canvas')).toHaveCount(0)
  })
}

test('no JavaScript retains native reveal, text relationships, and footer disclosure', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:4174${url}`)
  await page.locator('.work-disclosure > summary').focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
  await expect(page.locator('.relationship-list li')).toHaveCount(hiddenWork.relationships.length)
  await expect(page.getByRole('button')).toHaveCount(0)
  await page.locator('.experiment-note > summary').click()
  await expect(page.getByRole('heading', { name: 'The working hypothesis' })).toBeVisible()
  await page.goto('http://127.0.0.1:4174/')
  await page.locator('.experiment-note > summary').click()
  await expect(page.getByRole('heading', { name: 'The working hypothesis' })).toBeVisible()
  await context.close()
})

test('touch, 320px reflow, enlarged text and reduced motion preserve inline reading', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' })
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:4174${url}`)
  await page.locator('.work-disclosure > summary').tap()
  await expect(page.getByRole('heading', { name: 'Find missing context' })).toBeVisible()
  await page.locator('.process-drawing').scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/hidden-work-mobile-normal.png' })
  await page.addStyleTag({ content: 'html { font-size: 200%; }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  await expect(page.getByRole('heading', { name: 'What would make this more than an illustration?' })).toBeVisible()
  await page.getByRole('heading', { name: 'Find missing context' }).scrollIntoViewIfNeeded()
  await page.screenshot({ path: 'test-results/hidden-work-mobile.png' })
  await context.close()
})

test('expanded experiment and footer pass automated accessibility checks', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(url)
  await page.locator('.work-disclosure > summary').click()
  await page.locator('.experiment-note > summary').click()
  expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
  await page.screenshot({ path: 'test-results/hidden-work-desktop.png', fullPage: true })
})
