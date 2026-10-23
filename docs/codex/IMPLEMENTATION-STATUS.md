# First development slice: W0–W2

Status: draft implementation, not a production release. Integration lead: root; specialist ownership covered content/revision integrity, solutions architecture, and reading design/browser verification. The task explicitly forbids merging, production deployment, DNS changes, purchases and publication of unreviewed content.

## Baseline and branch

- Handoff: `docs/codex-ia-backend-handoff`, commit `abaa9a9aa28dfc665f8b34816559209c797114b8`.
- Application baseline: main `0fb948124a5f02455818f10bbbdc53d2fafbe6b4`.
- New implementation branch: `feat/connected-reading-slice`. The working tree was clean before implementation; no existing work or content was removed.
- Read root AGENTS.md, the Codex index, full IA/backend brief, product context, implementation plan, evidence rules and open decisions before changes.
- Baseline Node 22.23.4, frozen npm install, TypeScript/Vite build, Worker dry-run packaging and 26 existing tests passed. A temporary source export of the clean handoff (not a worktree) was used to repeat baseline checks without mixing new specialist edits into its result.
- A read-only live check still found `/assets/index-DX1pnOiz.js`, matching the published baseline. No old audit finding was assumed to describe a new production failure.

## Implemented

### W0: inventory and source boundaries

The [generated migration ledger](generated/migration-ledger.json) inventories all 17 legacy cases/writings/archive records, current HTML anchors, 63 graph identities and 147 legacy edges. The recorded UUID maps in `content/legacy-ids.json` and `content/legacy-block-ids.json` are immutable migration identities, not IDs recomputed from titles.

`scripts/legacy-adapter.ts` converts existing content to version-1 **unreviewed restricted drafts**, preserving text and original format labels in the ledger without claiming publication approval or inventing dates/evidence. Original homepage content and graph remain intact. Proposed canonical paths in the ledger are not activated migrations. Legacy graph/tag edges remain legacy; unlabeled associations are not silently converted into approved assertions.

No separate Emergent source/export or reviewed canonical manuscript was supplied. Existing prototype metrics, contributions and permissions have not been independently verified. Missing inputs block their public canonical migration, not this isolated contract/template proof.

### W1: mechanical content and projection contract

`src/content/model.ts` validates versioned entries, blocks, evidence, assets, relationships, aliases, selected revisions and candidate records. Identity and revisions are separate; slugs are editable. The static registered comparison block accepts data only, not executable editor code. Unknown original dates remain null in drafts; approved entries require dates and attribution, plus contribution for non-poetry formats (see the follow-up poetry extension below).

`buildPublicProjection` selects exact ID/revision/digest references. A newer draft B can coexist with selected approved A. Changes after candidate approval, duplicate identity/revision/route/alias ownership, missing references, private endpoints, unsupported blocks and unsafe asset types fail validation. Symmetric edges are normalized; directed relations retain direction. Output is detached, deeply frozen and allowlisted. Backlinks are derived navigation, not inverse claims.

Digest/status checks do **not** authenticate an owner. Approval inputs in tests are explicitly synthetic; no real editorial approval has been manufactured. Trusted approval provenance, private source loading, authorization, deployment serialization and editor operations remain W3/W4. `content/public-release.json` truthfully records that no canonical content is approved; the default loader refuses any other state until a trusted integration exists.

### W2: connected reading templates and HTTP behavior

React/TypeScript/Vite are retained. A finite build adapter produces initial HTML and page metadata, then hydrates a separate reading entry. Native document links provide reload, new tabs, Back/Forward and scroll restoration. No client router/framework rewrite is introduced. Reading routes do not eagerly load the home graph bundle.

The local demonstration contains:

- `/investigations/` — collection.
- `/investigations/fixture-claims-handoff/` — clearly synthetic investigation.
- `/patterns/fixture-delivered-not-complete/` — clearly synthetic, provisional pattern.
- One explained outgoing `illustrates` relation and a directional incoming text backlink.
- Native evidence disclosure, contribution/scope and visible limitations.
- A synthetic old-path alias and a synthetic home-fragment compatibility link.

These are **not Sam's manuscripts, evidence, metrics, outcomes or approved publications**. Fixtures are generated only with `build:fixtures`, into `dist-fixtures`, and served with the isolated local Worker config. The default `dist` contains the existing homepage, a truthful empty canonical collection and useful 404 HTML; it has no synthetic article routes/content.

Worker `404-page` handling and trailing-slash normalization replace unconditional SPA success fallback. Unknown pages return real HTTP 404. Reviewed path aliases use finite server rules; URL fragments use a small client mapping plus useful HTML links. Existing real home fragments stay useful, with no false claim of server-side hash redirects. Unreviewed real case fragments are not redirected to synthetic fixtures. Object-prototype names cannot become compatibility redirect targets.

Home rendering is deterministic on server and first client render. Storage/motion/fragment decisions happen after hydration, with a StrictMode-safe one-time initialization guard. The intro now needs one action to unfold three automatic stages, retaining echoes, directional clicks/drags, automatic short dive, persistent first-visit memory, skip/replay and reduced-motion/failure behavior. Direct reading documents do not load the intro at all.

## Public/private and artifact boundary

Markdown is sanitized at build time and only prepared HTML is rendered. JSON bootstrap data escapes `<` and script-sensitive separators. Evidence locators are displayed safely; private locators/internal notes and owner-approval records are omitted. Public derivative bytes must match their selected checksum before copying. Active uploaded SVG is not supported by the new asset schema; existing legacy public assets are preserved separately.

Routes, collection cards, related links, public JSON, search input, graph input and sitemap derive from the same selected projection. Source maps are disabled. The default build audits all output files for source/fixture/private canaries and checks `fixture:false`. Clean Vite outputs and physically separate directories prevent stale synthetic routes surviving into production. An audit failure is a failed build, not permission to publish partial output.

A normal Cloudflare branch preview uses the default production-safe build. It cannot show the local synthetic investigation/pattern routes. It is not an authenticated preview of restricted material, and no protected draft-preview service is claimed.

## Run and inspect

```sh
npm ci
npm run build
npm run check:deploy
npm test
```

`npm test` builds/audits production first, then starts the explicit fixture build with the actual local Worker on port 4174. It exercises both privacy exclusion and useful connected reading. Install the documented Playwright browser, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` in this cloud environment.

To inspect the local synthetic slice without running tests:

```sh
npm run build:fixtures
npm run preview:fixtures -- --ip 127.0.0.1 --port 4174
```

To inspect the production-safe build locally:

```sh
npm run build
npx wrangler dev --local --ip 127.0.0.1 --port 4177
```

Initial HTML should already contain the page text. Unknown routes and fixture routes in the production-safe build must return 404. No browser query or storage flag can activate fixtures.

## Verification record

Baseline: build, packaging and **26/26 tests passed**. Specialist content/projection checks: **14/14 passed**. Focused reading browser checks: **8/8 passed** against actual local Worker routing. Final integrated run: **56/56 passed** on Node 22.23.4 and system Chromium, including the original 26 regressions. `npm ci`, application/tool type checks, production build, explicit fixture build, public artifact audit, and `npm run check:deploy` all passed. `git diff --check` passed. The checks run against actual local Worker routing, not an SPA dev-server fallback. CI and hosted-preview results are recorded separately in the draft PR.

Verified behaviors include negative privacy/reference/candidate tests, draft/live coexistence, Markdown sanitization, byte checksum mismatch rejection, actual 404 status, useful initial HTML and metadata, no-JS navigation, deep links/refresh, keyboard disclosures, explained relationship direction, modified-click/new tab, Back restoration, narrow reflow/text spacing and automated axe scans. An initial reading console error from the missing favicon was fixed and rerun successfully.

Manual verification is limited to browser/screenshot review of desktop and 320px reading layouts. Actual screen readers, physical mobile devices, representative-person comprehension tests and full WCAG conformance are **not** verified. Browser automation and viewport emulation do not replace them.

## Migration, recovery and rollback

No canonical source migration, private data import or production release occurred. Existing fragment IDs and public content remain in place. The legacy adapter is a draft inventory only; owner/source/rights review is required before selecting any imported revision.

For a failed branch proof, stop the local fixture Worker and regenerate from the preserved baseline/handoff. `dist` and `dist-fixtures` are disposable generated outputs; do not modify or delete source material to repair a build. Revert this feature branch through review if integration is rejected. No production rollback is needed because this task does not release anything. If a later release is authorized, record its exact approved application/content/assets, prior healthy Worker version and withdrawal constraints, then rehearse rollback before publishing. Never restore the old raw-TSX GitHub origin as a working recovery.

## Next bounded task and blockers

Run the private Git-backed authoring feasibility trial in [W3-FEASIBILITY.md](W3-FEASIBILITY.md), after reviewing this slice. It needs a private content repository, owner authentication/session verification, protected page **and asset** preview, exact candidate approval enforcement and relevant service access. Prove create Observation → three explained connections → save → reopen in a new session → private preview → approve exact candidate → publish → revise → restore without editing source. Test stale saves, denial, privacy and export/restore. Do not replace this with an editor mockup or localStorage persistence.

Before real canonical migration, obtain approved Claims wording, source/metric/contribution/rights review, an approved pattern/relationship interpretation, and the separate source required for any Emergent parity claim. No service purchase, custom OAuth, database or AI runtime is selected by this implementation.

## Follow-up implementation on the same feature branch

Merged latest handoff `1b39e59eae4d1838f52121bc9aa4d5e0b5211954` into the existing feature branch without conflicts. The 14 writing/workflow/structured-inventory files match that handoff byte-for-byte; all inventory approvals remain empty. `PAGE-REVIEW.md` and the Codex index now distinguish technical templates from the proposed real editorial pages. No review record became a publication allowlist, and no excerpt was imported as a complete work.

### Payload and poetry changes

`src/reading/page-data.ts` builds a page-specific payload: one current entry, its sanitized Markdown, relevant relationships, referenced evidence/assets and linked IDs/titles/paths. Collection cards contain metadata only; 404 payloads contain no content records. Full public indexes remain separate and are not fetched by reading pages. Tests compare an existing payload before/after adding an unrelated article and inspect actual generated HTML bootstrap data.

The content contract adds explicit `format: poetry` and literal-text `verse` blocks. Public projection retains format. Poems do not require or display the investigation contribution panel or automatic evidence layout; existing case/essay/field-note requirements remain. Literal text is React-escaped and CSS preserves whitespace with soft wrapping. The fixture includes indentation, blank lines, punctuation, literal markup and a long token to exercise narrow reflow. It is wholly synthetic, never an imported excerpt/manuscript.

Local poetry route (after `npm run build:fixtures` and `npm run preview:fixtures -- --ip 127.0.0.1 --port 4174`): `/perspective/fixture-verse-spacing/`. This URL is deliberately absent from the production-safe hosted preview and is not listed as a real investigation. Default artifact checks now explicitly reject the poem route/text and check that writing review files and the page inventory are not copied to the site.

### Authoring scope

W3 interfaces and local synthetic policy/contract proofs are preparation only. No durable save API, identity provider, protected preview service, approval authority or editor is implemented. See [W3 feasibility](W3-FEASIBILITY.md) for draft/publication rules, concurrency, authentication, page/asset protection, candidate binding, recovery and the smallest external dependency.

### Follow-up verification and recovery

Follow-up final local run: **69/69 tests passed** on pinned Node 22 and system Chromium, including all original homepage/intro regressions, four page-payload checks, five poetry checks and four test-only authoring-proposal checks. A clean `npm ci`, application/tool type checks, production/fixture builds, public artifact audit, Worker deployment dry-run, relative documentation links/fences and `git diff --check` passed. An initial clean install failed because the default home npm cache was unwritable; setting `npm_config_cache=/workspace/.cloud-tools/cache/npm` restored the frozen install without changing the lockfile or bypassing integrity/TLS.

The [separate independent reviewer](FOLLOWUP-REVIEW.md) found no substantive issue after integrated code/artifact inspection. Manual review covered the generated poetry screenshot at 320px and 200% text enlargement; literal markup, spacing and wrapped text were visible without horizontal clipping. Browser-toolbar zoom, real screen readers, physical devices, durable private saves, authenticated approvals and protected page/asset service behavior remain unverified. Prior 56-test evidence above describes the original slice. Remote CI and hosted-preview results for the resulting follow-up commit are recorded in draft PR #3, separately from this local evidence.

Recovery remains source-controlled: stop the local Worker, discard/rebuild generated outputs, or revert the follow-up commit through review while retaining the handoff merge and original slice. No production release occurred, so no live rollback is necessary. Do not delete manuscripts/review records to fix a build. The next bounded task is the authorized private W3 save/reopen trial; real publishing remains a later separately authorized step.
