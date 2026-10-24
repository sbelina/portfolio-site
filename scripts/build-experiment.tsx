import React from 'react'
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises'
import { renderToString } from 'react-dom/server'
import { HiddenWorkPage } from '../src/experiments/hidden-work/HiddenWorkPage'

/** Shared by production and isolated fixtures; never imports the private studio. */
export async function prerenderHiddenWork(output: string) {
  const template = await readFile(`${output}/hidden-work.html`, 'utf8')
  if (!template.includes('<!--experiment-html-->')) throw new Error('Experiment prerender marker missing')
  await mkdir(`${output}/experiments/reveal-hidden-work`, { recursive: true })
  await writeFile(`${output}/experiments/reveal-hidden-work/index.html`, template.replace('<!--experiment-html-->', () => renderToString(<HiddenWorkPage/>)))
  await rm(`${output}/hidden-work.html`)
}
