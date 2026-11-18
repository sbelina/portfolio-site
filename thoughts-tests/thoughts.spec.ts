import { expect, test } from '@playwright/test'
import { generateKeyPairSync, createSign } from 'node:crypto'
import { checkSender, extractVoiceText, statusFromText, keywordSuggestions, parseEmail, parseSuggestion, typedTags, readFilter, cloudStep } from '../thoughts/lib'
import { verifyAccess, resetAccessCache } from '../thoughts/access'
import { addThought, getThought, listThoughts, tagCloud } from '../thoughts/store'
import { handle, receiveEmail, route, type Env } from '../thoughts/worker'
import { emailMessage, memoryD1, voiceEmail } from './d1-shim'

const policy = { forwardingAccount: 'sami.example@gmail.com', voiceNumber: '(515) 555-0188', senderNumbers: ['515-555-0123'] }
const env = (overrides: Partial<Env> = {}): Env => ({
  DB: memoryD1(), ACCESS_TEAM_DOMAIN: 'team.cloudflareaccess.com', ACCESS_AUD: 'aud-123', OWNER_EMAIL: 'owner@example.com',
  FORWARDING_ACCOUNT: policy.forwardingAccount, VOICE_NUMBER: policy.voiceNumber, SENDER_NUMBERS: policy.senderNumbers.join(','),
  CSRF_SECRET: 'test-secret', ...overrides,
})
const ctx = () => { const pending: Promise<unknown>[] = []; return { waitUntil: (p: Promise<unknown>) => { pending.push(p) }, settle: () => Promise.all(pending) } }

test('parses a forwarded Google Voice text and strips the notification footer', () => {
  const parsed = parseEmail(voiceEmail({ body: 'Ask about #research-ops = idea’s scope' }))
  expect(extractVoiceText(parsed.text)).toBe('Ask about #research-ops = idea’s scope')
  expect(parsed.headers.get('subject')).toContain('New text message')
})

test('accepts only the configured account, Voice notifications and allowed sender numbers', () => {
  const headers = parseEmail(voiceEmail({ body: 'x' })).headers
  expect(checkSender('sami.example+caf_=thoughts=example.com@gmail.com', headers, policy)).toEqual({ ok: true, kind: 'text' })
  expect(checkSender('sami.example@gmail.com', headers, policy)).toEqual({ ok: true, kind: 'text' })
  expect(checkSender('someone@gmail.com', headers, policy).ok).toBe(false)
  expect(checkSender('sami.example@gmail.com', parseEmail(voiceEmail({ body: 'x', sender: '5155550999' })).headers, policy).ok).toBe(false)
  expect(checkSender('sami.example@gmail.com', parseEmail(voiceEmail({ body: 'x', from: 'Friend <friend@example.com>' })).headers, policy).ok).toBe(false)
  expect(checkSender('sami.example@gmail.com', headers, { ...policy, senderNumbers: [] }).ok).toBe(false)
  expect(checkSender('sami.example@gmail.com', parseEmail(voiceEmail({ body: 'x', voice: '5155550177' })).headers, policy)).toEqual({ ok: false, reason: 'Not sent to the configured Voice number' })
  const confirmation = parseEmail('From: Gmail Team <forwarding-noreply@google.com>\r\nSubject: (#123456) Gmail Forwarding Confirmation - Receive Mail from sami.example@gmail.com\r\n\r\nConfirmation code: 123456')
  expect(checkSender('forwarding-noreply@google.com', confirmation.headers, policy)).toEqual({ ok: true, kind: 'gmail-confirmation' })
  expect(checkSender('3abc123@gaia.bounces.google.com', confirmation.headers, policy)).toEqual({ ok: true, kind: 'gmail-confirmation' })
  const otherAccount = parseEmail('From: Gmail Team <forwarding-noreply@google.com>\r\nSubject: (#123456) Gmail Forwarding Confirmation - Receive Mail from someone.else@gmail.com\r\n\r\nConfirmation code: 123456')
  expect(checkSender('3abc123@gaia.bounces.google.com', otherAccount.headers, policy).ok).toBe(false)
  expect(checkSender('forwarding-noreply@google.com.evil.example', confirmation.headers, policy).ok).toBe(false)
})

test('typed tags, keyword fallback and AI reply parsing stay bounded', () => {
  expect(typedTags('Plan #Research_Ops and #ideas, again #ideas')).toEqual(['research_ops', 'ideas'])
  expect(keywordSuggestions('Trust research trust interviews research synthesis trust')).toEqual(['trust', 'research', 'interviews', 'synthesis'])
  expect(parseSuggestion('Sure! {"title":"Trust study follow-up","tags":["Trust","research ops","trust"]}')).toEqual({ title: 'Trust study follow-up', tags: ['trust', 'research-ops'] })
  expect(parseSuggestion('no json here')).toBeUndefined()
  expect(readFilter(new URLSearchParams('tag=%23Ideas&from=2026-01-01&to=bad&view=x'))).toEqual({ q: undefined, tag: 'ideas', from: '2026-01-01', to: undefined, view: 'active' })
  expect([cloudStep(1, 1), cloudStep(1, 10), cloudStep(10, 10)]).toEqual([3, 1, 5])
})

test('email intake stores the raw text once, applies typed tags, then AI suggestions as pre-approved tags', async () => {
  const ai = { run: async () => ({ response: '{"title":"Checkpoint idea","tags":["handoffs","portfolio"]}' }) }
  const e = env({ AI: ai })
  const c = ctx()
  const first = emailMessage(voiceEmail({ body: 'Move the checkpoint earlier #portfolio' }))
  await receiveEmail(first.message, e, c); await c.settle()
  const duplicate = emailMessage(voiceEmail({ body: 'Move the checkpoint earlier #portfolio' }))
  await receiveEmail(duplicate.message, e, c); await c.settle()
  const [thought] = await listThoughts(e.DB, { view: 'active' })
  expect(await listThoughts(e.DB, { view: 'all' })).toHaveLength(1)
  expect(thought.raw).toBe('Move the checkpoint earlier #portfolio')
  expect(thought.title).toBe('Checkpoint idea')
  expect(thought.title_origin).toBe('ai')
  expect(thought.tags).toEqual([{ tag: 'handoffs', origin: 'ai' }, { tag: 'portfolio', origin: 'typed' }])
})

test('falls back to keywords when AI is unavailable, and rejects strangers without storing anything', async () => {
  const e = env({ AI: { run: async () => { throw new Error('down') } } })
  const c = ctx()
  await receiveEmail(emailMessage(voiceEmail({ body: 'Trust research: trust signals in onboarding research' })).message, e, c); await c.settle()
  const [thought] = await listThoughts(e.DB, { view: 'active' })
  expect(thought.title_origin).toBe('fallback')
  expect(thought.tags.map(tag => tag.tag)).toEqual(['onboarding', 'research', 'signals', 'trust']) // stored tags list alphabetically
  const stranger = emailMessage(voiceEmail({ body: 'spam', sender: '5155550999', messageId: '<other@x>' }))
  await receiveEmail(stranger.message, e, c)
  expect(stranger.rejected()).toBe('Not accepted')
  const spoof = emailMessage(voiceEmail({ body: 'spoof', messageId: '<spoof@x>' }), 'attacker@example.com')
  await receiveEmail(spoof.message, e, c)
  expect(spoof.rejected()).toBe('Not accepted')
  expect(await listThoughts(e.DB, { view: 'all' })).toHaveLength(1)
})

test('the page is closed without a verified Access identity', async () => {
  const response = await handle(new Request('https://thoughts.example.com/'), env(), ctx())
  expect(response.status).toBe(403)
  const local = await handle(new Request('https://thoughts.example.com/'), env({ LOCAL_DEV: 'true' }), ctx())
  expect(local.status).toBe(403) // the local bypass only applies on localhost
})

test('Access tokens are verified by signature, audience, expiry and owner email', async () => {
  resetAccessCache()
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256' }
  const fetcher = (async () => new Response(JSON.stringify({ keys: [jwk] }))) as typeof fetch
  const b64 = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const sign = (claims: Record<string, unknown>) => {
    const head = `${b64({ alg: 'RS256', kid: 'k1' })}.${b64(claims)}`
    return `${head}.${createSign('RSA-SHA256').update(head).sign(privateKey).toString('base64url')}`
  }
  const config = { teamDomain: 'team.cloudflareaccess.com', audience: 'aud-123', ownerEmail: 'Owner@example.com' }
  const now = Date.now(); const exp = Math.floor(now / 1000) + 600
  expect(await verifyAccess(sign({ aud: ['aud-123'], email: 'owner@example.com', exp, iss: 'https://team.cloudflareaccess.com' }), config, now, fetcher)).toBe('owner@example.com')
  expect(await verifyAccess(sign({ aud: ['other'], email: 'owner@example.com', exp }), config, now, fetcher)).toBeUndefined()
  expect(await verifyAccess(sign({ aud: ['aud-123'], email: 'someone@example.com', exp }), config, now, fetcher)).toBeUndefined()
  expect(await verifyAccess(sign({ aud: ['aud-123'], email: 'owner@example.com', exp: Math.floor(now / 1000) - 5 }), config, now, fetcher)).toBeUndefined()
  const forged = sign({ aud: ['aud-123'], email: 'owner@example.com', exp }).replace(/\.[^.]+$/, '.AAAA')
  expect(await verifyAccess(forged, config, now, fetcher)).toBeUndefined()
})

test('owner can search, filter by tag, edit, archive and delete; forms require the CSRF token', async () => {
  const e = env({ LOCAL_DEV: 'true' })
  const base = 'http://127.0.0.1:8790'
  const c = ctx()
  const first = await addThought(e.DB, { text: 'Interview script for #trust study', source: 'web' })
  await addThought(e.DB, { text: 'Groceries: lentils, lemons', source: 'text' })
  let page = await (await handle(new Request(`${base}/`), e, c)).text()
  expect(page).toContain('Interview script for #trust study')
  expect(page).toContain('Groceries: lentils, lemons')
  page = await (await handle(new Request(`${base}/?tag=trust`), e, c)).text()
  expect(page).toContain('Interview script')
  expect(page).not.toContain('Groceries')
  page = await (await handle(new Request(`${base}/?q=lentil`), e, c)).text()
  expect(page).toContain('Groceries')
  expect(page).not.toContain('Interview script')
  const edit = await (await handle(new Request(`${base}/t/${first}`), e, c)).text()
  const csrf = /name="csrf" value="([a-f0-9]+)"/.exec(edit)![1]
  const post = (path: string, fields: Record<string, string>, origin = base) => handle(new Request(`${base}${path}`, { method: 'POST', headers: { Origin: origin }, body: new URLSearchParams(fields) }), e, c)
  expect((await post(`/t/${first}`, { csrf: 'wrong', title: 'x', body: 'x', tags: '' })).status).toBe(403)
  expect((await post(`/t/${first}`, { csrf, title: 'x', body: 'x', tags: '' }, 'https://evil.example')).status).toBe(403)
  expect((await post(`/t/${first}`, { csrf, title: 'Trust interviews', body: 'Interview script for #trust study, v2', tags: 'research, Interviews' })).status).toBe(303)
  const updated = await getThought(e.DB, first!)
  expect(updated!.title).toBe('Trust interviews')
  expect(updated!.title_origin).toBe('manual')
  expect(updated!.raw).toBe('Interview script for #trust study')
  expect(updated!.tags).toEqual([{ tag: 'interviews', origin: 'manual' }, { tag: 'research', origin: 'manual' }, { tag: 'trust', origin: 'typed' }])
  await post(`/t/${first}/archive`, { csrf })
  expect((await listThoughts(e.DB, { view: 'active' })).map(t => t.id)).not.toContain(first)
  expect((await tagCloud(e.DB, 'archived')).map(t => t.tag)).toContain('trust')
  await post(`/t/${first}/delete`, { csrf })
  expect(await getThought(e.DB, first!)).toBeDefined() // no confirmation box, nothing deleted
  await post(`/t/${first}/delete`, { csrf, confirm: 'yes' })
  expect(await getThought(e.DB, first!)).toBeUndefined()
  const response = await handle(new Request(`${base}/`), e, c)
  expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
})

test('#public publishes at capture; the public page shows only edited text and owner tags', async () => {
  const e = env({ PUBLIC_HOSTS: 'producingcuriosity.com' })
  const c = ctx()
  const visible = await addThought(e.DB, { text: 'What if the checkpoint moved upstream? #public #claims', source: 'text' })
  await addThought(e.DB, { text: 'Private: salary notes', source: 'text' })
  await e.DB.prepare("INSERT INTO thought_tags (thought_id, tag, origin) VALUES (?, 'ai-guess', 'ai')").bind(visible).run()
  const get = (path: string, host = 'producingcuriosity.com') => route(new Request(`https://${host}${path}`), e, c)
  const list = await get('/field-notes/')
  const html = await list.text()
  expect(list.status).toBe(200)
  expect(list.headers.get('Cache-Control')).toBe('public, max-age=300')
  expect(list.headers.get('X-Robots-Tag')).toBe('noindex, follow')
  expect(html).toContain('What if the checkpoint moved upstream?')
  expect(html).not.toContain('#public')
  expect(html).not.toContain('ai-guess')
  expect(html).not.toContain('salary')
  expect(html).toContain('unedited and unreviewed')
  expect(html).toContain('href="/investigations/"')
  expect(html).toContain('aria-current="page">Field notes')
  const slug = visible!.slice(0, 8)
  expect((await get(`/field-notes/${slug}/`)).status).toBe(200)
  expect((await get(`/field-notes/${slug}`)).status).toBe(301)
  expect((await get('/field-notes/?tag=claims')).status).toBe(200)
  expect(await (await get('/field-notes/?tag=ai-guess')).text()).toContain('No notes with this tag yet.')
  // The private archive never answers on the public hostname, and the public view takes no writes.
  expect((await get('/')).status).toBe(404)
  expect((await get(`/t/${visible}`)).status).toBe(404)
  expect((await route(new Request('https://producingcuriosity.com/field-notes/', { method: 'POST', body: 'x' }), e, c)).status).toBe(405)
  // On the private hostname, /field-notes is not served without Access.
  expect((await get('/field-notes/', 'thoughts.producingcuriosity.com')).status).toBe(403)
})

test('the edit switch publishes and unpublishes; adding #public later also publishes', async () => {
  const e = env({ LOCAL_DEV: 'true', PUBLIC_HOSTS: 'producingcuriosity.com', PUBLIC_ORIGIN: 'https://producingcuriosity.com' })
  const base = 'http://127.0.0.1:8790'
  const c = ctx()
  const id = await addThought(e.DB, { text: 'Same shape, different gap', source: 'web' })
  const edit = await (await handle(new Request(`${base}/t/${id}`), e, c)).text()
  expect(edit).toContain('name="public"')
  expect(edit).not.toMatch(/name="public" checked/)
  const csrf = /name="csrf" value="([a-f0-9]+)"/.exec(edit)![1]
  const save = (fields: Record<string, string>) => handle(new Request(`${base}/t/${id}`, { method: 'POST', headers: { Origin: base }, body: new URLSearchParams({ csrf, title: 'Gap', tags: '', public_field: '1', ...fields }) }), e, c)
  const publicList = async () => (await route(new Request('https://producingcuriosity.com/field-notes/'), e, c)).text()

  await save({ body: 'Same shape, different gap', public: 'on' })
  let thought = await getThought(e.DB, id!)
  expect(thought!.public).toBe(1)
  const firstPublished = thought!.published_at
  expect(thought!.tags.map(t => t.tag)).toContain('public')
  expect(await publicList()).toContain('Same shape, different gap')
  expect(await (await handle(new Request(`${base}/t/${id}`), e, c)).text()).toContain(`https://producingcuriosity.com/field-notes/${id!.slice(0, 8)}/`)

  await save({ body: 'Same shape, different gap' }) // box unchecked
  thought = await getThought(e.DB, id!)
  expect(thought!.public).toBe(0)
  expect(thought!.published_at).toBe(null)
  expect(thought!.tags.map(t => t.tag)).not.toContain('public')
  expect(await publicList()).not.toContain('Same shape')
  expect((await route(new Request(`https://producingcuriosity.com/field-notes/${id!.slice(0, 8)}/`), e, c)).status).toBe(404)

  await save({ body: 'Same shape, different gap #public' }) // box unchecked, hashtag newly added
  thought = await getThought(e.DB, id!)
  expect(thought!.public).toBe(1)
  expect(firstPublished).not.toBe(null)

  await e.DB.prepare('UPDATE thoughts SET archived = 1 WHERE id = ?').bind(id).run()
  expect(await publicList()).not.toContain('Same shape') // archiving hides a public note too
})

test('Voice logo links are removed and wrapped lines rejoined; typed links and line breaks stay', () => {
  const text = '<https://voice.google.com>\nMake some ceramics this week - maybe the bubbler fermentation thing for\nKyle? #idea #project #clay'
  expect(extractVoiceText(text)).toBe('Make some ceramics this week - maybe the bubbler fermentation thing for Kyle? #idea #project #clay')
  expect(extractVoiceText('Read this https://example.com/a\nShort line\nAnother')).toBe('Read this https://example.com/a\nShort line\nAnother')
})

test('#todo, #doing and #done set a status instead of a tag; quick actions change status and delete', async () => {
  expect(statusFromText('Call the kiln shop #todo then #doing')).toBe('doing')
  expect(typedTags('Glaze test #todo #clay')).toEqual(['clay'])
  const e = env({ LOCAL_DEV: 'true' })
  const base = 'http://127.0.0.1:8790'
  const c = ctx()
  const id = await addThought(e.DB, { text: 'Glaze test #todo #clay', source: 'text' })
  const other = await addThought(e.DB, { text: 'Just a thought', source: 'web' })
  expect((await getThought(e.DB, id!))!.status).toBe('todo')
  let page = await (await handle(new Request(`${base}/?status=todo`), e, c)).text()
  expect(page).toContain('Glaze test')
  expect(page).not.toContain('Just a thought')
  expect(page).toContain('To do <small>1</small>')
  const csrf = /name="csrf" value="([a-f0-9]+)"/.exec(page)![1]
  const post = (path: string, fields: Record<string, string>) => handle(new Request(`${base}${path}`, { method: 'POST', headers: { Origin: base }, body: new URLSearchParams({ csrf, ...fields }) }), e, c)
  const moved = await post(`/t/${id}/status`, { status: 'doing', return: '/?status=todo' })
  expect(moved.status).toBe(303)
  expect(moved.headers.get('Location')).toBe('/?status=todo')
  expect((await getThought(e.DB, id!))!.status).toBe('doing')
  expect((await post(`/t/${id}/status`, { status: 'done', return: 'https://evil.example/' })).headers.get('Location')).toBe('/')
  expect((await getThought(e.DB, id!))!.status).toBe('done')
  await post(`/t/${id}/status`, { status: 'none' })
  expect((await getThought(e.DB, id!))!.status).toBe(null)
  // Editing: the control decides; typing #done into the text also works.
  await post(`/t/${other}`, { title: 'x', body: 'Just a thought #done', tags: '', status_field: '1', status: 'none' })
  expect((await getThought(e.DB, other!))!.status).toBe('done')
  await post(`/t/${other}`, { title: 'x', body: 'Just a thought #done', tags: '', status_field: '1', status: 'todo' })
  expect((await getThought(e.DB, other!))!.status).toBe('todo')
  // Delete from the list needs the confirmation box.
  await post(`/t/${other}/delete`, { return: '/' })
  expect(await getThought(e.DB, other!)).toBeDefined()
  expect((await post(`/t/${other}/delete`, { confirm: 'yes', return: '/?status=todo' })).headers.get('Location')).toBe('/?status=todo')
  expect(await getThought(e.DB, other!)).toBeUndefined()
})

test('the filter row shows only your own hashtags; AI suggestions stay in the full list', async () => {
  const e = env({ LOCAL_DEV: 'true' })
  const id = await addThought(e.DB, { text: 'Kiln schedule #clay', source: 'text' })
  await e.DB.prepare("INSERT INTO thought_tags (thought_id, tag, origin) VALUES (?, 'pottery', 'ai')").bind(id).run()
  const page = await (await handle(new Request('http://127.0.0.1:8790/'), e, ctx())).text()
  const row = /<ul class="chips" aria-label="Filter by your hashtags">([\s\S]*?)<\/ul>/.exec(page)![1]
  expect(row).toContain('#clay')
  expect(row).not.toContain('#pottery')
  expect(page).toContain('including AI suggestions')
})
