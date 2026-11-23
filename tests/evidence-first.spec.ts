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
  expect(home.match(/class="pc-actions"/g)).toHaveLength(1)
  expect(home).toContain('hello@sbelina.com</span>')
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
      const action = page.locator('.pc-hero').getByRole('link', { name: 'Read the Claims investigation' })
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

test('homepage illustration is interactive by keyboard and pointer, with a complete static baseline', async ({ browser }) => {
  const staticContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false })
  try {
    const page = await staticContext.newPage()
    await page.goto(`${origin}/`)
    const figure = page.locator('.pc-inquiry-figure')
    await expect(figure).toHaveAttribute('data-focus', 'all')
    await expect(figure.getByRole('radio')).toHaveCount(0)
    await expect(figure.getByText('Conceptual illustration · not measured data')).toBeVisible()
  } finally { await staticContext.close() }
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${origin}/`)
    const figure = page.locator('.pc-inquiry-figure')
    const controls = figure.getByRole('group', { name: 'Look at' })
    await expect(controls.getByRole('radio')).toHaveCount(4)
    await controls.getByRole('radio', { name: 'Both' }).focus()
    await page.keyboard.press('ArrowRight')
    await expect(controls.getByRole('radio', { name: 'Outcome' })).toBeChecked()
    await expect(figure).toHaveAttribute('data-focus', 'outcome')
    await expect(figure.locator('.pc-inquiry-reading')).toContainText('The solid line is what was observed.')
    await figure.locator('.pc-part--gap .pc-open-question').click({ force: true })
    await expect(figure).toHaveAttribute('data-focus', 'gap')
    await expect(controls.getByRole('radio', { name: 'The gap' })).toBeChecked()
    await expect(figure.locator('.pc-inquiry-reading')).toContainText('where an investigation starts')
    expect(await figure.locator('.pc-gap-ring').evaluate(element => getComputedStyle(element).animationName)).toBe('none')
    await expect(figure.locator('.pc-inquiry-drawing')).toHaveAttribute('aria-hidden', 'true')
    expect(errors).toEqual([])
  } finally { await context.close() }
})
