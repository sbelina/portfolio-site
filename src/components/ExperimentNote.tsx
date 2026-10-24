import React from 'react'

export function ExperimentNote() {
  return <details className="experiment-note">
    <summary><span className="experiment-note__asterisk" aria-hidden="true">*</span> About this experiment</summary>
    <div className="experiment-note__body">
      <h2>The idea</h2>
      <p>A portfolio for experimentation, connecting ideas, and sharing its creator’s perspective.</p>
      <h2>The working hypothesis</h2>
      <p>Can multidisciplinary methods, deliberately translated into implementation instructions through LLM prompting, produce a different kind of website? This remains an open question, not a demonstrated finding.</p>
      <h2>The process</h2>
      <p>My writing, research, and observations inform the design; agents suggest structures and connections; I review their interpretation. We build small examples and record what actually happens.</p>
      <h2>The implementation</h2>
      <p>This public release uses React, TypeScript, Vite, semantic HTML, SVG, and an optional p5.js motion layer. The portfolio and introduction remain available. New reading templates and a private writing trial are separate development work; a hosted writing and publishing workflow is not implemented here.</p>
      <h2>Reveal the hidden work</h2>
      <p>Question: does retaining a simple process while revealing the work beneath it help visitors inspect what the overview leaves out? The process is illustrative, not case evidence. Its lines encode relationships, not measured duration.</p>
      <p>Technical observations: one reveal opens the extra steps in place; the original track remains visible; HTML and SVG contain the explanation without animation. Keyboard, emulated touch, reduced-motion, and offscreen-pause checks are recorded in the source. These are interface checks, not evidence of improved comprehension. Reader evaluation remains to be done.</p>
      <p><a href="/experiments/reveal-hidden-work/">Try the hidden-work experiment</a> · <a href="https://github.com/sbelina/portfolio-site">Source and development history</a></p>
    </div>
  </details>
}
