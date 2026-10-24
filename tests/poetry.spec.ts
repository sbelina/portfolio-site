import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { entrySchema } from '../src/content/model'
import { fixtureProjection, fixtureStore, syntheticVerse } from './fixtures/reading-content'

const poemPath = '/perspective/fixture-verse-spacing/'
const verseAnchor = '#block-80000000-0000-4000-8000-000000000001'

test('poetry has an explicit format and literal verse, without requiring case contribution', () => {
  const poem = fixtureStore.entries.find(entry => entry.format === 'poetry')!
  expect(entrySchema.parse(poem).contribution).toBeUndefined()
  const projected = fixtureProjection().entries.find(entry => entry.id === poem.id)!
  expect(projected.format).toBe('poetry')
  expect(projected.blocks).toEqual([{ id: '80000000-0000-4000-8000-000000000001', type: 'verse', text: syntheticVerse }])
  expect(entrySchema.safeParse({ ...poem, blocks: [] }).success).toBe(false)
  for (const format of ['case', 'essay', 'field_note'] as const) {
    expect(entrySchema.safeParse({ ...poem, format, contribution: 'Synthetic contribution.' }).success).toBe(true)
    expect(entrySchema.safeParse({ ...poem, format, contribution: undefined }).success).toBe(false)
  }
})

test('poetry initial HTML preserves whitespace and renders markup as safe literal text', async ({ page, request }) => {
  const response = await request.get(poemPath)
  expect(response.status()).toBe(200)
  const html = await response.text()
  expect(html).toContain('&lt;script&gt;window.poetryExecuted = true&lt;/script&gt;')
  expect(html).not.toContain('<script>window.poetryExecuted')
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(poemPath)
  expect(await page.locator('.reading-verse').textContent()).toBe(syntheticVerse)
  expect(await page.evaluate(() => 'poetryExecuted' in window)).toBe(false)
  await expect(page.locator('.reading-verse script')).toHaveCount(0)
  await expect(page.locator('.reading-contribution, .reading-extra-evidence')).toHaveCount(0)
  await expect(page.getByRole('region', { name: 'Producing Curiosity introduction' })).toHaveCount(0)
  expect(errors).toEqual([])
})

test('poetry remains readable and navigable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`http://127.0.0.1:4174${poemPath}`)
    expect(await page.locator('.reading-verse').textContent()).toBe(syntheticVerse)
    await page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Verse 1' }).click()
    await expect(page).toHaveURL(new RegExp(`${verseAnchor}$`))
    await expect(page.locator('.reading-verse')).toBeInViewport()
  } finally { await context.close() }
})

test('poetry supports keyboard links, narrow reflow, enlarged text and reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(poemPath)
  const verseLink = page.getByRole('navigation', { name: 'On this page' }).getByRole('link', { name: 'Verse 1' })
  await verseLink.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(new RegExp(`${verseAnchor}$`))
  expect(await page.locator('.reading-verse').evaluate(element => getComputedStyle(element).whiteSpace)).toBe('pre-wrap')
  await page.addStyleTag({ content: 'html { font-size: 200%; } * { letter-spacing: .12em !important; word-spacing: .16em !important; }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  expect(await page.locator('.reading-verse').textContent()).toBe(syntheticVerse)
  expect(await page.locator('.reading-verse').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
  await page.screenshot({ path: 'test-results/poetry-320-enlarged.png', fullPage: true })
})

test('poetry reading passes automated accessibility scan', async ({ page }) => {
  await page.goto(poemPath)
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(result.violations).toEqual([])
})
