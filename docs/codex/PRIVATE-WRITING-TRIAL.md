# Private writing-to-subpage trial

Status: **local synthetic feasibility trial**, not a deployed CMS or production publisher. The question is whether immutable intake, explicit review decisions and the existing reading model can form a durable protected path without changing the public site. Acceptance: original fidelity, human-controlled structure/edits/connections, real saved/reopened revisions, stale-write denial, authenticated page/asset preview and exact candidate approval with no publication.

## Audit and preservation

See [CMS source evaluation](CMS-EVALUATION.md) for the branch audit, pinned primary sources, native/custom comparison and conditional Pages CMS recommendation. Editor’s Assistant and Thread Review are proposed features by owner clarification; no original implementation is being replaced. All existing writing review records and the planning inventory remain. No Library, old paste or private manuscript was imported.

The public React/Vite/Worker app, intro, graph, current routes, page-specific payloads and literal verse remain. The shared `ExperimentNote` disclosure is refined with the owner's idea, open hypothesis, process and current implementation; native details/summary preserves keyboard and no-JavaScript access.

## Implemented local workflow

1. Sign in to the separate loopback Worker with configured owner credentials. The server verifies a PBKDF2 password hash, issues a random HttpOnly SameSite session, checks session expiry in D1 and requires an origin-bound CSRF token for changes. Credentials are never Vite variables. These are local password sessions, not demonstrated GitHub/Pages owner SSO.
2. Paste text/Markdown or upload TXT/MD/DOCX (256000-byte limit). Original binary bytes, decoded text, source digest, title and conversion warnings are retained separately from every edit. XML macros, scripts, external relationships and manuscript instructions are not executed. DOCX text runs, tabs, explicit breaks and paragraph boundaries are converted; layout/footnotes/deletions/objects are not losslessly rendered. Download and compare the untouched original.
3. Intake prepares six distinct review records: Manuscript Intake → Editorial Reader → Evidence Reviewer → Connection Curator → Experience Reviewer → Release Checker. Each has suggestions, uncertainty, original-source offsets/digest and owner findings/decision. These are deterministic prompts, not an LLM's claimed factual/editorial judgment. No writing is sent to an external model.
4. Keep a work intact, or approve a proposed split. The conservative heuristic proposes independent question-led Markdown sections only when multiple sufficiently substantial sections exist and no opening passage would be discarded. Poetry stays intact by default. Proposed title/slug/summary/collection/source passages are inspectable and revisable before draft generation. Summaries extracted from passages are suggestions, not new claims. Connection Curator can prepare a separate local question-outline suggestion, referencing the exact source passage/digest. Its tentative type/rationale is marked as heuristic, can be revised or rejected, and requires individual owner acceptance; no semantic or causal link is silently established from a heading/keyword. This is not an LLM semantic review.
5. Schema-valid restricted entries reuse the content model. Propose text edits with a rationale; accept or reject each individually. The original is never overwritten. Add public-safe evidence citations with explicit source dates, limitations/rights decisions and private PNG derivatives (64 KiB limit), plus typed explained connections with individual acceptance/rejection. Slug edits keep stable IDs and create aliases.
6. Draft saves use a durable local D1 workspace and immutable history. A transactional conditional update compares the exact expected workspace version; stale sequential or simultaneous writes return409. Forms retain unsaved input on errors. Reopening in a new browser context reads the server, not localStorage. Restore copies an earlier entry as a **new restricted draft revision**, preserving frozen candidates and reconciling slug aliases.
7. Review all six passes on the current content before freezing a candidate. Editing content invalidates the pass basis for the next candidate; original reports remain as history. The current bounded trial conservatively binds review passes to the full workspace store. Manuscript completeness, attribution and rights are explicit owner decisions. Pending edits/connections and incomplete required metadata block candidacy.
8. Private SSR previews reuse `ReadingPage` and the page-specific selector. Evidence expands inline, meaningful outgoing/incoming links retain their assertion direction, and native navigation/history preserves reading position. Protected originals, pages, data, derivatives, HTML and HEAD requests all check the same server session. Cache-Control is private/no-store. No hidden public preview or public asset directory is used.
9. Freeze a candidate that binds the application revision, exact selected entry/supporting-record revisions, projection and asset bytes. Candidate validation is separate from authenticated approval. Inspect its immutable private preview, then choose **Approve this exact candidate**. The server records the authenticated local subject, digest and time. Approval can coexist with a newer draft. Downloading the approved-unpublished projection does not deploy or mark anything live.

Publication is intentionally disabled. No live-release endpoint, Git push, production credentials, queue or automatic deployment was added. Local candidates explicitly carry `source.kind: local-d1`, a full source digest/version and `releaseEligible: false`. Their version-1 manifest has a zero content-commit placeholder because no private Git commit exists; it is never presented as a Git SHA. A real repository integration must generate a new candidate with the actual content commit and obtain fresh exact-candidate approval. The user's approval of a real exact candidate would still need a separately verified publisher before release. The application hash is the configured commit from setup; regenerate the setup when deliberately changing the trial's application version. This prototype is loopback-only and must not be exposed through a tunnel as a hosted owner service.

## Run privately

Use pinned Node and install dependencies, then:

```sh
npm ci
npm run studio:build
npm run studio:setup
npm run studio:migrate
npm run studio:dev
```

Open `http://127.0.0.1:4180/`. Setup creates ignored, mode600 `.dev.vars` and `.studio-password`; read the password locally, never paste it into chat. Existing credentials are preserved. Local D1 lives under ignored `.wrangler/`. Protect and privately back up that directory; this environment's filesystem is not an externally managed backup service. No real manuscripts are automatically loaded.

This trial has a 1.5MB workspace snapshot cap; it is not a scalable archive database. Stop before the cap, export privately, and design a per-record/media store before migration. In-memory client state is only editing state; saved success follows the D1 write. Sessions last one hour and sign-out deletes the stored session. Rotating the password hash also invalidates existing session lookup keys.

## Synthetic checks

```sh
npm run test:studio
npm run studio:restart-proof
npm run check:studio
npm test
npm run check:deploy
```

System Chromium may require `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. In this cloud environment, use writable npm/XDG caches under `/workspace`; never bypass TLS or integrity checks. `test:studio` creates synthetic-only credentials in `.dev.vars.test` and clears only the explicitly isolated test D1 database. It must not point at a real manuscript database.

The Worker browser/API scenarios test immutable original files, split generation, individual accepted/rejected edits, evidence/assets, six review records, explained links/backlinks, inline expansion, sequential and simultaneous stale writes, origin/CSRF protection, candidate freeze/approval/export, newer draft coexistence, entry restore, fresh-session reopen, anonymous/signed-out page/asset/HEAD denial and literal poetry/no-JS reading. The restart proof starts, logs into, stops and restarts a real local Worker against the same on-disk D1, then compares the saved workspace version/digest. It is a real process/storage check, not a pure precondition mock.

Automated editor axe scans cover the parent surface, excluding the script-sandboxed preview iframe; existing reading scans cover the reusable templates separately. Manual assistive-technology, physical-device, native browser zoom, user comprehension, cloud storage recovery and hosted CMS sessions remain unverified. Scripted synthetic review/approval is not Sam's approval or evidence of human reading quality.

## Recovery and next gate

Use **Export private backup** to download original bytes, drafts, review/decision history in the current workspace, frozen candidates and media with a digest. Earlier workspace snapshots remain in local D1 history; exporting full DB history requires a private D1 export/backup, not the public projection. Keep both, access-controlled. Restore individual entries through the review UI; whole-database disaster restore and encryption/remote backup drills remain unverified. Do not delete originals to repair a build.

Generated `dist`, `dist-fixtures` and `dist-studio` are disposable. Stop the local Worker before restoring its database. Revert the feature commits through review if the local trial is rejected; no public release rollback is required. Default production output audits reject studio secrets/test canaries and contains no studio source, routes, manuscripts or original files.

The next bounded task is the **real Pages CMS private-repository sign-in/save/reopen/conflict trial** with the owner-designated repo/app binding. The source probe is not that trial. Once it passes, connect review/intake/preview adapters to that durable source and verify sessions, revocation and assets in the actual hosting environment before calling it a usable hosted editor. Full DOCX visual fidelity, AI-assisted substantive review/connection suggestions, multi-user policy, scalable media, complete portable restore and production publishing remain separate unverified capabilities. Do not purchase, deploy or import real writing without the relevant authorization.

## Recorded verification

On the implementation branch, clean `npm ci` passed. Public application/tool type checks, production/fixture builds, public artifact audit and **72/72 existing browser/model tests** passed. The private build/type check and **3/3 integrated synthetic scenarios** passed, covering the API/storage/browser cases above. The real stop/start proof preserved the saved workspace version and its digest across fresh authenticated processes. Both public and private Worker deployment **dry-runs** passed; neither command deployed anything. The pinned native Pages JSON/reference probe passed. Documentation links/fences, `git diff --check` and byte comparisons of all14 preserved writing/workflow/inventory files passed; planning approvals remain empty.

Manual verification was a visual inspection of the 320px editor screenshot: the heading, controls and status wrap without clipping. Automated parent axe scans and no-JS footer/poetry checks passed. This is not real assistive-technology testing, a human editorial review, a full native CMS demonstration, a hosted security assessment or a production recovery drill. Remote CI was not run because this task does not push/deploy a branch; the existing workflow is extended to run these local trial checks when a later authorized PR runs.

During implementation, tests caught a login Origin rejection caused by a no-referrer policy, a narrow-layout overflow and an axe scan hanging on the script-sandboxed iframe. The policy now retains same-origin form provenance, the editor wraps/minimizes its controls, and the parent axe scan explicitly excludes iframe execution while reading behavior is tested independently. A restore-path review also caught a potential alias-to-current-route collision; restore now reconciles those aliases and is covered by the storage/browser scenario. Later content changes invalidate review-pass bases for new candidates. These fixes were rerun successfully.


Follow-up verification expanded the private suite to **7/7 passing checks** and fixed outline/alias edge cases. See [verification findings](WRITING-VERIFICATION.md); the original three-scenario results above remain the initial implementation record.
