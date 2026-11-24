import { publicPath } from '../public-path'
import React from 'react'
import { inquirySpacePath, inquirySpaceTitle } from '../inquiry-space/paths'

/** A native disclosure keeps the build note readable without JavaScript. */
export function ExperimentNote({ atlasProof = false, inquirySpace = false }: { atlasProof?: boolean; inquirySpace?: boolean } = {}) {
  return (
    <details className="experiment-note">
      <summary><span className="experiment-note__asterisk" aria-hidden="true">*</span><span>About this experiment</span></summary>
      <div className="experiment-note__body">
        <p className="experiment-note__intro">A portfolio for experimentation, connected ideas, and the perspective of its creator, Sami Belina. The website itself is part of the inquiry.</p>
        <h2>The idea</h2>
        <p>A portfolio for experimentation, connecting ideas, and sharing its creator’s perspective. The website itself is part of that inquiry.</p>
        <h2>The working hypothesis</h2>
        <p>If a multidisciplinary approach is applied to website development, and the creator understands the language and methods being combined, can prompting a large language model produce new forms of web experience and communication?</p>
        <p>The site tests the boundaries of what a website is expected to be and what it can become, while keeping its meaning accessible through reading, keyboard use and static alternatives. The question is whether that approach produces a meaningfully different experience from prompting for familiar page layouts. That remains an open question, not a demonstrated result.</p>
        <h2>The process</h2>
        <p>My writing, research, and observations inform the design; agents suggest structures and connections; I review their interpretation. We build small examples, inspect behavior, record sources and uncertainties, and revise.</p>
        <h2>The implementation</h2>
        <p>Built with React, TypeScript, and Vite for a Cloudflare Worker, with LLM-assisted development. This version includes reading templates, versioned content contracts, and explained connections. An isolated local writing trial has been exercised with synthetic manuscripts; hosted CMS integration and publication of new writing remain unimplemented. Original manuscripts stay separate from suggested edits. Automated checks provide technical evidence; human reading and accessibility review are part of the continuing work.</p>
        <p>The interactive reading experiments ask whether making assumptions, evidence, and relationships inspectable helps visitors understand how I investigate systems. We record interface observations as the site evolves. Improved comprehension has not been established; technical checks are not a substitute for evaluating it with readers.</p>
        <p>Earlier editions were retired from public view in November 2026 and are preserved privately. Archiving an experience does not establish that its hypotheses or interpretations have been validated.</p>
        <p>The current design follows Test. Show. Enable., with paper and observatory reading surfaces, native navigation, and inspectable sources and limitations. The asterisk identity is being developed; the typographic mark is temporary. New design and agent review do not approve case writing or establish improved comprehension.</p>
        <p>The current introduction is a short investigation in three steps (notice, test, show), drawn in the deck's palette, with one deliberate action for each step and a separate Dive in action; skip and replay remain available. Optional questions beneath the practice moves and nested illustration notes test whether supporting context can be inspected in place while the main account stays readable. Reader comprehension has not been evaluated.</p>
        <p>Since November 2026 the live site counts a few anonymous actions (which pages and interactive pieces are used) to learn what produces curiosity, only for visitors who agree. No cookies, identifiers or IP addresses are kept; Do Not Track and Global Privacy Control are honoured. Cloudflare Web Analytics separately counts visits and countries for every visitor, without cookies. <a href={publicPath('/about/#counting')}>What this site counts</a>. Counts show use, not understanding.</p>
        <h2>Atlas of Inquiry*</h2>
        <p>Does an inspectable geography add useful understanding beyond the same material as a text index? That remains an open question.</p>
        <p>An optional Atlas of Inquiry experiment presents six invented investigations through an explicit classification rubric, an approximate spatial layout, explained relationships, and an equivalent text account. Inputs and fitting error are inspectable. Those calculations do not validate the classification or establish improved understanding; reader evaluation remains to be conducted.</p>
        <p><a href={publicPath('/lab/atlas/')}>Explore the Atlas of Inquiry — experimental</a>. The asterisk marks an experiment.</p>
        <p><a href={publicPath(inquirySpacePath)}>{inquirySpaceTitle}* — curiosity before explanation</a> offers three invented fragments and one authored pairing. Its questions remain open; reader insight and comprehension have not been evaluated.</p>
        <p><a href={publicPath('/lab/edge-case/')}>Edge Case* — a prototype game</a> asks whether play can reward noticing, testing and revising a rule. Its mechanics are specified and covered by automated tests; it has not been tested with players and is not yet playable with a screen reader alone. <a href={publicPath('/lab/')}>The Observatory</a> lists every experiment.</p>
        {atlasProof ? <p>This demonstration keeps semantic proximity, separately explained relationships and editorial reading order distinct. Every case and source passage is invented; none represents a finding from Sami’s investigations.</p> : null}
        {inquirySpace ? <>
          <h2>Curiosity before explanation</h2>
          <p>Can a fragment invite a useful question before it becomes a finished explanation? This illustration uses invented writing and an authored pairing. Resonance is an interpretation, not evidence of a shared cause.</p>
          <p>Fragments use the existing content identities, review and approval boundaries. Technical checks do not establish insight or improved understanding. The real seed works and proposed exhibits remain unapproved.</p>
        </> : null}
        <h2>Reveal the hidden work</h2>
        <p>Does retaining a simple process while revealing the work beneath it help visitors inspect what the overview leaves out? This process is illustrative, not case evidence. Its lines encode relationships, not measured duration.</p>
        <p>Technical observations: one reveal opens the extra steps in place; the original track remains visible; HTML and SVG contain the explanation without animation. Optional p5.js motion pauses offscreen and supports pause/reset and reduced motion. These are interface checks, not evidence of improved comprehension. Reader evaluation remains to be done.</p>
        <p><a href={publicPath("/experiments/reveal-hidden-work/")}>Try the hidden-work experiment</a></p>
        <a href="https://github.com/sbelina/portfolio-site">Explore the source and development history</a>
      </div>
    </details>
  )
}
