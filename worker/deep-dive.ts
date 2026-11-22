/**
 * Password-protected deep dives (owner direction, 22 November 2026).
 *
 * Every case has a public version in the static site. A longer "deep dive" lives in private
 * Cloudflare KV storage, never in this public repository, and is served only here, after a
 * server-side password check. Until the owner creates the KV namespace and sets both secrets,
 * every /deep-dive/ URL answers "not open yet", so merging this code cannot expose anything.
 */
export interface KVLike { get(key: string): Promise<string | null> }
export interface DeepDiveEnv {
  ASSETS: { fetch(request: Request): Promise<Response> }
  DEEP_DIVE?: KVLike
  /** pbkdf2-sha256$<iterations>$<saltHex>$<hashHex>, from `npm run deep-dive:hash`. A secret, never a var in production. */
  DEEP_DIVE_PASSWORD_HASH?: string
  /** Random secret that signs sessions. Changing it signs everyone out. */
  DEEP_DIVE_SESSION_SECRET?: string
}

const cookieName = 'pc_deep_dive'
const sessionSeconds = 12 * 60 * 60
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const contactEmail = 'hello@sbelina.com'
const encoder = new TextEncoder()

const escapeHtml = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;')
const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('')
const fromHex = (text: string) => new Uint8Array((text.match(/../g) ?? []).map(pair => parseInt(pair, 16)))
function equal(a: string, b: string) {
  if (a.length !== b.length) return false
  let difference = 0
  for (let i = 0; i < a.length; i++) difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return difference === 0
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, iterationText, saltHex, hashHex] = stored.split('$')
  const iterations = Number(iterationText)
  if (scheme !== 'pbkdf2-sha256' || !Number.isInteger(iterations) || iterations < 10000 || iterations > 100000 || !saltHex || !hashHex) return false
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: fromHex(saltHex), iterations }, key, hashHex.length * 4)
  return equal(hex(bits), hashHex.toLowerCase())
}

async function sign(secret: string, message: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, encoder.encode(message)))
}
/** Sessions are bound to the current password hash: changing the password signs everyone out. */
const sessionMessage = (expires: number, passwordHash: string) => `deep-dive.v2.${expires}.${passwordHash}`
export async function sessionToken(secret: string, passwordHash: string, now = Date.now()) {
  const expires = now + sessionSeconds * 1000
  return `${expires}.${await sign(secret, sessionMessage(expires, passwordHash))}`
}
export async function validSession(secret: string, passwordHash: string, token: string | undefined, now = Date.now()) {
  if (!token) return false
  const [expiresText, signature] = token.split('.')
  const expires = Number(expiresText)
  if (!Number.isFinite(expires) || expires <= now || !signature) return false
  return equal(await sign(secret, sessionMessage(expires, passwordHash)), signature)
}
const readCookie = (request: Request) => (request.headers.get('Cookie') ?? '').split(';').map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1)
const local = (url: URL) => url.hostname === 'localhost' || url.hostname === '127.0.0.1'
const setCookie = (url: URL, value: string, maxAge: number) => `${cookieName}=${value}; HttpOnly; SameSite=Lax; Path=/deep-dive/; Max-Age=${maxAge}${local(url) ? '' : '; Secure'}`

/** Headers on every deep-dive response, including the login and "not open yet" pages. */
function guardedHeaders(extra: Record<string, string> = {}) {
  return new Headers({
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow, noarchive',
    'Referrer-Policy': 'same-origin',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; frame-ancestors 'none'; form-action 'self'; base-uri 'none'",
    ...extra,
  })
}

/** The public page shell (no private content) with the body and title filled in. */
async function page(env: DeepDiveEnv, request: Request, title: string, body: string, status = 200, extra: Record<string, string> = {}) {
  const shellResponse = await env.ASSETS.fetch(new Request(new URL('/deep-dive/_shell/', request.url)))
  const shell = shellResponse.ok ? await shellResponse.text() : '<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Deep dive</title></head><body><div data-deep-dive-body="">DEEP_DIVE_BODY</div></body></html>'
  const html = shell
    .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeHtml(title)} · Deep dive · Producing Curiosity</title>`)
    .replace('<div data-deep-dive-body="">DEEP_DIVE_BODY</div>', () => body)
  return new Response(request.method === 'HEAD' ? null : html, { status, headers: guardedHeaders(extra) })
}

const notOpen = () => `<p class="pc-kicker">Deep dive</p><h1>Deep dives are not open yet.</h1>
<p>Every investigation has a public version that answers four questions: what was the problem, how I knew, what I did, and what changed.</p>
<p><a href="/investigations/">Read the public investigations <span aria-hidden="true">→</span></a></p>
<p>To ask about a longer version, email <a href="mailto:${contactEmail}">${contactEmail}</a>.</p>`

function loginForm(next: string, failed: boolean) {
  return `<p class="pc-kicker">Deep dive · password required</p><h1>Open the deep dive</h1>
<p>The deep dive is the longer version of an investigation, with the process, working artifacts and sources in more detail. Every investigation’s public version stays open to everyone.</p>
${failed ? '<p class="deep-dive-error" role="alert">That password did not work. Check it and try again, or ask for access below.</p>' : ''}
<form class="deep-dive-login" method="post" action="/deep-dive/login">
  <input type="hidden" name="next" value="${escapeHtml(next)}">
  <label for="deep-dive-password">Password</label>
  <input id="deep-dive-password" name="password" type="password" autocomplete="current-password" required>
  <button type="submit">Open the deep dive</button>
</form>
<p>No password yet? <a href="mailto:${contactEmail}?subject=Deep%20dive%20access">Request access by email</a>.</p>`
}

const signOut = `<form class="deep-dive-signout" method="post" action="/deep-dive/logout"><button type="submit">Sign out of deep dives</button></form>`
const safeNext = (value: string | null) => value && /^\/deep-dive\/(?:[a-z0-9-]+\/)?$/.test(value) ? value : '/deep-dive/'

type CaseRecord = { title: string; html: string }
type IndexRecord = { slug: string; title: string; summary?: string }[]
async function readJson<T>(kv: KVLike, key: string): Promise<T | null> {
  const raw = await kv.get(key)
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}

export async function handleDeepDive(request: Request, env: DeepDiveEnv): Promise<Response> {
  const url = new URL(request.url)
  const path = url.pathname
  if (path === '/deep-dive') return Response.redirect(new URL('/deep-dive/', url).toString(), 308)
  const configured = Boolean(env.DEEP_DIVE && env.DEEP_DIVE_PASSWORD_HASH && env.DEEP_DIVE_SESSION_SECRET)
  if (!configured) return page(env, request, 'Not open yet', notOpen())
  const kv = env.DEEP_DIVE!, secret = env.DEEP_DIVE_SESSION_SECRET!, passwordHash = env.DEEP_DIVE_PASSWORD_HASH!

  if (path === '/deep-dive/login') {
    if (request.method !== 'POST') return Response.redirect(new URL('/deep-dive/', url).toString(), 303)
    const origin = request.headers.get('Origin')
    if (origin && origin !== url.origin) return page(env, request, 'Not allowed', '<h1>That request was not allowed.</h1>', 403)
    const type = request.headers.get('Content-Type') ?? ''
    const length = Number(request.headers.get('Content-Length') ?? '0')
    if (!type.startsWith('application/x-www-form-urlencoded') || length > 4096) return page(env, request, 'Not allowed', '<h1>That request was not allowed.</h1>', 400)
    const form = await request.formData()
    const next = safeNext(String(form.get('next') ?? ''))
    const password = String(form.get('password') ?? '')
    if (password.length <= 256 && await verifyPassword(password, passwordHash)) {
      return new Response(null, { status: 303, headers: guardedHeaders({ Location: next, 'Set-Cookie': setCookie(url, await sessionToken(secret, passwordHash), sessionSeconds) }) })
    }
    await new Promise(resolve => setTimeout(resolve, 750)) // slow repeated guessing; add a Cloudflare rate-limiting rule in production
    return page(env, request, 'Password required', loginForm(next, true), 401)
  }
  if (path === '/deep-dive/logout') {
    if (request.method !== 'POST') return Response.redirect(new URL('/deep-dive/', url).toString(), 303)
    return new Response(null, { status: 303, headers: guardedHeaders({ Location: '/deep-dive/', 'Set-Cookie': setCookie(url, '', 0) }) })
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') return page(env, request, 'Not allowed', '<h1>That request was not allowed.</h1>', 405, { Allow: 'GET, HEAD' })

  const slug = path === '/deep-dive/' ? '' : path.match(/^\/deep-dive\/([a-z0-9-]+)\/$/)?.[1]
  if (slug === undefined || (slug && !slugPattern.test(slug))) return page(env, request, 'Not found', '<h1>This deep dive is not available.</h1><p><a href="/deep-dive/">All deep dives</a></p>', 404)
  if (!(await validSession(secret, passwordHash, readCookie(request)))) return page(env, request, 'Password required', loginForm(path, false), 401)

  if (!slug) {
    const index = (await readJson<IndexRecord>(kv, 'index')) ?? []
    const list = index.length ? `<ul class="deep-dive-index">${index.map(item => `<li><a href="/deep-dive/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a>${item.summary ? `<p>${escapeHtml(item.summary)}</p>` : ''}</li>`).join('')}</ul>` : '<p>No deep dives have been uploaded yet.</p>'
    return page(env, request, 'All deep dives', `<p class="pc-kicker">Deep dive</p><h1>Deep dives</h1><p>Longer versions of the public investigations.</p>${list}${signOut}`)
  }
  const record = await readJson<CaseRecord>(kv, `case:${slug}`)
  if (!record) return page(env, request, 'Not found', '<h1>This deep dive is not available.</h1><p><a href="/deep-dive/">All deep dives</a></p>', 404)
  return page(env, request, record.title, `<p class="pc-kicker">Deep dive · the longer version</p><h1>${escapeHtml(record.title)}</h1>
<p class="deep-dive-public"><a href="/investigations/${slug}/">← The public version of this investigation</a></p>
<div class="deep-dive-body">${record.html}</div>${signOut}`)
}
