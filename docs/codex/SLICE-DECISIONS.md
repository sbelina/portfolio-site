# W0–W2 technical decisions

Scope: the first development slice, based on handoff commit `abaa9a9aa28dfc665f8b34816559209c797114b8`, whose application baseline is `0fb948124a5f02455818f10bbbdc53d2fafbe6b4`. The current task authorizes reversible development and a draft PR. It does not authorize a production release, DNS changes, paid services, or publication of unreviewed content.

This record explains the choices for the slice. Build/test outcomes and any hosted preview are reported by the integration lead separately; a documented design is not proof that its runtime checks passed.

## 1. Keep native document navigation

Use React/TypeScript/Vite to generate a small multi-page static site. Render reading pages during the build, enumerate their paths from the public projection, and use ordinary links. A separate reading client hydrates only reading-page enhancements. The existing home application retains its authored introduction and graph.

This gives direct loads and refreshes useful HTML while preserving native modified clicks, new tabs, Back/Forward, and scroll restoration. The page path owns the article; a fragment owns its section; a disclosure is local UI state. The client must not reset scroll/focus on every history restoration. Direct article entry does not initialize or replay the home introduction.

Alternatives considered:

- A client router alone would leave the initial-HTML and real-404 requirements unresolved.
- React Router framework prerendering is viable, but changes build conventions and adds a router framework before this bounded slice needs one.
- A full framework migration or custom routing service adds maintenance unrelated to the first proof.

A small Vite build/render adapter is acceptable only while it stays explicit: a finite route manifest, shared server/client components, safe JSON serialization, and tests against actual built documents. Do not evolve it into an untested general framework. Initial server and client output must agree; browser storage, motion queries, location, and scrolling belong behind client-only effects.

## 2. Make HTTP behavior part of the implementation

The existing Worker serves a compiled static site, but its SPA fallback returns a successful home document for arbitrary paths. The slice replaces that fallback with static `404-page` handling and generates a useful `404.html`. Use one trailing-slash convention in output paths, links, canonicals and aliases.

Check status codes against the local Worker runtime, not Vite's development fallback. Unknown slugs must finish with HTTP 404; rendering a “not found” React view with HTTP 200 is insufficient. Slash normalization and reviewed path aliases may redirect, but must never accept an arbitrary external redirect target.

HTTP requests do not contain URL fragments. Keep existing home anchors useful unless a reviewed mapping has an actual selected destination. A home fragment mapping is a client compatibility behavior, not a server redirect. Retaining a legacy case anchor does not approve migration of its claims to a new canonical article.

## 3. Separate identity, revision, route and release

An immutable content ID identifies the subject; a revision identifies a particular document; a slug/alias identifies a public location. Renaming a title or slug must not rewrite relationship endpoints. Do not derive IDs from titles.

The store may contain approved revision A and a newer draft B for the same ID. A release selects the exact approved A revision and digest. It must not discover or substitute “latest” B during rendering. Changes to selected records or their referenced assets invalidate the candidate rather than altering a previously frozen projection.

Typed relationship records are canonical. Derive outgoing/incoming navigation from them; a backlink is not an inverse claim. Normalize symmetric `shares_pattern` endpoints so reversed duplicates fail; preserve direction for other relation types. Rationale and any qualification must be readable in text without a graph.

A runtime schema and digest comparison establish internal consistency. They do not authenticate an owner or prove permission to publish. Trusting a JSON `approvedBy`, role, status field, or workflow payload as authorization is explicitly outside the contract. W3/W4 must obtain and verify approval through a trusted authenticated boundary.

## 4. Compile only an allowlisted public projection

The build input boundary is the selected approved-public projection, not the complete authoring store. Resolve all referenced entries/evidence/assets/aliases before rendering. Public visibility is necessary but insufficient: selected revisions, review states, rights-cleared derivatives, and reference integrity must also pass.

Do not send restricted records to a browser and filter them there. The public projection must omit private source locators, internal notes, credentials, unselected drafts, originals, and editorial authorization records. Explicitly allowed public evidence citations still require source/rights review; an internal document title or URL can itself reveal restricted information.

Test both the returned projection and final artifacts: HTML, JSON, JavaScript, source maps if enabled, sitemap, indexes, graph payloads and asset files. Error messages and screenshots must not dump private source material. Negative tests use unmistakable synthetic canaries, never actual confidential research.

The old homepage already contains public prototype summaries and metrics. Preserving that existing behavior is not owner approval of those claims, a new evidence review, or permission to migrate them into publication-ready content. The migration adapter must retain that ambiguity rather than manufacture approval, source provenance or missing dates.

## 5. Separate safe fixtures from production

No exact source-reviewed Claims manuscript, metric ledger, rights decision, or approved pattern revision was supplied for this task. Therefore the connected demonstration uses clearly labelled synthetic fixtures rather than claiming to describe Sam's real work. Fictional examples must not introduce plausible fabricated outcomes or imply publication approval.

Fixture generation is an explicit development/test build mode. The default production build and the normal Cloudflare branch build must use the approved selection and exclude fixture entry bodies, routes, relationships, aliases and asset payloads. Do not expose fixture activation through browser query parameters, localStorage, a public `VITE_*` flag, or another runtime switch.

A public branch preview is not a protected draft preview. It may serve the production-safe build, or separately approved public-safe synthetic demonstrations if explicitly configured, but must never contain real restricted drafts. `noindex`, a hidden link, and an obscure version URL do not enforce access control.

When production has no selected canonical entries, preserve a truthful empty collection instead of silently selecting legacy drafts or fixtures. Reviewed content can later populate the same templates without modifying their route code.

## 6. Keep failure and recovery bounded

Build validation failures stop artifact generation/publication. Do not partially update a live release from a failed projection. Rebuild from a clean output directory so removed routes and old fixture files cannot survive into a later production artifact. Generate aliases, collection cards, related links and sitemap from the same projection to avoid stale indexes.

The current task does not implement an authenticated editor, private preview server, deploy queue, withdrawal service or automatic production rollback. It also does not establish release serialization merely by generating a manifest. Those remain W3/W4 work with explicit tests and protected credentials.

For this draft slice, recovery is source-controlled: preserve the baseline and original content; revert the feature changes and regenerate the prior verified artifact if the branch proof fails. Any later production rollout requires its own authorization, exact revision/artifact record, health checks and known-good recovery version. Do not restore the historical raw-TSX GitHub origin as if it were a functioning site.

## 7. Verification limits and next gate

The useful proof for W0–W2 is a deterministic approved projection, meaningful static HTML, a connected text reading path, compatible old links and actual Worker HTTP behavior. Unit/integration and browser checks should exercise failures, not merely snapshot the implementation.

Automated axe scans, accessibility-tree checks, keyboard interactions and viewport emulation are distinct from real screen-reader, physical mobile and representative-person testing. Do not claim WCAG certification or comprehension results from automation.

The next bounded task is the private authoring feasibility trial in [W3-FEASIBILITY.md](W3-FEASIBILITY.md). The unavailable Emergent source remains a feature-parity dependency; it does not justify discarding existing functionality or block this isolated contract/template proof.

### Inspection of the default build artifact

The architecture review inspected the integrated default `dist` without rebuilding it: the route manifest declares `fixture: false`, with only Home and `/investigations/`; the new public content, search and graph projections contain no selected entries; the sitemap lists those two paths. The home document contains its existing reading content, the collection contains an explicit empty state, and `404.html` contains useful recovery links and `noindex` without an incorrect canonical URL. Each document has one main landmark. Reading documents load the separate reading entry rather than the home graph application, and the generic Vite reading shell is removed.

The fixture/private canaries, private metadata field names and source/sourcemap artifacts checked by the audit were absent. This is evidence for the tested allowlist/exclusion boundary, not proof that an arbitrary unknown secret could be recognized automatically. HTTP status and browser behavior still require the Worker/browser test results; inspecting a `404.html` file alone cannot establish its response status.
