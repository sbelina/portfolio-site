import { test, expect } from '@playwright/test'
import { buildPublicProjection, digestRecord } from '../src/content/projection'
import type { ContentStore, ReleaseManifest } from '../src/content/model'
import { inquiryFixtureStore } from './fixtures/inquiry-content'
import { readingPageData } from '../src/reading/page-data'

const refs=<T extends {id:string;revision:number}>(values:T[])=>values.map(value=>({id:value.id,revision:value.revision,digest:digestRecord(value)}))
function candidate(store:ContentStore){return {schemaVersion:1,releaseId:'b4000000-0000-4000-8000-000000000001',applicationRevision:'0'.repeat(40),contentRevision:'0'.repeat(40),entries:refs(store.entries.filter(entry=>entry.revision===1)),relationships:refs(store.relationships),evidence:refs(store.evidence),assets:refs(store.assets),aliases:refs(store.aliases)} satisfies ReleaseManifest}
function project(store:ContentStore,manifest=candidate(store)){return buildPublicProjection(store,manifest,[{candidateDigest:digestRecord(manifest),approvedBy:'synthetic-test-approver-not-an-owner-approval',approvedAt:'2000-01-01T00:00:00Z'}])}

test('selected creative fragments preserve their mode and whitespace without professional-impact copy',()=>{
 const store=structuredClone(inquiryFixtureStore),projection=project(store)
 expect(projection.entries).toHaveLength(3);expect(projection.relationships[0].type).toBe('paired_with')
 expect(projection.relationships[0].exploration?.level).toBe('resonance')
 expect(JSON.stringify(projection)).not.toContain('PRIVATE_INQUIRY')
 expect(projection.entries[2].inquirySpace?.epistemicMode).toBe('expression')
 expect(projection.entries[2].blocks).toEqual(store.entries[2].blocks)
 store.entries[0].inquirySpace!.prompt='Later private wording'
 expect(projection.entries[0].inquirySpace?.prompt).not.toBe('Later private wording')
 expect(Object.isFrozen(projection.entries[0].inquirySpace)).toBe(true)
})

test('pairings cannot expose private endpoints or sources, and supported is not just a chosen label',()=>{
 const hidden=structuredClone(inquiryFixtureStore);hidden.entries[1].visibility='restricted';expect(()=>project(hidden)).toThrow(/approved public/)
 const unselected=structuredClone(inquiryFixtureStore),manifest=candidate(unselected);manifest.entries=manifest.entries.filter(ref=>ref.id!==unselected.entries[1].id);expect(()=>project(unselected,manifest)).toThrow(/endpoint/)
 const supported=structuredClone(inquiryFixtureStore);supported.relationships[0].exploration!.level='supported';expect(()=>project(supported)).toThrow(/selected evidence/)
 const backed=structuredClone(inquiryFixtureStore);backed.entries[0].inquirySpace!.epistemicMode='evidence_backed';expect(()=>project(backed)).toThrow(/source references/)
})

test('editing public context or a pairing invalidates its exact candidate selection',()=>{
 for(const mutate of [(store:ContentStore)=>{store.entries[0].inquirySpace!.prompt='Changed question'},(store:ContentStore)=>{store.relationships[0].exploration!.boundary='Changed boundary'}]){
  const store=structuredClone(inquiryFixtureStore),manifest=candidate(store);mutate(store)
  expect(()=>project(store,manifest)).toThrow(/changed after candidate approval/)
 }
})

test('a fragment page selects its own body and minimal neighbors, not unrelated writing',()=>{
 const projection=project(structuredClone(inquiryFixtureStore)),entry=projection.entries[0]
 const before=readingPageData(projection,'entry',true,entry.id)
 const unrelated=structuredClone(projection.entries[2]);unrelated.id='b1000000-0000-4000-8000-000000000099';unrelated.title='UNRELATED_INQUIRY_BODY_TEST';unrelated.blocks=[{id:'b2000000-0000-4000-8000-000000000099',type:'verse',text:'A long unrelated private-looking test body.'}]
 const after=readingPageData({...projection,entries:[...projection.entries,unrelated]},'entry',true,entry.id)
 expect(after).toEqual(before);expect(JSON.stringify(after)).not.toContain(unrelated.title)
 expect(Object.keys(after.renderedMarkdown)).toEqual(entry.blocks.map(block=>block.id))
})
