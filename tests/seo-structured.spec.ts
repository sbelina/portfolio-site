import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { caseSearch } from '../src/content/search-metadata'

/** Search improvements: plain search titles, short descriptions, one structured-data graph. */
const graph = (html: string) => [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].flatMap(match => JSON.parse(match[1])['@graph'])
const meta = (html: string, name: string) => html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)"`))?.[1]

test('every case page has a plain search title, a description that shows whole, its own sharing image, an article and breadcrumbs', async () => {
  for (const [slug, search] of Object.entries(caseSearch)) {
    const html = await readFile(`dist/investigations/${slug}/index.html`, 'utf8')
    expect(html).toContain(`<title>${search.title} · Sami Belina</title>`)
    expect(search.description.length).toBeLessThanOrEqual(155)
    expect(meta(html, 'og:image')).toBe(`https://producingcuriosity.com/social/${slug}.png`)
    const types = graph(html).map(node => node['@type'])
    expect(types).toEqual(['Article', 'BreadcrumbList'])
    const article = graph(html)[0]
    expect(article.author).toEqual({ '@id': 'https://producingcuriosity.com/#sami-belina' })
    expect(article.headline.length).toBeGreaterThan(0)
  }
})

test('About is a profile page for the same person; the collection lists every case; the sitemap dates case studies by month', async () => {
  const about = graph(await readFile('dist/about/index.html', 'utf8'))
  expect(about[0]).toMatchObject({ '@type': 'ProfilePage', mainEntity: { '@id': 'https://producingcuriosity.com/#sami-belina' } })
  const collection = graph(await readFile('dist/investigations/index.html', 'utf8'))[0]
  expect(collection.mainEntity.itemListElement).toHaveLength(Object.keys(caseSearch).length)
  const sitemap = await readFile('dist/sitemap.xml', 'utf8')
  expect(sitemap.match(/<lastmod>\d{4}-\d{2}<\/lastmod>/g)).toHaveLength(Object.keys(caseSearch).length)
  const home = graph(await readFile('dist/index.html', 'utf8'))
  expect(home.find(node => node['@type'] === 'Person').disambiguatingDescription).toContain('redesign the systems through which institutions understand people')
})

test('password-protected and unindexed pages carry no structured data', async () => {
  for (const file of ['dist/deep-dive/_shell/index.html', 'dist/system/index.html']) {
    try { expect(graph(await readFile(file, 'utf8'))).toEqual([]) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error }
  }
})
