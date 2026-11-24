import React from 'react'

/**
 * The current edition's introduction as a short investigation (owner direction, 24 November 2026: clarify
 * the idea, strengthen the execution, more visual storytelling). Each authored step changes the drawing:
 *
 *   0 · the question   one point of light in a field: an outcome and its explanation, taken as one
 *   1 · notice         the point is framed and will not sit still: something doesn't add up
 *   2 · test           a lens (sage, a check) passes over it, and it splits in two
 *   3 · show           an orange thread joins the two; six fainter points split and join, one per case study
 *
 * Deck palette only (ink, orange, sage, pale construction). Decorative: the live status line and the step
 * button carry the same meaning in words. Movement only; text never fades. The dive scales the view.
 */
const dust = Array.from({ length: 90 }, (_, index) => {
  const a = Math.sin(index * 33.17) * 15731.743, b = Math.sin(index * 71.9) * 7853.11
  return { x: Math.round((a - Math.floor(a)) * 800), y: Math.round((b - Math.floor(b)) * 360), r: index % 8 === 0 ? 1.4 : .7 }
})
/** Six background points, one per published case study; positions are composition, not data. */
const others = [[120, 80], [690, 70], [150, 290], [660, 290], [250, 170], [560, 190]] as const
const captions = [
  'AN OUTCOME AND ITS EXPLANATION · TAKEN AS ONE',
  '01 · NOTICE · SOMETHING DOESN’T ADD UP',
  '02 · TEST · THE EXPLANATION AGAINST WHAT HAPPENED',
  '03 · SHOW · RELATED. NOT EQUIVALENT.',
] as const

export function IntroScene({ stage }: { stage: 0 | 1 | 2 | 3 }) {
  return <svg className="intro-scene" data-stage={stage} viewBox="0 0 800 360" aria-hidden="true" focusable="false">
    {dust.map((star, i) => <circle key={i} cx={star.x} cy={star.y} r={star.r} className="intro-scene-dust"/>)}
    {stage === 3 ? <path className="intro-scene-pattern" d={`M${others.map(([x, y]) => `${x} ${y}`).join(' L')} L400 180`}/> : null}
    {others.map(([x, y], i) => <g key={i} className="intro-scene-other" transform={`translate(${x} ${y})`} style={{ ['--i' as string]: i } as React.CSSProperties}>
      <line x1="-14" x2="14" className="intro-scene-other-thread"/>
      <circle r="2.5" className="intro-scene-other-left"/><circle r="2.5" className="intro-scene-other-right"/>
    </g>)}
    <g transform="translate(400 180)">
      <circle r="22" className="intro-scene-halo"/>
      {stage >= 1 ? <g className="intro-scene-frame">{stage === 1 ? <rect x="-46" y="-40" width="92" height="80"/> : <rect x="-150" y="-52" width="300" height="104"/>}<text x={stage === 1 ? -46 : -150} y={stage === 1 ? -48 : -60}>01</text></g> : null}
      {stage === 2 ? <g className="intro-scene-lens" key="lens"><ellipse rx="16" ry="58"/></g> : null}
      <line x1="-60" x2="60" className="intro-scene-thread"/>
      <circle r="10" className="intro-scene-gap"/>
      <g className="intro-scene-left"><circle r="7" className="intro-scene-body"/>{stage >= 2 ? <text y="34" textAnchor="middle">WHAT HAPPENED</text> : null}</g>
      <g className="intro-scene-right"><circle r="7" className="intro-scene-body intro-scene-body--turn"/>{stage >= 2 ? <text y="-22" textAnchor="middle">WHAT WAS ASSUMED</text> : null}</g>
    </g>
    <text className="intro-scene-caption" x="400" y="344" textAnchor="middle">{captions[stage]}</text>
  </svg>
}
