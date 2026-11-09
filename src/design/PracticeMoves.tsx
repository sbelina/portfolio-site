import React from 'react'

export const practiceMoves = [
  { title: 'Test', text: 'Question a prevailing explanation; identify plausible alternatives; inspect the evidence.', questions: ['What else could explain this outcome?', 'What evidence would change the explanation?'] },
  { title: 'Show', text: 'Clarify what was observed, inferred, disputed, and remains unknown.', questions: ['What was observed, and what was inferred?', 'What remains unresolved?'] },
  { title: 'Enable', text: 'Help affected people and decision-makers use what was learned.', questions: ['Who needs this knowledge?', 'What can they do with it, and what should be checked after a change?'] },
] as const

/** All three moves are readable at once; these are not interaction gates. */
export function PracticeMoves() {
  return <div className="pc-moves">{practiceMoves.map(move => <section key={move.title}><h3>{move.title}<span aria-hidden="true">.</span></h3><p>{move.text}</p><details className="pc-layer"><summary>Questions behind {move.title}</summary><ul>{move.questions.map(question => <li key={question}>{question}</li>)}</ul></details></section>)}</div>
}
