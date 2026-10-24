import React from 'react'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { renderToString } from 'react-dom/server'
import App from '../src/App'
import { ReadingPage, type ReadingPageData } from '../src/reading/ReadingPage'
import { readingPageData } from '../src/reading/page-data'
import type { PublicProjection } from '../src/content/model'
import { migrationLedger } from './legacy-adapter'
import { verifyPublicAssets } from './public-assets'
import baselineAnchors from '../content/legacy-anchors.json' with { type: 'json' }
import { prerenderHiddenWork } from './build-experiment'

const fixture = process.argv.includes('--fixtures')
const output = path.resolve(fixture ? 'dist-fixtures' : 'dist')
const origin = 'https://producingcuriosity.com'
const empty: PublicProjection = { schemaVersion: 1, entries: [], relationships: [], evidence: [], assets: [], aliases: [] }
// No production selection/owner approval exists. Never invent one for empty content.
const release = JSON.parse(await readFile('content/public-release.json', 'utf8'))
if (release.schemaVersion !== 1 || release.status !== 'no-approved-content') throw new Error('A trusted release loader is required before adding approved production content')
const projection = fixture ? (await import('../tests/fixtures/reading-content')).fixtureProjection() : empty
const escapeJson = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029')
const attr = (value: string) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
const [homeTemplate, readingTemplate] = await Promise.all([readFile(path.join(output, 'index.html'), 'utf8'), readFile(path.join(output, 'reading.html'), 'utf8')])
const legacyIds = new Set([...renderToString(<App />).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
baselineAnchors.forEach(id => legacyIds.add(id))
const fragmentRedirects: Record<string, string> = {}
for (const alias of projection.aliases) if (alias.kind === 'fragment') {
  if (legacyIds.has(alias.fragment)) throw new Error('A legacy fragment needs an explicitly reviewed migration before replacement')
  fragmentRedirects[alias.fragment] = projection.entries.find(entry => entry.id === alias.targetId)!.path
}
const reading = { fixture, entries: projection.entries.filter(entry => entry.kind === 'investigation').map(({ id, path, title, summary }) => ({ id, path, title, summary })), fragmentRedirects }
const homeMarkup = renderToString(<App reading={reading} />)
if (!homeTemplate.includes('<!--app-start-->') || !homeTemplate.includes('<!--app-end-->')) throw new Error('Home prerender markers missing')
const home = homeTemplate.replace(/<!--app-start-->[\s\S]*?<!--app-end-->/, () => homeMarkup)
  .replace('<div id="root">', '<div id="root" data-prerendered="true">')
  .replace('</body>', `<script id="home-reading" type="application/json">${escapeJson(reading)}</script></body>`)
for (const id of baselineAnchors) if (!home.includes(`id="${id}"`)) throw new Error('An existing legacy anchor would be lost')
await writeFile(path.join(output, 'index.html'), home)
await prerenderHiddenWork(output)
const routes = ['/', '/investigations/', '/experiments/reveal-hidden-work/', ...projection.entries.map(entry => entry.path)]
async function page(file: string, data: ReadingPageData, title: string, description: string, route?: string) {
  const html = readingTemplate.replace(/<title>[^<]*<\/title>/, () => `<title>${attr(title)}</title>`)
    .replace('<!--reading-head-->', `<meta name="description" content="${attr(description)}" />${route ? `<link rel="canonical" href="${origin}${route}" /><meta property="og:title" content="${attr(title)}" /><meta property="og:description" content="${attr(description)}" /><meta property="og:url" content="${origin}${route}" />` : ''}${fixture || !route ? '<meta name="robots" content="noindex, nofollow" />' : ''}`)
    .replace('<!--reading-html-->', () => renderToString(<ReadingPage page={data} />))
    .replace('<!--reading-data-->', () => `<script id="reading-data" type="application/json">${escapeJson(data)}</script>`)
  const target = path.join(output, file)
  await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, html)
}
await page('investigations/index.html', readingPageData(projection, 'collection', fixture), 'Investigations — Producing Curiosity', 'Read investigations with evidence, contribution, limitations, and explained connections.', '/investigations/')
for (const entry of projection.entries) await page(`${entry.path.slice(1)}index.html`, readingPageData(projection, 'entry', fixture, entry.id), `${entry.title} — Producing Curiosity`, entry.summary, entry.path)
await page('404.html', readingPageData(projection, 'not-found', fixture), 'Page not found — Producing Curiosity', 'This reading is not available.')
const redirects = projection.aliases.filter(alias => alias.kind === 'path').map(alias => `${alias.path} ${projection.entries.find(entry => entry.id === alias.targetId)!.path} 301`)
if (redirects.length) await writeFile(path.join(output, '_redirects'), `${redirects.join('\n')}\n`)
for (const asset of verifyPublicAssets(projection, id => {
  const asset = projection.assets.find(item => item.id === id)!
  return readFileSync(path.join('content/public-media', path.basename(asset.url)))
})) {
  const target = path.join(output, asset.url.slice(1)); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, asset.bytes)
}
await writeFile(path.join(output, 'public-content.json'), JSON.stringify(projection))
await writeFile(path.join(output, 'route-manifest.json'), JSON.stringify({ schemaVersion: 1, fixture, routes, fragments: fragmentRedirects }))
await writeFile(path.join(output, 'search-index.json'), JSON.stringify(projection.entries.map(({ id, path, title, summary }) => ({ id, path, title, summary }))))
await writeFile(path.join(output, 'graph-index.json'), JSON.stringify({ nodes: projection.entries.map(({ id, path, title }) => ({ id, path, title })), edges: projection.relationships }))
await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(route => `<url><loc>${origin}${route}</loc></url>`).join('')}</urlset>`)
await mkdir('docs/codex/generated', { recursive: true })
await writeFile('docs/codex/generated/migration-ledger.json', JSON.stringify(migrationLedger(home), null, 2)+'\n')
// No generic Vite shell may turn an unknown URL into a soft 200.
await rm(path.join(output, 'reading.html'))
console.log(`Prerendered ${routes.length} routes (${fixture ? 'explicit local synthetic fixtures' : 'production-safe; no approved canonical content'}).`)
