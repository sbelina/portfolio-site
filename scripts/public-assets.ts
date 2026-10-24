import { createHash } from 'node:crypto'
import type { PublicProjection } from '../src/content/model'

/** Byte verification is separate from metadata/candidate approval. Originals never enter here. */
export function verifyPublicAssets(projection: PublicProjection, read: (id: string) => Buffer) {
  return projection.assets.map(asset => {
    const bytes = read(asset.id)
    if (createHash('sha256').update(bytes).digest('hex') !== asset.checksum) throw new Error('Selected public derivative bytes do not match the approved checksum')
    return { url: asset.url, bytes }
  })
}
