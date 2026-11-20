import React, { useEffect } from 'react'
import archive from '../content/build-archive.json'
import { CurrentShell } from './design/CurrentShell'
import { PracticeMoves } from './design/PracticeMoves'
import { InquiryIllustration } from './design/InquiryIllustration'
import { ExternalArrow } from './design/ExternalArrow'
import { publicPath } from './public-path'
import { HomeIntroduction, useHomeIntroduction } from './components/HomeIntroduction'
import { primaryEvidence, previousEditionHref, representativeSummaries, type InvestigationSummary } from './content/primary-evidence'
import { professionalIdentity, practiceAreas, tagline } from './content/recruiter'
import { RecruiterActions } from './design/RecruiterActions'

const currentAnchors = new Set(['root', 'index', 'index-title', 'contact', 'contact-title', 'home-reading'])
export const archivedAnchors = archive.homeAnchors.filter(id => !currentAnchors.has(id))
const labels: Record<string, string> = { work: 'Investigations', connections: 'Connections', practice: 'How I investigate', 'field-notes': 'Field notes and essays', archive: 'Writing archive', 'system-map': 'Relationship map' }

/** A new entry point; previous work and its interactions live in the frozen build. */
export default function BuildIndex({ investigations = [] }: { investigations?: readonly InvestigationSummary[] }) {
  const introduction = useHomeIntroduction()
  const evidence = primaryEvidence(investigations, archive.reviewPath)
  useEffect(() => {
    const followLegacyFragment = () => {
      let fragment: string
      try { fragment = decodeURIComponent(location.hash.slice(1)) } catch { return }
      if (archivedAnchors.includes(fragment)) location.replace(`${archive.reviewPath}${location.search}#${encodeURIComponent(fragment)}`)
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
          <h1 id="index-title">I turn gaps in understanding into evidence leaders can act on.</h1>
          <p className="pc-lead">I investigate the organizational, service, and human-system conditions behind an outcome—sometimes starting from a question no one had assigned. I test the accepted explanation, synthesize what the evidence supports, and make it usable by the people who decide what happens next.</p>
          <p className="pc-hero-action"><a className="pc-text-link" href={publicPath(evidence.href)}>{evidence.status === 'approved' ? 'Read the investigation' : 'Read the Claims case summary'} <span aria-hidden="true">→</span></a></p>
          <p className="pc-byline"><span className="pc-areas">{practiceAreas.join(' · ')}</span> <span className="pc-tagline">{tagline}</span></p>
          {introduction.ready ? <button type="button" className="pc-replay" onClick={introduction.replay}>Replay introduction</button> : null}
        </div>
        <InquiryIllustration archivePath={publicPath(archive.reviewPath)}/>
      </section>
      <nav className="pc-journeys" aria-label="Explore the portfolio">
        <a href={publicPath(evidence.href)} data-evidence-status={evidence.status}><span className="pc-kicker">Start with the evidence</span><strong>{evidence.title} <span aria-hidden="true">→</span></strong><span>{evidence.description}{evidence.status === 'previous-edition' ? <> <em className="pc-evidence-boundary">{evidence.boundary}</em></> : null}</span></a>
        <a href={publicPath('/patterns/')}><span className="pc-kicker">Explore my questions</span><strong>Related. Not equivalent. <span aria-hidden="true">→</span></strong><span>Examine distinctions that can change how a problem is understood.</span></a>
      </nav>
      {evidence.status === 'previous-edition' ? <section className="pc-section pc-representative" aria-labelledby="pc-representative-title">
        <div className="pc-section-heading"><p className="pc-kicker">Representative investigations</p><h2 id="pc-representative-title">Three questions, three kinds of evidence</h2></div>
        <p className="pc-boundary">Each account separates what I initiated and contributed from the decisions other people owned. These link to case summaries from the previous edition; the full investigations are not yet published.</p>
        <ol className="pc-representative-list">{representativeSummaries.map(item => <li key={item.anchor}>
          <p className="pc-kicker">{item.label}</p>
          <a href={publicPath(previousEditionHref(archive.reviewPath, item.anchor))} aria-describedby={`pc-status-${item.anchor}`}><strong>{item.title}</strong> <span aria-hidden="true">→</span></a>
          <p className="pc-representative-status" id={`pc-status-${item.anchor}`}>Previous-edition summary · full case unpublished</p>
        </li>)}</ol>
        <a className="pc-text-link" href={publicPath('/investigations/')}>All investigations and their status <span aria-hidden="true">→</span></a>
      </section> : null}
      {evidence.status === 'approved' && evidence.brief ? <section className="pc-section pc-featured-case" aria-labelledby="pc-featured-title">
        <div className="pc-section-heading"><p className="pc-kicker">Featured investigation</p><h2 id="pc-featured-title">{evidence.title}</h2></div>
        <dl className="pc-brief">{([['What changed', evidence.brief.result], ['The problem', evidence.brief.tension], ['What I did', evidence.brief.call], ['How I knew', evidence.brief.evidence]] as const).map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
        <a className="pc-text-link" href={publicPath(evidence.href)}>Read the full case, including what I didn’t own <span aria-hidden="true">→</span></a>
        <RecruiterActions label="Contact after the featured investigation"/>
      </section> : null}
      <section className="pc-section" aria-labelledby="pc-practice-title">
        <div className="pc-section-heading"><p className="pc-kicker">The practice</p><h2 id="pc-practice-title">Test. Show. Enable.</h2></div>
        <PracticeMoves/>
        <a className="pc-text-link" href={publicPath('/practice/')}>How I investigate <span aria-hidden="true">→</span></a>
      </section>
      <section className="pc-section pc-evidence-promise" aria-labelledby="pc-know-title"><p className="pc-kicker">The evidence commitment</p><h2 id="pc-know-title">How I Know</h2><p>Make the sources, methods, interpretations, and limitations inspectable. An observation is not an explanation; a proposed change is not a measured result.</p><p>Useful knowledge should return to affected people and communities, as well as the people making decisions.</p><p className="pc-purpose">The longer aim is to widen what people and communities can understand, question, imagine, and shape. That is an intention behind the work, not a measured result of it.</p><RecruiterActions label="Contact after How I Know"/></section>
      <section id="contact" className="pc-section pc-contact" aria-labelledby="contact-title">
        <p className="pc-kicker">Continue the conversation</p><h2 id="contact-title">What needs a better explanation?</h2>
        <a href="mailto:hello@sbelina.com">Email Sami Belina <ExternalArrow/></a><a href="https://www.linkedin.com/in/transplantsam">LinkedIn <ExternalArrow/></a>
      </section>
      <details className="build-index-legacy pc-disclosure"><summary>Find a section from the previous site</summary>
        <p>The complete previous experience is preserved, including its introduction, relationship map, writing descriptions, and experiments.</p>
        <ul>{archivedAnchors.map(id => <li key={id} id={id}><a href={`${archive.reviewPath}#${id}`}>{labels[id] ?? id.replaceAll('-', ' ')} →</a></li>)}</ul>
      </details>
    </div>
  </CurrentShell></>
}
