import React from 'react'
import { InvestigationVisual } from '../visuals/InvestigationVisual'
const steps = [
  ['Notice','Identify a pattern, contradiction or unexpected outcome.'],
  ['Frame','Examine the assumptions and categories shaping the explanation.'],
  ['Model','Represent relationships that might explain the outcome.'],
  ['Stress test','Compare the explanation with evidence, exceptions and alternatives.'],
  ['Look for missing variables','Ask what the model excludes or obscures.'],
  ['Revise the model','Improve the explanation and examine what changes about action.'],
]
export function InquiryMethod() {
  return <section className="inquiry-method" aria-labelledby="inquiry-title">
    <h3 id="inquiry-title">What way of looking at this makes it appear true?</h3>
    <p>I examine both the structures producing behavior and the frames producing my explanations. These moves recur and overlap; new evidence can send me back to any of them.</p>
    <InvestigationVisual composition="revision" left="Working explanation" right="Revised explanation" explanation="New evidence, exceptions and missing variables can change the model. Neither line represents measured performance; the earlier account remains inspectable." />
    <ol>{steps.map(([name,text])=><li key={name}><strong>{name}</strong> — {text}</li>)}</ol>
    <details><summary>Inspect an illustrative model revision</summary><p>Initial explanation: “The task is closed, so the work is complete.” Challenge: clarification continues after closure. Revised question: what did closure verify, and what remains unresolved?</p><p>This is a conceptual example, not a reconstruction of an operational record or proof of a causal mechanism. Alternative explanations could include changing requirements, missing information or an inappropriate completion criterion.</p></details>
  </section>
}
