# 27 October editorial alignment — review branch

Status: owner-directed **review candidate**, not publication approval. This document records a public-safe editorial inventory. The owner's presentation and speaker notes are not in this repository; this review used the 27 October development brief and the existing public code/docs. Source files, rights, exact wording and case outcomes still need owner review.

## Baseline and discrepancy inventory

At inspection, `origin/main` and this isolated branch began at `33b43c042d358da30cac1b4738fdae5e7b73fea2` (tree `5b1d120e408d71a7ce5498e4d7a44089d2e98bd7`). The separate `feat/site-copy-authoring` checkout contained unfinished, uncommitted Site copy changes and was not modified. The public selection in `content/public-release.json` is `no-approved-content`. A 28 October HTTPS request returned 200 from the live domain, and its HTML still contained the `18% → 7.6%` comparison; a source branch is not the live release.

| Area | Live or implemented baseline | New direction / discrepancy | Decision in this slice |
| --- | --- | --- | --- |
| Intro and home | One action, three automatic beats, skip/replay; `I swim upstream` leads a dense first screen. | Lead with visible outcome versus generating conditions; three professional moves are content, not gates. | Reorder the home candidate, retain the voice line and intro contract. |
| Navigation | Seven native menu links; `Work` and `Investigations` overlap. | Clear routes to current work, connections and optional method, without dead pages. | Consolidate the menu on this branch; keep legacy fragments and a direct hidden-work link elsewhere. |
| Cases | Six legacy cards, including `documentation-recovery` as a combined claims/research card; no canonical real articles selected. | Six investigation areas: claims, enterprise AI, civic, trust, telematics, accessibility + AI. | Keep all old anchors/IDs; use a migration ledger and restricted review outlines. No real article route is activated. |
| Claims | The live card asserts a direct `18% → 7.6%` reduction. | The two measures have different scopes. | Withdraw the comparison and any implied causal reduction; use a qualitative card candidate. |
| Accessibility | The card implies a clean automated check followed by a categorical human-use failure, with an unverified adoption claim. | The agent restored deliberately removed code; planned human review flagged potentially weak visual distinction under simulation, labels present. | Correct the candidate card and remove unsupported adoption/FAIL claims. |
| Connected reading | Prerendered routes, typed relationships, exact approved projection, no-JS reading, graph text equivalent; synthetic articles only in fixture builds. | New case/pattern pages need source/rights/exact owner approval. | Do not add real canonical entries or release selectors. |
| Authoring | Local authenticated D1 writing trial exists; Pages CMS/hosted publication remains incomplete. A separate Site copy trial is unfinished in another worktree. | Sustainable copy and manuscript workflow. | Preserve both. No P4 hosted release work in this slice. |

## Identity and route migration ledger

Existing UUIDs in `content/legacy-ids.json`, fragment IDs in `content/legacy-anchors.json`, and graph IDs stay stable. These routes are **candidates**, not active destinations. A browser fragment cannot be redirected by the server; old home anchors remain useful until an approved route and reviewed client mapping exist.

| Case area | Existing anchor / stable ID | Candidate route | Migration rule |
| --- | --- | --- | --- |
| Claims | `/#claims-operations` / `6c2f9e3e-23c0-4362-ada4-7d18a6ed998a` | `/investigations/claims-operations/` | Three chapters within one case; retain the old fragment. |
| Trust research | `/#brand-research` / `4c5ececa-e308-4a31-9566-b3cd2fc7a0b2` | `/investigations/brand-research/` | Editorial label may change; identity and fragment do not. |
| Enterprise AI | `/#enterprise-ai` / `8a218cf2-1ad6-461a-af6e-3f7ccadd9429` | `/investigations/enterprise-ai/` | Preserve existing identity. |
| Claims documentation reference | `/#documentation-recovery` / `33e3550d-6b04-4a91-878c-0225b464914d` | Claims chapter/reference, final URL undecided | Keep the anchor/UUID as a legacy reference. Do not merge its research-recovery text into claims. |
| Civic | `/#civic-service` / `873dde95-923f-41a0-bd19-55041eb4aae1` | `/investigations/civic-service/` | Preserve existing identity. |
| Accessibility + AI | `/#accessibility-ai` / `36e61934-b32a-4b04-a9c2-d6f99b73b5a2` | `/investigations/accessibility-ai/` | Preserve existing identity. |
| Telematics | No current legacy case anchor or approved ID | `/investigations/telematics/` | Assign a stable UUID only when a private draft is created; research recovery belongs here. Do not borrow the documentation UUID. |
| Related. Not equivalent. | No approved pattern ID | `/patterns/related-not-equivalent/` | Review-only static candidate. No route until an exact approved, rights-cleared revision is selected. |

All 17 original case/writing/archive identities remain in the existing generated migration ledger; this table records the **new six-area grouping** without replacing that inventory. Existing writing fragments and the hidden-work route are unchanged. Legacy graph project/tag edges are authored navigational associations, not automatically promoted to evidence-backed canonical relationships.

## Positioning and candidate structure

Lead with the visible-problem thesis and explain Sam's work with organizational assumptions, information, human behavior and operating conditions. Keep `I swim upstream toward the problem.` as a secondary voice line. `Investigate → Translate → Implement` describes recurring professional moves and may loop through learning; it is distinct from `Notice → Frame → Model → Test → Interrogate → Revise`, the inquiry/review reasoning loop. Neither is a set of intro gates or proof of organizational adoption.

The pattern candidate **Related. Not equivalent.** links six bounded distinctions to the six current legacy anchors in a readable list. Its rationales are interpretive proposals, not approved case findings. `Trust comes from not having to guess` is a retrospective, untested cross-study hypothesis spanning independent trust and telematics work. It does not establish a shared cause or adoption. The full Frame Laboratory remains out of scope.

## Source and approval gate

For each proposed case claim, obtain a private source locator, reporter/date, scope, contribution split, applicable metric definition/denominator/window, alternatives and limits, public derivative rights, and owner review of exact wording. The source remains private even if a later public claim is approved. Removing a demonstrably misleading comparison needs no new measurement; a replacement measured outcome does. No proposed canonical manuscript, graph relationship, pattern page or asset is approved by this document or by a passing build.
