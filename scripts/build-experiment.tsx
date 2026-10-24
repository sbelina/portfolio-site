import React from 'react'
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import { renderToString } from 'react-dom/server'
import { HiddenWorkPage } from '../src/experiments/hidden-work/HiddenWorkPage'
import { ExperimentNote } from '../src/components/ExperimentNote'

const template = await readFile('dist/hidden-work.html', 'utf8')
if (!template.includes('<!--experiment-html-->')) throw new Error('Experiment prerender marker missing')
await mkdir('dist/experiments/reveal-hidden-work', { recursive: true })
await writeFile('dist/experiments/reveal-hidden-work/index.html', template.replace('<!--experiment-html-->', () => renderToString(<HiddenWorkPage/>)))
await rm('dist/hidden-work.html')
const home = await readFile('dist/index.html', 'utf8')
const fallback = renderToString(<footer className="site-footer static-experiment-footer"><ExperimentNote/></footer>)
if (!home.includes('<!--experiment-note-->')) throw new Error('Footer prerender marker missing')
await writeFile('dist/index.html', home.replace('<!--experiment-note-->', () => fallback))
await writeFile('dist/404.html', '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Page not found — Producing Curiosity</title><h1>Page not found</h1><p><a href="/">Return to Producing Curiosity</a></p></html>')
const forbidden = ['PRIVATE_DRAFT_CANARY', 'fixture-claims-handoff', 'fixture-assumed-observed', 'Synthetic connected manuscript', 'OWNER_PASSWORD_HASH', 'pc_studio_session']
async function audit(directory: string) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${item.name}`
    if (item.isSymbolicLink()) throw new Error('Public symlink forbidden')
    if (item.isDirectory()) await audit(file)
    else {
      if (/\.(?:map|tsx?|md|docx)$/.test(item.name)) throw new Error(`Source escaped to artifact: ${file}`)
      const bytes = await readFile(file)
      if (forbidden.some(text => bytes.includes(Buffer.from(text)))) throw new Error(`Private or unselected fixture escaped: ${file}`)
    }
  }
}
await audit('dist')
console.log('Experiment prerender and public artifact audit passed.')
