import React from 'react'
import type { Composition } from '../content/investigation'

/** Conceptual geometry only. Meaning lives in HTML; no quantitative encoding. */
export function InvestigationVisual({ composition, left, right, explanation }: { composition: Composition; left: string; right: string; explanation: string }) {
  return <figure className={`investigation-visual investigation-visual--${composition}`}>
    <div className="investigation-visual__labels"><strong>{left}</strong><span aria-hidden="true">≠</span><strong>{right}</strong></div>
    <svg viewBox="0 0 480 120" aria-hidden="true" focusable="false">
      {composition === 'boundary' ? <><path d="M20 60H205 M275 60H460"/><path className="visual-friction" d="M240 10V110" strokeDasharray="4 6"/><path d="M180 60Q240 -20 300 60" strokeDasharray="2 6"/></> : null}
      {composition === 'comparison' ? <><ellipse cx="180" cy="60" rx="115" ry="42"/><ellipse className="visual-learning" cx="300" cy="60" rx="115" ry="42"/><path d="M240 15V105" strokeDasharray="2 6"/></> : null}
      {composition === 'network' ? <><path d="M50 25L180 60 50 95 M180 60L300 25 430 60 300 95 180 60 M300 25V95"/>{[[50,25],[50,95],[180,60],[300,25],[300,95],[430,60]].map(([cx,cy])=><circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="7"/>)}</> : null}
      {composition === 'revision' ? <><path d="M20 80Q140 -20 240 80T460 80" strokeDasharray="3 6"/><path className="visual-learning" d="M20 80Q140 120 240 40T460 80"/><circle cx="240" cy="40" r="8"/></> : null}
    </svg>
    <figcaption><span>Conceptual illustration · related, not equivalent.</span> {explanation}</figcaption>
  </figure>
}
