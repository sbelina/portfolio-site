import { handleDeepDive, type DeepDiveEnv } from './deep-dive'

/**
 * The site is static assets. This Worker runs first only for /deep-dive/* (see wrangler.jsonc
 * `run_worker_first`); every other request is served by the assets layer exactly as before.
 */
export default {
  async fetch(request: Request, env: DeepDiveEnv): Promise<Response> {
    const { pathname } = new URL(request.url)
    if (pathname === '/deep-dive' || pathname.startsWith('/deep-dive/')) return handleDeepDive(request, env)
    return env.ASSETS.fetch(request)
  },
}
