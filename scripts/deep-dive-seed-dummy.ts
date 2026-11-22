/**
 * Loads the three DUMMY deep dives (structure and placeholders only) into the LOCAL test store,
 * for the demo and the tests. Never touches Cloudflare. See docs/codex/DEEP-DIVE.md.
 */
import { execFileSync } from 'node:child_process'

const dummies = [
  ['claims-operations', 'Claims operations: when “complete” still generated work', 'Case 01 · Claims operations', 'Dummy: three parts, Test, Show and Enable.'],
  ['trust-research', 'Agreement is not trust', 'Case 02 · Trust research', 'Dummy: one part.'],
  ['ai-challenge', 'From 38 proposals to 8 shared challenges', 'Case 03 · AI challenge', 'Dummy: one part.'],
] as const
// Start the hub from an empty list so the demo shows exactly these three, in order.
try { execFileSync('npx', ['wrangler', 'kv', 'key', 'delete', 'index', '--binding', 'DEEP_DIVE', '--local', '--config', 'wrangler.deepdive-test.jsonc'], { stdio: 'ignore' }) } catch { /* nothing to clear */ }
for (const [slug, title, kicker, summary] of dummies) {
  execFileSync('npx', ['tsx', 'scripts/deep-dive-upload.ts', '--slug', slug, '--title', title, '--kicker', kicker, '--summary', summary,
    '--file', `tests/fixtures/deep-dives/${slug}.md`, '--allow-outside-private', '--local', '--config', 'wrangler.deepdive-test.jsonc'], { stdio: 'inherit' })
}
