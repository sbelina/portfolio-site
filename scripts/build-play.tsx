import React from 'react'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { renderToString } from 'react-dom/server'
import { EdgeCasePage } from '../src/play/edge-case/EdgeCasePage'
import { seoHead } from './seo'

export const edgeCaseRoute = '/play/edge-case/'

/**
 * Edge Case is an unpublished prototype. Only the explicit local fixtures build
 * includes it; production output must never contain the template or the page.
 */
export async function prerenderEdgeCase(output: string, fixture: boolean) {
  const template = `${output}/edge-case.html`
  if (!fixture) {
    if (existsSync(template)) throw new Error('Edge Case is unpublished and cannot enter production output')
    return []
  }
  const html = await readFile(template, 'utf8')
  if (!html.includes('<!--play-html-->')) throw new Error('Edge Case prerender marker missing')
  await mkdir(`${output}/play/edge-case`, { recursive: true })
  await writeFile(`${output}/play/edge-case/index.html`, html
    .replace('<!--seo-head-->', () => seoHead({ title: 'Edge Case (prototype) — Producing Curiosity', description: 'Every rule has an exception. An unpublished prototype game about systems that repeat: watch, change what you can, find more than one way through.', route: edgeCaseRoute, indexable: false }))
    .replace('<!--play-html-->', () => renderToString(<EdgeCasePage/>)))
  await rm(template)
  return [edgeCaseRoute]
}
