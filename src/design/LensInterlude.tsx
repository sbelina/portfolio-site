import React from 'react'

/**
 * "How I got here": the thinking lens, between what changed and how I work.
 * The drawing continues the homepage's "A way of looking" illustration: a precise construction
 * (geometry) and a freehand line (poetry) meet at one marked point. It is expressive geometry
 * with no data; it is aria-hidden because the quotation and the text carry the meaning.
 */
export function LensInterlude() {
  return <section className="pc-interlude" data-surface="observatory" aria-labelledby="pc-interlude-title">
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
      <div className="pc-interlude-drawing" aria-hidden="true">
        <svg viewBox="0 0 320 260" focusable="false">
          <g className="pc-construction">
            <circle cx="160" cy="130" r="92"/>
            <path d="M20 130H300M160 18V242"/>
            <path d="M68 130L160 38L252 130L160 222Z"/>
          </g>
          <path className="pc-interlude-geometry" d="M40 196L160 76L280 196"/>
          <path className="pc-interlude-poetry" d="M30 92C70 40 104 164 160 76S236 160 292 64"/>
          <circle className="pc-interlude-meet" cx="160" cy="76" r="7"/>
        </svg>
        <p className="pc-interlude-legend"><span>Construction</span> <span>Freehand</span> <span>Where they meet</span></p>
      </div>
    </div>
  </section>
}
