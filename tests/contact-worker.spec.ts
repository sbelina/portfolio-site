import { expect, test } from '@playwright/test'
import { composeEmail, validateSubmission } from '../worker/contact-rules'

/** Contact form spam defences and email text. Pure rules; no network. */
const valid = { reason: 'organization', name: 'A. Visitor', email: 'visitor@example.org', organization: 'Example Org', message: 'We keep paying to fix the same problem.', website: '', elapsed: 8000, token: 'challenge-token' }

test('a reasonable message passes', () => {
  expect(validateSubmission(valid)).toMatchObject({ ok: true })
})

test('bots and abuse are refused: honeypot, speed, links, injection, sizes, missing challenge', () => {
  expect(validateSubmission({ ...valid, website: 'http://spam.example' })).toEqual({ ok: false, error: 'rejected' })
  expect(validateSubmission({ ...valid, elapsed: 900 })).toEqual({ ok: false, error: 'too-fast' })
  expect(validateSubmission({ ...valid, message: 'see http://a.x http://b.x http://c.x www.d.x' })).toEqual({ ok: false, error: 'links' })
  expect(validateSubmission({ ...valid, name: 'Evil\r\nBcc: everyone@example.org' })).toEqual({ ok: false, error: 'name' })
  expect(validateSubmission({ ...valid, email: 'not-an-address' })).toEqual({ ok: false, error: 'email' })
  expect(validateSubmission({ ...valid, message: 'hi' })).toEqual({ ok: false, error: 'message' })
  expect(validateSubmission({ ...valid, message: 'x'.repeat(5001) })).toEqual({ ok: false, error: 'message' })
  expect(validateSubmission({ ...valid, reason: 'unknown' })).toEqual({ ok: false, error: 'reason' })
  expect(validateSubmission({ ...valid, token: '' })).toEqual({ ok: false, error: 'challenge' })
})

test('the owner receives plain text, addressed to hello@sbelina.com, with the visitor as Reply-To', () => {
  const ok = validateSubmission({ ...valid, name: 'Zoë' })
  if (!ok.ok) throw new Error('expected valid')
  const raw = composeEmail(ok.value, new Date('2026-11-26T12:00:00Z'))
  expect(raw).toContain('To: <hello@sbelina.com>')
  expect(raw).toContain('From: Producing Curiosity <contact@producingcuriosity.com>')
  expect(raw).toContain('Reply-To: <visitor@example.org>')
  expect(raw).toMatch(/Subject: =\?UTF-8\?B\?[A-Za-z0-9+/=]+\?=/)
  expect(raw).toContain('Content-Type: text/plain; charset=utf-8')
  expect(raw.split('\r\n\r\n')[0]).not.toMatch(/[^\r]\n/)
})
