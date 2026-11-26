import React, { useEffect, useMemo, useRef, useState } from 'react'
import { graphEdges, graphNodes, type GraphNode } from '../data'
import { legacyFragments } from '../content/legacy-fragments'
import { caseLabels } from '../content/primary-evidence'
import { publicPath } from '../public-path'
import { count } from '../analytics'

/**
 * The Observatory's layered connections field, restored from the
 * previous edition's system map and redrawn after the constellation references the owner supplied.
 * Three layers, each adding to the last: the work and its topics, then the thinking (field notes,
 * origins, frameworks), then the archive. Deeper layers sit smaller and drift less, so the field reads
 * in depth. Choosing a point traces its direct connections, in words as well as lines.
 *
 * The links are editorial associations the owner drew, as before; they are not evidence of cause.
 * Without JavaScript the whole field is listed as text, with every connection as a sentence.
 */
type Layer = 'core' | 'thinking' | 'archive'
const layerRank: Record<Layer, number> = { core: 0, thinking: 1, archive: 2 }
const layerNames: Record<Layer, string> = { core: 'The work', thinking: '+ Thinking', archive: '+ Archive' }
const kindNames: Record<GraphNode['kind'], string> = { project: 'Case study', tag: 'Topic', origin: 'Origin or framework', writing: 'Field note or essay', archive: 'Earlier work' }

/** Current names and destinations: case studies by setting, old fragments by their current page. */
const projectNames: Record<string, string> = { 'documentation-recovery': 'Knowledge guides · insurance operations' }
const label = (node: GraphNode) => node.kind === 'project' ? projectNames[node.id] ?? caseLabels[node.id] ?? node.label : node.label
const detail = (node: GraphNode) => node.kind === 'project' ? (node.id === 'documentation-recovery' ? 'The guides and training built from administrators’ knowledge, part of the insurance operations case study.' : `The ${(caseLabels[node.id] ?? node.label).toLowerCase()} case study.`) : node.detail
const destination = (node: GraphNode) => {
  const fragment = node.href?.startsWith('#') ? node.href.slice(1) : undefined
  return fragment && Object.hasOwn(legacyFragments, fragment) ? legacyFragments[fragment] : undefined
}
const nodeById = new Map(graphNodes.map(node => [node.id, node]))
const statement = (edge: typeof graphEdges[number]) => {
  const source = label(nodeById.get(edge.source)!), target = label(nodeById.get(edge.target)!)
  return edge.relation ? `${source} ${edge.relation} ${target}` : `${source} touches ${target}`
}

/** Seeded dust, identical on server and client. */
const dust = Array.from({ length: 140 }, (_, index) => {
  const a = Math.sin(index * 91.7) * 24634.6345, b = Math.sin(index * 47.3) * 9876.5432
  return { x: (a - Math.floor(a)) * 100, y: (b - Math.floor(b)) * 100, r: index % 11 === 0 ? .32 : .16 }
})

export function ConnectionsField() {
  const [enhanced, setEnhanced] = useState(false)
  const [layer, setLayer] = useState<Layer>('core')
  const [selected, setSelected] = useState<string | null>(null)
  const stage = useRef<HTMLDivElement>(null)
  useEffect(() => setEnhanced(true), [])
  // Depth on pointer movement: deeper layers drift less. Off under reduced motion and on touch.
  useEffect(() => {
    const element = stage.current
    if (!element || !matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) return
    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      element.style.setProperty('--px', ((event.clientX - box.left) / box.width - .5).toFixed(3))
      element.style.setProperty('--py', ((event.clientY - box.top) / box.height - .5).toFixed(3))
    }
    element.addEventListener('pointermove', move)
    return () => element.removeEventListener('pointermove', move)
  }, [enhanced])

  const visible = useMemo(() => graphNodes.filter(node => layerRank[node.layer ?? 'core'] <= layerRank[layer]), [layer])
  const visibleIds = useMemo(() => new Set(visible.map(node => node.id)), [visible])
  const edges = useMemo(() => graphEdges.filter(edge => visibleIds.has(edge.source) && visibleIds.has(edge.target) && layerRank[edge.layer ?? 'core'] <= layerRank[layer]), [layer, visibleIds])
  const neighbours = useMemo(() => {
    const ids = new Set<string>(selected ? [selected] : [])
    if (selected) edges.forEach(edge => { if (edge.source === selected) ids.add(edge.target); if (edge.target === selected) ids.add(edge.source) })
    return ids
  }, [selected, edges])
  const current = selected ? nodeById.get(selected) : undefined
  const choose = (id: string) => {
    const node = nodeById.get(id)
    if (node && layerRank[node.layer ?? 'core'] > layerRank[layer]) setLayer(node.layer ?? 'core')
    setSelected(value => value === id ? null : id)
    count('cfield-point', id)
  }

  const textList = <ul className="pc-cfield-list">{graphNodes.map(node => {
    const links = graphEdges.filter(edge => edge.source === node.id || edge.target === node.id)
    const href = destination(node)
    return <li key={node.id}><p className="pc-kicker">{kindNames[node.kind]} · {layerNames[node.layer ?? 'core'].replace('+ ', '')}</p>
      <strong>{href ? <a href={publicPath(href)}>{label(node)}</a> : label(node)}</strong>
      <span>{links.map(statement).join(' · ')}</span></li>
  })}</ul>

  return <section className="pc-cfield" aria-labelledby="pc-cfield-title">
    <p className="pc-kicker">Connections field · layered</p>
    <h2 id="pc-cfield-title">Follow the relationship, not the category.</h2>
    <p>The work, the thinking behind it and the earlier work it grew from, in three layers. Choose a point to trace what it connects to. <strong>These are associations I drew, not evidence of cause.</strong></p>
    {enhanced ? <>
      <fieldset className="pc-cfield-layers"><legend className="pc-sr-only">Layers shown</legend>{(Object.keys(layerNames) as Layer[]).map(value => <label key={value}><input type="radio" name="pc-cfield-layer" checked={layer === value} onChange={() => { setLayer(value); setSelected(null); count('cfield-layer', value) }}/>{layerNames[value]}</label>)}</fieldset>
      <div className="pc-cfield-grid">
        <div className="pc-cfield-figure"><div ref={stage} className="pc-cfield-stage pc-night" data-surface="observatory" data-selected={selected ? 'true' : undefined}>
          <svg className="pc-cfield-sky" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            {dust.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} className="pc-cfield-dust"/>)}
            {edges.map(edge => { const a = nodeById.get(edge.source)!, b = nodeById.get(edge.target)!; const lit = !!selected && neighbours.has(a.id) && neighbours.has(b.id) && (a.id === selected || b.id === selected); return <line key={`${edge.source}-${edge.target}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="pc-cfield-edge" data-layer={edge.layer ?? 'core'} data-lit={lit || undefined}/> })}
          </svg>
          <ul className="pc-cfield-points" aria-label={`Points in the field: ${visible.length}`}>{visible.map(node => <li key={node.id} data-layer={node.layer ?? 'core'} data-kind={node.kind} data-near={neighbours.has(node.id) || undefined} style={{ left: `${node.x}%`, top: `${node.y}%` }}>
            <button type="button" aria-pressed={node.id === selected} onClick={() => choose(node.id)}><span className="pc-cfield-mark" aria-hidden="true"/><span className="pc-cfield-name">{label(node)}</span><span className="pc-sr-only">, {kindNames[node.kind]}</span></button>
          </li>)}</ul>
        </div>
        <p className="pc-cfield-caption">FIG · Editorial map · {edges.length} associations, {visible.length} points</p></div>
        <div className="pc-cfield-panel" aria-live="polite">{current ? <>
          <p className="pc-kicker">{kindNames[current.kind]}</p>
          <h3>{label(current)}</h3>
          <p>{detail(current)}</p>
          {edges.some(edge => edge.source === current.id || edge.target === current.id) ? <><p className="pc-cfield-label">Connects to</p><ul className="pc-cfield-trace">{edges.filter(edge => edge.source === current.id || edge.target === current.id).map(edge => { const other = edge.source === current.id ? edge.target : edge.source; return <li key={other}><button type="button" onClick={() => choose(other)}>{statement(edge)}</button></li> })}</ul></> : null}
          {destination(current) ? <p><a className="pc-text-link" href={publicPath(destination(current)!)}>Go to {current.kind === 'project' ? 'the case study' : 'its page'} <span aria-hidden="true">→</span></a></p> : null}
          <p><button type="button" className="pc-field-quiet" onClick={() => setSelected(null)}>Clear the trace</button></p>
        </> : <>
          <p className="pc-kicker">{layerNames[layer]}</p>
          <p>Choose any point. Start with a case study, or a topic such as <button type="button" className="pc-cfield-inline" onClick={() => choose('tag-systems')}>#systems</button>, <button type="button" className="pc-cfield-inline" onClick={() => choose('tag-evidence')}>#evidence</button> or <button type="button" className="pc-cfield-inline" onClick={() => choose('tag-curiosity')}>#curiosity</button>.</p>
        </>}</div>
      </div>
    </> : null}
    <details className="pc-disclosure pc-cfield-text" open={!enhanced || undefined}><summary>The whole field as text</summary>{textList}</details>
  </section>
}
