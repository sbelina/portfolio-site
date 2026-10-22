# Implementation work packages

Status: future work. This document is a backlog, not a report of completed implementation. The first implementation instruction should identify the package(s) authorized. Continue necessary reversible work within that scope without repeated permission requests.

## W0 — establish baseline and migration inventory

Deliver:

- Current branch/commit, working-tree status, toolchain, CI and deployment facts.
- Inventory of existing case, writing, graph, section, and anchor IDs.
- Migration ledger: old location, content ID, proposed route, source/review status, feature parity, dependencies, and verification result.
- A small decision record for routing/prerender integration and schema compatibility.
- Evidence of baseline checks for implementation work, with environment failures distinguished from product failures.

Done when no existing route/content identifier is silently discarded, deployment assumptions are explicit, and the next slice is isolated. Missing Emergent source is a specifically recorded dependency for parity, not a reason to stop all schema/template preparation.

## W1 — content contract and approved public projection

Depends on W0.

Deliver runtime schemas for entries, blocks, relationships, evidence, assets, aliases, and a versioned release manifest. Keep immutable IDs and slug ownership separate. Create a migration adapter for existing data rather than hand-copying everything into JSX.

Write a pure public-projection builder that accepts explicitly selected approved revisions. Treat `public` visibility as necessary but insufficient for publication. Project only allowlisted fields and rights-cleared derivatives. Derive backlinks, route data, search/graph records, and sitemap input from that public projection.

Acceptance:

- Duplicate IDs/slugs/aliases and missing endpoints fail clearly.
- Directional versus symmetric edge rules remain correct.
- A relationship cannot expose a private or unselected draft endpoint.
- Changes after approval cannot alter a frozen candidate.
- Draft B of a live entry does not replace approved revision A.
- Restricted test content is absent from the public projection and generated artifacts.

## W2 — one connected reading slice

Depends on W1.

Implement Home orientation, an Investigations collection, an Investigation detail template, and one Pattern detail route. Use one reviewed investigation and supported pattern. Where approval is absent, use unmistakable non-production fixtures and prevent their publication.

Generate full initial HTML with page-specific metadata. Enumerate every approved route, including dynamic slugs. Preserve useful content without JavaScript, then enhance it. Configure proper not-found handling; avoid an unconditional index.html success response for unknown paths.

Acceptance:

- Direct URL, reload, modified-click, anchors, and Back/Forward work.
- Initial HTML contains the correct main text, title, description, and canonical.
- A nonexistent slug returns HTTP 404, not a soft 404 page with status 200.
- Old known home fragments navigate to their reviewed destinations; no false claim of server-side hash redirects.
- Direct article loads bypass the intro; home/replay retains authored behavior.
- Route changes establish orientation; Back restores reading position.
- Evidence disclosures expose expanded state and work with keyboard/screen reader.
- A related pattern link includes a human-readable rationale.
- No hydration mismatch or browser-only API access during initial build render.

Use the existing Playwright setup and current production build. Do not introduce pagination to a tiny collection just to demonstrate it.

## W3 — private authoring trial

Depends on W1 and a useful W2 preview. External credentials may be needed; complete independent local work before reporting an external blocker.

Trial Pages CMS against private content storage. Configure entry, relationship, evidence, asset, person, and topic collections with reference values stored as IDs. Home-page selections and navigation reference those same IDs.

The owner must be able to create an Observation with three explained connections, save it, reopen it in a new session, preview it, publish it, revise it, and restore an earlier revision without changing code. A static mockup or localStorage-only demonstration does not satisfy this requirement.

Acceptance:

- Incomplete drafts save; publication reports actionable validation errors.
- Credential/session behavior and repository authorization are verified in the actual deployment.
- Private pages, route-data payloads, originals, and derivatives deny unauthenticated access.
- A stale edit is rejected or resolved without silent data loss.
- Saved, approved, preview-ready, publishing, live, and failed states are distinguishable.
- Content and media export and restore are demonstrated.

If the trial fails, document the specific unmet requirement, alternatives, and maintenance implications. Do not jump to custom OAuth or a full custom CMS without a concrete reason.

## W4 — exact-revision publishing

Depends on W3 and agreed deployment access.

Create trusted candidate, preview, approval, release, withdrawal, and restoration operations. Prefer existing workflow capabilities before implementing a new API. Bind the candidate to content commit/revisions, application commit, schema, and asset hashes.

Acceptance:

- Saving does not publish.
- Owner approval binds the exact previewed candidate.
- Client-supplied identity/status/payload cannot grant publishing authority.
- Content changes invalidate approval for that candidate or require a new candidate.
- Builds cannot publish latest head in place of the approved snapshot.
- Production deployment is serialized; an old slow job cannot overwrite a newer release.
- Failed validation/build/deployment retains the previous healthy release.
- Health confirmation and release records distinguish deployed from merely queued.
- Restoring an entry creates a new draft; rolling back a release checks withdrawn content before exposure.
- Withdrawal removes public routes, generated listings, and controlled asset delivery as specified.

Production release is a separate authorized action. Rehearse the process privately first. Never use a public draft preview to approximate an authenticated preview.

## W5 — archive migration and collection growth

Depends on W2–W4 passing.

Migrate approved content in batches with text/count comparisons, rights checks, alias testing, and migration-ledger updates. Add archive filters and deterministic pagination only when volume warrants them. Search and the graph consume the same approved projection.

Acceptance:

- An author adds an existing content type without modifying routes/components.
- New content appears in appropriate cards, backlinks, and generated indexes.
- Home featuring remains an intentional selection.
- Page 2 has its own URL/canonical; page 1 aliases redirect; out-of-range pages 404.
- Filter changes reset pagination and result state survives return navigation.
- No draft enters the sitemap, search index, graph, assets, or build payloads.
- Graph edges preserve semantics and provide text alternatives.

## W6 — observe, refine, and experiment

Depends on a working publishing loop.

Run task-based findability and comprehension sessions. Check whether visitors can state the question, Sam's contribution, evidence, limits, and why a connection matters. Treat small samples as qualitative feedback, not statistical conversion proof.

Then consider local graph exploration, semantic zoom, contextual transitions, and registered interactive blocks. Load optional graph/experiment code only when useful. Validate motion preferences, mobile/touch behavior, zoom/reflow, and screen-reader use manually.

## Verification and reporting matrix

| Change | Checks |
| --- | --- |
| Documentation only | Relative paths/links, code fences, proposal/current-state labels, privacy, diff scope. |
| Content schema/projection | Runtime validation, negative privacy fixtures, referential integrity, deterministic output. |
| Routes/templates | Build, direct HTML/status checks, browser navigation, legacy links, hydration, accessibility. |
| CMS/auth/preview | Server authorization, session/CSRF as applicable, direct asset denial, stale-save/conflict tests. |
| Release pipeline | Exact-candidate, race/failure/idempotency tests, private preview, rollback/restore drill. |
| Migration | Ledger completeness, content comparison, source/rights review, aliases, public-artifact audit. |

Current repository runtime commands are `npm ci`, `npm run build`, `npm run check:deploy`, and `npm test`, using the pinned Node version. Inspect scripts and CI if changed. Report external or environment failures candidly; never mark a planned test passed.

Each work package should end with: changed behavior, relevant evidence, tests executed, remaining dependencies, migration impact, and rollback steps. Keep completed work and current blockers in an implementation status document rather than repeatedly rewriting this backlog as if future steps were finished.
