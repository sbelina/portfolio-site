import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import React from 'react'
import { renderToString } from 'react-dom/server'
import AxeBuilder from '@axe-core/playwright'
import { fixtureStore, fixtureProjection } from './fixtures/reading-content'
import { investigationSchema } from '../src/content/investigation'
import { validateCandidateProjection, digestRecord } from '../src/content/projection'
import type { ContentStore, ReleaseManifest } from '../src/content/model'
import { readingPageData } from '../src/reading/page-data'
import { InvestigationNarrative } from '../src/reading/InvestigationNarrative'

const narrative = () => structuredClone(fixtureProjection().entries.find(e=>e.investigation)!.investigation!)
function selectedStore() {
  const input = structuredClone(fixtureStore)
  input.entries = [input.entries[0]]; input.relationships = []; input.aliases = []
  input.entries[0].investigation = narrative()
  return input
}
function selection(store: ContentStore): ReleaseManifest {
  const refs = (records: {id:string;revision:number}[])=>records.map(record=>({id:record.id,revision:record.revision,digest:digestRecord(record)}))
  return { schemaVersion:1, releaseId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', applicationRevision:'a'.repeat(40),contentRevision:'b'.repeat(40), entries:refs(store.entries),relationships:refs(store.relationships),evidence:refs(store.evidence),assets:refs(store.assets),aliases:refs(store.aliases) }
}
test('narrative validates classifications, rejects duplicate IDs and unknown types',()=>{
  const data=narrative();expect(investigationSchema.safeParse(data).success).toBe(true)
  expect(investigationSchema.safeParse({...data, statements:[...data.statements,...data.statements]}).success).toBe(false)
  expect(investigationSchema.safeParse({...data, statements:[{...data.statements[0],kind:'proven_cause'}]}).success).toBe(false)
  expect(investigationSchema.safeParse({...data, executable:'alert(1)'}).success).toBe(false)
})
test('selection rejects private sources, unverified claims, impact without metrics and incomplete narratives',()=>{
  for(const mutation of ['private','unverified','measurement','incomplete'] as const){
    const input=selectedStore(); const data=input.entries[0].investigation!
    if(mutation==='private') input.evidence[0].visibility='restricted'
    if(mutation==='unverified')data.statements[0].kind='unverified'
    if(mutation==='measurement'){data.statements[0].kind='measured_result';data.statements[0].contribution='measured_impact'}
    if(mutation==='incomplete')delete data.limitations
    expect(()=>validateCandidateProjection(input,selection(input))).toThrow()
  }
  const input=selectedStore();input.entries[0].evidenceIds=[];input.entries[0].blocks=[]
  const release=selection(input);release.evidence=[]
  expect(()=>validateCandidateProjection(input,release)).toThrow('Statement references unselected evidence')
})
test('draft changes invalidate the exact selection; narrative payload excludes unrelated manuscripts',()=>{
  const input=selectedStore();const release=selection(input)
  input.entries[0].investigation!.statements[0].text='A changed candidate.'
  expect(()=>validateCandidateProjection(input,release)).toThrow('changed after candidate approval')
  const projection=structuredClone(fixtureProjection());const current=projection.entries.find(e=>e.investigation)!
  const before=readingPageData(projection,'entry',true,current.id)
  projection.entries.push({...current,id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',path:'/investigations/unrelated/',slug:'unrelated',blocks:[{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',type:'prose',markdown:'UNRELATED_BODY_30'}],investigation:{...narrative(),limitations:'UNRELATED_NARRATIVE_30'}})
  expect(readingPageData(projection,'entry',true,current.id)).toEqual(before)
  expect(JSON.stringify(before)).not.toContain('UNRELATED_')
})
test('narrative renders literal text safely and production contains no synthetic manuscripts',async()=>{
  const data=narrative();data.observedCondition='<script>window.bad=true</script>'
  const html=renderToString(React.createElement(InvestigationNarrative,{narrative:data,evidence:[]}))
  expect(html).toContain('&lt;script&gt;');expect(html).not.toContain('<script>')
  const output=await readFile('dist/public-content.json','utf8');expect(JSON.parse(output).entries).toEqual([])
  expect(await readFile('dist/index.html','utf8')).not.toMatch(/\bSam\b|18% → 7.6%|Investigate\. Translate\. Implement\./)
})
test('static reading, conceptual comparisons and inquiry disclosures work at narrow width',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:740},reducedMotion:'reduce'})
  try{const page=await context.newPage();await page.goto('/#practice')
    const trigger=page.getByText('Inspect an illustrative model revision',{exact:true});await trigger.focus();await page.keyboard.press('Enter')
    await expect(page.getByText('Initial explanation:',{exact:false})).toBeVisible()
    await page.goto('/investigations/fixture-claims-handoff/')
    await expect(page.getByRole('heading',{name:'Evidence distinctions'})).toBeVisible()
    const source=page.getByText('Inspect source: Synthetic handoff scenario',{exact:true});await source.focus();await page.keyboard.press('Enter')
    await expect(source.locator('..')).toHaveAttribute('open','')
    await page.evaluate(()=>{document.documentElement.style.fontSize='200%'})
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await page.screenshot({path:'/tmp/oct30-investigation-mobile.png',fullPage:true})
  }finally{await context.close()}
})
test('new connections and method support touch and have no automated accessibility violations',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,hasTouch:true,isMobile:true,viewport:{width:390,height:844},reducedMotion:'reduce'})
 try{const page=await context.newPage();await page.goto('/#work')
   const section=page.locator('.explained-connections');const first=section.locator('summary').first();await first.tap();await expect(first.locator('..')).toHaveAttribute('open','')
   expect((await new AxeBuilder({page}).include('.explained-connections').include('.inquiry-method').include('.investigation-visual').analyze()).violations).toEqual([])
 }finally{await context.close()}
})
