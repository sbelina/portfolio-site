# Navigation release and copy-editing setup

26 October 2026. Owner requested menus on all subpages, a condensing sticky index header, publication of verifiable/correct articles, and an agent-confirmed editing setup. This record separates the navigation implementation from editorial readiness and future CMS work.

## Implemented navigation

The homepage, reading collection, entry templates (including poetry/patterns), not-found pages and existing hidden-work experiment share native primary links. Destinations are existing routes or retained homepage anchors, not proposed empty pages. Links remain in initial HTML and work without JavaScript. Private article previews reuse the reading template; their navigation CSS is included by the separate studio asset packager.

The index header sticks to the viewport and condenses after scrolling120px beyond the index origin; it expands below48px. The separate thresholds prevent its own height change from oscillating the state. All destinations remain available in both states. A measured header-height variable keeps anchor destinations clear. No animation is added. Short viewports (600px high or less), measured menus taller than45% of the viewport, and unenhanced narrow layouts use normal flow so enlarged menus do not obstruct reading. Without JavaScript, desktop navigation remains sticky and narrow navigation remains fully readable in normal flow.

Existing intro state transitions, manuscript content, typography, semantic colors, routes, literal poetry and footer disclosure are retained. Narrow enlarged text exposed existing homepage min-content overflow; inherited wrapping now allows long text to reflow without clipping or hiding it.

## Publication assessment

Specialist `authorship_architecture` inspected current remote refs/CI, the public selection/inventory, and private draft metadata. No canonical article has exact publication approval. `content/public-release.json` remains `no-approved-content`; the build deliberately has no trusted nonempty production-content loader. Existing homepage summaries are not complete approved manuscripts. No new article, synthetic fixture, private original, draft or source asset enters this release.

The safe navigation release surrounds the existing homepage, truthful empty Investigations shell and previously authorized illustrative hidden-work page. An accepted owner account can inform a private draft without clearing rights, proving a causal effect, or approving an exact public page. A green build or an agent agreeing is not owner publication approval.

For a real article: prepare the exact page/contribution and source limitations; resolve rights/redaction; review relationships, aliases and assets; demonstrate the protected preview; obtain exact-candidate owner approval; implement/test the trusted snapshot loader and controlled publication/rollback. The current local candidate remains release-ineligible. Do not bypass these gaps by editing visibility flags or turning off the artifact audit.

## Agent-confirmed copy-editing setup

`authorship_contract` and `authorship_architecture` independently recommend retaining **private Pages CMS + GitHub authentication/storage** for original intake and manuscript drafts, using the existing **authenticated local D1 review/preview** surface, and adding a separate constrained **Site copy** collection. Do not replace the current tools or expose React/HTML/SVG as the owner's editing format.

| Copy surface | Actual editing source today | Desired form |
| --- | --- | --- |
| Article text/poetry | Structured entry blocks; private native Pages main currently exposes the existing one-file trial. New multi-entry intake/configuration is unfinished feature work. | Typed prose/verse/evidence blocks; untouched original stored separately. |
| Homepage hero/sections | `src/App.tsx` | Site copy record with named plain-text fields and stable page identity. |
| Case/writing/archive summaries | `src/data.ts` | Structured records preserving existing IDs and credit; no automatic expansion into full manuscripts. |
| Shared experiment note | `src/components/ExperimentNote.tsx` | Site copy fields preserving native disclosure, explicit hypothesis and honest capability status. |
| Experiment explanations | `src/experiments/hidden-work/content.ts` and page component | Validated explanatory fields; renderer-independent process identities/relationships retained. |
| Menus/template labels | Shared navigation and reading components | Named label fields; route identities and accessibility semantics stay validated application contracts. |

**Not implemented by this navigation release:** universal no-code copy editing, a Site copy collection, a complete Pages-to-local-review handoff, protected hosted preview, trusted production content loader, or production publisher. Prior owner-reported save/reopen/conflict observations and verified Git saves do not establish these new forms. Public `cms/pages-config.json` is an older prototype, not the active private `.pages.yml`; reconcile it before presenting a unified configuration.

Before declaring a copy surface usable, demonstrate with synthetic text: save/reopen in a fresh authenticated session, reject stale writes, preserve originals/history, validate missing or unknown fields, protect page and asset previews, freeze an exact candidate, record authenticated owner approval separately from publish, retain the old live revision when saving a new draft, and export/restore. A saved CMS file or checkbox alone is insufficient.

The next bounded authoring task is a Site copy trial for an explicitly selected surface, using current storage/authentication rather than another editor. Keep it isolated until its complete save → preview → exact approval path is demonstrated. Extending the same proven path to the remaining surfaces must preserve the table's distinctions.

## Preservation and recovery

Unfinished public-repository authoring work was preserved in Git stash `Preserved unfinished claims authoring before navigation release 2026-10-26`, created on `feat/systems-inquiry-charter`. It is excluded from this release. Private-repository drafts/configuration remain untouched on their feature branch. Do not apply that stash to production or drop it during cleanup. Restore it on an authoring branch and resolve any navigation-template overlap deliberately.

The inquiry charter is separately committed as `8044257`. Navigation rollback should revert its own release commit through review, retaining the charter and all authoring work. Record the prior healthy production commit/version before release; never use synthetic/private build directories as a rollback artifact. No DNS change or service purchase is involved.

## Review and check evidence

Specialist `authorship_reading` implemented/reviewed shared menus and reviewed the homepage header. A medium obstruction risk with enlarged wrapping menus prompted the45%/normal-flow fallback. It reported no further substantive source findings after the correction. Source review is separate from browser testing and is not approval of manuscripts.

Initial integrated tests passed109/111. The two failures exposed homepage enlarged-text overflow and a no-JavaScript style-injection test timeout. The layout now wraps long text; no-JavaScript tests inject test styles synchronously without enabling site scripts. Final check/release results are recorded on the implementation PR. No claim of human comprehension benefit, physical-device testing, real screen-reader testing or WCAG conformance follows from automated checks.

Final local checks: clean frozen install; application/tools/private type checks through builds; production build/prerender/artifact audit; public and private Worker packaging dry-runs; **112/112 public tests** (14 new menu/header cases); **10/10 private-workflow tests**; actual synthetic D1 restart/fresh-login persistence proof all passed. The first packaging invocation used an unavailable home log directory; setting the existing workspace XDG configuration/cache directories resolved that environment error. A root-owned diagnostic server was stopped before the final test run; an intervening port-conflict run provided no product evidence.

Separate visual inspection covered desktop compact and narrow enlarged captures of the production build. Public Worker probes confirmed seven menu links on home, collection, experiment and real404, no page errors and no enlarged horizontal overflow. The independent architecture specialist reviewed the integrated source, generated route inventory and boundaries and found no blocking navigation-release issue; it did not rerun the integration lead's suites. Hosted-preview/production results are separate release checks.

Pre-release baseline: remote main `eaac980c6eb6d3aa5fcd1738b7abdc316c9f6803`, Cloudflare successful build `e59edad4-33cf-4346-87d5-f72b055ee60e`. A fresh HTTPS root request returned200 before release. Preserve that source/deployment as the recovery baseline; do not infer a Worker version ID from the build ID.
