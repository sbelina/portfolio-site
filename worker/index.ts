import { handleDeepDive, type DeepDiveEnv } from './deep-dive'
import { handleCount, type CountStore } from './count'
import { handleContact, type ContactEnv } from './contact'

/**
 * The site is static assets. This Worker runs first only for /deep-dive/*, /api/count, /api/contact and the retired /builds/*
 * addresses (see wrangler.jsonc `run_worker_first`); every other request is served by the assets layer.
 */
export default {
  async fetch(request: Request, env: DeepDiveEnv & ContactEnv & { COUNTS?: CountStore }): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/api/count') return handleCount(request, env.COUNTS)
    if (pathname === '/api/contact') return handleContact(request, env)
    if (pathname === '/deep-dive' || pathname.startsWith('/deep-dive/')) return handleDeepDive(request, env)
    if (pathname === '/builds' || pathname.startsWith('/builds/')) return retiredBuild(request)
    return env.ASSETS.fetch(request)
  },
}

/**
 * Previous editions of the site are retired from public delivery.
 * They are preserved privately; every old address, including nested assets, answers 410 Gone.
 */
export function retiredBuild(request: Request): Response {
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>This version has been retired — Producing Curiosity</title><style>body{font:1rem/1.6 system-ui,sans-serif;max-width:36rem;margin:4rem auto;padding:0 1rem;color:#111716;background:#f3efe7}a{color:#8a2f08}</style></head><body><main><p>410 · Retired</p><h1>This earlier version of the site has been retired.</h1><p>Its investigations are now published in the current edition.</p><p><a href="/investigations/">Read the investigations</a> or <a href="/">go to the homepage</a>.</p></main></body></html>`
  return new Response(request.method === 'HEAD' ? null : html, { status: 410, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex', 'X-Content-Type-Options': 'nosniff' } })
}
