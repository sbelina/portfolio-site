import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile, readdir } from 'node:fs/promises'
import { fixtureProjection } from './fixtures/reading-content'
import { workflowFixture } from './fixtures/workflow-content'
import { readingPageData } from '../src/reading/page-data'
import { entrySchema } from '../src/content/model'

const route = '/investigations/fixture-checkpoint-study/'
test('case initial HTML contains the whole account, stable chapters and both sequences', async ({ request }) => {
  const response = await request.get(route)
  expect(response.status()).toBe(200)
  const html = await response.text()
  for (const text of ['Fixture: a lending-desk checkpoint', 'Development fixture', 'Earlier verification', 'Late verification', 'Responsible actor', 'Information available', 'If a defect is discovered here', 'What this does not establish']) expect(html).toContain(text)
  expect(html).toContain('data-edition="current"')
  expect(html).toContain('id="collective-understanding"')
  expect(html).toContain('id="evidence-review"')
  expect((await request.get('http://127.0.0.1:4175/investigations/claims-operations/')).status()).toBe(404)
  expect((await request.get('/investigations/missing-checkpoint/')).status()).toBe(404)
})

test('one native keyboard action changes sequence without JavaScript or focus displacement', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage(); await page.goto(route)
    const after = page.getByRole('radio', { name: 'Earlier verification', exact: true })
    const before = page.getByRole('radio', { name: 'Late verification', exact: true })
    await expect(after).toBeChecked()
    await expect(page.locator('.workflow-state--after')).toBeVisible()
    await expect(page.locator('.workflow-state--before')).toBeHidden()
    const source = page.locator('.workflow-state--after .case-source-references summary').first()
    await source.focus(); await page.keyboard.press('Enter')
    await expect(page.getByText('Fictional note before the sending handoff', { exact: true })).toBeVisible()
    await page.keyboard.press('Space'); await expect(source).toBeFocused()
    await after.focus(); await page.keyboard.press('ArrowRight')
    await expect(before).toBeChecked(); await expect(before).toBeFocused()
    await expect(page.locator('.workflow-state--before')).toBeVisible()
    await expect(page.locator('.workflow-state--after')).toBeHidden()
    await expect(page.locator('.workflow-state--before [data-checkpoint="true"]')).toContainText('Receiver')
    // The details affordance may include its artifact name; its semantic parent
    // is inspected below rather than relying on a presentation-only label.
    const disclosure = page.locator('.artifact-inspector details').first()
    await disclosure.locator('summary').focus(); await page.keyboard.press('Enter')
    await expect(disclosure).toHaveAttribute('open', '')
    await expect(disclosure).toContainText('Illustrative reconstruction')
    const known = page.locator('.evidence-inspector details').first()
    await expect(page.locator('.evidence-inspector .case-block-limitation').first()).toBeVisible()
    await known.locator(':scope > summary').focus(); await page.keyboard.press('Enter')
    await expect(known).toContainText('Invented lending-desk script.')
    await page.keyboard.press('Space'); await expect(known.locator(':scope > summary')).toBeFocused()
    await page.locator('.case-chapters > summary').focus(); await page.keyboard.press('Enter')
    await page.getByRole('link', { name: 'Collective understanding', exact: true }).click()
    await expect(page).toHaveURL(/#collective-understanding$/)
    expect(await page.locator('#collective-understanding').evaluate(element => element.getBoundingClientRect().top)).toBeGreaterThanOrEqual(0)
  } finally { await context.close() }
})

test('touch, narrow enlarged reading and reduced motion preserve the useful result', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, hasTouch: true, isMobile: true, viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage(); const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
    await page.goto(route)
    await page.locator('.workflow-choice-label').filter({ hasText: 'Late verification' }).tap()
    await expect(page.getByRole('radio', { name: 'Late verification', exact: true })).toBeChecked()
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%'
      const style = document.createElement('style'); style.textContent = '.reading-article p,.reading-article li { line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important }'; document.head.append(style)
    })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const stages = page.locator('.workflow-state--before .workflow-stage')
    expect(await stages.nth(1).evaluate((element, first) => element.getBoundingClientRect().top > Number(first), await stages.first().evaluate(element => element.getBoundingClientRect().top))).toBe(true)
    expect(errors).toEqual([])
    const capture = await page.screenshot({ path: test.info().outputPath('synthetic-case-320.png'), fullPage: true })
    await test.info().attach('Synthetic case at narrow enlarged text', { body: capture, contentType: 'image/png' })
  } finally { await context.close() }
})

test('case fixture has accessible controls, restrained tokens and a readable CSS-failure fallback', async ({ page, browser, baseURL }) => {
  await page.goto(route)
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([])
  const capture = await page.screenshot({ path: test.info().outputPath('synthetic-case-desktop.png'), fullPage: true })
  await test.info().attach('Synthetic case desktop', { body: capture, contentType: 'image/png' })
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false })
  try {
    const noStyle = await context.newPage(); await noStyle.route('**/*.css', request => request.abort()); await noStyle.goto(route)
    await expect(noStyle.locator('.workflow-state--after')).toBeVisible()
    await expect(noStyle.locator('.workflow-state--before')).toBeVisible()
  } finally { await context.close() }
})

test('case article payload excludes unrelated bodies and source collections', () => {
  const projection = structuredClone(fixtureProjection()); const entry = projection.entries.find(item => item.id === workflowFixture().id)!
  const before = readingPageData(projection, 'entry', true, entry.id)
  projection.entries.push({ ...entry, id: 'a2c20000-0000-4000-8000-000000000001', path: '/investigations/unrelated-case/', slug: 'unrelated-case', blocks: [{ id: 'a2c20000-0000-4000-8000-000000000002', type: 'prose', markdown: 'UNRELATED_CASE_BODY_MARKER_11NOV' }] })
  expect(readingPageData(projection, 'entry', true, entry.id)).toEqual(before)
  expect(JSON.stringify(before)).not.toContain('UNRELATED_CASE_BODY_MARKER_11NOV')
})

test('authored chapter anchors cannot steal workflow control or inspector identifiers', () => {
  const entry = workflowFixture(); const block = entry.blocks.find(item => item.type === 'workflow_comparison')!
  const first = entry.blocks[0]
  expect(first.type).toBe('prose')
  if (first.type !== 'prose') throw new Error('Expected narrative fixture')
  first.anchor = `workflow-${block.id}-after`
  expect(entrySchema.safeParse(entry).success).toBe(false)
})

test('new fixture remains excluded from production indexes and route output', async () => {
  expect(await readFile('dist/public-content.json', 'utf8')).not.toContain('CHECKPOINT_FIXTURE_11NOV')
  const manifest = await readFile('dist/route-manifest.json', 'utf8')
  expect(manifest).not.toContain('fixture-checkpoint-study')
  expect(JSON.parse(await readFile('content/public-release.json', 'utf8')).status).toBe('no-approved-content')
  const scripts = (await readdir('dist/assets')).filter(file => /^reading-.*\.js$/.test(file))
  expect(scripts.length).toBeGreaterThan(0)
  for (const file of scripts) expect(await readFile(`dist/assets/${file}`, 'utf8')).not.toContain('Duplicate stage identity within workflow view')
})
