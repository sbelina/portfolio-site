# Evidence-first review branch: 16 November 2026

**Branch:** `review/evidence-first-claims` · **Status:** merged to `main` and released on 17 November 2026 at the owner's request ("push all changes live"). No case content is approved by this release: the Claims candidate remains unpublished until the authenticated review process approves its exact wording.

## Owner request (summarized)

Make demonstrated professional work visible, understandable and credible before expanding the site's intellectual architecture. Specifically: (1) prepare Claims as the first publication candidate without publishing it; (2) simplify the homepage around the H1 *“I turn gaps in understanding into evidence leaders can act on.”*; (3) give the homepage a direct path to evidence that is truthful while no investigation is approved; (4) keep Test. Show. Enable., Related. Not equivalent., and How I Know, with no new frameworks, navigation or Atlas changes. The owner explicitly declined to execute the wider collective-agency directive in this branch.

## Decision: purpose versus positioning

| Layer | Statement | Where it lives |
| --- | --- | --- |
| Professional entry point | I turn gaps in understanding into evidence leaders can act on. | Homepage H1 |
| Practice | Test. Show. Enable. | Homepage and Practice (unchanged) |
| Intellectual principle | Related. Not equivalent. | Homepage card and Connections (unchanged) |
| Evidence convention | How I Know | Homepage and Practice (unchanged) |
| Guiding purpose | Creating conditions where different minds can genuinely contribute to shaping a shared future. | **This record and case analysis only.** Not the H1, SEO title or a new public framework. |

The purpose is a statement of intent. A case may show evidence of facilitation or participation without claiming that a team or community became more independently capable; that remains an open question unless it is measured.

This supersedes the 6 November lead sentence (*“I investigate situations where outcomes are visible…”*) **only if the owner approves and merges this branch.** That sentence still describes the investigative mechanism and can appear in longer copy.

The portfolio and the Atlas have different jobs. The homepage's hiring path does not require the Atlas. The Atlas stays available in navigation, unchanged.

## Change map

| File | Change |
| --- | --- |
| `src/BuildIndex.tsx` | New kicker (discoverable role terms), H1 and lead. Hero adds one evidence link. The first journey card is now the evidence path instead of the Investigations collection. Accepts approved investigations as a prop. |
| `src/content/primary-evidence.ts` | New. Selects the homepage evidence target: approved Claims, else the first approved investigation, else the previous edition's Claims summary, labelled as a summary with the full case unpublished. Lists the previous edition's six summaries. |
| `scripts/prerender.tsx`, `src/main.tsx` | Pass the projected (approved-only) investigations to the homepage for prerender and identical hydration. |
| `src/reading/ReadingPage.tsx` | The empty Investigations state now says no full investigation is published, then lists the six previous-edition summaries (Claims first), each labelled as a summary. Kicker uses the role terms. |
| `scripts/seo.ts` | Home title and description use discoverable role terms. The social image and its alt text are unchanged (see open items). |
| `src/design/foundation.css`, `src/reading/reading.css` | Minimal spacing for the boundary note and summary list. |
| `scripts/audit-public.ts` | Adds the candidate canary to forbidden public markers. |
| `docs/codex/review-candidates/claims-operations-publication-candidate.md` | New. Short and full Claims candidate, statements with kinds and evidence needs, and the outstanding approval checklist. |
| `tests/evidence-first.spec.ts` | New focused tests. Three existing tests updated for the new H1. |
| `content/candidates/claims-operations.ts`, `scripts/prerender.tsx` (`--candidate`), `src/reading/*` (candidate labels), `package.json`, `wrangler.candidate.jsonc`, `.gitignore`, `tsconfig.tools.json` | Local candidate preview of the Claims page (see below). |
| `tests/claims-candidate.spec.ts` | Schema validity, approval-boundary rejection, estimate-only wording, production exclusion. |

**Deliberately unchanged:** navigation, intro (three steps plus Dive), Atlas and Je ne sais qu’a code and semantics, design tokens, asterisk placeholder, Practice and Connections pages, immutable archive bytes, `content/public-release.json` (`no-approved-content`), `docs/codex/page-review.json` approvals (all `null`).

## Interim evidence route: what it is and isn't

Until an investigation is approved, the homepage links to the previous edition's Claims summary at `/builds/2026-11-04-418efb7/#claims-operations`. That summary was already public in the reviewed previous build. It states the question, contribution and open limits, and the archive page carries its own archived-build notice. It is not an approved full case, and the homepage says so in the link's description.

Known issue: the archived summary names the salvage vendor, which the owner has asked not to name publicly. The archive cannot be edited. See the candidate's checklist.

## Verification

Network installs were unavailable in the session that prepared this branch, so `npm ci`, `npm run build`, `npm run check:deploy` and `npm test` **were not run.** What did run:

- Syntax transpile of every changed TypeScript/TSX file with TypeScript 6 (`transpileModule`): no diagnostics. This is not a type-check.
- Server render of `BuildIndex` with React 19.2.8 in both states (no approved investigation; one synthetic approved entry), plus Chrome screenshots at 1440×900, 390×844 and 320×740 using the source CSS. The hero evidence link is in the first screen at 1440×900 and 390×844. **At 320×740 it falls just below the first screen.**
- Archive checks by script: every summary anchor and title used exists in the frozen review HTML; the archive contains no withdrawn Claims figures.
- Claims candidate page and candidate homepage: rendered server-side with React 19.2.8 and a no-op schema stand-in (schemas loaded, nothing validated), then screenshotted. The real `npm run build:candidate` has not run.
- The empty-state `ReadingPage` was not rendered.

Required before merge: run the four repository checks with the pinned toolchain, including `tests/evidence-first.spec.ts`, and inspect `dist/` for the canary and for the previous-edition link. Then do a manual keyboard and screen-reader pass on `/` and `/investigations/`.

## Claims candidate page (local preview only)

Owner request, 16 November: “Build claims.” The Claims candidate now exists as a typed entry (`content/candidates/claims-operations.ts`) using the reserved stable ID, the investigation narrative schema, ten classified statements and three callouts. It is `editorialState: review`, `visibility: restricted`, and has no attached evidence, so the projection validator rejects it. A test proves this.

- `npm run build:candidate` writes `dist-candidate/`: the homepage with Claims as the evidence target, the Investigations collection and `/investigations/claims-operations/`. Every page is labelled “unapproved candidate”. The output is noindex, has no sitemap entries, writes `_headers` noindex, and is marked non-production in `route-manifest.json`, so the public audit rejects it. The candidate token is visible on the page and forbidden in production output.
- `npm run preview:candidate` serves it locally through `wrangler.candidate.jsonc`, which is local-only with no workers.dev or preview URLs. **Never deploy this output.** Noindex is not privacy.
- Figures follow the owner's 16 November direction: rounded or averaged estimates only, never exact internal counts. The two rework observations stay withheld because their problem is scope, not precision. Exact values stay in the owner's private notes, outside the repository.
- Production `npm run build` is unchanged: it still renders no approved content and has no Claims route.

## Owner changes, 16 November (afternoon)

- **First person.** All case copy in the Claims candidate (entry and markdown) now uses first person. Archived previous-edition summaries keep their original third-person wording because the archive bytes are immutable.
- **Interactive homepage illustration.** Classified as *adapted* (PC-03 and PC-06). The static HTML is unchanged: the full drawing, the caption and the “Read this illustration” disclosure. After hydration:
  - A native radio group, “Look at: Both / Outcome / Explanation / The gap”, and pointer shortcuts on the drawing change which part is emphasized. Clicking a selected part returns to Both.
  - A polite live region describes the current view.
  - The SVG stays `aria-hidden`; the radios and the text carry the meaning.
  - Under reduced motion, transitions and the gap pulse are off.
  - No view adds data, scale or causal claims.
  - Verified in Chrome with Playwright 1.63 against an esbuild bundle of the component, in both motion settings: keyboard arrow selection, pointer selection, toggling back, no console errors. The repository's own test (`tests/evidence-first.spec.ts`) has not run.

## Patterns adopted from systemicdesign.pro, 16 November (evening)

The owner chose all four patterns.
- **Featured case.** Optional `investigation.brief` (tension, my call, result, evidence). The homepage renders it only when the evidence target is an approved investigation that has a brief, so production shows nothing today.
- **Labelled figures.** Optional `investigation.figures`, each with a value, unit, label, basis (owner estimate, approximate, platform-reported or measured) and qualifier. They render as a figure strip on the case page. **Projection rule:** every figure needs selected evidence, and a figure marked measured needs metric provenance.
- **What I didn’t own / How this was measured.** Optional `investigation.notOwned` and `investigation.measurement`, rendered as their own sections.
- **Recruiter actions.** Email (with the address visible) and LinkedIn appear after How I Know, and after the featured case once one exists. A résumé action appears only when `src/content/recruiter.ts` names an owner-supplied, public-safe file; none exists yet.
- All new fields are optional and additive, so existing records need no migration. The Claims candidate was validated against the real schemas with zod v4 (from the zod 3.25 package, not the pinned 4.6.7). The schema accepts it, and the projection rejects it both as is (not approved) and in an approved shape (figures without evidence).

## Rollback

Revert the branch's commits. No content store, release manifest, archive or deployment state was changed.

## Open items for the owner

1. Approve or edit the homepage copy, including the kicker's role terms and “leaders” in the H1.
2. Claims checklist (wording, provenance, privacy, vendor-name conflict, release mechanics).
3. Confirm Claims as the first case, or approve another; the homepage follows whichever investigation is approved first.
4. The social preview image still shows the 6 November headline; regenerating it is a separate reviewed change.
5. Whether the mobile hero should fit the evidence link above the fold at 320px, for example with a shorter kicker on narrow screens.

## 18 November additions (owner-approved)

- **Evidence threaded into the story.** At the owner's request ("it takes up so much space… thread and nest it in the rest of the body"), each statement can name the narrative section it supports (`section`). On the page it appears as one compact line under that section. Opening the line shows my part and the limitation. Statements without a section are still listed together, now under **How I know**. The evidence vocabulary is shown in plain language (What I saw, My interpretation, What was decided or recorded, Open question; "My part: I identified it", and so on). The stored values are unchanged.
- **Move the checkpoint** (Claims page). An explorable, conceptual illustration of "delivered ≠ complete". It switches when the next step goes ahead, the kind of problem (missing; unreadable or changed by hand; completed by only one of the people required) and the vocabulary (the claims case or everyday terms). Without JavaScript it shows both orders side by side. It encodes no measurements.
- **Same shape, different gap** (homepage illustration). A case picker re-labels the existing drawing with pairs restated from the previous edition's published summaries: Claims (delivered / complete), trust research (agreement / trust), civic service (service categories / voting questions), accessibility (checks passed / question settled). Each links to its summary. The labels are decorative; the live description carries the meaning.
- The Claims candidate remains unpublished. Its content digest changes with this revision, so approval applies to the new revision.
