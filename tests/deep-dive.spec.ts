import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { sessionToken, validSession, verifyPassword } from '../worker/deep-dive'
import { parseDeepDive } from '../scripts/deep-dive-parse'

// Password-protected deep dives (docs/codex/DEEP-DIVE.md). 4175 is the production configuration
// (no store, no secrets); 4176 adds a local store and synthetic credentials.
const production = 'http://127.0.0.1:4175'
const wall = 'http://127.0.0.1:4176'
const password = 'synthetic-deep-dive-test-password'
const fixture = '/deep-dive/claims-operations/'

test('production configuration keeps deep dives closed and private-by-default', async ({ request }) => {
  for (const path of ['/deep-dive/', fixture, '/deep-dive/_shell/']) {
    const response = await request.get(`${production}${path}`)
    expect(response.status(), path).toBe(200)
    expect(await response.text()).toContain('Deep dives are not open yet.')
    expect(response.headers()['cache-control']).toBe('private, no-store')
    expect(response.headers()['x-robots-tag']).toContain('noindex')
  }
  // Ordinary pages are untouched by the Worker.
  expect((await request.get(`${production}/practice/`)).status()).toBe(200)
  expect((await request.get(`${production}/no-such-page/`)).status()).toBe(404)
  // No deep-dive route, shell marker or fixture content is listed or indexed publicly.
  expect(await readFile('dist/sitemap.xml', 'utf8')).not.toContain('deep-dive')
})

test('the wall refuses without a valid session, rejects wrong passwords and never redirects off-site', async ({ request }) => {
  const anonymous = await request.get(`${wall}${fixture}`)
  expect(anonymous.status()).toBe(401)
  const body = await anonymous.text()
  expect(body).toContain('Open the deep dive')
  expect(body).not.toContain('[Placeholder]')
  expect((await request.get(`${wall}/deep-dive/_shell/`)).status()).toBe(404)
  const wrong = await request.post(`${wall}/deep-dive/login`, { form: { password: 'not-the-password', next: fixture }, maxRedirects: 0 })
  expect(wrong.status()).toBe(401)
  expect(await wrong.text()).toContain('That password did not work.')
  const offsite = await request.post(`${wall}/deep-dive/login`, { form: { password, next: 'https://evil.example/' }, maxRedirects: 0 })
  expect(offsite.status()).toBe(303)
  expect(offsite.headers()['location']).toBe('/deep-dive/')
  const forged = await request.get(`${wall}${fixture}`, { headers: { Cookie: 'pc_deep_dive=99999999999999.forged' } })
  expect(forged.status()).toBe(401)
  const wrongType = await request.post(`${wall}/deep-dive/login`, { data: { password }, maxRedirects: 0 })
  expect(wrongType.status()).toBe(400)
})

test('one password opens every deep dive: hub, spreads in the deck grammar, and question links between cases', async ({ page }) => {
  await page.goto(`${wall}${fixture}`)
  await expect(page.getByRole('heading', { level: 1, name: 'Open the deep dive' })).toBeVisible()
  await page.getByLabel('Password').fill(password)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(`${wall}${fixture}`)
  // Claims: three spreads, each with kicker, accent headline, the label, evidence, figure, role, change and trade-off.
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Claims operations: when “complete” still generated work')
  const spreads = page.locator('.deep-dive-spread')
  await expect(spreads).toHaveCount(3)
  await expect(spreads.first().locator('.deep-dive-headline em')).toHaveText('Timing')
  for (const label of ['The label', 'What the evidence showed', 'My role', 'What changed']) await expect(spreads.first().getByRole('heading', { level: 3, name: label })).toBeVisible()
  await expect(spreads.first().locator('figcaption')).toHaveText('FIG. 02 · Conceptual illustration · positions illustrative')
  await expect(spreads.first().locator('.deep-dive-tradeoff')).toContainText('Trade-off:')
  await expect(spreads.first().locator('.deep-dive-count')).toHaveText('01 / 03')
  await expect(page.getByRole('navigation', { name: 'Parts of this deep dive' }).getByRole('link')).toHaveCount(3)
  // The last part's question leads to the next deep dive, with no second password.
  await spreads.last().getByRole('link', { name: /Can it change a measure\?/ }).click()
  await expect(page).toHaveURL(`${wall}/deep-dive/trust-research/`)
  await expect(page.locator('.deep-dive-headline em')).toHaveText('separate')
  await page.getByRole('link', { name: /What about 38 ideas\?/ }).click()
  await expect(page).toHaveURL(`${wall}/deep-dive/ai-challenge/`)
  await expect(page.locator('.deep-dive-headline em')).toHaveText('8')
  // The hub lists all three in order, each linked to its public version.
  await page.goto(`${wall}/deep-dive/`)
  const hub = page.locator('.deep-dive-hub > li')
  await expect(hub).toHaveCount(3)
  await expect(hub.nth(0).locator('h2 a')).toHaveAttribute('href', fixture)
  await expect(hub.nth(0)).toContainText('3 parts')
  await expect(hub.nth(1).getByRole('link', { name: 'Public version' })).toHaveAttribute('href', '/investigations/trust-research/')
  // Signing out closes all of them at once.
  await page.getByRole('button', { name: 'Sign out of deep dives' }).click()
  for (const path of [fixture, '/deep-dive/trust-research/', '/deep-dive/ai-challenge/']) {
    await page.goto(`${wall}${path}`)
    await expect(page.getByRole('heading', { level: 1, name: 'Open the deep dive' }), path).toBeVisible()
  }
})

test('the parser turns the deck-grammar Markdown into parts, fields, figures and accent headlines', async () => {
  const markdown = await readFile('tests/fixtures/deep-dives/claims-operations.md', 'utf8')
  const record = parseDeepDive(markdown, { title: 'T', kicker: 'Case 01' })
  expect(record.parts.map(part => part.headline)).toEqual(['Errors repeated. <em>Timing</em> was the problem.', '“Complete” now means <em>verified</em>.', 'What admins knew became <em>teachable</em>.'])
  expect(record.parts[0]).toMatchObject({ kicker: 'Field · Case 01, 1 of 3 · Test — Diagnosing a cross-department failure', next: 'So what changed?', figure: { label: 'FIG. 02 · Conceptual illustration · positions illustrative' } })
  for (const field of ['label', 'evidence', 'role', 'changed', 'tradeoff'] as const) expect(record.parts[0][field]).toContain('[Placeholder]')
  expect(record.intro).toContain('Dummy deep dive')
  expect(JSON.stringify(record)).not.toContain('DEEP_DIVE_FIXTURE_22NOV')
  expect(() => parseDeepDive('no parts here', { title: 'T' })).toThrow('at least one part')
})

test('password hashes and session tokens verify only what they should', async () => {
  const stored = 'pbkdf2-sha256$100000$7e57d1fe7e57d1fe7e57d1fe7e57d1fe$8245a5bdb6354e08a063d956d4f531ec7bf006703b34369c674498e6d65e61d7'
  expect(await verifyPassword(password, stored)).toBe(true)
  expect(await verifyPassword('wrong', stored)).toBe(false)
  expect(await verifyPassword(password, 'md5$1$aa$bb')).toBe(false)
  const token = await sessionToken('secret-a', stored, 1_000)
  expect(await validSession('secret-a', stored, token, 2_000)).toBe(true)
  expect(await validSession('secret-b', stored, token, 2_000)).toBe(false)
  // Changing the password signs everyone out.
  expect(await validSession('secret-a', 'pbkdf2-sha256$100000$00$11', token, 2_000)).toBe(false)
  expect(await validSession('secret-a', stored, token, 1_000 + 13 * 60 * 60 * 1000)).toBe(false)
})
