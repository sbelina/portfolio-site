/** Executable W3 proposal examples only. Not imported by application/server code.
 * These pure decisions do not implement authentication, atomic Git writes,
 * protected previews, persistence, or publication authorization.
 */
export type ProposedSaveBase = { repository: string; contentId: string; revision: number | null; head: string }
export function proposedSavePrecondition(expected: ProposedSaveBase, actual: ProposedSaveBase) {
  return expected.repository === actual.repository && expected.contentId === actual.contentId &&
    expected.revision === actual.revision && expected.head === actual.head
}

export type ProposedPreviewGrant = {
  subject: string; repository: string; candidateDigest: string; expiresAt: number;
  capabilities: ('preview:page' | 'preview:data' | 'preview:asset')[]
}
export type ProposedPreviewRequest = {
  repository: string; candidateDigest: string; now: number;
  resource: 'page' | 'data' | 'asset'; method: string
}
/** grant means an already server-verified session grant, never client JSON. */
export function proposedPreviewDecision(grant: ProposedPreviewGrant | null, request: ProposedPreviewRequest) {
  const permitted = !!grant && grant.subject.length > 0 && grant.expiresAt > request.now &&
    grant.repository === request.repository && grant.candidateDigest === request.candidateDigest &&
    ['GET', 'HEAD'].includes(request.method) && grant.capabilities.includes(`preview:${request.resource}`)
  return { permitted, cacheControl: 'private, no-store', vary: 'Cookie, Authorization' } as const
}
