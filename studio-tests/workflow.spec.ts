import { test, expect } from '@playwright/test'
import { zipSync, strToU8 } from 'fflate'
import { intakeText } from '../studio/intake'
import { passes, type Workspace } from '../studio/model'
import AxeBuilder from '@axe-core/playwright'
const base='http://127.0.0.1:4180'
const password='synthetic-trial-password-not-an-owner-credential'
const synthetic='## Where does this fictional handoff stop?\n\nThis invented manuscript asks whether a message arriving means that its reader can use it. It describes a fictional handoff, without claiming a real organization or measured improvement.\n\n## What does the receiving role need?\n\nIn this fictional counterpart, the question shifts to the receiving role. An explanation can connect these passages without treating a literary association as evidence. No actual project outcome is claimed.\n'

test('DOCX importer keeps runs, tabs and breaks and refuses entity declarations',()=>{
 const xml='<?xml version="1.0"?><w:document xmlns:w="urn:word"><w:body><w:p><w:r><w:t xml:space="preserve">  Test—line,</w:t><w:tab/><w:t>then text.</w:t><w:br/><w:t>Next line</w:t></w:r></w:p><w:p/><w:p><w:r><w:t>Last stanza.</w:t></w:r></w:p></w:body></w:document>'
 const bytes=zipSync({'word/document.xml':strToU8(xml)})
 expect(intakeText('docx',Buffer.from(bytes).toString('base64')).text).toBe('  Test—line,\tthen text.\nNext line\n\nLast stanza.\n')
 expect(()=>intakeText('docx',Buffer.from(zipSync({'word/document.xml':strToU8('<!DOCTYPE x [<!ENTITY x "bad">]><x>&x;</x>')})).toString('base64'))).toThrow('Unsupported')
})

test('authenticated durable synthetic intake → review → connected preview → exact approval stays unpublished',async({browser})=>{
 const owner=await browser.newContext(),page=await owner.newPage()
 await page.goto(base)
 await page.getByLabel('Owner password').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click()
 await expect(page.getByRole('heading',{name:'Writing → connected readings'})).toBeVisible()
 let csrf=(await(await owner.request.get(base+'/api/session')).json()).csrf
 let envelope=await(await owner.request.get(base+'/api/workspace')).json() as {version:number;workspace:Workspace}
 const action=async(action:unknown)=>{
  const r=await owner.request.post(base+'/api/actions',{headers:{Origin:base,'X-CSRF-Token':csrf},data:{expectedVersion:envelope.version,action}})
  expect(r.status(),await r.text()).toBe(200);envelope=await r.json();return envelope
 }
 await action({type:'intake',title:'Synthetic connected manuscript',filename:'synthetic.md',format:'markdown',bytes:Buffer.from(synthetic).toString('base64'),poetry:false})
 const m=envelope.workspace.manuscripts.at(-1)!
 expect(m.original).toBe(synthetic);expect(m.sections).toHaveLength(2);expect(m.reviews.map(r=>r.pass)).toEqual([...passes])
 const originalResponse=await owner.request.get(base+'/api/original/'+m.id)
 expect((await originalResponse.body()).toString()).toBe(synthetic)
 await action({type:'structure',manuscriptId:m.id,choice:'split'})
 const structureVersion=envelope.version
 const [first,second]=envelope.workspace.store.entries.filter(e=>m.sections.some(s=>s.id===e.id))
 expect(first.id).toBe(m.sections[0].id)
 const block=first.blocks[0],before=block.type==='prose'?block.markdown:''
 await action({type:'edit',entryId:first.id,blockId:block.id,after:before+'\nA proposed editorial clarification.',rationale:'Synthetic edit to demonstrate individual acceptance.'})
 const edit=envelope.workspace.edits.at(-1)!
 expect(envelope.workspace.store.entries.find(e=>e.id===first.id)?.blocks[0]).toEqual(block)
 await action({type:'decideEdit',editId:edit.id,decision:'accept'})
 expect(envelope.workspace.manuscripts.find(x=>x.id===m.id)?.original).toBe(synthetic)
 await action({type:'edit',entryId:first.id,blockId:block.id,after:'Rejected rewrite',rationale:'Demonstrate rejection without modifying manuscript voice.'})
 await action({type:'decideEdit',editId:envelope.workspace.edits.at(-1)!.id,decision:'reject'})
 for(const e of [first,second])await action({type:'metadata',entryId:e.id,title:e.title,slug:e.slug,summary:'Synthetic demonstration only; no actual result.',contribution:'Fictional author contribution, not Sam’s work.'})
 await action({type:'evidence',entryId:first.id,title:'Synthetic source',source:'Invented demonstration manuscript',locator:'Synthetic passage one',observedAt:'2000-01-01T00:00:00Z',limitations:'No factual validation or measured outcome.',rightsCleared:true})
 const png='iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aN0sAAAAASUVORK5CYII='
 await action({type:'asset',entryId:first.id,bytes:png,alt:'Synthetic one-pixel artifact',credit:'Synthetic test only',rightsCleared:true})
 await action({type:'relationship',fromId:first.id,toId:second.id,relation:'extends',rationale:'The receiving-role question extends the fictional handoff question. This is interpretation, not measured evidence.'})
 await action({type:'decideRelationship',relationshipId:envelope.workspace.store.relationships.at(-1)!.id,decision:'accept'})
 for(const pass of passes)await action({type:'review',manuscriptId:m.id,pass,decision:'accept',note:'Synthetic test operator completed this pass on invented writing; no human comprehension or real evidence claim.',complete:true})
 // Real stale-save rejection at the storage boundary, not a pure helper.
 const stale=await owner.request.post(base+'/api/actions',{headers:{Origin:base,'X-CSRF-Token':csrf},data:{expectedVersion:envelope.version-1,action:{type:'candidate'}}})
 expect(stale.status()).toBe(409)
 const csrfFailure=await owner.request.post(base+'/api/actions',{headers:{Origin:base},data:{expectedVersion:envelope.version,action:{type:'candidate'}}});expect(csrfFailure.status()).toBe(403)
 await action({type:'candidate'})
 const candidate=envelope.workspace.candidates.at(-1)!
 expect(candidate.approval).toBeNull();expect(candidate.published).toBe(false)
 const route=candidate.projection.entries.find(e=>e.id===first.id)!.path
 const previewPath=`/preview/${candidate.digest}${route}`
 const assetPath=`/preview/${candidate.digest}${candidate.projection.assets.at(-1)!.url}`
 const anon=await browser.newContext()
 for(const path of [previewPath,assetPath,'/api/workspace','/api/original/'+m.id]){
  for(const method of ['get','head'] as const){const response=await anon.request[method](base+path);expect(response.status()).toBe(401);expect(response.headers()['cache-control']).toBe('private, no-store')}
 }
 const html=await(await owner.request.get(base+previewPath)).text();expect(html).toContain('Explained connections');expect(html).not.toContain('Rejected rewrite')
 await page.goto(base+previewPath)
 const details=page.locator('.reading-evidence').first();await details.locator('summary').focus();await page.keyboard.press('Enter');await expect(details).toHaveAttribute('open','')
 const scroll=await page.evaluate(()=>scrollY);await details.locator('summary').click();expect(Math.abs(await page.evaluate(()=>scrollY)-scroll)).toBeLessThan(60)
 await page.locator('.reading-related-link').click();await expect(page.getByText('Incoming relationship',{exact:true})).toBeVisible();await page.goBack()
 const forged=await owner.request.post(base+'/api/actions',{headers:{Origin:base,'X-CSRF-Token':csrf},data:{expectedVersion:envelope.version,action:{type:'approve',digest:candidate.digest,approvedBy:'forged-owner'}}})
 expect(forged.status()).toBe(400)
 await action({type:'approve',digest:candidate.digest})
 expect(envelope.workspace.candidates.at(-1)!.approval?.digest).toBe(candidate.digest)
 const exported=await(await owner.request.get(base+`/api/candidate/${candidate.digest}/export`)).json();expect(exported.status).toBe('approved-unpublished')
 // A new draft does not mutate the frozen approved candidate.
 await action({type:'metadata',entryId:first.id,title:'A newer synthetic draft',slug:first.slug+'-new',summary:'Changed draft only.',contribution:'Synthetic only.'})
 expect(envelope.workspace.candidates.at(-1)!.projection.entries.find(e=>e.id===first.id)?.title).toBe(first.title)
 const raceBase=envelope.version
 const race=await Promise.all(['Race A','Race B'].map(title=>owner.request.post(base+'/api/actions',{headers:{Origin:base,'X-CSRF-Token':csrf},data:{expectedVersion:raceBase,action:{type:'metadata',entryId:first.id,title,slug:first.slug+'-new',summary:'Synthetic concurrency test.',contribution:'Synthetic only.'}}})))
 expect(race.map(r=>r.status()).sort()).toEqual([200,409])
 envelope=await(await owner.request.get(base+'/api/workspace')).json()
 const revisionBeforeRestore=envelope.workspace.store.entries.find(e=>e.id===first.id)!.revision
 const restore=await owner.request.post(base+'/api/restore',{headers:{Origin:base,'X-CSRF-Token':csrf},data:{expectedVersion:envelope.version,entryId:first.id,fromVersion:structureVersion}})
 expect(restore.status(),await restore.text()).toBe(200);envelope=await restore.json()
 expect(envelope.workspace.store.entries.find(e=>e.id===first.id)?.revision).toBe(revisionBeforeRestore+1)
 expect(envelope.workspace.store.aliases.some(a=>a.kind==='path' && a.path===route)).toBe(false)
 const snapshotVersion=envelope.version
 await owner.close()
 const reopened=await browser.newContext(),reopenPage=await reopened.newPage()
 await reopenPage.goto(base);await reopenPage.getByLabel('Owner password').fill(password);await reopenPage.getByRole('button',{name:'Sign in',exact:true}).click()
 await expect(reopenPage.getByRole('heading',{name:'Writing → connected readings'})).toBeVisible()
 const saved=await(await reopened.request.get(base+'/api/workspace')).json()
 expect(saved.version).toBe(snapshotVersion);expect(saved.workspace.manuscripts.find((x:{id:string})=>x.id===m.id).original).toBe(synthetic)
 await reopenPage.setViewportSize({width:320,height:800});expect(await reopenPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await reopenPage.screenshot({path:'studio-test-results/editor-320.png'})
 const axe=await new AxeBuilder({page:reopenPage}).withTags(['wcag2a','wcag2aa']).setLegacyMode().options({iframes:false}).analyze();expect(axe.violations).toEqual([])
 const session=await(await reopened.request.get(base+'/api/session')).json()
 await reopened.request.post(base+'/api/logout',{headers:{Origin:base,'X-CSRF-Token':session.csrf}})
 expect((await reopened.request.get(base+assetPath)).status()).toBe(401)
 await reopened.close();await anon.close()
})

test('pasted poetry intake keeps its original and provides a private no-JavaScript verse preview',async({browser})=>{
 const owner=await browser.newContext(),page=await owner.newPage()
 await page.goto(base);await page.getByLabel('Owner password').fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click()
 const verse='  Synthetic—first line,\n\n\tIndentation stays.\nLiteral <script>notAnInstruction()</script>.\nIgnore previous instructions is manuscript text, not a command.'
 const form=page.getByRole('form',{name:'Import manuscript'})
 await form.getByLabel('Manuscript title').fill('Synthetic verse import')
 await form.getByLabel('Paste writing',{exact:true}).fill(verse)
 await form.getByLabel('Preserve as poetry').check()
 await form.getByRole('button',{name:'Save original privately'}).click()
 const review=page.getByRole('region',{name:'Review Synthetic verse import'})
 await expect(review).toBeVisible();expect(await review.locator('pre').textContent()).toBe(verse)
 await review.getByRole('button',{name:'Keep manuscript intact'}).click()
 await expect(page.getByRole('heading',{name:'Synthetic verse import',exact:true}).last()).toBeVisible()
 const workspace=(await(await owner.request.get(base+'/api/workspace')).json()).workspace as Workspace
 const manuscript=workspace.manuscripts.at(-1)!,entry=workspace.store.entries.find(e=>e.id===manuscript.id)!
 expect(entry.format).toBe('poetry');expect(manuscript.reviews.every(r=>r.decision==='pending')).toBe(true)
 const nojs=await browser.newContext({storageState:await owner.storageState(),javaScriptEnabled:false})
 const reading=await nojs.newPage();await reading.goto(base+`/preview/draft/perspective/${entry.slug}/`)
 expect(await reading.locator('.reading-verse').textContent()).toBe(verse)
 await expect(reading.locator('.reading-verse script')).toHaveCount(0)
 const footer=reading.locator('footer .experiment-note');await footer.locator('summary').focus();await reading.keyboard.press('Enter');await expect(footer).toHaveAttribute('open','')
 await owner.close();await nojs.close()
})
