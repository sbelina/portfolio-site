import React, { useEffect, useRef, useState } from 'react'
import type { AssumedObservedBlock } from '../content/assumed-observed'
import type { PublicEvidence } from '../content/model'

type Point={x:number;y:number}
const statusWords={documented:'Documented relationship',interpretation:'Interpretation',hypothesis:'Hypothesis'}
const meaningWords={supports:'Supports the assumption',challenges:'Challenges the assumption',qualifies:'Qualifies the assumption'}
export function AssumedObserved({block,evidence}:{block:AssumedObservedBlock;evidence:PublicEvidence[]}){
 const [selected,setSelected]=useState<string|null>(null),[enhanced,setEnhanced]=useState(false)
 const [anchors,setAnchors]=useState<Record<string,Point>>({})
 const board=useRef<HTMLDivElement>(null),buttons=useRef<Record<string,HTMLButtonElement|null>>({}),observations=useRef<Record<string,HTMLLIElement|null>>({})
 const prefix=`ao-${block.id}`,panelId=prefix+'-explanation'
 useEffect(()=>{setEnhanced(true)},[])
 useEffect(()=>{
  if(!enhanced || !board.current)return
  let frame=0
  const measure=()=>{
   cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{
    const rect=board.current!.getBoundingClientRect();if(!rect.width||!rect.height)return
    const points:Record<string,Point>={}
    for(const a of block.assumptions){const el=buttons.current[a.id];if(el){const r=el.getBoundingClientRect();points[a.id]={x:(r.right-rect.left)/rect.width*1000,y:(r.top+r.height/2-rect.top)/rect.height*1000}}}
    for(const o of block.observations){const el=observations.current[o.id];if(el){const r=el.getBoundingClientRect();points[o.id]={x:(r.left-rect.left)/rect.width*1000,y:(r.top+r.height/2-rect.top)/rect.height*1000}}}
    setAnchors(points)
   })
  }
  measure()
  const resize=typeof ResizeObserver==='undefined'?null:new ResizeObserver(measure)
  resize?.observe(board.current)
  Object.values(buttons.current).forEach(el=>{if(el)resize?.observe(el)})
  Object.values(observations.current).forEach(el=>{if(el)resize?.observe(el)})
  window.addEventListener('resize',measure)
  return()=>{resize?.disconnect();cancelAnimationFrame(frame);window.removeEventListener('resize',measure)}
 },[enhanced,block])
 const active=block.connections.filter(c=>c.assumptionId===selected)
 const close=()=>{const trigger=selected;setSelected(null);if(trigger)buttons.current[trigger]?.focus({preventScroll:true})}
 const explain=(assumptionId:string)=><>
  <p className="ao-eyebrow">Stated assumption · unresolved</p>
  <h3>{block.assumptions.find(a=>a.id===assumptionId)!.label}</h3>
  <blockquote><span className="ao-term">Source passage</span>{block.assumptions.find(a=>a.id===assumptionId)!.sourcePassage}</blockquote>
  {block.connections.filter(c=>c.assumptionId===assumptionId).map(c=>{
   const observation=block.observations.find(o=>o.id===c.observationId)!,source=evidence.find(e=>e.id===observation.evidenceId)
   return <section className={`ao-account ao-account--${c.meaning}`} key={c.id}>
    <p className="ao-edge-label"><span aria-hidden="true">{c.status==='documented'?'━':c.status==='interpretation'?'┄':'···'}</span> {statusWords[c.status]} · {meaningWords[c.meaning]}</p>
    <h4>{observation.label}</h4><p><strong>Explanation</strong> {c.explanation}</p>
    <p><strong>Source</strong> {source?.source??'Source unavailable'} · {source?.title??'Unresolved evidence reference'}</p>
    {source?<p><strong>Reference</strong> {/^https?:\/\//i.test(source.locator)?<a href={source.locator}>{source.locator}</a>:source.locator}</p>:null}
    <blockquote><span className="ao-term">Relevant passage</span>{observation.passage}</blockquote>
    <p className="ao-limit"><strong>Limitation</strong> {c.limitation}</p>
    {source?.limitations?<p><strong>Source limitation</strong> {source.limitations}</p>:null}
    {c.missingEvidence.length?<div className="ao-missing"><strong>Missing evidence</strong><ul>{c.missingEvidence.map((m,i)=><li key={i}>{m}</li>)}</ul></div>:null}
   </section>
  })}
 </>
 return <figure className="ao" data-enhanced={enhanced} aria-labelledby={prefix+'-title'} onKeyDown={event=>{if(event.key==='Escape'&&selected){event.stopPropagation();close()}}}>
  <figcaption><p className="ao-eyebrow">Inspect the reasoning</p><h2 id={prefix+'-title'}>{block.title}</h2><p>{block.question}</p></figcaption>
  <p className="ao-instructions ao-enhanced-only">Select one assumption. Its evidence, explanation and limitations appear alongside it. Positions stay fixed.</p>
  <p className="ao-fallback-only">Open an assumption below for its source, explained relationships and limitations. No graph interaction is required.</p>
  <ul className="ao-legend" aria-label="Relationship line styles"><li>━ Documented</li><li>┄ Interpretation</li><li>··· Hypothesis</li></ul>
  <p className="ao-status" role="status" aria-live="polite">{selected?`Selected: ${block.assumptions.find(a=>a.id===selected)?.label??''} ${active.length} explained ${active.length===1?'connection':'connections'} available in the adjacent explanation.`:'No assumption selected.'}</p>
  <div className="ao-layout">
   <div className="ao-board" ref={board}>
    <div className="ao-columns">
     <section className="ao-assumptions" aria-label="Stated assumptions"><h3>Assumed <span aria-hidden="true">→</span></h3><ul>{block.assumptions.map(a=><li key={a.id}>
      <button ref={el=>{buttons.current[a.id]=el}} type="button" aria-pressed={selected===a.id} aria-controls={panelId} onClick={()=>setSelected(a.id)} className="ao-enhanced-only"><span className="ao-node" aria-hidden="true">○</span><span>{a.label}</span></button>
      <p className="ao-static-label ao-fallback-only">○ {a.label}</p>
     </li>)}</ul></section>
     <section className="ao-observations" aria-label="Observed evidence"><h3>Observed</h3><ul>{block.observations.map(o=><li ref={el=>{observations.current[o.id]=el}} key={o.id} data-active={active.some(c=>c.observationId===o.id)}><span className="ao-node" aria-hidden="true">◇</span><span>{o.label}<small>{active.some(c=>c.observationId===o.id)?'Connected to selection':'Evidence record'}</small></span></li>)}</ul></section>
    </div>
    <svg className="ao-lines" viewBox="0 0 1000 1000" preserveAspectRatio="none" role="img" aria-label="Connections between assumptions and observations. Line length carries no numerical meaning.">
     <title>Assumed → observed relationships</title><desc>Solid means documented; dashed means interpretation; dotted means hypothesis. The text explanation contains the same relationships and evidence. Geometry does not encode strength, distance or time.</desc>
     {block.connections.map(c=>{
      const from=anchors[c.assumptionId],to=anchors[c.observationId]
      if(!from||!to)return null
      const gap=(to.x-from.x)*.55
      return <path key={c.id} data-connection-id={c.id} data-status={c.status} data-meaning={c.meaning} data-active={c.assumptionId===selected} d={`M ${from.x} ${from.y} C ${from.x+gap} ${from.y}, ${to.x-gap} ${to.y}, ${to.x} ${to.y}`} vectorEffect="non-scaling-stroke"/>
     })}
    </svg>
   </div>
   <div className="ao-panel ao-enhanced-only" id={panelId} role="region" aria-label="Selected assumption explanation">
    {selected?<><div className="ao-panel-toolbar"><p>Selected reasoning</p><button type="button" onClick={close}>Close explanation</button></div>{explain(selected)}</>:<div className="ao-empty"><span aria-hidden="true">↗</span><h3>What changes when we look?</h3><p>Select an assumption to inspect the account beside it. This is a relationship map, not a score or a measured timeline.</p></div>}
   </div>
  </div>
  <div className="ao-fallback-only ao-text-alternative">{block.assumptions.map(a=><details key={a.id}><summary>{a.label}</summary>{explain(a.id)}</details>)}</div>
 </figure>
}
