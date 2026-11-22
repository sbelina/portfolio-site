import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { sessionToken, validSession, verifyPassword } from '../worker/deep-dive'

// Password-protected deep dives (docs/codex/DEEP-DIVE.md). 4175 is the production configuration
// (no store, no secrets); 4176 adds a local store and synthetic credentials.
const production = 'http://127.0.0.1:4175'
const wall = 'http://127.0.0.1:4176'
const password = 'synthetic-deep-dive-test-password'
const fixture = '/deep-dive/fixture-deep-dive/'

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
  expect(body).not.toContain('invented test content')
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

test('a reader with the password opens the deep dive by keyboard, and can sign out', async ({ page }) => {
  await page.goto(`${wall}${fixture}`)
  await expect(page.getByRole('heading', { level: 1, name: 'Open the deep dive' })).toBeVisible()
  await page.getByLabel('Password').fill(password)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(`${wall}${fixture}`)
  await expect(page.getByRole('heading', { level: 1, name: 'Synthetic deep dive' })).toBeVisible()
  await expect(page.getByText('This is invented test content')).toBeVisible()
  await expect(page.getByRole('link', { name: '← The public version of this investigation' })).toHaveAttribute('href', '/investigations/fixture-deep-dive/')
  await page.goto(`${wall}/deep-dive/`)
  await expect(page.getByRole('link', { name: 'Synthetic deep dive' })).toHaveAttribute('href', fixture)
  await page.getByRole('button', { name: 'Sign out of deep dives' }).click()
  await page.goto(`${wall}${fixture}`)
  await expect(page.getByRole('heading', { level: 1, name: 'Open the deep dive' })).toBeVisible()
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
