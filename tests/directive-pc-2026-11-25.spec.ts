import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { capabilities, caseCapabilities, methodFamilies, researchAgenda } from '../src/content/capabilities'

/** recognition, capability discovery, engagement and honest contact. */
const origin = 'http://127.0.0.1:4175'
const published = ['claims-operations', 'brand-research', 'enterprise-ai', 'telematics', 'civic-service', 'accessibility-ai', 'operational-friction', 'knowledge-binder', 'knowledge-publishing']

test('the capability registry covers every published case, and every capability and method points at published work', () => {
  expect(Object.keys(caseCapabilities).sort()).toEqual([...published].sort())
  for (const capability of capabilities) expect(published.some(slug => caseCapabilities[slug].includes(capability.id)), capability.id).toBe(true)
  for (const family of methodFamilies) for (const method of family.methods) for (const slug of method.slugs) expect(published).toContain(slug)
  for (const item of researchAgenda) for (const slug of item.slugs) expect(published).toContain(slug)
})

test('without JavaScript, Work lists all nine cases with problem, my part and what changed, plus a by-capability index', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/investigations/?capability=measurement`)
    await expect(page.locator('.reading-cards > li')).toHaveCount(9)
    await expect(page.locator('.reading-filter')).toHaveCount(0)
    await expect(page.locator('.reading-card-brief').first()).toContainText('My part')
    await expect(page.getByRole('heading', { name: 'The work, by capability' })).toBeVisible()
  } finally { await context.close() }
})

test('the capability filter is optional, keyboard operable, announces its count and keeps state in the address', async ({ page }) => {
  await page.goto(`${origin}/investigations/`)
  await expect(page.locator('.reading-cards > li')).toHaveCount(9)
  const filter = page.getByRole('group', { name: /Show work by capability/ })
  await filter.getByRole('button', { name: /Responsible AI/ }).focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\?capability=responsible-ai$/)
  await expect(page.locator('.reading-cards > li')).toHaveCount(2)
  await expect(page.getByRole('status')).toContainText('Showing 2 of 9 case studies: Responsible AI.')
  await expect(filter.getByRole('button', { name: /Responsible AI/ })).toHaveAttribute('aria-pressed', 'true')
  await filter.getByRole('button', { name: /All work/ }).click()
  await expect(page.locator('.reading-cards > li')).toHaveCount(9)
  await page.goto(`${origin}/investigations/?capability=knowledge-systems`)
  await expect(page.locator('.reading-cards > li')).toHaveCount(4)
})

test('the homepage orients first: identity, tagline, explore and work-with-me actions, capabilities and three pathways', async () => {
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain('Increasing understanding, effectiveness, and adaptability in complex systems.')
  expect(home).toMatch(/href="\/investigations\/"[^>]*>Explore the work/)
  expect(home).toContain('>Work with me')
  for (const capability of capabilities) expect(home).toContain(`href="/investigations/?capability=${capability.id}"`)
  for (const reason of ['employment', 'organization', 'research']) expect(home).toContain(`href="/contact/?reason=${reason}"`)
  // No résumé link until an approved file exists.
  expect(home).not.toContain('View my résumé')
})

test('Contact asks why, adapts its prompt, says it prepares an email, never claims delivery, and links to About', async ({ page }) => {
  await page.goto(`${origin}/contact/?reason=teaching`)
  const reason = page.getByLabel('What brings you here?')
  await expect(reason).toHaveValue('teaching')
  await expect(page.getByLabel('What would you like to explore together?')).toBeVisible()
  await reason.selectOption('employment')
  await expect(page.getByLabel('Tell me about the role or initiative.')).toBeVisible()
  await expect(page.getByRole('button', { name: /Prepare email/ })).toBeVisible()
  await expect(page.getByText('Nothing is sent from this page.')).toBeVisible()
  await expect(page.locator('.pc-career')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Career history and education/ })).toHaveAttribute('href', '/about/')
  const html = await readFile('dist/contact/index.html', 'utf8')
  expect(html).not.toMatch(/download the résumé|message (?:was )?sent|successfully sent/i)
})

test('About gives titles as held, education, and a résumé request, without naming employers', async () => {
  const about = await readFile('dist/about/index.html', 'utf8')
  for (const role of ['Publishing Specialist (six-month contract loan-in)', 'Service Chat Specialist', 'UX Designer', 'Small Business Consultant']) expect(about).toContain(role)
  expect(about).toContain('BA, Interdisciplinary Design')
  expect(about).toContain('Iowa State University')
  expect(about).toContain('Request the résumé')
  expect(about).toContain('one of 12, from more than 66,000 employees')
  expect(about).not.toContain('Claims Administrative Support Specialist')
})

test('every case ends with capability-grouped next steps, the method and a way to discuss a similar question', async () => {
  const html = await readFile('dist/investigations/knowledge-binder/index.html', 'utf8')
  expect(html).toContain('Where to go next')
  expect(html).toContain('href="/investigations/?capability=knowledge-systems"')
  expect(html).toContain('href="/contact/?reason=organization"')
})

test('Practice lists methods with the cases that show them, and a research agenda', async () => {
  const practice = await readFile('dist/practice/index.html', 'utf8')
  expect(practice).toContain('Each method links to the')
  expect(practice).toContain('Exception analysis')
  expect(practice).toContain('Questions I keep')
  for (const item of researchAgenda) expect(practice).toContain(item.theme)
})

test('source popovers are valid inside paragraphs, so case pages hydrate without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.goto(`${origin}/investigations/claims-operations/`, { waitUntil: 'networkidle' })
  expect(errors.filter(error => /#418|#425|hydrat/i.test(error))).toEqual([])
  expect(await readFile('dist/investigations/claims-operations/index.html', 'utf8')).not.toMatch(/<div id="glance-source-1"/)
})
