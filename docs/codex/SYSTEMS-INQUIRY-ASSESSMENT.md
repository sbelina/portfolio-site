# Dual-system inquiry: implementation assessment

26 October 2026. Assessed source at HEAD `eaac980c6eb6d3aa5fcd1738b7abdc316c9f6803` plus the existing uncommitted authoring work on `feat/claims-authoring-slice`. Documentation integration is isolated on `feat/systems-inquiry-charter`; that prior work was carried forward unchanged, not committed or declared complete by this assessment. No live deployment was inspected. The [adopted charter](SYSTEMS-INQUIRY.md) is guidance; this record does not authorize a Frame Laboratory build.

## Current reality

| Area | Source-observed implementation | Boundary or missing capability |
| --- | --- | --- |
| Assumed → observed | [Strict block contract](../../src/content/assumed-observed.ts): stable node/edge IDs, stored quotation strings, evidence IDs, supports/challenges/qualifies, documented/interpretation/hypothesis, explanation, limitation and missing evidence. Duplicate/dangling connections fail; documented edges cannot list unresolved supporting evidence. | No explicit frame, actor attribution for assumptions, alternatives, model ID/version or revision narrative. The validator verifies structure, not that quotations or “documented” assertions are true. |
| Inspectable interface | [HTML/SVG renderer](../../src/visuals/AssumedObserved.tsx): stable order, one selection, source/passages/limits, textual edge status, close/Escape focus recovery, native no-JS disclosures. | Selecting an assumption is not switching an explanatory framework. The “Stated assumption · unresolved” heading is a presentation default, not a validated epistemic judgment. No competing-model comparison. |
| Relationships | [Versioned contract](../../src/content/model.ts): IDs/revisions, directed from/to, eight explicit types, rationale/evidence IDs, provenance, visibility and editorial review. `shares_pattern` is symmetric; projection canonicalizes endpoint order. [Reading links](../../src/reading/ReadingPage.tsx) preserve direction and explain rationale/backlinks. | Global edges lack dedicated support-status, alternatives and limits fields. `reviewState` is editorial review, not documented/inferred/hypothetical status. Diagram status and global relationship status are different contracts. No behavioral equations/rates/delays. |
| Provenance/public boundary | [Projection](../../src/content/projection.ts) selects exact revision/digest, validates rights and references, allowlists public fields and freezes a detached result. [Page selection](../../src/reading/page-data.ts) includes current blocks, relevant evidence/assets/edges and linked-entry metadata. | These mechanisms protect integrity and scope, not interpretive truth, immutable durable source storage or authenticated approval by themselves. Diagram passage strings are not bound to exact evidence passage offsets/revisions. Public evidence/relationship projections omit revision numbers. Frame provenance and historical explanations are not public fields today. |
| Investigation reading | Stable URLs/aliases, sanitized initial HTML, evidence disclosures, explained links and literal poetry are established. The pending authoring slice adds investigation depth anchors and promotes an existing Limitations block. | No dedicated dual-system sections or model-revision view; generic prose/callouts can already carry this material. Do not claim pending authoring changes were released. |
| Private review | [Local studio model](../../studio/model.ts) has six prepared review passes, proposals, preserved originals, source digests, draft revisions and exact frozen candidates. Local approvals remain unpublished and release-ineligible. | Review prompts are not completed substantive reviews. No Model Challenger control exists. D1/Git revision history is not an explanation of why an intellectual model changed. Pending cross-repository import work is not a demonstrated hosted publishing cycle. |
| Experiment scope | [Assumption fixture](INSPECTABLE-ASSUMPTIONS.md) and [p5 evaluation](P5-EVALUATION.md) distinguish illustration from findings and technical checks from comprehension. | No frame comparison or human comprehension result. Hidden-work animation depicts an illustrative sequence, not a calibrated dynamical model. |

[Production selection](../../content/public-release.json) remains `no-approved-content` for canonical entries; the legacy homepage and previously authorized standalone hidden-work illustration are separate. Candidate corpus titles and metrics from the attachment have not been imported. Earlier release records are historical snapshots, not proof of today's remote CMS/session state.

## Capability assessment and evidence needed

| Capability | Reuse now | Missing work and evidence required |
| --- | --- | --- |
| Inspect the explanatory framework | Question, source passages, limitations, prose/callouts and textual rationale. | Explicit question/unit/actors/boundary, categories, what each frame foregrounds/excludes, and links to approved source revisions. Owner review must distinguish their account from agent interpretation. |
| Relationships versus behavior | Typed edges and explicit diagram status; existing categorical illustration. | State the distinction in model prose. A real behavioral model additionally needs sourced variables/units, rules, rates/delays, initial conditions, parameter provenance, alternative predictions and sensitivity checks. Static scores/associations cannot supply these. |
| Change frame, hold evidence constant | Stable evidence identity and exact revision/digest selection; detached projection. | No frame schema/selector exists. A future proposal must reference one immutable evidence set, not duplicate mutable quotations per frame; verify referential identity/content hashes across selection and no hidden changed scores. Private references must never enter a public fixture. |
| Competing explanations/missing variables | Per-edge missing evidence and limitation; general prose. | Explicit rival accounts, unequal support, excluded actors/variables and discriminating observations. Missing evidence and a competing mechanism are not interchangeable. State when alternatives are not yet identified. |
| Model revision in response to evidence | Content revisions, preserved originals and local history. | Explicit earlier claim → challenging evidence → changed model → reviewer/date → uncertainty. No fabricated previous explanation or transformation; distinguish software edits from model changes. |
| Supported transferable principles | Investigation/pattern kinds, rationale, typed edges, symmetric associations and equivalent reading links. | A reviewed cross-case proposition with scope, contrary cases, source-case-specific support and revision triggers. An arc index is absent, but is not required to validate a principle; assess existing text links before adding it. |

## Smallest reversible improvement chosen

Integrate the inquiry loop into the existing instructions and supply the following reusable **model challenge record** for existing private editorial reviews. It can be recorded as review notes/prose without schema changes. No new runtime, public claims, database migration or footer capability claim is needed. This makes the explanatory assumptions inspectable to reviewers before testing whether another visitor interaction helps.

For each meaningful model/design decision, fill in:

| Record | Required content |
| --- | --- |
| Identity/basis | Review ID/date, existing entry/block IDs and revisions or application commit, source references and privacy. Unknowns remain explicit. |
| Notice and frame | Observation versus reported account; object-system scope; inquiry-system question, unit, actor position, categories and success measure. |
| Model and alternatives | Candidate mechanism, epistemic layer, relationship versus behavior, competitor or explicit absence of a meaningful alternative. |
| Test and interrogation | Discriminating observation, disconfirmation, excluded perspectives/variables, proxy risks, and what labels/layout cause the reviewer to assume. |
| Revision and decision | Previous claim or “no prior model recorded,” challenge, changed explanation, reviewer, unresolved issues and proposed action. Do not fabricate a review date or identity. |
| Approval boundary | Pending/accepted/rejected suggestion and exact review basis; remains separate from publication approval. Any changed candidate requires existing approval procedures. |

Model Challenger questions belong within Evidence Reviewer/Experience Reviewer notes and Release Checker verification for now. This documents a practice; it does not claim the editor enforces completion or adds a new persisted pass.

## Self-application and revision record for this change

- **Notice:** existing diagrams expose local assumptions but no explicit explanatory frame; the attachment proposes richer instruments.
- **Frame:** treat this as an evidence/review problem before an interaction problem. Assumption: recording alternatives improves reviewer accountability. Competing account: added documentation becomes overhead and reviewers still embed conclusions in labels.
- **Model:** a small challenge record could expose unsupported inference earlier than a new visualization. Missing variables include author effort, readers' prior knowledge, access needs and review quality.
- **Test:** inspect actual contracts and guidance for contradictory authority, unsupported capability claims and private-data inclusion; separately test usefulness with a synthetic review before any frame UI.
- **Interrogate:** source inspection and agent critique cannot establish how authors/readers understand an explanation. The proposed record may favor verbal reasoning; a visual comparison could later prove useful.
- **Revise:** preserve the existing intro and color contract; adopt the dual-system method and editorial integrity requirements. **Object-system explanation:** none changed; no empirical case was reassessed or published. **Inquiry-system change:** require explicit frames, alternatives and revision reasons in meaningful reviews. Prior workflow/runtime remains intact. Reviewer identity and actual check results are recorded below.

## Next bounded experiment — proposal, not an approved feature

First complete one **synthetic static frame comparison** using existing prose/callouts. Use invented, explicitly labeled interface/program/participation observations with no real portfolio metrics. Give all frames the same evidence IDs and revisions; list what each can/cannot support, exclusions, rivals and next test. Do not turn it into a behavioral simulation or auto-create canonical relationships.

Before coding, define a comparison against static text containing the same facts and qualifications. A future isolated selector would be considered only if the static review exposes a question it helps answer. Proposed pilot protocol:

1. Recruit a small voluntary set of representative readers with varied familiarity/access needs; keep identifiable notes private. Counterbalance presentation order if the same people see both versions and record learning/order effects.
2. Ask readers to distinguish observation from explanation, identify the frame and omission, compare two accounts, state what supplied measures cannot establish, recover provenance/uncertainty, and explain a model revision without asserting the world changed.
3. Prespecify a rubric: each answer is accurate, partial or unsupported against the same evidence key. Record verbatims and mistaken causal inferences; clicks and time alone are not comprehension outcomes.
4. Proposed failure/revise gate: any framing-induced factual/causal misreading or inaccessible essential qualification requires correction before expansion. If the selector shows no useful distinction beyond the static account, keep the static version. A small qualitative pilot cannot establish general superiority.
5. If implementation is later authorized, test keyboard/focus, touch emulation, narrow/zoom reflow, no-JS text equivalence, reduced motion, unchanged evidence hashes, invalid frame/reference rejection, private-artifact exclusion and page-payload scope. Physical devices and actual assistive technology need separate human checks.

No participants, comparison results, Frame Laboratory, new frames schema, or transferable-principle engine are supplied by this integration. Do not build a “Follow a Pattern” arc merely to satisfy the attachment's suggested dependency order: readable explained links already exist; necessity and source approval remain unproven.

## Verification and recovery

This task changes only repository guidance and this assessment. Validate added relative links, Markdown fences, source references, whitespace and the scoped diff. Full runtime/browser suites are unnecessary for these documentation-only edits; older passing test records are not presented as fresh results. No human comprehension, screen-reader, physical-device or production verification is claimed.

Actual checks for this integration: a local Python documentation check passed for all five changed guidance/assessment files, resolving 54 relative links, checking paired fences and trailing whitespace, verifying the attachment digest, and confirming seven assessed runtime/boundary files still match HEAD. `git diff --check` passed. Root inspected the scoped additions; specialist `/root/authorship_reading` independently inspected the source and new guidance without edits or manuscript access. Its two caveats—quotation strings lack exact source binding and public evidence/edges omit revisions—are incorporated above. It reported no further substantive findings. This is source/documentation review, not runtime approval or publication authorization. Existing pending authoring changes retain their separate verification obligations.

Rollback: revert only this task's additions to `AGENTS.md`, the context index and development-experiment link, and remove the two `SYSTEMS-INQUIRY*.md` documents. Preserve the pre-existing authoring working tree and all private sources. No content/store migration or deployed release needs rollback.
