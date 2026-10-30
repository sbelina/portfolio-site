# 30 October review: architecture, evidence and visual presentation

## Baseline audit (before edits)

Review branch `feat/oct30-visual-evidence-review`, based on `6833b84` and five preserved review commits above remote main `33b43c0`. Working tree was clean. Remote main was read with `git ls-remote`; no push, merge or deployment. Other Site copy worktrees remain untouched.

| Area | Implemented baseline | Gap / decision |
| --- | --- | --- |
| Stack | React19, TypeScript, Vite8, Zod4, Cloudflare static Worker, pinned p5 1.11.13 | Retain; no dependency additions. |
| Routes | Home, investigations collection, hidden-work experiment; finite canonical fixture routes, aliases, true404 | No approved real canonical cases. Preserve all17 legacy content IDs and fragment ledger. |
| Content | Stable UUIDs/revisions/slugs, typed edges, evidence/assets, exact-selection projection | Add optional versioned investigation narrative/evidence classifications; old records remain valid. |
| Homepage | Six legacy cards (one is a claims knowledge reference), writings/archive, optional graph, three destination links | These summaries bypass canonical projection. Whole homepage diff needs owner approval before any public preview/release. |
| Intro | One deliberate start, three automatic beats, dive, skip/replay, storage recovery and reduced motion | Preserve code and test; no new gates. |
| Reading | Prerender, page-specific payloads, evidence disclosures, verse, backlinks, text navigation | New visual/narrative metadata must remain page-specific and support static reading. |
| Visuals | Dark palette, violet/unresolved, coral/friction, teal/learning; HTML/SVG AssumedObserved; optional lazy p5 hidden work | Add four reusable conceptual composition families; no invented quantitative geometry. |
| Navigation | Shared menus, condensing home header, skip/focus, meaningful graph direction | Retain anchors; explained distinctions supplement optional map. |
| Authoring | Isolated local authenticated durable D1 trial; preserved originals, six review passes, stale saves, protected preview | Hosted CMS/publisher and universal Site copy editing still incomplete. Extend model, no replacement editor. |
| Evidence | Claims direct18→7.6 comparison removed; accessibility code restoration separated from simulation | Name, method triad, collaboration/authority and case scope need reconciliation. |
| Release | Static-assets404 configuration; CI build/test/package; production selection empty | No unapproved manuscripts, private artifacts, or new approvals. |

## Implementation map

1. Correct active identity, evidence rules and owner-reviewed outline files; retain historical originals/review records. `AGENTS.md`, `src/data.ts`, `scripts/seo.ts`, `docs/codex/review-candidates/`.
2. Homepage value/three moves, shared experiment note: `src/App.tsx`, `src/components/ExperimentNote.tsx`.
3. Add optional narrative contract, evidence classification and four visual families: `src/content/investigation.ts`, `model.ts`, `projection.ts`, `src/visuals/InvestigationVisual.tsx`; consume in reading template and page-specific selector.
4. Explain reusable concept pairs and nonmandatory inquiry cycle: `src/components/InquiryMethod.tsx`, `ExplainedConnections.tsx`; stable map anchor remains unchanged.
5. Synthetic fixture demonstrates new narrative template only, excluded from production. Focused tests plus existing browser/build/package checks. Add authoring/recovery instructions and receipts here.

## Source and approval boundaries

Owner messages received27–30October are attribution/framing direction, not internal source artifacts or exact approval of case manuscripts. No employer documents or private content imported. Latest brief supplies20,000+ residents; earlier context distinguishes16,000+ population/flyer estimate from reach. Both require distinct definitions and source review; neither enters homepage as a verified result. Trust800+/9days, AI38/8/7teams, telematics70/−20/same6, and claims18%/7.6% remain source-scoped review candidates; no causal arrows between metrics.

The previous accessibility shorthand “a person couldn't tell two states apart” is narrowed by the latest detailed sequence: potential distinguishability concern under simulation with labels present. No actual user failure or standards violation established.

Four visual families are conceptual illustrations; spacing/size encode no measured duration, magnitude or causal strength. Owner's supplied WEBGL sketch is inspiration only, not copied/run as manuscript instructions or added to the homepage. Frame Laboratory remains out of scope.

## Implemented changes by phase

- P1: Active identity is Sami; homepage value proposition and metadata use organizational diagnosis/research/service design language. The single three-move method is Find the gap / Trace the mechanism / Design what holds. Older frozen source/review originals remain historical records, not current copy authority.
- P2: Three exploration links retained, shared menus/header/intro untouched. Legacy `#connections` now begins with explained comparisons and continues into the map; internal tag/trace actions target `#system-map` directly. All original content anchors remain.
- P3: Optional investigation schemaVersion1 added to existing entryVersion1 as a backward-compatible extension. Four reusable SVG/HTML families, conceptual labels, optional narrative fields and classified statements. Runtime projection validates selected statement references and measurement provenance, rejects unverified selected claims, and copies only allowlisted narrative data. No actual case is marked approved. An invented existing handoff fixture exercises the new template without importing a real manuscript.
- P4: Reusable five-case distinction metadata drives homepage illustrations and explained links; comparisons are explicitly editorial interpretations, not selected canonical relationships. The method shows six overlapping inquiry moves with an optional model-revision explanation and static visual. Usability/retention and compliance/comprehension remain questions awaiting fuller sources; no speculative Frame Laboratory.
- P5: Existing private editor preserved. [Authoring instructions](INVESTIGATION-AUTHORING.md) describe the model, publication limits, migration and recovery. Dedicated editor forms for the new optional fields, hosted authoring/publication and universal Site copy controls remain incomplete.

| Investigation | Changes / retained limits |
| --- | --- |
| Claims | Unassigned evidence-building, IAA/adjuster authority; earlier verification separated from collaborative administrator knowledge development. Guide not generated from log categories. Three artifacts retained. Direct18→7.6 comparison remains removed. |
| Trust | Live co-design with two peers, vendor fieldwork, agreement versus reported influence.800+/nine days/framework use held for source review; no trust-increase claim. |
| Enterprise AI |38/8 structure distinguished from implementation; seven-team involvement and largest-team leadership added to review outline, not inflated into strategy ownership. |
| Accessibility | Originator/co-facilitator credit, coding/accessibility agents, successful restoration, separate simulated labeled-state concern, prototype/archive/intended benefit distinctions. |
| Vote Huntsville | Nonpartisan2020 origin, resident questions versus office organization; conflicting reach scopes flagged, no new public number or turnout claim. |
| Telematics | Same-six SUS≈70/program NPS≈−20 retained only in review outline with instrument/sample limits; research recovery remains here. No published new canonical case. |
| Claims knowledge legacy reference | Existing ID/anchor retained as connected reference, not silently removed to make six cards fit six canonical cases. |

## Substantive evidence still required

1. Claims: independent definitions/denominators/periods for each rework observation; workflow-change record; reviewable derivative supporting statewide use and separate training artifacts.
2. Accessibility: event/prototype sequence and review record; owner-supplied redacted code/review artifacts if approved. No internal repository or employer documents imported.
3. Trust: fieldwork/sample/instrument and framework-use record. AI: source counts, team scope and contribution record. Civic: reach-channel definition and time window distinct from population/flyer estimate. Telematics: instruments, calculation/precision and six-participant scope.
4. Exact wording, rights-cleared derivatives and authenticated owner approval of each candidate. These are release dependencies; routine UI decisions need no additional owner confirmation.

## Next bounded task

Use the existing private trial to assemble one original-preserving Claims draft with two response paths (earlier verification; collaborative knowledge), attach owner-supplied redacted evidence, and review exact claims/definitions. Add dedicated narrative-field editing to that trial after a schema round-trip proof. Do not change the empty release selection or expose private previews publicly.

## Verification record — 30 October

Automated: pinned Node22.23.4, existing lockfile-installed dependencies. No dependency changes and no new frozen install in this pass.

- `npm test`: final runtime suite **125/125 passed**, including TypeScript app/tools checks, Vite production build, finite prerender, production artifact audit, fixture build and Chromium browser tests. Six focused new tests cover schema discrimination/duplicate IDs, private source rejection, unverified/measurement/incomplete publication failures, stale exact selections, unrelated narrative/body exclusion, escaping, no-JS keyboard reading,320px200% text enlargement, touch and axe checks on added components.
- Initial run123passed/two new harness failures (frozen-fixture mutation and CSP-blocked style injection); corrected test setup, then125passed. After the connection-anchor/source-explanation refinement, another full run passed125/125 (`/tmp/oct30-tests-release.log`). No failures remain.
- `npm run test:studio`: **11/11 passed** (`/tmp/oct30-studio.log`), including durable authenticated synthetic intake/review/preview and poetry. After final presentation integration, `npm run studio:build` passed private type/UI build and `npm run check:studio` passed dry-run packaging. No new hosted save/restore proof claimed.
- Final `npm run build` and `npm run check:deploy` passed after correcting fallback HTML identity; the final other change was a non-executable identity comment in studio/model.ts. Full suite was not repeated for that fallback spelling/comment-only correction. Logs `/tmp/oct30-build-final.log`, `/tmp/oct30-package-final.log`, `/tmp/oct30-studio-build-final.log`, `/tmp/oct30-studio-package-final.log`.
- Production audit passed24files; public projection empty, no fixture/private canaries. All17 legacy content identities retained; generated ledger adds new explanatory anchors only. Unknown real case/pattern routes still404. No new approval records or case routes.
- `git diff --check` passed. No lint script exists. No remote CI/hosted preview: branch is local and unpushed, avoiding automatic public previews of unapproved copy.

Manual visual inspection: actual Chromium captures of homepage, Connections, method and synthetic representative reading at1440px and390px. Labels/captions remained legible and layouts retained the dark identity. Narrow reading uses full-size stacked text. Browser probes recorded no horizontal overflow or page errors at either width; homepage requested five resources and no p5 sketch. This is a loading observation, not a performance score or field Core Web Vitals result. Existing optional p5 chunk remains approximately1MBraw/255KBgzip and is lazy; no animation dependency added.

Screenshots (local, not uploaded): `/tmp/oct30-home-1440.png`, `/tmp/oct30-home-390.png`, `/tmp/oct30-connections-1440.png`, `/tmp/oct30-connections-390.png`, `/tmp/oct30-reading-1440.png`, `/tmp/oct30-reading-390.png`, `/tmp/oct30-method-1440.png`, `/tmp/oct30-method-390.png`. Reading captures show an expressly synthetic fixture, not a published case. Probe record `/tmp/oct30-browser-observations.json`.

Unverified: physical touch devices, real screen readers, native browser zoom, reader/recruiter comprehension, field performance, independent human evidence review, hosted private CMS/new-field forms, authenticated production approval/release and actual project source documents. Browser emulation and axe passes do not establish WCAG conformance or improved understanding.

Recovery: no release/data migration occurred. Revert this branch’s implementation commits in reverse order and rebuild; keep audit/source records. Export new private draft fields before reverting to old strict schemas. Full procedure in [authoring instructions](INVESTIGATION-AUTHORING.md). Existing production remains unchanged.
