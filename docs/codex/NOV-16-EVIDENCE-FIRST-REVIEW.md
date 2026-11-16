# Evidence-first review branch: 16 November 2026

**Branch:** `review/evidence-first-claims` · **Status:** owner review. Not merged, not deployed. No case content is approved by this branch.

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

**Deliberately unchanged:** navigation, intro (three steps plus Dive), Atlas and Je ne sais qu’a code and semantics, design tokens, asterisk placeholder, Practice and Connections pages, immutable archive bytes, `content/public-release.json` (`no-approved-content`), `docs/codex/page-review.json` approvals (all `null`).

## Interim evidence route: what it is and isn't

Until an investigation is approved, the homepage links to the previous edition's Claims summary at `/builds/2026-11-04-418efb7/#claims-operations`. That summary was already public in the reviewed previous build. It states the question, contribution and open limits, and the archive page carries its own archived-build notice. It is not an approved full case, and the homepage says so in the link's description.

Known issue: the archived summary names the salvage vendor, which the owner has asked not to name publicly. The archive cannot be edited. See the candidate's checklist.

## Verification

Network installs were unavailable in the session that prepared this branch, so `npm ci`, `npm run build`, `npm run check:deploy` and `npm test` **were not run.** What did run:

- Syntax transpile of every changed TypeScript/TSX file with TypeScript 6 (`transpileModule`): no diagnostics. This is not a type-check.
- Server render of `BuildIndex` with React 19.2.8 in both states (no approved investigation; one synthetic approved entry), plus Chrome screenshots at 1440×900, 390×844 and 320×740 using the source CSS. The hero evidence link is in the first screen at 1440×900 and 390×844. **At 320×740 it falls just below the first screen.**
- Archive checks by script: every summary anchor and title used exists in the frozen review HTML; the archive contains no withdrawn Claims figures.
- `ReadingPage` was not rendered (it needs the pinned zod 4, which was unavailable).

Required before merge: run the four repository checks with the pinned toolchain, including `tests/evidence-first.spec.ts`, and inspect `dist/` for the canary and for the previous-edition link. Then do a manual keyboard and screen-reader pass on `/` and `/investigations/`.

## Rollback

Revert the branch's commits. No content store, release manifest, archive or deployment state was changed.

## Open items for the owner

1. Approve or edit the homepage copy, including the kicker's role terms and “leaders” in the H1.
2. Claims checklist (wording, provenance, privacy, vendor-name conflict, release mechanics).
3. Confirm Claims as the first case, or approve another; the homepage follows whichever investigation is approved first.
4. The social preview image still shows the 6 November headline; regenerating it is a separate reviewed change.
5. Whether the mobile hero should fit the evidence link above the fold at 320px, for example with a shorter kicker on narrow screens.
