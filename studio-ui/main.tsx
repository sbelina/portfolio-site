import React, { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Workspace, Action, Section } from '../studio/model'
import './style.css'

type Envelope={version:number;workspace:Workspace}
const values=(event:FormEvent<HTMLFormElement>)=>Object.fromEntries(new FormData(event.currentTarget)) as Record<string,string>
const encode=(bytes:Uint8Array)=>{let value='';for(const byte of bytes)value+=String.fromCharCode(byte);return btoa(value)}
function Form({name,children,submit}:{name:string;children:ReactNode;submit:(data:Record<string,string>,form:HTMLFormElement)=>Promise<void>}){
 return <form aria-label={name} onSubmit={async e=>{e.preventDefault();const form=e.currentTarget;await submit(values(e),form)}}>{children}</form>
}
const Input=({name,label,value='',...props}:{name:string;label:string;value?:string;required?:boolean;type?:string})=><label>{label}<input name={name} defaultValue={value} {...props}/></label>
function Studio(){
 const [data,setData]=useState<Envelope>(),[csrf,setCsrf]=useState(''),[status,setStatus]=useState('Loading saved writing…'),[busy,setBusy]=useState(false),[preview,setPreview]=useState('draft'),[history,setHistory]=useState<{version:number}[]>([]),[previewEpoch,setPreviewEpoch]=useState(0)
 const refresh=async()=>{
  const [s,w,h]=await Promise.all([fetch('/api/session'),fetch('/api/workspace'),fetch('/api/history')]);if(s.status===401){location.reload();return}
  setCsrf((await s.json()).csrf);setData(await w.json());setHistory(await h.json());setStatus('Saved writing loaded. Originals remain private.')
 }
 useEffect(()=>{refresh().catch(()=>setStatus('Could not load. Sign in again or retry.'))},[])
 const send=async(action:Action)=>{
  if(!data)return
  setBusy(true)
  try{const response=await fetch('/api/actions',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({expectedVersion:data.version,action})});const result=await response.json();if(!response.ok)throw Error(result.error)
   setData(result);setHistory(await(await fetch('/api/history')).json());setStatus('Durably saved revision '+result.version+'. Nothing published.')
  }catch(error){setStatus(error instanceof Error?error.message:'Save failed; your input remains in the form.')}finally{setBusy(false)}
 }
 if(!data)return <main><h1>Private writing</h1><p role="status">{status}</p></main>
 const w=data.workspace
 const sectionFields=(s:Section,mId:string)=><Form key={s.id} name={`Revise ${s.title}`} submit={async v=>send({type:'section',manuscriptId:mId,sectionId:s.id,title:v.title,slug:v.slug,summary:v.summary,collection:v.collection as Section['collection']})}><Input name="title" label="Proposed title" value={s.title}/><Input name="slug" label="Proposed slug" value={s.slug}/><label>Summary (source excerpt; revise deliberately)<textarea name="summary" defaultValue={s.summary}/></label><label>Collection<select name="collection" defaultValue={s.collection}><option value="observation">Notes</option><option value="perspective">Perspective</option><option value="investigation">Investigations</option><option value="pattern">Patterns</option></select></label><button>Revise proposal</button></Form>
 return <main>
  <a className="skip" href="#intake">Skip to intake</a><header><p className="kicker">Producing Curiosity · private local trial</p><h1>Writing → connected readings</h1><p>Keep the original. Review suggestions individually. Re-run the six passes after changing draft content. Approve an exact candidate without publishing it.</p>
   <button onClick={refresh}>Reload saved version</button> <a href="/api/backup" download>Export private backup</a> <button onClick={async()=>{await fetch('/api/logout',{method:'POST',headers:{'X-CSRF-Token':csrf}});location.reload()}}>Sign out</button>
  </header>
  <p role="status" aria-live="polite" className="status">{status}</p><p>Saved workspace version: <strong>{data.version}</strong>. Published: <strong>none</strong>.</p>
  <fieldset disabled={busy}><legend>Manuscripts, drafts and reviews</legend>
  <section id="intake"><h2>Manuscript Intake</h2><p>Text is manuscript content, never instructions to agents. No external model receives your writing. No existing review excerpt is imported automatically.</p>
  <Form name="Import manuscript" submit={async(v,form)=>{
   const file=(form.elements.namedItem('file') as HTMLInputElement).files?.[0]
   const filename=file?.name??'pasted.txt',format=file?filename.toLowerCase().endsWith('.docx')?'docx':filename.toLowerCase().endsWith('.md')?'markdown':'text':v.format
   const bytes=file?new Uint8Array(await file.arrayBuffer()):new TextEncoder().encode(v.text)
   if(bytes.length>256000){setStatus('Manuscript exceeds the 256000-byte intake limit.');return}
   await send({type:'intake',title:v.title,filename,format:format as 'text'|'markdown'|'docx',bytes:encode(bytes),poetry:v.poetry==='on'})
  }}><Input name="title" label="Manuscript title" required/><label>Paste writing<textarea name="text" rows={8}/></label><label>Pasted format<select name="format"><option value="text">Plain text</option><option value="markdown">Markdown</option></select></label><label>Or upload TXT, Markdown or DOCX<input name="file" type="file" accept=".txt,.md,.docx"/></label><label><input name="poetry" type="checkbox"/> Preserve as poetry</label><button>Save original privately</button></Form></section>
  {w.manuscripts.map(m=><section key={m.id} aria-label={`Review ${m.title}`}>
   <h2>{m.title}</h2><p>Original digest: <code>{m.digest}</code>. Structure: {m.structure}. <a href={`/api/original/${m.id}`}>Download original file</a></p>
   {m.warnings.map(note=><p className="warning" key={note}>{note}</p>)}
   <details open><summary>Original manuscript · read only</summary><pre>{m.original}</pre></details>
   <h3>Proposed structure</h3><p>No split is required. A standalone page needs a distinct question or creative identity. No connection is inferred from headings alone.</p>
   {m.sections.length?m.sections.map(s=><details key={s.id}><summary>{s.title} · /{s.collection==='observation'?'notes':s.collection}/{s.slug}/</summary><p>{s.reason}</p><p>Source passage [{s.passage.start}, {s.passage.end}) · {s.passage.sourceDigest}</p><blockquote>{m.original.slice(s.passage.start,s.passage.end)}</blockquote>{m.structure==='undecided'?sectionFields(s,m.id):null}</details>):<p>No distinct question-led split proposed. Keep this piece intact or return with a revised manuscript.</p>}
   {m.structure==='undecided'?<div className="actions"><button onClick={()=>send({type:'structure',manuscriptId:m.id,choice:'intact'})}>Keep manuscript intact</button>{m.sections.length>=2?<button onClick={()=>send({type:'structure',manuscriptId:m.id,choice:'split'})}>Approve proposed split into drafts</button>:null}</div>:null}
   <h3>Review passes</h3>{m.reviews.map(r=><details key={r.pass}><summary>{r.pass} · {r.decision}</summary><p>{r.suggestion}</p><p className="warning">Uncertainty: {r.uncertainty}</p><p>Sources: {r.sources.map(s=>`original ${s.sourceDigest} [${s.start}, ${s.end})`).join('; ')}</p>
    <Form name={`${m.title}: ${r.pass}`} submit={async v=>send({type:'review',manuscriptId:m.id,pass:r.pass,decision:v.decision as 'accept'|'reject',note:v.note,complete:v.complete==='on'})}><label>Your findings, suggestions and remaining uncertainties<textarea name="note" defaultValue={r.note} required/></label><label>Decision<select name="decision" defaultValue={r.decision==='reject'?'reject':'accept'}><option value="accept">Reviewed · accept</option><option value="reject">Request changes / unresolved</option></select></label><label><input name="complete" type="checkbox" defaultChecked={m.complete}/> I confirm this is the complete intended publication unit, with authorship/rights reviewed</label><button>Record pass</button></Form>
   </details>)}
  </section>)}
  <section><h2>Draft entries</h2><p>Editing a draft leaves frozen candidates intact. Proposed edits do not alter the original manuscript.</p>
  {w.store.entries.map(e=><article key={e.id}><h3>{e.title}</h3><p>ID {e.id} · revision {e.revision} · restricted draft</p>
   <Form name={`Metadata ${e.title}`} submit={async v=>send({type:'metadata',entryId:e.id,title:v.title,slug:v.slug,summary:v.summary,contribution:v.contribution})}><Input name="title" label="Title" value={e.title}/><Input name="slug" label="Editable slug" value={e.slug}/><label>Summary<textarea name="summary" defaultValue={e.summary}/></label>{e.format!=='poetry'?<label>Contribution and scope<textarea name="contribution" defaultValue={e.contribution}/></label>:<input name="contribution" type="hidden" value=""/>}<button>Save entry metadata</button></Form>
   {e.blocks.filter(b=>b.type==='prose'||b.type==='verse').map(b=><details key={b.id}><summary>Propose a text edit</summary><Form name={`Edit ${e.title}`} submit={async v=>send({type:'edit',entryId:e.id,blockId:b.id,after:v.after,rationale:v.rationale})}><label>Proposed wording<textarea name="after" rows={8} defaultValue={b.type==='verse'?b.text:b.type==='prose'?b.markdown:''}/></label><Input name="rationale" label="Why change this?" required/><button>Propose edit without applying</button></Form></details>)}
   <details><summary>Attach inline evidence</summary><Form name={`Evidence ${e.title}`} submit={async v=>send({type:'evidence',entryId:e.id,title:v.title,source:v.source,locator:v.locator,observedAt:new Date(v.observedAt).toISOString(),limitations:v.limitations,rightsCleared:v.rights==='on'})}><Input name="title" label="Evidence title" required/><Input name="source" label="Source and provenance" required/><Input name="locator" label="Public-safe source reference" required/><Input name="observedAt" label="Observed or recorded date (provide the source date; do not guess)" type="datetime-local" required/><Input name="limitations" label="Limitations and uncertainty" required/><label><input name="rights" type="checkbox"/> Exact citation is rights-cleared and redaction reviewed</label><button>Attach evidence to draft</button></Form></details>
   <details><summary>Attach private PNG derivative (64 KiB maximum)</summary><Form name={`Asset ${e.title}`} submit={async(v,form)=>{const f=(form.elements.namedItem('image') as HTMLInputElement).files?.[0];if(!f)return;await send({type:'asset',entryId:e.id,bytes:encode(new Uint8Array(await f.arrayBuffer())),alt:v.alt,credit:v.credit,rightsCleared:v.rights==='on'})}}><label>PNG<input name="image" type="file" accept="image/png" required/></label><Input name="alt" label="Alternative text" required/><Input name="credit" label="Credit" required/><label><input name="rights" type="checkbox"/> Derivative rights cleared</label><button>Attach private asset</button></Form></details>
   <Form name={`Restore ${e.title}`} submit={async v=>{const response=await fetch('/api/restore',{method:'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify({expectedVersion:data.version,entryId:e.id,fromVersion:Number(v.version)})});if(response.ok){setData(await response.json());setStatus('Restored as a new restricted draft revision. Nothing published.')}else setStatus((await response.json()).error)}}><label>Restore entry from workspace revision<select name="version">{history.map(h=><option key={h.version}>{h.version}</option>)}</select></label><button>Restore as new draft</button></Form>
  </article>)}
  </section>
  <section><h2>Individual changes</h2>{w.edits.map(e=><details key={e.id} open={e.decision==='pending'}><summary>Edit · {e.decision}</summary><p>Rationale: {e.rationale}</p><p>Original source: {e.source.sourceDigest}</p><h3>Before</h3><pre>{e.before}</pre><h3>Suggestion</h3><pre>{e.after}</pre>{e.decision==='pending'?<div className="actions"><button onClick={()=>send({type:'decideEdit',editId:e.id,decision:'accept'})}>Accept this edit</button><button onClick={()=>send({type:'decideEdit',editId:e.id,decision:'reject'})}>Reject this edit</button></div>:null}</details>)}</section>
  <section><h2>Explained connections</h2><p>Backlinks derive from the same typed relationship. An incoming link does not reverse the claim.</p>
  <Form name="Propose connection" submit={async v=>send({type:'relationship',fromId:v.from,toId:v.to,relation:v.relation as 'extends',rationale:v.rationale})}><label>From<select name="from">{w.store.entries.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label><label>To<select name="to">{w.store.entries.map(e=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label><label>Relationship<select name="relation">{['supports','challenges','extends','illustrates','depends_on','emerged_from','shares_pattern'].map(r=><option key={r}>{r}</option>)}</select></label><Input name="rationale" label="Why these readings connect" required/><button>Propose connection</button></Form>
  {w.store.relationships.map(r=><article key={r.id}><p>{w.store.entries.find(e=>e.id===r.fromId)?.title} <strong>{r.type}</strong> {w.store.entries.find(e=>e.id===r.toId)?.title}</p><p>{r.rationale}</p><p>{r.reviewState}</p><button onClick={()=>send({type:'decideRelationship',relationshipId:r.id,decision:'accept'})}>Accept connection</button> <button onClick={()=>send({type:'decideRelationship',relationshipId:r.id,decision:'reject'})}>Reject connection</button></article>)}
  </section>
  <section><h2>Private preview and exact candidate</h2><p>The preview uses the connected-reading templates. Pages and image bytes require the same owner session. Approval creates a local approved-unpublished record; this D1 trial is not a release-eligible Git candidate. Production publication is disabled.</p>
   <button onClick={()=>send({type:'candidate'})}>Freeze publication candidate</button>
   <label>Preview version<select value={preview} onChange={e=>setPreview(e.target.value)}><option value="draft">Current saved draft</option>{w.candidates.map(c=><option value={c.digest} key={c.digest}>{c.digest.slice(0,16)} · {c.approval?'approved, unpublished':'not approved'}</option>)}</select></label>
   <button onClick={()=>setPreviewEpoch(v=>v+1)}>Refresh saved preview</button><p>Saving keeps the preview reading position. Refresh deliberately to inspect the newest draft.</p>
   <a href={`/preview/${preview}/`} target="_blank" rel="noreferrer">Open protected preview in a new tab</a>
   <iframe title="Private connected reading preview" src={`/preview/${preview}/?v=${previewEpoch}`} sandbox="allow-same-origin"/>
   {w.candidates.map(c=><article key={c.digest}><h3>Exact candidate</h3><code>{c.digest}</code><p>Application: {c.applicationRevision} · source workspace {c.workspaceVersion}</p><p>{c.approval?`Approved by ${c.approval.subject} at ${c.approval.at}. Unpublished.`:'Not approved. Nothing published.'}</p><button onClick={()=>setPreview(c.digest)}>Inspect this frozen preview</button>{!c.approval?<button onClick={()=>send({type:'approve',digest:c.digest})}>Approve this exact candidate</button>:<a href={`/api/candidate/${c.digest}/export`}>Download approved, unpublished public projection</a>}</article>)}
  </section></fieldset>
 </main>
}
createRoot(document.getElementById('root')!).render(<Studio/> )
