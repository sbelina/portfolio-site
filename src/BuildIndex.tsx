import React, { useEffect } from 'react'
import archive from '../content/build-archive.json'
import { CurrentShell } from './design/CurrentShell'
import { PracticeMoves } from './design/PracticeMoves'
import { InquiryIllustration } from './design/InquiryIllustration'
import { ExternalArrow } from './design/ExternalArrow'
import { publicPath } from './public-path'

const currentAnchors = new Set(['root', 'index', 'index-title', 'contact', 'contact-title', 'home-reading'])
export const archivedAnchors = archive.homeAnchors.filter(id => !currentAnchors.has(id))
const labels: Record<string, string> = { work: 'Investigations', connections: 'Connections', practice: 'How I investigate', 'field-notes': 'Field notes and essays', archive: 'Writing archive', 'system-map': 'Relationship map' }

/** A new entry point; previous work and its interactions live in the frozen build. */
export default function BuildIndex() {
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
  return <CurrentShell route="/">
    <div className="build-index">
      <section className="pc-hero" aria-labelledby="index-title">
        <div className="pc-hero-copy">
          <p className="pc-kicker">Applied human systems research &amp; strategy</p>
          <h1 id="index-title">I investigate situations where outcomes are visible, but the explanations behind them remain unclear.</h1>
          <p className="pc-lead">I study how people understand, decide, and act within organizational, technological, and civic systems—and help make that understanding useful to the people who need it.</p>
          <p className="pc-byline">An evolving portfolio and field journal by Sami Belina.</p>
        </div>
        <InquiryIllustration/>
      </section>
      <nav className="pc-journeys" aria-label="Explore the portfolio">
        <a href={publicPath('/investigations/')}><span className="pc-kicker">Evaluate my work</span><strong>Explore investigations <span aria-hidden="true">→</span></strong><span>Questions, contributions, evidence, and what remains unresolved.</span></a>
        <a href={publicPath('/patterns/')}><span className="pc-kicker">Explore my questions</span><strong>Related. Not equivalent. <span aria-hidden="true">→</span></strong><span>Examine distinctions that can change how a problem is understood.</span></a>
      </nav>
      <section className="pc-section" aria-labelledby="pc-practice-title">
        <div className="pc-section-heading"><p className="pc-kicker">The practice</p><h2 id="pc-practice-title">Test. Show. Enable.</h2></div>
        <PracticeMoves/>
        <a className="pc-text-link" href={publicPath('/practice/')}>How I investigate <span aria-hidden="true">→</span></a>
      </section>
      <section className="pc-section pc-evidence-promise" aria-labelledby="pc-know-title"><p className="pc-kicker">The evidence commitment</p><h2 id="pc-know-title">How I Know</h2><p>Make the sources, methods, interpretations, and limitations inspectable. An observation is not an explanation; a proposed change is not a measured result.</p><p>Useful knowledge should return to affected people and communities, as well as the people making decisions.</p></section>
      <section id="contact" className="pc-section pc-contact" aria-labelledby="contact-title">
        <p className="pc-kicker">Continue the conversation</p><h2 id="contact-title">What needs a better explanation?</h2>
        <a href="mailto:hello@sbelina.com">Email Sami Belina <ExternalArrow/></a><a href="https://www.linkedin.com/in/transplantsam">LinkedIn <ExternalArrow/></a>
      </section>
      <details className="build-index-legacy pc-disclosure"><summary>Find a section from the previous site</summary>
        <p>The complete previous experience is preserved, including its introduction, relationship map, writing descriptions, and experiments.</p>
        <ul>{archivedAnchors.map(id => <li key={id} id={id}><a href={`${archive.reviewPath}#${id}`}>{labels[id] ?? id.replaceAll('-', ' ')} →</a></li>)}</ul>
      </details>
    </div>
  </CurrentShell>
}
