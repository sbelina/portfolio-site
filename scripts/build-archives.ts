import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { z } from 'zod'
import catalog from '../content/build-archive.json' with { type: 'json' }
import { auditPublic } from './audit-public'

const files = z.record(z.string().regex(/^(?!.*(?:\.\.|\\))[a-zA-Z0-9_./-]+$/), z.strictObject({ sha256: z.string().regex(/^[a-f0-9]{64}$/), bytes: z.number().int().nonnegative() }))
const captureSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-f0-9]{7}$/),
  sourceCommit: z.string().regex(/^[a-f0-9]{40}$/), sourceTree: z.string().regex(/^[a-f0-9]{40}$/), capturedAt: z.iso.datetime({ offset: true }),
  source: z.literal('reviewed-production-build'), deploymentStatus: z.literal('not-observed-live-at-capture'),
  originalFiles: files, reviewFiles: files, reviewPrefix: z.string(), reviewAdapterCommit: z.string().regex(/^[a-f0-9]{40}$/),
  reviewNote: z.string().min(1), homeAnchors: z.array(z.string().regex(/^[a-zA-Z0-9_-]+$/)),
})

/** Verify original and replay artifacts independently before copying any historical bytes. */
export async function verifyBuildArchive(directory: string) {
  const capture = captureSchema.parse(JSON.parse(await readFile(path.join(directory, 'capture.json'), 'utf8')))
  if (capture.reviewPrefix !== `/builds/${capture.id}/`) throw new Error('Archive prefix does not match identity')
  for (const kind of ['original', 'review'] as const) {
    const expected = kind === 'original' ? capture.originalFiles : capture.reviewFiles
    const found: string[] = []
    async function walk(folder: string) {
      for (const item of await readdir(folder, { withFileTypes: true })) {
        if (item.isSymbolicLink()) throw new Error('Archive symlinks are forbidden')
        const file = path.join(folder, item.name)
        if (item.isDirectory()) await walk(file)
        else found.push(path.relative(path.join(directory, kind), file).split(path.sep).join('/'))
      }
    }
    await walk(path.join(directory, kind))
    if (found.sort().join('\n') !== Object.keys(expected).sort().join('\n')) throw new Error('Archive inventory changed')
    for (const file of found) {
      const bytes = await readFile(path.join(directory, kind, file))
      if (bytes.length !== expected[file].bytes || createHash('sha256').update(bytes).digest('hex') !== expected[file].sha256) throw new Error('Archived artifact checksum mismatch')
    }
    await auditPublic(path.join(directory, kind))
  }
  return capture
}

export async function mountBuildArchive(output: string) {
  const source = path.resolve('build-archives', catalog.id)
  const capture = await verifyBuildArchive(source)
  if (catalog.reviewPath !== capture.reviewPrefix || catalog.sourceCommit !== capture.sourceCommit || JSON.stringify(catalog.homeAnchors) !== JSON.stringify(capture.homeAnchors)) throw new Error('Archive catalog disagrees with capture')
  const target = path.join(output, 'builds', capture.id)
  await mkdir(path.dirname(target), { recursive: true })
  await cp(path.join(source, 'review'), target, { recursive: true, errorOnExist: true, force: false })
  await writeFile(path.join(target, 'capture.json'), JSON.stringify(capture))
  const headers = await readFile(path.join(output, '_headers'), 'utf8')
  await writeFile(path.join(output, '_headers'), `${headers}\n/builds/*\n  X-Robots-Tag: noindex\n`)
  const manifest = JSON.parse(await readFile(path.join(target, 'route-manifest.json'), 'utf8'))
  if (manifest.fixture || !manifest.routes.every((route: string) => route.startsWith(capture.reviewPrefix))) throw new Error('Invalid archive routes')
  return manifest.routes as string[]
}
