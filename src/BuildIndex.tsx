import React, { useEffect } from 'react'
import { CurrentShell } from './design/CurrentShell'
import { PracticeInMotion } from './design/PracticeInMotion'
import { RelatedField } from './design/RelatedField'
import { ExternalArrow } from './design/ExternalArrow'
import { publicPath } from './public-path'
import { HomeIntroduction, useHomeIntroduction } from './components/HomeIntroduction'
import { caseLabel, caseLabels, primaryEvidenceHref, selectedInvestigations, type InvestigationSummary } from './content/primary-evidence'
import { legacyFragments } from './content/legacy-fragments'
import { ctaOffer, homeHeadline, possibilities, practiceAreas, professionalIdentity, recruiterContact, tagline, valueLine } from './content/recruiter'
import { CaseStatus } from './reading/CaseStatus'
import { ResultsStrip } from './design/ResultsStrip'
import { LensInterlude } from './design/LensInterlude'
import { plainText, Stressed } from './content/emphasis'
import { CaseThumb } from './design/CaseFigures'

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
  const pairs = investigations.filter(entry => entry.slug && entry.visual).map(entry => ({ slug: entry.slug!, label: caseLabels[entry.slug!] ?? plainText(entry.title), left: plainText(entry.visual!.left), right: plainText(entry.visual!.right), explanation: plainText(entry.visual!.explanation), ...(entry.brief ? { changed: plainText(entry.brief.result) } : {}), href: publicPath(entry.path) }))
  // Test. Show. Enable. walked through the first selected case, in its own approved words.
  const lead = selected.find(entry => entry.brief && entry.visual && entry.slug)
  const example = lead ? { label: caseLabels[lead.slug!] ?? plainText(lead.title), href: publicPath(lead.path), left: plainText(lead.visual!.left), right: plainText(lead.visual!.right), test: lead.brief!.tension, show: lead.visual!.explanation, enable: lead.brief!.result } : undefined
  useEffect(() => {
    const followLegacyFragment = () => {
      let fragment: string
      try { fragment = decodeURIComponent(location.hash.slice(1)) } catch { return }
      if (Object.hasOwn(legacyFragments, fragment)) location.replace(publicPath(legacyFragments[fragment]))
    }
    followLegacyFragment()
    window.addEventListener('hashchange', followLegacyFragment)
    return () => window.removeEventListener('hashchange', followLegacyFragment)
  }, [])
  return <>{introduction.visible ? <HomeIntroduction replayKey={introduction.replayKey} complete={introduction.complete}/> : null}<CurrentShell route="/" onSkipIntro={introduction.visible ? introduction.complete : undefined}>
    <div className="build-index">
      <section className="pc-hero pc-hero--text" aria-labelledby="index-title">
        <div className="pc-hero-copy">
          <p className="pc-kicker pc-identity"><span className="pc-identity-name">Sami Belina</span> <span aria-hidden="true">·</span> {professionalIdentity}</p>
          <h1 id="index-title">{homeHeadline.lead}<strong className="pc-weight">{homeHeadline.cost}</strong>{homeHeadline.middle}<em className="pc-accent">{homeHeadline.accent}</em>{homeHeadline.end}</h1>
          <p className="pc-lead">I investigate the human, informational, and operational conditions shaping outcomes—helping institutions uncover <strong>overlooked problems</strong>, redesign how their systems work, and strengthen people’s ability to make informed decisions and navigate change.</p>
          <p className="pc-hero-action pc-cluster"><a className="pc-text-link" href={publicPath(evidenceHref)}>{evidenceHref === '/investigations/' ? 'See the case studies' : 'Read the insurance operations case study'} <span aria-hidden="true">→</span></a> <a className="pc-text-link pc-secondary-link" href={publicPath('/practice/')}>Explore my approach <span aria-hidden="true">→</span></a>{recruiterContact.resumeHref ? <> <a className="pc-text-link pc-secondary-link" href={publicPath(recruiterContact.resumeHref)}>View my résumé (PDF)</a></> : null}</p>
          <p className="pc-value">{valueLine}</p>
          <p className="pc-byline"><span className="pc-areas">{practiceAreas.join(' · ')}</span> <span className="pc-tagline">{tagline}</span></p>
          {introduction.ready ? <button type="button" className="pc-replay" onClick={introduction.replay}>Replay introduction</button> : null}
        </div>
      </section>
      <section className="pc-section pc-possible" aria-labelledby="pc-possible-title">
        <h2 id="pc-possible-title" className="pc-kicker">Three things my work makes possible</h2>
        <ul className="pc-possible-list">{possibilities.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.question}</span></li>)}</ul>
      </section>
      <ResultsStrip investigations={investigations}/>
      {selected.length ? <section className="pc-section pc-selected" aria-labelledby="pc-selected-title">
        <div className="pc-section-heading"><p className="pc-kicker">Selected case studies</p><h2 id="pc-selected-title">Three problems, and what <em className="pc-accent">changed</em>.</h2></div>
        <ol className="pc-selected-list">{selected.map(entry => <li key={entry.id}>
          {entry.visual && entry.composition ? <CaseThumb composition={entry.composition} left={plainText(entry.visual.left)} right={plainText(entry.visual.right)}/> : null}
          {caseLabel(entry.slug) ? <p className="pc-kicker pc-selected-domain">{caseLabel(entry.slug)}</p> : null}
          {entry.status ? <p className="pc-selected-status"><CaseStatus status={entry.status}/></p> : null}
          <h3 style={entry.slug ? { viewTransitionName: `case-${entry.slug}` } as React.CSSProperties : undefined}><a href={publicPath(entry.path)}><Stressed text={entry.title} heading/></a></h3>
          {entry.stakes ? <p className="pc-selected-stakes"><span className="pc-selected-label">At stake:</span> <Stressed text={entry.stakes}/></p> : null}
          {entry.brief ? <p><span className="pc-selected-label">What changed:</span> <Stressed text={entry.brief.result}/></p> : <p><Stressed text={entry.summary}/></p>}
          <p className="pc-selected-links"><a href={publicPath(entry.path)}>Public version <span aria-hidden="true">→</span></a>{entry.deepDive && entry.slug ? <> <a href={publicPath(`/deep-dive/${entry.slug}/`)}>Deep dive <span className="pc-selected-note">(password)</span> <span aria-hidden="true">→</span></a></> : null}</p>
        </li>)}</ol>
        <a className="pc-text-link" href={publicPath('/investigations/')}>All {investigations.length} case studies <span aria-hidden="true">→</span></a>
        <p className="pc-cta-band"><strong>Seeing the same pattern in your organization?</strong> <a href={publicPath('/contact/')}>Let’s talk about it <span aria-hidden="true">→</span></a></p>
      </section> : <section className="pc-section" aria-labelledby="pc-selected-title"><p className="pc-kicker">Case studies</p><h2 id="pc-selected-title">Case studies are in review</h2><p>No case study is published in this edition yet.</p></section>}
      {pairs.length ? <section className="pc-section pc-pattern" aria-labelledby="pc-pattern-title">
        <div className="pc-section-heading"><p className="pc-kicker">The pattern across the work</p><h2 id="pc-pattern-title">Related. <em className="pc-accent">Not</em> equivalent.</h2></div>
        <p className="pc-pattern-lead">Every case study here began where two related things had been <em>taken for one</em>. The work was finding <strong>where they part</strong>, and what that changes.</p>
        <RelatedField pairs={pairs}/>
        <a className="pc-text-link" href={publicPath('/patterns/')}>Explore the distinctions <span aria-hidden="true">→</span></a>
      </section> : null}
      <section className="pc-section" aria-labelledby="pc-practice-title">
        <div className="pc-section-heading"><p className="pc-kicker">How I investigate</p><h2 id="pc-practice-title">Test. Show. Enable.</h2></div>
        <PracticeInMotion example={example}/>
        <p className="pc-how-i-know"><strong>How I Know:</strong> each case study separates evidence, interpretation, contribution, implementation and measured outcomes, and says what remains unproven.</p>
        <p className="pc-purpose">The longer aim is to widen what people and communities can understand, question, imagine, and shape. That is an intention behind the work, not a measured result of it.</p>
        <a className="pc-text-link" href={publicPath('/practice/')}>How I investigate <span aria-hidden="true">→</span></a>
      </section>
      <nav className="pc-section pc-explore" aria-labelledby="pc-explore-title">
        <h2 id="pc-explore-title" className="pc-kicker">Explore further</h2>
        <ul>{explore.map(item => <li key={item.href}><a href={publicPath(item.href)}><span className="pc-kicker">{item.kicker}</span><strong>{item.title} <span aria-hidden="true">→</span></strong><span>{item.text}</span></a></li>)}</ul>
      </nav>
      <LensInterlude compact/>
      <section id="contact" className="pc-section pc-cta" aria-labelledby="contact-title">
        <p className="pc-kicker">Work with me</p>
        <h2 id="contact-title">Before the next costly fix, understand the <em className="pc-accent">problem</em>.</h2>
        <p className="pc-cta-lead">If your organization keeps spending on a problem that keeps coming back, <strong>I’m who you call</strong>. I find what is actually driving it, show which responses the evidence supports, and leave your team able to act on it.</p>
        <ul className="pc-cta-offer">{ctaOffer.map(item => <li key={item.title}><strong>{item.title}</strong> {item.text}</li>)}</ul>
        <p className="pc-cta-actions"><a className="pc-cta-primary" href={publicPath('/contact/')}>Start a conversation <span aria-hidden="true">→</span></a> <a href={`mailto:${recruiterContact.email}`}>Email {recruiterContact.email}</a> <a href={recruiterContact.linkedin}>LinkedIn <ExternalArrow/></a></p>
        <p className="pc-cta-proof">Worked in insurance operations, customer research, enterprise innovation, product research, civic engagement and AI-assisted development.</p>
      </section>
    </div>
  </CurrentShell></>
}
