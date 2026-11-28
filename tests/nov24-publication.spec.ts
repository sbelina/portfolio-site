import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

/** The owner-approved November publication: three new cases, working artifacts, and nothing the registry withholds. */
const page = (slug: string) => readFile(`dist/investigations/${slug}/index.html`, 'utf8')
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')

test('the three new cases are published with working artifacts and no deep-dive link', async () => {
  for (const [slug, count] of [['operational-friction', 4], ['knowledge-binder', 2], ['knowledge-publishing', 6]] as const) {
    const html = await page(slug)
    expect(html).toContain('id="artifacts"')
    expect(html.match(/class="case-artifact"/g)).toHaveLength(count)
    expect(html).not.toContain(`/deep-dive/${slug}/`)
    expect(text(html)).toContain('The short read')
  }
})

test('existing cases gain their artifacts', async () => {
  for (const [slug, id] of [['claims-operations', 'knowledge-transfer'], ['brand-research', 'two-measures'], ['civic-service', 'infrastructure'], ['accessibility-ai', 'planned-executed']] as const) {
    expect(await page(slug)).toContain(`id="artifact-${id}"`)
  }
})

test('artifact tables are real tables with header scopes; steps name who acted in words', async () => {
  const html = await page('knowledge-publishing')
  expect(html).toContain('<th scope="col">')
  expect(html).toContain('<th scope="row">')
  for (const label of ['My part', 'Others', 'Shared']) expect(text(html)).toContain(label)
})

test('nothing the evidence registry withholds is published', async () => {
  const all = text((await Promise.all(['operational-friction', 'knowledge-binder', 'knowledge-publishing', 'civic-service', 'claims-operations', 'accessibility-ai'].map(page))).join(' '))
  // Unverified or superseded figures.
  for (const withheld of ['88%', '20.64', '40%', 'turnout increased', '20,000 residents', '8% of']) expect(all).not.toContain(withheld)
  // Generalized by exact assignment figures and internal names.
  for (const exact of ['240', '10,000', '73 partner', '3%', '100+', 'SEED', 'Quip', 'Apple']) expect(all).not.toContain(exact)
  // The typing model is the corrected one (characters ÷ 5).
  expect(all).toContain('4.13')
  expect(all).toContain('445,786')
  // the time-saved estimate as days a year; reach as the organization reported it.
  expect(all).toContain('working days a year')
  expect(all).toContain('as Vote Huntsville reported')
})

test('the career thread links the new cases as proof', async () => {
  const about = await readFile('dist/about/index.html', 'utf8')
  for (const slug of ['operational-friction', 'knowledge-binder', 'knowledge-publishing']) expect(about).toContain(`href="/investigations/${slug}/"`)
  expect(text(about)).toContain('summer-long arts program')
})

test('About carries the owner positioning and the reconstructed storm workflow, labelled as such', async () => {
  const about = text(await readFile('dist/about/index.html', 'utf8'))
  for (const phrase of ['My work begins where existing explanations become insufficient', 'What I investigate', 'What I change', 'What institutions gain', 'I investigate and redesign the systems through which institutions understand people']) expect(about).toContain(phrase)
  expect(about).toContain('An early example: the storm workflow')
  expect(about).toContain('Reconstructed from memory')
  expect(about).toContain('about a third')
  expect(about).not.toContain('40%')
})
