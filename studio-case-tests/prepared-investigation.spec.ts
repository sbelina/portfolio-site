import { test, expect } from '@playwright/test'
import { actionSchema, applyAction, draftProjection, emptyWorkspace, manuscriptForEntry, type Action, type Workspace } from '../studio/model'
import { workflowFixture } from '../tests/fixtures/workflow-content'

const original = 'Synthetic case source. The imagined requester can clarify a note before handing over a kit. No actual organization or finding is represented.'
const app = 'a'.repeat(40)
function source() {
  return applyAction(emptyWorkspace(), { type: 'intake', title: 'Synthetic prepared case', filename: 'synthetic.md', format: 'markdown', bytes: Buffer.from(original).toString('base64'), poetry: false }, 0, 'Synthetic operator', app)
}
function prepared(w: Workspace): Extract<Action, { type: 'prepareInvestigation' }> {
  const entry = workflowFixture()
  // This API scenario starts without supporting records; the public rendering
  // fixture's separately selected citation is covered by reading tests.
  for (const block of entry.blocks) if (block.type === 'workflow_comparison') {
    for (const view of [block.before, block.after]) view.stages.forEach(stage => { stage.evidenceIds = [] })
  }
  return { type: 'prepareInvestigation', manuscriptId: w.manuscripts[0].id, entryId: entry.id, expectedEntryRevision: null, title: entry.title, slug: entry.slug, summary: entry.summary, contribution: entry.contribution!, blocks: entry.blocks }
}

test('prepared investigations retain originals, canonical identity and pending review', () => {
  const input = source(); const action = prepared(input)
  const saved = applyAction(input, action, 1, 'Synthetic operator', app)
  const entry = saved.store.entries[0]
  expect(entry.kind).toBe('investigation'); expect(entry.visibility).toBe('restricted'); expect(entry.editorialState).toBe('draft')
  expect(entry.id).toBe(action.entryId); expect(entry.revision).toBe(1)
  expect(manuscriptForEntry(saved, entry.id).original).toBe(original)
  expect(saved.manuscripts[0].reviews.every(pass => pass.decision === 'pending')).toBe(true)
  expect(saved.candidates).toEqual([]); expect(input.store.entries).toEqual([])
  expect(actionSchema.safeParse({ ...action, visibility: 'public', publicationApproved: true }).success).toBe(false)
})

test('stale JSON, source takeover and missing references cannot replace a saved draft', () => {
  const input = source(); const action = prepared(input); const saved = applyAction(input, action, 1, 'Synthetic operator', app)
  expect(() => applyAction(saved, action, 2, 'Synthetic operator', app)).toThrow('Prepared draft changed')
  const other = applyAction(saved, { type: 'intake', title: 'Other source', filename: 'other.md', format: 'markdown', bytes: Buffer.from('Another synthetic source.').toString('base64'), poetry: false }, 2, 'Synthetic operator', app)
  expect(() => applyAction(other, { ...action, manuscriptId: other.manuscripts[1].id, expectedEntryRevision: 1 }, 3, 'Synthetic operator', app)).toThrow('another original')
  expect(() => applyAction(saved, { ...action, expectedEntryRevision: 1, evidenceIds: ['bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'] }, 2, 'Synthetic operator', app)).toThrow('missing private evidence')
  const renamed = applyAction(saved, { ...action, expectedEntryRevision: 1, slug: 'renamed-fixture' }, 2, 'Synthetic operator', app)
  expect(renamed.store.entries[0].revision).toBe(2)
  expect(renamed.store.aliases.some(alias => alias.kind === 'path' && alias.path === '/investigations/fixture-checkpoint-study/')).toBe(true)
})

test('private draft projection retains investigation and measurement definitions', () => {
  const w = source(); const action = prepared(w); const saved = applyAction(w, action, 1, 'Synthetic operator', app)
  saved.store.entries[0].investigation = { schemaVersion: 1, composition: 'boundary', visual: { left: 'Sent', right: 'Checked', explanation: 'Synthetic conceptual account.' }, limitations: 'No observed outcome.', statements: [] }
  saved.store.evidence.push({ schemaVersion: 1, id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', revision: 1, visibility: 'restricted', reviewState: 'proposed', title: 'Synthetic measurement', source: 'Invented fixture', locator: 'Local synthetic script', observedAt: '2000-01-01T00:00:00Z', role: 'context', limitations: 'Invented metric metadata only.', rights: 'pending', redaction: 'pending', kind: 'metric', assetIds: [], measurement: { unit: 'fictional items', denominator: 'synthetic set', period: 'fixture only', baseline: 'not a comparison', method: 'invented count' } })
  const projection = draftProjection(saved)
  expect(projection.entries[0].investigation).toEqual(saved.store.entries[0].investigation)
  expect(projection.evidence[0].measurement).toEqual(saved.store.evidence[0].measurement)
})

test('authenticated case saves reopen, reject stale writes, and protect script-free previews', async ({ browser, baseURL }) => {
  const base = baseURL!; const owner = await browser.newContext(); const anonymous = await browser.newContext()
  try {
    const signed = await owner.request.post(base + '/api/login', { headers: { Origin: base }, data: { password: 'synthetic-trial-password-not-an-owner-credential' } })
    expect(signed.status()).toBe(200); const { csrf } = await signed.json()
    let envelope = await (await owner.request.get(base + '/api/workspace')).json() as { version: number; workspace: Workspace }
    const send = async (action: Action) => {
      const result = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version, action } })
      expect(result.status(), await result.text()).toBe(200); envelope = await result.json(); return envelope
    }
    await send({ type: 'intake', title: 'Synthetic prepared API original', filename: 'synthetic.md', format: 'markdown', bytes: Buffer.from(original).toString('base64'), poetry: false })
    const action = prepared(envelope.workspace); await send(action)
    const path = '/preview/draft/investigations/fixture-checkpoint-study/'
    expect((await anonymous.request.get(base + path)).status()).toBe(401)
    expect((await anonymous.request.head(base + path)).status()).toBe(401)
    expect((await anonymous.request.get(base + '/preview.css')).status()).toBe(401)
    const preview = await owner.request.get(base + path); expect(preview.status()).toBe(200)
    expect(preview.headers()['cache-control']).toContain('no-store')
    const html = await preview.text(); expect(html).toContain('data-edition="current"'); expect(html).toContain('Earlier verification'); expect(html).not.toContain('<script')
    const page = await owner.newPage(); await page.goto(base + path)
    await page.locator('.workflow-choice-label').filter({ hasText: 'Late verification' }).click()
    await expect(page.getByRole('radio', { name: 'Late verification', exact: true })).toBeChecked()
    const stale = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version - 1, action } })
    expect(stale.status()).toBe(409)
    const staleEntry = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version, action } })
    expect(staleEntry.status()).toBe(409)
    const next = { ...action, expectedEntryRevision: 1, summary: 'A changed synthetic draft summary.' }
    await send(next); expect(envelope.workspace.store.entries[0].revision).toBe(2)
    const fresh = await browser.newContext()
    try {
      expect((await fresh.request.post(base + '/api/login', { headers: { Origin: base }, data: { password: 'synthetic-trial-password-not-an-owner-credential' } })).status()).toBe(200)
      const reopened = await (await fresh.request.get(base + '/api/workspace')).json()
      expect(reopened.workspace.store.entries[0].summary).toBe(next.summary)
      expect(reopened.workspace.manuscripts[0].original).toBe(original)
      expect(reopened.workspace.candidates).toEqual([])
    } finally { await fresh.close() }
  } finally { await owner.close(); await anonymous.close() }
})
