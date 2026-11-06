import { test, expect } from '@playwright/test'
import { readFile, access } from 'node:fs/promises'
import archive from '../content/build-archive.json' with { type: 'json' }
import { auditPublic } from '../scripts/audit-public'
import { publicStaticRoutes } from '../src/public-routes'

test('default production output contains no local fixtures or private drafts', async () => {
  await auditPublic('dist')
  const manifest = JSON.parse(await readFile('dist/route-manifest.json', 'utf8'))
  expect(manifest).toEqual({ schemaVersion: 1, fixture: false, routes: [...publicStaticRoutes, archive.reviewPath, `${archive.reviewPath}investigations/`, `${archive.reviewPath}experiments/reveal-hidden-work/`], fragments: {} })
  const content = JSON.parse(await readFile('dist/public-content.json', 'utf8'))
  expect(content.entries).toEqual([])
  expect(content.relationships).toEqual([])
  await expect(access('dist/investigations/fixture-claims-handoff/index.html')).rejects.toThrow()
  await expect(access('dist/perspective/fixture-verse-spacing/index.html')).rejects.toThrow()
  await expect(access('dist/writing/review/the-bends.md')).rejects.toThrow()
  await expect(access('dist/docs/codex/page-review.json')).rejects.toThrow()
  await expect(access('dist/experiments/fixture-assumed-observed/index.html')).rejects.toThrow()
  await expect(access('dist/studio/index.html')).rejects.toThrow()
  await expect(access('dist/api/workspace')).rejects.toThrow()
  const home = await readFile('dist/index.html', 'utf8')
  expect(home).toContain('I investigate situations where outcomes are visible')
  expect(home).toContain('Test. Show. Enable.')
  expect(home).not.toContain('I swim upstream toward the problem.')
})
