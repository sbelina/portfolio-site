# Development, preview and release

The observed live Cloudflare deployment is a **Worker** named `portfolio-site`, at `https://portfolio-site.sami-belina.workers.dev/`. The old GitHub Pages branch/Jekyll deployment serves raw application source and is not a valid Vite deployment. No change to production routing is made by the stability branch.

## Local development and verification

Use Node 22 (at least 22.12; `.node-version` is the CI pin):

```sh
npm ci
npm run dev
```

Production-build preview and checks:

```sh
npm run build
npx wrangler dev --local --ip 127.0.0.1 --port 4175
```

In another terminal, request the root and its referenced JS/CSS. Expect HTTP 200, JS with a JavaScript MIME type, and compiled `/assets/` references, not `/src/main.tsx`. Then verify mounting and interaction in a browser; status codes alone are insufficient.

```sh
npx playwright install --with-deps chromium
npm test
```

Tests build production output and start the isolated fixture Worker on port 4174, run Chromium and axe checks, and retain traces on failure. When using an already installed compatible Chromium in this cloud environment:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test
```

HTML report: `playwright-report/index.html`; screenshots/traces: `test-results/` (ignored). CI uploads these as `browser-results`. Do not include restricted content in public CI artifacts. Local tests do not establish hosted preview or production readiness.

## Cloud environment

Use the existing isolated checkout at `/workspace/portfolio-site`; do not create a worktree unless requested. Activate the installed Node 22 in each shell:

```sh
export PATH=/workspace/.cloud-tools/node22/node_modules/node/bin:$PATH
cd /workspace/portfolio-site
npm ci --cache /workspace/.npm-cache
```

Processes do not survive environment restoration: restart dev or preview as needed. The prototype needs no application secrets or runtime variables. The separate loopback-only local writing Worker implements a synthetic D1 trial; hosted CMS infrastructure remains unimplemented. See docs/codex/PRIVATE-WRITING-TRIAL.md.

## Existing Worker: inspect before changing configuration

In Cloudflare **Workers & Pages → portfolio-site**, inspect the current Git integration and its successful build. Preserve current settings until a branch preview has demonstrated a replacement. The required artifact is Vite's `dist/`; production branch is `main`; build command is `npm run build`; runtime/build Node must honor Node 22. Do not replace the Worker with a Pages project solely because older instructions used Pages terminology.

The checked-in `wrangler.jsonc` explicitly configures the existing `portfolio-site` Worker to serve only `dist`, with finite static pages, real404 handling and version preview URLs. `npm run check:deploy` validates packaging without uploading or requiring credentials. `npx wrangler dev --local --ip 127.0.0.1 --port 4176` runs the actual local Worker runtime. The Git integration can use `npm run build` followed by `npx wrangler deploy` for production and `npx wrangler versions upload` for branch previews. Do not overwrite unknown account-side settings; inspect any failing build log. No Cloudflare credentials are present in this checkout.

For a new Pages project only, use repository-root build directory, `npm run build`, output `dist`, and Node 22. A successful GitHub Actions build is not itself a Cloudflare deployment.

## Domain correction (owner-controlled)

The audit reproduced a module MIME error at `producingcuriosity.com` while the Worker URL mounted correctly. Under **portfolio-site → Settings → Domains & Routes**, add the apex as a Worker **Custom Domain**. Cloudflare manages that routing/DNS record; do not manually invent a Worker IP or point a CNAME to the workers.dev address. If blocked by an old `@` GitHub DNS record, record the previous value and settings before replacing the conflict through the Custom Domain flow. Inspect existing redirects, Worker routes, origin rules and DNS conflicts as applicable.

Add `www.producingcuriosity.com` and, once active, configure its canonical redirect to the apex. Preserve unrelated DNS records, especially mail. Then separately inspect both hostnames, HTTPS, root HTML, built assets and React mounting in a fresh browser session. Do not assume DNS propagation proves the origin is correct. Canonical metadata in HTML does not route traffic.

## Preview and production gates

1. Push a feature branch and open a draft PR; never push directly to main.
2. Configure/inspect the Cloudflare branch preview for this exact commit, keeping production branch main. A local preview is available now; a hosted branch preview is not created by npm commands or PR creation.
3. Verify preview independently: first/repeat visits, mouse/keyboard/touch skip, full intro progression, replay and interruption, reduced motion, blocked storage, main links, text/visual graph, 320px reflow and readable fallback with JS unavailable. Run automated checks and inspect console/network.
4. Complete representative screen-reader, actual mobile, zoom/text-spacing and contrast/color-vision checks; automated axe is insufficient. Reconcile editorial source and rights before any content migration.
5. Sam reviews exact preview and changes, then explicitly authorizes the production merge/release. No agent should merge or route a preview to production without that authorization.
6. After deployment, recheck production separately; save the release identifier and prior working version.

## Rollback

Before release, record the current Worker version/build ID, Git SHA, domain/route values and DNS settings; verify the selected prior version actually serves the working compiled site. Preserve the current content and assets separately before any migration. Never include private snapshots in the public repo.

If a release fails, use Cloudflare's version/deployment history to restore the recorded known-good Worker version where available, or redeploy the exact known-good compiled artifact. Verify HTML, JS/CSS, mount, links and intro bypass again. Roll back source with a reviewed revert PR rather than rewriting main history. A routing change can be restored from recorded settings if necessary, but the known broken GitHub origin is not a working application rollback. No production version was changed during this audit, so no rollback was executed.

## W0–W2 development slice (not released)

The connected reading work is isolated in a feature branch based on the Codex handoff. This task does **not** authorize merging, production deployment, DNS changes or publication of unreviewed content.

The default `npm run build` now prerenders useful home/collection/404 HTML into `dist`, then audits public output. No canonical manuscript has approval, so the selected public content is empty and the existing legacy homepage remains available. `404-page` handling replaces the generic SPA success fallback; test routes against the Worker runtime, not Vite's SPA preview.

Synthetic demonstrations use a separate build and Worker configuration:

```sh
npm run build:fixtures
npm run preview:fixtures -- --ip 127.0.0.1 --port 4174
```

This writes only `dist-fixtures` and serves `/investigations/fixture-claims-handoff/` and `/patterns/fixture-delivered-not-complete/`. Fixture labels are mandatory. Do not deploy this directory through the production Worker. The normal Worker configuration continues to point only to `dist`. Tests explicitly start the fixture build/runtime and do not publish anything.

A normal hosted branch preview contains only the production-safe empty selection; it does not demonstrate the unapproved synthetic article routes remotely. It is not a protected private CMS preview. See `docs/codex/IMPLEMENTATION-STATUS.md` for exact verification, limitations, migration and rollback guidance.

## Integrated release scope

See [the integrated release record](docs/codex/INTEGRATED-SEO-RELEASE.md). The normal public build excludes manuscript fixtures, private studio output and local state. The existing hidden-work illustration is intentionally public. SEO metadata and sitemap are generated from the public route inventory; alternate workers.dev hosts receive noindex headers. A Vite preview is useful for layout but does not establish Worker404/redirect/header behavior.
