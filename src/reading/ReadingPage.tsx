import { AssumedObserved } from '../visuals/AssumedObserved'
import { ExperimentNote } from '../components/ExperimentNote'
import React, { type ReactNode } from 'react'
import type { PublicEntry, PublicEvidence } from '../content/model'
import type { ReadingPageData, ReadingContext } from './page-data'
export type { ReadingPageData } from './page-data'

type Block = PublicEntry['blocks'][number]

const relationWords = {
  supports: 'supports', challenges: 'challenges', extends: 'extends', illustrates: 'illustrates',
  contradicts: 'contradicts', depends_on: 'depends on', emerged_from: 'emerged from', shares_pattern: 'shares a pattern with',
} as const

function dateLabel(value: string | null) {
  return value ? new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(value)) : 'Not recorded'
}

function blockLabel(block: Block, index: number, projection: ReadingContext) {
  switch (block.type) {
    case 'assumed_observed': return block.title
    case 'verse': return `Verse ${index + 1}`
    case 'callout': return block.label
    case 'prose': return block.markdown.match(/^#{1,6}\s+(.+)$/m)?.[1] ?? `Reading section ${index + 1}`
    case 'evidence': return projection.evidence.find(evidence => evidence.id === block.evidenceId)?.title ?? 'Evidence'
    case 'image': return block.caption ?? 'Supporting image'
    case 'interaction': return 'Assumption comparison'
  }
}

function blockAnchor(block: Block, entry: PublicEntry) {
  const limitations = entry.blocks.find(item => item.type === 'callout' && item.label.toLowerCase() === 'limitations')
  return limitations?.id === block.id ? 'limitations' : `block-${block.id}`
}

function SafeMarkdown({ block, html }: { block: Extract<Block, { type: 'prose' | 'callout' }>; html: Record<string, string> }) {
  // The build renders and sanitizes Markdown once. The identical prepared payload is
  // used for prerender and hydration, without shipping a sanitizer or private store.
  return html[block.id] === undefined
    ? <p>{block.markdown}</p>
    : <div className="reading-prose" dangerouslySetInnerHTML={{ __html: html[block.id] }} />
}

function EvidenceDisclosure({ evidence }: { evidence: PublicEvidence }) {
  const locatorIsLink = /^https?:\/\//i.test(evidence.locator)
  return (
    <details className="reading-evidence">
      <summary>Evidence: {evidence.title}</summary>
      <dl>
        <div><dt>Source</dt><dd>{evidence.source}</dd></div>
        <div><dt>Source locator</dt><dd>{locatorIsLink ? <a href={evidence.locator}>{evidence.locator}</a> : evidence.locator}</dd></div>
        <div><dt>Observed or recorded</dt><dd><time dateTime={evidence.observedAt}>{dateLabel(evidence.observedAt)}</time></dd></div>
        <div><dt>Evidence role</dt><dd>{evidence.role}</dd></div>
        <div><dt>Limitations</dt><dd>{evidence.limitations}</dd></div>
      </dl>
    </details>
  )
}

function ContentBlock({ block, page }: { block: Block; page: ReadingPageData }) {
  switch (block.type) {
    case 'assumed_observed': return <AssumedObserved block={block} evidence={page.projection.evidence}/>
    case 'verse': return <p className="reading-verse">{block.text}</p>
    case 'prose': return <SafeMarkdown block={block} html={page.renderedMarkdown} />
    case 'callout': return <aside className="reading-callout"><h2>{block.label}</h2><SafeMarkdown block={block} html={page.renderedMarkdown} /></aside>
    case 'evidence': {
      const evidence = page.projection.evidence.find(item => item.id === block.evidenceId)
      return evidence ? <EvidenceDisclosure evidence={evidence} /> : null
    }
    case 'image': {
      const asset = page.projection.assets.find(item => item.id === block.assetId)
      return asset ? (
        <figure className="reading-figure">
          <img src={asset.url} alt={asset.decorative ? '' : asset.alt} width={asset.width} height={asset.height} loading="lazy" decoding="async" />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
          <p className="reading-credit">Credit: {asset.credit}</p>
        </figure>
      ) : null
    }
    case 'interaction': return (
      <section className="reading-comparison" aria-label="Assumption comparison">
        <div><h2>Starting assumption</h2><p>{block.props.before}</p></div>
        <div><h2>Compared account</h2><p>{block.props.after}</p></div>
      </section>
    )
  }
}

function Connections({ entry, projection }: { entry: PublicEntry; projection: ReadingContext }) {
  const relationships = projection.relationships.filter(item => item.fromId === entry.id || item.toId === entry.id)
  if (!relationships.length) return null
  return (
    <section className="reading-connections" id="connections" aria-labelledby="reading-connections-title">
      <p className="reading-kicker">Follow the reasoning</p>
      <h2 id="reading-connections-title">Explained connections</h2>
      <p>A connection describes a particular interpretation. A backlink offers a way to read it from the other end; it does not reverse the claim.</p>
      <ul>
        {relationships.map(relationship => {
          const source = projection.entries.find(item => item.id === relationship.fromId)
          const target = projection.entries.find(item => item.id === relationship.toId)
          if (!source || !target) return null
          const other = source.id === entry.id ? target : source
          const direction = relationship.type === 'shares_pattern' ? 'Shared association' : source.id === entry.id ? 'Outgoing relationship' : 'Incoming relationship'
          return (
            <li key={relationship.id}>
              <p className="reading-relation-type">{direction}</p>
              <p className="reading-relation-statement"><strong>{source.title}</strong> {relationWords[relationship.type]} <strong>{target.title}</strong>.</p>
              <p>{relationship.rationale}</p>
              <a className="reading-related-link" href={other.path}>{other.title} <span aria-hidden="true">→</span></a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function EntryView({ entry, page }: { entry: PublicEntry; page: ReadingPageData }) {
  const poetry = entry.format === 'poetry'
  const extraEvidence = page.projection.evidence.filter(evidence => entry.evidenceIds.includes(evidence.id) && !entry.blocks.some(block => block.type === 'evidence' && block.evidenceId === evidence.id))
  return (
    <article className={`reading-article${poetry ? ' reading-article--poetry' : ''}`}>
      <nav className="reading-breadcrumbs" aria-label="Breadcrumb">
        <a href="/">Home</a><span aria-hidden="true">/</span>
        {entry.kind === 'investigation' ? <><a href="/investigations/">Investigations</a><span aria-hidden="true">/</span></> : null}
        <span aria-current="page">{entry.title}</span>
      </nav>
      <header className="reading-entry-header">
        <p className="reading-kicker">{poetry ? 'Poetry' : entry.kind}{page.fixture ? ' · synthetic fixture' : ''}</p>
        <h1 id="reading-title">{entry.title}</h1>
        <p className="reading-summary">{entry.summary}</p>
        <dl className="reading-metadata">
          <div><dt>{page.fixture ? 'Fixture revision date' : 'Created'}</dt><dd><time dateTime={entry.createdAt ?? undefined}>{dateLabel(entry.createdAt)}</time></dd></div>
          {entry.updatedAt !== entry.createdAt ? <div><dt>Updated</dt><dd><time dateTime={entry.updatedAt ?? undefined}>{dateLabel(entry.updatedAt)}</time></dd></div> : null}
          <div><dt>Revision</dt><dd>{entry.revision}</dd></div>
        </dl>
        {!poetry ? <section className="reading-contribution" id="contribution" aria-labelledby="reading-contribution-title">
          <h2 id="reading-contribution-title">Contribution and scope</h2>
          <p>{entry.contribution}</p>
        </section> : null}
      </header>
      <nav className="reading-contents" aria-label="On this page">
        <h2>In this reading</h2>
        <ol>
          {!poetry ? <li><a href="#contribution">Contribution and scope</a></li> : null}
          {entry.blocks.map((block, index) => <li key={block.id}><a href={`#${blockAnchor(block, entry)}`}>{blockLabel(block, index, page.projection)}</a></li>)}
          {!poetry && extraEvidence.length ? <li><a href="#evidence">Evidence and provenance</a></li> : null}
          {page.projection.relationships.some(item => item.fromId === entry.id || item.toId === entry.id) ? <li><a href="#connections">Explained connections</a></li> : null}
        </ol>
      </nav>
      <div className="reading-body">
        {entry.blocks.map(block => <section className={`reading-block reading-block--${block.type}`} id={blockAnchor(block, entry)} key={block.id}><ContentBlock block={block} page={page} /></section>)}
      </div>
      {!poetry && extraEvidence.length ? <section id="evidence" className="reading-extra-evidence"><h2>Evidence and provenance</h2>{extraEvidence.map(evidence => <EvidenceDisclosure evidence={evidence} key={evidence.id} />)}</section> : null}
      <Connections entry={entry} projection={page.projection} />
      <p className="reading-back"><a href="/investigations/">← All investigations</a></p>
    </article>
  )
}

function Collection({ projection }: { projection: ReadingContext }) {
  const investigations = projection.entries.filter(entry => entry.kind === 'investigation')
  const patterns = projection.entries.filter(entry => entry.kind === 'pattern')
  return (
    <>
      <header className="reading-collection-header"><p className="reading-kicker">Seeing What Systems Miss</p><h1 id="reading-title">Investigations</h1><p className="reading-summary">Questions, evidence, contributions, and limits. Read the work directly, then follow a connection when its explanation is useful.</p></header>
      {investigations.length ? <ul className="reading-cards">{investigations.map(entry => <li key={entry.id}><p className="reading-kicker">Investigation</p><h2><a href={entry.path}>{entry.title}</a></h2><p>{entry.summary}</p></li>)}</ul> : <p className="reading-empty">No reviewed investigation has been selected for this reading collection yet. <a href="/#work">Existing work remains available on the home page.</a></p>}
      {patterns.length ? <section className="reading-patterns" aria-labelledby="reading-patterns-title"><p className="reading-kicker">Connected interpretation</p><h2 id="reading-patterns-title">Patterns to investigate</h2><ul>{patterns.map(entry => <li key={entry.id}><a href={entry.path}>{entry.title}</a><p>{entry.summary}</p></li>)}</ul></section> : null}
    </>
  )
}

export function ReadingPage({ page }: { page: ReadingPageData }) {
  const entry = page.kind === 'entry' ? page.entry : undefined
  let content: ReactNode
  if (page.kind === 'collection') content = <Collection projection={page.projection} />
  else if (entry) content = <EntryView entry={entry} page={page} />
  else content = <section className="reading-not-found"><p className="reading-kicker">404 · Page not found</p><h1 id="reading-title">This reading is not available.</h1><p>The address may have changed, or this page may not be selected for public reading.</p><p><a href="/investigations/">Browse investigations</a> or <a href="/">return home</a>.</p></section>
  return (
    <div className="reading-page">
      <a className="reading-skip" href="#reading-main">Skip to reading</a>
      <header className="reading-site-header"><a className="reading-wordmark" href="/">△ Producing Curiosity</a><nav aria-label="Primary navigation"><a href="/investigations/" aria-current={page.kind === 'collection' ? 'page' : undefined}>Investigations</a><a href="/#contact">Contact</a></nav></header>
      {page.fixture ? <aside className="reading-fixture" aria-label="Development fixture"><strong>Development fixture — not publication-approved content.</strong><p>This synthetic reading demonstrates templates and connections. It is not Sam’s manuscript, source evidence, or a measured project outcome. Fixtures are excluded from production builds.</p></aside> : null}
      <main id="reading-main" tabIndex={-1}>{content}</main>
      <footer className="reading-footer"><a href="/">Producing Curiosity home</a><span>Questions are connected. Their evidence remains distinct.</span><ExperimentNote /></footer>
    </div>
  )
}
