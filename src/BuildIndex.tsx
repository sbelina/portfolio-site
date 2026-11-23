import React, { useEffect } from 'react'
import { CurrentShell } from './design/CurrentShell'
import { PracticeMoves } from './design/PracticeMoves'
import { InquiryIllustration } from './design/InquiryIllustration'
import { ExternalArrow } from './design/ExternalArrow'
import { publicPath } from './public-path'
import { HomeIntroduction, useHomeIntroduction } from './components/HomeIntroduction'
import { primaryEvidenceHref, selectedInvestigations, type InvestigationSummary } from './content/primary-evidence'
import { legacyFragments } from './content/legacy-fragments'
import { homeHeadline, possibilities, practiceAreas, professionalIdentity, recruiterContact, tagline, valueLine } from './content/recruiter'
import { RecruiterActions } from './design/RecruiterActions'
import { CaseStatus } from './reading/CaseStatus'
import { ResultsStrip } from './design/ResultsStrip'
import { LensInterlude } from './design/LensInterlude'
import { StrandLine } from './design/Interactions'

/** Old homepage anchors kept as targets, so a no-JavaScript visitor following an old link can still find its new home. */
const movedSections = Object.entries(legacyFragments)

const explore = [
  { href: '/patterns/', kicker: 'Connections', title: 'Related. Not equivalent.', text: 'Distinctions that change how a problem is understood.' },
  { href: '/writing/', kicker: 'Field Notes', title: 'Writing and questions', text: 'Essays, notes and ideas still being worked out.' },
  { href: '/lab/', kicker: 'Observatory*', title: 'Experiments', text: 'Interactive ways of exploring questions. Optional, and clearly invented.' },
  { href: '/lab/edge-case/', kicker: 'Observatory* · game', title: 'Edge Case', text: 'A prototype game about the limits of apparent rules.' },
] as const

/**
 * The homepage (owner direction, 23 November): institutional value first, then the evidence, the
 * practice, places to explore, a compact interlude and the call to action. Legacy fragments land on
 * their current pages; retired builds are never linked.
 */
export default function BuildIndex({ investigations = [] }: { investigations?: readonly InvestigationSummary[] }) {
  const introduction = useHomeIntroduction()
  const evidenceHref = primaryEvidenceHref(investigations)
  const selected = selectedInvestigations(investigations)
  const publishedPaths = Object.fromEntries(investigations.filter(entry => entry.slug).map(entry => [entry.slug!, publicPath(entry.path)]))
  useEffect(() => {
    const followLegacyFragment = () => {
      let fragment: string
      try { fragment = decodeURIComponent(location.hash.slice(1)) } catch { return }
      if (Object.hasOwn(legacyFragments, fragment) && legacyFragments[fragment] !== '/#contact') location.replace(publicPath(legacyFragments[fragment]))
    }
    followLegacyFragment()
    window.addEventListener('hashchange', followLegacyFragment)
    return () => window.removeEventListener('hashchange', followLegacyFragment)
  }, [])
  return <>{introduction.visible ? <HomeIntroduction replayKey={introduction.replayKey} complete={introduction.complete}/> : null}<CurrentShell route="/" onSkipIntro={introduction.visible ? introduction.complete : undefined}>
    <div className="build-index">
      <section className="pc-hero" aria-labelledby="index-title">
        <div className="pc-hero-copy">
          <p className="pc-kicker pc-identity"><span className="pc-identity-name">Sami Belina</span> <span aria-hidden="true">·</span> {professionalIdentity}</p>
          <h1 id="index-title">{homeHeadline.lead}<em className="pc-accent">{homeHeadline.accent}</em>{homeHeadline.end}</h1>
          <p className="pc-lead">I investigate the human, informational, and operational conditions shaping outcomes—helping institutions uncover overlooked problems, redesign how their systems work, and strengthen people’s ability to make informed decisions and navigate change.</p>
          <p className="pc-hero-action pc-cluster"><a className="pc-text-link" href={publicPath(evidenceHref)}>{evidenceHref === '/investigations/' ? 'Examine the investigations' : 'Read the Claims investigation'} <span aria-hidden="true">→</span></a> <a className="pc-text-link pc-secondary-link" href={publicPath('/practice/')}>Explore my approach <span aria-hidden="true">→</span></a>{recruiterContact.resumeHref ? <> <a className="pc-text-link pc-secondary-link" href={publicPath(recruiterContact.resumeHref)}>View my résumé (PDF)</a></> : null}</p>
          <p className="pc-value">{valueLine}</p>
          <p className="pc-byline"><span className="pc-areas">{practiceAreas.join(' · ')}</span> <span className="pc-tagline">{tagline}</span></p>
          {introduction.ready ? <button type="button" className="pc-replay" onClick={introduction.replay}>Replay introduction</button> : null}
        </div>
        <InquiryIllustration publishedPaths={publishedPaths}/>
      </section>
      <section className="pc-section pc-possible" aria-labelledby="pc-possible-title">
        <h2 id="pc-possible-title" className="pc-kicker">Three things my work makes possible</h2>
        <ul className="pc-possible-list">{possibilities.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.question}</span></li>)}</ul>
      </section>
      <ResultsStrip investigations={investigations}/>
      {selected.length ? <section className="pc-section pc-selected" aria-labelledby="pc-selected-title">
        <div className="pc-section-heading"><p className="pc-kicker">Selected investigations</p><h2 id="pc-selected-title">What becomes possible when we investigate the problem first?</h2></div>
        <ol className="pc-selected-list">{selected.map(entry => <li key={entry.id}>
          {entry.status ? <p className="pc-selected-status"><CaseStatus status={entry.status}/></p> : null}
          <h3 style={entry.slug ? { viewTransitionName: `case-${entry.slug}` } as React.CSSProperties : undefined}><a href={publicPath(entry.path)}>{entry.title}</a></h3>
          {entry.stakes ? <p className="pc-selected-stakes"><span className="pc-selected-label">At stake:</span> {entry.stakes}</p> : null}
          {entry.brief ? <p><span className="pc-selected-label">What changed:</span> {entry.brief.result}</p> : <p>{entry.summary}</p>}
          <p className="pc-selected-links"><a href={publicPath(entry.path)}>Public version <span aria-hidden="true">→</span></a>{entry.deepDive && entry.slug ? <> <a href={publicPath(`/deep-dive/${entry.slug}/`)}>Deep dive <span className="pc-selected-note">(password)</span> <span aria-hidden="true">→</span></a></> : null}</p>
        </li>)}</ol>
        <a className="pc-text-link" href={publicPath('/investigations/')}>All {investigations.length} investigations <span aria-hidden="true">→</span></a>
      </section> : <section className="pc-section" aria-labelledby="pc-selected-title"><p className="pc-kicker">Investigations</p><h2 id="pc-selected-title">Investigations are in review</h2><p>No investigation is published in this edition yet.</p></section>}
      <section className="pc-section" aria-labelledby="pc-practice-title">
        <div className="pc-section-heading"><p className="pc-kicker">How I investigate</p><h2 id="pc-practice-title">Test. Show. Enable.</h2></div>
        <PracticeMoves/>
        <StrandLine/>
        <p className="pc-how-i-know"><strong>How I Know:</strong> each investigation separates evidence, interpretation, contribution, implementation and measured outcomes, and says what remains unproven.</p>
        <p className="pc-purpose">The longer aim is to widen what people and communities can understand, question, imagine, and shape. That is an intention behind the work, not a measured result of it.</p>
        <a className="pc-text-link" href={publicPath('/practice/')}>How I investigate <span aria-hidden="true">→</span></a>
      </section>
      <nav className="pc-section pc-explore" aria-labelledby="pc-explore-title">
        <h2 id="pc-explore-title" className="pc-kicker">Explore further</h2>
        <ul>{explore.map(item => <li key={item.href}><a href={publicPath(item.href)}><span className="pc-kicker">{item.kicker}</span><strong>{item.title} <span aria-hidden="true">→</span></strong><span>{item.text}</span></a></li>)}</ul>
      </nav>
      <LensInterlude compact/>
      <section id="contact" className="pc-section pc-contact" aria-labelledby="contact-title">
        <p className="pc-kicker">Work together</p><h2 id="contact-title">What needs a better explanation?</h2>
        <p>If an organization is investing time, money, or attention in a persistent problem without understanding why it continues, that is where my work begins.</p>
        <RecruiterActions label="Contact Sami Belina"/>
        <p className="pc-contact-secondary"><a href="https://www.linkedin.com/in/transplantsam">Professional experience on LinkedIn <ExternalArrow/></a></p>
      </section>
      <details className="build-index-legacy pc-disclosure"><summary>Looking for a section from the previous site?</summary>
        <p>The previous edition has been retired. Each of its sections now has a current home.</p>
        <ul>{movedSections.map(([id, href]) => <li key={id} id={id}><a href={publicPath(href)}>{id.replaceAll('-', ' ')} <span aria-hidden="true">→</span></a></li>)}</ul>
      </details>
    </div>
  </CurrentShell></>
}
