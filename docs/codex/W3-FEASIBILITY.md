# Next bounded task: private Git-backed authoring feasibility

Status: preparation for W3, not an installed editor or a proven publishing workflow. W0–W2 supplies a validated reading/projection boundary. It does not demonstrate saving, owner authentication, protected preview, approval, publication or restoration.

## Trial question

Can a private Pages CMS deployment and the existing GitHub/Worker ownership support Sam's actual authoring cycle without browser repository-write credentials, public draft artifacts, silent stale saves, or a custom OAuth/backend system?

The first trial should answer that question in isolation. Do not generalize into a CMS or migrate the archive before it passes. Documentation about reference fields or workflow actions is evidence of primitives, not proof of the complete workflow or its security.

## Required inputs at the dependent step

| Input | Why it is needed | Independent preparation |
| --- | --- | --- |
| Owner-selected private content repository and authorized GitHub app/editor access | Test real persistence and correct repository authorization | Reuse versioned entry, relationship, evidence, asset and alias contracts; prepare safe sample records and field mappings. |
| Owner authentication/session mechanism for preview | Deny direct anonymous access to both draft documents and assets | Specify request/response and caching expectations; test a local deny-by-default boundary with synthetic records. |
| A source-reviewed Claims revision, supported pattern, one approved relationship and rights-cleared derivatives | Replace the synthetic reading slice with real publication-safe content | Keep fixtures separate; prepare claim/contribution/rights checklist and migration ledger. |
| Protected approval and deployment environment capability | Bind approval to an exact candidate; keep ordinary content writes from publishing | Document candidate digest inputs and failure/race tests; inspect repository plan capabilities before adopting a service. |
| Latest separately implemented source/export, if one exists | Reconcile Editor's Assistant, Thread Review, owner auth and newer drafts/content before replacement | Record feature parity as unknown and preserve both sources. |

Check existing authorized bindings and capabilities before asking for access. Request credentials only through secure settings; never ask for secret values in chat. No paid service, account change, production deployment or DNS change is authorized by this preparation document.

## Contract the trial must preserve

- Content records use immutable IDs and explicit revisions; titles are display values and editable slugs are not foreign keys.
- Reference fields display titles but persist IDs for entries, relationships, evidence, assets, people, topics, navigation and home selection.
- An incomplete draft can save even when publication validation would fail. Readiness and deployment state are separate.
- Saving a new draft B leaves the previously selected approved A revision live.
- A candidate freezes application commit, content commit/selected revisions, schema version and asset hashes. Editing any of them requires another candidate/review.
- Authenticated owner approval binds that candidate digest. A browser form field or workflow payload assertion cannot authorize publication.
- A restored entry becomes a new draft revision. A prior release may be restored only after checking withdrawn/restricted material.
- Public output contains only the validated allowlisted projection. An editor or preview must not fetch the entire private store into an anonymous public page.

## End-to-end acceptance script

Use synthetic records until source review and rights are complete. Record the exact editor version/configuration, repository/app scopes and test identity; do not log tokens or protected record content.

| Step | Demonstration | Pass evidence / failure condition |
| --- | --- | --- |
| Authenticate | Owner signs in, signs out, and retries with an unauthorized identity/repository | Authorized repository access works; unauthorized and revoked access are denied server-side. Browser inspection finds no repository-write credential. |
| Create | Owner creates an Observation from an accessible form and saves an incomplete draft | Durable ID/revision returned; clear saved-versus-incomplete state; no code edit or misleading “live” badge. |
| Connect | Owner selects three existing entries by readable names and adds meaningful typed rationales | Stored endpoints are stable IDs; directional and symmetric semantics survive reopen. No drag-only interaction. |
| Reopen | Close the editor/browser session, authenticate again and reopen | Text, block order, citations, media and relationships persist from the private source, not merely localStorage. |
| Conflict | Open the same revision in two sessions, then save conflicting edits | Stale revision is rejected or resolved explicitly; no silent overwrite. |
| Validate | Try a dangling edge, private/unselected endpoint, invalid alias and uncleared asset | Draft remains recoverable; publication reports specific actionable errors without leaking source data. |
| Preview | Freeze one candidate; preview article, collection and text/visual connections | Preview matches that exact revision/application/assets; unavailable draft dependencies block or remain excluded. |
| Privacy | Open page, route-data, original, derivative and image URLs without authentication and after sign-out | All protected routes/assets deny access; no shared-cache leakage. `noindex` alone fails this test. |
| Approve | Owner reviews exact candidate; attempt approval with forged identity/status/payload or content-only rights | Only trusted authenticated authority can approve; post-approval edits create a new candidate. |
| Publish | Publish the approved candidate once, repeat the request, then submit a slower older candidate | Exact artifact deployed once/idempotently; serialization and expected prior release prevent regression. “Live” follows health confirmation. |
| Fail safely | Cause validation, build, media-fetch and deployment failures | Previous healthy release remains live; state and error are understandable; retry does not substitute latest head. |
| Revise/withdraw | Save a new draft while A is live, then withdraw controlled content/assets | Draft does not change live output; withdrawal updates routes/listings/indexes/assets and documents cache limits. |
| Restore/export | Export content/media/rights/relationships, restore into an isolated source, rebuild; restore an entry revision | Checksums/references hold; portable data is usable without the CMS; entry restoration creates a new draft. |
| Accessibility | Complete the authoring cycle with keyboard and representative assistive technology | Logical focus, named controls, exposed validation/status, media descriptions and preview operation; report actual manual devices separately. |

Do not claim success if the editor only changes a mockup, a JSON object in memory or browser storage. Do not count an unprotected public preview of real drafts as a successful preview implementation.

## Decision record from the trial

Record each requirement as passed, failed, unverified or not applicable, with a concrete observation. Include service terms/costs and operational responsibilities; do not assume a permanent free tier. Inspect current authentication implementation and session behavior before asserting where a token is stored. Validate that both read and write authorization apply to the intended private repository.

If a requirement fails, identify the smallest unsupported operation and whether documented configuration can remedy it. Compare a managed structured CMS and the Cloudflare-native fallback only against that concrete gap. Do not create custom OAuth, D1/R2 tables, a graph database, an AI agent or a proprietary dependency merely because the broad architecture mentions them.

A successful feasibility trial produces a short adoption decision, private configuration, exact test evidence, operational ownership, export/restore procedure, and a bounded implementation task. W4's authenticated exact-revision publishing, queue/serialization, withdrawal and production recovery are not proven by W0–W2's pure projection builder.

## Stop conditions and recovery

Stop the dependent operation on credential exposure, unauthorized repository access, anonymous private asset delivery, stale-save data loss, or a candidate/approval mismatch. Revoke affected access using the owner's supported controls and preserve non-sensitive failure evidence. Continue unrelated local schema/template work.

Run the trial in isolated private storage with a verified export before destructive tests. Never remove or overwrite current public content or unavailable Emergent work. A production rollout, new purchase or migration requires its own explicit authorization.
