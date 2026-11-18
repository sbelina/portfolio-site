import React, { useEffect } from 'react'
import archive from '../content/build-archive.json'
import { CurrentShell } from './design/CurrentShell'
import { PracticeMoves } from './design/PracticeMoves'
import { InquiryIllustration } from './design/InquiryIllustration'
import { ExternalArrow } from './design/ExternalArrow'
import { publicPath } from './public-path'
import { HomeIntroduction, useHomeIntroduction } from './components/HomeIntroduction'
import { primaryEvidence, type InvestigationSummary } from './content/primary-evidence'
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
          <p className="pc-kicker">Research strategy · Organizational effectiveness · Service design · Innovation</p>
          <h1 id="index-title">I turn gaps in understanding into evidence leaders can act on.</h1>
          <p className="pc-lead">I investigate the organizational, operational, and human conditions behind an outcome. Then I design ways for people to make better decisions and develop capabilities together—through research they can use, shared guidance, training, and facilitation.</p>
          <p className="pc-hero-action"><a className="pc-text-link" href={publicPath(evidence.href)}>{evidence.status === 'approved' ? 'Read the investigation' : 'Read the Claims case summary'} <span aria-hidden="true">→</span></a></p>
          <p className="pc-byline">An evolving portfolio and field journal by Sami Belina.</p>
          {introduction.ready ? <button type="button" className="pc-replay" onClick={introduction.replay}>Replay introduction</button> : null}
        </div>
        <InquiryIllustration archivePath={publicPath(archive.reviewPath)}/>
      </section>
      <nav className="pc-journeys" aria-label="Explore the portfolio">
        <a href={publicPath(evidence.href)} data-evidence-status={evidence.status}><span className="pc-kicker">Start with the evidence</span><strong>{evidence.title} <span aria-hidden="true">→</span></strong><span>{evidence.description}{evidence.status === 'previous-edition' ? <> <em className="pc-evidence-boundary">{evidence.boundary}</em></> : null}</span></a>
        <a href={publicPath('/patterns/')}><span className="pc-kicker">Explore my questions</span><strong>Related. Not equivalent. <span aria-hidden="true">→</span></strong><span>Examine distinctions that can change how a problem is understood.</span></a>
      </nav>
      {evidence.status === 'approved' && evidence.brief ? <section className="pc-section pc-featured-case" aria-labelledby="pc-featured-title">
        <div className="pc-section-heading"><p className="pc-kicker">Featured investigation</p><h2 id="pc-featured-title">{evidence.title}</h2></div>
        <dl className="pc-brief">{([['Tension', evidence.brief.tension], ['My call', evidence.brief.call], ['Result', evidence.brief.result], ['Evidence', evidence.brief.evidence]] as const).map(([term, detail]) => <div key={term}><dt>{term}</dt><dd>{detail}</dd></div>)}</dl>
        <a className="pc-text-link" href={publicPath(evidence.href)}>Read the full case, including what I didn’t own <span aria-hidden="true">→</span></a>
        <RecruiterActions label="Contact after the featured investigation"/>
      </section> : null}
      <section className="pc-section" aria-labelledby="pc-practice-title">
        <div className="pc-section-heading"><p className="pc-kicker">The practice</p><h2 id="pc-practice-title">Test. Show. Enable.</h2></div>
        <PracticeMoves/>
        <a className="pc-text-link" href={publicPath('/practice/')}>How I investigate <span aria-hidden="true">→</span></a>
      </section>
      <section className="pc-section pc-evidence-promise" aria-labelledby="pc-know-title"><p className="pc-kicker">The evidence commitment</p><h2 id="pc-know-title">How I Know</h2><p>Make the sources, methods, interpretations, and limitations inspectable. An observation is not an explanation; a proposed change is not a measured result.</p><p>Useful knowledge should return to affected people and communities, as well as the people making decisions.</p><RecruiterActions label="Contact after How I Know"/></section>
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
