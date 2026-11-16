# Claims operations: publication candidate (not approved)

<!-- CLAIMS_CANDIDATE_UNAPPROVED_16NOV: build canary. scripts/audit-public.ts fails any public artifact containing this marker. -->

**Status:** proposed public-safe wording for owner review, 16 November 2026. **Not approved and not published.** This file does not change `content/public-release.json`, add a route, or create a selected revision. Only an authenticated owner action bound to the exact candidate digest can authorize publication (see [evidence rules](../EVIDENCE-RULES.md) and [content contract](../../design-system/CONTENT_CONTRACT.md)).

**Stable ID:** `6c2f9e3e-23c0-4362-ada4-7d18a6ed998a` · **Candidate route:** `/investigations/claims-operations/` · **Earlier outline:** [claims-operations.md](claims-operations.md)

**Sources used to draft this:** the existing review outline, the 27 and 30 October owner corrections, the 6 and 16 November evidence rules, and owner statements made in conversation. **No employer document, log, or record was inspected.** Every statement below is therefore *owner-reported* until a source is attached in private storage.

**Public-safety choices in this draft:** no employer name, state, job title, vendor name, exact internal figure, document title, or internal locator. Internal figures appear only as rounded or averaged estimates. The salvage vendor is described by role ("the salvage partner"). Exact figures are held out of this public repository; the owner has a separate private notes file listing them with provenance questions.

---

## A. Short version: the smallest approvable unit

Intended as the first thing published if the full case needs more time. About 150 words.

> **Claims operations: when “complete” still generated work.**
>
> In a claims team's total-loss process, paperwork could be recorded as delivered before anyone had confirmed it was sufficient. Payment sometimes followed the delivery record, and errors surfaced later as rework for customers and staff.
>
> Working unassigned, I logged recurring exceptions, traced the handoffs between adjusters, administrative staff and the salvage partner, and brought the evidence to management. Management chose to make payment wait for the salvage partner's review; who decides what did not change.
>
> Separately, I facilitated sessions in which administrators shared the practical knowledge behind the process. That knowledge informed three distinct resources for different audiences: a paperwork guide, a support training deck and onboarding materials.
>
> **My role:** I identified the problem, built the evidence, led the review-timing change, facilitated the knowledge sessions, and wrote the guide and training deck.
> **Not established:** a measured reduction in rework, or that any single change caused one.

---

## B. Full case, mapped to the investigation schema

Field names follow `src/content/investigation.ts`, so this can be entered into the private studio without restructuring.

**Title:** When “complete” still generated work.
**Summary (entry.summary):** A delivery record and a sufficiency check described different states. Moving the review point earlier, and sharing practitioner knowledge, addressed the gap between them.
**Composition:** `boundary` · **Visual:** left `Delivered`, right `Complete`, explanation: *A delivery status records a handoff. Completion depends on the relevant acceptance check. Conceptual illustration, not measured data.*

**observedCondition:** In the total-loss process, title and transfer paperwork moved from customers through the claims team to a salvage partner, which decides whether documents are sufficient. A delivery could be recorded, and payment released, before that decision. Problems such as missing signatures or missing mileage then went back to customers to fix, after the claim appeared finished.

**workingExplanation:** *Practitioner interpretation.* The recorded handoff and the later acceptance check described different states. Treating “delivered” as “complete” moved the point of discovery to after payment, when correction is harder for everyone.

**investigation:** I began without an assignment. I kept a log of recurring exceptions, then clarified the process with the teams it touched (adjusters, administrative staff and the salvage partner) to see where each one believed the work was finished. I brought the resulting evidence about payment timing to management.

**relationshipDiscovered:** *Delivered ≠ complete.* The status the system reported and the state the next step depended on were related but not equivalent. The gap was a question of *when* sufficiency was checked, not *who* had authority.

**response:** Two connected responses, kept separate:
1. *Review timing.* Management chose to make payment wait for the salvage partner's acceptance of the paperwork. Decision authority did not change: the salvage partner decides sufficiency, and adjusters release payment. Adjusters were trained to wait for that acceptance.
2. *Shared practitioner knowledge.* I facilitated meetings in which administrators surfaced the practical knowledge, examples and procedural differences behind the process. This informed three distinct resources: a comprehensive paperwork guide, a total-loss support training deck (which trainers now teach from), and an administrative onboarding program. The error-log categories did not become the guide's structure. In parallel, I redesigned the customer cover letter to reduce the decisions customers had to make after a total loss; a process team later produced a national version, and that later version is not attributed to me here.

**consequence:** *Owner-reported, pending verification.* The review-timing change and the resources remain in use. Which resource is used where, since when, and by whom has not yet been documented here. Use of a resource is not evidence that it improved outcomes.

**limitations:** No controlled measurement. Two rework observations exist with different scopes, periods and definitions; neither is presented as an outcome, and they are never compared. Several changes happened close together (review timing, training, the guide, the letter), so no single change can be credited with any later difference. Any change in how long payment takes has not been measured. Contributions by managers, trainers, adjusters, the salvage partner and the process team are their own.

**contribution (entry.contribution):** I identified the problem without an assignment, built the evidence record, brought it to management, and led the change that placed salvage-partner review before payment. I facilitated the administrator knowledge sessions and wrote the paperwork guide, the support training deck that trainers adapted, and early versions of the customer cover letter. Management decided on the change; the salvage partner decides sufficiency; adjusters release payment; trainers deliver training; a process team built the later national letter.

### Featured brief, ownership and measurement (added 16 November, after systemicdesign.pro)

Shown on the homepage only once this case is approved (field `investigation.brief`).

| Tension | My call | Result | Evidence |
| --- | --- | --- | --- |
| Paperwork could be marked delivered, and payment released, before anyone confirmed it was sufficient. Errors surfaced later, as rework for customers and staff. | Without an assignment, I logged the exceptions, traced each handoff and recommended that payment wait for the salvage partner’s review. | Management made that change, and who decides stayed the same. Separately, resources built from administrators’ knowledge remain in use (owner-reported). | My exception log, walk-throughs with adjusters, administrative staff and the salvage partner, and administrator knowledge sessions. Sources are pending review. |

**What I didn’t own (`notOwned`):** I didn’t own the decision: management chose to change the review timing. The salvage partner decides whether paperwork is sufficient, adjusters release payment, trainers deliver the training, and a process team built the later national letter.

**How this was measured (`measurement`):** Nothing here was measured in a controlled way. The figures are rounded owner estimates; each still needs its source, unit and period. Two rework observations exist, but they cover different scopes, so neither is shown and they are never compared.

**Figures (`figures`, each labelled “Approximate · owner estimate”):** ~30 views a month (paperwork guide access, averaged since it was shared; access, not use or effect) · ~6 new hires a quarter (onboarding audience, averaged; not who delivered the training) · 2+ years in use across several offices (which resource is still to be confirmed; use is not effectiveness). The projection now rejects any figure without selected evidence.

### Statements

`kind` and `contribution` use the enumerations in `src/content/investigation.ts`. Every `direct_observation` or `documented_outcome` needs selected public evidence before it can enter a release; until then each is a review blocker, not a claim.

| ID | Exact wording | kind | contribution | Evidence needed (private) | Limitation |
| --- | --- | --- | --- | --- | --- |
| S1 | A delivery could be recorded, and payment released, before the salvage partner decided the paperwork was sufficient. | direct_observation | identified | Process description or log excerpt from the period; redacted | Describes the earlier process, not every claim |
| S2 | Missing signatures and missing mileage were returned to customers to correct. | direct_observation | identified | Log categories or examples, redacted | Examples, not a frequency |
| S3 | I began the work unassigned and kept a log of recurring exceptions. | direct_observation | identified | Dated log or message showing start and initiative | Log definition and window to be stated |
| S4 | The recorded handoff and the acceptance check described different states. | practitioner_interpretation | identified | n/a (interpretation) | Alternative: other causes of rework not examined here |
| S5 | Management chose to make payment wait for the salvage partner's acceptance; decision authority did not change. | documented_outcome | influenced | Process change record or manager confirmation | Implementation date and scope to be stated |
| S6 | I facilitated administrator meetings that surfaced practical knowledge and procedural differences. | direct_observation | designed_or_facilitated | Meeting invitations or notes, redacted | Participation is not evidence of learning |
| S7 | The paperwork guide, support training deck and onboarding program are distinct resources for different audiences. | direct_observation | implemented | Each artifact, with version and date | Reach of one is never combined with another |
| S8 | Trainers teach from a deck built from my training deck. | documented_outcome | observed_use | Trainer confirmation or current deck metadata | Use is not effectiveness |
| S9 | The resources remain in use. | documented_outcome | observed_use | Per-artifact: where, since when, by whom | Scope must be stated separately for each artifact |
| S10 | Making knowledge shareable may reduce reliance on a few experienced individuals. | hypothesis | designed_or_facilitated | n/a (hypothesis) | Not measured; listed as an open question |

### Figures: rounded estimates only

Owner direction, 16 November: internal figures may appear publicly as rounded or averaged estimates, never as exact counts. Exact values stay in the owner's private notes, outside this repository. Each estimate still needs its source and exact approved wording.

| Slot | Proposed estimate wording | Still required | Rule |
| --- | --- | --- | --- |
| F1, F2 | **Withheld** (two rework observations) | Separate definition, period, denominator, method, source | The problem is scope, not precision; rounding doesn't fix it. Never shown together or compared. |
| F3 | Paperwork guide: roughly 30 views a month on average since it was shared | Where views are counted; date read | Access is not use or effect |
| F4 | About six new hires a quarter on average | Source and period | Describes the audience, not who delivered training |
| F5 | More than two years across several offices | Which resource has this scope | One resource per figure; never combined |

### How this case relates to the guiding purpose

The purpose behind the site (creating conditions in which different people can genuinely contribute to what happens next) shows up here as **evidence of facilitation**, not of outcome. Administrators' practical knowledge shaped shared resources (S6–S7). Whether that made the team more independently capable is **not established**. S10 records it as an open question, and the case makes no claim about it.

<!-- end-public-candidate -->

---

## C. Outstanding approval checklist

Nothing below is approved by this branch. Each item needs Sami's decision or a source in private storage.

**Wording and attribution**
- [ ] Approve or edit the short version (A) exactly as it will appear.
- [ ] Approve or edit each full-case field (B) and the contribution statement.
- [ ] Confirm the people and teams named by role only (management, trainers, adjusters, process team, salvage partner) are described accurately.
- [ ] Confirm the cover-letter sentence: the later national version is not attributed to me.

**Provenance (per statement S1–S9)**
- [ ] Attach a private source for each factual statement: observer or reporter, date, and locator in private storage.
- [ ] State the log's definition and time window (S3).
- [ ] Document the review-timing change: what changed, when, and who decided (S5).
- [ ] For each resource separately, state where it is used, since when, and by whom (S7–S9). The owner has said guides and training have been used across four offices for more than two years and that this may be said publicly; the evidence rules require naming which resource has that scope before it appears.

**Figures (exact values held out of this repository)**
- [x] Owner direction, 16 November: rounded or averaged estimates only, never exact internal counts.
- [ ] Approve or edit each estimate's wording (F3–F5).
- [ ] Each estimate still needs its unit, period and source. The two rework observations stay withheld and are never paired or compared.

**Privacy and naming**
- [ ] Employer, state and job title stay unnamed in public copy (current draft: unnamed).
- [ ] **Conflict to resolve:** owner direction is not to name the salvage vendor publicly, but the vendor's name appears in this repository's existing review docs, in `src/data.ts`, and in the immutable archive that the homepage's interim link now points to. The archive bytes cannot be edited. Decide whether to (a) accept that, (b) point the interim link somewhere else, or (c) remove the name from the current-edition sources in a separate change.
- [ ] Confirm no image, screenshot or document excerpt is needed; if one is, it must be a rights-cleared public derivative.

**Release mechanics (not done in this branch)**
- [ ] Enter the approved revision into private authoring storage with its evidence records.
- [ ] Authenticated owner approval bound to the exact candidate digest.
- [ ] A trusted release loader to replace the `no-approved-content` guard in `scripts/prerender.tsx`; this does not exist yet.
- [ ] A separate, explicitly authorized release. Once Claims is selected, the homepage action switches to it automatically.

**Sequencing**
- [ ] Confirm Claims as the first case, or approve another first. Trust may have fewer measurement questions but more disclosure questions; the homepage selects whichever investigation is approved first.
