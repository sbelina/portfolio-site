import React, { useEffect } from 'react'
import archive from '../content/build-archive.json'
import { ExperimentNote } from './components/ExperimentNote'
import { BuildArchiveLink } from './components/BuildArchiveLink'
import { usePublicHeader } from './components/usePublicHeader'

const currentAnchors = new Set(['root', 'index', 'index-title', 'contact', 'contact-title', 'home-reading'])
export const archivedAnchors = archive.homeAnchors.filter(id => !currentAnchors.has(id))
const labels: Record<string, string> = { work: 'Investigations', connections: 'Connections', practice: 'How I investigate', 'field-notes': 'Field notes and essays', archive: 'Writing archive', 'system-map': 'Relationship map' }

/** A new entry point; previous work and its interactions live in the frozen build. */
export default function BuildIndex() {
  const { header, compactHeader, headerMeasured, oversizedHeader } = usePublicHeader()
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
  return <>
    <a className="main-skip-link" href="#index">Skip to main content</a>
    <main id="index" className="site-main build-index" tabIndex={-1}>
      <header ref={header} className="site-header" data-compact={compactHeader} data-measured={headerMeasured} data-oversized={oversizedHeader}>
        <a href="/" className="wordmark"><span aria-hidden="true">△</span> Producing Curiosity</a>
        <nav className="public-navigation" aria-label="Primary navigation"><ul>
          <li><a href={`${archive.reviewPath}#work`}>Investigations</a></li>
          <li><a href={`${archive.reviewPath}#connections`}>Connections</a></li>
          <li><a href={`${archive.reviewPath}#practice`}>Method</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul></nav>
      </header>
      <section className="index-hero" aria-labelledby="index-title">
        <p className="eyebrow">Producing Curiosity / Seeing What Systems Miss</p>
        <h1 id="index-title">The visible problem is rarely the one producing the outcome.</h1>
        <p className="hero-copy">How do systems shape what people understand, decide, and do?</p>
        <p className="build-index-voice">I swim upstream toward the problem.</p>
        <p>A portfolio of investigations, connected ideas, and experimentation by Sami Belina.</p>
      </section>
      <section id="contact" className="build-index-contact" aria-labelledby="contact-title">
        <h2 id="contact-title">Continue the conversation.</h2>
        <a href="mailto:hello@sbelina.com">hello@sbelina.com</a><a href="https://www.linkedin.com/in/transplantsam">LinkedIn <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 13L13 3M4 3H13V12" /></svg></a>
      </section>
      <details className="build-index-legacy"><summary>Find a section from the previous site</summary>
        <p>The complete previous experience is preserved, including its introduction, relationship map, writing descriptions, and experiments.</p>
        <ul>{archivedAnchors.map(id => <li key={id} id={id}><a href={`${archive.reviewPath}#${id}`}>{labels[id] ?? id.replaceAll('-', ' ')} →</a></li>)}</ul>
      </details>
    </main>
    <footer className="site-footer build-index-footer"><span>© {new Date().getFullYear()} Sami Belina</span>
      <div><BuildArchiveLink/><a href="#index">Back to top ↑</a></div>
      <p className="build-index-caption">Archived review build · {archive.capturedDate} · source <code>{archive.sourceCommit.slice(0,7)}</code>. Preserved for review; deployment at capture was unverified.</p>
      <ExperimentNote/>
    </footer>
  </>
}
