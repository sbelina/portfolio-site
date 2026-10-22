# Repository and deployment audit

Inspected October 22, 2026 (America/Chicago). Product authority: Sam Belina's engineering directive and “Missing Product Context & Non-Negotiable Decisions” supplement. These documents describe proposals where marked; they do not approve a migration or release.

## Confirmed production failure

A real Chromium inspection of https://producingcuriosity.com/ returned HTTP 200, an empty `#root`, and this console error:

> Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream".

The HTML requests `/src/main.tsx`. That URL serves raw TSX as `application/octet-stream`. Even changing its MIME type would not compile TypeScript, resolve the React package imports, or process CSS. This is a deployment artifact/origin problem.

Earlier in this session the domain returned GitHub Pages' “There isn't a GitHub Pages site here” 404. The latest inspection now receives HTML, but still from the GitHub origin, with `x-github-request-id` and `x-github-edge-region` response headers. A successful HTTP response alone did not fix the application.

The GitHub Pages API reports legacy publishing of `main:/` using Jekyll. Its successful deployment job does not run the Vite production build. After the owner's CNAME change, GitHub main advanced from `7eab47a` to `ece7ec75a620cda514b6d7ec39d5ec9cf334afd4`; the stability branch starts at that exact latter commit. No remote main changes have been overwritten.

https://portfolio-site.sami-belina.workers.dev/ serves compiled `/assets/index-AwYqU5qY.js` and `/assets/index-CHQVslCH.css`. The JS hash matches the original checkout's local build. Chromium mounts the content and introductory question there without console errors. This is Cloudflare Workers, not Pages. It is consistent with the GitHub prototype; it is not evidence of an Emergent export.

Public DNS showed Cloudflare nameservers/proxied apex addresses. `www.producingcuriosity.com` returned NXDOMAIN at the earlier check. Proxy addresses cannot reveal the configured origin. Cloudflare account routing, preview configuration, and deployment settings are not accessible through a connected management tool. The owner is correcting domain routing separately.

No custom orange cursor exists in this checkout. The reported orange-cursor-only inspection cannot be attributed to intro animation on current evidence. The module-loading failure is independently reproducible.

## Architecture inventory

- React 19, TypeScript, Vite 8; static SPA, no router or backend. Existing public destinations are fragment URLs, not full investigation pages.
- `src/data.ts`: 6 cases, 5 writings, 6 archive summaries, 63 graph nodes, 147 edges. No duplicate node IDs or orphan edge endpoints were found. 36 edges have no relation label; others use prose labels without IDs, rationale, approval, or evidence metadata.
- `App.tsx`: public case summaries, practice, notes, archive, contact; no editing or persistence of content. Some practice/editorial prose also lives directly in JSX.
- `ConnectionGraph.tsx`: authored fixed positions, layered reveal, native buttons and text alternative. Keep these. Text traces treat connections as undirected, even when relation language is directional. Relationship editing, explicit direction, and review are future work.
- `IntroExperience.tsx`: question → three attempts per step × three steps → dive → main; intentional resistance, mirrors and breakthrough. Main content is already rendered after the intro, not conditionally withheld.
- No Content Studio, Editor's Assistant, Thread Review, owner authentication, protected drafts, editorial revision history, or media rights management found here. This says nothing about an unavailable Emergent project.
- No secrets required to run the prototype. No private service or editorial storage was introduced.

## Priorities and verified code changes

| Priority | Finding | Correction / ownership |
|---|---|---|
| P0 | Domain serves source instead of compiled site | Attach apex and www to the existing working Worker; verify actual HTML, bundle MIME, mounting, and navigation. Owner Cloudflare operation; no production routing changed by this branch. |
| P0 | `sessionStorage.getItem` can throw during App initialization and unmount the entire site | Fail open to content when storage or motion API access fails; tolerate storage writes failing. |
| P0 | Intro completion sets storage but never dismisses intro; focus code consequently does not run | Dismiss on completion/skip; focus main and restore content position. Preserve existing deep links. |
| P0 | Window-level Space handling prevents native skip-button activation during steps | Scope gesture handlers to intro; leave native controls, modifiers, and main content alone. |
| P0 | Reduced motion still required the introductory sequence | Bypass intro by default under reduced motion. Replay remains optional with direct skip. |
| P0 | Timer callbacks survive interruption/replay; intro render failures can affect root | Cancel pending timers on reset/unmount; isolate intro render errors. |
| P0 | Empty HTML root gives no recovery if JavaScript fails | Static readable identity/contact fallback, replaced by React on successful mounting. This is limited fallback, not a complete non-JS archive. |
| P1 | Workflow starts with `yamlname`, pins Node 20, enables lockfile cache without a lockfile | Correct workflow key, honor Node 22 pin, commit generated npm lockfile, use `npm ci`, build and browser tests. |
| P1 | Legacy accessibility case compresses distinct AI restoration and human review outcomes | Owner-approved source reconciliation before rewriting. Do not treat current metric or causal phrasing as independently verified. |
| P1 | No content rights, publication visibility, contributions or evidence approval model | Add through approved structured-content phase; do not publish employer evidence or infer rights from existing files. |

The branch preserves layout, authored colors, cases, graph data, intro metaphor and existing fragment IDs. It does not silently adopt the new IA or replace newer content. Two accessible exits remain available: global “Skip to main content” and the authored intro skip button. Main content remains mounted during intro errors. Question text is legible even if its reveal timer fails.

## Source-of-truth and feature parity gate

| Capability | GitHub + observed Worker | Latest Emergent | Required preservation decision |
|---|---|---|---|
| Public content / reading layout | Static prototype present | Unavailable | Compare entry-by-entry text, contributions, IDs and layouts; owner selects approved version. |
| Intro states | Four-step interaction present | Unavailable | Record states, timing, inputs and failure paths before replacing any implementation. |
| Editor's Assistant / Thread Review | Not found | Reported by owner, not inspected | Export source, workflows, prompts, review states and saved records; do not rebuild or discard blindly. |
| Owner auth / drafts / publication | Not found | Unknown | Identify identity provider, server authorization, data store, export and rollback before migration. |
| Unpublished assets | No research-source folder in tracked checkout; ignored path documented | Unknown | Inventory privately, establish rights and visibility. Never put private inventory or exports in a public PR. |
| Connections / stable URLs | 63 nodes, 147 edges; hash anchors | Unknown | Preserve IDs and old URLs, map equivalents, review rationale and directional meaning. |

Until Emergent access/export and owner review are available, GitHub is the inspected baseline, not the declared latest approved editorial source. No content migration is authorized by this audit.

## Validation and limits

Four targeted regression tests failed before fixes: blocked storage, skip dismissal, reduced-motion bypass, and Space activation during intro. The initial post-fix suite passed 11 tests. Expanded checks cover full step progression, replay interruption, narrow reflow, touch input, error recovery and link preservation; see PR validation and test report for the final run.

Automated axe WCAG A/AA scans cover intro and main. Chromium keyboard interaction and screenshots are tested. These do not establish WCAG 2.2 AA compliance. Actual screen-reader testing, real iOS/Android touch, 200–400% browser zoom, text-spacing overrides, full contrast/color-vision review, and owner comprehension testing remain release gates. No private-data security or editorial tests can pass before that system exists.

Local production-build preview is tested separately from the live production domain and live Worker. No externally hosted branch preview, merge, domain change, or production release is claimed. See DEPLOY.md for setup and rollback.

### Final local result

`npm ci` completed from the committed lockfile. `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm test` passed **20/20** checks on Node 22.23.4 and Chromium 154.0.8037.57; the test runner rebuilt with TypeScript and Vite before testing the production artifact. `git diff --check` passed. Automated accessibility scans returned no violations for the selected WCAG A/AA tags on the initial intro and main view; this does not cover all graph states or replace manual verification.

Evidence captured from the inspected live domain and local production-build preview (not a hosted branch deployment):

- [Live domain with module failure](evidence/production-module-failure.png)
- [Local preview: authored introduction](evidence/preview-intro.png)
- [Local preview: content after skip](evidence/preview-main.png)
- [Local preview: 320px content](evidence/preview-320.png)

The owner reconfirmed `sbelina/portfolio-site` and did not supply a separate Emergent source. Its parity remains unknown. The known Cloudflare address is already recorded above; no additional Pages link is needed to continue this stability work.
