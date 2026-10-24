import {test,expect} from '@playwright/test'
import {applyAction,emptyWorkspace,passes,type Workspace,type Action} from '../studio/model'
import type {AssumedObservedBlock} from '../src/content/assumed-observed'
const original='This synthetic manuscript preserves its original text. It describes a fictional handoff, not a real workplace.'
const id=(n:number)=>`91000000-0000-4000-8000-${String(n).padStart(12,'0')}`
const act=(w:Workspace,a:Action)=>applyAction(w,a,1,'Synthetic owner','a'.repeat(40),'2000-01-01T00:00:00Z')
function prepared(){
 let w=act(emptyWorkspace(),{type:'intake',title:'Synthetic visual review',filename:'synthetic.txt',format:'text',bytes:Buffer.from(original).toString('base64'),poetry:false})
 w=act(w,{type:'structure',manuscriptId:w.manuscripts[0].id,choice:'intact'})
 const entry=w.store.entries[0]
 w=act(w,{type:'metadata',entryId:entry.id,title:entry.title,slug:entry.slug,summary:'Synthetic only.',contribution:'Invented test, not Sam’s work.'})
 w=act(w,{type:'evidence',entryId:entry.id,title:'Synthetic source',source:'Invented source',locator:'Fixture passage',observedAt:'2000-01-01T00:00:00Z',limitations:'Not actual source evidence.',rightsCleared:true})
 const spec:AssumedObservedBlock={id:id(1),type:'assumed_observed',componentVersion:1,title:'Synthetic assumption',question:'What can this fictional account establish?',assumptions:[{id:id(2),label:'A synthetic assumption',sourcePassage:original}],observations:[{id:id(3),label:'A synthetic observation',evidenceId:w.store.evidence[0].id,passage:'Synthetic quotation.'}],connections:[{id:id(4),assumptionId:id(2),observationId:id(3),meaning:'qualifies',status:'interpretation',explanation:'Proposed interpretation only.',limitation:'No actual outcome.',missingEvidence:['A real source review.']}]}
 return {w,entry,spec}
}
function review(w:Workspace){for(const pass of passes)w=act(w,{type:'review',manuscriptId:w.manuscripts[0].id,pass,decision:'accept',note:'Synthetic review only.',complete:true});return w}

test('visual proposals preserve originals, require individual acceptance and retain source provenance',()=>{
 const {w,entry,spec}=prepared(),proposed=act(w,{type:'visualization',entryId:entry.id,spec})
 expect(proposed.store.entries[0].blocks.some(b=>b.type==='assumed_observed')).toBe(false)
 expect(proposed.visualizations![0].sourcePassages[0].sourceDigest).toBe(w.manuscripts[0].digest)
 expect(()=>act(review(proposed),{type:'candidate'})).toThrow('Decide each visualization')
 const accepted=act(proposed,{type:'decideVisualization',proposalId:proposed.visualizations![0].id,decision:'accept'})
 expect(accepted.manuscripts[0].original).toBe(original)
 expect(accepted.store.entries[0].blocks.at(-1)).toEqual(spec)
 const candidate=act(review(accepted),{type:'candidate'}).candidates[0]
 expect(candidate.approval).toBeNull()
 expect(JSON.stringify(candidate.projection)).not.toContain('sourcePassages')
 expect(JSON.stringify(candidate.projection)).not.toContain('sourceDigest')
})

test('revision edits labels as data and leaves an accepted block intact until accepted again',()=>{
 let {w,entry,spec}=prepared();w=act(w,{type:'visualization',entryId:entry.id,spec})
 w=act(w,{type:'decideVisualization',proposalId:w.visualizations![0].id,decision:'accept'})
 const changed=structuredClone(spec);changed.assumptions[0].label='Revised label'
 w=act(w,{type:'visualization',entryId:entry.id,spec:changed})
 expect(w.visualizations![0].decision).toBe('pending')
 expect(w.store.entries[0].blocks.at(-1)).toEqual(spec)
 w=act(w,{type:'decideVisualization',proposalId:w.visualizations![0].id,decision:'reject'})
 expect(w.store.entries[0].blocks.at(-1)).toEqual(spec)
})

test('proposal validation blocks invented original quotes, missing sources and overwriting prose',()=>{
 const {w,entry,spec}=prepared()
 const invented=structuredClone(spec);invented.assumptions[0].sourcePassage='This is not in the original.'
 expect(()=>act(w,{type:'visualization',entryId:entry.id,spec:invented})).toThrow('preserved original exactly')
 const missing=structuredClone(spec);missing.observations[0].evidenceId=id(99)
 expect(()=>act(w,{type:'visualization',entryId:entry.id,spec:missing})).toThrow('private evidence ledger')
 expect(()=>act(w,{type:'visualization',entryId:entry.id,spec:{...spec,id:entry.blocks[0].id}})).toThrow('different block type')
})
