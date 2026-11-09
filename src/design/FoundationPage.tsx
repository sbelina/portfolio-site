import React, { useEffect, useState } from 'react'
import { CurrentShell } from './CurrentShell'
import { PracticeMoves } from './PracticeMoves'
import { publicPath } from '../public-path'

export const foundationPages = {
  practice: { path: '/practice/', title: 'How I investigate', description: 'Test. Show. Enable. A flexible inquiry practice for examining explanations, evidence and useful action.', indexable: true },
  patterns: { path: '/patterns/', title: 'Related. Not equivalent.', description: 'Conceptual distinctions and questions for exploring how explanations change. Case-supported connections remain subject to evidence review.', indexable: true },
  system: { path: '/system/', title: 'Design-system specimen', description: 'Inspect the current paper and observatory surfaces, typography, semantic states and native disclosures.', indexable: false },
} as const
export type FoundationKind = keyof typeof foundationPages

const inquiry = [
  ['Notice', 'Identify a pattern, contradiction, or unexpected outcome.'],
  ['Frame', 'Examine the assumptions and categories through which the problem is being interpreted.'],
  ['Model', 'Represent relationships that might explain the outcome.'],
  ['Test', 'Compare the explanation against evidence, exceptions, and alternatives.'],
  ['Interrogate', 'Ask what has been excluded, and what makes this explanation appear true.'],
  ['Revise', 'Change the model in response to evidence, then consider what that changes about action.'],
] as const

function Practice() {
  return <>
    <p className="pc-kicker">The practice</p><h1>Test. Show. Enable.</h1>
    <p className="pc-lead">Build, test, and revise explanations—then help other people use what becomes clearer.</p>
    <PracticeMoves/>
    <section className="pc-section"><h2>Investigate the system. Examine the explanation.</h2><p>One line of inquiry examines the structures and mechanisms producing observed behavior. Another examines the assumptions, categories, frameworks, and evidence shaping our explanation of that behavior.</p><blockquote>What way of looking at this makes it appear true?</blockquote><p>This question applies to my own interpretations and development decisions, too.</p></section>
    <section className="pc-section" aria-labelledby="inquiry-title"><p className="pc-kicker">A recurring reasoning practice</p><h2 id="inquiry-title">Notice → Frame → Model → Test → Interrogate → Revise</h2><p>A flexible loop, not a rigid sequence. Evidence can send the inquiry back to an earlier question. All six moves are available to read here without operating a model.</p><dl className="pc-inquiry-list">{inquiry.map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl></section>
    <section className="pc-section"><p className="pc-kicker">How I Know</p><h2>Keep the account inspectable.</h2><p>Separate what was observed from what is inferred, proposed, implemented, or measured. Name the source, contribution, and limitation. Treat a connection as an editorial claim that needs its own explanation—not proof of equivalence or causation.</p><a className="pc-text-link" href={publicPath('/patterns/')}>Explore the distinctions →</a></section>
  </>
}

const distinctions = [
  { title: 'Delivered ≠ complete', question: 'What does this status establish—and what does it leave unverified?', explanation: 'A delivered status records a handoff. By itself, it does not establish understanding or readiness for the next step.' },
  { title: 'Agreement ≠ trust', question: 'Are we asking about agreement, or about its reported influence on trust?', explanation: 'Agreement with a statement and the influence that statement has on reported trust are different questions. One answer cannot stand in for the other.' },
  { title: 'Automation ≠ judgment', question: 'Which question did the check answer, and which questions remain?', explanation: 'An automated check can test a defined condition. Its result does not settle every question a person may need to examine.' },
] as const

function Patterns() {
  return <>
    <p className="pc-kicker">Explore connections</p><h1>Related. Not equivalent.</h1>
    <p className="pc-lead">A useful connection preserves the difference between the things it brings together.</p>
    <p className="pc-boundary">These are conceptual starting questions, not universal findings or a map of verified case relationships. Case-supported connections will be added when the supporting investigations and exact wording are approved.</p>
    <div className="pc-distinction-list">{distinctions.map(item => <section key={item.title}><h2>{item.title}</h2><p>{item.explanation}</p><p className="pc-question">{item.question}</p></section>)}</div>
    <section className="pc-section"><h2>What makes a connection useful?</h2><p>Name what is connected, why the distinction matters, what supports the relationship, and where it stops explaining. Keep interpretations and hypotheses visible as such.</p><p>No canonical case relationships are selected for this edition yet. This overview does not generate or approve graph edges.</p><a className="pc-text-link" href={publicPath('/practice/')}>Read the inquiry practice →</a></section>
  </>
}

function SystemSpecimen({ enhanced, surface, setSurface }: { enhanced: boolean; surface: 'paper' | 'observatory'; setSurface: (value: 'paper' | 'observatory') => void }) {
  return <>
    <p className="pc-kicker">Foundation specimen · interface examples</p><h1>Precision without rigidity.</h1>
    <p className="pc-lead">Inspect the reading surface, native controls, and evidence language. These are interface examples, not case evidence.</p>
    <p>The asterisk is a temporary typographic placeholder; final owner artwork is pending. Geom, Elms Sans, and IBM Plex Mono remain candidates. This specimen uses local system fonts until font files and licenses are verified.</p>
    {enhanced ? <fieldset className="pc-surface-control"><legend>Reading surface</legend>{(['paper', 'observatory'] as const).map(value => <label key={value}><input type="radio" name="surface" value={value} checked={surface === value} onChange={() => setSurface(value)}/>{value === 'paper' ? 'Paper reading surface' : 'Observatory surface'}</label>)}</fieldset> : <p className="pc-boundary">Paper is the static baseline. An observatory sample is also available below; optional surface controls appear when JavaScript is available.</p>}
    <section className="pc-section"><h2>State has a name.</h2><p>Orange supplies emphasis. Violet, coral, and teal retain separate semantic roles, always accompanied by words.</p><ul className="pc-state-list"><li className="pc-state pc-state--unresolved">? Unresolved question</li><li className="pc-state pc-state--friction">↶ Friction / pressure</li><li className="pc-state pc-state--learning">◇ Learning / what holds</li></ul></section>
    <section className="pc-section"><h2>Useful before interaction.</h2><p>The primary explanation stays visible. Supporting context opens in place, and closing it keeps focus on the same control.</p><details className="pc-disclosure"><summary>Inspect this illustration</summary><dl className="pc-inquiry-list"><div><dt>Source</dt><dd>Constructed for this interface specimen; no project manuscript or operational data.</dd></div><div><dt>Interpretation</dt><dd>Optional detail can extend an explanation without replacing its main statement.</dd></div><div><dt>Limitation</dt><dd>Working controls do not establish improved reader comprehension.</dd></div></dl></details></section>
    <aside className="pc-sample" data-surface="observatory" aria-label="Static observatory sample"><p className="pc-kicker">Observatory sample</p><h2>The same reading, another surface.</h2><p>Observation, interpretation, and uncertainty remain distinct when the surface changes.</p><a href={publicPath('/practice/')}>Read the inquiry practice →</a></aside>
    <section className="pc-section"><h2>Readable at every depth.</h2><p className="pc-type-sample">“What way of looking at this makes it appear true?”</p><p>ABCDEFGHIJKLMNOPQRSTUVWXYZ<br/>abcdefghijklmnopqrstuvwxyz<br/>0123456789 · punctuation: , . : ; — ≠ →</p><p className="pc-meta">System-font specimen / no licensed typeface claimed</p></section>
  </>
}

export function FoundationPage({ kind }: { kind: FoundationKind }) {
  const [enhanced, setEnhanced] = useState(false)
  const [surface, setSurface] = useState<'paper' | 'observatory'>('paper')
  useEffect(() => setEnhanced(true), [])
  return <CurrentShell route={foundationPages[kind].path} surface={surface}><div className={`pc-document pc-document--${kind}`}>
    <a className="pc-breadcrumb" href={publicPath('/')}>Producing Curiosity home</a>
    {kind === 'practice' ? <Practice/> : kind === 'patterns' ? <Patterns/> : <SystemSpecimen enhanced={enhanced} surface={surface} setSurface={setSurface}/>}
  </div></CurrentShell>
}
