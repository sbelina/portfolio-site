/**
 * Upload one deep dive to the private DEEP_DIVE store. The source file stays on your computer
 * (keep it under private/, which Git ignores). Nothing here is committed or published by the build.
 *
 *   npm run deep-dive:upload -- --slug claims-operations --title "When “complete” still generated work." \
 *     --file private/deep-dives/claims-operations.md [--summary "…"] [--local] [--config wrangler.jsonc]
 *
 * --local writes to the local development store instead of Cloudflare.
 */
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { marked } from 'marked'

const args = process.argv.slice(2)
const option = (name: string) => { const index = args.indexOf(`--${name}`); return index >= 0 ? args[index + 1] : undefined }
const slug = option('slug'), title = option('title'), file = option('file'), summary = option('summary')
const config = option('config') ?? 'wrangler.jsonc'
const where = args.includes('--local') ? '--local' : '--remote'
if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !title || !file) {
  console.error('Usage: --slug <kebab-case> --title <title> --file <markdown> [--summary <text>] [--local] [--config <file>]')
  process.exit(1)
}
if (!path.resolve(file).startsWith(path.resolve('private') + path.sep) && !args.includes('--allow-outside-private')) {
  console.error('Keep deep-dive sources under private/ (ignored by Git). --allow-outside-private is for test fixtures only.')
  process.exit(1)
}
const html = await marked.parse(await readFile(file, 'utf8'))
const wrangler = (...rest: string[]) => execFileSync('npx', ['wrangler', 'kv', 'key', ...rest, '--binding', 'DEEP_DIVE', where, '--config', config], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
// A fresh temporary folder per run, removed afterwards so no rendered private text is left behind.
const folder = await mkdtemp(path.join(tmpdir(), 'deep-dive-'))
try {
  const record = path.join(folder, 'case.json')
  await writeFile(record, JSON.stringify({ title, html }))
  wrangler('put', `case:${slug}`, '--path', record)
  let index: { slug: string; title: string; summary?: string }[] = []
  try { index = JSON.parse(wrangler('get', 'index', '--text')) } catch { index = [] }
  index = [...index.filter(item => item.slug !== slug), { slug, title, ...(summary ? { summary } : {}) }]
  const indexFile = path.join(folder, 'index.json')
  await writeFile(indexFile, JSON.stringify(index))
  wrangler('put', 'index', '--path', indexFile)
  console.log(`Uploaded deep dive "${slug}" (${where.slice(2)}).`)
} finally {
  await rm(folder, { recursive: true, force: true })
}
