import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'

const origin = 'http://127.0.0.1:4175'
const destinations = [['Investigations', '/investigations/'], ['Connections', '/patterns/'], ['Practice', '/practice/'], ['Contact', '/#contact']] as const

for (const route of ['/', '/practice/', '/patterns/', '/system/']) {
  test(`current edition has initial reading, real menus and no required animation on ${route}`, async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'reduce' })
    try {
      const page = await context.newPage()
      const response = await page.goto(origin + route)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
      for (const [label, href] of destinations) await expect(nav.getByRole('link', { name: label, exact: true })).toHaveAttribute('href', href)
      if (route === '/practice/' || route === '/patterns/') await expect(nav.locator('[aria-current="page"]')).toHaveAttribute('href', route)
      const summary = page.locator('footer .experiment-note > summary')
      await summary.focus(); await page.keyboard.press('Enter')
      await expect(page.getByRole('heading', { name: 'The working hypothesis' })).toBeVisible()
      await expect(page.locator('footer .experiment-note')).toContainText('not a demonstrated result')
      await page.keyboard.press('Space'); await expect(summary).toBeFocused()
      await expect(page.locator('footer .experiment-note')).not.toHaveAttribute('open', '')
      expect(await page.locator('canvas').count()).toBe(0)
    } finally { await context.close() }
  })
}

test('practice moves are prose; homepage and direct method do not load graph or p5', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  try {
    const page = await context.newPage(), errors: string[] = [], requests: string[] = []
    page.on('pageerror', error => errors.push(error.message)); page.on('request', request => requests.push(request.url()))
    await page.goto(origin + '/')
    await expect(page.locator('.pc-moves h3')).toHaveText(['Test.', 'Show.', 'Enable.'])
    await expect(page.locator('.pc-moves button')).toHaveCount(0)
    const method = page.getByRole('link', { name: 'How I investigate', exact: false })
    await method.focus(); await page.keyboard.press('Enter'); await expect(page).toHaveURL(origin + '/practice/')
    await expect(page.getByRole('heading', { name: 'Test. Show. Enable.', exact: true })).toBeVisible()
    await expect(page.getByText('What way of looking at this makes it appear true?', { exact: true })).toBeVisible()
    expect(requests.some(url => /\/assets\/(?:App-|sketch-)/.test(url))).toBe(false)
    expect(errors).toEqual([])
  } finally { await context.close() }
})

test('specimen surface control preserves focus, content and position; both surfaces have accessible state', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  try {
    const page = await context.newPage(); await page.goto(origin + '/system/')
    const choice = page.getByRole('radio', { name: 'Observatory surface', exact: true })
    await choice.focus()
    const before = await page.evaluate(() => scrollY)
    await page.keyboard.press('Space'); await expect(choice).toBeChecked(); await expect(choice).toBeFocused()
    await expect(page.locator('.pc-site')).toHaveAttribute('data-surface', 'observatory')
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThanOrEqual(2)
    for (const name of ['Observatory surface', 'Paper reading surface']) {
      await page.getByRole('radio', { name, exact: true }).check()
      expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([])
      const pairs = await page.locator('.pc-site').evaluate(element => {
        const style = getComputedStyle(element)
        return ['--ink', '--muted', '--signal', '--unresolved', '--pressure', '--holds', '--focus'].map(role => ({ role, fg: style.getPropertyValue(role).trim(), bg: style.getPropertyValue('--paper').trim() }))
      })
      const luminance = (hex: string) => {
        const rgb = hex.slice(1).match(/../g)!.map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4)
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722
      }
      for (const pair of pairs) {
        const values = [luminance(pair.fg), luminance(pair.bg)].sort((a, b) => a - b)
        expect((values[1] + .05) / (values[0] + .05), pair.role + ' on ' + name).toBeGreaterThanOrEqual(4.5)
      }
    }
    const detail = page.getByText('Inspect this illustration', { exact: true })
    await detail.focus(); await page.keyboard.press('Enter')
    await expect(page.locator('.pc-document details')).toHaveAttribute('open', '')
    await page.keyboard.press('Space'); await expect(detail).toBeFocused()
    await page.reload(); await expect(page.getByRole('radio', { name: 'Paper reading surface' })).toBeChecked()
  } finally { await context.close() }
})

test('current pages reflow with touch, reduced motion and enlarged text; no-JS specimen has no inert controls', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 800 }, hasTouch: true, reducedMotion: 'reduce', javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    for (const route of ['/', '/practice/', '/patterns/', '/system/', '/investigations/']) {
      await page.goto(origin + route)
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true)
      const nav = page.getByRole('navigation', { name: 'Primary navigation', exact: true })
      for (const link of await nav.getByRole('link').all()) expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }
    await page.goto(origin + '/system/'); await expect(page.getByRole('radio')).toHaveCount(0)
    await expect(page.getByRole('complementary', { name: 'Static observatory sample' })).toBeVisible()
    await page.getByText('Inspect this illustration', { exact: true }).tap()
    await expect(page.locator('.pc-document details')).toHaveAttribute('open', '')
  } finally { await context.close() }
})

test('new routes reserve claims for reviewed selections, preserve real 404s and keep specimen out of sitemap', async ({ request }) => {
  const content = await (await request.get(origin + '/public-content.json')).json()
  expect(content.entries).toEqual([]); expect(content.relationships).toEqual([])
  for (const route of ['/practice/missing/', '/patterns/missing/', '/system/private/', '/foundation.html']) expect((await request.get(origin + route)).status()).toBe(404)
  const connections = await (await request.get(origin + '/patterns/')).text()
  expect(connections).toContain('conceptual starting questions')
  expect(connections).not.toContain('/investigations/claims-operations/')
  const html = await (await request.get(origin + '/')).text()
  expect(html).not.toMatch(/18%|7\.6%|increased wait before payment|approvedByHuman/)
  expect(await readFile('dist/sitemap.xml', 'utf8')).not.toContain('/system/')
})

test('new homepage header condenses without obstructing the reading path', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage(); await page.goto(origin + '/')
    const header = page.locator('.pc-header')
    await expect(header).toHaveAttribute('data-measured', 'true')
    const fullHeight = (await header.boundingBox())!.height
    await page.evaluate(() => scrollTo(0, 700)); await expect(header).toHaveAttribute('data-compact', 'true')
    expect((await header.boundingBox())!.height).toBeLessThan(fullHeight)
    expect((await header.boundingBox())!.y).toBe(0)
  } finally { await context.close() }
})

test('enlarged enhanced specimen preserves whole control words and skip targets clear the header', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 800 }, hasTouch: true, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage(); await page.goto(origin + '/system/')
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%' })
    const radio = page.getByRole('radio', { name: 'Observatory surface', exact: true })
    await expect(radio).toBeVisible()
    const fragments = await radio.locator('..').evaluate(label => {
      const text = [...label.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.textContent?.startsWith('Observatory'))!
      const range = document.createRange(); range.setStart(text, 0); range.setEnd(text, 'Observatory'.length)
      return range.getClientRects().length
    })
    expect(fragments).toBe(1)
    await radio.check(); await expect(radio).toBeChecked()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.setViewportSize({ width: 1440, height: 950 }); await page.goto(origin + '/practice/')
    await expect(page.locator('.pc-header')).toHaveAttribute('data-measured', 'true')
    await page.getByRole('link', { name: 'Skip to main content', exact: true }).focus(); await page.keyboard.press('Enter')
    await expect(page.locator('#content')).toBeFocused()
    const header = (await page.locator('.pc-header').boundingBox())!, crumb = (await page.locator('.pc-breadcrumb').boundingBox())!
    expect(crumb.y).toBeGreaterThanOrEqual(header.y + header.height)
    await page.goto(origin + '/')
    await expect(page.locator('.pc-contact .pc-external-arrow')).toHaveCount(2)
  } finally { await context.close() }
})
