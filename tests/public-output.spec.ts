import { test, expect } from '@playwright/test'
import { readFile, access } from 'node:fs/promises'
import { auditPublic } from '../scripts/audit-public'

test('default production output contains no local fixtures or private drafts', async () => {
  await auditPublic('dist')
  const manifest = JSON.parse(await readFile('dist/route-manifest.json', 'utf8'))
  expect(manifest).toEqual({ schemaVersion: 1, fixture: false, routes: ['/', '/investigations/'], fragments: {} })
  const content = JSON.parse(await readFile('dist/public-content.json', 'utf8'))
  expect(content.entries).toEqual([])
  expect(content.relationships).toEqual([])
  await expect(access('dist/investigations/fixture-claims-handoff/index.html')).rejects.toThrow()
  expect(await readFile('dist/index.html', 'utf8')).toContain('I swim upstream toward the problem.')
})
