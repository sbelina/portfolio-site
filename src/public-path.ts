/** Keep archived documents inside their own URL namespace. External/hash links stay native. */
let serverBase: string | undefined

export function setPublicBase(base: string) {
  if (!/^\/(?:[a-z0-9-]+\/)*$/.test(base)) throw new Error('Public base must be a local directory path')
  serverBase = base
}

export function publicBase() { return serverBase ?? import.meta.env?.BASE_URL ?? '/' }

export function publicPath(url: string) {
  if (!url.startsWith('/') || url.startsWith('//')) return url
  return publicBase() + url.slice(1)
}
