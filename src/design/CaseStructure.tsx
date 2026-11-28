import React from 'react'

/**
 * One small figure per case: the shape of its relationship, drawn as a graph. Each is named in words
 * below the drawing, so the figure never carries meaning by shape alone. Conceptual, not data.
 */
export const caseStructures: Readonly<Record<string, { name: string; text: string }>> = {
  'claims-operations': { name: 'Directed path', text: 'The check moves ahead of payment.' },
  'brand-research': { name: 'Two independent axes', text: 'Agreement and influence, measured apart.' },
  'enterprise-ai': { name: 'Many-to-few mapping', text: 'Thirty-eight proposals onto eight challenges.' },
  telematics: { name: 'Two nodes, no edge', text: 'A usability score and a recommendation score, unconnected.' },
  'civic-service': { name: 'A path across a tree', text: 'One resident question crosses several offices.' },
  'accessibility-ai': { name: 'A loop and an outside check', text: 'The agent’s cycle, and a human review outside it.' },
  'operational-friction': { name: 'Contraction', text: 'Repeated steps merged into one shortcut.' },
  'knowledge-binder': { name: 'Star', text: 'Six sources joined at one hub.' },
  'knowledge-publishing': { name: 'Merged classes', text: 'Duplicate tags folded into shared categories.' },
}

const node = (x: number, y: number, key?: string, turn = false) => <circle key={key ?? `${x}-${y}`} cx={x} cy={y} r={turn ? 4.5 : 3} className={turn ? 'pc-legend-turn' : 'pc-struct-node'}/>
const edge = (x1: number, y1: number, x2: number, y2: number, kind: 'ink' | 'thread' | 'faint' = 'ink') => <path key={`${x1}${y1}${x2}${y2}${kind}`} d={`M${x1} ${y1}L${x2} ${y2}`} className={kind === 'thread' ? 'pc-legend-thread' : 'pc-legend-ink'} strokeDasharray={kind === 'faint' ? '2 4' : undefined}/>

/** The graph for one case, drawn in a 160 × 48 box. */
export function StructureDrawing({ slug }: { slug: string }) {
  switch (slug) {
    case 'claims-operations': return <>{edge(14, 30, 56, 30, 'thread')}{edge(56, 30, 100, 30)}{edge(100, 30, 146, 30)}<path d="M86 30l-6-3.5v7zM132 30l-6-3.5v7z" className="pc-struct-node"/><path d="M122 24C112 6 70 6 60 22" className="pc-legend-ink" strokeDasharray="2 3" fill="none"/>{node(14, 30)}{node(56, 30, 'check', true)}{node(100, 30)}{node(146, 30)}</>
    case 'brand-research': return <>{edge(20, 44, 20, 4)}{edge(20, 44, 150, 44)}{[[40, 12], [62, 34], [85, 20], [104, 38], [128, 10], [140, 28]].map(([x, y]) => node(x, y))}</>
    case 'enterprise-ai': { const left = Array.from({ length: 7 }, (_, i) => [14, 5 + i * 6.3]); const right = [[140, 8], [140, 20], [140, 32], [140, 42]]; return <>{left.map(([x, y], i) => edge(x, y, right[i % 4][0], right[i % 4][1], 'faint'))}{left.map(([x, y]) => node(x, y))}{right.map(([x, y], i) => node(x, y, `r${i}`, i === 0))}</> }
    case 'telematics': return <>{node(36, 24, 'a', true)}{node(124, 24)}{edge(46, 24, 70, 24, 'faint')}{edge(90, 24, 114, 24, 'faint')}<path d="M76 18L84 30M84 18L76 30" className="pc-legend-thread"/></>
    case 'civic-service': return <>{edge(80, 6, 30, 26)}{edge(80, 6, 80, 26)}{edge(80, 6, 130, 26)}{[[30, 26], [80, 26], [130, 26]].map(([x, y]) => [edge(x, y, x - 12, 42), edge(x, y, x + 12, 42)])}{node(80, 6)}{[30, 80, 130].map(x => node(x, 26))}{[18, 42, 68, 92, 118, 142].map(x => node(x, 42))}<path d="M18 42C50 36 60 46 92 42S130 36 142 42" className="pc-legend-thread"/></>
    case 'accessibility-ai': return <>{edge(40, 10, 70, 38)}{edge(70, 38, 10, 38)}{edge(10, 38, 40, 10)}{node(40, 10)}{node(70, 38)}{node(10, 38)}{edge(70, 38, 130, 24, 'faint')}{node(130, 24, 'human', true)}</>
    case 'operational-friction': return <>{[12, 26, 40, 54, 68].map(x => node(x, 14))}{[12, 26, 40, 54].map(x => edge(x, 14, x + 14, 14))}{edge(76, 14, 104, 30, 'faint')}{node(112, 30, 'merged', true)}{edge(112, 30, 132, 18)}{edge(112, 30, 132, 42)}{node(132, 18)}{node(132, 42)}</>
    case 'knowledge-binder': { const leaves = [[20, 8], [20, 24], [20, 40], [140, 8], [140, 24], [140, 40]]; return <>{leaves.map(([x, y]) => edge(80, 24, x, y))}{leaves.map(([x, y]) => node(x, y))}{node(80, 24, 'hub', true)}</> }
    case 'knowledge-publishing': return <>{[[14, 6], [14, 16], [14, 26], [14, 36], [14, 44]].map(([x, y], i) => [edge(x, y, 120, i < 3 ? 12 : 36, i === 1 ? 'thread' : 'faint'), node(x, y)])}{node(120, 12, 'c1', true)}{node(120, 36, 'c2')}<path d="M144 20l8 8M152 20l-8 8" className="pc-legend-ink"/></>
    default: return null
  }
}

/** The case's structure figure, with its name and meaning as text. Returns null for unknown slugs. */
export function CaseStructure({ slug }: { slug: string }) {
  const structure = caseStructures[slug]
  if (!structure) return null
  return <>
    <svg viewBox="0 0 160 48" aria-hidden="true" focusable="false"><StructureDrawing slug={slug}/></svg>
    <span className="pc-struct-name"><strong>{structure.name}.</strong> {structure.text}</span>
  </>
}
