import React, { useState } from 'react'
import type { AssumedObservedBlock } from '../src/content/assumed-observed'

type Props={initial?:AssumedObservedBlock;sourceText:string;evidence:{id:string;title:string}[];onSave:(block:AssumedObservedBlock)=>Promise<void>}
const uuid=()=>crypto.randomUUID()
export function AssumedObservedEditor({initial,sourceText,evidence,onSave}:Props){
 const [block,setBlock]=useState<AssumedObservedBlock>(()=>{
  if(initial)return structuredClone(initial)
  const a=uuid(),o=uuid()
  return {id:uuid(),type:'assumed_observed',componentVersion:1,title:'Assumed → observed',question:'',assumptions:[{id:a,label:'',sourcePassage:sourceText.slice(0,180)}],observations:[{id:o,label:'',evidenceId:evidence[0]?.id??'',passage:''}],connections:[{id:uuid(),assumptionId:a,observationId:o,meaning:'challenges',status:'interpretation',explanation:'',limitation:'',missingEvidence:[]}]}
 })
 const field=(label:string,value:string,change:(value:string)=>void,multiline=false)=><label>{label}{multiline?<textarea value={value} required onChange={e=>change(e.target.value)}/>:<input value={value} required onChange={e=>change(e.target.value)}/>}</label>
 const updateA=(index:number,key:'label'|'sourcePassage',value:string)=>setBlock(b=>({...b,assumptions:b.assumptions.map((a,i)=>i===index?{...a,[key]:value}:a)}))
 const updateO=(index:number,key:'label'|'passage'|'evidenceId',value:string)=>setBlock(b=>({...b,observations:b.observations.map((o,i)=>i===index?{...o,[key]:value}:o)}))
 const updateC=(index:number,change:Partial<AssumedObservedBlock['connections'][number]>)=>setBlock(b=>({...b,connections:b.connections.map((c,i)=>i===index?{...c,...change}:c)}))
 return <form aria-label="Assumed observed proposal editor" onSubmit={async e=>{e.preventDefault();await onSave(block)}}>
  <p>These are editable content records, not SVG instructions. Original quotations and evidence references require review. A proposal never approves itself.</p>
  {field('Diagram title',block.title,title=>setBlock(b=>({...b,title})))}
  {field('Question this diagram helps inspect',block.question,question=>setBlock(b=>({...b,question})),true)}
  <fieldset><legend>Stated assumptions</legend>{block.assumptions.map((a,i)=><div key={a.id}>
   {field(`Assumption ${i+1} label`,a.label,v=>updateA(i,'label',v))}
   {field(`Assumption ${i+1} exact original passage`,a.sourcePassage,v=>updateA(i,'sourcePassage',v),true)}
   {block.assumptions.length>1?<button type="button" onClick={()=>setBlock(b=>({...b,assumptions:b.assumptions.filter(item=>item.id!==a.id),connections:b.connections.filter(c=>c.assumptionId!==a.id)}))}>Remove assumption {i+1}</button>:null}
  </div>)}{block.assumptions.length<6?<button type="button" onClick={()=>setBlock(b=>({...b,assumptions:[...b.assumptions,{id:uuid(),label:'',sourcePassage:sourceText.slice(0,180)}]}))}>Add assumption</button>:null}</fieldset>
  <fieldset><legend>Observed evidence</legend>{block.observations.map((o,i)=><div key={o.id}>
   {field(`Observation ${i+1} label`,o.label,v=>updateO(i,'label',v))}
   <label>Evidence for observation {i+1}<select value={o.evidenceId} onChange={e=>updateO(i,'evidenceId',e.target.value)} required><option value="">Select an attached source</option>{evidence.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label>
   {field(`Observation ${i+1} relevant source passage`,o.passage,v=>updateO(i,'passage',v),true)}
   {block.observations.length>1?<button type="button" onClick={()=>setBlock(b=>({...b,observations:b.observations.filter(item=>item.id!==o.id),connections:b.connections.filter(c=>c.observationId!==o.id)}))}>Remove observation {i+1}</button>:null}
  </div>)}{block.observations.length<6?<button type="button" onClick={()=>setBlock(b=>({...b,observations:[...b.observations,{id:uuid(),label:'',evidenceId:evidence[0]?.id??'',passage:''}]}))}>Add observation</button>:null}</fieldset>
  <fieldset><legend>Explained connections</legend>{block.connections.map((c,i)=><div key={c.id}>
   <label>From assumption {i+1}<select value={c.assumptionId} onChange={e=>updateC(i,{assumptionId:e.target.value})}>{block.assumptions.map((a,j)=><option key={a.id} value={a.id}>{a.label||`Assumption ${j+1}`}</option>)}</select></label>
   <label>To observation {i+1}<select value={c.observationId} onChange={e=>updateC(i,{observationId:e.target.value})}>{block.observations.map((o,j)=><option key={o.id} value={o.id}>{o.label||`Observation ${j+1}`}</option>)}</select></label>
   <label>Connection {i+1} meaning<select value={c.meaning} onChange={e=>updateC(i,{meaning:e.target.value as typeof c.meaning})}><option value="supports">Supports the assumption</option><option value="challenges">Challenges the assumption</option><option value="qualifies">Qualifies the assumption</option></select></label>
   <label>Connection {i+1} status<select value={c.status} onChange={e=>updateC(i,{status:e.target.value as typeof c.status})}><option value="interpretation">Interpretation — dashed</option><option value="documented">Documented relationship — solid</option><option value="hypothesis">Hypothesis — dotted</option></select></label>
   {field(`Connection ${i+1} explanation`,c.explanation,v=>updateC(i,{explanation:v}),true)}
   {field(`Connection ${i+1} limitation`,c.limitation,v=>updateC(i,{limitation:v}),true)}
   <label>Connection {i+1} missing evidence (one item per line)<textarea value={c.missingEvidence.join('\n')} onChange={e=>updateC(i,{missingEvidence:e.target.value.split('\n').filter(line=>line.trim())})}/></label>
   {block.connections.length>1?<button type="button" onClick={()=>setBlock(b=>({...b,connections:b.connections.filter(item=>item.id!==c.id)}))}>Remove connection {i+1}</button>:null}
  </div>)}{block.connections.length<24?<button type="button" onClick={()=>setBlock(b=>({...b,connections:[...b.connections,{id:uuid(),assumptionId:b.assumptions[0].id,observationId:b.observations[0].id,meaning:'qualifies',status:'interpretation',explanation:'',limitation:'',missingEvidence:[]}]}))}>Add connection</button>:null}</fieldset>
  {!evidence.length?<p>Attach an evidence record before proposing observed evidence. Missing source material cannot become a documented relationship.</p>:null}
  <button disabled={!evidence.length}>Save visualization proposal privately</button>
 </form>
}
