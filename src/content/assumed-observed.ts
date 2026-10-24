import { z } from 'zod'
// Public-safe quotations only. Private manuscript offsets/provenance live in the
// editorial proposal, outside this renderable block and its public projection.
const id=z.uuid().regex(/^[0-9a-f-]+$/)
const label=z.string().trim().min(1).max(180)
export const assumedObservedSchema=z.strictObject({
 id, type:z.literal('assumed_observed'), componentVersion:z.literal(1),
 title:label, question:z.string().trim().min(1).max(600),
 assumptions:z.array(z.strictObject({id,label,sourcePassage:z.string().min(1).max(2000)})).min(1).max(6),
 observations:z.array(z.strictObject({id,label,evidenceId:id,passage:z.string().min(1).max(2000)})).min(1).max(6),
 connections:z.array(z.strictObject({
  id,assumptionId:id,observationId:id,
  meaning:z.enum(['supports','challenges','qualifies']),
  status:z.enum(['documented','interpretation','hypothesis']),
  explanation:z.string().trim().min(1).max(2000),limitation:z.string().trim().min(1).max(2000),
  missingEvidence:z.array(z.string().trim().min(1).max(600)).max(8),
 })).min(1).max(24),
}).superRefine((block,ctx)=>{
 const nodes=[...block.assumptions,...block.observations,...block.connections]
 if(new Set(nodes.map(n=>n.id)).size!==nodes.length)ctx.addIssue({code:'custom',message:'Diagram identities must be unique within this block'})
 const pairs=new Set<string>()
 for(const c of block.connections){
  if(!block.assumptions.some(a=>a.id===c.assumptionId)||!block.observations.some(o=>o.id===c.observationId))ctx.addIssue({code:'custom',path:['connections'],message:'Connection endpoint is missing'})
  const pair=c.assumptionId+':'+c.observationId
  if(pairs.has(pair))ctx.addIssue({code:'custom',path:['connections'],message:'Duplicate diagram connection'})
  pairs.add(pair)
  if(c.status==='documented' && c.missingEvidence.length)ctx.addIssue({code:'custom',path:['connections'],message:'A documented relationship cannot have unresolved supporting evidence'})
 }
 for(const a of block.assumptions)if(!block.connections.some(c=>c.assumptionId===a.id))ctx.addIssue({code:'custom',message:'Each assumption needs an explained connection'})
})
export type AssumedObservedBlock=z.infer<typeof assumedObservedSchema>
export const diagramEvidenceIds=(block:AssumedObservedBlock)=>block.observations.map(o=>o.evidenceId)
