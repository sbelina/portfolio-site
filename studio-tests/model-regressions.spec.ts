import { test, expect } from '@playwright/test'
import { applyAction, emptyWorkspace, draftProjection, passes, type Workspace, type Action } from '../studio/model'

const app='a'.repeat(40), subject='Synthetic verification owner', date='2000-01-01T00:00:00Z'
const act=(w:Workspace,action:Action)=>applyAction(w,action,1,subject,app,date)
function intake(text:string){return act(emptyWorkspace(),{type:'intake',title:'Synthetic verification manuscript',filename:'synthetic.md',format:'markdown',bytes:Buffer.from(text).toString('base64'),poetry:false})}
function draft(){
 let w=intake('An intact synthetic manuscript. No real author, source or outcome is represented.')
 w=act(w,{type:'structure',manuscriptId:w.manuscripts[0].id,choice:'intact'})
 const e=w.store.entries[0]
 return act(w,{type:'metadata',entryId:e.id,title:e.title,slug:e.slug,summary:'Synthetic only.',contribution:'Synthetic verification, not Sam’s contribution.'})
}
function reviewed(w:Workspace){for(const pass of passes)w=act(w,{type:'review',manuscriptId:w.manuscripts[0].id,pass,decision:'accept',note:'Synthetic mechanical verification only.',complete:true});return w}

test('new intake preserves saved reviews and originals while preparing six pending passes',()=>{
 const saved=reviewed(draft())
 // Represent a persisted record from an earlier prompt version, not current intake text.
 saved.manuscripts[0].reviews[2].suggestion='Historical synthetic review wording: retain this saved record exactly.'
 const before=structuredClone(saved)
 const next=act(saved,{type:'intake',title:'Second synthetic manuscript',filename:'second.txt',format:'text',bytes:Buffer.from('A separate synthetic original, with no approved claims.').toString('base64'),poetry:false})
 expect(saved).toEqual(before)
 expect(next.manuscripts[0]).toEqual(before.manuscripts[0])
 expect(next.store).toEqual(before.store)
 expect(next.candidates).toEqual(before.candidates)
 const incoming=next.manuscripts[1]
 expect(incoming.reviews.map(r=>r.pass)).toEqual([...passes])
 expect(incoming.reviews.every(r=>r.decision==='pending' && r.basis===undefined && r.note==='' && r.uncertainty.includes('not a completed'))).toBe(true)
 expect(incoming.reviews.every(r=>r.sources.every(s=>s.sourceDigest===incoming.digest))).toBe(true)
 expect(()=>act(next,{type:'candidate'})).toThrow('Choose a structure')
})

test('split suggestions never discard short opening or middle source sections',()=>{
 const long='This is an invented section used only to verify complete source coverage. '.repeat(4)
 for(const original of [`## Short opening?\n\nShort.\n\n## Longer second?\n\n${long}\n\n## Longer third?\n\n${long}`,`## Longer first?\n\n${long}\n\n## Short middle?\n\nShort.\n\n## Longer third?\n\n${long}`]){
  const w=intake(original),m=w.manuscripts[0]
  expect(m.original).toBe(original)
  const ranges=m.sections
  if(ranges.length){expect(ranges.map(s=>original.slice(s.passage.start,s.passage.end)).join('')).toBe(original)}
  else expect(()=>act(w,{type:'structure',manuscriptId:m.id,choice:'split'})).toThrow('No qualifying split')
 }
})

test('renaming a slug back removes only its own alias and allows a valid candidate',()=>{
 let w=draft(),e=w.store.entries[0]
 const old=e.slug
 for(const slug of ['verification-renamed',old])w=act(w,{type:'metadata',entryId:e.id,title:e.title,slug,summary:e.summary,contribution:e.contribution!})
 expect(w.store.aliases.some(a=>a.kind==='path' && a.path===`/perspective/${old}/`)).toBe(false)
 expect(w.store.aliases.some(a=>a.kind==='path' && a.path==='/perspective/verification-renamed/' && a.targetId===e.id)).toBe(true)
 w=reviewed(w)
 expect(()=>act(w,{type:'candidate'})).not.toThrow()
})

test('editing after review requires fresh passes and cannot revise an existing approved candidate',()=>{
 let w=reviewed(draft());w=act(w,{type:'candidate'})
 const digest=w.candidates[0].digest;w=act(w,{type:'approve',digest})
 const approved=structuredClone(w.candidates[0]),e=w.store.entries[0]
 w=act(w,{type:'metadata',entryId:e.id,title:'Later draft',slug:e.slug,summary:e.summary,contribution:e.contribution!})
 expect(()=>act(w,{type:'candidate'})).toThrow('re-review after edits')
 expect(w.candidates[0]).toEqual(approved)
 expect(w.candidates[0].releaseEligible).toBe(false)
})


test('saved draft previews retain private path aliases without leaking editorial fields',()=>{
 let w=draft();const e=w.store.entries[0],old=e.slug
 w=act(w,{type:'metadata',entryId:e.id,title:e.title,slug:'renamed-preview',summary:e.summary,contribution:e.contribution!})
 const alias=draftProjection(w).aliases.find(a=>a.kind==='path' && a.path===`/perspective/${old}/`)!
 expect(alias.targetId).toBe(e.id)
 expect(alias).not.toHaveProperty('visibility')
 expect(alias).not.toHaveProperty('reviewState')
})
