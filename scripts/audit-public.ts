import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const forbiddenPublicMarkers = ['PUBLIC_SAFE_READING_FIXTURE_9b11', 'PRIVATE_DRAFT_CANARY_8b72', 'fixture-claims-handoff', 'fixture-delivered-not-complete', 'fixture-verse-spacing', 'fixture-assumed-observed', 'SYNTHETIC_AO_FIXTURE_4c2b', 'A test line—nothing borrowed.', 'synthetic-test-approver-not-an-owner-approval', 'synthetic-trial-password-not-an-owner-credential', 'Synthetic connected manuscript', 'Synthetic verse import', 'OWNER_PASSWORD_HASH', 'pc_studio_session']
export async function auditPublic(directory: string) {
  const files: string[] = []
  async function walk(folder: string) {
    for (const item of await readdir(folder, { withFileTypes: true })) {
      const file = path.join(folder, item.name)
      if (item.isSymbolicLink()) throw new Error('Public output must not contain symlinks')
      if (item.isDirectory()) await walk(file)
      else files.push(file)
    }
  }
  await walk(directory)
  for (const file of files) {
    if (/\.(?:map|tsx?|md)$/.test(file)) throw new Error('Source or sourcemap escaped into public output')
    const bytes = await readFile(file)
    if (forbiddenPublicMarkers.some(marker => bytes.includes(Buffer.from(marker)))) throw new Error('Non-production fixture or unselected draft found in public output')
  }
  const manifest = JSON.parse(await readFile(path.join(directory, 'route-manifest.json'), 'utf8'))
  if (manifest.fixture !== false) throw new Error('A fixture artifact cannot be used as production output')
  console.log(`Public artifact audit passed (${files.length} files, no fixture or private canaries).`)
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await auditPublic(path.resolve('dist'))
