/**
 * Contact form rules (worker/contact.ts): validation and the email text, kept free of Workers-only
 * imports so they can be tested directly.
 */
export const owner = 'hello@sbelina.com'
export const sender = 'contact@producingcuriosity.com'
export const origins = new Set(['https://producingcuriosity.com', 'https://www.producingcuriosity.com'])
export const contactReasons: Record<string, string> = {
  employment: 'Employment or leadership opportunity', organization: 'Organizational inquiry', research: 'Research collaboration',
  teaching: 'Teaching or speaking', other: 'Something else', resume: 'Résumé request',
}

export const reply = (status: number, body: Record<string, unknown>) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' },
})
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max + 1) : ''
const headerSafe = (value: string) => !/[\r\n]/.test(value)
const emailPattern = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[a-z]{2,}$/i
const encodeHeader = (text: string) => /^[\x20-\x7e]*$/.test(text) ? text : `=?UTF-8?B?${btoa(String.fromCharCode(...new TextEncoder().encode(text)))}?=`

export type ContactSubmission = { reason: string; name: string; email: string; organization: string; message: string; website: string; elapsed: number; token: string }

/** Field and timing rules, separate from the network so they can be tested directly. */
export function validateSubmission(body: Record<string, unknown>): { ok: true; value: ContactSubmission } | { ok: false; error: string } {
  const value: ContactSubmission = {
    reason: clean(body.reason, 20), name: clean(body.name, 100), email: clean(body.email, 200), organization: clean(body.organization, 150),
    message: clean(body.message, 5000), website: clean(body.website, 200), elapsed: Number(body.elapsed), token: clean(body.token, 2048),
  }
  if (value.website) return { ok: false, error: 'rejected' }
  if (!Number.isFinite(value.elapsed) || value.elapsed < 3000 || value.elapsed > 86_400_000) return { ok: false, error: 'too-fast' }
  if (!(value.reason in contactReasons)) return { ok: false, error: 'reason' }
  if (!value.name || value.name.length > 100 || !headerSafe(value.name)) return { ok: false, error: 'name' }
  if (value.email.length > 200 || !emailPattern.test(value.email) || !headerSafe(value.email)) return { ok: false, error: 'email' }
  if (value.organization.length > 150 || !headerSafe(value.organization)) return { ok: false, error: 'organization' }
  if (value.message.length < 10 || value.message.length > 5000) return { ok: false, error: 'message' }
  if ((value.message.match(/https?:\/\/|www\./gi) ?? []).length > 3) return { ok: false, error: 'links' }
  if (!value.token) return { ok: false, error: 'challenge' }
  return { ok: true, value }
}

/** The email the owner receives: plain text, the visitor as Reply-To, nothing else attached. */
export function composeEmail(value: ContactSubmission, now = new Date()): string {
  const reason = contactReasons[value.reason]
  const body = [`Reason: ${reason}`, `Name: ${value.name}`, `Email: ${value.email}`, `Organization: ${value.organization || '(not given)'}`, '', value.message, '', '— Sent from the Contact form on producingcuriosity.com. Reply to answer them directly.'].join('\r\n')
  return [
    `From: Producing Curiosity <${sender}>`, `To: <${owner}>`, `Reply-To: <${value.email}>`,
    `Subject: ${encodeHeader(`${reason}: ${value.name}`)}`, `Date: ${now.toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@producingcuriosity.com>`, 'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=utf-8', 'Content-Transfer-Encoding: 8bit', '', body,
  ].join('\r\n')
}

