/**
 * /api/contact ("Send the emails to hello@sbelina.com but make sure I can't
 * get spammed"). The Contact form posts here; the Worker sends one plain-text email to the owner through
 * Cloudflare Email Routing and keeps nothing: no database, no log of the message, no cookie.
 *
 * Spam defences, cheapest first:
 *   1. Same-origin only (Origin must be the site), POST only, small JSON body.
 *   2. Rate limits: 3 a minute per client, and at most one message every five minutes for the whole site.
 *   3. Honeypot field that people never see; filled means a bot.
 *   4. Time trap: a submission sooner than 3 seconds after the form appeared is refused.
 *   5. Field rules: lengths, a valid reply address, at most 3 links, no header injection.
 *   6. Cloudflare Turnstile (privacy-preserving challenge), verified server-side. Required.
 * Until both the email binding and the Turnstile secret exist, the endpoint answers 503 and the page
 * falls back to preparing an email in the visitor's own app, so nothing breaks before setup.
 */
import { EmailMessage } from 'cloudflare:email'

export interface ContactEnv {
  CONTACT_EMAIL?: { send(message: EmailMessage): Promise<void> }
  TURNSTILE_SECRET?: string
  CONTACT_LIMIT?: { limit(options: { key: string }): Promise<{ success: boolean }> }
  /** Remembers when the last message went out, so the site sends at most one every five minutes. */
  CONTACT_STATE?: { get(key: string): Promise<string | null>; put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void> }
}

import { composeEmail, origins, owner, reply, sender, validateSubmission } from './contact-rules'
export { composeEmail, contactReasons, validateSubmission } from './contact-rules'

export async function handleContact(request: Request, env: ContactEnv, verify: typeof fetch = fetch): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  if (!env.CONTACT_EMAIL || !env.TURNSTILE_SECRET) return reply(503, { error: 'not-configured' })
  if (!origins.has(request.headers.get('Origin') ?? '')) return reply(403, { error: 'origin' })
  const client = request.headers.get('CF-Connecting-IP') ?? 'unknown'
  if (env.CONTACT_LIMIT && !(await env.CONTACT_LIMIT.limit({ key: client })).success) return reply(429, { error: 'rate' })
  // Site-wide: at most one message every five minutes (KV can lag by up to a minute across locations).
  if (env.CONTACT_STATE && await env.CONTACT_STATE.get('last-sent')) return reply(429, { error: 'wait' })
  const text = await request.text()
  if (text.length > 12_000) return reply(413, { error: 'size' })
  let body: Record<string, unknown>
  try { body = JSON.parse(text) } catch { return reply(400, { error: 'format' }) }
  const checked = validateSubmission(body)
  // A filled honeypot gets the same answer as success, so bots learn nothing.
  if (!checked.ok) return checked.error === 'rejected' ? reply(200, { ok: true }) : reply(400, { error: checked.error })
  const form = new FormData()
  form.append('secret', env.TURNSTILE_SECRET); form.append('response', checked.value.token); form.append('remoteip', client)
  const outcome = await verify('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form }).then(response => response.json() as Promise<{ success?: boolean; hostname?: string }>).catch(() => ({ success: false }))
  if (!outcome.success) return reply(400, { error: 'challenge' })
  try {
    await env.CONTACT_EMAIL.send(new EmailMessage(sender, owner, composeEmail(checked.value)))
    await env.CONTACT_STATE?.put('last-sent', new Date().toISOString(), { expirationTtl: 300 })
  } catch {
    return reply(502, { error: 'send' })
  }
  return reply(200, { ok: true })
}
