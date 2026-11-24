import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { homeTitle, homeDescription, personSchema, siteOrigin } from '../scripts/seo'
import { practiceAreas, professionalIdentity, recruiterContact, tagline } from '../src/content/recruiter'
import { selectedSlugs } from '../src/content/primary-evidence'

// 19 November professional alignment (docs/codex/NOV-19-PROFESSIONAL-ALIGNMENT.md).
const origin = 'http://127.0.0.1:4175'

test('identity is consistent across the homepage, title and description', async () => {
  // Owner decision, 23 November: identity and the line under it.
  expect(professionalIdentity).toBe('Applied Research & Systems Strategist')
  expect(tagline).toBe('Increasing understanding, effectiveness, and adaptability in complex systems.')
  expect(practiceAreas).toEqual(['Applied research', 'Service design', 'Stakeholder engagement'])
  expect(homeTitle).toBe(`Sami Belina — ${professionalIdentity}`)
  expect(homeDescription.toLowerCase()).toContain('applied research and systems strategist')
  expect(homeDescription).toContain('misunderstood problems')
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
      for (const target of [identity, page.getByRole('heading', { level: 1 }), page.locator('.pc-hero').getByRole('link', { name: 'Read the insurance operations case study' })]) {
        const box = (await target.boundingBox())!
        expect(box.y + box.height, `${viewport.width}px`).toBeLessThanOrEqual(viewport.height)
      }
      // The hero leads with the call to action, then evidence; never the Atlas or Observatory (owner, 24 November).
      expect(await page.locator('.pc-hero a').evaluateAll(links => links.slice(0, 2).map(link => link.getAttribute('href')))).toEqual(['/contact/', '/investigations/claims-operations/'])
    } finally { await context.close() }
  }
})

test('selected investigations show stakes, what changed, and the public and deep-dive versions side by side', async ({ page }) => {
  await page.goto(`${origin}/`)
  const section = page.getByRole('region', { name: 'Three problems, and what changed.' })
  const items = section.getByRole('listitem')
  await expect(items).toHaveCount(3)
  for (const [index, slug] of selectedSlugs.entries()) {
    const item = items.nth(index)
    await expect(item).toContainText('At stake:')
    await expect(item).toContainText('What changed:')
    await expect(item.getByRole('link', { name: /Public version/ })).toHaveAttribute('href', `/investigations/${slug}/`)
    await expect(item.getByRole('link', { name: /Deep dive/ })).toHaveAttribute('href', `/deep-dive/${slug}/`)
  }
  // No link anywhere on the homepage reaches a retired build.
  expect(await page.locator('a[href*="/builds/"]').count()).toBe(0)
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
    const moves = page.locator('.pc-tse')
    // The owner's final wording (Trust case, Appendix A), one move at a time in the moving figure.
    await expect(moves).toContainText('Diagnose the gap: where a measure, definition, or category has drifted.')
    await moves.getByRole('radio', { name: /Show/ }).check()
    await expect(moves).toContainText('Make evidence and uncertainty visible so people reach defensible interpretations.')
    await moves.getByRole('radio', { name: /Enable/ }).check()
    await expect(moves).toContainText('Design the conditions people need to make informed decisions.')
  }
  await expect(page.getByRole('heading', { name: /Notice → Frame → Model → Test → Interrogate → Revise/ })).toBeVisible()
})

test('seven qualified distinctions each state difference, question, connection, evidence and limits without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/patterns/`)
    const names = ['Delivered is not verified', 'Agreement is not trust', 'Automation is not judgment', 'Usability is not retention', 'Compliance is not comprehension', 'Participation is not influence', 'Shared language is not shared understanding', 'Reuse is not demonstrated effectiveness']
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
  for (const text of ['SAMI BELINA', 'APPLIED RESEARCH &amp; SYSTEMS STRATEGIST', 'I help organizations avoid costly', 'Test. Show. Enable.']) expect(svg).toContain(text)
  expect(svg).not.toContain('I investigate situations where')
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain('content="Producing Curiosity by Sami Belina, Applied Research &amp; Systems Strategist.')
  const png = await readFile('dist/social-preview.png')
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
})

test('the compact "How I got here" interlude sits at the base of the homepage, above the call to action', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 } })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/`)
    const headings = await page.locator('main h2').allInnerTexts()
    const lens = headings.findIndex(text => /how i got here/i.test(text))
    expect(lens).toBeGreaterThan(headings.indexOf('Test. Show. Enable.'))
    expect(lens).toBeLessThan(headings.indexOf('Before the next costly fix, understand the problem.'))
    const interlude = page.getByRole('region', { name: 'How I got here' })
    await expect(interlude.locator('blockquote')).toHaveText('Inspiration is needed in geometry, just as much as in poetry.')
    await expect(interlude.locator('.pc-interlude-quote figcaption')).toHaveText('— Alexander Pushkin')
    await interlude.getByText('Source', { exact: true }).click()
    await expect(interlude.locator('[lang="ru"]')).toContainText('Вдохновение нужно в геометрии, как и в поэзии')
    await expect(interlude.getByRole('link', { name: /See the geometry behind it/ })).toHaveAttribute('href', '/writing/#how-i-got-here')
    // The full construction lives in Field Notes.
    await page.goto(`${origin}/writing/`)
    await expect(page.locator('#how-i-got-here .pc-interlude-drawing')).toHaveAttribute('aria-hidden', 'true')
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
