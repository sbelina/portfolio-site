import { test, expect, type BrowserContext, type Page } from '@playwright/test'
import { passes, type Workspace } from '../studio/model'

const base = 'http://127.0.0.1:4182'
const password = 'synthetic-trial-password-not-an-owner-credential'
const verse = '  Invented—paper,\n\n\tA second invented line.\nLiteral <script>notAnInstruction()</script>.\nNo real manuscript or evidence is represented.'
type Envelope = { version: number; workspace: Workspace }
async function signIn(context: BrowserContext, page: Page) {
  await page.goto(base)
  await page.getByLabel('Owner password').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Writing → connected readings' })).toBeVisible()
}

test('real inquiry and pairing forms persist privately; stale writes and anonymous bytes deny; exact approval stays frozen and unpublished', async ({ browser }) => {
  const owner = await browser.newContext(), page = await owner.newPage()
  await signIn(owner, page)
  let envelope = await (await owner.request.get(base + '/api/workspace')).json() as Envelope
  const csrf = (await (await owner.request.get(base + '/api/session')).json()).csrf
  const action = async (value: unknown) => {
    const response = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version, action: value } })
    expect(response.status(), await response.text()).toBe(200)
    envelope = await response.json()
  }
  for (const [title, text] of [['Synthetic inquiry poem', verse], ['Synthetic counterpart', 'An invented counterpart; no actual observation or measured outcome.']]) {
    await action({ type: 'intake', title, filename: 'invented.txt', format: 'text', bytes: Buffer.from(text).toString('base64'), poetry: true })
    await action({ type: 'structure', manuscriptId: envelope.workspace.manuscripts.at(-1)!.id, choice: 'intact' })
  }
  const [first, second] = envelope.workspace.store.entries
  const firstManuscript = envelope.workspace.manuscripts.find(m => m.id === first.id)!
  for (const entry of [first, second]) await action({ type: 'metadata', entryId: entry.id, title: entry.title, slug: entry.slug, summary: 'Synthetic test of private inquiry authoring only.', contribution: '' })
  // An actual asset makes anonymous byte denial meaningful, rather than testing
  // an arbitrary nonexistent URL. Only an invented one-pixel PNG is used.
  await action({ type: 'asset', entryId: first.id, bytes: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN0sAAAAASUVORK5CYII=', alt: 'Invented one-pixel test', credit: 'Synthetic test fixture', rightsCleared: true })
  await page.reload()
  const metadata = page.getByRole('form', { name: 'Inquiry presentation Synthetic inquiry poem', exact: true })
  await page.getByText('Shape an inquiry fragment or exhibit', { exact: true }).first().click()
  await metadata.getByLabel('Use inquiry-space presentation').check()
  await metadata.getByLabel('Creative form').selectOption('expression')
  await metadata.getByLabel('Mode of this account').selectOption('expression')
  await metadata.getByLabel('Feature in the curated inquiry space after exact publication approval').check()
  // All explanatory fields are deliberately blank: expression does not need an
  // invented evidence narrative merely to be saved and reviewed.
  await Promise.all([page.waitForResponse(r => r.url().endsWith('/api/actions') && r.request().method() === 'POST'), metadata.getByRole('button', { name: 'Save inquiry presentation as draft' }).click()])
  await expect(page.locator('.status[role="status"]')).toContainText('Durably saved revision')
  await page.getByText('Author a speculative or supported pairing', { exact: true }).click()
  const pairing = page.getByRole('form', { name: 'Author an exploratory pairing', exact: true })
  await pairing.getByLabel('First entry').selectOption(first.id)
  await pairing.getByLabel('Second entry').selectOption(second.id)
  await pairing.getByLabel('Kind of connection').selectOption('resonance')
  await pairing.getByLabel('What might connect them?').fill('These invented texts share a paper image; this is a speculative literary resonance.')
  await pairing.getByLabel('Where does the comparison break?').fill('Shared imagery is not evidence of the same situation or a causal relationship.')
  await pairing.getByLabel('A question it opens (optional)').fill('How does a repeated image change a question?')
  await pairing.getByLabel('Feature this pairing after exact publication approval').check()
  await Promise.all([page.waitForResponse(r => r.url().endsWith('/api/actions') && r.request().method() === 'POST'), pairing.getByRole('button', { name: 'Save exploratory proposal' }).click()])
  await expect(page.getByRole('button', { name: 'Accept connection', exact: true })).toBeVisible()
  await Promise.all([page.waitForResponse(r => r.url().endsWith('/api/actions') && r.request().method() === 'POST'), page.getByRole('button', { name: 'Accept connection', exact: true }).click()])
  await expect(page.locator('.status[role="status"]')).toContainText('Durably saved revision')
  const origin = metadata.getByLabel('Origin (optional public context)')
  await origin.fill('UNSAVED_SYNTHETIC_INQUIRY_BUFFER — retain until explicit reload.')
  const ordinaryMetadata = page.getByRole('form', { name: 'Metadata Synthetic inquiry poem', exact: true })
  await ordinaryMetadata.getByLabel('Summary').fill('An independently updated synthetic summary, not an outcome.')
  await Promise.all([page.waitForResponse(r => r.url().endsWith('/api/actions') && r.request().method() === 'POST'), ordinaryMetadata.getByRole('button', { name: 'Save entry metadata', exact: true }).click()])
  await expect(origin).toHaveValue('UNSAVED_SYNTHETIC_INQUIRY_BUFFER — retain until explicit reload.')
  let staleBufferRequests = 0
  const countMutation = (request: import('@playwright/test').Request) => { if (request.url().endsWith('/api/actions') && request.method() === 'POST') staleBufferRequests++ }
  page.on('request', countMutation)
  await metadata.getByRole('button', { name: 'Save inquiry presentation as draft' }).click()
  await expect(metadata.getByRole('alert')).toContainText('Saved entry revision changed')
  expect(staleBufferRequests).toBe(0)
  page.off('request', countMutation)
  await expect(origin).toHaveValue('UNSAVED_SYNTHETIC_INQUIRY_BUFFER — retain until explicit reload.')
  await metadata.getByRole('button', { name: 'Reload saved inquiry presentation', exact: true }).click()
  await expect(origin).toHaveValue('')
  envelope = await (await owner.request.get(base + '/api/workspace')).json()
  const saved = envelope.workspace.store.entries.find(e => e.id === first.id)!
  expect(saved.inquirySpace).toEqual({ schemaVersion: 1, presentation: 'fragment', form: 'expression', epistemicMode: 'expression', featured: true })
  const relation = envelope.workspace.store.relationships.at(-1)!
  expect(relation).toMatchObject({ type: 'paired_with', fromId: first.id, toId: second.id, reviewState: 'approved', provenance: 'owner', exploration: { level: 'resonance', featured: true } })
  expect(relation.exploration?.boundary).toContain('not evidence')
  expect(relation.exploration?.usefulQuestion).toBe('How does a repeated image change a question?')
  const stalePairing = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version, action: { type: 'reviseRelationship', relationshipId: relation.id, expectedRevision: relation.revision - 1, relation: 'paired_with', rationale: relation.rationale, exploration: relation.exploration, evidenceIds: [] } } })
  expect(stalePairing.status()).toBe(409)
  expect((await stalePairing.json()).error).toMatch(/revision|changed|reload|stale/i)
  expect(saved.blocks.find(b => b.type === 'verse')).toMatchObject({ text: verse })
  const originalPath = '/api/original/' + firstManuscript.id
  expect(await (await owner.request.get(base + originalPath)).text()).toBe(verse)
  const stale = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version - 1, action: { type: 'candidate' } } })
  expect(stale.status()).toBe(409)
  for (const manuscript of envelope.workspace.manuscripts) for (const pass of passes) await action({ type: 'review', manuscriptId: manuscript.id, pass, decision: 'accept', note: 'Synthetic automated trial only: invented complete unit and private rights, not a human editorial approval.', complete: true })
  await action({ type: 'candidate' })
  const candidate = envelope.workspace.candidates.at(-1)!
  expect(candidate).toMatchObject({ approval: null, published: false, releaseEligible: false })
  const frozen = structuredClone(candidate)
  const route = candidate.projection.entries.find(e => e.id === first.id)!.path
  const previewPath = `/preview/${candidate.digest}${route}`
  const assetPath = `/preview/${candidate.digest}${candidate.projection.assets.at(-1)!.url}`
  const anonymous = await browser.newContext()
  for (const path of [previewPath, assetPath, originalPath, '/api/workspace']) for (const method of ['get', 'head'] as const) {
    const response = await anonymous.request[method](base + path)
    expect(response.status()).toBe(401)
    expect(response.headers()['cache-control']).toBe('private, no-store')
  }
  const protectedHtml = await (await owner.request.get(base + previewPath)).text()
  expect(protectedHtml).toContain('href="https://producingcuriosity.com/lab/atlas/je-ne-sais-qua/"')
  expect(protectedHtml).not.toContain(`href="/preview/${candidate.digest}/lab/atlas/je-ne-sais-qua/"`)
  const nojs = await browser.newContext({ storageState: await owner.storageState(), javaScriptEnabled: false, reducedMotion: 'reduce', viewport: { width: 320, height: 800 } })
  const reading = await nojs.newPage()
  await reading.goto(base + previewPath)
  expect(await reading.locator('.reading-verse').textContent()).toBe(verse)
  await expect(reading.locator('.reading-verse script')).toHaveCount(0)
  expect(await reading.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await action({ type: 'approve', digest: candidate.digest })
  expect(envelope.workspace.candidates.at(-1)).toMatchObject({ digest: candidate.digest, published: false, releaseEligible: false, approval: { digest: candidate.digest } })
  expect((await (await owner.request.get(base + `/api/candidate/${candidate.digest}/export`)).json()).status).toBe('approved-unpublished')
  await action({ type: 'inquiryMetadata', entryId: first.id, expectedRevision: envelope.workspace.store.entries.find(e => e.id === first.id)!.revision, value: { ...saved.inquirySpace!, form: 'question', epistemicMode: 'open_question', unresolvedQuestion: 'A later invented draft question.' } })
  const stillFrozen = envelope.workspace.candidates.at(-1)!
  expect(stillFrozen.projection).toEqual(frozen.projection)
  expect(stillFrozen.digest).toBe(frozen.digest)
  expect(stillFrozen.published).toBe(false)
  const invalidated = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version, action: { type: 'candidate' } } })
  expect(invalidated.status()).toBe(400)
  expect((await invalidated.json()).error).toContain('re-review after edits')
  const staleEntryRevision = await owner.request.post(base + '/api/actions', { headers: { Origin: base, 'X-CSRF-Token': csrf }, data: { expectedVersion: envelope.version, action: { type: 'inquiryMetadata', entryId: first.id, expectedRevision: saved.revision, value: saved.inquirySpace } } })
  expect(staleEntryRevision.status()).toBe(409)
  expect((await staleEntryRevision.json()).error).toMatch(/revision|changed|reload|stale/i)
  const finalVersion = envelope.version
  await owner.close()
  // A fresh authenticated browser session reads durable D1 state, not a carried
  // browser state snapshot or localStorage substitute.
  const reopened = await browser.newContext(), reopenPage = await reopened.newPage()
  await signIn(reopened, reopenPage)
  const fresh = await (await reopened.request.get(base + '/api/workspace')).json() as Envelope
  expect(fresh.version).toBe(finalVersion)
  expect(fresh.workspace.store.entries.find(e => e.id === first.id)?.inquirySpace).toMatchObject({ form: 'question', epistemicMode: 'open_question' })
  expect(fresh.workspace.store.relationships.at(-1)?.exploration).toEqual(relation.exploration)
  expect(fresh.workspace.manuscripts.find(m => m.id === first.id)?.original).toBe(verse)
  expect(fresh.workspace.candidates.at(-1)?.projection).toEqual(frozen.projection)
  const session = await (await reopened.request.get(base + '/api/session')).json()
  await reopened.request.post(base + '/api/logout', { headers: { Origin: base, 'X-CSRF-Token': session.csrf } })
  expect((await reopened.request.get(base + assetPath)).status()).toBe(401)
  await reopened.close(); await anonymous.close(); await nojs.close()
})
