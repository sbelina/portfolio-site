import React from 'react'

/** A native disclosure keeps the build note readable without JavaScript. */
export function ExperimentNote() {
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
        <h2>Reveal the hidden work</h2>
        <p>Does retaining a simple process while revealing the work beneath it help visitors inspect what the overview leaves out? This process is illustrative, not case evidence. Its lines encode relationships, not measured duration.</p>
        <p>Technical observations: one reveal opens the extra steps in place; the original track remains visible; HTML and SVG contain the explanation without animation. Optional p5.js motion pauses offscreen and supports pause/reset and reduced motion. These are interface checks, not evidence of improved comprehension. Reader evaluation remains to be done.</p>
        <p><a href="/experiments/reveal-hidden-work/">Try the hidden-work experiment</a></p>
        <a href="https://github.com/sbelina/portfolio-site">Explore the source and development history</a>
      </div>
    </details>
  )
}
