/**
 * Private thought archive Worker (thoughts.producingcuriosity.com).
 * - email(): receives Google Voice texts forwarded by Gmail, via Cloudflare Email Routing.
 * - fetch(): the Thoughts page, behind Cloudflare Access, re-verified here. On the public site's
 *   hostnames only /field-notes/ is served: read-only notes the owner explicitly made public.
 * - scheduled(): retries sorting for anything not yet sorted.
 * Nothing here is part of the public site build. Phone numbers, emails and secrets are Worker
 * configuration, never repository content.
 */
import { checkSender, extractVoiceText, fallbackTitle, keywordSuggestions, parseEmail, parseSuggestion, readFilter, suggestionPrompt, type Suggestion } from './lib'
import { verifyAccess } from './access'
import { addSystemNote, addThought, applySuggestion, deleteThought, dismissSystemNote, getPublicNote, getThought, listPublicNotes, listThoughts, publicTags, setArchived, setStatus, statusCounts, systemNotes, tagCloud, unsorted, updateThought, type Database } from './store'
import { editPage, listPage, messagePage, newPage } from './page'
import { publicListPage, publicNotFound, publicNotePage } from './public-page'
import { isStatus, normalizeTag } from './lib'

export interface Env {
  DB: Database
  AI?: { run(model: string, input: unknown): Promise<unknown> }
  ACCESS_TEAM_DOMAIN: string      // e.g. yourteam.cloudflareaccess.com
  ACCESS_AUD: string              // Access application audience tag
  OWNER_EMAIL: string             // the only identity allowed in
  FORWARDING_ACCOUNT: string      // Gmail address that forwards Google Voice texts
  VOICE_NUMBER: string            // Google Voice number (secret)
  SENDER_NUMBERS: string          // comma-separated numbers allowed to text in (secret)
  CSRF_SECRET: string             // random string (secret)
  AI_MODEL?: string
  PUBLIC_HOSTS?: string           // public site hostnames that may serve /field-notes/ (comma-separated)
  PUBLIC_ORIGIN?: string          // e.g. https://producingcuriosity.com, for links from the private page
  PUBLIC_INDEXING?: string        // 'true' lets search engines index field notes; off by default
  LOCAL_DEV?: string              // 'true' bypasses Access only on localhost
}
type EmailMessage = { from: string; to: string; headers: Headers; raw: ReadableStream<Uint8Array>; rawSize: number; setReject(reason: string): void }
type Context = { waitUntil(promise: Promise<unknown>): void }

const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast'
const MAX_EMAIL = 512 * 1024

const security = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'",
}
const html = (body: string, status = 200) => new Response(body, { status, headers: security })
const redirect = (location: string) => new Response(null, { status: 303, headers: { Location: location, 'Cache-Control': 'private, no-store' } })

async function readRaw(stream: ReadableStream<Uint8Array>, limit = MAX_EMAIL): Promise<string> {
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > limit) { await reader.cancel(); throw new Error('Email too large') }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return new TextDecoder('latin1').decode(bytes) // byte-preserving; parts decode their own charsets
}

export async function suggest(env: Env, text: string): Promise<{ suggestion: Suggestion; origin: 'ai' | 'fallback' }> {
  if (env.AI) {
    try {
      const result = await env.AI.run(env.AI_MODEL || DEFAULT_MODEL, { messages: suggestionPrompt(text), max_tokens: 160, temperature: 0.2 }) as { response?: unknown }
      const parsed = parseSuggestion(result?.response ?? result)
      if (parsed && parsed.tags.length) return { suggestion: parsed, origin: 'ai' }
    } catch (error) { console.warn('AI sorting unavailable', error instanceof Error ? error.message : 'unknown') }
  }
  return { suggestion: { title: fallbackTitle(text), tags: keywordSuggestions(text) }, origin: 'fallback' }
}

export async function sortThought(env: Env, id: string, text: string) {
  const { suggestion, origin } = await suggest(env, text)
  await applySuggestion(env.DB, id, suggestion, origin)
}

export async function receiveEmail(message: EmailMessage, env: Env, ctx: Context) {
  if (message.rawSize > MAX_EMAIL) return message.setReject('Message too large')
  const parsed = parseEmail(await readRaw(message.raw))
  const check = checkSender(message.from, parsed.headers, {
    forwardingAccount: env.FORWARDING_ACCOUNT ?? '', voiceNumber: env.VOICE_NUMBER ?? '',
    senderNumbers: (env.SENDER_NUMBERS ?? '').split(',').map(value => value.trim()).filter(Boolean),
  })
  if (!check.ok) { console.warn('Rejected email:', check.reason); return message.setReject('Not accepted') }
  if (check.kind === 'gmail-confirmation') return addSystemNote(env.DB, parsed.headers.get('subject') ?? 'Gmail forwarding confirmation', parsed.text.slice(0, 3000))
  const text = extractVoiceText(parsed.text)
  if (!text) return
  const id = await addThought(env.DB, { text, source: 'text', messageId: parsed.headers.get('message-id') ?? undefined })
  if (id) ctx.waitUntil(sortThought(env, id, text))
}

/* ---------- Public field notes ---------- */

const publicHeaders = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'public, max-age=300',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
}
const LOCAL_HOSTS = ['127.0.0.1', 'localhost']
const publicHosts = (env: Env) => (env.PUBLIC_HOSTS ?? '').split(',').map(host => host.trim().toLowerCase()).filter(Boolean)

/** Read-only. Never touches identity, forms, raw text, sources or AI suggestions. */
export async function handlePublic(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url)
  const indexable = env.PUBLIC_INDEXING === 'true'
  const respond = (body: string, status = 200) => new Response(request.method === 'HEAD' ? null : body, { status, headers: { ...publicHeaders, 'X-Robots-Tag': indexable && status === 200 ? 'index, follow' : 'noindex, follow' } })
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  if (url.pathname === '/field-notes') return new Response(null, { status: 301, headers: { Location: `/field-notes/${url.search}` } })
  if (url.pathname === '/field-notes/') {
    const tag = normalizeTag(url.searchParams.get('tag') ?? '') || undefined
    const [notes, tags] = await Promise.all([listPublicNotes(env.DB, tag), publicTags(env.DB)])
    return respond(publicListPage({ notes, tags, tag, origin: url.origin, indexable }))
  }
  const match = /^\/field-notes\/([0-9a-f]{8})\/?$/.exec(url.pathname)
  if (match) {
    if (!url.pathname.endsWith('/')) return new Response(null, { status: 301, headers: { Location: `${url.pathname}/` } })
    const note = await getPublicNote(env.DB, match[1])
    if (note) return respond(publicNotePage(note, url.origin, indexable))
  }
  return respond(publicNotFound(url.origin), 404)
}

/* ---------- Page ---------- */

const encoder = new TextEncoder()
async function csrfFor(env: Env, email: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', encoder.encode(env.CSRF_SECRET || ''), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(`thoughts:${email}`))
  return [...new Uint8Array(signature)].map(byte => byte.toString(16).padStart(2, '0')).join('')
}
const equal = (a: string, b: string) => a.length === b.length && [...a].reduce((difference, char, index) => difference | (char.charCodeAt(0) ^ b.charCodeAt(index)), 0) === 0

async function identity(request: Request, env: Env): Promise<string | undefined> {
  const url = new URL(request.url)
  if (env.LOCAL_DEV === 'true' && ['127.0.0.1', 'localhost'].includes(url.hostname)) return (env.OWNER_EMAIL || 'local@example.invalid').toLowerCase()
  return verifyAccess(request.headers.get('Cf-Access-Jwt-Assertion'), { teamDomain: env.ACCESS_TEAM_DOMAIN, audience: env.ACCESS_AUD, ownerEmail: env.OWNER_EMAIL })
}

export async function handle(request: Request, env: Env, ctx: Context): Promise<Response> {
  const url = new URL(request.url)
  const email = await identity(request, env)
  if (!email) return messagePage('Private', 'This page is private.', 403)
  if (!env.CSRF_SECRET && env.LOCAL_DEV !== 'true') return messagePage('Not configured', 'CSRF_SECRET is missing.', 500)
  const csrf = await csrfFor(env, email)
  const path = url.pathname

  if (request.method === 'GET') {
    if (path === '/') {
      const filter = readFilter(url.searchParams)
      const [thoughts, cloud, notes, counts] = await Promise.all([listThoughts(env.DB, filter), tagCloud(env.DB, filter.view), systemNotes(env.DB), statusCounts(env.DB, filter.view)])
      return html(listPage({ thoughts, cloud, filter, notes, counts, csrf, returnTo: `${url.pathname}${url.search}` }))
    }
    if (path === '/new') return html(newPage(csrf))
    const match = /^\/t\/([0-9a-f-]{36})$/.exec(path)
    if (match) { const thought = await getThought(env.DB, match[1]); return thought ? html(editPage(thought, csrf, env.PUBLIC_ORIGIN ?? '')) : messagePage('Not found', 'That thought does not exist.', 404) }
    return messagePage('Not found', 'Nothing here.', 404)
  }

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })
  const origin = request.headers.get('Origin')
  if (origin && origin !== url.origin) return messagePage('Refused', 'That request came from another site.', 403)
  const form = await request.formData()
  if (!equal(String(form.get('csrf') ?? ''), csrf)) return messagePage('Refused', 'The form expired. Go back and try again.', 403)

  if (path === '/new') {
    const body = String(form.get('body') ?? '').trim().slice(0, 20_000)
    if (!body) return redirect('/new')
    const id = await addThought(env.DB, { text: body, source: 'web' })
    if (id) ctx.waitUntil(sortThought(env, id, body))
    return redirect('/')
  }
  const note = /^\/notes\/(\d+)\/dismiss$/.exec(path)
  if (note) { await dismissSystemNote(env.DB, Number(note[1])); return redirect('/') }
  const match = /^\/t\/([0-9a-f-]{36})(?:\/(archive|restore|delete|status))?$/.exec(path)
  if (!match) return messagePage('Not found', 'Nothing here.', 404)
  const [, id, action] = match
  // Quick actions on the list return to the same filtered view; only same-site list URLs are accepted.
  const returnTo = /^\/(\?[^#\s]*)?$/.test(String(form.get('return') ?? '')) ? String(form.get('return')) : undefined
  if (action === 'archive' || action === 'restore') { await setArchived(env.DB, id, action === 'archive'); return redirect(returnTo ?? `/t/${id}`) }
  if (action === 'status') {
    const value = String(form.get('status') ?? '')
    if (!isStatus(value) && value !== 'none') return redirect(returnTo ?? '/')
    await setStatus(env.DB, id, isStatus(value) ? value : null)
    return redirect(returnTo ?? '/')
  }
  if (action === 'delete') {
    if (form.get('confirm') !== 'yes') return redirect(returnTo ?? `/t/${id}`)
    await deleteThought(env.DB, id)
    return redirect(returnTo ?? '/')
  }
  const tags = String(form.get('tags') ?? '').split(/[,\s]+/)
  const body = String(form.get('body') ?? '')
  if (!body.trim()) return redirect(`/t/${id}`)
  // The edit form always sends public_field; an unchecked box means "make private".
  const isPublic = form.has('public_field') ? form.get('public') === 'on' : undefined
  const statusValue = String(form.get('status') ?? '')
  const status = form.has('status_field') ? (isStatus(statusValue) ? statusValue : null) : undefined
  const saved = await updateThought(env.DB, id, { title: String(form.get('title') ?? ''), body, tags, public: isPublic, status })
  return saved ? redirect(`/t/${id}`) : messagePage('Not found', 'That thought does not exist.', 404)
}

/** Public hostnames only ever reach /field-notes/; the private archive never answers there. */
export function route(request: Request, env: Env, ctx: Context): Promise<Response> {
  const url = new URL(request.url)
  const host = url.hostname.toLowerCase()
  const isPublicHost = publicHosts(env).includes(host)
  const isLocal = env.LOCAL_DEV === 'true' && LOCAL_HOSTS.includes(host)
  const isNotesPath = url.pathname === '/field-notes' || url.pathname.startsWith('/field-notes/')
  if (isNotesPath && (isPublicHost || isLocal)) return handlePublic(request, env)
  if (isPublicHost) return Promise.resolve(new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'X-Robots-Tag': 'noindex' } }))
  return handle(request, env, ctx)
}

export default {
  fetch: (request: Request, env: Env, ctx: Context) => route(request, env, ctx),
  email: (message: EmailMessage, env: Env, ctx: Context) => receiveEmail(message, env, ctx),
  async scheduled(_event: unknown, env: Env) {
    for (const row of await unsorted(env.DB)) await sortThought(env, row.id, row.body)
  },
}
