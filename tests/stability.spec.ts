import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const intro = 'Producing Curiosity introduction'
const heading = 'The visible problem is rarely the one producing the outcome.'

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
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage denied', 'SecurityError') } })
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
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  await expect(page.getByRole('link', { name: 'hello@sbelina.com' })).toHaveAttribute('href', 'mailto:hello@sbelina.com')
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
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Connections' }).click()
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

test('exactly one keyboard activation per step; waiting never advances another step', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  const phrase = page.getByRole('button', { name: 'Begin exploring the question' })
  await phrase.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'step 2: test the limits' })).toBeFocused()
  await page.clock.runFor(6000)
  await expect(page.locator('.step-prompt')).toHaveText('step 2: test the limits')
  await page.keyboard.press('Space')
  await expect(page.getByRole('button', { name: 'step 3: recognize patterns' })).toBeFocused()
  await page.clock.runFor(6000)
  await expect(page.locator('.step-prompt')).toHaveText('step 3: recognize patterns')
  await page.keyboard.press('Enter')
  await expect(page.locator('.intro-field')).toHaveClass(/effect-breakthrough/)
  await page.clock.runFor(1900)
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


test('interrupted automatic stages cannot advance a replay', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin exploring the question' }).click()
  await page.clock.runFor(400)
  await page.getByRole('button', { name: 'Skip introduction' }).click()
  await page.getByRole('button', { name: 'Replay introduction' }).click()
  await page.clock.fastForward(5000)
  await expect(page.getByRole('button', { name: 'Begin exploring the question' })).toBeVisible()
  await expect(page.locator('.step-copy')).toHaveCount(0)
})

test('one touch swipe completes only the first step', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4174/')
  const client = await context.newCDPSession(page)
  await client.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 195, y: 550 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 195, y: 350 }] })
  await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
  await expect(page.locator('.intro-stage [aria-live]')).toContainText('Question the boundaries')
  await page.getByRole('button', { name: 'Skip introduction' }).tap()
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
  await context.close()
})

test('expanded text spacing preserves access and reflow', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.setViewportSize({ width: 320, height: 720 })
  await page.goto('/')
  await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' })
  await expect(page.getByRole('heading', { name: heading })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link', { name: 'Contact' }).click()
  await expect(page.locator('#contact')).toBeInViewport()
  await page.getByRole('link', { name: 'hello@sbelina.com' }).scrollIntoViewIfNeeded()
  await expect(page.getByRole('link', { name: 'hello@sbelina.com' })).toBeInViewport()
})

test('graph layer and selected-state accessibility', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.getByRole('button', { name: '+ archive', exact: true }).click()
  await page.getByRole('button', { name: 'tag: #systems. Select to trace connections.', exact: true }).click()
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(result.violations).toEqual([])
})


test('each phrase click completes exactly one step without bubbling into the next', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  await page.getByRole('button', { name: 'Begin exploring the question' }).click()
  await expect(page.locator('.intro-field')).toHaveClass(/effect-resist-one/)
  await expect(page.locator('.step-prompt')).toHaveText('step 2: test the limits')
  await page.getByRole('button', { name: 'step 2: test the limits' }).click()
  await expect(page.locator('.intro-field')).toHaveClass(/effect-resist-two/)
  await expect(page.locator('.step-prompt')).toHaveText('step 3: recognize patterns')
  await page.getByRole('button', { name: 'step 3: recognize patterns' }).click()
  await page.clock.runFor(1900)
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
})


test('one desktop drag follows direction and begins the sequence', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  const bounds = (await page.locator('.intro-field').boundingBox())!
  const x = bounds.x + bounds.width / 2
  const y = bounds.y + bounds.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 100, y - 50, { steps: 8 })
  expect(await page.locator('.intro-field').evaluate(e => e.style.getPropertyValue('--drag-x'))).not.toBe('0px')
  await page.mouse.up()
  await expect(page.locator('.step-prompt')).toContainText('step 2:')
  expect(await page.locator('.intro-field').evaluate(e => parseFloat(e.style.getPropertyValue('--dx')))).toBeGreaterThan(0)
  await page.clock.runFor(1000)
  await expect(page.locator('.step-prompt')).toContainText('step 2:')
})

test('three distinct wheel gestures complete the steps; inertia cannot skip steps', async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
  const field = page.locator('.intro-field')
  await field.dispatchEvent('wheel', { deltaY: 100 })
  await field.dispatchEvent('wheel', { deltaY: 60 })
  await field.dispatchEvent('wheel', { deltaY: 20 })
  await expect(page.locator('.step-prompt')).toHaveText('step 2: test the limits')
  await page.clock.runFor(1000)
  await field.dispatchEvent('wheel', { deltaY: 100 })
  await expect(page.locator('.step-prompt')).toHaveText('step 3: recognize patterns')
  await page.clock.runFor(1000)
  await field.dispatchEvent('wheel', { deltaY: 100 })
  await page.clock.runFor(1000)
  await expect(page.getByRole('button', { name: 'Dive into the portfolio' })).toBeVisible()
  // Flush the phase and animation effects separately from their fake-clock timers.
  await page.clock.runFor(200)
  await page.clock.runFor(150)
  const first = await page.evaluate(() => scrollY)
  await page.clock.runFor(250)
  expect(await page.evaluate(() => scrollY)).toBeGreaterThan(first)
  await page.clock.runFor(1000)
  await expect(page.getByRole('region', { name: intro })).toHaveCount(0)
  await expect(page.getByRole('heading', { name: heading })).toBeInViewport()
})


test('first presentation is remembered across new browser sessions; replay remains available', async ({ browser }) => {
  const first = await browser.newContext()
  const page = await first.newPage()
  await page.goto('http://127.0.0.1:4174/')
  await expect(page.getByRole('region', { name: intro })).toBeVisible()
  // Close midway, before completion: the visit must still be remembered.
  const state = await first.storageState()
  await first.close()
  const returning = await browser.newContext({ storageState: state })
  const next = await returning.newPage()
  await next.goto('http://127.0.0.1:4174/')
  await expect(next.getByRole('region', { name: intro })).toHaveCount(0)
  await expect(next.getByRole('heading', { name: heading })).toBeInViewport()
  await next.getByRole('button', { name: 'Replay introduction' }).click()
  await expect(next.getByRole('region', { name: intro })).toBeInViewport()
  await returning.close()
})

test('three touch taps advance separate steps and automatically enter the portfolio', async ({ browser, baseURL }) => {
 const context=await browser.newContext({baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true})
 try { const page=await context.newPage();await page.goto('/')
  await page.getByRole('button',{name:'Begin exploring the question'}).tap()
  await expect(page.locator('.step-prompt')).toHaveText('step 2: test the limits')
  await page.getByRole('button',{name:'step 2: test the limits'}).tap()
  await expect(page.locator('.step-prompt')).toHaveText('step 3: recognize patterns')
  await page.getByRole('button',{name:'step 3: recognize patterns'}).tap()
  await expect(page.getByRole('region',{name:intro})).toHaveCount(0)
 } finally {await context.close()}
})

test('reduced-motion replay retains three actions without animated feedback or dive', async ({ page }) => {
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/')
 await page.getByRole('button',{name:'Replay introduction'}).click()
 await page.getByRole('button',{name:'Begin exploring the question'}).click()
 await page.getByRole('button',{name:'step 2: test the limits'}).click()
 await expect(page.getByRole('button',{name:'step 3: recognize patterns'})).toBeVisible()
 await page.getByRole('button',{name:'step 3: recognize patterns'}).click()
 await expect(page.getByRole('region',{name:intro})).toHaveCount(0)
 await expect(page.locator('main')).toBeFocused()
})
