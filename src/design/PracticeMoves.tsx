import React from 'react'

export const practiceMoves = [
  { title: 'Test', text: 'Question a prevailing explanation; identify plausible alternatives; inspect the evidence.' },
  { title: 'Show', text: 'Clarify what was observed, inferred, disputed, and remains unknown.' },
  { title: 'Enable', text: 'Help affected people and decision-makers use what was learned.' },
] as const

/** All three moves are readable at once; these are not interaction gates. */
export function PracticeMoves() {
  return <div className="pc-moves">{practiceMoves.map(move => <section key={move.title}><h3>{move.title}<span aria-hidden="true">.</span></h3><p>{move.text}</p></section>)}</div>
}
