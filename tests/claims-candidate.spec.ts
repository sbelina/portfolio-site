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
  ...(claimsCandidate.investigation!.figures ?? []).flatMap(figure => [figure.value, figure.unit, figure.label, figure.qualifier]),
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
  expect(figures.map(figure => `${figure.value} ${figure.unit}`)).toEqual(['~30 views a month', '~6 new hires a quarter', '2+ years in use, several offices'])
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
