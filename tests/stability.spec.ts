import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const intro = 'Producing Curiosity introduction'
const heading = 'I swim upstream toward the problem.'

test('first visit: mouse skip removes intro and focuses content; returning visit bypasses it', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('region', { name: intro })).toBeVisible()
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
  await expect(page.locator('main')).toBeFocused()
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
  await page.reload()
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
})

test('denied session storage never prevents content mounting', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Storage denied', 'SecurityError') } })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
})

test('reduced motion gives immediate main content access', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
})

test('keyboard can bypass introduction without gestures', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused()
  await page.keyboard.press('Enter')
  await expect(page.locator('main')).toBeFocused()
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
})

test('storage write failures do not prevent skipping or replay', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError') }
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
  await page.getByRole('button', { name: 'Replay introduction' }).click()
  await expect(page.getByRole('region', { name: intro })).toBeInViewport()
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  await expect(page.locator('main')).toBeFocused()
})

test('button Space activation is not captured by the intro keyboard handler', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin exploring the question' }).click()
  const skip = page.getByRole('button', { name: 'Skip introduction' })
  await skip.focus()
  await page.keyboard.press('Space')
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
})

test('unavailable motion API leaves an operable route to content', async ({ page }) => {
  await page.addInitScript(() => {
    window.matchMedia = () => { throw new Error('Simulated motion API failure') }
  })
  await page.goto('/')
  await page.getByRole('link', { name: 'Skip to main content' }).click()
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
})

test('blocked JavaScript retains a readable fallback', async ({ page }) => {
  await page.route('**/assets/*.js', route => route.abort())
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Producing Curiosity', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Email Sam Belina' })).toHaveAttribute('href', 'mailto:hello@sbelina.com')
})

test('automated WCAG checks on intro and main content', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Begin exploring the question' })).toBeVisible()
  const scan = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect((await scan()).violations).toEqual([])
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  expect((await scan()).violations).toEqual([])
})

test('main navigation and graph work after skip', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Map' }).click()
  await expect(page).toHaveURL(/#connections$/)
  await page.getByRole('button', { name: 'tag: #systems. Select to trace connections.', exact: true }).click()
  await expect(page.locator('.graph-explanation')).toContainText('systems')
  await page.getByText('Browse the same system as text', { exact: true }).click()
  await expect(page.locator('.connection-groups')).toBeVisible()
})

test.describe('touch and reflow', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
  test('touch skip and main content fit a narrow screen', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Skip introduction' }).tap()
    await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: 'test-results/mobile-main.png' })
  })
})


test('intro render failure during replay cannot take down main content', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  await page.evaluate(() => { window.matchMedia = () => { throw new Error('Simulated intro render failure') } })
  await page.getByRole('button', { name: 'Replay introduction' }).click()
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
  await page.getByRole('link', { name: 'Skip to main content' }).click()
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
})

test('the original three attempts per step still lead through the dive to main content', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin exploring the question' }).click()
  for (let step = 1; step <= 3; step++) {
    await expect(page.locator('.step-copy p')).toContainText(`step ${step}:`)
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.getByRole('button', { name: 'Test the boundary' }).focus()
      await page.keyboard.press('Enter')
      await expect(page.locator('.intro-field')).toHaveClass(/effect-idle/, { timeout: 3000 })
    }
  }
  await expect(page.locator('.step-copy p')).toContainText('step 4: dive in')
  await page.getByRole('button', { name: 'Dive into the portfolio' }).focus()
  await page.keyboard.press('Enter')
  await page.locator('main').scrollIntoViewIfNeeded()
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
  await expect(page.locator('main')).toBeFocused()
})

test('direct case links bypass intro and keep the existing fragment', async ({ page }) => {
  await page.goto('/#claims-operations')
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
  await expect(page.locator('#claims-operations')).toBeInViewport()
  await expect(page).toHaveURL(/#claims-operations$/)
})

test('main content and skip remain usable at 320 CSS pixels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  await page.getByRole('link', { name: 'Skip to main content' }).click()
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})


test('interrupted attempt timers cannot advance a replay', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin exploring the question' }).click()
  await page.getByRole('button', { name: 'Test the boundary' }).focus()
  await page.keyboard.press('Enter')
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  await page.getByRole('button', { name: 'Replay introduction' }).click()
  await page.clock.fastForward(2000)
  await expect(page.getByRole('button', { name: 'Begin exploring the question' })).toBeVisible()
  await expect(page.locator('.step-copy')).toHaveCount(0)
})

test('touch gestures retain the authored resistance sequence', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4174/')
  await page.getByRole('button', { name: 'Begin exploring the question' }).tap()
  const client = await context.newCDPSession(page)
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 550 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 350 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(page.locator('.intro-stage [aria-live]')).toContainText('The surface yields')
  await page.getByRole('button', { name: 'Skip introduction' }).tap()
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
  await context.close()
})
