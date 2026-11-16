import React, {useEffect,useState} from 'react'
import type { Entry, Evidence, Relationship } from '../src/content/model'
import type { InquirySpace, RelationshipExploration } from '../src/content/inquiry-space'
import { inquiryForms, inquiryModes, pairingLevels } from '../src/inquiry-space/labels'

function useRevisionBuffer(revision:number) {
  const [base,setBase]=useState(revision),[dirty,setDirty]=useState(false),[epoch,setEpoch]=useState(0),[error,setError]=useState('')
  const reload=()=>{setBase(revision);setDirty(false);setEpoch(value=>value+1);setError('')}
  useEffect(()=>{if(!dirty && base!==revision){setBase(revision);setEpoch(value=>value+1)}},[revision,base,dirty])
  return {base,dirty,epoch,error,setError,changed:()=>setDirty(true),reload,saved:()=>setDirty(false),stale:base!==revision}
}

export function InquiryMetadataEditor({entry,onSave}:{entry:Entry;onSave:(value:InquirySpace|null,expectedRevision:number)=>Promise<void>}) {
  const initial=entry.inquirySpace
  const buffer=useRevisionBuffer(entry.revision)
  return <form key={buffer.epoch} aria-label={`Inquiry presentation ${entry.title}`} onChange={buffer.changed} onSubmit={async event=>{
    event.preventDefault();const form=new FormData(event.currentTarget)
    if(buffer.stale){buffer.setError('Saved entry revision changed. Compare your unsaved text below before explicitly reloading.');return}
    try {
    if(form.get('enabled')!=='on'){await onSave(null,buffer.base);buffer.saved();return}
    const optional=Object.fromEntries(['prompt','origin','observation','possibleExplanations','competingInterpretations','unresolvedQuestion'].map(key=>[key,String(form.get(key)??'')]).filter(([,value])=>value.trim()))
    await onSave({schemaVersion:1,presentation:entry.kind==='experiment'?'exhibit':'fragment',form:form.get('form') as InquirySpace['form'],epistemicMode:form.get('mode') as InquirySpace['epistemicMode'],featured:form.get('featured')==='on',...optional},buffer.base);buffer.saved();buffer.setError('')
    }catch(error){buffer.setError(error instanceof Error?error.message:'Save failed; your input remains below.')}
  }}>
    {buffer.stale?<p role="status">Saved entry revision changed. Your unsaved text is retained below. Compare it before reloading.</p>:null}
    {buffer.error?<p role="alert">{buffer.error}</p>:null}
    {buffer.stale?<button type="button" onClick={buffer.reload}>Reload saved inquiry presentation</button>:null}
    <p>This changes presentation and public-facing context, not the original manuscript. Optional thoughts may stay blank. A complete intended fragment can still leave its question open. Saving does not review or publish it.</p>
    <label><input type="checkbox" name="enabled" defaultChecked={!!initial}/> Use inquiry-space presentation</label>
    <label>Creative form<select name="form" defaultValue={initial?.form??(entry.format==='poetry'?'expression':'glimmer')}>{Object.entries(inquiryForms).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    <label>Mode of this account<select name="mode" defaultValue={initial?.epistemicMode??(entry.format==='poetry'?'expression':'open_question')}>{Object.entries(inquiryModes).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    <p>Form, evidence and editorial approval are separate. These options are not a confidence score or a required progression. Factual claims and third-party material still need source/rights review.</p>
    <label><input type="checkbox" name="featured" defaultChecked={initial?.featured??false}/> Feature in the curated inquiry space after exact publication approval</label>
    {([['prompt','Opening question'],['origin','Origin'],['observation','What caught attention'],['possibleExplanations','Possible explanations'],['competingInterpretations','Other interpretations'],['unresolvedQuestion','What remains open']] as const).map(([key,label])=><label key={key}>{label} (optional public context)<textarea name={key} defaultValue={initial?.[key]??''}/></label>)}
    <button>Save inquiry presentation as draft</button>
  </form>
}

export type PairingFields={fromId:string;toId:string;rationale:string;exploration:RelationshipExploration;evidenceIds:string[]}
export function ExploratoryPairingEditor({entries,evidence,initial,onSave}:{entries:Entry[];evidence:Evidence[];initial?:Relationship;onSave:(value:PairingFields,expectedRevision?:number)=>Promise<void>}) {
  const buffer=useRevisionBuffer(initial?.revision??0)
  if(entries.length<2)return <p>A fragment can stand alone. Two saved entries are needed to author a pairing.</p>
  return <form key={buffer.epoch} aria-label={initial?`Exploratory pairing ${initial.id}`:'Author an exploratory pairing'} onChange={buffer.changed} onSubmit={async event=>{
    event.preventDefault();const form=new FormData(event.currentTarget)
    if(buffer.stale){buffer.setError('Saved relationship revision changed. Compare your unsaved explanation before explicitly reloading.');return}
    try{await onSave({fromId:initial?.fromId??String(form.get('from')),toId:initial?.toId??String(form.get('to')),rationale:String(form.get('rationale')),exploration:{schemaVersion:1,level:form.get('level') as RelationshipExploration['level'],boundary:String(form.get('boundary')),featured:form.get('featured')==='on',...(form.get('question')?{usefulQuestion:String(form.get('question'))}:{})},evidenceIds:form.getAll('evidence').map(String)},initial?buffer.base:undefined);buffer.saved();buffer.setError('')}
    catch(error){buffer.setError(error instanceof Error?error.message:'Save failed; your input remains below.')}
  }}>
    {buffer.stale?<p role="status">Saved relationship revision changed. Your unsaved explanation is retained below. Compare it before reloading.</p>:null}
    {buffer.error?<p role="alert">{buffer.error}</p>:null}
    {buffer.stale?<button type="button" onClick={buffer.reload}>Reload saved exploratory pairing</button>:null}
    <p>Write the connection deliberately. A reviewed resonance remains speculative and never becomes an Atlas edge automatically.</p>
    {initial?<p>Endpoints retain their stable identities. Revise the interpretation and boundaries below.</p>:<><label>First entry<select name="from" defaultValue={entries[0].id}>{entries.map(entry=><option value={entry.id} key={entry.id}>{entry.title}</option>)}</select></label><label>Second entry<select name="to" defaultValue={entries[1].id}>{entries.map(entry=><option value={entry.id} key={entry.id}>{entry.title}</option>)}</select></label></>}
    <label>Kind of connection<select name="level" defaultValue={initial?.exploration?.level??'resonance'}>{Object.entries(pairingLevels).map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    <label>What might connect them?<textarea name="rationale" defaultValue={initial?.rationale??''} required/></label>
    <label>Where does the comparison break?<textarea name="boundary" defaultValue={initial?.exploration?.boundary??''} required/></label>
    <label>A question it opens (optional)<textarea name="question" defaultValue={initial?.exploration?.usefulQuestion??''}/></label>
    <label><input type="checkbox" name="featured" defaultChecked={initial?.exploration?.featured??false}/> Feature this pairing after exact publication approval</label>
    <label>Existing source references (optional for resonance/interpretation)<select name="evidence" multiple defaultValue={initial?.evidenceIds??[]} size={Math.min(Math.max(evidence.length,2),5)}>{evidence.map(source=><option value={source.id} key={source.id}>{source.title}</option>)}</select></label>
    <p>A supported relationship needs relevant selected evidence and an investigation or pattern endpoint. Structural validation does not establish that a source supports the claim.</p>
    <button>{initial?'Revise exploratory proposal':'Save exploratory proposal'}</button>
  </form>
}
