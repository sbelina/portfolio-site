/**
 * /api/count: anonymous usage counts (owner direction, 24 November 2026). Each accepted request writes one
 * row to Workers Analytics Engine: the event name, the page path and an optional short detail. Nothing
 * else is read or kept: no IP address, user agent, cookie, referrer or identifier. Counts are only taken
 * on the live hostname; previews and local runs answer 204 and store nothing.
 */
export interface CountStore { writeDataPoint(point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void }

/** Keep in sync with countEvents in src/analytics.ts. */
export const countEvents = new Set(['view', 'cta-hero', 'cta-band', 'cta-end', 'career-next-contact', 'resume-request', 'case-open', 'deep-dive-open', 'field-split', 'field-split-all', 'practice-open', 'practice-move', 'practice-play', 'explore-open', 'cfield-layer', 'cfield-point', 'career-era', 'contact-send'])
const liveHosts = new Set(['producingcuriosity.com', 'www.producingcuriosity.com'])
const empty = (status = 204) => new Response(null, { status, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } })

export async function handleCount(request: Request, store?: CountStore): Promise<Response> {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } })
  const url = new URL(request.url)
  if (!liveHosts.has(url.hostname) || !store) return empty()
  // Honour the browser's own signals on the server too.
  if (request.headers.get('DNT') === '1' || request.headers.get('Sec-GPC') === '1') return empty()
  const text = await request.text()
  if (text.length > 400) return empty(413)
  let body: { e?: unknown; p?: unknown; d?: unknown }
  try { body = JSON.parse(text) } catch { return empty(400) }
  if (typeof body.e !== 'string' || !countEvents.has(body.e)) return empty(400)
  const path = typeof body.p === 'string' && /^\/[\w\-./]{0,120}$/.test(body.p) ? body.p : '/'
  const detail = typeof body.d === 'string' ? body.d.replace(/[^\w\- ]/g, '').slice(0, 40) : ''
  store.writeDataPoint({ indexes: [body.e], blobs: [body.e, path, detail], doubles: [1] })
  return empty()
}
