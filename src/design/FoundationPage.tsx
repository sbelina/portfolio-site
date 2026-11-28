import React, { useEffect, useRef, useState } from 'react'
import { CurrentShell } from './CurrentShell'
import { PracticeInMotion } from './PracticeInMotion'
import { publicPath } from '../public-path'
import { LensInterlude } from './LensInterlude'
import { AnnotatedPlate, StrandLine } from './Interactions'
import { archiveItems, writings } from '../content/writing'
import { contactDelivery, contactReasons, ctaOffer, practiceAreas, recruiterContact, tagline } from '../content/recruiter'
import { ExternalArrow } from './ExternalArrow'
import { ConnectionsField } from './ConnectionsField'
import { CareerThread } from './CareerThread'
import { careerHistory, education, recognition, speaking } from '../content/career'
import { methodFamilies, researchAgenda } from '../content/capabilities'
import { caseLabels } from '../content/primary-evidence'
import { count } from '../analytics'
import { CountingChoice } from './CountingChoice'
import { differentiator, positioningPoints, researchPhilosophy, stormWorkflow } from '../content/about'

export const foundationPages = {
  practice: { path: '/practice/', title: 'Research methods and practice', description: 'Test. Show. Enable. A flexible inquiry practice for examining explanations, evidence and useful action.', indexable: true },
  patterns: { path: '/patterns/', title: 'Related. Not equivalent.', description: 'Conceptual distinctions and questions for exploring how explanations change. Case-supported connections remain subject to evidence review.', indexable: true },
  writing: { path: '/writing/', title: 'Field Notes: essays and research writing', description: 'Field notes, essays and earlier writing by Sami Belina: questions still being worked out, and how she got here.', indexable: true },
  about: { path: '/about/', title: 'About Sami Belina', description: 'Sami Belina, Applied Research & Systems Strategist: the thread from interface design to enterprise investigation, the proof behind it, and what comes next.', indexable: true },
  contact: { path: '/contact/', title: 'Contact', description: 'Contact Sami Belina about a role, an organizational problem, a research collaboration, or teaching and speaking.', indexable: true },
  observatory: { path: '/lab/', title: 'Experiments*', description: 'Experiments for exploring questions and connections: the Atlas of Inquiry, Je ne sais qu’a, Edge Case and Reveal the hidden work. Their contents are invented.', indexable: false },
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

/** Each move's output, with an example from a published investigation. */
const practiceOutputs = [
  { move: 'Test', output: 'A better explanation of what is causing the problem, tested against the record.', example: 'Insurance operations: the errors were real, but when they were found was the problem.', href: '/investigations/claims-operations/' },
  { move: 'Show', output: 'The evidence, alternatives and uncertainty laid out so a decision-maker can weigh them.', example: 'Customer research: agreement and trust influence, measured and reported separately.', href: '/investigations/brand-research/' },
  { move: 'Enable', output: 'A change people can carry out and keep using: a checkpoint, a resource, a format.', example: 'Insurance operations: guides and training built from administrators’ knowledge, in use statewide.', href: '/investigations/claims-operations/' },
] as const

/** The anatomy of a public case page, for the annotated plate on Practice. Structural, with no case claims. */
const caseAnatomy = [
  { pin: 'At a glance', note: 'What changed, first.', detail: ' The result, then the problem, what I did and how I knew.' },
  { pin: 'The decision', note: 'What was at stake.', detail: ' The explanation people held, the options and what became of each, and who decided.' },
  { pin: 'Observed, interpreted, decided', note: 'How I Know, in layers.', detail: ' What was seen, what it was taken to mean, and what was chosen, kept apart.' },
  { pin: 'The four questions', note: 'The full account.', detail: ' What was the problem, how I knew, what I did, what changed.' },
  { pin: 'How I know', note: 'The limits, last but always there.', detail: ' What I didn’t own, how anything was measured, and what remains unproven.' },
] as const

function Practice() {
  return <>
    <p className="pc-kicker">The practice</p><h1>Test. Show. Enable.</h1>
    <p className="pc-lead">Diagnose the gap, then design the conditions that close it.</p>
    <PracticeInMotion example={{ label: 'Insurance operations', href: publicPath('/investigations/claims-operations/'), left: 'Delivered', right: 'Verified', test: 'Paperwork could be marked delivered, and payment released, before anyone confirmed it was sufficient.', show: 'A delivery status records a handoff. Verification checks that the paperwork is sufficient.', enable: 'Payment now waits for verification, so problems are found before a claim looks finished. The guides and training have been used statewide, across all four offices, for 2+ years, and every quarter’s new hires learn from them.' }}/>
    <section className="pc-section"><h2>Investigate the system. Examine the explanation.</h2><p>One line of inquiry examines the structures and mechanisms producing observed behavior. Another examines the assumptions, categories, frameworks, and evidence shaping our explanation of that behavior.</p><blockquote>What way of looking at this makes it appear true?</blockquote><p>This question applies to my own interpretations and development decisions, too.</p></section>
    <section className="pc-section" aria-labelledby="inquiry-title"><p className="pc-kicker">A recurring reasoning practice</p><h2 id="inquiry-title">Notice → Frame → Model → Test → Interrogate → Revise</h2><p>Test. Show. Enable. describes what the work delivers to other people. This loop describes how the reasoning moves along the way; they are not competing processes to memorize.</p><p>A flexible loop, not a rigid sequence. Evidence can send the inquiry back to an earlier question. All six moves are available to read here without operating a model.</p><dl className="pc-inquiry-list">{inquiry.map(([name, text]) => <div key={name}><dt>{name}</dt><dd>{text}</dd></div>)}</dl></section>
    <StrandLine caption="FIG · Conceptual illustration · the thread I follow through the strands; not data"/>
    <section className="pc-section" aria-labelledby="practice-outputs-title"><p className="pc-kicker">What each move produces</p><h2 id="practice-outputs-title">Decisions, not only findings.</h2>
      <dl className="pc-inquiry-list">{practiceOutputs.map(item => <div key={item.move}><dt>{item.move}</dt><dd>{item.output} <a href={publicPath(item.href)}>{item.example} <span aria-hidden="true">→</span></a></dd></div>)}</dl>
    </section>
    <section className="pc-section pc-methods" aria-labelledby="methods-title"><p className="pc-kicker">Methods, and where they are shown</p><h2 id="methods-title">Each method links to the <em className="pc-accent">work</em> that shows it.</h2>
      <p>Methods I have used in published case studies. A link shows one instance, not a formal credential in the method.</p>
      {methodFamilies.map(family => <section key={family.family} aria-labelledby={`methods-${family.family.split(' ')[0].toLowerCase()}`}><h3 id={`methods-${family.family.split(' ')[0].toLowerCase()}`}>{family.family}</h3>
        <dl className="pc-method-inventory">{family.methods.map(item => <div key={item.method}><dt>{item.method}</dt><dd>{item.slugs.map((slug, index) => <React.Fragment key={slug}>{index ? ' · ' : null}<a href={publicPath(`/investigations/${slug}/`)}>{caseLabels[slug] ?? slug}</a></React.Fragment>)}</dd></div>)}</dl>
      </section>)}
    </section>
    <section className="pc-section pc-agenda" aria-labelledby="agenda-title"><p className="pc-kicker">Research agenda</p><h2 id="agenda-title">Questions I keep <em className="pc-accent">returning</em> to.</h2>
      <p>Continuing research interests, not established theories. Each links to the work where the question first came up, and to the writing and experiments that explore it.</p>
      <ol className="pc-agenda-list">{researchAgenda.map(item => <li key={item.theme}><h3>{item.theme}</h3><p className="pc-question">{item.question}</p><p className="pc-agenda-links">{item.slugs.map((slug, index) => <React.Fragment key={slug}>{index ? ' · ' : null}<a href={publicPath(`/investigations/${slug}/`)}>{caseLabels[slug] ?? slug}</a></React.Fragment>)}</p></li>)}</ol>
      <p><a className="pc-text-link" href={publicPath('/writing/')}>Field Notes <span aria-hidden="true">→</span></a> <a className="pc-text-link" href={publicPath('/lab/')}>Experiments <span aria-hidden="true">→</span></a> <a className="pc-text-link" href={publicPath('/patterns/')}>Related. Not equivalent. <span aria-hidden="true">→</span></a></p>
    </section>
    <section className="pc-section" aria-labelledby="case-anatomy-title"><p className="pc-kicker">How a case is read</p><h2 id="case-anatomy-title">Every case, the same <em className="pc-accent">order</em>.</h2>
      <p>Each case study answers the same questions in the same order, so a reader can compare cases and find the limits quickly.</p>
      <AnnotatedPlate title="The parts of a case study page" caption="FIG · Artifact · the structure of every public case; schematic" parts={caseAnatomy}/>
    </section>
    <section className="pc-section"><p className="pc-kicker">How I Know</p><h2>Keep the account inspectable.</h2><p>Separate what was observed from what is inferred, proposed, implemented, or measured. Name the source, contribution, and limitation. Treat a connection as an editorial claim that needs its own explanation—not proof of equivalence or causation.</p><a className="pc-text-link" href={publicPath('/patterns/')}>Connections: explore the distinctions →</a></section>
  </>
}

const conceptual = 'Conceptual distinction. No case relationship is asserted here.'
const caseRelated = 'Related to a published case study, which shows one instance. The distinction itself is conceptual, not a general finding.'
const distinctions = [
  { title: 'Delivered ≠ verified', connection: 'Both describe the end of a handoff.', difference: 'A delivered status records that something arrived. It does not establish that anyone checked it was sufficient and ready for the next step.', case: '/investigations/claims-operations/', evidence: caseRelated, limits: 'A delivered item can also be verified; the distinction only matters where the two are assumed to coincide.', question: 'What does this status establish—and what does it leave unverified?' },
  { title: 'Agreement ≠ trust', connection: 'Both are responses to the same statement about an organization.', difference: 'Agreeing that an attribute is true is a different question from reporting that the attribute influences trust.', case: '/investigations/brand-research/', evidence: caseRelated, limits: 'Neither answer, alone, identifies what produces trust or shows that trust changed.', question: 'Are we asking about agreement, or about its reported influence on trust?' },
  { title: 'Automation ≠ judgment', connection: 'Both are ways of checking work.', difference: 'An automated check tests a defined condition. A person can notice a question the check was never written to ask.', case: '/investigations/accessibility-ai/', evidence: caseRelated, limits: 'This is not a claim that either is generally better; they answer different questions.', question: 'Which question did the check answer, and which questions remain?' },
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
    <p className="pc-boundary">These are conceptual starting questions, not universal findings or a map of verified case relationships. Three link to a published case study that shows one instance.</p>
    <div className="pc-distinction-list">{distinctions.map(item => <section key={item.title}><h2><Distinction title={item.title}/></h2><p>{item.difference}</p><p className="pc-question">{item.question}</p><details className="pc-layer"><summary>Connection, evidence and limits<span className="pc-sr-only"> for {item.title.replace(' ≠ ', ' is not ')}</span></summary><dl className="pc-distinction-detail"><div><dt>What connects them</dt><dd>{item.connection}</dd></div><div><dt>Evidence status</dt><dd>{item.evidence}{'case' in item ? <> <a href={publicPath(item.case)}>Read the case study <span aria-hidden="true">→</span></a></> : null}</dd></div><div><dt>Where it stops</dt><dd>{item.limits}</dd></div></dl></details></section>)}</div>
    <section className="pc-section"><h2>What makes a connection useful?</h2><p>Name what is connected, why the distinction matters, what supports the relationship, and where it stops explaining. Keep interpretations and hypotheses visible as such.</p><p>This overview does not generate or approve graph edges between investigations.</p><a className="pc-text-link" href={publicPath('/practice/')}>Read the inquiry practice →</a></section>
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
    <p className="pc-kicker">The Observatory · experimental</p><h1>Experiments<span aria-hidden="true">*</span></h1>
    <p className="pc-lead">A separate place for curiosity to operate: experiments that test ways of exploring questions and connections.</p>
    <p className="pc-boundary">The experiments below are invented or illustrative, and none of them is needed to read the rest of the site. The asterisk marks an experiment. The connections field maps my own work and writing.</p>
    <ConnectionsField/>
    <ul className="pc-observatory-index">{observatory.map(item => <li key={item.href}>
      <p className="pc-kicker">{item.kind}</p>
      <h2><a href={publicPath(item.href)} aria-label={item.experimental ? `${item.title} — experimental` : undefined}>{item.title}{item.experimental ? <span aria-hidden="true">*</span> : null}</a></h2>
      <p>{item.text}</p>
      {'also' in item ? <p><a className="pc-text-link" href={publicPath(item.also.href)}>{item.also.label} →</a></p> : null}
    </li>)}</ul>
  </>
}

/**
 * Contact: a reason for getting in touch, a prompt
 * that fits it, and an honest action. The form needs no server: "Prepare email" opens the visitor's email
 * app with the message written out, and the address stays visible for anyone without one. Nothing is
 * stored or sent from this page, so nothing here claims a message was delivered. Career history lives on About.
 */
function Contact() {
  const [prepared, setPrepared] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error' | 'wait'>('idle')
  const [reason, setReason] = useState<string>(contactReasons[1].value)
  const [delivery, setDelivery] = useState(false)
  const [token, setToken] = useState('')
  const shown = useRef(Date.now())
  const challenge = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const value = new URLSearchParams(location.search).get('reason')
    if (value && contactReasons.some(item => item.value === value)) setReason(value)
    shown.current = Date.now()
    const siteKey = contactDelivery.turnstileSiteKey
    if (!siteKey) return
    // Server delivery: load Cloudflare Turnstile only on this page, only when configured.
    const turnstile = () => (window as unknown as { turnstile?: { render(el: HTMLElement, options: Record<string, unknown>): void } }).turnstile
    const mount = () => { if (challenge.current && turnstile()) { turnstile()!.render(challenge.current, { sitekey: siteKey, callback: (value: string) => setToken(value), 'expired-callback': () => setToken(''), appearance: 'interaction-only' }); setDelivery(true) } }
    if (turnstile()) { mount(); return }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true; script.onload = mount
    document.head.append(script)
  }, [])
  const current = contactReasons.find(item => item.value === reason) ?? contactReasons[1]
  const fields = (form: HTMLFormElement) => { const data = new FormData(form); return (name: string) => String(data.get(name) ?? '').trim() }
  const prepareEmail = (value: (name: string) => string) => {
    const subject = `${current.label}${value('organization') ? `: ${value('organization')}` : ''}`
    const body = [`Name: ${value('name')}`, `Email: ${value('email')}`, `Organization: ${value('organization')}`, `Reason: ${current.label}`, '', value('message')].join('\n')
    location.href = `mailto:${recruiterContact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setPrepared(true)
  }
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = fields(event.currentTarget)
    count('contact-send')
    if (!delivery) return prepareEmail(value)
    setState('sending')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason, name: value('name'), email: value('email'), organization: value('organization'), message: value('message'), website: value('website'), elapsed: Date.now() - shown.current, token }) })
      if (response.status === 503) { setDelivery(false); setState('idle'); return prepareEmail(value) }
      setState(response.ok ? 'sent' : response.status === 429 ? 'wait' : 'error')
    } catch { setState('error') }
  }
  if (state === 'sent') return <>
    <p className="pc-kicker">Contact</p><h1>Thank you. Your message is on its <em className="pc-accent">way</em>.</h1>
    <p className="pc-lead" role="status">It went straight to my inbox, and I reply to every message, usually within a few days.</p>
    <p><a className="pc-text-link" href={publicPath('/investigations/')}>Back to the work <span aria-hidden="true">→</span></a></p>
  </>
  return <>
    <p className="pc-kicker">Contact</p><h1>Bring me the problem that keeps <em className="pc-accent">coming back</em>.</h1>
    <p className="pc-lead">A role, an organizational question, a research collaboration, or an invitation to teach or speak. Tell me what you are trying to understand or change. I reply to every message.</p>
    <ul className="pc-cta-offer">{ctaOffer.map(item => <li key={item.title}><strong>{item.title}</strong> {item.text}</li>)}</ul>
    <section className="pc-contact-form-section" aria-labelledby="contact-form-title">
      <h2 id="contact-form-title">Start a conversation</h2>
      <form className="pc-contact-form" action={`mailto:${recruiterContact.email}`} method="post" encType="text/plain" onSubmit={submit}>
        <label>What brings you here?<select name="reason" value={reason} onChange={event => setReason(event.currentTarget.value)}>{contactReasons.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label>Your name<input name="name" autoComplete="name" maxLength={100} required/></label>
        <label>Your email<input name="email" type="email" autoComplete="email" maxLength={200} required/></label>
        <label><span>Organization <span className="pc-contact-optional">(optional)</span></span><input name="organization" autoComplete="organization" maxLength={150}/></label>
        <label>{current.prompt}<textarea name="message" rows={6} minLength={10} maxLength={5000} required/></label>
        {/* Left empty by people; bots that fill every field are refused (worker/contact.ts). */}
        <p className="pc-contact-trap" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></p>
        <div ref={challenge} className="pc-contact-challenge"/>
        <p className="pc-contact-submit"><button type="submit" className="pc-cta-primary" disabled={state === 'sending' || (delivery && !token)}>{delivery ? (state === 'sending' ? 'Sending…' : 'Send message') : 'Prepare email'} <span aria-hidden="true">→</span></button></p>
        <p className="pc-contact-note">{delivery ? 'Your message goes straight to my inbox. Nothing is stored on this site. A quick automated check keeps out spam.' : 'This opens your email app with your message written out, ready for you to send. Nothing is sent from this page.'}</p>
        {state === 'wait' ? <p className="pc-contact-note" role="alert">To keep spam out, the site sends one message every five minutes. Please try again in a few minutes; your text is still here.</p> : null}
        {state === 'error' ? <p className="pc-contact-note" role="alert">That didn’t go through. Please try again in a minute, or write to me from your own email.</p> : null}
        {prepared ? <p className="pc-contact-note" role="status">Your email app should have opened with the message ready to send. If it didn’t, write from your own email app instead.</p> : null}
      </form>
    </section>
    <p className="pc-contact-elsewhere">Looking for my background first? <a href={publicPath('/about/')}>Career history and education <span aria-hidden="true">→</span></a> <a href={recruiterContact.linkedin}>LinkedIn <ExternalArrow/></a></p>
  </>
}

/** About: the portrait, the thread in place of a résumé, and what the site counts. */
function About() {
  const { portrait } = recruiterContact
  return <>
    <p className="pc-kicker">About · Sami Belina</p>
    <h1>I investigate why outcomes and their <em className="pc-accent">explanations</em> part ways.</h1>
    <div className="pc-about-intro">
      {portrait ? <figure className="pc-portrait"><img src={publicPath(portrait.src)} alt={portrait.alt} width={portrait.width} height={portrait.height}/></figure> : null}
      <div>
        <p className="pc-lead">I investigate the human, informational, and operational conditions shaping outcomes—helping institutions uncover <strong>overlooked problems</strong>, redesign how their systems work, and strengthen people’s ability to make informed decisions and navigate change.</p>
        <p className="pc-about-tagline">{tagline} <span className="pc-about-areas">{practiceAreas.join(' · ')}</span></p>
        <p><a className="pc-text-link" href={publicPath('/practice/')}>How I investigate <span aria-hidden="true">→</span></a> <a className="pc-text-link" href={publicPath('/investigations/')}>The case studies <span aria-hidden="true">→</span></a></p>
      </div>
    </div>
    <section className="pc-section pc-positioning" aria-labelledby="about-approach-title">
      <h2 id="about-approach-title">Where my work <em className="pc-accent">begins</em></h2>
      <p className="pc-positioning-philosophy">{researchPhilosophy}</p>
      <dl className="pc-positioning-list">{positioningPoints.map(point => <div key={point.term}><dt>{point.term}</dt><dd>{point.detail}</dd></div>)}</dl>
      <p className="pc-positioning-differentiator">{differentiator.lead} <strong>{differentiator.turn}</strong></p>
    </section>
    <CareerThread/>
    <section className="pc-section pc-history" aria-labelledby="about-history-title">
      <h2 id="about-history-title">Career history</h2>
      <p>Employers are described rather than named on this site. <a href={`mailto:${recruiterContact.email}?subject=${encodeURIComponent('Résumé request')}`}>Request the résumé</a> for names, dates and titles.</p>
      <div className="pc-history-scroll" role="region" aria-labelledby="about-history-title" tabIndex={0}>
        <table className="pc-history-table">
          <thead><tr><th scope="col">Years</th><th scope="col">Role</th><th scope="col">Setting</th></tr></thead>
          <tbody>{careerHistory.map(item => <tr key={item.role}><td>{item.years}</td><th scope="row">{item.role}{'note' in item ? <span className="pc-history-note">{item.note}</span> : null}</th><td>{item.setting}</td></tr>)}</tbody>
        </table>
      </div>
      <h3>Recognition</h3>
      <ul className="pc-recognition">{recognition.map(item => <li key={item.text}><span className="pc-recognition-year">{item.year}</span> {item.text}</li>)}</ul>
      <h3>Speaking</h3>
      <ul className="pc-speaking">{speaking.map(item => <li key={item.title}><strong>{item.title}</strong> <span className="pc-speaking-where">{item.where}</span>{item.text ? <> {item.text}</> : null}</li>)}</ul>
      <h3>Education</h3>
      <p><strong>{education.degree}</strong>, {education.school}. {education.minors}.</p>
      <p><a className="pc-text-link" href={publicPath('/contact/?reason=employment')}>Discuss a role <span aria-hidden="true">→</span></a></p>
    </section>
    <section className="pc-section pc-storm" aria-labelledby="about-storm-title">
      <h2 id="about-storm-title">{stormWorkflow.title}</h2>
      <p>{stormWorkflow.context}</p>
      <figure className="pc-storm-figure" aria-labelledby="about-storm-label">
        <p id="about-storm-label" className="pc-storm-label">{stormWorkflow.label}</p>
        <ol className="pc-storm-steps">{stormWorkflow.steps.map(step => <li key={step.title}><strong>{step.title}</strong> <span>{step.text}</span></li>)}</ol>
      </figure>
      <p>{stormWorkflow.outcome}</p>
      <p className="pc-storm-why">{stormWorkflow.why}</p>
    </section>
    <CountingChoice/>
  </>
}

/** Field Notes: the writing preserved from the previous edition, now in the current one. Full texts are not published yet. */
function Writing() {
  return <>
    <p className="pc-kicker">Field Notes</p><h1>Questions still being <em className="pc-accent">worked</em> out.</h1>
    <p className="pc-lead">Essays, notes and earlier work: the thinking behind the case studies, kept separate from them.</p>
    <p className="pc-boundary">These are descriptions and excerpts. The full texts will be published here once they are recovered from their originals; nothing is reconstructed from summaries.</p>
    <LensInterlude/>
    <section className="pc-section" aria-labelledby="writing-notes-title"><h2 id="writing-notes-title">Field notes and essays</h2>
      <ul className="pc-writing-list">{writings.map(item => <li key={item.id} id={item.id}><p className="pc-kicker">{item.kind}</p><h3>{item.title}</h3><p className="pc-writing-subtitle">{item.subtitle}</p><blockquote><p>{item.excerpt}</p></blockquote><p>{item.context}</p></li>)}</ul>
    </section>
    <section className="pc-section" id="earlier-work" aria-labelledby="writing-earlier-title"><h2 id="writing-earlier-title">Earlier work</h2>
      <ul className="pc-writing-list">{archiveItems.map(item => <li key={item.id} id={item.id}><p className="pc-kicker">{item.type.replace(/\s*·\s*\d{4}$/, '')}</p><h3>{item.title}</h3><p>{item.note}</p></li>)}</ul>
    </section>
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
    {kind === 'practice' ? <Practice/> : kind === 'patterns' ? <Patterns/> : kind === 'writing' ? <Writing/> : kind === 'observatory' ? <Observatory/> : kind === 'contact' ? <Contact/> : kind === 'about' ? <About/> : <SystemSpecimen enhanced={enhanced} surface={surface} setSurface={setSurface}/>}
  </div></CurrentShell>
}
