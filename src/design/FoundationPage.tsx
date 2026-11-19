import React, { useEffect, useState } from 'react'
import { CurrentShell } from './CurrentShell'
import { PracticeMoves } from './PracticeMoves'
import { publicPath } from '../public-path'

export const foundationPages = {
  practice: { path: '/practice/', title: 'How I investigate', description: 'Test. Show. Enable. A flexible inquiry practice for examining explanations, evidence and useful action.', indexable: true },
  patterns: { path: '/patterns/', title: 'Related. Not equivalent.', description: 'Conceptual distinctions and questions for exploring how explanations change. Case-supported connections remain subject to evidence review.', indexable: true },
  observatory: { path: '/lab/', title: 'Observatory*', description: 'Experiments for exploring questions and connections: the Atlas of Inquiry, Je ne sais qu’a, Edge Case and Reveal the hidden work. Their contents are invented.', indexable: false },
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
    <section className="pc-section" aria-labelledby="inquiry-title"><p className="pc-kicker">A recurring reasoning practice</p><h2 id="inquiry-title">Notice → Frame → Model → Test → Interrogate → Revise</h2><p>Test. Show. Enable. describes what the work delivers to other people. This loop describes how the reasoning moves along the way; they are not competing processes to memorize.</p><p>A flexible loop, not a rigid sequence. Evidence can send the inquiry back to an earlier question. All six moves are available to read here without operating a model.</p><dl className="pc-inquiry-list">{inquiry.map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl></section>
    <section className="pc-section"><p className="pc-kicker">How I Know</p><h2>Keep the account inspectable.</h2><p>Separate what was observed from what is inferred, proposed, implemented, or measured. Name the source, contribution, and limitation. Treat a connection as an editorial claim that needs its own explanation—not proof of equivalence or causation.</p><a className="pc-text-link" href={publicPath('/patterns/')}>Explore the distinctions →</a></section>
  </>
}

const conceptual = 'Conceptual distinction. No case relationship is asserted here.'
const previousEdition = 'Related to a previous-edition case summary; the full case is unpublished. A conceptual distinction, not a finding.'
const distinctions = [
  { title: 'Delivered ≠ complete', connection: 'Both describe the end of a handoff.', difference: 'A delivered status records that something arrived. It does not establish that it was understood, sufficient, or ready for the next step.', evidence: previousEdition, limits: 'A delivered item can also be complete; the distinction only matters where the two are assumed to coincide.', question: 'What does this status establish—and what does it leave unverified?' },
  { title: 'Agreement ≠ trust', connection: 'Both are responses to the same statement about an organization.', difference: 'Agreeing that an attribute is true is a different question from reporting that the attribute influences trust.', evidence: previousEdition, limits: 'Neither answer, alone, identifies what produces trust or shows that trust changed.', question: 'Are we asking about agreement, or about its reported influence on trust?' },
  { title: 'Automation ≠ judgment', connection: 'Both are ways of checking work.', difference: 'An automated check tests a defined condition. A person can notice a question the check was never written to ask.', evidence: previousEdition, limits: 'This is not a claim that either is generally better; they answer different questions.', question: 'Which question did the check answer, and which questions remain?' },
  { title: 'Usability ≠ retention', connection: 'Both are read as signs that a service works for people.', difference: 'A usability score describes an experience during a task. Whether people keep using a service is a separate behaviour over time.', evidence: conceptual, limits: 'A score taken during a task does not observe behaviour over time.', question: 'What would we need to observe to know whether people stay?' },
  { title: 'Compliance ≠ comprehension', connection: 'Both are expected outcomes of guidance and rules.', difference: 'Following a required step can be observed. Understanding why it is required, and when it does not apply, usually cannot be seen in the same record.', evidence: conceptual, limits: 'Compliance can reflect comprehension; the gap matters when one is taken as proof of the other.', question: 'What would someone need to understand to handle the exception correctly?' },
  { title: 'Participation ≠ influence', connection: 'Both describe people taking part in a decision.', difference: 'Being present, consulted, or counted does not establish that someone changed what was decided.', evidence: conceptual, limits: 'Participation can lead to influence; showing it requires tracing a contribution to a decision.', question: 'Where, specifically, did someone’s input change the outcome?' },
  { title: 'Shared language ≠ shared understanding', connection: 'Both are signs that a group is aligned.', difference: 'Using the same words can hide different meanings, steps, or exceptions behind them.', evidence: conceptual, limits: 'Shared vocabulary is often useful; the risk is treating it as evidence that practice is the same.', question: 'If each person described what this term requires them to do, would the descriptions match?' },
  { title: 'Reuse ≠ demonstrated effectiveness', connection: 'Both are read as signs that a resource is valuable.', difference: 'A resource that keeps being used shows that people return to it. Whether it improves the work is a separate claim that needs its own evidence.', evidence: conceptual, limits: 'A resource can be both reused and effective; the gap matters when one is read as proof of the other.', question: 'What would show that the work is better because of this resource, rather than only that it is used?' },
] as const

/** Speak "≠" as "is not" at every screen-reader punctuation level. */
function Distinction({ title }: { title: string }) {
  const [left, right] = title.split(' ≠ ')
  return <>{left} <span aria-hidden="true">≠</span><span className="pc-sr-only">is not</span> {right}</>
}

function Patterns() {
  return <>
    <p className="pc-kicker">Explore connections</p><h1>Related. Not equivalent.</h1>
    <p className="pc-lead">A useful connection preserves the difference between the things it brings together.</p>
    <p className="pc-boundary">These are conceptual starting questions, not universal findings or a map of verified case relationships. Case-supported connections will be added when the supporting investigations and exact wording are approved.</p>
    <div className="pc-distinction-list">{distinctions.map(item => <section key={item.title}><h2><Distinction title={item.title}/></h2><p>{item.difference}</p><p className="pc-question">{item.question}</p><details className="pc-layer"><summary>Connection, evidence and limits<span className="pc-sr-only"> for {item.title.replace(' ≠ ', ' is not ')}</span></summary><dl className="pc-distinction-detail"><div><dt>What connects them</dt><dd>{item.connection}</dd></div><div><dt>Evidence status</dt><dd>{item.evidence}</dd></div><div><dt>Where it stops</dt><dd>{item.limits}</dd></div></dl></details></section>)}</div>
    <section className="pc-section"><h2>What makes a connection useful?</h2><p>Name what is connected, why the distinction matters, what supports the relationship, and where it stops explaining. Keep interpretations and hypotheses visible as such.</p><p>No canonical case relationships are selected for this edition yet. This overview does not generate or approve graph edges.</p><a className="pc-text-link" href={publicPath('/practice/')}>Read the inquiry practice →</a></section>
  </>
}

const observatory = [
  { href: '/lab/atlas/', title: 'Atlas of Inquiry', experimental: true, kind: 'Semantic layout', text: 'What does being nearby allow us to conclude? Six invented investigations, with the classification and calculations left inspectable.', also: { href: '/lab/atlas/text/', label: 'Read the Atlas as text' } },
  { href: '/lab/atlas/je-ne-sais-qua/', title: 'Je ne sais qu’a', experimental: false, kind: 'Editorial space', text: 'A space for what you notice before you know what you’re looking at. Its fragments are invented illustrations.' },
  { href: '/lab/edge-case/', title: 'Edge Case', experimental: true, kind: 'Prototype game', text: 'Every rule has an exception. Watch how a system repeats, change what you can, and find more than one way through. Not yet tested with players.' },
  { href: '/experiments/reveal-hidden-work/', title: 'Reveal the hidden work', experimental: false, kind: 'Interaction experiment', text: 'Reveal the work beneath a simplified process. Readable with or without animation.' },
] as const

function Observatory() {
  return <>
    <p className="pc-kicker">The observatory · experimental</p><h1>Observatory<span aria-hidden="true">*</span></h1>
    <p className="pc-lead">A separate place for curiosity to operate: experiments that test ways of exploring questions and connections.</p>
    <p className="pc-boundary">Everything here is invented or illustrative. None of it is my investigations or evidence, and none of it is needed to read the rest of the site. The asterisk marks an experiment.</p>
    <ul className="pc-observatory-index">{observatory.map(item => <li key={item.href}>
      <p className="pc-kicker">{item.kind}</p>
      <h2><a href={publicPath(item.href)} aria-label={item.experimental ? `${item.title} — experimental` : undefined}>{item.title}{item.experimental ? <span aria-hidden="true">*</span> : null}</a></h2>
      <p>{item.text}</p>
      {'also' in item ? <p><a className="pc-text-link" href={publicPath(item.also.href)}>{item.also.label} →</a></p> : null}
    </li>)}</ul>
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
    {kind === 'practice' ? <Practice/> : kind === 'patterns' ? <Patterns/> : kind === 'observatory' ? <Observatory/> : <SystemSpecimen enhanced={enhanced} surface={surface} setSurface={setSurface}/>}
  </div></CurrentShell>
}
