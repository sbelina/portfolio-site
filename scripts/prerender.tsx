import BuildIndex from '../src/BuildIndex'
import { FoundationPage, foundationPages, type FoundationKind } from '../src/design/FoundationPage'
import { publicStaticRoutes } from '../src/public-routes'
import { setPublicBase, publicPath, publicBase } from '../src/public-path'
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
import { prerenderEdgeCase } from './build-play'
import { ProposalPage, proposalPages, type ProposalKind } from '../src/design/ProposalPage'
import { DeepDiveShell } from '../src/design/DeepDiveShell'
import { prerenderAtlas } from './build-atlas'
import { prerenderInquirySpace } from './build-inquiry-space'
import { inquirySpacePath } from '../src/inquiry-space/paths'
import { inquiryIllustrationProjection } from '../src/inquiry-space/illustration'
import { seoHead, homeTitle, homeDescription, siteOrigin } from './seo'
import { loadApprovedProjection } from './release'
import { plainText } from '../src/content/emphasis'

const fixture = process.argv.includes('--fixtures')
// Local owner-review preview of an UNAPPROVED candidate. Noindex, marked non-production, never deployed.
const candidate = process.argv.includes('--candidate')
if (fixture && candidate) throw new Error('Fixture and candidate previews are separate builds')
const preview = fixture || candidate
const outputArgument = process.argv.indexOf('--output')
const output = path.resolve(outputArgument >= 0 ? process.argv[outputArgument + 1] : fixture ? 'dist-fixtures' : candidate ? 'dist-candidate' : 'dist')
if (candidate && path.basename(output) === 'dist') throw new Error('Candidate previews never write to the production output directory')
setPublicBase(process.env.PUBLIC_BASE_PATH ?? '/')
const origin = siteOrigin
// No canonical-content selection/approval exists. Static illustrative experiments
// have separate scoped owner authorization; never invent manuscript approval.
// Production reads only the owner-approved release, re-verified against exact record digests (scripts/release.ts).
const projection = fixture ? (await import('../tests/fixtures/reading-content')).fixtureProjection() : candidate ? (await import('../content/candidates/claims-operations')).claimsCandidatePreviewProjection() : await loadApprovedProjection()
const escapeJson = (value: unknown) => JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029')
const [homeTemplate, readingTemplate, foundationTemplate] = await Promise.all([readFile(path.join(output, 'index.html'), 'utf8'), readFile(path.join(output, 'reading.html'), 'utf8'), readFile(path.join(output, 'foundation.html'), 'utf8')])
const legacyIds = new Set([...renderToString(<App />).matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
baselineAnchors.forEach(id => legacyIds.add(id))
const fragmentRedirects: Record<string, string> = {}
for (const alias of projection.aliases) if (alias.kind === 'fragment') {
  if (legacyIds.has(alias.fragment)) throw new Error('A legacy fragment needs an explicitly reviewed migration before replacement')
  fragmentRedirects[alias.fragment] = projection.entries.find(entry => entry.id === alias.targetId)!.path
}
const reading = { fixture, entries: projection.entries.filter(entry => entry.kind === 'investigation').map(({ id, path, slug, title, summary, investigation }) => ({ id, path, slug, title, summary, ...(investigation?.decision ? { stakes: investigation.decision.stakes } : {}), ...(investigation ? { visual: investigation.visual } : {}), ...(investigation?.deepDive ? { deepDive: true } : {}), ...(investigation?.brief ? { brief: investigation.brief } : {}), ...(investigation?.status ? { status: investigation.status } : {}),
  ...(investigation?.figures?.some(figure => figure.headline) ? { headlines: investigation.figures.filter(figure => figure.headline).map(({ id, value, unit, label, basis, qualifier }) => ({ id, value, unit, label, basis, qualifier })) } : {}) })), fragmentRedirects }
// Production home receives only approved, projected investigations; the client hydrates from the same home-reading JSON.
const homeMarkup = renderToString(fixture ? <App reading={reading} /> : <BuildIndex investigations={reading.entries} />)
if (!homeTemplate.includes('<!--app-start-->') || !homeTemplate.includes('<!--app-end-->')) throw new Error('Home prerender markers missing')
const home = homeTemplate.replace(/<!--app-start-->[\s\S]*?<!--app-end-->/, () => homeMarkup)
  .replace('data-edition="current"', fixture ? 'data-edition="legacy"' : 'data-edition="current"')
  .replace('name="color-scheme" content="light"', fixture ? 'name="color-scheme" content="dark"' : 'name="color-scheme" content="light"')
  .replace('<!--seo-head-->', () => seoHead({ title: homeTitle, description: homeDescription, route: '/', indexable: !preview, website: true }))
  .replace('<div id="root">', '<div id="root" data-prerendered="true">')
  .replace('</body>', `<script id="home-reading" type="application/json">${escapeJson(reading)}</script></body>`)
for (const id of baselineAnchors) if (!home.includes(`id="${id}"`)) throw new Error('An existing legacy anchor would be lost')
await writeFile(path.join(output, 'index.html'), home)
await prerenderHiddenWork(output, fixture)
await prerenderEdgeCase(output)
await prerenderAtlas(output)
const inquiryProjection = fixture ? projection : inquiryIllustrationProjection()
await prerenderInquirySpace(output, inquiryProjection, fixture)
const illustrativeEntries = fixture ? [] : inquiryProjection.entries
const routes = [...publicStaticRoutes, ...projection.entries.map(entry => entry.path), ...illustrativeEntries.map(entry => entry.path)]
if (new Set(routes).size !== routes.length || projection.aliases.some(alias => alias.kind === 'path' && routes.includes(alias.path))) throw new Error('An illustrative route collides with canonical content, an alias or a static destination')
async function page(file: string, data: ReadingPageData, title: string, description: string, route?: string, indexable = true) {
  const html = readingTemplate.replace('<!--reading-head-->', () => seoHead({ title, description, route, indexable: indexable && !preview && !!route }))
    .replace('<html lang="en">', !fixture || !!data.entry?.inquirySpace ? '<html lang="en" data-edition="current">' : '<html lang="en">')
    .replace('<!--reading-html-->', () => renderToString(<ReadingPage page={data} />))
    .replace('<!--reading-data-->', () => `<script id="reading-data" type="application/json">${escapeJson(data)}</script>`)
  const target = path.join(output, file)
  await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, html)
}
await page('investigations/index.html', { ...readingPageData(projection, 'collection', fixture), ...(candidate ? { candidate: true } : {}) }, fixture ? 'Investigations — Producing Curiosity' : 'Case studies — Producing Curiosity', 'Case studies by Sami Belina: the problem, the evidence, what changed, and my part and its limits.', '/investigations/', reading.entries.length > 0)
for (const entry of projection.entries) await page(`${entry.path.slice(1)}index.html`, { ...readingPageData(projection, 'entry', fixture, entry.id, fixture && entry.inquirySpace ? inquirySpacePath : undefined), ...(candidate ? { candidate: true } : {}) }, `${plainText(entry.title)}${candidate ? ' — unapproved candidate' : ''} — Producing Curiosity`, plainText(entry.summary), entry.path)
for (const entry of illustrativeEntries) await page(`${entry.path.slice(1)}index.html`, { ...readingPageData(inquiryProjection, 'entry', false, entry.id, inquirySpacePath), illustrative: true }, `${entry.title} — synthetic illustration · Producing Curiosity`, entry.summary, entry.path, false)
await page('404.html', readingPageData(projection, 'not-found', fixture), 'Page not found — Producing Curiosity', 'This reading is not available.')
for (const [kind, metadata] of Object.entries(foundationPages)) {
  const html = foundationTemplate.replace('<!--foundation-head-->', () => seoHead({ title: `${metadata.title} — Producing Curiosity`, description: metadata.description, route: metadata.path, indexable: metadata.indexable && !preview }))
    .replace('data-page=""', `data-page="${kind}"`)
    .replace('<!--foundation-html-->', () => renderToString(<FoundationPage kind={kind as FoundationKind}/>))
  const target = path.join(output, metadata.path.slice(1), 'index.html')
  await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, html)
}
// Deep-dive frame: the Worker serves it only after a password check (worker/deep-dive.ts). No private content.
{
  const html = foundationTemplate.replace('<!--foundation-head-->', () => seoHead({ title: 'Deep dive — Producing Curiosity', description: 'Password-protected deep dives.', indexable: false }))
    .replace('<!--foundation-html-->', () => renderToString(<DeepDiveShell/>))
  await mkdir(path.join(output, 'deep-dive', '_shell'), { recursive: true })
  await writeFile(path.join(output, 'deep-dive', '_shell', 'index.html'), html)
}
// Owner-review shells (About, Learning) exist only in the local fixtures build.
const proposalRoutes: string[] = []
if (fixture) for (const [kind, metadata] of Object.entries(proposalPages)) {
  const html = foundationTemplate.replace('<!--foundation-head-->', () => seoHead({ title: `${metadata.title} — Producing Curiosity`, description: metadata.description, route: metadata.path, indexable: false }))
    .replace('<!--foundation-html-->', () => renderToString(<ProposalPage kind={kind as ProposalKind}/>))
  await mkdir(path.join(output, metadata.path), { recursive: true })
  await writeFile(path.join(output, metadata.path, 'index.html'), html)
  proposalRoutes.push(metadata.path)
}
const redirects = projection.aliases.filter(alias => alias.kind === 'path').map(alias => `${alias.path} ${projection.entries.find(entry => entry.id === alias.targetId)!.path} 301`)
// Readers look for “work” and “case studies”; both names lead to the collection (23 November).
redirects.push('/work/ /investigations/ 301', '/work /investigations/ 301', '/case-studies/ /investigations/ 301', '/case-studies /investigations/ 301')
await writeFile(path.join(output, '_redirects'), `${redirects.join('\n')}\n`)
for (const asset of verifyPublicAssets(projection, id => {
  const asset = projection.assets.find(item => item.id === id)!
  return readFileSync(path.join('content/public-media', path.basename(asset.url)))
})) {
  const target = path.join(output, asset.url.slice(1)); await mkdir(path.dirname(target), { recursive: true }); await writeFile(target, asset.bytes)
}
await writeFile(path.join(output, 'public-content.json'), JSON.stringify(projection))
if (preview) await writeFile(path.join(output, '_headers'), '/*\n  X-Robots-Tag: noindex\n')
await writeFile(path.join(output, 'route-manifest.json'), JSON.stringify({ schemaVersion: 1, fixture: preview, ...(candidate ? { candidate: true } : {}), routes: [...routes.map(publicPath), ...proposalRoutes.map(publicPath)], fragments: fragmentRedirects }))
await writeFile(path.join(output, 'search-index.json'), JSON.stringify(projection.entries.map(({ id, path, title, summary }) => ({ id, path, title: plainText(title), summary: plainText(summary) }))))
await writeFile(path.join(output, 'graph-index.json'), JSON.stringify({ nodes: projection.entries.map(({ id, path, title, kind }) => ({ id, path, title: plainText(title), kind })), edges: projection.relationships.filter(relationship => !relationship.exploration) }))
const indexableRoutes = preview || publicBase() !== '/' ? [] : ['/', '/experiments/reveal-hidden-work/', ...Object.values(foundationPages).filter(page => page.indexable).map(page => page.path), ...(reading.entries.length ? ['/investigations/'] : []), ...projection.entries.map(entry => entry.path)]
await writeFile(path.join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexableRoutes.map(route => `<url><loc>${origin}${route}</loc></url>`).join('')}</urlset>`)
await mkdir('docs/codex/generated', { recursive: true })
if (publicBase() === '/' && !preview) await writeFile('docs/codex/generated/migration-ledger.json', JSON.stringify(migrationLedger(home), null, 2)+'\n')
// No generic Vite shell may turn an unknown URL into a soft 200.
await rm(path.join(output, 'reading.html'))
await rm(path.join(output, 'foundation.html'))
console.log(`Prerendered ${routes.length} routes (${fixture ? 'explicit local synthetic fixtures' : candidate ? 'LOCAL UNAPPROVED CANDIDATE PREVIEW; never deploy' : projection.entries.length ? `production; ${projection.entries.length} approved entries` : 'production-safe; no approved canonical content'}).`)
