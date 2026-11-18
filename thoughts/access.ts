/**
 * Cloudflare Access verification. Access (configured in the Cloudflare dashboard) signs every
 * request it lets through; the Worker re-checks that signature so the archive stays closed even
 * if the Access policy or route is misconfigured. Hidden URLs and noindex are not protection.
 */

export type AccessConfig = { teamDomain: string; audience: string; ownerEmail: string }
type Jwk = JsonWebKey & { kid?: string }
type Claims = { aud?: string | string[]; email?: string; exp?: number; nbf?: number; iss?: string }

const base64UrlBytes = (value: string) => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0))
}
const decodeJson = <T>(value: string): T => JSON.parse(new TextDecoder().decode(base64UrlBytes(value))) as T

let cache: { team: string; keys: Jwk[]; fetched: number } | undefined

async function keysFor(team: string, fetcher: typeof fetch): Promise<Jwk[]> {
  if (cache && cache.team === team && Date.now() - cache.fetched < 10 * 60_000) return cache.keys
  const response = await fetcher(`https://${team}/cdn-cgi/access/certs`)
  if (!response.ok) throw new Error('Access keys unavailable')
  const { keys } = await response.json() as { keys: Jwk[] }
  cache = { team, keys, fetched: Date.now() }
  return keys
}

/** Returns the verified owner email, or undefined. Never throws on a bad token. */
export async function verifyAccess(token: string | null, config: AccessConfig, now = Date.now(), fetcher: typeof fetch = fetch): Promise<string | undefined> {
  if (!token || !config.teamDomain || !config.audience || !config.ownerEmail) return undefined
  const parts = token.split('.')
  if (parts.length !== 3) return undefined
  try {
    const header = decodeJson<{ alg?: string; kid?: string }>(parts[0])
    if (header.alg !== 'RS256') return undefined
    const claims = decodeJson<Claims>(parts[1])
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud]
    const seconds = Math.floor(now / 1000)
    if (!audiences.includes(config.audience)) return undefined
    if (!claims.exp || claims.exp < seconds || (claims.nbf && claims.nbf > seconds + 60)) return undefined
    if (claims.iss && claims.iss !== `https://${config.teamDomain}`) return undefined
    if (claims.email?.toLowerCase() !== config.ownerEmail.toLowerCase()) return undefined
    const keys = await keysFor(config.teamDomain, fetcher)
    const jwk = keys.find(key => key.kid === header.kid) ?? (keys.length === 1 ? keys[0] : undefined)
    if (!jwk) return undefined
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify'])
    const valid = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, base64UrlBytes(parts[2]), new TextEncoder().encode(`${parts[0]}.${parts[1]}`))
    return valid ? claims.email.toLowerCase() : undefined
  } catch {
    return undefined
  }
}

export const resetAccessCache = () => { cache = undefined }
