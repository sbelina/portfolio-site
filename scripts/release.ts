/**
 * Trusted release loader for approved public content (owner decision, 23 November 2026).
 *
 * How approval works:
 * 1. `npm run release:prepare` digests every record in content/release/cases.ts and writes
 *    content/public-release.json: a manifest of exact record revisions and digests, and an approval
 *    of the manifest's digest. Preparing a release is not approval.
 * 2. The approval is authenticated by the owner's GitHub account merging the pull request that adds
 *    that file to `main`. Only the owner can merge, and the pull request shows the exact records.
 *    An agent may prepare the file but must never merge it without the owner's explicit instruction.
 * 3. Every build re-digests the records. Any change to an approved record, however small, stops the
 *    build until a new release is prepared and approved the same way.
 */
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { z } from 'zod'
import { approvalSchema, manifestSchema, type ContentStore, type PublicProjection } from '../src/content/model'
import { digestRecord, validateCandidateProjection } from '../src/content/projection'

export const releaseFile = 'content/public-release.json'
const releaseSchema = z.discriminatedUnion('status', [
  z.strictObject({ schemaVersion: z.literal(1), status: z.literal('no-approved-content'), note: z.string() }),
  z.strictObject({ schemaVersion: z.literal(1), status: z.literal('approved'), note: z.string(), manifest: manifestSchema, approval: approvalSchema }),
])

async function store(): Promise<ContentStore> {
  return (await import('../content/release/cases')).releaseStore
}

/** Load the approved projection, or an empty one when nothing is approved. Throws on any mismatch. */
export async function loadApprovedProjection(): Promise<PublicProjection> {
  const release = releaseSchema.parse(JSON.parse(await readFile(releaseFile, 'utf8')))
  if (release.status === 'no-approved-content') return { schemaVersion: 1, entries: [], relationships: [], evidence: [], assets: [], aliases: [] }
  if (digestRecord(release.manifest) !== release.approval.candidateDigest) throw new Error('The release manifest changed after approval')
  return validateCandidateProjection(await store(), release.manifest)
}

async function prepare() {
  const records = await store()
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  const contentRevision = execFileSync('git', ['log', '-1', '--format=%H', '--', 'content/release/cases.ts', 'content/candidates/claims-operations.ts'], { encoding: 'utf8' }).trim() || head
  const refs = <T extends { id: string; revision: number }>(items: T[]) => items.map(item => ({ id: item.id, revision: item.revision, digest: digestRecord(item) }))
  const manifest = manifestSchema.parse({
    schemaVersion: 1, releaseId: randomUUID(), applicationRevision: head, contentRevision,
    entries: refs(records.entries), relationships: refs(records.relationships), evidence: refs(records.evidence), assets: refs(records.assets), aliases: refs(records.aliases),
  })
  validateCandidateProjection(records, manifest)
  const release = {
    schemaVersion: 1, status: 'approved',
    note: 'Prepared for owner review. This approval takes effect only when the owner merges the pull request that adds it to main; an agent never merges it on its own. Any change to an approved record stops the build until a new release is prepared and approved.',
    manifest,
    approval: { candidateDigest: digestRecord(manifest), approvedBy: 'Sami Belina, by merging the pull request that adds this release to main', approvedAt: new Date().toISOString() },
  }
  await writeFile(releaseFile, `${JSON.stringify(release, null, 2)}\n`)
  console.log(`Prepared release ${manifest.releaseId}: ${manifest.entries.length} entries, ${manifest.evidence.length} evidence records. Not approved until the owner merges it.`)
}

if (process.argv[1]?.endsWith('release.ts') && process.argv.includes('--prepare')) await prepare()
