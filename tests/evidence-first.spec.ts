import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { claimsInvestigationId, primaryEvidenceHref } from '../src/content/primary-evidence'
import { forbiddenPublicMarkers } from '../scripts/audit-public'
import { digestRecord } from '../src/content/projection'

const origin = 'http://127.0.0.1:4175'
// Owner decision, 23 November (second): lead with the institutional value.
const h1 = 'I help organizations avoid costly solutions to misunderstood problems.'
const h1Markup = 'I help organizations avoid <strong class="pc-weight">costly solutions</strong> to <em class="pc-accent">misunderstood problems</em>.'
const claimsPath = '/investigations/claims-operations/'
const candidateCanary = 'CLAIMS_CANDIDATE_UNAPPROVED_16NOV'
const entry = (id: string, slug: string) => ({ id, slug, path: `/investigations/${slug}/`, title: slug, summary: `${slug} summary` })

test('the evidence path prefers approved Claims, then any approved investigation, then the collection', () => {
  const other = entry('00000000-0000-4000-8000-000000000001', 'other-case')
  const claims = entry(claimsInvestigationId, 'claims-operations')
  expect(primaryEvidenceHref([other, claims])).toBe(claims.path)
  expect(primaryEvidenceHref([other])).toBe(other.path)
  expect(primaryEvidenceHref([])).toBe('/investigations/')
})

test('production home leads with institutional value and a one-click path to a real investigation', async () => {
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain(h1Markup)
  expect(home).not.toContain('I diagnose gaps in understanding and design the conditions')
  expect(home).not.toContain('data-evidence-status="previous-edition"')
  expect(home).not.toContain('/builds/')
  expect(home).toContain(`href="${claimsPath}"`)
  expect(home.toLowerCase()).not.toContain('collective agency')
  for (const kept of ['Test. Show. Enable.', 'Related. Not equivalent.', 'How I Know']) expect(home).toContain(kept)
  // One call to action, written for a decision-maker, with a primary action to the Contact page.
  expect(home.match(/class="pc-cta-primary"/g)).toHaveLength(1)
  expect(home).toContain('href="/contact/"')
  expect(home).toContain('href="mailto:hello@sbelina.com"')
  expect(home).not.toContain('Download résumé')
  const reading = JSON.parse(home.match(/<script id="home-reading" type="application\/json">(.*?)<\/script>/)![1])
  expect(reading.entries).toHaveLength(6)
})

test('the investigations collection pairs each public version with its deep dive', async () => {
  const html = await readFile('dist/investigations/index.html', 'utf8')
  expect(html).toContain('class="reading-cards"')
  for (const slug of ['claims-operations', 'brand-research', 'enterprise-ai', 'telematics', 'civic-service', 'accessibility-ai']) {
    expect(html).toContain(`href="/investigations/${slug}/"`)
    expect(html).toContain(`href="/deep-dive/${slug}/"`)
  }
  expect(html).not.toContain('/builds/')
})

test('the release is bound to exact digests, and the unapproved candidate stays guarded', async () => {
  expect(forbiddenPublicMarkers).toContain(candidateCanary)
  const candidate = await readFile('docs/codex/review-candidates/claims-operations-publication-candidate.md', 'utf8')
  expect(candidate).toContain(candidateCanary)
  expect(candidate).not.toMatch(/18\s*%?\s*(?:→|->|to)\s*7\.6/)
  const release = JSON.parse(await readFile('content/public-release.json', 'utf8'))
  expect(release.status).toBe('approved')
  expect(release.approval.candidateDigest).toBe(digestRecord(release.manifest))
  expect(release.approval.approvedBy).toContain('merging the pull request')
  const { releaseStore } = await import('../content/release/cases')
  for (const record of releaseStore.entries) expect(release.manifest.entries).toContainEqual({ id: record.id, revision: record.revision, digest: digestRecord(record) })
  // The public output carries none of the candidate's unapproved scaffolding.
  expect(await readFile('dist/public-content.json', 'utf8')).not.toContain(candidateCanary)
})

test('one click reaches the Claims investigation from the first screen, by keyboard, without JavaScript', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, javaScriptEnabled: false, reducedMotion: 'reduce' })
    try {
      const page = await context.newPage()
      await page.goto(`${origin}/`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1)
      const action = page.locator('.pc-hero').getByRole('link', { name: 'Read the insurance operations case study' })
      await expect(action).toHaveAttribute('href', claimsPath)
      const bounds = await action.boundingBox()
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
      await action.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(`${origin}${claimsPath}`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText('“Complete” now means verified.')
    } finally { await context.close() }
  }
})

test('Related. Not equivalent. is a field to explore: predict, then split, with a complete static baseline', async ({ browser }) => {
  const staticContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false })
  try {
    const page = await staticContext.newPage()
    await page.goto(`${origin}/`)
    // At rest every point is already split and every pair is listed as text.
    await expect(page.locator('.pc-field-star[data-split]')).toHaveCount(6)
    await expect(page.locator('.pc-field-text li')).toHaveCount(6)
    await expect(page.locator('.pc-field-points')).toHaveCount(0)
  } finally { await staticContext.close() }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${origin}/`)
    const field = page.locator('.pc-field')
    await expect(field.locator('.pc-field-star[data-split]')).toHaveCount(0)
    const point = field.getByRole('button', { name: /Insurance operations: Delivered and Verified/ })
    await point.focus(); await page.keyboard.press('Enter')
    await expect(point).toHaveAttribute('aria-pressed', 'true')
    await expect(field.locator('.pc-field-panel')).toContainText('The same thing?')
    await field.getByRole('button', { name: 'The same', exact: true }).click()
    await expect(field.locator('.pc-field-panel')).toContainText('That is the assumption this case study began with.')
    await expect(field.locator('.pc-field-star[data-split]')).toHaveCount(1)
    await expect(field.getByRole('link', { name: /Read the case study/ })).toHaveAttribute('href', '/investigations/claims-operations/')
    await field.getByRole('button', { name: 'Split them all' }).click()
    await expect(field.locator('.pc-field-star[data-split]')).toHaveCount(6)
    await expect(field.locator('.pc-field-panel')).toContainText('Six settings, one pattern')
    await expect(field.locator('.pc-field-sky')).toHaveAttribute('aria-hidden', 'true')
    expect(errors).toEqual([])
  } finally { await context.close() }
})
