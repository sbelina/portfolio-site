import { writeFileSync } from 'node:fs'
import { memoryD1 } from './d1-shim'
import { addThought, applySuggestion } from '../thoughts/store'
import { handle, type Env } from '../thoughts/worker'
const db = memoryD1()
const now = Date.now()
const seed: [string, number, string[], 'text' | 'web'][] = [
  ['Move the checkpoint earlier: problems found before payment are cheaper to fix #portfolio', 2, ['handoffs'], 'text'],
  ['Ask the AllSides team how they measure trust across readers #jobs', 40, ['trust', 'research'], 'text'],
  ['Asterisk: 4 cardinal arms for the crosshair, 4 diagonal for aperture blades #logo', 60 * 5, ['identity'], 'web'],
  ['Same shape, different gap — one picker, every case #portfolio #ideas', 60 * 26, ['interaction'], 'text'],
  ['Refresh Python before R. pandas first, then a GSS trust project', 60 * 50, ['learning', 'python'], 'text'],
  ['What way of looking at this makes it appear true?', 60 * 80, ['inquiry'], 'text'],
]
for (const [text, minutesAgo, ai, source] of seed) {
  const id = await addThought(db, { text, source, now: now - minutesAgo * 60_000 })
  await applySuggestion(db, id!, { title: text.split(/[:.—]/)[0].slice(0, 60), tags: ai }, 'ai')
}
const env = { DB: db, LOCAL_DEV: 'true', OWNER_EMAIL: 'owner@example.com', CSRF_SECRET: 'preview' } as unknown as Env
const ctx = { waitUntil() {} }
const list = await (await handle(new Request('http://127.0.0.1/'), env, ctx)).text()
writeFileSync('/home/claude/preview/thoughts-list.html', list)
const first = /href="\/t\/([0-9a-f-]{36})"/.exec(list)![1]
writeFileSync('/home/claude/preview/thoughts-edit.html', await (await handle(new Request(`http://127.0.0.1/t/${first}`), env, ctx)).text())
console.log('ok')
