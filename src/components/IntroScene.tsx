import React from 'react'
import { caseStructures } from '../design/CaseStructure'

/**
 * The introduction's drawing: a short investigation in four frames, drawn as a field of evidence.
 *
 *   0 · the question   one point of light in a network: an outcome and its explanation, taken as one
 *   1 · notice         brackets close on the point, and it will not sit still
 *   2 · test           a lens (sage, a check) passes over it, and it splits in two, each part labelled
 *   3 · show           an orange thread joins the two; the nine published case studies light up around it,
 *                      each split and joined the same way and tagged with its structure, while signals
 *                      travel out along the spokes
 *
 * Decorative (aria-hidden): the live status line and the step button say the same in words. Movement only;
 * text never fades. Positions are composition, not data; spokes show one way of looking applied to each case,
 * never a relationship between cases.
 */
const W = 800, H = 420, CX = 400, CY = 196

/** Deterministic dust, so server and client draw the same field. */
const dust = Array.from({ length: 110 }, (_, index) => {
  const a = Math.sin(index * 33.17) * 15731.743, b = Math.sin(index * 71.9) * 7853.11
  return { x: Math.round((a - Math.floor(a)) * W), y: Math.round(26 + (b - Math.floor(b)) * 330), r: index % 9 === 0 ? 1.5 : .75 }
})
/** Faint links between near neighbours: the network the question sits in. */
const mesh = dust.flatMap((p, i) => {
  let best = -1, distance = Infinity
  dust.forEach((q, j) => { if (j !== i) { const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < distance) { distance = d; best = j } } })
  return best > i || (best >= 0 && distance < 64 && i % 3 === 0) ? [[p, dust[best]] as const] : []
}).filter(([p, q]) => Math.hypot(p.x - q.x, p.y - q.y) < 80 && Math.hypot(p.x - CX, p.y - CY) > 70)

/** The nine published case studies, placed on an ellipse around the question. */
const cases = Object.values(caseStructures).map((structure, i, all) => {
  const angle = -Math.PI / 2 + (i + .5) * (2 * Math.PI / all.length)
  const x = Math.round(CX + Math.cos(angle) * 318), y = Math.round(CY + Math.sin(angle) * 138)
  const right = x >= CX
  const width = Math.round(structure.name.length * 6.4 + 18)
  return { name: structure.name, x, y, right, width }
})

const captions = [
  'AN OUTCOME AND ITS EXPLANATION · TAKEN AS ONE',
  '01 · NOTICE · SOMETHING DOESN’T ADD UP',
  '02 · TEST · THE EXPLANATION AGAINST WHAT HAPPENED',
  '03 · SHOW · RELATED. NOT EQUIVALENT.',
] as const
const tiles = ['1', '2', '3', 'dive'] as const

/** A label in a pill, with a short leader line back to what it names. */
function Tag({ x, y, text, width, anchor, className = '' }: { x: number; y: number; text: string; width: number; anchor: 'start' | 'end' | 'middle'; className?: string }) {
  const left = anchor === 'start' ? x : anchor === 'end' ? x - width : x - width / 2
  return <g className={`intro-scene-tag ${className}`}>
    <rect x={left} y={y - 11} width={width} height="22" rx="11"/>
    <text x={left + width / 2} y={y + 4} textAnchor="middle">{text}</text>
  </g>
}

export function IntroScene({ stage }: { stage: 0 | 1 | 2 | 3 }) {
  return <svg className="intro-scene" data-stage={stage} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
    <g className="intro-scene-mesh">{mesh.map(([p, q], i) => <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y}/>)}</g>
    {dust.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} className="intro-scene-dust"/>)}

    {/* Progress: three steps, then dive. */}
    <g className="intro-scene-tiles" transform={`translate(${CX - 58} 0)`}>
      {tiles.map((tile, i) => <g key={tile} transform={`translate(${i * 30} 4)`} className={i < stage ? 'is-done' : i === stage ? 'is-current' : ''}>
        <rect width="22" height="22" rx="2"/>
        {tile === 'dive' ? <path d="M11 6v9M7 11.5l4 4 4-4"/> : <text x="11" y="15.5" textAnchor="middle">{tile}</text>}
      </g>)}
    </g>

    {/* Stage 3: one way of looking, applied to each case. Signals travel out along the spokes. */}
    {stage === 3 ? <g className="intro-scene-spokes">{cases.map((c, i) => <g key={c.name} style={{ ['--i' as string]: i } as React.CSSProperties}>
      <line x1={CX} y1={CY} x2={c.x} y2={c.y} className="intro-scene-spoke"/>
      <line x1={CX} y1={CY} x2={c.x} y2={c.y} className="intro-scene-signal"/>
    </g>)}</g> : null}

    {cases.map((c, i) => <g key={c.name} className="intro-scene-case" transform={`translate(${c.x} ${c.y})`} style={{ ['--i' as string]: i } as React.CSSProperties}>
      <line x1="-8" x2="8" className="intro-scene-case-thread"/>
      <circle r="3" className="intro-scene-case-left"/><circle r="3" className="intro-scene-case-right"/>
      {stage === 3 ? <g className="intro-scene-case-label"><Tag x={c.right ? 16 : -16} y={0} text={c.name} width={c.width} anchor={c.right ? 'start' : 'end'}/></g> : null}
    </g>)}

    <g transform={`translate(${CX} ${CY})`}>
      <circle r="24" className="intro-scene-halo"/>
      {stage === 3 ? <circle r="30" className="intro-scene-focus"/> : null}
      {stage >= 1 ? <g className="intro-scene-frame" data-wide={stage >= 2 ? '' : undefined}>
        {(stage === 1 ? [[-44, -38, 1, 1], [44, -38, -1, 1], [-44, 38, 1, -1], [44, 38, -1, -1]] : [[-236, -62, 1, 1], [236, -62, -1, 1], [-236, 62, 1, -1], [236, 62, -1, -1]])
          .map(([x, y, dx, dy], i) => <path key={i} d={`M${x} ${y + dy * 12}V${y}H${x + dx * 12}`}/>)}
      </g> : null}
      {stage === 2 ? <g className="intro-scene-lens" key="lens"><ellipse rx="16" ry="58"/></g> : null}
      <line x1="-60" x2="60" className="intro-scene-thread"/>
      <circle r="10" className="intro-scene-gap"/>
      <g className="intro-scene-left"><circle r="7" className="intro-scene-body"/>{stage >= 2 ? <><line x1="-5" y1="6" x2="-16" y2="20" className="intro-scene-leader"/><Tag x={-12} y={32} text="WHAT HAPPENED" width={128} anchor="end"/></> : null}</g>
      <g className="intro-scene-right"><circle r="7" className="intro-scene-body intro-scene-body--turn"/>{stage >= 2 ? <><line x1="5" y1="-6" x2="16" y2="-20" className="intro-scene-leader"/><Tag x={12} y={-32} text="WHAT WAS ASSUMED" width={150} anchor="start" className="intro-scene-tag--turn"/></> : null}</g>
    </g>
    <text className="intro-scene-caption" x={CX} y={H - 8} textAnchor="middle">{captions[stage]}</text>
  </svg>
}
