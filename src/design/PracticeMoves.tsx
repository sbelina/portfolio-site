import React from 'react'

export const practiceMoves = [
  { title: 'Test', text: 'Test whether the assumptions, measures, and explanations in use are adequate to the outcome they claim to explain.', questions: ['What else could explain this outcome?', 'What evidence would change the explanation?'] },
  { title: 'Show', text: 'Make the reasoning, evidence, and limitations inspectable: what was observed, inferred, disputed, and still unknown.', questions: ['What was observed, and what was inferred?', 'What remains unresolved?'] },
  { title: 'Enable', text: 'Develop conditions in which other people can use that understanding to decide, adapt, and ask new questions.', questions: ['Who needs this knowledge?', 'What can they do with it, and what should be checked after a change?'] },
] as const

/** All three moves are readable at once; these are not interaction gates. */
export function PracticeMoves() {
  return <div className="pc-moves">{practiceMoves.map(move => <section key={move.title}><h3>{move.title}<span aria-hidden="true">.</span></h3><p>{move.text}</p><details className="pc-layer"><summary>Questions behind {move.title}</summary><ul>{move.questions.map(question => <li key={question}>{question}</li>)}</ul></details></section>)}</div>
}
