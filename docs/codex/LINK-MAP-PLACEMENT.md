# Link map placement and internal navigation — 30 October 2026

## Decision and actual implementation

The map now follows the homepage thesis/value statement, before the long selected-work list. This makes the site's connected way of seeing available on the next reading screen. Visitors choosing Investigations still bypass it with a native link. It remains optional; no intro or graph interaction is required to read cases. This is a strategic design hypothesis, not demonstrated recruiter/reader impact.

Order: orientation → map → selected work → explained distinctions → reading collection gateway → method → writing/archive → contact. Previously the map followed six lengthy summaries, the reading gateway and the entire distinction grid. `#connections` remains the public entry anchor; `#system-map` remains the direct trace destination. All old IDs and publication boundaries are preserved.

## Internal link inventory and repairs

| Source → destination | Change | Remaining boundary |
| --- | --- | --- |
| Hero/menu → map | Retained native `#connections`; downward hero arrow matches earlier placement. | Direct case CTA remains visible. |
| Map → case/writing | Selected trace offers a named summary link below the map. Text alternative now includes direct links. | Existing descriptions/excerpts are not full approved manuscripts. |
| Case → map | Added a case-level trace control; existing tag controls still select a node. Upward icons reflect placement. | These controls select/filter the graph and remain buttons. |
| Case ↔ explained distinction | Stable `distinction-{case-id}` anchors and reciprocal links. | Interpretation, not approved causal edges. |
| Claims knowledge reference → Claims | Added an explicit link to the connected claims account. | The legacy reference stays separate. |
| Writing/archive → map | Existing trace controls now point upward, retaining selection behavior. | No manuscript imported or promoted. |
| Map → archive item | Individual archive article IDs and exact graph hrefs replace the generic archive destination. Native fragment navigation opens the containing disclosure. | Link opens the existing description, not an unavailable full poem/manuscript. |
| Map → method | Language, multimodal, orientation and Delta nodes link to existing corresponding method sections. | Loops/spirals has no equivalent substantive standalone section; it retains its existing explanation and no invented source link. |
| Text alternative → all layers | All relationships readable in native disclosure independent of JS layer controls; source-bearing nodes use real links. Non-source concepts are text. | Static description is not a clickable fabricated source. |
| Footer → hidden-work experiment | Changed outward arrow to internal-page arrow. | Existing illustrative experiment unchanged. |

Arrow convention: ↓ below in the same document; ↑ above; → another internal page; ← collection/parent return; ↗ external destination. Existing external LinkedIn arrow is correct. Relationships retain their source→verb→target statements even when reached through a backlink; navigation arrow direction does not change a relationship claim.

## Files, recovery and verification

Implementation: `src/App.tsx`, `src/components/ConnectionGraph.tsx`, `src/components/ExplainedConnections.tsx`, `src/data.ts`, `src/styles.css`. Tests in `tests/link-map.spec.ts` inspect DOM order, round trips and Back behavior, every graph source/home fragment, arrow direction against actual document order, and no-JavaScript touch access into an archived description. Existing direction, motion, intro, privacy and reading checks remain applicable.

No dependency, CMS, data migration or publication-selection change. Production unchanged. Revert the link-map implementation commit and rebuild to recover; prior IDs are retained. The generated migration ledger adds only real new anchors. New case manuscripts still require evidence review and exact approval; unavailable canonical destinations remain404.


## Actual check results

- Full `npm test`: **130/130 passed** (`/tmp/link-map-verified.log`), including production type/build/prerender/artifact audit and fixture/browser checks. Existing three-action intro, approved-content boundaries, original17content IDs, graph direction and reading routes remain covered.
- Final refinements: selected graph nodes receive keyboard focus and scroll into view after a trace; smaller map heading/shorter introduction expose the diagram sooner; a native text-reading shortcut opens the all-layer list. After these refinements, production `npm run build`, `npm run check:deploy` and **6/6 affected link-map/direction/motion tests passed** (`/tmp/link-map-final-focused.log`). No full suite repeat after those bounded refinements.
- Regression development caught an old exact footer-arrow expectation, a fake-clock/effect ordering assumption in the existing wheel test, and a text shortcut initially targeting the already-visible summary rather than hidden list content. Corrected expectations/timer flushing/fragment target; final checks pass. An intermediate trace-file stream error disappeared on rerun and establishes no application defect.
- Manual visual inspection: actual desktop1440px/mobile390px map captures before and after reducing heading/copy; final probes found no horizontal overflow. Earlier trace probes found no page errors. Captures `/tmp/link-map-1440.png`, `/tmp/link-map-390.png`, `/tmp/link-map-trace-1440.png`, `/tmp/link-map-trace-390.png`. The final map captures reflect the smaller header; trace captures predate that copy/size refinement. A stale local preview during rebuild was restarted before final captures.
- `git diff --check` passed. No dependencies changed, no fresh install or private-editor test run for these public navigation changes. No remote CI or public preview because nothing was pushed/deployed.

Reader/recruiter impact, real assistive-technology use, physical devices and field performance remain unverified. The earlier placement is a hypothesis to assess with people, not a measured engagement improvement. No new case material was approved or published.
