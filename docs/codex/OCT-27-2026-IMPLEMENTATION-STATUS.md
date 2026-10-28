# 27 October slice — implementation status

This file records the isolated review branch `feat/oct27-editorial-systems-alignment`, based on `33b43c042d358da30cac1b4738fdae5e7b73fea2`. It does not supersede the historical release records. The separate unfinished Site copy worktree was preserved untouched. Production was read-only checked on 28 October: the homepage returned HTTP 200 and still included the withdrawn direct rework comparison. No changes in this branch are live.

| Package | Actual status in this branch | Boundary |
| --- | --- | --- |
| P0 inventory | [Editorial/route ledger](OCT-27-2026-EDITORIAL-ALIGNMENT.md) and [claim queue](OCT-27-2026-CLAIM-CORRECTIONS.md) drafted. Existing IDs, anchors and canonical empty selection retained. | Presentation/notes and employer evidence were unavailable; source, rights and exact wording review remain open. |
| P1 home/nav | Candidate first screen, clear investigation/connection routes, optional Method path, three professional moves, five-link shared menu. Intro, graph, hidden-work route and footer implementation remain present. | This is review-branch copy/layout, not a released or owner-approved homepage. Reader comprehension untested. |
| P2 cases | Six [page-review outlines](PAGE-REVIEW.md) prepared; legacy cards narrowed, with claims comparison/accessibility assertion corrected. Claims knowledge reference retains old ID; telematics remains outline-only. | No full case manuscript, real canonical article, evidence source, asset or new selected relation in public artifacts. |
| P3 pattern | [Static readable candidate](review-candidates/related-not-equivalent.md), six rationales/caveats, typed-relationship review method. | No live pattern route or interactive Frame Laboratory. Cross-study trust sentence is explicitly an untested interpretation. |
| P4/P5 | Not started by this brief's first execution. Existing isolated local writing trial remains available at its previous scope. | Hosted editing, remote protected preview, exact release/publishing and human comprehension tests remain separate work. |

## Verification record

Baseline: Node 22 from `/workspace/.cloud-tools/node22`, frozen `npm ci` with workspace npm cache, production build/typecheck/prerender/public audit passed at the baseline. The public build produced three production-safe routes with no approved canonical entries. The initial install attempt used an unavailable home npm cache and failed; the corrected frozen install passed without disabling TLS or integrity checks.

Final branch checks: `npm run build` passed with TypeScript, prerender and public artifact audit (23 audited files; three production-safe routes). `npm test` passed **116/116** after the hero/navigation changes. A subsequent classification/ledger correction was followed by `npm run build` and **21/21** affected browser/content/navigation checks. The strengthened six-case planning-inventory assertion then passed **4/4** focused editorial checks. `npm run test:studio` passed **10/10** existing local synthetic workflow tests. `npm run studio:restart-proof` passed: synthetic local D1 workspace revision 28 and digest survived a real Worker stop/start and fresh login. `npm run check:deploy` and `npm run check:studio` were dry-run packaging checks and passed. Documentation review checked 14 changed/new Markdown files for local links, fences and trailing spaces, plus planning-inventory IDs/review paths/null approvals. `git diff --check` passed. These are local tests; remote CI is unavailable until a review branch is pushed.

Generated `dist` has no telematics or Related. Not equivalent. page, no selected canonical entry/relationship and no correction documents. An exact-string artifact scan found none of the withdrawn rework comparison, categorical accessibility failure, unverified adoption sentence, restricted score examples or review-document paths. Legacy anchor inventory remains present; the generated ledger keeps 17 original identities and now marks `documentation-recovery` as a claims reference without a selected standalone route.

Manual visual review inspected no-JavaScript Chromium screenshots at 1440×900, 390×844 and 320×740. The first two exploration links are visible in each initial viewport and no horizontal overflow appeared. Browser tests cover keyboard/touch emulation, 320px reflow, 200% text, reduced motion, no-JavaScript reading/menus, intro progression, direct URLs, graph text navigation and real 404s. No physical touch device, real screen reader, native toolbar zoom, representative-reader comprehension test or source-level editorial verification was performed.

## Privacy, approval and recovery

The owner brief was read from the provided attachment and was not copied into Git. This branch contains only public-safe correction/outline records, not presentation notes, restricted originals, source locators, client survey items or private screenshots. `content/public-release.json` remains `no-approved-content`. A source correction, green test or review worksheet does not authenticate owner approval.

Rollback this review slice by dropping or reverting only this branch. The unchanged `origin/main` commit and current production Worker remain the source and deployment baseline; do not disturb the other checkout or its preserved stash. Any future live correction should use a separate authorized release with a recorded healthy Worker version and exact approved candidate.

## Next smallest slice

Privately review one complete Claims manuscript and its source/rights/contribution record, including the distinct guide, deck and onboarding artifacts. Resolve the metric scope discrepancy before any numeric result appears. Rehearse an exact protected candidate with the existing local editor and selected public projection; obtain owner approval before a real article or pattern route is published. Keep telematics research recovery as a separate case draft.
