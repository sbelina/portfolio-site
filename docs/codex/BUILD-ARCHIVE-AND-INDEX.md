# New index and preserved build — 4 November 2026

Owner direction: check Cloudflare authentication, keep the agents, archive the current build in a folder and add a footer review link on a new index. Owner clarified: **replace homepage; archive current site**.

## Actual state and decisions

Work branch: `feat/build-archive-index`, from remote main `418efb750fe89c754b890b99a605213fed5ffddc`. The initial tree was clean. Unrelated Site copy/private-content worktrees remain untouched.

Cloudflare check: managed environment reported current observations, enforced unrestricted network policy and no configured secrets/outbound identities. Actual pinned Wrangler `whoami` returned **not authenticated**. `codex mcp list` contained no Cloudflare registration in this restored runtime; the earlier runtime-local installation is not an authenticated persistent connection. This task did not start another OAuth flow, request credentials in chat, change DNS/security, or deploy. Live apex/workers.dev returned200 with the older home-pDxPFP4r bundle; the reviewed map build was not observed live. Do not mistake GitHub's successful Pages/CI checks for a Worker release.

The archived build is the latest reviewed production artifact from current main, not a fresh copy of the older live page with its withdrawn claims. It retains the previously reviewed corrections. Source commit, tree, actual capture time and deployment uncertainty are explicit in `capture.json`. No new case manuscript, source approval or outcome is inferred.

## What is preserved

`build-archives/2026-11-04-418efb7/` contains:

- `original/`: all24files of the default production build captured before index changes, byte-for-byte.
- `review/`: a self-contained25-file replay built with an explicit `/builds/2026-11-04-418efb7/` Vite base. It retains the old interface/content; compatibility changes scope local links/assets, set noindex metadata and add separate archive-notice chrome outside the React root.
- `capture.json`: source/adapter revisions, timestamp, deployment status, original/review inventories, byte counts and SHA256 checksums.
- `preserved-agent-files.json`: original hashes for16agent/inquiry/workflow/studio and writing-review files. They remain unchanged in the working repository.

The review adapter was built at `ed3d83cfff418d4d7b99931db94bf7b14c1bc3d2`. The original artifact is separate from this path-compatible replay; do not claim every review byte equals the original. The archive notice identifies the historical build and links to the current index. It adds no tracking or service dependency. Existing p5 license/source notices remain intact.

Agent instructions, Systems Inquiry guidance, six-pass review workflow, saved review records and private authoring code remain active in their existing locations. The new index does not replace them with new agents, a CMS or a new framework. Historical browser bundles contain public application code only.

## Routes and reading

| Route | Actual behavior |
| --- | --- |
| `/` | New short index retaining Producing Curiosity, Sami's approved thesis/question, contact, shared condensing header and experiment footer. |
| New index footer | **Review the previous build →** opens the frozen review copy. |
| `/builds/2026-11-04-418efb7/` | Complete prior homepage, three-action intro/replay, map, case summaries, writing/archive descriptions and historical footer. |
| `/builds/2026-11-04-418efb7/investigations/` | Captured truthful empty collection, with scoped navigation. |
| `/builds/2026-11-04-418efb7/experiments/reveal-hidden-work/` | Captured illustrative experiment, static explanation and optional lazy p5 animation. |
| Old `/#claims-operations` and other known section hashes | New index uses a strict known-ID list to replace the URL with the historical section and preserve query parameters. Direct archive sections bypass intro. |
| Old fragments without JavaScript | Native fallback disclosure exposes a real link to the archived section. Current index/contact anchors stay local. Unknown/malformed fragments do not become redirect targets. |
| Existing reading/experiment routes outside archive | Retained. No new manuscripts selected. |
| Unknown archive/private/raw-source paths |404. Original raw artifacts and agent/source records are not copied into public delivery. |

The new index has no mandatory intro; the previous introduction remains fully reviewable in the archive. New homepage replacement was explicitly requested. This is not a claim that a new experimental design improves comprehension.

## Build and integrity

`src/public-path.ts` scopes absolute local links for the archive replay; external and fragment links keep native behavior. Root builds remain `/`. `scripts/build-archives.ts` validates strict capture metadata, rejects symlinks/unlisted files/changed bytes, audits both artifacts, and mounts only the frozen `review/` plus harmless capture metadata. Each normal build verifies and copies existing historical bytes; it never silently rebuilds them from current source. No recursive inclusion of new builds into old snapshots.

Archive pages have both noindex HTML and a root `/builds/*` X-Robots-Tag rule, and stay out of the sitemap. This is a public history feature; noindex is not a privacy control. The public-artifact audit recursively checks archive output for fixture/private markers. Canonical manuscript selection remains empty.

`scripts/prerender.tsx` renders the new index in the default production build. Explicit fixture builds retain the old home component at `/` for its established regression suite and synthetic reading demonstrations. Both builds mount the real frozen archive. Playwright runs two actual Workers: fixtures on4174 and default production on4175. Dedicated new tests target4175; fixture-only assertions are not presented as verification of the new production index.

## Local review

```sh
npm run build
npx wrangler dev --local --ip 127.0.0.1 --port 4175
```

Open `/` and use its footer link; also inspect the archived collection/experiment and old fragment routes. Build output is disposable; the versioned source archive is not. Tests use `npm test`; never deploy `dist-fixtures` or `dist-studio`.

## Maintenance and recovery

This slice selects one immutable archived build. A later archive needs a new ID/folder and explicit catalog support; do not replace old bytes or recompute checksums merely to silence a failure. Capturing future builds must exclude already-mounted history to avoid recursive snapshots. No generic capture/editor/publisher is claimed.

To restore the previous homepage, revert the index/mount implementation through review and rebuild. Keep original/review artifacts and agent records intact; do not reset unrelated worktrees. The scoped-path adapter defaults to root behavior and can remain or be reverted separately. No storage migration, DNS edit or live release occurred, so no production rollback is required for this task. Publishing later requires a successful authenticated Cloudflare deployment and fresh live checks.

## Verification record

Automated on pinned Node22.23.4:

- Default TypeScript/tools/Vite build, prerender and recursive artifact audit passed:61publicfiles;6public routes, including3frozen review routes. No new dependencies or fresh install; existing lockfile installation used.
- Full `npm test` passed **139/139** (`/tmp/pc-build-archive-nov04/tests.log`). Original130regressions remain, plus9new archive/production-index tests. A first test-loader invocation required native JSON import attributes; corrected before successful suite. No application failure was hidden by that setup correction.
- After final notice/icon/footer refinements, production build and `npm run check:deploy` passed, and **14/14 affected archive/output/SEO checks passed** (`final-focused.log`). No full-suite repeat for these bounded refinements. The archive test now actually loads the lazy p5 chunk, creates a canvas and resets it, and checks historical-page requests stay in the archive namespace.
- `npm run test:studio` **11/11 passed** and `npm run check:studio` packaging passed (`studio.log`, `studio-package.log`). Existing private workflow preserved; no hosted sign-in/publisher or new restart drill claimed.
- Corrupt historical bytes are rejected. Audit searches nested files for private markers; private fixtures/original source/studio routes are404. Original24files and all25review files match their own inventories.16agent/workflow/review hashes remain unchanged.
- Keyboard footer navigation, legacy fragment/query routing and intro bypass, no-JavaScript/touch fallback,320px200% text reflow, archive noindex headers, proper404, escaped source content and axe checks passed. Automated checks do not establish WCAG conformance.
- `git diff --check` passed. No lint script exists. Agent/source archives were not moved out of their working locations.

Manual visual inspection: actual production Worker captures at1440px and390px of the new index/footer and historical page. Corrected an unsupported external-arrow font glyph with semantic SVG and made review chrome persist through the old page's automatic scroll, with reserved bottom reading space. Final probes recorded no horizontal overflow or browser errors and a visible archive notice at both sizes. Screenshots: `/tmp/pc-build-archive-nov04/index-1440.png`, `index-390.png`, `footer-390.png`, `archive-390.png`; probe record `visual-check.json`.

Unverified: physical devices, real screen readers, native browser zoom, human comprehension/findability and field performance. Cloudflare is unauthenticated; no hosted preview or production deployment is claimed. Remote CI belongs to the draft PR and is separate from local results. A later release requires actual authenticated build/deployment and live HTTP/browser verification.
