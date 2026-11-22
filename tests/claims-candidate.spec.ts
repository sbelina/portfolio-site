import { expect, test } from '@playwright/test'
import { access, readFile } from 'node:fs/promises'
import { entrySchema } from '../src/content/model'
import { digestRecord, validateCandidateProjection } from '../src/content/projection'
import { claimsCandidate, claimsCandidatePreviewProjection, claimsCandidateToken } from '../content/candidates/claims-operations'
import { forbiddenPublicMarkers } from '../scripts/audit-public'

const prose = () => [
  claimsCandidate.title, claimsCandidate.summary, claimsCandidate.contribution ?? '',
  ...Object.values(claimsCandidate.investigation!).filter((value): value is string => typeof value === 'string'),
  claimsCandidate.investigation!.visual.left, claimsCandidate.investigation!.visual.right, claimsCandidate.investigation!.visual.explanation,
  ...claimsCandidate.investigation!.statements.flatMap(statement => [statement.text, statement.limitation]),
  ...Object.values(claimsCandidate.investigation!.brief ?? {}),
  // Figure values are checked separately below: an owner-approved rounded total (700+) may have three digits.
  ...(claimsCandidate.investigation!.figures ?? []).flatMap(figure => [figure.unit, figure.label, figure.qualifier]),
  ...claimsCandidate.blocks.flatMap(block => block.type === 'callout' ? [block.label, block.markdown.replace(claimsCandidateToken, '')] : []),
].join('\n')

test('Claims candidate is a valid, unapproved, restricted entry with the reserved identity', () => {
  const parsed = entrySchema.parse(claimsCandidate)
  expect(parsed.id).toBe('6c2f9e3e-23c0-4362-ada4-7d18a6ed998a')
  expect(parsed.slug).toBe('claims-operations')
  expect(parsed.editorialState).toBe('review')
  expect(parsed.visibility).toBe('restricted')
  expect(forbiddenPublicMarkers).toContain(claimsCandidateToken)
  expect(claimsCandidate.blocks.some(block => block.type === 'callout' && block.markdown.includes(claimsCandidateToken))).toBe(true)
})

test('the approval boundary rejects the candidate even when it is explicitly selected', () => {
  const store = { entries: [claimsCandidate], relationships: [], evidence: [], assets: [], aliases: [] }
  const manifest = {
    schemaVersion: 1 as const, releaseId: '0f4f8a52-3c1d-4f7e-9a51-1d2b3c4d5e6f',
    applicationRevision: 'a'.repeat(40), contentRevision: 'b'.repeat(40),
    entries: [{ id: claimsCandidate.id, revision: claimsCandidate.revision, digest: digestRecord(claimsCandidate) }],
    relationships: [], evidence: [], assets: [], aliases: [],
  }
  expect(() => validateCandidateProjection(store, manifest)).toThrow('not approved public content')
  // Factual statements carry no sources yet, so even an approved revision could not be selected as written.
  const factual = claimsCandidate.investigation!.statements.filter(statement => ['direct_observation', 'measured_result', 'documented_outcome'].includes(statement.kind))
  expect(factual.length).toBeGreaterThan(0)
  for (const statement of factual) expect(statement.evidenceIds).toEqual([])
  expect(claimsCandidate.investigation!.statements.some(statement => statement.kind === 'measured_result')).toBe(false)
})

test('candidate wording uses only rounded estimates, withholds rework figures and names no vendor', () => {
  const text = prose()
  expect(text).not.toMatch(/\d{3,}/)
  expect(text).not.toMatch(/\d\s?%/)
  expect(text).not.toContain('IAA')
  expect(text).toContain('neither is shown and they are never compared')
  const figures = claimsCandidate.investigation!.figures ?? []
  // 700+ is the owner-approved headline for the guide (18 November): a rounded estimate, never a precise count.
  expect(figures.map(figure => `${figure.value} ${figure.unit}`)).toEqual(['700+ views since it was shared', '~6 new hires a quarter', '2+ years in use across four offices'])
  for (const figure of figures) expect(figure.value).not.toMatch(/\d{4,}|\d[.,]\d/)
  expect(figures[0].value).toMatch(/^\d+0\+$/) // rounded to tens, with a plus
  for (const figure of figures) {
    expect(figure.basis).toBe('owner_estimate')
    expect(figure.value).toMatch(/^(?:~|\d+\+$)/)
  }
  expect(claimsCandidate.investigation!.notOwned).toContain('I didn’t own the decision')
})

test('preview projection is local-only and production output excludes the Claims page', async () => {
  expect(claimsCandidatePreviewProjection().entries.map(entry => entry.path)).toEqual(['/investigations/claims-operations/'])
  await expect(access('dist/investigations/claims-operations/index.html')).rejects.toThrow()
  const content = JSON.parse(await readFile('dist/public-content.json', 'utf8'))
  expect(content.entries).toEqual([])
  const release = JSON.parse(await readFile('content/public-release.json', 'utf8'))
  expect(release.status).toBe('no-approved-content')
})

test('figures cannot be published without selected evidence, even in an otherwise approved entry', () => {
  const approvedShape = { ...structuredClone(claimsCandidate), editorialState: 'approved' as const, visibility: 'public' as const, authorIds: ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'] }
  const store = { entries: [approvedShape], relationships: [], evidence: [], assets: [], aliases: [] }
  const manifest = {
    schemaVersion: 1 as const, releaseId: '0f4f8a52-3c1d-4f7e-9a51-1d2b3c4d5e6f',
    applicationRevision: 'a'.repeat(40), contentRevision: 'b'.repeat(40),
    entries: [{ id: approvedShape.id, revision: approvedShape.revision, digest: digestRecord(approvedShape) }],
    relationships: [], evidence: [], assets: [], aliases: [],
  }
  expect(() => validateCandidateProjection(store, manifest)).toThrow('Figures require selected evidence')
})

test('a case reads result first: at a glance, the four questions, what I would do differently, then How I know', async () => {
  const { renderToStaticMarkup } = await import('react-dom/server')
  const React = await import('react')
  const { InvestigationNarrative, narrativeContents } = await import('../src/reading/InvestigationNarrative')
  const narrative = claimsCandidate.investigation!
  const html = renderToStaticMarkup(React.createElement(InvestigationNarrative, { narrative, evidence: [] }))
  const headings = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/g)].map(match => match[1].replace(/<[^>]+>/g, ''))
  const order = ['At a glance', 'Figures', 'What was the problem', 'How I knew', 'What I did', 'What changed', 'What I’d do differently', 'How I know']
  expect(headings.filter(heading => order.includes(heading))).toEqual(order)
  // The glance opens with the result, not the method or the caveats.
  expect(html.match(/<dl>.*?<dt>(.*?)<\/dt>/)![1]).toBe('What changed')
  // Caveats sit inside How I know, after What changed.
  for (const caveat of ['What I didn’t own', 'How this was measured', 'Limitations']) expect(html.indexOf(`<h3>${caveat}</h3>`)).toBeGreaterThan(html.indexOf('>What changed</h2>'))
  expect(narrativeContents(narrative).map(item => item.title)).toEqual(['At a glance', 'Service blueprint: before and after', 'What was the problem', 'How I knew', 'What I did', 'What changed', 'What I’d do differently', 'How I know'])
  expect(narrative.differently).toMatch(/^I would /)
})

test('the Claims service blueprint is valid, labelled as reconstructed, result-first and safe to show', async () => {
  const { blueprintSchema } = await import('../src/content/investigation')
  const { renderToStaticMarkup } = await import('react-dom/server')
  const React = await import('react')
  const { ServiceBlueprint } = await import('../src/reading/ServiceBlueprint')
  const blueprint = claimsCandidate.investigation!.blueprint!
  expect(blueprintSchema.parse(blueprint)).toEqual(blueprint)
  // A cell that names a lane that does not exist is rejected.
  const broken = structuredClone(blueprint)
  broken.views[0].stages[0].cells[0].lane = 'nobody'
  expect(blueprintSchema.safeParse(broken).success).toBe(false)
  // Made now, not at the time: the artifact says so, and the page always shows it.
  expect(blueprint.provenance).toMatch(/^Reconstructed for this portfolio from project notes/)
  const html = renderToStaticMarkup(React.createElement(ServiceBlueprint, { blueprint }))
  expect(html).toContain(blueprint.provenance)
  // What changed comes first; both views are in the HTML for no-JavaScript and print.
  expect(html.indexOf('data-view="after"')).toBeLessThan(html.indexOf('data-view="before"'))
  // Every mark is spoken in words, not only by colour or symbol.
  for (const cell of blueprint.views.flatMap(view => view.stages.flatMap(stage => stage.cells)).filter(cell => cell.mark)) {
    expect(html).toContain(`<strong>${cell.mark === 'failure' ? 'Failure point' : 'Changed'}:</strong> ${cell.text.replaceAll('’', '’')}`)
  }
  // The move is the point: the check comes before payment after, and after payment before.
  const order = (id: 'before' | 'after') => blueprint.views.find(view => view.id === id)!.stages.map(stage => stage.label)
  expect(order('before').indexOf('Payment')).toBeLessThan(order('before').indexOf('Salvage check'))
  expect(order('after').indexOf('Salvage check')).toBeLessThan(order('after').indexOf('Payment'))
  // External-safe: no vendor name, no exact figures.
  expect(JSON.stringify(blueprint)).not.toMatch(/IAA|Insurance Auto Auctions|Copart/)
  expect(JSON.stringify(blueprint.views)).not.toMatch(/\d{2,}/)
})

test('status tags and headline figures refuse date call-outs, and the strip shows only approved headlines', async () => {
  const { investigationSchema } = await import('../src/content/investigation')
  const narrative = claimsCandidate.investigation!
  expect(narrative.status).toEqual({ kind: 'in_use', label: 'In use 2+ years across four offices' })
  expect(narrative.deepDive).toBe(true)
  expect(investigationSchema.safeParse({ ...narrative, status: { kind: 'adopted', label: 'Adopted by July 2026' } }).success).toBe(false)
  const dated = structuredClone(narrative)
  dated.figures![0] = { ...dated.figures![0], label: 'Views by November 2026' }
  expect(investigationSchema.safeParse(dated).success).toBe(false)
  // Renders: nothing without approved headlines; otherwise each figure keeps its basis and case link.
  const { renderToStaticMarkup } = await import('react-dom/server')
  const React = await import('react')
  const { ResultsStrip } = await import('../src/design/ResultsStrip')
  expect(renderToStaticMarkup(React.createElement(ResultsStrip, { investigations: [] }))).toBe('')
  const headlines = narrative.figures!.filter(figure => figure.headline).map(({ id, value, unit, label, basis, qualifier }) => ({ id, value, unit, label, basis, qualifier }))
  const html = renderToStaticMarkup(React.createElement(ResultsStrip, { investigations: [{ id: claimsCandidate.id, path: '/investigations/claims-operations/', title: claimsCandidate.title, summary: claimsCandidate.summary, headlines }] }))
  expect(html).toContain('What changed')
  for (const figure of headlines) expect(html).toContain(figure.value)
  expect(html).toContain('Approximate · my estimate')
  expect(html).toContain('href="/investigations/claims-operations/"')
  // Production has no approved case, so the live homepage shows no strip and no status tag.
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).not.toContain('pc-results')
  expect(home).not.toContain('case-status')
})
