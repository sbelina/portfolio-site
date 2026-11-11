import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const origin = 'http://127.0.0.1:4175'
const introduction = 'Producing Curiosity introduction'

test('current intro requires exactly three step actions and a separate Dive, never a timer', async ({ page }) => {
  await page.clock.install(); await page.goto(origin + '/')
  const region = page.getByRole('region', { name: introduction })
  await page.getByRole('button', { name: 'Begin exploring the question: how does one produce curiosity?' }).click()
  await page.clock.runFor(8000)
  await expect(page.getByRole('button', { name: 'step 2: test the limits' })).toBeVisible()
  await page.getByRole('button', { name: 'step 2: test the limits' }).click()
  await page.clock.runFor(8000)
  await expect(page.getByRole('button', { name: 'step 3: recognize patterns' })).toBeVisible()
  await page.getByRole('button', { name: 'step 3: recognize patterns' }).click()
  await expect(region).toHaveAttribute('data-intro-phase', 'ready')
  const position = await page.evaluate(() => scrollY)
  await page.clock.runFor(12000)
  await page.locator('.pc-intro .intro-field').dispatchEvent('wheel', { deltaY: 200 })
  await page.locator('.pc-intro .depth-field').click({ force: true })
  await expect(region).toHaveAttribute('data-intro-phase', 'ready')
  expect(await page.evaluate(() => scrollY)).toBe(position)
  await page.getByRole('button', { name: 'Dive in to the portfolio', exact: true }).click()
  await page.clock.runFor(1300)
  await expect(region).toHaveCount(0)
  await expect(page.locator('#index')).toBeFocused()
})

test('keyboard focus follows the steps; held third-step Enter cannot also activate Dive', async ({ page }) => {
  await page.clock.install(); await page.goto(origin + '/')
  await expect(page.getByRole('button', { name: 'Begin exploring the question: how does one produce curiosity?' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'step 2: test the limits' })).toBeFocused()
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'step 3: recognize patterns' })).toBeFocused()
  await page.keyboard.down('Enter')
  const dive = page.getByRole('button', { name: 'Dive in to the portfolio', exact: true })
  await expect(dive).toBeFocused()
  await page.keyboard.down('Enter'); await page.keyboard.up('Enter')
  await page.clock.runFor(6000)
  await expect(dive).toBeVisible()
  await page.keyboard.press('Enter'); await page.clock.runFor(1300)
  await expect(page.getByRole('region', { name: introduction })).toHaveCount(0)
  await expect(page.locator('#index')).toBeFocused()
})

test('touch uses four independent activations without a third-tap compatibility click diving', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  try {
    const page = await context.newPage(); await page.clock.install(); await page.goto(origin + '/')
    for (const name of ['Begin exploring the question: how does one produce curiosity?', 'step 2: test the limits', 'step 3: recognize patterns']) await page.getByRole('button', { name, exact: true }).tap()
    await page.clock.runFor(8000)
    await expect(page.getByRole('region', { name: introduction })).toHaveAttribute('data-intro-phase', 'ready')
    await page.getByRole('button', { name: 'Dive in to the portfolio', exact: true }).tap()
    await page.clock.runFor(1300)
    await expect(page.getByRole('region', { name: introduction })).toHaveCount(0)
  } finally { await context.close() }
})

test('skip, replay, return visits and reduced-motion replay keep the same explicit four actions', async ({ browser }) => {
  const context = await browser.newContext()
  try {
    const page = await context.newPage(); await page.goto(origin + '/')
    await page.getByRole('button', { name: 'Skip introduction', exact: true }).click()
    await expect(page.locator('#index')).toBeFocused()
    await page.reload(); await expect(page.getByRole('region', { name: introduction })).toHaveCount(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.getByRole('button', { name: 'Replay introduction', exact: true }).click()
    for (const name of ['Begin exploring the question: how does one produce curiosity?', 'step 2: test the limits', 'step 3: recognize patterns']) await page.getByRole('button', { name, exact: true }).click()
    await expect(page.getByRole('button', { name: 'Dive in to the portfolio', exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Dive in to the portfolio', exact: true }).click()
    await expect(page.getByRole('region', { name: introduction })).toHaveCount(0)
    await expect(page.locator('#index')).toBeFocused()
  } finally { await context.close() }
})

test('direct reading and denied visit storage never require the introduction', async ({ browser }) => {
  const context = await browser.newContext()
  try {
    const page = await context.newPage()
    await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new Error('Denied visit preference') } }) })
    await page.goto(origin + '/'); await expect(page.getByRole('button', { name: 'Replay introduction' })).toBeVisible()
    await expect(page.getByRole('region', { name: introduction })).toHaveCount(0)
    for (const path of ['/practice/', '/investigations/', '/#contact']) {
      await page.goto(origin + path)
      await expect(page.getByRole('region', { name: introduction })).toHaveCount(0)
    }
  } finally { await context.close() }
})

test('current intro has contrast, keyboard targets and enlarged narrow reading', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 800 }, reducedMotion: 'reduce', hasTouch: true })
  try {
    const page = await context.newPage(); await page.goto(origin + '/')
    await page.getByRole('button', { name: 'Replay introduction' }).click()
    await expect(page.getByRole('button', { name: 'Begin exploring the question: how does one produce curiosity?', exact: true })).toHaveAccessibleName(/how does one produce curiosity/)
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    for (const name of ['Begin exploring the question: how does one produce curiosity?', 'step 2: test the limits', 'step 3: recognize patterns']) {
      const button = page.getByRole('button', { name, exact: true })
      await button.scrollIntoViewIfNeeded(); await expect(button).toBeInViewport(); await button.tap()
    }
    const dive = page.getByRole('button', { name: 'Dive in to the portfolio' })
    await dive.scrollIntoViewIfNeeded(); await expect(dive).toBeInViewport()
    expect((await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
    await dive.tap(); await expect(page.locator('#index')).toBeFocused()
  } finally { await context.close() }
})

test('skip during a Dive cancels its animation and a replay starts at the first step', async ({ page }) => {
  await page.clock.install(); await page.goto(origin + '/')
  for (const name of ['Begin exploring the question: how does one produce curiosity?', 'step 2: test the limits', 'step 3: recognize patterns']) await page.getByRole('button', { name, exact: true }).click()
  await page.getByRole('button', { name: 'Dive in to the portfolio', exact: true }).click()
  await page.clock.runFor(200)
  await page.getByRole('button', { name: 'Skip introduction', exact: true }).click()
  await page.getByRole('button', { name: 'Replay introduction', exact: true }).click()
  await page.clock.runFor(6000)
  await expect(page.getByRole('region', { name: introduction })).toHaveAttribute('data-intro-phase', 'question')
  await expect(page.getByRole('button', { name: 'Begin exploring the question: how does one produce curiosity?', exact: true })).toBeVisible()
})

test('enlarged touch readers can pan vertically without accidentally completing an intro step', async ({ browser, browserName }) => {
  test.skip(browserName !== 'chromium', 'Raw touch input via CDP is Chromium-only; WebKit touch is covered by the Pattern Shift touch tests')
  const context = await browser.newContext({ viewport: { width: 320, height: 740 }, hasTouch: true, isMobile: true, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage(); await page.goto(origin + '/')
    await page.getByRole('button', { name: 'Replay introduction' }).tap()
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    const client = await context.newCDPSession(page)
    await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 160, y: 640 }] })
    for (const y of [560, 480, 400]) await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 160, y }] })
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
    await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0)
    await expect(page.getByRole('region', { name: introduction })).toHaveAttribute('data-intro-phase', 'question')
    await expect(page.getByRole('button', { name: 'Skip introduction', exact: true })).toBeInViewport()
    await page.getByRole('button', { name: 'Skip introduction', exact: true }).tap()
    await expect(page.getByRole('region', { name: introduction })).toHaveCount(0)
  } finally { await context.close() }
})

test('nested layers retain the visible account, native focus and reading position without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, hasTouch: true })
  try {
    const page = await context.newPage(); await page.goto(origin + '/')
    await expect(page.locator('.pc-moves h3')).toHaveText(['Test.', 'Show.', 'Enable.'])
    const questions = page.getByText('Questions behind Test', { exact: true })
    await questions.scrollIntoViewIfNeeded(); await questions.focus(); const before = await page.evaluate(() => scrollY)
    await page.keyboard.press('Enter'); await expect(page.getByText('What else could explain this outcome?', { exact: true })).toBeVisible()
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThanOrEqual(2)
    await page.keyboard.press('Space'); await expect(questions).toBeFocused()
    await page.getByText('Read this illustration', { exact: true }).tap()
    await expect(page.getByText('These lines are conceptual.', { exact: false })).toBeVisible()
    await page.getByText('What would make this evidence?', { exact: true }).tap()
    await expect(page.getByText('A convincing shape is not proof.', { exact: false })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await expect(page.getByText('Conceptual illustration · not measured data', { exact: true })).toBeVisible()
  } finally { await context.close() }
})
