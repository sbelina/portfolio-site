import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { entrySchema, evidenceSchema, relationshipSchema, assetSchema, entryPath, type ContentStore, type Entry, type PublicProjection, type ReleaseManifest } from '../src/content/model'
import { validateCandidateProjection, digestRecord } from '../src/content/projection'
import { intakeText } from './intake'

export const passes = ['Manuscript Intake', 'Editorial Reader', 'Evidence Reviewer', 'Connection Curator', 'Experience Reviewer', 'Release Checker'] as const
export type Decision = 'pending' | 'accept' | 'reject'
export type Passage = { start: number; end: number; sourceDigest: string }
export type Section = { id: string; title: string; slug: string; summary: string; collection: Entry['kind']; passage: Passage; reason: string }
export type Manuscript = { id: string; title: string; format: 'text' | 'markdown' | 'docx'; poetry: boolean; original: string; bytes: string; filename: string; digest: string; warnings: string[]; sections: Section[]; structure: 'undecided' | 'intact' | 'split'; complete: boolean; reviews: { pass: typeof passes[number]; suggestion: string; uncertainty: string; sources: Passage[]; decision: Decision; note: string; basis?: string }[] }
export type Edit = { id: string; entryId: string; blockId: string; before: string; after: string; rationale: string; source: Passage; decision: Decision }
export type Candidate = { digest: string; workspaceVersion: number; source: {kind:'local-d1';version:number;digest:string}; releaseEligible:false; applicationRevision: string; manifest: ReleaseManifest; projection: PublicProjection; assets: Record<string, string>; approval: null | { subject: string; at: string; digest: string }; published: false }
export type Workspace = { schemaVersion: 1; manuscripts: Manuscript[]; store: ContentStore; edits: Edit[]; candidates: Candidate[] }
export const emptyWorkspace = (): Workspace => ({ schemaVersion: 1, manuscripts: [], store: { entries: [], evidence: [], assets: [], relationships: [], aliases: [] }, edits: [], candidates: [] })
const uuid = z.uuid(); const short = z.string().min(1).max(300); const text = z.string().max(200000)
export const actionSchema = z.discriminatedUnion('type', [
 z.strictObject({ type: z.literal('intake'), title: short, filename: short, format: z.enum(['text','markdown','docx']), bytes: z.string().max(400000), poetry: z.boolean() }),
 z.strictObject({ type: z.literal('structure'), manuscriptId: uuid, choice: z.enum(['intact','split']) }),
 z.strictObject({ type: z.literal('section'), manuscriptId: uuid, sectionId: uuid, title: short, slug: short, summary: z.string().max(2000), collection: z.enum(['investigation','pattern','perspective','observation','experiment','reference']) }),
 z.strictObject({ type: z.literal('review'), manuscriptId: uuid, pass: z.enum(passes), decision: z.enum(['accept','reject']), note: z.string().min(1).max(5000), complete: z.boolean() }),
 z.strictObject({ type: z.literal('edit'), entryId: uuid, blockId: uuid, after: text, rationale: z.string().min(1).max(5000) }),
 z.strictObject({ type: z.literal('decideEdit'), editId: uuid, decision: z.enum(['accept','reject']) }),
 z.strictObject({ type: z.literal('metadata'), entryId: uuid, title: short, slug: short, summary: z.string().max(2000), contribution: z.string().max(5000) }),
 z.strictObject({ type: z.literal('evidence'), entryId: uuid, title: short, source: short, locator: short, observedAt:z.iso.datetime({offset:true}), limitations: z.string().min(1).max(5000), rightsCleared: z.boolean() }),
 z.strictObject({ type: z.literal('asset'), entryId: uuid, bytes: z.string().max(100000), alt: z.string().min(1).max(2000), credit: short, rightsCleared: z.boolean() }),
 z.strictObject({ type: z.literal('relationship'), fromId: uuid, toId: uuid, rationale: z.string().min(1).max(5000), relation: relationshipSchema.shape.type }),
 z.strictObject({ type: z.literal('decideRelationship'), relationshipId: uuid, decision: z.enum(['accept','reject']) }),
 z.strictObject({ type: z.literal('candidate') }),
 z.strictObject({ type: z.literal('approve'), digest: z.string().regex(/^[a-f0-9]{64}$/) }),
])
export type Action = z.infer<typeof actionSchema>
const authorId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' // Local owner identity; not Sam's authorship/approval.
export const slugify = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,100) || 'untitled'
const blockText = (block: Entry['blocks'][number]) => block.type === 'verse' ? block.text : block.type === 'prose' || block.type === 'callout' ? block.markdown : ''
export function manuscriptForEntry(w: Workspace, id: string) { return w.manuscripts.find(m => m.sections.some(s => s.id === id) || m.id === id)! }
function sections(text: string, digest: string): Section[] {
 const headers = [...text.matchAll(/^## (.+\?)\s*$/gm)]
 // Only explicit independent questions qualify automatically. All remain proposals.
 if (headers.length < 2 || headers[0].index !== 0) return []
 return headers.map((match,i) => {
  const start = match.index!, end = headers[i+1]?.index ?? text.length
  return { id: randomUUID(), title: match[1], slug: slugify(match[1]), summary: text.slice(start + match[0].length,end).trim().slice(0,180), collection: 'observation' as const, passage: { start,end,sourceDigest:digest }, reason: 'An explicit section question with its own passage; owner review still required.' }
 }).filter(s => s.passage.end-s.passage.start >= 120)
}
export function draftProjection(w: Workspace): PublicProjection {
 return { schemaVersion: 1, entries: w.store.entries.map(e => ({ id:e.id,revision:e.revision,kind:e.kind,format:e.format,slug:e.slug,path:entryPath(e),title:e.title,summary:e.summary,contribution:e.contribution ?? '',createdAt:e.createdAt,updatedAt:e.updatedAt,authorIds:e.authorIds,topicIds:e.topicIds,blocks:structuredClone(e.blocks),evidenceIds:e.evidenceIds })), relationships:w.store.relationships.filter(r=>r.reviewState==='approved').map(({id,fromId,toId,type,rationale,evidenceIds})=>({id,fromId,toId,type,rationale,evidenceIds})), evidence:w.store.evidence.map(({id,title,source,locator,observedAt,role,limitations,assetIds,kind})=>({id,title,source,locator,observedAt,role,limitations,assetIds,kind})), assets:w.store.assets.map(({id,url,mimeType,alt,decorative,credit,checksum})=>({id,url,mimeType,alt,decorative,credit,checksum})), aliases:[] }
}
export function applyAction(source: Workspace, action: Action, version: number, subject: string, appRevision: string, now = new Date().toISOString()): Workspace {
 const w = structuredClone(source)
 const getEntry = (id: string) => { const e=w.store.entries.find(e=>e.id===id); if(!e)throw Error('Entry not found'); return e }
 const bump = (e: Entry) => { e.revision++; e.updatedAt=now }
 switch(action.type) {
 case 'intake': {
  const result = intakeText(action.format, action.bytes)
  const digest=digestRecord({text:result.text,bytes:action.bytes}), id=randomUUID()
  const suggestions = [
   'Confirm manuscript completeness, authorship and conversion fidelity before choosing a structure.',
   'Read the argument or creative form intact; propose edits separately, without rewriting the original.',
   'Inspect factual and causal claims. Attach sources, limitations and rights decisions; no claims have been verified automatically.',
   'Explain selected connections in words. Shared vocabulary alone does not establish a meaningful relation.',
   'Preview the full reading, inline sources, keyboard navigation and narrow layout; keep essential limitations visible.',
   'Check every source, proposed edit, relationship, URL and exact candidate before approval. Approval does not publish.',
  ]
  w.manuscripts.push({id,title:action.title,format:action.format,poetry:action.poetry,filename:action.filename,bytes:action.bytes,original:result.text,digest,warnings:result.warnings,sections:action.poetry?[]:sections(result.text,digest),structure:'undecided',complete:false,reviews:passes.map((pass,i)=>({pass,suggestion:suggestions[i],uncertainty:'Prepared review prompt, not a completed editorial or factual review. Owner assessment required.',sources:[{start:0,end:result.text.length,sourceDigest:digest}],decision:'pending',note:''}))})
  break
 }
 case 'section': {
  const m=w.manuscripts.find(m=>m.id===action.manuscriptId)!, s=m?.sections.find(s=>s.id===action.sectionId)
  if(!s || m.structure!=='undecided')throw Error('Revise the proposal before generating drafts')
  Object.assign(s,{title:action.title,slug:action.slug,summary:action.summary,collection:action.collection}); break
 }
 case 'structure': {
  const m=w.manuscripts.find(m=>m.id===action.manuscriptId)
  if(!m || m.structure!=='undecided')throw Error('Structure already applied or manuscript missing; original remains intact')
  if(action.choice==='split' && m.sections.length<2)throw Error('No qualifying split; keep this manuscript intact')
  const parts=action.choice==='split'?m.sections:[{id:m.id,title:m.title,slug:slugify(m.title),summary:'',collection:'perspective' as const,passage:{start:0,end:m.original.length,sourceDigest:m.digest},reason:'Keep the manuscript intact.'}]
  for(const s of parts) w.store.entries.push(entrySchema.parse({schemaVersion:1,id:s.id,revision:1,kind:s.collection,format:m.poetry?'poetry':s.collection==='perspective'?'essay':'field_note',slug:s.slug,title:s.title,summary:s.summary,editorialState:'draft',visibility:'restricted',createdAt:now,updatedAt:now,authorIds:[authorId],topicIds:[],contribution:'',evidenceIds:[],blocks:[m.poetry?{id:randomUUID(),type:'verse',text:m.original.slice(s.passage.start,s.passage.end)}:{id:randomUUID(),type:'prose',markdown:m.original.slice(s.passage.start,s.passage.end)}]}))
  m.structure=action.choice; break
 }
 case 'review': {
  const m=w.manuscripts.find(m=>m.id===action.manuscriptId), r=m?.reviews.find(r=>r.pass===action.pass)
  if(!m || !r)throw Error('Review not found')
  r.decision=action.decision;r.note=action.note;r.basis=digestRecord(w.store);m.complete=action.complete; break
 }
 case 'edit': {
  const e=getEntry(action.entryId), b=e.blocks.find(b=>b.id===action.blockId), m=manuscriptForEntry(w,e.id)
  if(!b || !m || !['prose','verse'].includes(b.type))throw Error('Text block required')
  w.edits.push({id:randomUUID(),entryId:e.id,blockId:b.id,before:blockText(b),after:action.after,rationale:action.rationale,decision:'pending',source:{start:0,end:m.original.length,sourceDigest:m.digest}});break
 }
 case 'decideEdit': {
  const edit=w.edits.find(e=>e.id===action.editId);if(!edit || edit.decision!=='pending')throw Error('Edit not pending')
  if(action.decision==='accept') {
   const e=getEntry(edit.entryId),b=e.blocks.find(b=>b.id===edit.blockId)!
   if(blockText(b)!==edit.before)throw Error('Edit base changed; propose against the current revision')
   if(b.type==='verse')b.text=edit.after;else if(b.type==='prose')b.markdown=edit.after
   bump(e)
  }
  edit.decision=action.decision;break
 }
 case 'metadata': {
  const e=getEntry(action.entryId), oldPath=entryPath(e)
  Object.assign(e,{title:action.title,slug:action.slug,summary:action.summary,contribution:action.contribution});entrySchema.parse(e)
  if(entryPath(e)!==oldPath && !w.store.aliases.some(a=>a.kind==='path' && a.path===oldPath)) w.store.aliases.push({schemaVersion:1,id:randomUUID(),revision:1,visibility:'restricted',reviewState:'approved',kind:'path',path:oldPath,targetId:e.id})
  bump(e); break
 }
 case 'evidence': {
  const e=getEntry(action.entryId),id=randomUUID()
  w.store.evidence.push(evidenceSchema.parse({schemaVersion:1,id,revision:1,visibility:'restricted',reviewState:'approved',title:action.title,source:action.source,locator:action.locator,observedAt:action.observedAt,role:'context',limitations:action.limitations,assetIds:[],rights:action.rightsCleared?'cleared':'pending',redaction:action.rightsCleared?'reviewed':'pending',kind:'reference'}))
  e.evidenceIds.push(id);e.blocks.push({id:randomUUID(),type:'evidence',evidenceId:id});bump(e);break
 }
 case 'asset': {
  const e=getEntry(action.entryId),id=randomUUID(),data=Buffer.from(action.bytes,'base64')
  if(data.length>65536 || !data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))throw Error('Only PNG derivatives up to 64 KiB are supported')
  w.store.assets.push(assetSchema.parse({schemaVersion:1,id,revision:1,visibility:'restricted',reviewState:'approved',kind:'public_derivative',rights:action.rightsCleared?'cleared':'pending',checksum:digestBytes(data),mimeType:'image/png',url:`/media/${id}.png`,alt:action.alt,decorative:false,credit:action.credit}))
  // Bytes are private source material, never a Vite public import.
  media(w)[id]=action.bytes;e.blocks.push({id:randomUUID(),type:'image',assetId:id});bump(e);break
 }
 case 'relationship': {
  getEntry(action.fromId);getEntry(action.toId)
  w.store.relationships.push(relationshipSchema.parse({schemaVersion:1,id:randomUUID(),revision:1,visibility:'restricted',reviewState:'proposed',fromId:action.fromId,toId:action.toId,type:action.relation,rationale:action.rationale,evidenceIds:[],provenance:'owner'}));break
 }
 case 'decideRelationship': {
  const r=w.store.relationships.find(r=>r.id===action.relationshipId);if(!r)throw Error('Relationship not found')
  r.reviewState=action.decision==='accept'?'approved':'rejected';r.revision++;break
 }
 case 'candidate': {
  if(!w.store.entries.length || w.manuscripts.some(m=>m.structure==='undecided' || !m.complete || m.reviews.some(r=>r.decision!=='accept' || r.basis!==digestRecord(w.store))))throw Error('Choose a structure, confirm completeness, and complete all six review passes on the current draft (re-review after edits)')
  if(w.edits.some(e=>e.decision==='pending') || w.store.relationships.some(r=>r.reviewState==='proposed'))throw Error('Decide each edit and relationship before freezing a candidate')
  const store=structuredClone(w.store)
  store.entries.forEach(e=>{e.visibility='public';e.editorialState='approved'})
  store.relationships=store.relationships.filter(r=>r.reviewState==='approved')
  for(const records of [store.relationships,store.evidence,store.assets,store.aliases])records.forEach(r=>{r.visibility='public'})
  const refs=(records:{id:string;revision:number}[])=>records.map(r=>({id:r.id,revision:r.revision,digest:digestRecord(r)}))
  const manifest: ReleaseManifest={schemaVersion:1,releaseId:randomUUID(),applicationRevision:appRevision,contentRevision:'0'.repeat(40),entries:refs(store.entries),relationships:refs(store.relationships),evidence:refs(store.evidence),assets:refs(store.assets),aliases:refs(store.aliases)}
  // Prospective publication copy is validated privately; no approval is fabricated.
  const projection=validateCandidateProjection(store,manifest)
  const source={kind:'local-d1' as const,version,digest:digestRecord(w.store)}
  const digest=digestRecord({source,manifest,projection,assets:media(w)})
  w.candidates.push({digest,workspaceVersion:version,source,releaseEligible:false,applicationRevision:appRevision,manifest,projection,assets:structuredClone(media(w)),approval:null,published:false});break
 }
 case 'approve': {
  const c=w.candidates.find(c=>c.digest===action.digest);if(!c)throw Error('Candidate missing')
  if(c.approval)throw Error('Already approved; no publication occurred')
  c.approval={subject,at:now,digest:c.digest};break
 }
 }
 return w
}
import { createHash } from 'node:crypto'
export const digestBytes = (data: Uint8Array) => createHash('sha256').update(data).digest('hex')
export type StoredWorkspace = Workspace & { media?: Record<string,string> }
export function media(w: StoredWorkspace) { return w.media ??= {} }
