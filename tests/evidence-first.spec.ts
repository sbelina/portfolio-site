import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import archive from '../content/build-archive.json' with { type: 'json' }
import { claimsInvestigationId, previousEditionSummaries, primaryEvidence } from '../src/content/primary-evidence'
import { forbiddenPublicMarkers } from '../scripts/audit-public'

const origin = 'http://127.0.0.1:4175'
// Owner decision, 23 November: the final Trust deck's cover statement, with "leaders".
const h1 = 'I diagnose gaps in understanding and design the conditions that empower leaders to make informed decisions.'
const h1Markup = 'I diagnose gaps in understanding and design the conditions that empower leaders to make <em class="pc-accent">informed</em> decisions.'
const claimsSummary = `${archive.reviewPath}#claims-operations`
const unpublished = 'The full case has not been published; it awaits source and publication review.'
const candidateCanary = 'CLAIMS_CANDIDATE_UNAPPROVED_16NOV'
const entry = (id: string, slug: string) => ({ id, path: `/investigations/${slug}/`, title: slug, summary: `${slug} summary` })

test('primary evidence prefers approved Claims, then any approved investigation, then a labelled interim summary', () => {
  const other = entry('00000000-0000-4000-8000-000000000001', 'other-case')
  const claims = entry(claimsInvestigationId, 'claims-operations')
  expect(primaryEvidence([other, claims], archive.reviewPath)).toMatchObject({ status: 'approved', href: claims.path })
  expect(primaryEvidence([other], archive.reviewPath)).toMatchObject({ status: 'approved', href: other.path })
  const brief = { tension: 't', call: 'c', result: 'r', evidence: 'e' }
  expect(primaryEvidence([{ ...claims, brief }], archive.reviewPath)).toMatchObject({ status: 'approved', brief })
  const interim = primaryEvidence([], archive.reviewPath)
  expect(interim).toMatchObject({ status: 'previous-edition', href: claimsSummary, boundary: `Summary only. ${unpublished}` })
})

test('interim summaries point only at anchors preserved in the immutable archive', async () => {
  const archived = await readFile(`build-archives/${archive.id}/review/index.html`, 'utf8')
  expect(previousEditionSummaries[0].anchor).toBe('claims-operations')
  for (const { anchor, title } of previousEditionSummaries) {
    expect(archive.homeAnchors).toContain(anchor)
    expect(archived).toContain(`<article class="project-card" id="${anchor}"`)
    expect(archived).toContain(title)
  }
})

test('production home leads with the new H1 and an honest one-click evidence path', async () => {
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain(h1Markup)
  expect(home).not.toContain('I investigate situations where outcomes are visible')
  expect(home).not.toContain('I turn gaps in understanding into evidence leaders can act on.')
  expect(home).toContain(`data-evidence-status="previous-edition"`)
  expect(home).toContain(`href="${claimsSummary}"`)
  expect(home).toContain(unpublished)
  // The guiding purpose informs editorial choices; it is not a headline or metadata claim.
  expect(home.toLowerCase()).not.toContain('collective agency')
  for (const kept of ['Test. Show. Enable.', 'Related. Not equivalent.', 'How I Know']) expect(home).toContain(kept)
  // No approved case yet: no featured block. Contact actions repeat, with the address visible.
  expect(home).not.toContain('Featured investigation')
  expect(home.match(/class="pc-actions"/g)).toHaveLength(1)
  expect(home).toContain('hello@sbelina.com</span>')
  expect(home).not.toContain('Download résumé')
  const reading = JSON.parse(home.match(/<script id="home-reading" type="application\/json">(.*?)<\/script>/)![1])
  expect(reading.entries).toEqual([])
})

test('investigations collection does not present unpublished work as complete', async () => {
  const html = await readFile('dist/investigations/index.html', 'utf8')
  expect(html).toContain('No full investigation has been published in this edition yet.')
  expect(html).not.toContain('class="reading-cards"')
  const links = [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]).filter(href => href.startsWith(`${archive.reviewPath}#`))
  expect(links).toEqual(previousEditionSummaries.map(({ anchor }) => `${archive.reviewPath}#${anchor}`))
})

test('the unapproved Claims candidate is guarded from public output', async () => {
  expect(forbiddenPublicMarkers).toContain(candidateCanary)
  const candidate = await readFile('docs/codex/review-candidates/claims-operations-publication-candidate.md', 'utf8')
  expect(candidate).toContain(candidateCanary)
  // The withdrawn comparison and the vendor name stay out of the candidate's public wording.
  expect(candidate).not.toMatch(/18\s*%?\s*(?:→|->|to)\s*7\.6/)
  const publicSections = candidate.split('<!-- end-public-candidate -->')[0]
  expect(publicSections).not.toContain('IAA')
  expect(publicSections).not.toMatch(/7\.6|18\s?%/)
  const manifest = JSON.parse(await readFile('content/public-release.json', 'utf8'))
  expect(manifest.status).toBe('no-approved-content')
  const review = JSON.parse(await readFile('docs/codex/page-review.json', 'utf8'))
  expect(review.pages.find((page: { id: string }) => page.id === 'claims-operations').approval).toBeNull()
})

test('one click reaches the Claims summary from the first screen, by keyboard, without JavaScript', async ({ browser }) => {
  for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, javaScriptEnabled: false, reducedMotion: 'reduce' })
    try {
      const page = await context.newPage()
      await page.goto(`${origin}/`)
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(h1)
      const action = page.locator('.pc-hero').getByRole('link', { name: 'Read the Claims case summary' })
      await expect(action).toHaveAttribute('href', claimsSummary)
      const bounds = await action.boundingBox()
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(viewport.height)
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width)
      await action.focus()
      await page.keyboard.press('Enter')
      await expect(page).toHaveURL(`${origin}${claimsSummary}`)
      await expect(page.getByRole('complementary', { name: 'Archived build notice' })).toHaveCount(1)
      await expect(page.locator('#claims-operations')).toBeInViewport()
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
