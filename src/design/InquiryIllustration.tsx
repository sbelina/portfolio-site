import React, { useEffect, useState } from 'react'

type Focus = 'all' | 'outcome' | 'explanation' | 'gap'
const outcomePath = 'M40 225C110 225 110 102 210 102S310 225 380 225'
const explanationPath = 'M40 225C130 225 120 288 210 241S300 75 380 75'

/** Every view describes the drawing's meaning; none adds data, scale or causal claims. */
export const inquiryViews: readonly { value: Focus; label: string; description: string }[] = [
  { value: 'all', label: 'Both', description: 'The solid line stands for an outcome; the dashed line stands for a working explanation. They start together, then part ways.' },
  { value: 'outcome', label: 'Outcome', description: 'The solid line is what was observed. A visible result can be accurate and still leave its cause unexplained.' },
  { value: 'explanation', label: 'Explanation', description: 'The dashed line is the account given for the outcome. It can sound convincing and still follow a different path.' },
  { value: 'gap', label: 'The gap', description: 'The open circle marks where the explanation stops accounting for what happened. That gap is where an investigation starts.' },
]

/**
 * Expressive geometry has no quantities, axes or inferred empirical edges.
 * Static HTML shows the complete drawing and caption. After hydration, a native radio
 * group (keyboard, touch, screen readers) and pointer shortcuts on the drawing change
 * which part is emphasized; the drawing itself stays aria-hidden because the radio group
 * and the live description carry the same meaning in text.
 */
export function InquiryIllustration() {
  const [enhanced, setEnhanced] = useState(false)
  const [focus, setFocus] = useState<Focus>('all')
  useEffect(() => setEnhanced(true), [])
  const current = inquiryViews.find(view => view.value === focus)!
  const select = (value: Focus) => enhanced ? () => setFocus(previous => previous === value ? 'all' : value) : undefined
  return <figure className="pc-inquiry-figure" data-focus={focus} data-enhanced={enhanced}>
    <div className="pc-inquiry-drawing" aria-hidden="true">
      <svg viewBox="0 0 420 330" focusable="false">
        <g className="pc-construction"><circle cx="210" cy="165" r="118"/><ellipse cx="210" cy="165" rx="178" ry="73" transform="rotate(-28 210 165)"/><path d="M28 165H392M210 20V310"/></g>
        <g className="pc-part pc-part--outcome" onClick={select('outcome')}>
          <path className="pc-hit" d={outcomePath}/>
          <path className="pc-observation-line" d={outcomePath}/>
          <g className="pc-observation-points"><circle cx="40" cy="225" r="5"/><circle cx="210" cy="102" r="5"/><circle cx="380" cy="225" r="5"/></g>
        </g>
        <g className="pc-part pc-part--explanation" onClick={select('explanation')}>
          <path className="pc-hit" d={explanationPath}/>
          <path className="pc-question-line" d={explanationPath}/>
        </g>
        <g className="pc-part pc-part--gap" onClick={select('gap')}>
          <circle className="pc-hit pc-hit--gap" cx="210" cy="241" r="20"/>
          <circle className="pc-gap-ring" cx="210" cy="241" r="16"/>
          <circle className="pc-open-question" cx="210" cy="241" r="8"/>
        </g>
      </svg>
    </div>
    <figcaption><span className="pc-kicker">A way of looking</span><p>An outcome and its explanation are related. They are not the same thing.</p><small>Conceptual illustration · not measured data</small>
      {enhanced ? <>
        <fieldset className="pc-inquiry-controls"><legend>Look at</legend>
          {inquiryViews.map(view => <label key={view.value}><input type="radio" name="pc-inquiry-focus" value={view.value} checked={focus === view.value} onChange={() => setFocus(view.value)}/>{view.label}</label>)}
        </fieldset>
        <p className="pc-inquiry-reading" aria-live="polite">{current.description}</p>
      </> : null}
      <details className="pc-layer"><summary>Read this illustration</summary><p>The solid line stands for an outcome; the dashed line stands for a working explanation. Their different paths ask whether the explanation accounts for what happened.</p><p>These lines are conceptual. Their shape, points, and spacing encode no measurements or causal evidence.</p><details className="pc-layer"><summary>What would make this evidence?</summary><p>Source observations, a clear method and scope, competing explanations, and limitations. A convincing shape is not proof.</p></details></details>
    </figcaption>
  </figure>
}
