import React from 'react'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import { PatternShiftPage } from '../src/play/pattern-shift/PatternShiftPage'
import { seoHead } from './seo'

export const patternShiftRoute = '/play/pattern-shift/'

/**
 * Unpublished prototype. Only the explicit local fixtures build includes it;
 * production output must never contain the template or the page.
 */
export async function prerenderPatternShift(output: string, fixture: boolean) {
  const template = `${output}/pattern-shift.html`
  if (!fixture) {
    if (existsSync(template)) throw new Error('Pattern Shift is unpublished and cannot enter production output')
    return []
  }
  const html = (await readFile(template, 'utf8'))
  if (!html.includes('<!--play-html-->')) throw new Error('Pattern Shift prerender marker missing')
  await mkdir(`${output}/play/pattern-shift`, { recursive: true })
  await writeFile(`${output}/play/pattern-shift/index.html`, html
    .replace('<!--seo-head-->', () => seoHead({ title: 'Pattern Shift (prototype) — Producing Curiosity', description: 'An unpublished prototype game about systems that repeat: watch, find what you can change, and make a way through.', route: patternShiftRoute, indexable: false }))
    .replace('<!--play-html-->', () => renderToString(<PatternShiftPage/>)))
  await rm(template)
  return [patternShiftRoute]
}
