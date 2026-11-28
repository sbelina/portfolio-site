import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { legacyFragments } from '../src/content/legacy-fragments'
import { validateCandidateProjection } from '../src/content/projection'

// Consolidation, 23 November 2026: retired archive, approved public cases, decision layer, Field Notes.
const origin = 'http://127.0.0.1:4175'

test('every retired build address answers 410 Gone, including nested assets', async ({ request }) => {
  for (const path of ['/builds', '/builds/', '/builds/2026-11-04-418efb7/', '/builds/2026-11-04-418efb7/investigations/', '/builds/2026-11-04-418efb7/assets/home-BXcoslEA.js', '/builds/2026-11-04-418efb7/capture.json']) {
    const response = await request.get(`${origin}${path}`, { maxRedirects: 0 })
    expect(response.status(), path).toBe(410)
    expect(response.headers()['x-robots-tag']).toBe('noindex')
    expect(await response.text()).not.toContain('I swim upstream')
  }
})

test('old homepage links land on the current page for the same thing', async ({ page, browser }) => {
  for (const [fragment, destination] of [['claims-operations', '/investigations/claims-operations/'], ['the-bends', '/writing/#the-bends'], ['practice', '/practice/']] as const) {
    expect(legacyFragments[fragment]).toBe(destination)
    await page.goto(`${origin}/#${fragment}`)
    await expect(page).toHaveURL(`${origin}${destination}`)
  }
  // The "section from the previous site" list was removed; old links redirect instead.
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/`)
    await expect(page.getByText('Looking for a section from the previous site?')).toHaveCount(0)
  } finally { await context.close() }
})

test('the release loader refuses a record changed after approval', async () => {
  const { releaseStore } = await import('../content/release/cases')
  const release = JSON.parse(await readFile('content/public-release.json', 'utf8'))
  expect(() => validateCandidateProjection(releaseStore, release.manifest)).not.toThrow()
  const tampered = structuredClone(releaseStore)
  tampered.entries[0].summary += ' Changed.'
  expect(() => validateCandidateProjection(tampered, release.manifest)).toThrow('Selected revision changed after candidate approval')
})

test('each case shows its decision, labelled in words, and offers the deep dive beside the public version', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/investigations/claims-operations/`)
    const decision = page.getByRole('region', { name: 'The decision' })
    await expect(decision).toContainText('What was at stake')
    await expect(decision.locator('[data-status="chosen"] .investigation-option-status').first()).toHaveText('Chosen')
    await expect(decision.locator('[data-kind="unproven"] .investigation-implication-kind')).toHaveText('Not established')
    await expect(page.locator('.reading-version-switch')).toContainText('You are reading the public version.')
    await expect(page.locator('.reading-version-switch a')).toHaveAttribute('href', '/deep-dive/claims-operations/')
    // No figure claims a measured result: every case figure is approximate or an owner estimate.
    const projection = JSON.parse(await readFile('dist/public-content.json', 'utf8'))
    for (const entry of projection.entries) for (const figure of entry.investigation.figures ?? []) expect(figure.basis).not.toBe('measured')
  } finally { await context.close() }
})

test('case visuals keep their full meaning without JavaScript and switch with native controls', async ({ browser }) => {
  const staticContext = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await staticContext.newPage()
    await page.goto(`${origin}/investigations/brand-research/`)
    await expect(page.locator('.case-visual-card')).toHaveCount(2)
    await page.goto(`${origin}/investigations/enterprise-ai/`)
    await expect(page.getByRole('img', { name: '38 separate proposals' })).toBeVisible()
    await expect(page.getByRole('list', { name: 'Eight shared challenge areas' }).getByRole('listitem')).toHaveCount(8)
  } finally { await staticContext.close() }
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/investigations/brand-research/`)
    const visual = page.getByRole('region', { name: 'Ask the question differently' })
    await visual.getByRole('radio', { name: 'Ask about trust influence' }).check()
    await expect(visual.locator('.case-visual-card')).toHaveAttribute('data-question', 'influence')
    await expect(visual).toContainText('Self-report is not a causal measure.')
  } finally { await context.close() }
})

test('Field Notes keeps the writing from the previous edition, without date call-outs', async ({ page }) => {
  await page.goto(`${origin}/writing/`)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Questions still being worked out.')
  for (const id of ['the-bends', 'calculus-of-syntax', 'conjunction-conjecture', 'tool-vs-toy', 'mundane-evidence', 'archive-wage', 'archive-left']) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1)
  await expect(page.locator('#earlier-work')).not.toContainText(/\b20\d{2}\b/)
  const navigation = page.getByRole('navigation', { name: 'Primary navigation' }).getByRole('link')
  await expect(navigation).toHaveText(['Work', 'Practice', 'Field Notes', 'Experiments*', 'About', 'Contact'])
})

test('readers find the work by the words they use: Work, case studies, setting and kind of work', async ({ page, request }) => {
  for (const path of ['/work/', '/case-studies/']) {
    const response = await request.get(`${origin}${path}`, { maxRedirects: 0 })
    expect(response.status(), path).toBe(301)
    expect(response.headers().location).toMatch(/\/investigations\/$/)
  }
  await page.goto(`${origin}/investigations/`)
  await expect(page).toHaveTitle('Case studies in applied research and systems strategy · Sami Belina')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Case studies')
  await expect(page.locator('.reading-cards .reading-kicker').first()).toHaveText('Insurance operations · Process & service design')
  // "Claims" alone reads as claims-as-assertions on an evidence site; it never labels the work.
  await page.goto(`${origin}/`)
  await expect(page.locator('.pc-selected-domain').first()).toHaveText('Insurance operations · Process & service design')
  await expect(page.locator('.pc-selected-domain, .pc-pattern-pairs .pc-kicker, .pc-hero a')).not.toContainText(['Claims'])
})

test('every case without the pinned process shows its before and after near the top, in its own words, without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    for (const slug of ['brand-research', 'enterprise-ai', 'telematics', 'civic-service', 'accessibility-ai']) {
      await page.goto(`${origin}/investigations/${slug}/`)
      const figure = page.getByRole('region', { name: 'Before and after' })
      await expect(figure, slug).toBeVisible()
      await expect(figure.locator('[data-state="before"] .pc-ba-pair')).toContainText('was treated as')
      await expect(figure.locator('[data-state="after"] .pc-ba-pair')).toContainText('is not')
    }
    await page.goto(`${origin}/investigations/brand-research/`)
    await expect(page.locator('[data-state="before"] figcaption')).toHaveText('Trust is one attitude: how favorably people rate the company.')
    // Claims keeps its own pinned before-and-after figure instead.
    await page.goto(`${origin}/investigations/claims-operations/`)
    await expect(page.getByRole('region', { name: 'Before and after' })).toHaveCount(0)
  } finally { await context.close() }
})
