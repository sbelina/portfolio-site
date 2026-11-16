# Evidence, inquiry and learning direction — audit and Phase 1 record, 16 November 2026

## Authority and scope

On 16 November the owner supplied the directive *Producing Curiosity — Evidence, Inquiry & Learning Architecture*. It authorizes reconciliation and reversible Phase 1 development, plus dependent preparation, on a feature branch. It does **not** authorize production deployment, merging into `main`, publication of real case manuscripts, new metrics, or approval of research claims. This record covers deliverables 1–3, 6 and 8–10. Companion documents:

- [Publication and evidence review ledger](PUBLICATION-LEDGER.md) (deliverables 4 and 7)
- [Learning and facilitation specification](LEARNING-FACILITATION-SPEC.md) (deliverable 5)
- [Reader evaluation protocol](READER-EVALUATION-PROTOCOL.md) (directive §16)

Work is on `claude/jolly-turing-noyo4q`, the branch this session is assigned. It also carries the unpublished Edge Case prototype ([record](EDGE-CASE-PROTOTYPE.md)). The directive excludes game work from this task, so the prototype is unchanged and remains fixtures-only. The owner has separately said the game will become part of the build; that needs its own release decision.

## Phase 0 — reconciliation

| Check | Finding |
| --- | --- |
| Branch base | The branch had diverged from `main` by five commits (Atlas, 14 Nov; Je ne sais qu’a, 16 Nov). Merged as `5d0f121`. Four conflicts were resolved by keeping both sides. |
| Live site | `producingcuriosity.com` `/`, `/investigations/` and `/practice/` matched a local build of `main` `3e19aa0` byte for byte on 16 November. `/about/` and `/learning/` return 404. |
| Other branches | `feat/claims-investigation-review` (draft, unmerged) already implements structured investigation reading, workflow comparison, artifact and evidence inspectors and authenticated prepared-case drafts. Phase 2 should build on that branch rather than duplicate it. `feat/atlas-inquiry-trial` was ported into the Atlas release. |
| Merge regressions | Adding WebKit to main’s pages exposed long hashtag buttons that could not wrap at 320 px / 200 % text. Fixed for the current homepage. The frozen archive has the same defect; its bytes are immutable, so the WebKit check now records it as a known archive defect. |

## Gap matrix

Status: **exists** (implemented and live), **refined** (changed in Phase 1), **prepared** (local or document only), **open** (not started), **blocked** (needs the owner).

| Pri | Directive requirement | Status | Evidence / next step |
| --- | --- | --- | --- |
| P0 | Relationship between portfolio, practice and observatory | refined | Homepage directions renamed; new observatory section separates experiments from evidence (`src/BuildIndex.tsx`). |
| P0 | Empty Investigations is a dead end | refined | Empty state explains the gate, shows the five-part account and gives four real routes (`CollectionStatus`, `src/reading/ReadingPage.tsx`). |
| P1 | Trust and Claims investigation pages | blocked | Reading instruments exist on `feat/claims-investigation-review`. Manuscripts, sources and rights need owner approval. See the ledger. |
| P1 | Learning & Facilitation pathway | prepared | Local shell `/learning/` (fixtures only) and the spec. Needs a substantiated case and artifacts from the owner. |
| P1 | Background and contribution easy to find | prepared | Local shell `/about/`. Needs confirmed titles, institution and wording. |
| P2 | Bridge from investigations and methods to educational questions | prepared | Learning shell section 3 and spec. No public claim yet. |
| P2 | Navigation, case summaries, contextual links | exists / open | The five primary destinations stay unchanged, as the directive requires. Case summaries are blocked until cases are approved. |
| P2 | Practice: worked example per move | open | Needs an approved investigation. Phase 1 adds only the two-process distinction sentence. |
| P3 | Atlas and Je ne sais qu’a | exists | Unchanged. Real-case Atlas content and SWIFT need separate approval. |
| P3 | Evaluation with readers | prepared | Protocol written. Nothing collected. |
| — | Proposed secondary positioning line | blocked | Recorded below for owner review. Not published. |
| — | Content-status ledger (Live, Draft, In review, Proposed, Synthetic, Archived) | exists in part | The model has `editorialState` (draft, review, approved, withdrawn), `visibility`, and relationship `reviewState`. Synthetic and archived are labelled per surface. A unified reader-facing status vocabulary is open. It must stay separate from epistemic classification. |

## Site architecture

| Route | Function | State |
| --- | --- | --- |
| `/` | Positioning, two directions, practice, How I Know, observatory, contact, archive disclosure | live; refined in this branch |
| `/investigations/` | Approved investigations, or an honest status | live; refined |
| `/investigations/:slug/` | Full account (existing reading template) | template exists; nothing approved |
| `/practice/` | Test. Show. Enable. and the inquiry loop | live; one sentence added |
| `/patterns/` | Related. Not equivalent. | live, unchanged |
| `/learning/` | Learning and facilitation | local shell only |
| `/about/` | Background, direction, collaboration | local shell only |
| `/lab/atlas/`, `/lab/atlas/text/`, `/lab/atlas/je-ne-sais-qua/` | Observatory | live, unchanged |
| `/#contact` | Email and LinkedIn | live, unchanged |
| `/builds/2026-11-04-418efb7/` | Frozen previous edition | live, immutable |

**Visitor journeys.** *Evaluate the work*: home → Investigations → account → practice → contact. *Explore the questions*: home → Related. Not equivalent. → Atlas or its text → Je ne sais qu’a. Neither journey depends on the other, and neither requires the introduction or the map.

**Navigation decision.** The primary menu stays at five items. About and Learning are not added until they have approved content and the menu change has been tested at 320 px / 200 % text, which the current five links already fill.

## Component inventory

| Component | State | Notes |
| --- | --- | --- |
| `CurrentShell`, `PublicNavigation`, `usePublicHeader` | existing | unchanged |
| `HomeIntroduction`/`IntroExperience` | existing | three steps plus Dive, unchanged |
| `BuildIndex` | modified | journeys, observatory section |
| `CollectionStatus` | new | static; no case data |
| `FoundationPage` (practice) | modified | one sentence |
| `ProposalPage` | new, fixtures only | About and Learning shells; marker `OWNER_REVIEW_PROPOSAL_16NOV` is rejected by the public audit |
| `ReadingPage`, `EvidenceFacts` | existing | investigation template |
| Workflow comparison, artifact and evidence inspectors, prepared-draft editor | on `feat/claims-investigation-review` | candidates for Phase 2 |
| Atlas proof, text comparator, inquiry space | existing | unchanged |
| SWIFT entry explanation | proposed | spec not yet written; needs owner letter meanings |

## Proposed wording awaiting owner review (not published)

> I investigate the disconnects between what people observe, what they believe explains those observations, and what their systems actually enable. Through research, design, and facilitation, I make those distinctions useful to the people making decisions and the people affected by them.

If approved, it would replace the current lead paragraph under the homepage statement, which is itself approved wording.

## Verification (Phase 1)

Run locally on Node 22 with the committed lockfile:

- Production and fixtures builds passed. The public audit passed on 80 files; `/about/` and `/learning/` are absent from `dist/`.
- `tests/direction-phase1.spec.ts` checks:
  - both directions and observatory labels without JavaScript;
  - observatory links resolve;
  - the empty-state structure and links;
  - the shells return 404 in production and are noindex locally;
  - the learning shell separates its three kinds of material.
- With the related design-system, public-output and build-archive specs (including axe checks), 72 tests passed in Chromium, WebKit and Firefox.
- Screenshots at 390 and 1280 px were inspected by the agent; none of these pages scrolls horizontally.

**Independent review.** Two read-only specialist reviews (evidence/editorial, interaction/architecture) found no high-severity issues. Changes made in response:

- Corrected the archive description: it is the reviewed 4 November build, not a copy of what was live.
- Labelled the remaining unlabelled shell statements as candidates, and dropped “mentoring”, which has no source.
- Softened template wording that assumed adoption or uptake.
- Rephrased the gate as Sami’s approval rather than an implied workflow.
- Described the Atlas as an experimental layout.
- Replaced a nested complementary landmark.
- Strengthened the tests: a closed-disclosure check, a robots-meta check, the fixture manifest flag, an audit-marker unit test, 320 px / 200 % reflow, and the About outline.

Not changed: the review shells are static, so their header does not condense. The production test server on port 4175 serves the existing `dist/`, so run `npm run build` first; `npm test` already does.

**Full verification after review fixes.** Run on Node 22 with `npm ci`:

| Check | Result |
| --- | --- |
| `npm run build` (public audit) | passed, 80 files |
| `npm run check:deploy` | passed |
| `npm test` (Chromium, WebKit, Firefox, iPhone-emulated WebKit for game specs) | 707 passed, 0 failed, 11 skipped |
| `npm run test:atlas` | 22 passed |
| `npm run test:studio` | 11 passed |
| `npm run test:studio:inquiry` | 1 passed |
| `npm run check:studio` | passed |

An earlier full run had one WebKit failure. The legacy fixture homepage’s suggested-entry tag `#accessibility` could not wrap at 320 px with enlarged spacing; that run also overlapped an Atlas rebuild. The fix adds `overflow-wrap` to `.graph-entry-tags button` and a shrinkable field-note grid column. Failed runs are not counted as passes.

Not established: screen-reader behaviour on real devices, native browser zoom, and whether visitors understand the site better. Technical passes are not reader evidence.

## Continuation plan

1. **Owner decisions.** Approve or edit the secondary line. Confirm the About facts. Choose the learning-design case. Choose the order of Trust and Claims.
2. **Phase 2.** Rebase `feat/claims-investigation-review` onto current `main`. Prepare the Trust and Claims manuscripts in the private studio, never in Git, against the ledger’s questions. Produce candidate revisions; the owner approves exact revisions. Promote one investigation and update the homepage card and Practice examples from it.
3. **Phase 3.** Fill the learning case from owner artifacts. Keep *How do we know what we know?* labelled untested until it is run. Publish `/learning/` only after review, and add it to the menu after a navigation test.
4. **Phase 4.** Contextual connections from approved cases. Write the SWIFT specification (dismissible, recoverable, no required completion) once the owner supplies letter meanings. Real-case Atlas content needs a separately reviewed classification.
5. **Phase 5.** Run the reader protocol and revise from what is observed.

## Rollback

All changes are on the feature branch. To undo Phase 1, revert `2dfdd28`. To undo the merge, `git revert -m 1 5d0f121`. No production, DNS, credential or data change was made.
