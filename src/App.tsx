import React from 'react'
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { ConnectionGraph } from './components/ConnectionGraph'
import { IntroExperience } from './components/IntroExperience'
import { ExperimentNote } from './components/ExperimentNote'
import { PublicNavigation } from './components/PublicNavigation'
import { archiveItems, graphTagIds, projects, writings } from './data'
import { emptyHomeReading, type HomeReading } from './home-reading'

const SESSION_KEY = 'producing-curiosity:intro-seen'

function shouldShowIntro() {
  try {
    return !window.location.hash &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
      localStorage.getItem(SESSION_KEY) !== 'true' &&
      sessionStorage.getItem(SESSION_KEY) !== 'true'
  } catch {
    // Storage and motion preferences are enhancements, never prerequisites.
    return false
  }
}

class IntroBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

export default function App({ reading = emptyHomeReading }: { reading?: HomeReading }) {
  // Server and first client render agree. Browser preferences are an enhancement.
  const [showIntro, setShowIntro] = useState(false)
  const [introReady, setIntroReady] = useState(false)
  const [replayKey, setReplayKey] = useState(0)
  const [graphSelection, setGraphSelection] = useState<string | null>(null)
  const introInitialised = useRef(false)
  const header = useRef<HTMLElement>(null)
  const [compactHeader, setCompactHeader] = useState(false)
  const [headerMeasured, setHeaderMeasured] = useState(false)
  const [oversizedHeader, setOversizedHeader] = useState(false)

  useEffect(() => {
    // Hysteresis prevents the change in header height from toggling its own state.
    const update = () => {
      const index = document.getElementById('index')
      const distance = window.scrollY - (index?.offsetTop ?? 0)
      setCompactHeader(current => current ? distance > 48 : distance > 120)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    const element = header.current
    if (!element) return
    const measure = () => {
      const height = element.getBoundingClientRect().height
      const oversized = height > window.innerHeight * .45
      document.documentElement.style.setProperty('--site-header-height', `${oversized ? 0 : height}px`)
      setOversizedHeader(oversized)
      setHeaderMeasured(true)
    }
    measure()
    const observer = typeof ResizeObserver === 'function' ? new ResizeObserver(measure) : null
    observer?.observe(element)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      document.documentElement.style.removeProperty('--site-header-height')
    }
  }, [])

  const completeIntro = useCallback(() => {
    try {
      localStorage.setItem(SESSION_KEY, 'true')
    } catch {
      // Keep the current visit usable even when storage is unavailable or full.
    }
    setShowIntro(false)
  }, [])

  useEffect(() => {
    if (introInitialised.current) return
    introInitialised.current = true
    const fragment = window.location.hash.slice(1)
    if (Object.hasOwn(reading.fragmentRedirects, fragment)) {
      window.location.replace(reading.fragmentRedirects[fragment])
      return
    }
    setShowIntro(shouldShowIntro())
    setIntroReady(true)
    try {
      // Remember the visit, including reduced-motion and legacy-session visits.
      localStorage.setItem(SESSION_KEY, 'true')
    } catch {
      // Access to the site does not depend on browser storage.
    }
  }, [reading])

  useEffect(() => {
    if (!introReady || showIntro) return
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (navigation?.type === 'back_forward') return
    const frame = requestAnimationFrame(() => {
      const destination = document.getElementById(window.location.hash.slice(1) || 'index')
      destination?.focus({ preventScroll: true })
      destination?.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => cancelAnimationFrame(frame)
  }, [showIntro, introReady])

  const replayIntro = () => {
    setShowIntro(true)
    setReplayKey((value) => value + 1)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const selectTag = (tag: string) => {
    setGraphSelection(`tag-${tag}`)
    document.getElementById('connections')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const traceNode = (nodeId: string) => {
    setGraphSelection(nodeId)
    document.getElementById('connections')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const renderTags = (tags: string[]) => (
    <div className="tag-row">
      {tags.map((tag) => graphTagIds.has(tag) ? (
        <button key={tag} type="button" className="tag-button" onClick={() => selectTag(tag)}>#{tag}</button>
      ) : <span key={tag} className="tag-static">#{tag}</span>)}
    </div>
  )

  return (
    <>
      <a className="main-skip-link" href="#index" onClick={completeIntro}>Skip to main content</a>
      {showIntro ? (
        <IntroBoundary key={replayKey}>
          <IntroExperience forceReplayKey={replayKey} onComplete={completeIntro} />
        </IntroBoundary>
      ) : null}

      <main id="index" className="site-main" tabIndex={-1}>
        <header ref={header} className="site-header" data-compact={compactHeader} data-measured={headerMeasured} data-oversized={oversizedHeader}>
          <a href="#index" className="wordmark" aria-label="Producing Curiosity home">
            <span className="wordmark-mark" aria-hidden="true">△</span>
            <span>Producing Curiosity</span>
          </a>
          <PublicNavigation home />
        </header>

        <section className="index-hero" aria-labelledby="index-title">
          <p className="eyebrow">Producing Curiosity / Seeing What Systems Miss</p>
          <h1 id="index-title">The visible problem is rarely the one producing the outcome.</h1>
          <div className="hero-actions">
            <a className="primary-link" href="#work">Explore investigations ↓</a>
            <a className="secondary-link" href="#connections">Explore connections →</a>
            <a className="hero-method-link" href="#practice">How I investigate ↓</a>
          </div>
          <p className="hero-copy">
            I investigate how assumptions, information, human behavior, and operating conditions shape outcomes—then translate what I find into decisions and durable ways of working.
          </p>
        </section>

        <section className="work" id="work" aria-labelledby="work-title">
          <div className="section-kicker">Selected work</div>
          <div className="work-intro">
            <h2 id="work-title">Look beneath the visible problem.</h2>
            <p>These existing summaries are a starting point for the work. Full investigations, sources, contribution details, and limitations require separate page review.</p>
          </div>
          <div className="work-spine" aria-hidden="true" />
          <div className="project-list">
            {projects.map((project) => (
              <article className="project-card" id={project.id} key={project.id}>
                <div className="project-index" aria-hidden="true">{project.number}</div>
                <div className="project-content">
                  <p className="project-domain">{project.domain}</p>
                  <h3>{project.title}</h3>
                  <p className="project-strapline">{project.strapline}</p>
                  <p className="project-focus">{project.focus}</p>
                  <p className="project-summary">{project.summary}</p>

                  <div className="case-logic" aria-label={`${project.domain} case logic`}>
                    <div className="logic-state logic-state--unresolved"><span>Observed</span><p>{project.observed}</p></div>
                    <div className="logic-state logic-state--pressure"><span>Diagnosed</span><p>{project.diagnosed}</p></div>
                    <div className="logic-state logic-state--holds"><span>Structure</span><p>{project.structure}</p></div>
                    <div className="logic-state logic-state--holds"><span>What remains</span><p>{project.remains}</p></div>
                  </div>

                  {renderTags(project.tags)}
                  <p className="capabilities"><span>Capabilities</span> {project.capabilities.join(' · ')}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="reading-gateway" aria-labelledby="reading-gateway-title">
          <p className="eyebrow">Seeing What Systems Miss</p>
          <h2 id="reading-gateway-title">Questions, evidence, and explained connections.</h2>
          <p>Open an investigation at its own address, read its limitations, and follow the reasoning into a related pattern.</p>
          {reading.fixture ? <p className="reading-fixture-note">Development fixtures — synthetic examples, not approved case studies. Excluded from production builds.</p> : null}
          <a className="primary-link" href="/investigations/">Browse investigations →</a>
          {reading.entries.map((entry) => <article key={entry.id}>
            <h3><a href={entry.path}>{entry.title}</a></h3><p>{entry.summary}</p>
          </article>)}
          {Object.entries(reading.fragmentRedirects).map(([fragment, path]) => (
            <p key={fragment} id={fragment}><a href={path}>Continue to the connected reading page →</a></p>
          ))}
        </section>

        <ConnectionGraph externalSelection={graphSelection} onSelectionConsumed={() => setGraphSelection(null)} />

        <section className="practice" id="practice" aria-labelledby="practice-title">
          <div className="section-kicker">Practice</div>
          <div className="practice-grid">
            <div>
              <h2 id="practice-title">Investigate. Translate. Implement.</h2>
              <p className="practice-lead">
                These are recurring moves in my work, not a fixed sequence. I return to the evidence when a decision or intervention reveals a new question.
              </p>
              <p className="hero-thesis">I swim upstream toward the problem.</p>
            </div>
            <aside className="fish-note" aria-label="Working orientation">
              <span className="aside-label">orientation</span>
              <p>When someone describes a problem as “like giving a fish legs,” my instinct is to swim with it.</p>
              <small>Movement over resistance. Possibility before prescription.</small>
            </aside>
          </div>

          <ol className="practice-moves" aria-label="Three professional moves">
            <li><h3>Investigate</h3><p>Examine the assumptions and conditions behind the picture people already have.</p></li>
            <li><h3>Translate</h3><p>Make evidence and relationships understandable enough to support a decision.</p></li>
            <li><h3>Implement</h3><p>Help the decision hold through workflows, guidance, learning, and ownership.</p></li>
          </ol>
          <p className="practice-inquiry">The inquiry behind these moves asks: <strong>What way of looking at this makes it appear true?</strong> I use Notice → Frame → Model → Test → Interrogate → Revise to examine the explanation as well as the system.</p>
          <div className="hero-study" aria-labelledby="study-label">
            <p id="study-label">Areas of inquiry</p>
            <ul><li>Structural causality</li><li>Information flow</li><li>Incentives</li><li>Feedback loops</li><li>Hidden work</li><li>Organizational learning</li></ul>
          </div>
          <div className="color-grammar" aria-label="Portfolio color system">
            <span className="color-key color-key--unresolved"><i aria-hidden="true" /> <strong>Violet</strong> unresolved</span>
            <span className="color-key color-key--pressure"><i aria-hidden="true" /> <strong>Coral</strong> pressure point</span>
            <span className="color-key color-key--holds"><i aria-hidden="true" /> <strong>Teal</strong> what holds</span>
          </div>

          <div className="practice-statement">
            <p>What I am moving toward</p>
            <blockquote>The structures, signals, and unspoken geometries that shape how understanding becomes possible.</blockquote>
          </div>

          <div className="origin-line" aria-label="How the practice developed">
            <div><span>Language</span><p>Meaning is relational. Position and context change what a thing can mean.</p></div>
            <div><span>Multimodal form</span><p>Writing, image, object, interface, and environment each change how understanding becomes possible.</p></div>
            <div><span>Information</span><p>Accessible communication and civic systems made equity, trust, and infrastructure difficult to separate.</p></div>
            <div><span>Sociotechnical systems</span><p>Research, operations, AI, and service work made hidden geometry visible: actors, constraints, signals, handoffs, and feedback.</p></div>
          </div>

          <div className="delta-panel">
            <p className="section-kicker">Emerging research</p>
            <h3>Delta Theory</h3>
            <p>An emerging framework for examining the geometry of understanding: the structures, signals, relationships, and unspoken forces that shape what can be perceived, communicated, and acted upon.</p>
            <button type="button" className="text-link-button" onClick={() => traceNode('origin-delta')}>See where it connects in the system map ↗</button>
          </div>
        </section>

        <section className="field-notes" id="field-notes" aria-labelledby="field-notes-title">
          <div className="section-kicker">Field notes + essays</div>
          <div className="field-notes-heading">
            <h2 id="field-notes-title">The work is one surface. The questions keep going.</h2>
            <p>Writing is where unfinished ideas can stay unfinished long enough to reveal a pattern. These notes are deliberately connected back into the system map rather than separated into a conventional blog taxonomy.</p>
          </div>

          <div className="writing-list">
            {writings.map((writing) => (
              <article className={`writing-card${writing.featured ? ' writing-card--featured' : ''}`} id={writing.id} key={writing.id}>
                <div className="writing-meta">
                  <span>{writing.kind}</span>
                  {writing.subtitle ? <p>{writing.subtitle}</p> : null}
                </div>
                <div className="writing-body">
                  <h3>{writing.title}</h3>
                  <blockquote>{writing.excerpt}</blockquote>
                  <p>{writing.context}</p>
                  {renderTags(writing.tags)}
                  <button type="button" className="trace-note" onClick={() => traceNode(`writing-${writing.id}`)}>Trace this note in the map ↗</button>
                </div>
              </article>
            ))}
          </div>

          <details className="archive" id="archive">
            <summary>Open the archive — earlier research, essays, poems, and fragments</summary>
            <p className="archive-intro">The archive is intentionally secondary. It preserves the trail without asking a hiring manager to read every earlier version of the thinking.</p>
            <div className="archive-grid">
              {archiveItems.map((item) => (
                <article className="archive-item" key={item.id}>
                  <p className="archive-type">{item.type}</p>
                  <h3>{item.title}</h3>
                  <p>{item.note}</p>
                  {renderTags(item.tags)}
                  <button type="button" className="trace-note" onClick={() => traceNode(item.id)}>Trace in the map ↗</button>
                </article>
              ))}
            </div>
          </details>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <div className="section-kicker">In closing</div>
          <h2 id="closing-title">Define upstream. Prevent downstream rework.</h2>
          <p>Most organizations do not have a solution problem. They have a problem-definition problem — and a cycle that returns them to the same place because nothing was left behind to tell them they had moved.</p>
          <div className="closing-questions">
            <p><span>01</span> What decision is this meant to support?</p>
            <p><span>02</span> What would change your mind?</p>
            <p><span>03</span> What are you already measuring?</p>
            <p><span>04</span> What data and evidence led you to this definition?</p>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div>
            <div className="section-kicker">Contact</div>
            <h2 id="contact-title">If the problem is expensive, ambiguous, cross-functional, or stuck — that is where I work best.</h2>
          </div>
          <div className="contact-links">
            <a href="mailto:hello@sbelina.com">hello@sbelina.com</a>
            <a href="https://www.linkedin.com/in/transplantsam">LinkedIn ↗</a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Sami Belina</span>
        <div>
          <a href="#index">Back to top ↑</a>
          <a href="/experiments/reveal-hidden-work/">Reveal the hidden work ↗</a>
          <button type="button" className="footer-replay" onClick={replayIntro}>Replay introduction</button>
        </div>
        <ExperimentNote />
      </footer>
    </>
  )
}
