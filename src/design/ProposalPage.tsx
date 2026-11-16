import React, { type ReactNode } from 'react'
import { CurrentShell } from './CurrentShell'
import { publicPath } from '../public-path'

/**
 * Local-only page shells for owner review (directive of 16 November 2026, Phase 1).
 * Only `npm run build:fixtures` renders them. The production build refuses them and
 * the public audit rejects the marker below. Nothing here is approved wording.
 */
export const proposalMarker = 'OWNER_REVIEW_PROPOSAL_16NOV'
export const proposalPages = {
  about: { path: '/about/', title: 'About (proposal)', description: 'Unapproved local shell for an About page.' },
  learning: { path: '/learning/', title: 'Learning and facilitation (proposal)', description: 'Unapproved local shell for a Learning and Facilitation pathway.' },
} as const
export type ProposalKind = keyof typeof proposalPages

function Pending({ children }: { children: ReactNode }) {
  return <p className="pc-proposal-pending"><strong>Owner content pending.</strong> {children}</p>
}

function Banner() {
  return <aside className="pc-proposal-banner" aria-label="Review status" data-marker={proposalMarker}>
    <p><strong>Local review shell. Not published, not approved.</strong> Structure and candidate wording for owner review. Every factual statement below needs confirmation before it can appear on the public site, and no section implies completed outcomes.</p>
  </aside>
}

function About() {
  return <>
    <Banner/>
    <p className="pc-kicker">About</p><h1>Sami Belina</h1>
    <p className="pc-lead">Candidate framing: research, design, language and philosophy meet in one interest, which is how understanding develops and what helps it hold up.</p>
    <section className="pc-section" aria-labelledby="about-background"><h2 id="about-background">Background</h2>
      <p>Candidate: an Interdisciplinary Design background, with minors in Digital Media and Philosophy.</p>
      <Pending>Confirm the institution, degree name and how the owner wants it phrased. No advanced degree, teaching credential or research qualification is implied.</Pending>
    </section>
    <section className="pc-section" aria-labelledby="about-practice"><h2 id="about-practice">Where the work happens</h2>
      <p>Applied research across organizational, technological and civic settings, drawing on research, design, facilitation and systems inquiry.</p>
      <Pending>Formal job titles, employers and periods, kept separate from cross-functional projects and independent work. Link each to an approved investigation once one exists.</Pending>
    </section>
    <section className="pc-section" aria-labelledby="about-why"><h2 id="about-why">Why the combination is useful</h2>
      <Pending>One or two paragraphs, in the owner’s words, on how these disciplines inform each other. This is the page’s argument, not a chronological résumé.</Pending>
    </section>
    <section className="pc-section" aria-labelledby="about-direction"><h2 id="about-direction">Direction</h2>
      <p>Candidate: an interest in inquiry-based education and in helping people develop independent reasoning, stated as a direction rather than an established teaching career.</p>
      <Pending>Practical areas of collaboration the owner wants to invite.</Pending>
    </section>
    <section className="pc-section pc-contact" aria-labelledby="about-contact"><h2 id="about-contact">Contact</h2><a href={publicPath('/#contact')}>Contact options on the homepage →</a></section>
  </>
}

const learningCase = ['Audience and their starting understanding', 'Intended capability or learning objective', 'Activity or resource design', 'Participant interaction', 'Feedback and evaluation', 'Observed use', 'Limitation or unresolved question'] as const
const inquiryActivity = ['Examine an initially plausible claim.', 'Identify the assumptions it depends on.', 'Compare at least two interpretations.', 'Define the evidence that would distinguish them.', 'Revise the original question.'] as const
const criteria = ['Names an assumption that was not stated in the claim.', 'Describes evidence that could count against their preferred interpretation.', 'Explains how the revised question differs from the first, and why.', 'Accepts a defensible approach that differs from the facilitator’s.'] as const

function Learning() {
  return <>
    <Banner/>
    <p className="pc-kicker">Learning &amp; facilitation</p><h1>Designing conditions for other people’s understanding</h1>
    <p className="pc-lead">Three different kinds of material, kept apart so that experience, method and aspiration are not mistaken for one another.</p>
    <section className="pc-section" aria-labelledby="learning-demonstrated"><p className="pc-kicker">1 · Demonstrated practice</p><h2 id="learning-demonstrated">What has been done</h2>
      <p>Facilitation, training, mentoring, workshop design and knowledge transfer from existing professional work.</p>
      <Pending>Choose one substantiated case, preferably the Claims knowledge-development work or a documented workshop, and supply sanitized artifacts. It stays unpublished until its wording, sources and rights are approved.</Pending>
      <h3>Each learning-design case shows</h3><ol>{learningCase.map(item => <li key={item}>{item}</li>)}</ol>
    </section>
    <section className="pc-section" aria-labelledby="learning-methods"><p className="pc-kicker">2 · Transferable methods</p><h2 id="learning-methods">Methods that carry across settings</h2>
      <p>Question framing, cognitive load, interpretation, systems mapping, creative problem solving, accessible information design, and examining competing explanations.</p>
      <p><a href={publicPath('/practice/')}>How these appear in the inquiry practice →</a></p>
    </section>
    <section className="pc-section" aria-labelledby="learning-prospective"><p className="pc-kicker">3 · Prospective educational research</p><h2 id="learning-prospective">Questions not yet tested</h2>
      <p>How critical thinking, inquiry, epistemic reasoning and learner independence develop, and how they could be assessed. These are directions of interest, not evidence of effectiveness with any group of learners.</p>
      <h3>Proposed experience: How do we know what we know?</h3>
      <p><strong>Untested concept.</strong> No sessions have been run; there is no participant feedback or learning result.</p>
      <ol>{inquiryActivity.map(step => <li key={step}>{step}</li>)}</ol>
      <p>The activity invites several defensible approaches rather than rewarding a preferred conclusion.</p>
      <h4>Proposed assessment criteria</h4><ul>{criteria.map(item => <li key={item}>{item}</li>)}</ul>
    </section>
  </>
}

export function ProposalPage({ kind }: { kind: ProposalKind }) {
  const page = proposalPages[kind]
  return <CurrentShell route={page.path}><article className="pc-document pc-proposal">{kind === 'about' ? <About/> : <Learning/>}</article></CurrentShell>
}
