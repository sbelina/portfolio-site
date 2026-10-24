# Proposed private authoring interfaces

Status: **proposed, not installed**. The application implements content validation, exact-selection integrity and public reading. It does not implement durable saves, sessions, protected previews, authenticated approval, release serialization or restoration. The examples in `tests/support/proposed-authoring.ts` are test-only pure decisions. Passing them is not proof of a secure service or real persistence.

This proposal refines [W3-FEASIBILITY.md](W3-FEASIBILITY.md) and preserves the [writing review workflow](WRITING-REVIEW-WORKFLOW.md). Public writing review records and `page-review.json` are planning inputs; checking their fields cannot approve or publish anything.

## Save drafts without pretending they are publication-ready

The current `entrySchema` accepts structurally valid incomplete `draft` records: empty title/summary, no contribution/authors/blocks, and unknown dates. It still requires a stable UUID, positive revision, valid proposed slug, known kinds/block types and well-formed references. Block IDs remain unique within a draft. Source text, including verse whitespace, is not silently trimmed. Invalid executable block types and unknown fields are rejected even in drafts.

The proposed writer accepts content fields and an expected base, not client-assigned approval, visibility elevation, revision numbers, owner identity or publication status. The server assigns revision `previous + 1`, immutable ID on create, timestamps and restricted visibility; saving preserves the prior live selection. It parses the draft form using the current schema with `editorialState: draft`. A first save may use a server-generated provisional slug until the owner chooses one. Publication completeness errors are returned separately from successful durable-save status.

Reference targets can be unresolved while drafting, with explicit readiness diagnostics. Do not lose an incomplete manuscript because a public edge or rights decision is unavailable. Payload size limits and safe record structure still apply. Broader editorial states (`needs_manuscript`, `changes_requested`, `deferred`) remain workflow metadata proposals; the current content enum is not claimed to implement the Writing inbox.

Publication additionally requires approved attributed entries, dates and required metadata, approved selected supporting records, exact revision/digest matches, route/alias uniqueness, selected relationship endpoints, evidence provenance and rights-cleared public derivatives. Poetry is not required to invent a case contribution or evidence narrative. Completeness of a full manuscript versus an intentional fragment requires an explicit owner-reviewed decision before candidacy; current schemas alone cannot establish it.

## Proposed durable-save contract

`SaveDraft { repositoryId, contentId | null, expectedRevision: number | null, expectedContentHead, requestId, content }` → `{ contentId, revision, contentCommit, readinessIssues }` only after durable private storage confirms the commit.

The authenticated server checks repository and operation permission, then reads the expected head. It compares both the entry's latest revision and repository head before writing, and updates the Git ref **atomically with an expected-old-head compare-and-swap**. A preflight comparison followed by an unconditional write is insufficient. A Git provider primitive must demonstrate this behavior; an endpoint that silently retries onto a newer head fails the trial. Even disjoint-file head changes initially return a conflict instead of assuming merge semantics.

- `expectedRevision: null` means create only if the ID is absent. Concurrent creates cannot both succeed.
- A stale entry revision or moved repository head returns `409 Conflict` with authorized base/current metadata, never overwrites. Preserve the user's unsaved text locally in the running editor while offering comparison; this is recovery assistance, not durable-save success.
- `(repositoryId, subjectId, requestId)` is an idempotency key bound to the request digest. Exact retry returns the committed result; reuse with another body conflicts. Store this receipt durably or make the Git history carry an equivalent verifiable receipt.
- Network ambiguity after a commit requires checking that receipt before retrying. Do not create duplicate revisions or report a failed save as saved.
- A restore request selects an existing immutable revision plus expected current revision/head and creates a **new restricted draft revision**; it does not rewind the private repository or change live publication.

The local precondition proof exercises comparison only. It performs no write and does not prove atomicity, idempotency or cross-session reopening.

## Authentication and authorization boundaries

A server verifies the owner's identity and revocation/session expiry using an adopted provider. It derives repository and per-operation capabilities from trusted policy. Browser-supplied names, roles, `approvedBy`, JSON status fields, Git commit authors and proposed grants are not authentication evidence. Repository read permission does not imply approve/publish permission.

Use server-held scoped credentials, short sessions, supported secure HttpOnly cookies, CSRF protection for state-changing cookie requests, explicit origin checks and session rotation/revocation. Never expose GitHub repository-write credentials through Vite variables or browser JavaScript. Inspect the actual editor implementation before claiming its token handling meets this proposal. Deny unsupported repositories and unauthorized resource IDs before loading source; avoid revealing record existence in anonymous errors. Logs contain operation IDs and safe status, not manuscripts, tokens, signed links or private asset keys.

Proposed operations are separately authorized: `draft:read`, `draft:write`, `preview:read`, `candidate:review`, `candidate:approve`, `release:publish`, `release:withdraw`, `export:private`. Approver/publisher policy is owner-controlled; AI suggestions cannot grant themselves rights. The adopted service may expose different names, but must demonstrate the same separation.

## Protected preview contract: documents, data and bytes

`CreatePreview { candidateDigest }` returns a session-bound preview location for one immutable candidate, only after checking `preview:read` and source repository authorization. Candidate pages, route data, rendered blocks, public-style indexes, image derivatives, originals and download endpoints all pass the same authorization boundary **before** private content lookup/delivery. Public Worker assets cannot host private preview bytes. Approved-public derivatives may be reused only if their public status is independently selected; an obscure URL does not confer privacy.

A preview grant is issued/verified server-side and bound to subject, repository, candidate digest, scope, expiry and revocation state. A local pure grant object in a test is not an issued session. Never trust a client-supplied grant. Anonymous, expired, wrong-repository/candidate and revoked requests deny both `GET` and `HEAD`; prevent resource-existence leaks consistently. Range requests, thumbnails and alternate image formats must not bypass access checks.

All preview and denial responses use `Cache-Control: private, no-store`; shared caching is disabled, with `Vary: Cookie, Authorization` as additional defense, not a substitute for disabling cache. Verify no CDN cache rules override this, no redirects expose private storage addresses, no public service worker caches drafts, and sign-out/revocation prevents subsequent page **and asset** access. Do not preload private assets or log bearer URLs. `noindex` may discourage indexing, but is not authorization. A security failure requires access revocation and cache/content incident review before continuing that operation.

## Exact-candidate approval and publication

`CreateCandidate { expectedContentHead, applicationCommit, selectedRecordRefs, assetChecksums, schemaVersion }` resolves immutable inputs and validates them server-side. The existing manifest and `digestRecord` provide exact-selection mechanics, including record digests, application/content commits, aliases and asset checksums. Freeze the resulting artifact/checksum and validator/tool version in a future protected candidate record; do not change the version-1 public manifest implicitly.

`ApproveCandidate { candidateDigest, expectedCandidateState, requestId }` records an authenticated reviewer, decision, trusted time and exact scope through a protected operation. It is independent of `PublishCandidate`. The mechanical `buildPublicProjection(..., approvals)` helper assumes trusted callers; giving it an invented matching approval does not authorize a release. Client status changes and review worksheets cannot call the publisher directly.

`PublishCandidate { candidateDigest, expectedLiveRelease, requestId }` rechecks trusted approval validity, withdrawal/rights restrictions and exact frozen inputs. It serializes transitions using a durable expected-live-release compare-and-swap. A slower older candidate cannot overwrite a newer successful release. Retrying the same request is idempotent; a changed candidate needs fresh approval. A build or fetch may not substitute latest Git head. “Live” is recorded only after deployment health verifies exact HTML, routes, assets and privacy exclusions. Until then the prior healthy release remains authoritative.

Current code does not implement these endpoints, authenticated approval records, queue, deployment transaction or health gate. The real trial must prove them; this document does not install them.

## Failure recovery and portable restore

Keep operation states separate: saved draft, readiness, review decision, candidate, deployment attempt and verified live release. Persist request receipts and safe errors. Validation/build/asset/deployment failures retain the prior healthy release and exact failed candidate for diagnosis. Never retry by silently selecting current head. Recover interrupted operations from durable receipts and actual deployed version before changing UI state.

A private export contains schema version, immutable records and revision history, original text/verse, relationships, aliases, source/rights decisions, originals and derivatives with checksums, approval provenance and release audit history. Store it in private storage with encryption/access appropriate to the originals; the public projection is not a backup of the authoring source. Include an export manifest with file hashes and the exact application/content/tool revisions needed to rebuild. No public CI artifact may contain that private archive.

Restore first into isolated private storage, verify every file hash/schema/reference and rights restriction, then reopen in a fresh authenticated session. Unknown schema versions fail without mutating the current source. Entry restore creates a new draft. Release restore requires a fresh restriction/withdrawal check and protected exact-candidate approval, not replay of stale permission. Test recovery with interrupted writes, corrupt/missing media and revoked access before touching production.

The local JSON round-trip proof checks only current synthetic store portability and digest mismatch detection. It does not prove Git history/media export, encrypted backup, service recovery or real restore.

## Smallest external dependency and next gate

The first external gate is **one owner-designated private Git repository with repository-scoped editor/app access**, using existing ownership and a supported owner authentication mechanism. No paid service or production migration is required to start. First prove one synthetic incomplete draft can save atomically, close the session, authenticate again and reopen, then prove a stale second save is rejected without data loss. The app/service's actual atomic-write and credential-handling capabilities determine whether it is suitable; do not assume Pages CMS satisfies them.

Next add a protected candidate preview path covering both page and asset requests. Authenticated approval/publication and deployment recovery remain dependent later gates; source-reviewed real manuscripts are **not** needed for synthetic feasibility. Approved source/rights are needed before any real canonical publication. No private repository/app binding has been configured by these local proofs; use secure settings for credentials, never chat.
