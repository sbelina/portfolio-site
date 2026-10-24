import React from 'react'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { renderToString } from 'react-dom/server'
import { HiddenWorkPage } from '../src/experiments/hidden-work/HiddenWorkPage'
import { seoHead } from './seo'

/** Shared by production and isolated fixtures; never imports the private studio. */
export async function prerenderHiddenWork(output: string, fixture: boolean) {
  const template = await readFile(`${output}/hidden-work.html`, 'utf8')
  if (!template.includes('<!--experiment-html-->')) throw new Error('Experiment prerender marker missing')
  await mkdir(`${output}/experiments/reveal-hidden-work`, { recursive: true })
  const html = template.replace('<!--seo-head-->', () => seoHead({ title: 'Reveal the hidden work — Producing Curiosity', description: 'An illustrative interaction experiment: reveal the work beneath a simplified process. Read with or without animation.', route: '/experiments/reveal-hidden-work/', indexable: !fixture }))
    .replace('<!--experiment-html-->', () => renderToString(<HiddenWorkPage/>))
  await writeFile(`${output}/experiments/reveal-hidden-work/index.html`, html)
  await rm(`${output}/hidden-work.html`)
}
