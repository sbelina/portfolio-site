import React from 'react'
import { publicPath } from '../public-path'
import { A, B, C, D, centre, constructionSteps, freehandPath, radius, rightAngleMarker } from './lens-geometry'

/**
 * "How I got here": the thinking lens, between what changed and how I work.
 * The drawing continues the homepage's "A way of looking" illustration. Its points are computed
 * from Euclid (src/design/lens-geometry.ts) and the steps are shown as text, so the drawing itself
 * is aria-hidden. It encodes no data.
 */
export function LensInterlude({ compact = false }: { compact?: boolean } = {}) {
  // Homepage: the quote, compact, above the call to action. The geometry lives in Field Notes.
  if (compact) return <section className="pc-interlude pc-interlude--compact" data-surface="observatory" aria-labelledby="pc-interlude-title">
    <div className="pc-interlude-inner">
      <div className="pc-interlude-copy">
        <h2 id="pc-interlude-title" className="pc-kicker">How I got here</h2>
        <figure className="pc-interlude-quote">
          <blockquote lang="en"><p>Inspiration is needed in geometry, just as much as in poetry.</p></blockquote>
          <figcaption>— Alexander Pushkin</figcaption>
        </figure>
        <p className="pc-interlude-lens">Design and philosophy taught me the same two things: the inspiration to see a relationship no one has drawn yet, and the discipline to test whether it holds.</p>
        <details className="pc-interlude-source"><summary>Source</summary>
          <p>From Pushkin’s critical notes. In Russian: <span lang="ru">«Вдохновение нужно в геометрии, как и в поэзии».</span> The English is a common translation.</p>
        </details>
        <p><a className="pc-text-link" href={publicPath('/writing/#how-i-got-here')}>See the geometry behind it <span aria-hidden="true">→</span></a></p>
      </div>
    </div>
  </section>
  return <section className="pc-interlude" id="how-i-got-here" data-surface="observatory" aria-labelledby="pc-interlude-title">
    <div className="pc-interlude-inner">
      <div className="pc-interlude-copy">
        <h2 id="pc-interlude-title" className="pc-kicker">How I got here</h2>
        <figure className="pc-interlude-quote">
          <blockquote lang="en"><p>Inspiration is needed in geometry, just as much as in poetry.</p></blockquote>
          <figcaption>— Alexander Pushkin</figcaption>
        </figure>
        <p className="pc-interlude-lens">I came to research through design, with philosophy alongside it. Each asked for the same two things: the inspiration to see a relationship no one has drawn yet, and the discipline to test whether it holds. Test. Show. Enable. is how I keep both.</p>
        <details className="pc-interlude-source"><summary>Source</summary>
          <p>From Pushkin’s critical notes. In Russian: <span lang="ru">«Вдохновение нужно в геометрии, как и в поэзии».</span> The English is a common translation.</p>
        </details>
      </div>
      <figure className="pc-interlude-figure">
        <div className="pc-interlude-drawing" aria-hidden="true">
          <svg viewBox="0 0 320 260" focusable="false">
            <g className="pc-construction">
              <circle cx={centre.x} cy={centre.y} r={radius}/>
              <path d={`M${A.x - 40} ${A.y}H${B.x + 40}M${C.x} ${C.y - 24}V${D.y + 24}`}/>
              <path d={`M${A.x} ${A.y}L${D.x} ${D.y}L${B.x} ${B.y}`}/>
            </g>
            <path className="pc-interlude-geometry" d={`M${A.x} ${A.y}L${C.x} ${C.y}L${B.x} ${B.y}`}/>
            <path className="pc-interlude-right-angle" d={rightAngleMarker}/>
            <path className="pc-interlude-poetry" d={freehandPath}/>
            <circle className="pc-interlude-meet" cx={C.x} cy={C.y} r="6"/>
            <g className="pc-interlude-labels">
              <text x={A.x - 14} y={A.y + 16}>A</text><text x={B.x + 6} y={B.y + 16}>B</text>
              <text x={C.x - 22} y={C.y - 6}>C</text><text x={centre.x + 6} y={centre.y + 16}>O</text>
            </g>
          </svg>
          <p className="pc-interlude-legend"><span>Construction</span> <span>Freehand</span> <span>Where they meet: C</span></p>
        </div>
        <figcaption>
          <details className="pc-interlude-steps"><summary>How the meeting point is found</summary>
            <ol>{constructionSteps.map(step => <li key={step.text}>{step.text} <span className="pc-interlude-step-source">{step.source}</span></li>)}</ol>
            <p>References are to Euclid’s <cite>Elements</cite>.</p>
          </details>
        </figcaption>
      </figure>
    </div>
  </section>
}
