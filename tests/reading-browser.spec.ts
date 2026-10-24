import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const investigation = '/investigations/fixture-claims-handoff/'
const pattern = '/patterns/fixture-delivered-not-complete/'
const introName = 'Producing Curiosity introduction'

test('direct investigation HTML is useful before JavaScript runs', async ({ request }) => {
  const response = await request.get(investigation)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('Development fixture')
  expect(html).toContain('Contribution and scope')
  expect(html).toContain('Explained connections')
  expect(html).toContain('Evidence:')
  expect(html).toContain(`href="${pattern}"`)
  expect(html).toMatch(/<title>[^<]*[Ff]ixture[^<]*<\/title>/)
  expect(html).toMatch(/<meta[^>]+name="description"[^>]+content="[^"]+"/)
  expect(html).toContain(`https://producingcuriosity.com${investigation}`)
  expect(html).not.toContain('src="/src/')
})

test('article direct load, refresh and fragment bypass the intro without hydration errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(investigation)
  await expect(page.getByRole('region', { name: introName })).toHaveCount(0)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.locator('#reading-main')).toBeFocused()
  await page.screenshot({ path: 'test-results/reading-desktop.png', fullPage: true })
  const title = await page.locator('h1').innerText()
  expect(await page.title()).toContain(title)
  await page.reload()
  await expect(page.locator('h1')).toHaveText(title)
  await page.goto(`${investigation}#limitations`)
  await expect(page.locator('#limitations')).toBeInViewport()
  await expect(page.getByRole('region', { name: introName })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('the connected slice is readable and navigable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto(`http://127.0.0.1:4174${investigation}`)
  await expect(page.locator('h1')).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'On this page' })).toBeVisible()
  await page.locator('.reading-related-link').click()
  await expect(page).toHaveURL(new RegExp(`${pattern}$`))
  await expect(page.getByText('Incoming relationship', { exact: true })).toBeVisible()
  await expect(page.locator('.reading-connections')).toContainText('does not reverse the claim')
  await context.close()
})

test('evidence disclosure supports native keyboard expansion and collapse', async ({ page }) => {
  await page.goto(investigation)
  const disclosure = page.locator('.reading-evidence').first()
  const summary = disclosure.locator('summary')
  await expect(disclosure).not.toHaveAttribute('open')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(disclosure).toHaveAttribute('open', '')
  await expect(disclosure.getByText('Source locator', { exact: true })).toBeVisible()
  await expect(disclosure.getByText('Limitations', { exact: true })).toBeVisible()
  await page.keyboard.press('Space')
  await expect(disclosure).not.toHaveAttribute('open')
})

test('native links support modified clicks and Back restores reading position', async ({ page, context }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(investigation)
  const related = page.locator('.reading-related-link').first()
  await related.scrollIntoViewIfNeeded()
  const position = await page.evaluate(() => scrollY)
  expect(position).toBeGreaterThan(0)
  const [tab] = await Promise.all([
    context.waitForEvent('page'),
    related.click({ modifiers: ['ControlOrMeta'] }),
  ])
  await expect(tab).toHaveURL(new RegExp(`${pattern}$`))
  await expect(page).toHaveURL(new RegExp(`${investigation}$`))
  await tab.close()
  await related.click()
  await expect(page).toHaveURL(new RegExp(`${pattern}$`))
  await expect(page.getByText('Incoming relationship', { exact: true })).toBeVisible()
  await page.goBack()
  await expect(page).toHaveURL(new RegExp(`${investigation}$`))
  await expect.poll(async () => Math.abs(await page.evaluate(() => scrollY) - position)).toBeLessThan(80)
  await page.goForward()
  await expect(page).toHaveURL(new RegExp(`${pattern}$`))
})

test('unknown pages and unknown slugs return real HTTP 404 with useful HTML', async ({ request }) => {
  for (const path of ['/investigations/not-a-real-investigation/', '/patterns/no-such-pattern/', '/not-a-route/']) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(404)
    const html = await response.text()
    expect(html).toContain('This reading is not available.')
    expect(html).toContain('Browse investigations')
    expect(html).toContain('noindex')
  }
})

test('collection, entry and pattern scans include expanded evidence and text relationships', async ({ page }) => {
  for (const path of ['/investigations/', investigation, pattern]) {
    await page.goto(path)
    for (const summary of await page.locator('.reading-evidence summary').all()) await summary.click()
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(results.violations).toEqual([])
  }
})

test('reading reflows at 320px with user text spacing and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(investigation)
  await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' })
  await expect(page.locator('h1')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.locator('.reading-related-link').click()
  await expect(page).toHaveURL(new RegExp(`${pattern}$`))
  await page.screenshot({ path: 'test-results/reading-320.png', fullPage: true })
})
