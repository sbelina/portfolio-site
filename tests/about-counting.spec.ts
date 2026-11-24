import { expect, test } from '@playwright/test'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { handleCount, type CountStore } from '../worker/count'
import { countEvents as clientEvents } from '../src/analytics'
import { countEvents as workerEvents } from '../worker/count'

// About, the career thread and anonymous counting (owner direction, 24 November 2026).
const origin = 'http://127.0.0.1:4175'

test('the count endpoint stores only event, page and short detail, and only on the live site', async () => {
  const rows: Parameters<CountStore['writeDataPoint']>[0][] = []
  const store: CountStore = { writeDataPoint: point => { rows.push(point) } }
  const post = (host: string, body: unknown, headers: Record<string, string> = {}) => handleCount(new Request(`https://${host}/api/count`, { method: 'POST', body: JSON.stringify(body), headers: { 'CF-Connecting-IP': '203.0.113.9', 'User-Agent': 'Example/1.0', ...headers } }), store)
  expect((await handleCount(new Request('https://producingcuriosity.com/api/count'), store)).status).toBe(405)
  expect((await post('claude-preview.workers.dev', { e: 'view', p: '/' })).status).toBe(204)
  expect((await post('producingcuriosity.com', { e: 'not-an-event', p: '/' })).status).toBe(400)
  expect((await post('producingcuriosity.com', { e: 'view', p: '/' }, { DNT: '1' })).status).toBe(204)
  expect((await post('producingcuriosity.com', { e: 'view', p: '/' }, { 'Sec-GPC': '1' })).status).toBe(204)
  expect(rows).toHaveLength(0)
  expect((await post('producingcuriosity.com', { e: 'field-split', p: '/', d: 'claims-operations same<script>' })).status).toBe(204)
  expect(rows).toEqual([{ indexes: ['field-split'], blobs: ['field-split', '/', 'claims-operations samescript'], doubles: [1] }])
  // Nothing about the person reaches storage.
  expect(JSON.stringify(rows)).not.toMatch(/203\.0\.113\.9|Example\/1\.0/)
  // Client and Worker agree on the events that exist.
  expect([...workerEvents].sort()).toEqual([...clientEvents].sort())
})

test('off the live site nothing is sent; the opt-out, notice and toast work and say what they are for', async ({ page }) => {
  const sent: string[] = []
  await page.route('**/api/count', route => { sent.push(route.request().postData() ?? ''); return route.fulfill({ status: 204 }) })
  await page.goto(`${origin}/about/?count=off`)
  await expect(page).toHaveURL(`${origin}/about/`)
  await expect(page.getByRole('status').filter({ hasText: 'This browser won’t be counted.' })).toBeVisible()
  const card = page.locator('#counting')
  await expect(card.locator('.pc-counting-status')).toHaveText('You chose not to be counted in this browser.')
  await card.getByRole('button', { name: 'Count me again' }).click()
  await expect(card.locator('.pc-counting-status')).toHaveText('This is a preview, so nothing is counted here.')
  await page.evaluate(() => (window as Window & { pcShowCountingNotice?: () => void }).pcShowCountingNotice?.())
  const notice = page.getByRole('complementary', { name: 'What this site counts' })
  await expect(notice).toContainText('never who uses them')
  await expect(notice.getByRole('link', { name: 'What’s counted' })).toHaveAttribute('href', '/about/#counting')
  await notice.getByRole('button', { name: 'Don’t count me' }).click()
  await expect(notice).toHaveCount(0)
  await expect(page.getByRole('status').filter({ hasText: 'You won’t be counted in this browser.' })).toBeVisible()
  await expect(card.locator('.pc-counting-status')).toHaveText('You chose not to be counted in this browser.')
  expect(sent).toEqual([])
})

test('a browser that asks not to be tracked is told nothing is counted', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'globalPrivacyControl', { value: true }))
  await page.goto(`${origin}/about/`)
  await expect(page.locator('#counting .pc-counting-status')).toHaveText('Your browser asks sites not to track, so nothing is counted for you.')
  await expect(page.locator('#counting').getByRole('button')).toHaveCount(0)
})

test('About and Contact carry the career thread in place of a résumé, with proof links and a résumé request', async ({ browser, page }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const plain = await context.newPage()
    await plain.goto(`${origin}/about/`)
    const thread = plain.getByRole('region', { name: 'From interfaces to the systems behind them.' })
    await expect(thread.locator('.pc-career-static > li')).toHaveCount(4)
    for (const href of await thread.locator('a[href^="/investigations/"]').evaluateAll(links => [...new Set(links.map(link => link.getAttribute('href')!))])) expect((await plain.request.get(`${origin}${href}`)).status(), href).toBe(200)
    await expect(thread.getByRole('link', { name: 'Request the full résumé' }).first()).toHaveAttribute('href', /^mailto:[^?]+\?subject=R%C3%A9sum%C3%A9%20request$/)
    await plain.goto(`${origin}/contact/`)
    await expect(plain.locator('.pc-contact-form')).toBeVisible()
    await expect(plain.locator('.pc-career')).toBeVisible()
  } finally { await context.close() }
  await page.goto(`${origin}/about/`)
  await page.getByRole('radio', { name: /Next/ }).check()
  await expect(page.locator('.pc-career-panel')).toContainText('Bring me the problem your organization keeps paying to fix.')
  await expect(page.locator('.pc-career-panel').getByRole('link', { name: /Start a conversation/ })).toHaveAttribute('href', '/contact/')
  await expect(page.getByRole('navigation', { name: 'Primary navigation', exact: true }).getByRole('link', { name: 'About' })).toHaveAttribute('aria-current', 'page')
})

test('employers are described by their field, not named, in the public output', async () => {
  // The names to keep out are read from an environment variable (never written into this public file).
  const names = (process.env.PC_UNNAMED_EMPLOYERS ?? '').split(',').map(name => name.trim()).filter(Boolean)
  test.skip(!names.length, 'Set PC_UNNAMED_EMPLOYERS to run this check')
  const walk = async (dir: string): Promise<string[]> => (await Promise.all((await readdir(dir, { withFileTypes: true })).map(entry => entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]))).flat()
  for (const file of (await walk('dist')).filter(file => /\.(html|js|json)$/.test(file))) {
    const text = (await readFile(file, 'utf8')).toLowerCase()
    for (const name of names) expect(text.includes(name.toLowerCase()), `${name} in ${file}`).toBe(false)
  }
})
