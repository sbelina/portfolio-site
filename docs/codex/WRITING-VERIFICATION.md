# Writing trial verification

Verified locally on `feat/private-writing-workflow`, starting from `be70cae`. Scope: reread actual source, rerun installed checks, exercise original fidelity, revision/approval rules, local persistence and protected preview boundaries. This is not a hosted CMS or production security certification.

## Findings and fixes

| Severity | Affected source | Reproduction before fix | Resolution / verification |
| --- | --- | --- | --- |
| Medium | `studio/model.ts`, `sections` | Import three question-led Markdown sections, with one shorter than120 characters and two longer. The outline filtered out the short section while still allowing a two-entry split. The immutable original survived, but generated drafts could omit a passage. | Automatic splitting now requires every section to meet the threshold; otherwise keep the work intact. Regression covers a short opening and short middle and verifies full character coverage of any suggested split. Both failed against the prior code and pass after repair. |
| Medium | `studio/model.ts`, metadata aliases; `studio/worker.tsx`, restore aliases | Rename a draft slug from A to B, then back to A. The old alias A still claimed the canonical route, blocking candidate validation; restoring also removed aliases without checking their target owner. | Remove only aliases owned by this same entry when reclaiming its canonical path. Keep B as an alias; leave other identities' alias ownership intact. Round-trip candidate validation passes, and the existing restore scenario still passes. |
| Medium | `studio/model.ts`, `draftProjection` | Rename a saved draft and request its previous `/preview/draft/.../` URL. The draft projection omitted aliases, so the protected preview could not redirect. | Draft projection now includes allowlisted reviewed aliases. Unit coverage checks metadata exclusion; actual Worker HTTP coverage verifies a302 redirect to the renamed draft. Authentication remains required before alias resolution. |

Added `studio-tests/model-regressions.spec.ts`. A negative run against the original source reproduced the omitted-passage and slug-round-trip defects (two failures); the original review-invalidation check passed. After fixes all four focused regressions pass.

## Automated evidence

- Clean frozen `npm ci`: passed.
- Public type checks, production/fixture build, public output privacy audit and **72/72 tests**: passed on the inspected baseline. Fixes above change only the isolated studio and its tests; no public runtime source or content was changed.
- Final isolated studio type/build and **7/7 tests**: passed, including the four focused regressions plus three integrated importer/auth/storage/browser scenarios.
- Real Worker stop/start and fresh-login proof: passed with identical saved version26 and workspace digest. No in-memory/localStorage persistence substitution.
- Public and private Worker deployment dry-runs: passed; no deployment.
- Pinned Pages CMS native JSON/reference-schema probe: passed. This exercises serialization/schema functions, not native UI, owner sign-in or Git saving.
- Existing writing records/inventory and documentation links/fences: checked; planning approvals stay empty. `git diff --check`: passed.

The integrated synthetic scenarios cover original bytes/text, DOCX text-run/tab/break parsing, literal poetry, separate suggestions and individual decisions, incomplete readiness, current-review binding, typed relationship rationale/backlinks, inline disclosure/reading position, stale sequential and simultaneous writes, CSRF rejection, authenticated exact approval, newer draft coexistence, entry restore and protected page/original/asset GET/HEAD denial before sign-in and after sign-out. Frozen exports remain approved-unpublished and explicitly ineligible for production release.

## Manual review and remaining gaps

Visual review is limited to the 320px editor screenshot. Keyboard/no-JavaScript/reflow and axe results are automated; parent-editor axe excludes the script-sandboxed iframe, with reading-template checks separate. Real screen readers, physical devices, native browser zoom, human comprehension and substantive human editorial review remain unverified.

The private Pages CMS repository/app binding is still unavailable. No full native CMS application, real owner SSO/Git save, hosted page/asset boundary, remote backup/disaster restore, LLM semantic review or production publisher has been demonstrated. The CMS recommendation is conditional on that real trial. Original DOCX binary bytes are retained, but conversion does not reproduce all Word layout/footnotes/tracked changes. Only synthetic manuscripts were processed.

No Git push, real writing import, production deployment, DNS change or publication occurred. Recovery is source-controlled: revert this verification fix commit if needed, preserve the local D1/originals privately, and rebuild generated artifacts. Existing approved candidates remain frozen; repairing an outline does not rewrite earlier generated entries automatically. Reassess a previously generated split against its preserved original before using it.
