import React from 'react'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { renderToString } from 'react-dom/server'
import { EdgeCasePage } from '../src/play/edge-case/EdgeCasePage'
import { seoHead } from './seo'

export const edgeCaseRoute = '/lab/edge-case/'

/** Edge Case is a public observatory prototype: noindex, outside the sitemap, like the Atlas. */
export async function prerenderEdgeCase(output: string) {
  const template = `${output}/edge-case.html`
  const html = await readFile(template, 'utf8')
  if (!html.includes('<!--play-html-->')) throw new Error('Edge Case prerender marker missing')
  await mkdir(`${output}/lab/edge-case`, { recursive: true })
  await writeFile(`${output}/lab/edge-case/index.html`, html
    .replace('<!--seo-head-->', () => seoHead({ title: 'Edge Case* — prototype game · Producing Curiosity', description: 'Every rule has an exception. A prototype game about systems that repeat: watch, change what you can, find more than one way through.', route: edgeCaseRoute, indexable: false }))
    .replace('<!--play-html-->', () => renderToString(<EdgeCasePage/>)))
  await rm(template)
  return [edgeCaseRoute]
}
