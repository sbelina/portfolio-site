import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import archive from '../content/build-archive.json' with { type: 'json' }
import { homeTitle, homeDescription, personSchema, siteOrigin } from '../scripts/seo'
import { practiceAreas, professionalIdentity, recruiterContact, tagline } from '../src/content/recruiter'
import { representativeSummaries } from '../src/content/primary-evidence'

// 19 November professional alignment (docs/codex/NOV-19-PROFESSIONAL-ALIGNMENT.md).
const origin = 'http://127.0.0.1:4175'

test('identity is consistent across the homepage, title and description', async () => {
  // Matches the LinkedIn headline: identity, three specialties and the tagline.
  expect(professionalIdentity).toBe('Research & Innovation Strategist')
  expect(practiceAreas).toEqual(['Applied research', 'Service design', 'Stakeholder engagement'])
  expect(homeTitle).toBe(`Sami Belina — ${professionalIdentity}`)
  expect(homeDescription.toLowerCase()).toContain('research and innovation strategist')
  for (const term of practiceAreas) expect(homeDescription).toContain(term.toLowerCase())
  expect(homeDescription.length).toBeLessThanOrEqual(155)
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain(`<title>${homeTitle.replaceAll('&', '&amp;')}</title>`)
  expect(home).toContain(tagline)
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
  for (const link of await links.all()) await expect(link).toHaveAccessibleDescription('Previous-edition summary · full case unpublished')
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
    const names = ['Delivered is not complete', 'Agreement is not trust', 'Automation is not judgment', 'Usability is not retention', 'Compliance is not comprehension', 'Participation is not influence', 'Shared language is not shared understanding', 'Reuse is not demonstrated effectiveness']
    for (const name of names) {
      await expect(page.getByRole('heading', { level: 2, name, exact: true })).toHaveCount(1)
      await expect(page.locator('summary', { hasText: `for ${name}` })).toHaveCount(1)
    }
    await expect(page.locator('.pc-distinction-list h2 [aria-hidden="true"]')).toHaveText(Array(8).fill('≠'))
    for (const section of await page.locator('.pc-distinction-list section').all()) {
      await expect(section.locator('.pc-question')).toHaveCount(1)
      await section.locator('summary').click()
      for (const term of ['What connects them', 'Evidence status', 'Where it stops']) await expect(section.getByText(term, { exact: true })).toBeVisible()
    }
    // No distinction claims a case finding.
    await expect(page.locator('.pc-distinction-list')).not.toContainText(/\d+\s*%|SUS|NPS/)
  } finally { await context.close() }
})

test('homepage structured data names Sami as a Person linked to LinkedIn, and the site to its author', async () => {
  const home = await readFile('dist/index.html', 'utf8')
  const data = JSON.parse(home.match(/<script type="application\/ld\+json">(.*?)<\/script>/)![1])
  const graph = data['@graph'] as Record<string, unknown>[]
  const person = graph.find(node => node['@type'] === 'Person')!
  const site = graph.find(node => node['@type'] === 'WebSite')!
  expect(person).toEqual(personSchema)
  expect(person).toMatchObject({ name: 'Sami Belina', jobTitle: professionalIdentity, sameAs: [recruiterContact.linkedin], url: `${siteOrigin}/` })
  expect(site).toMatchObject({ author: { '@id': person['@id'] }, publisher: { '@id': person['@id'] } })
  // Public, owner-supplied facts only: no email address or employer in machine-readable data.
  expect(JSON.stringify(person)).not.toMatch(/@sbelina|mailto|employer|worksFor/i)
  // Only the homepage carries it.
  expect(await readFile('dist/practice/index.html', 'utf8')).not.toContain('"Person"')
})

test('the social preview carries the current positioning, not the 6 November lead', async () => {
  const svg = await readFile('public/social-preview.svg', 'utf8')
  for (const text of ['SAMI BELINA', 'RESEARCH &amp; INNOVATION STRATEGIST', 'I turn gaps in understanding', 'Test. Show. Enable.']) expect(svg).toContain(text)
  expect(svg).not.toContain('I investigate situations where')
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain('content="Producing Curiosity by Sami Belina, Research &amp; Innovation Strategist.')
  const png = await readFile('dist/social-preview.png')
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})

test('the "How I got here" interlude sits between the evidence and the practice, with its source', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/`)
    const headings = await page.locator('main h2').allInnerTexts()
    const lens = headings.findIndex(text => /how i got here/i.test(text))
    expect(lens).toBeGreaterThan(headings.findIndex(text => text.startsWith('Three questions')))
    expect(lens).toBeLessThan(headings.indexOf('Test. Show. Enable.'))
    const interlude = page.getByRole('region', { name: 'How I got here' })
    await expect(interlude.locator('blockquote')).toHaveText('Inspiration is needed in geometry, just as much as in poetry.')
    await expect(interlude.locator('.pc-interlude-quote figcaption')).toHaveText('— Alexander Pushkin')
    await interlude.getByText('Source', { exact: true }).click()
    await expect(interlude.locator('[lang="ru"]')).toContainText('Вдохновение нужно в геометрии, как и в поэзии')
    await expect(interlude.locator('.pc-interlude-drawing')).toHaveAttribute('aria-hidden', 'true')
  } finally { await context.close() }
  const enlarged = await browser.newContext({ viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' })
  try {
    const page = await enlarged.newPage()
    await page.goto(`${origin}/`)
    await page.addStyleTag({ content: ':root{font-size:200%}' })
    await expect(page.getByRole('region', { name: 'How I got here' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  } finally { await enlarged.close() }
})

test('the interlude drawing is a real Euclidean construction, and its stated numbers match it', async () => {
  const geometry = await import('../src/design/lens-geometry')
  const { A, B, C, centre, radius, angleAtC, measures, constructionSteps, freehandPath } = geometry
  // C lies on the circle, directly above O.
  expect(geometry.length(centre, C)).toBeCloseTo(radius, 10)
  expect(C.x).toBe(centre.x)
  // Thales: the angle ACB is right (dot product zero).
  expect(angleAtC).toBe(0)
  // Pythagoras: AC² + BC² = AB², and AC = r√2.
  expect(measures.ACsquared + measures.BCsquared).toBeCloseTo(measures.ABsquared, 10)
  expect(measures.AC).toBeCloseTo(radius * Math.SQRT2, 10)
  expect(measures.AB).toBe(2 * radius)
  // The freehand line passes exactly through C.
  expect(freehandPath).toContain(`${C.x} ${C.y}`)
  // The text readers see states the same numbers.
  const text = constructionSteps.map(step => step.text).join(' ')
  expect(text).toContain(`r = ${radius}`)
  expect(text).toContain(`2r = ${2 * radius}`)
  expect(text).toContain(measures.AC.toFixed(1))
  expect(text).toContain(`= ${Math.round(measures.ABsquared).toLocaleString('en-US')} = AB²`)
  expect(B.x - A.x).toBe(2 * radius)
})
