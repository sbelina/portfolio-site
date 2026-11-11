import React from 'react'
import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import path from 'node:path'
import { renderToString } from 'react-dom/server'
import { EdgeCasePage } from '../src/play/edge-case/EdgeCasePage'

/**
 * Private test page for the unpublished Edge Case prototype: one self-contained
 * HTML file (JS and CSS inlined) for a private claude.ai artifact. Not part of
 * the site build; output goes to dist-artifact/ (ignored by git).
 * Usage: npx tsx --tsconfig tsconfig.app.json scripts/build-edge-case-artifact.tsx
 */
const out = path.resolve('dist-artifact')
const work = path.join(out, 'bundle')
await build({
  configFile: false,
  logLevel: 'warn',
  plugins: [react()],
  build: {
    outDir: work, emptyOutDir: true, sourcemap: false, cssCodeSplit: false, copyPublicDir: false,
    rolldownOptions: { input: path.resolve('src/play/edge-case/client.tsx'), output: { format: 'es', entryFileNames: 'edge-case.js', assetFileNames: 'edge-case[extname]' } },
  },
})
const files = await readdir(work)
if (files.filter(file => file.endsWith('.js')).length !== 1) throw new Error(`Expected one script, got ${files.join(', ')}`)
const js = (await readFile(path.join(work, 'edge-case.js'), 'utf8')).replaceAll('</script', '<\\/script')
const css = (await readFile(path.join(work, 'edge-case.css'), 'utf8')).replaceAll('</style', '<\\/style')
const markup = renderToString(<EdgeCasePage homeHref="https://producingcuriosity.com/"/>)
// The artifact skeleton supplies doctype, head and body; the page supplies title, style and content.
const html = `<title>Edge Case</title>
<meta name="robots" content="noindex">
<style>${css}</style>
<div id="root">${markup}</div>
<script type="module">${js}</script>
`
await mkdir(out, { recursive: true })
await writeFile(path.join(out, 'edge-case.html'), html)
console.log(`Wrote ${path.join(out, 'edge-case.html')} (${Math.round(html.length / 1024)} KB)`)
