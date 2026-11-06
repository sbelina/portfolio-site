import React from 'react'

/** Expressive geometry has no quantities, axes or inferred empirical edges. */
export function InquiryIllustration() {
  return <figure className="pc-inquiry-figure">
    <div className="pc-inquiry-drawing" aria-hidden="true">
      <svg viewBox="0 0 420 330" focusable="false">
        <g className="pc-construction"><circle cx="210" cy="165" r="118"/><ellipse cx="210" cy="165" rx="178" ry="73" transform="rotate(-28 210 165)"/><path d="M28 165H392M210 20V310"/></g>
        <path className="pc-observation-line" d="M40 225C110 225 110 102 210 102S310 225 380 225"/>
        <path className="pc-question-line" d="M40 225C130 225 120 288 210 241S300 75 380 75"/>
        <g className="pc-observation-points"><circle cx="40" cy="225" r="5"/><circle cx="210" cy="102" r="5"/><circle cx="380" cy="225" r="5"/></g>
        <circle className="pc-open-question" cx="210" cy="241" r="8"/>
      </svg>
    </div>
    <figcaption><span className="pc-kicker">A way of looking</span><p>An outcome and its explanation are related. They are not the same thing.</p><small>Conceptual illustration · not measured data</small></figcaption>
  </figure>
}
