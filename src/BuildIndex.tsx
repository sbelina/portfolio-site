import React, { useEffect } from 'react'
import { CurrentShell } from './design/CurrentShell'
import { PracticeInMotion } from './design/PracticeInMotion'
import { FieldPreview, RelatedField } from './design/RelatedField'
import { ExternalArrow } from './design/ExternalArrow'
import { publicPath } from './public-path'
import { HomeIntroduction, useHomeIntroduction } from './components/HomeIntroduction'
import { caseLabel, caseLabels, primaryEvidenceHref, selectedInvestigations, type InvestigationSummary } from './content/primary-evidence'
import { legacyFragments } from './content/legacy-fragments'
import { ctaOffer, engagementPaths, homeHeadline, professionalIdentity, recruiterContact, tagline } from './content/recruiter'
import { demonstratedCapabilities, workHref } from './content/capabilities'
import { CaseStatus } from './reading/CaseStatus'
import { ResultsStrip } from './design/ResultsStrip'
import { LensInterlude } from './design/LensInterlude'
import { plainText, Stressed } from './content/emphasis'
import { CaseThumb } from './design/CaseFigures'

const explore = [
  { href: '/patterns/', kicker: 'Connections', title: 'Related. Not equivalent.', text: 'Distinctions that change how a problem is understood.' },
  { href: '/writing/', kicker: 'Field Notes', title: 'Writing and questions', text: 'Essays, notes and ideas still being worked out.' },
  { href: '/lab/', kicker: 'Experiments*', title: 'The Observatory', text: 'Interactive ways of exploring questions. Optional, and clearly invented.' },
  { href: '/lab/edge-case/', kicker: 'Experiments* · game', title: 'Edge Case', text: 'A prototype game about the limits of apparent rules.' },
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
  const capabilityGroups = demonstratedCapabilities(investigations.map(entry => entry.slug).filter((slug): slug is string => !!slug))
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
    // A link or address that targets something inside a folded card opens that card first.
    const openTarget = () => { const id = location.hash.slice(1); const target = id ? document.getElementById(id) : null; const fold = target?.closest('details'); if (fold && !fold.open) { fold.open = true; target!.scrollIntoView() } }
    openTarget()
    window.addEventListener('hashchange', openTarget)
    window.addEventListener('hashchange', followLegacyFragment)
    return () => { window.removeEventListener('hashchange', followLegacyFragment); window.removeEventListener('hashchange', openTarget) }
  }, [])
  return <>{introduction.visible ? <HomeIntroduction replayKey={introduction.replayKey} complete={introduction.complete}/> : null}<CurrentShell route="/" onSkipIntro={introduction.visible ? introduction.complete : undefined} onReplayIntro={introduction.ready ? introduction.replay : undefined}>
    <div className="build-index">
      <section className="pc-hero" aria-labelledby="index-title">
        <div className="pc-hero-copy">
          <p className="pc-kicker pc-identity"><span className="pc-identity-name">Sami Belina</span> <span aria-hidden="true">·</span> {professionalIdentity}</p>
          <h1 id="index-title">{homeHeadline.lead}<strong className="pc-weight">{homeHeadline.cost}</strong>{homeHeadline.middle}<em className="pc-accent">{homeHeadline.accent}</em>{homeHeadline.end}</h1>
          <p className="pc-tagline">{tagline}</p>
          <p className="pc-lead">I investigate the human, informational, and operational conditions shaping outcomes—helping institutions uncover <strong>overlooked problems</strong>, redesign how their systems work, and strengthen people’s ability to make informed decisions and navigate change.</p>
          <p className="pc-hero-action pc-cluster"><a className="pc-cta-primary" href={publicPath('/investigations/')} data-count="cta-hero">Explore the work <span aria-hidden="true">→</span></a> <a className="pc-text-link" href={publicPath(evidenceHref)}>{evidenceHref === '/investigations/' ? 'See the case studies' : 'Read the insurance operations case study'} <span aria-hidden="true">→</span></a> <a className="pc-text-link" href={publicPath('/contact/')}>Work with me <span aria-hidden="true">→</span></a>{recruiterContact.resumeHref ? <> <a className="pc-text-link pc-secondary-link" href={publicPath(recruiterContact.resumeHref)}>View my résumé (PDF)</a></> : null}</p>
        </div>
        {pairs.length ? <FieldPreview pairs={pairs} href="#pc-pattern-title"/> : null}
      </section>
      {/* Spacing follows meaning (owner, 24 November): the figures and the case studies are one band. */}
      <div className="pc-band pc-band--evidence">
      <ResultsStrip investigations={investigations}/>
      {selected.length ? <section className="pc-section pc-selected" aria-labelledby="pc-selected-title">
        <div className="pc-section-heading"><h2 id="pc-selected-title">Three problems, and what <em className="pc-accent">changed</em>.</h2></div>
        <ol className="pc-selected-list">{selected.map(entry => <li key={entry.id}>
          {entry.visual && entry.composition ? <CaseThumb composition={entry.composition} left={plainText(entry.visual.left)} right={plainText(entry.visual.right)}/> : null}
          {caseLabel(entry.slug) ? <p className="pc-selected-domain">{caseLabel(entry.slug)}</p> : null}
          {entry.status ? <p className="pc-selected-status"><CaseStatus status={entry.status}/></p> : null}
          <h3 style={entry.slug ? { viewTransitionName: `case-${entry.slug}` } as React.CSSProperties : undefined}><a href={publicPath(entry.path)}><Stressed text={entry.title} heading/></a></h3>
          {entry.stakes ? <p className="pc-selected-stakes"><span className="pc-selected-label">At stake:</span> <Stressed text={entry.stakes}/></p> : null}
          {entry.brief ? <p><span className="pc-selected-label">What changed:</span> <Stressed text={entry.brief.result}/></p> : <p><Stressed text={entry.summary}/></p>}
          <p className="pc-selected-links"><a href={publicPath(entry.path)} data-count="case-open" data-count-detail={entry.slug}>Public version <span aria-hidden="true">→</span></a>{entry.deepDive && entry.slug ? <> <a href={publicPath(`/deep-dive/${entry.slug}/`)} data-count="deep-dive-open" data-count-detail={entry.slug}>Deep dive <span className="pc-selected-note">(password)</span> <span aria-hidden="true">→</span></a></> : null}</p>
        </li>)}</ol>
        <a className="pc-text-link" href={publicPath('/investigations/')}>All {investigations.length} case studies <span aria-hidden="true">→</span></a>
        <p className="pc-cta-band"><strong>Seeing the same pattern in your organization?</strong> <a href={publicPath('/contact/?reason=organization')} data-count="cta-band">Let’s talk about it <span aria-hidden="true">→</span></a></p>
      </section> : <section className="pc-section" aria-labelledby="pc-selected-title"><p className="pc-kicker">Case studies</p><h2 id="pc-selected-title">Case studies are in review</h2><p>No case study is published in this edition yet.</p></section>}
      {capabilityGroups.length ? <section className="pc-section pc-capabilities" aria-labelledby="pc-capabilities-title">
        <div className="pc-section-heading"><h2 id="pc-capabilities-title">Find the work by <em className="pc-accent">capability</em>.</h2></div>
        <ul className="pc-capability-list">{capabilityGroups.map(group => <li key={group.id}><a href={publicPath(workHref(group.id))}><strong>{group.label}</strong> <span className="pc-capability-count">{group.slugs.length} {group.slugs.length === 1 ? 'case study' : 'case studies'}</span></a><span>{group.text}</span></li>)}</ul>
      </section> : null}
      </div>
      <div className="pc-band pc-band--thinking">
      {pairs.length ? <section className="pc-section pc-pattern" aria-labelledby="pc-pattern-title">
        <div className="pc-section-heading"><h2 id="pc-pattern-title">Related. <em className="pc-accent">Not</em> equivalent.</h2></div>
        <p className="pc-pattern-lead">Every case study here began where two related things had been <em>taken for one</em>. The work was finding <strong>where they part</strong>, and what that changes.</p>
        <RelatedField pairs={pairs}/>
        <a className="pc-text-link" href={publicPath('/patterns/')}>Explore the distinctions <span aria-hidden="true">→</span></a>
      </section> : null}
      {/* Optional depth folds into cards (owner direction, 24 November). What every reader needs stays open:
          the call to action, figures, case studies and the pattern. Native <details>, each opening independently. */}
      <section className="pc-section pc-folds" aria-label="Go deeper">
        <details className="pc-fold" id="practice-fold" data-count="practice-open">
          <summary>
            <svg className="pc-fold-glyph" viewBox="0 0 64 40" aria-hidden="true" focusable="false"><path d="M2 12C18 12 22 20 32 20M2 28C18 28 22 20 32 20" className="pc-legend-ink" strokeDasharray="2 4"/><ellipse cx="32" cy="20" rx="4" ry="14" className="pc-legend-check"/><path d="M32 20H62" className="pc-legend-thread"/></svg>
            <span className="pc-fold-text"><h2 id="pc-practice-title">Test. Show. Enable.</h2><span className="pc-fold-teaser">Three moves, shown on one case study: find the gap, make the evidence visible, and leave people able to act.</span></span>
            <span className="pc-fold-icon" aria-hidden="true"/>
          </summary>
          <div className="pc-fold-body">
            <PracticeInMotion example={example}/>
            <p className="pc-how-i-know"><strong>How I Know:</strong> each case study separates evidence, interpretation, contribution, implementation and measured outcomes, and says what remains unproven.</p>
            <p className="pc-purpose">The longer aim is to widen what people and communities can understand, question, imagine, and shape. That is an intention behind the work, not a measured result of it.</p>
            <a className="pc-text-link" href={publicPath('/practice/')}>How I investigate <span aria-hidden="true">→</span></a>
          </div>
        </details>
        <details className="pc-fold" id="explore-fold" data-count="explore-open">
          <summary>
            <svg className="pc-fold-glyph" viewBox="0 0 64 40" aria-hidden="true" focusable="false"><path d="M8 30L24 12L40 26L56 8" className="pc-legend-ink" strokeDasharray="2 4"/>{[[8, 30], [24, 12], [40, 26]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" className="pc-legend-ink"/>)}<circle cx="56" cy="8" r="3.5" className="pc-legend-turn"/></svg>
            <span className="pc-fold-text"><h2 id="pc-explore-title">Connections, writing and experiments</h2><span className="pc-fold-teaser">The distinctions behind the work, Field Notes, the experiments and a prototype game.</span></span>
            <span className="pc-fold-icon" aria-hidden="true"/>
          </summary>
          <nav className="pc-fold-body pc-explore" aria-labelledby="pc-explore-title">
            <ul>{explore.map(item => <li key={item.href}><a href={publicPath(item.href)}><span className="pc-kicker">{item.kicker}</span><strong>{item.title} <span aria-hidden="true">→</span></strong><span>{item.text}</span></a></li>)}</ul>
          </nav>
        </details>
      </section>
      </div>
      <LensInterlude compact/>
      <section id="contact" className="pc-section pc-cta" aria-labelledby="contact-title">
        <h2 id="contact-title">Before the next costly fix, understand the <em className="pc-accent">problem</em>.</h2>
        <p className="pc-cta-lead">If your organization keeps spending on a problem that keeps coming back, <strong>I’m who you call</strong>. I find what is actually driving it, show which responses the evidence supports, and leave your team able to act on it.</p>
        <ul className="pc-cta-offer pc-cta-offer--list">{ctaOffer.map(item => <li key={item.title}><strong>{item.title}</strong> {item.text}</li>)}</ul>
        <ul className="pc-pathways" aria-label="Ways to work together">{engagementPaths.map(path => <li key={path.reason}><a href={publicPath(`/contact/?reason=${path.reason}`)}><strong>{path.title} <span aria-hidden="true">→</span></strong></a><span>{path.text}</span></li>)}</ul>
        <p className="pc-cta-actions"><a className="pc-cta-primary" href={publicPath('/contact/')} data-count="cta-end">Start a conversation <span aria-hidden="true">→</span></a> <a href={`mailto:${recruiterContact.email}`}>Email {recruiterContact.email}</a> <a href={recruiterContact.linkedin}>LinkedIn <ExternalArrow/></a></p>
        <p className="pc-cta-proof">Worked in insurance operations, customer research, enterprise innovation, product research, civic engagement and AI-assisted development.</p>
      </section>
    </div>
  </CurrentShell></>
}
