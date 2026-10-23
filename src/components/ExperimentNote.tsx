import React from 'react'

/** A native disclosure keeps the build note readable without JavaScript. */
export function ExperimentNote() {
  return (
    <details className="experiment-note">
      <summary><span className="experiment-note__asterisk" aria-hidden="true">*</span><span>About this experiment</span></summary>
      <div className="experiment-note__body">
        <p className="experiment-note__intro">A portfolio for experimentation, connected ideas, and the perspective of its creator, Sam Belina. The website itself is part of the inquiry.</p>
        <h2>The idea</h2>
        <p>What happens when a website is approached through research, systems thinking, writing, design, accessibility, and engineering together?</p>
        <h2>The working hypothesis</h2>
        <p>Combining those disciplines with an understanding of the language used to describe their methods can help a creator guide a large language model toward a coherent, accessible website that expresses connected ideas and a personal perspective.</p>
        <p>The question is whether that approach produces a meaningfully different experience from prompting for familiar page layouts. That remains an open question, not a demonstrated result.</p>
        <h2>The process</h2>
        <p>Frame a question, translate methods into instructions and constraints, build a small example, inspect its behavior, and revise. Sources, corrections, human judgment, and the limits of each experiment belong in the record.</p>
        <h2>The implementation</h2>
        <p>Built with React, TypeScript, and Vite for a Cloudflare Worker, with LLM-assisted development. This version includes reading templates, versioned content contracts, and explained connections. Private authoring and authenticated publishing are still being developed. Automated checks provide technical evidence; human reading and accessibility review are part of the continuing work.</p>
        <a href="https://github.com/sbelina/portfolio-site">Explore the source and development history</a>
      </div>
    </details>
  )
}
