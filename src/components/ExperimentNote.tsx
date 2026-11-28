import { publicPath } from '../public-path'
import React from 'react'
import { inquirySpacePath, inquirySpaceTitle } from '../inquiry-space/paths'

/** A native disclosure keeps the build note readable without JavaScript. */
export function ExperimentNote({ atlasProof = false, inquirySpace = false }: { atlasProof?: boolean; inquirySpace?: boolean } = {}) {
  return (
    <details className="experiment-note">
      <summary><span className="experiment-note__asterisk" aria-hidden="true">*</span><span>About this experiment</span></summary>
      <div className="experiment-note__body">
        <h2>The idea</h2>
        <p>A portfolio for experimentation, connected ideas and the perspective of its creator, Sami Belina. The website is part of the inquiry.</p>
        <h2>The working hypothesis</h2>
        <p>If a multidisciplinary approach is applied to website development, and the creator understands the language and methods being combined, can prompting a large language model produce new forms of web experience and communication? Every page stays readable by keyboard, without animation and without JavaScript.</p>
        <p className="experiment-note__status">None of the experiments here has been evaluated with readers yet, so whether they help understanding is an open question.</p>
        <h2>The process</h2>
        <p>My writing, research and observations inform the design. Agents suggest structures and connections; I review their interpretation. We build small examples, inspect them, record sources and uncertainties, and revise.</p>
        <h2>The implementation</h2>
        <p>React, TypeScript and Vite on a Cloudflare Worker, developed with LLM assistance. Content is versioned and published only after my approval. Automated checks cover the technical side; human reading and accessibility review continue.</p>
        <p>Earlier editions are retired from public view and kept privately. The asterisk mark is a placeholder.</p>
        <p>With your agreement, the site counts a few anonymous actions, such as pages and interactive pieces used. It keeps no cookies, identifiers or IP addresses, and honours Do Not Track and Global Privacy Control. Cloudflare Web Analytics counts visits and countries without cookies. <a href={publicPath('/about/#counting')}>What this site counts</a></p>
        <h2>The experiments</h2>
        <ul className="experiment-note__list">
          <li><a href={publicPath('/lab/atlas/')}>Atlas of Inquiry*</a>. Does an inspectable geography add useful understanding beyond the same material as a text index? Six invented investigations, placed by an explicit rubric.</li>
          <li><a href={publicPath(inquirySpacePath)}>{inquirySpaceTitle}*</a>: invented fragments that invite a question before an explanation.</li>
          <li><a href={publicPath('/lab/edge-case/')}>Edge Case*</a>: a prototype game about noticing, testing and revising a rule. Not yet playable with a screen reader alone.</li>
          <li><a href={publicPath('/experiments/reveal-hidden-work/')}>Reveal the hidden work</a>: a simple process that opens to show the work beneath it. Illustrative.</li>
        </ul>
        <p>The asterisk marks an experiment. <a href={publicPath('/lab/')}>The Observatory</a> lists them all.</p>
        {atlasProof ? <p>This demonstration keeps semantic proximity, explained relationships and reading order distinct. Every case and source passage is invented.</p> : null}
        {inquirySpace ? <>
          <h2>Curiosity before explanation</h2>
          <p>Can a fragment invite a useful question before it becomes a finished explanation? This illustration uses invented writing and an authored pairing; resonance between fragments is an interpretation.</p>
        </> : null}
        <a href="https://github.com/sbelina/portfolio-site">Explore the source and development history</a>
      </div>
    </details>
  )
}
