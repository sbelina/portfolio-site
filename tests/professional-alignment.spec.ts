import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import archive from '../content/build-archive.json' with { type: 'json' }
import { homeTitle, homeDescription } from '../scripts/seo'
import { professionalIdentity, recruiterContact } from '../src/content/recruiter'
import { representativeSummaries } from '../src/content/primary-evidence'

// 19 November professional alignment (docs/codex/NOV-19-PROFESSIONAL-ALIGNMENT.md).
const origin = 'http://127.0.0.1:4175'

test('identity is consistent across the homepage, title and description', async () => {
  expect(professionalIdentity).toBe('Applied Research & Innovation Strategist')
  expect(homeTitle).toBe(`Sami Belina — ${professionalIdentity}`)
  expect(homeDescription.toLowerCase()).toContain('applied research and innovation strategist')
  for (const term of ['research strategy', 'organizational effectiveness', 'service design', 'innovation']) expect(homeDescription).toContain(term)
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain(`<title>${homeTitle.replaceAll('&', '&amp;')}</title>`)
})

test('the first screen names Sami, the capability, the H1 and the evidence path', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, javaScriptEnabled: false })
    try {
      const page = await context.newPage()
      await page.goto(`${origin}/`)
      const identity = page.locator('.pc-hero .pc-identity')
      await expect(identity).toContainText('Sami Belina')
      await expect(identity).toContainText(professionalIdentity)
      for (const target of [identity, page.getByRole('heading', { level: 1 }), page.locator('.pc-hero').getByRole('link', { name: 'Read the Claims case summary' })]) {
        const box = (await target.boundingBox())!
        expect(box.y + box.height, `${viewport.width}px`).toBeLessThanOrEqual(viewport.height)
      }
      // The first link inside the hero goes to evidence, not to the Atlas or Observatory.
      expect(await page.locator('.pc-hero a').first().getAttribute('href')).toBe(`${archive.reviewPath}#claims-operations`)
    } finally { await context.close() }
  }
})

test('representative investigations are labelled summaries pointing at the frozen archive', async ({ page }) => {
  await page.goto(`${origin}/`)
  const section = page.getByRole('region', { name: 'Three questions, three kinds of evidence' })
  await expect(section).toContainText('the full investigations are not yet published')
  const links = section.getByRole('listitem').getByRole('link')
  await expect(links).toHaveCount(3)
  expect(await links.evaluateAll(items => items.map(item => item.getAttribute('href')))).toEqual(representativeSummaries.map(item => `${archive.reviewPath}#${item.anchor}`))
  await expect(section.getByText('Previous-edition summary · full case unpublished')).toHaveCount(3)
  // No figures appear in the preview: only archived titles and status labels.
  expect(await section.innerText()).not.toMatch(/\d+\s*%|\d{2,}\+/)
})

test('the purpose is stated as an intention, never as a result', async ({ page }) => {
  await page.goto(`${origin}/`)
  await expect(page.locator('.pc-purpose')).toHaveText(/longer aim .* an intention behind the work, not a measured result of it\./)
})

test('contact stays reachable; no résumé is linked until one is approved', async ({ page }) => {
  expect(recruiterContact.resumeHref).toBeNull()
  await page.goto(`${origin}/`)
  await expect(page.locator(`a[href="mailto:${recruiterContact.email}"]`).first()).toBeVisible()
  await expect(page.locator(`a[href="${recruiterContact.linkedin}"]`).first()).toBeVisible()
  expect(recruiterContact.linkedin).toMatch(/^https:\/\/www\.linkedin\.com\/in\/[a-z0-9-]+$/)
  await expect(page.getByText('Download résumé')).toHaveCount(0)
})

test('practice moves use the clarified definitions on the homepage and Practice page', async ({ page }) => {
  for (const route of ['/', '/practice/']) {
    await page.goto(`${origin}${route}`)
    const moves = page.locator('.pc-moves')
    await expect(moves).toContainText('assumptions, measures, and explanations')
    await expect(moves).toContainText('reasoning, evidence, and limitations inspectable')
    await expect(moves).toContainText('decide, adapt, and ask new questions')
  }
  await expect(page.getByRole('heading', { name: /Notice → Frame → Model → Test → Interrogate → Revise/ })).toBeVisible()
})

test('seven qualified distinctions each state difference, question, connection, evidence and limits without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/patterns/`)
    const headings = page.locator('.pc-distinction-list h2')
    await expect(headings).toHaveText(['Delivered ≠ complete', 'Agreement ≠ trust', 'Automation ≠ judgment', 'Usability ≠ retention', 'Compliance ≠ comprehension', 'Participation ≠ influence', 'Shared language ≠ shared understanding', 'Reuse ≠ demonstrated effectiveness'])
    for (const section of await page.locator('.pc-distinction-list section').all()) {
      await expect(section.locator('.pc-question')).toHaveCount(1)
      await section.locator('summary').click()
      for (const term of ['What connects them', 'Evidence status', 'Where it stops']) await expect(section.getByText(term, { exact: true })).toBeVisible()
    }
    // No distinction claims a case finding.
    await expect(page.locator('.pc-distinction-list')).not.toContainText(/\d+\s*%|SUS|NPS/)
  } finally { await context.close() }
})
