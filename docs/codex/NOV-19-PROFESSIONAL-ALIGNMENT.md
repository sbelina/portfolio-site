# Evidence-first professional alignment — 19 November 2026

**Branch:** `claude/jolly-turing-noyo4q` (draft PR #17). **Status:** review only. This is not merged or deployed, and no case content is approved.

## Authority and scope

The owner’s 19 November directive asks the public site to show Sami’s professional value quickly, give a direct path to evidence, and state a longer-term purpose without presenting it as a result. It authorizes reversible work on a review branch. It does not authorize publishing private evidence, approving manuscripts, merging, deploying, or adding infrastructure.

The directive also calls for a reusable investigation page. The released evidence-first work already provides it (`InvestigationNarrative`, brief, figures, *What I didn’t own*, *How this was measured*), so this branch adds no new template. See the publication queue below.

## Decisions

| # | Decision | Reason |
| --- | --- | --- |
| D1 | Merged `main` first (`b247b7b`). The released evidence-first homepage and Investigations page replace this branch’s unreleased Phase 1 versions. | Work from the current released state. Phase 1 was never published. |
| D2 | **Updated 23 November (owner decision):** the H1 is *I diagnose gaps in understanding and design the conditions that empower leaders to make **informed** decisions.* It is the final Trust deck’s cover, with “leaders”, because anyone can be a leader; *informed* is the accent. Earlier: the released H1 was kept. | The directive keeps it pending a separate copy decision. |
| D3 | **Updated 23 November (owner decision):** the kicker reads **Sami Belina · Applied Research & Systems Strategist**, the line under it reads “Increasing understanding, effectiveness, and adaptability in complex systems.”, and the lead paragraph is the owner’s “I investigate the human, informational, and operational conditions shaping outcomes…”. Earlier: the kicker read **Sami Belina · Research & Innovation Strategist**. The byline carries the LinkedIn specialties (*Applied research · Service design · Stakeholder engagement*) and its tagline. *(Updated 19 November: the owner supplied the LinkedIn headline. The site now matches it instead of the directive’s “Applied Research & Innovation Strategist”, so visitors arriving from LinkedIn see the same terms.)* | The directive wants *who* and *value* within five seconds. Before this change, the name sat below the evidence link on a 390 px screen. |
| D4 | The identity is a capability description, not an employment title. It lives in one constant (`src/content/recruiter.ts`) used by the homepage, and its exact text also appears in the home title and description. | Consistency across homepage, title and metadata. Formal titles stay with each investigation’s role section. |
| D5 | The first link in the hero is still the Claims evidence link. The Atlas and Observatory are reachable only from the menu and later sections. | Evidence before exploration. |
| D6 | A **Representative investigations** preview of Claims, trust research and enterprise AI appears only while no investigation is approved. It shows archived titles, each labelled *Previous-edition summary · full case unpublished*. It shows no figures. | The directive suggests a three-case preview, but only approved wording may be published. Archived titles are already public. |
| D7 | The purpose line goes under How I Know, worded as an intention: *“…not a measured result of it.”* | The directive requires the purpose but forbids presenting it as an outcome. **This supersedes** the NOV-16 evidence-first row that kept the purpose in the record only, and NOV-16’s decision to leave Practice and Connections unchanged (D8, D9). |
| D8 | Test. Show. Enable. use the directive’s definitions. The six-move loop is unchanged. | Directive §7. |
| D9 | Connections grows to seven distinctions. Each has a difference, a question, and an optional disclosure for *what connects them*, *evidence status* and *where it stops*. Status is either *conceptual*, or *related to a previous-edition case summary (full case unpublished)* for the three distinctions that summaries already used. No case figures, study designs or relationships are asserted. The headings are spoken as “is not”, and each disclosure has a distinct accessible name. | Directive §8, within the evidence rules. |
| D10 | The sustainability opportunity is a **private** outline only, delivered to the owner outside Git. This record contains none of its figures. | Its volumes derive from internal operational data that has not had rights review. |
| D11 | No résumé link: `resumeHref` stays `null`. | No approved public PDF exists. |
| D12 | The Observatory navigation (owner-confirmed 19 November) and the public Edge Case prototype remain. | Separate, earlier owner decisions. Neither is the homepage’s first action. |

## Route-by-route change map

| Route | Before (released `main`) | After (this branch) |
| --- | --- | --- |
| `/` | Kicker: four role terms. Lead about designing ways for people to decide and develop capabilities. Name only in the byline. | Kicker: name and identity. Lead: unassigned inquiry, testing the accepted explanation, synthesis, evidence handed to the people who decide. Byline: role terms. New representative-investigations preview. Purpose line under How I Know. New practice wording. |
| `/` metadata | Title: *Sami Belina — Research Strategy, Organizational Effectiveness & Service Design* | Title: *Sami Belina — Research & Innovation Strategist*. The description uses the LinkedIn specialties and tagline. |
| `/practice/` | Earlier move definitions | Clarified definitions. Loop unchanged. |
| `/patterns/` | Three distinctions | Seven, each with question and qualified disclosure |
| `/investigations/` | Released empty state with six summaries | Unchanged in this commit |
| `/lab/…`, Atlas, Je ne sais qu’a, Edge Case | — | Unchanged in this commit |

## Proposed exact copy (for owner approval)

- **Kicker:** Sami Belina · Research & Innovation Strategist
- **H1 (owner decision, 23 November):** I diagnose gaps in understanding and design the conditions that empower leaders to make *informed* decisions.
- **Lead:** I investigate the organizational, service, and human-system conditions behind an outcome—sometimes starting from a question no one had assigned. I test the accepted explanation, synthesize what the evidence supports, and make it usable by the people who decide what happens next.
- **Byline:** Applied research · Service design · Stakeholder engagement / Turning evidence into understanding, and understanding into new possibilities.
- **Representative investigations:**
  - Heading: *Three questions, three kinds of evidence*.
  - Boundary: *Each account separates what I initiated and contributed from the decisions other people owned. These link to case summaries from the previous edition; the full investigations are not yet published.*
- **Purpose:** The longer aim is to widen what people and communities can understand, question, imagine, and shape. That is an intention behind the work, not a measured result of it.
- **Test:** Test whether the assumptions, measures, and explanations in use are adequate to the outcome they claim to explain.
- **Show:** Make the reasoning, evidence, and limitations inspectable: what was observed, inferred, disputed, and still unknown.
- **Enable:** Develop conditions in which other people can use that understanding to decide, adapt, and ask new questions.
- **Home description:** Sami Belina, research and innovation strategist: applied research, service design and stakeholder engagement. Turning evidence into understanding, and understanding into new possibilities.
- **Source of the identity, specialties and tagline:** the owner’s LinkedIn headline, *“Research & Innovation Strategist | Applied Research, Service Design & Stakeholder Engagement | Turning Evidence Into Understanding, and Understanding Into New Possibilities.”*

**Wording to confirm.** *“sometimes starting from a question no one had assigned”* rests on Claims, where Sami began unassigned (evidence rules, 30 October). The owner should confirm that “often” is fair across the body of work, or change it to “sometimes”.

## Investigation publication queue

The candidate stays private until it passes the authenticated exact-revision approval.

| # | Investigation | Current state | Next step |
| --- | --- | --- | --- |
| 1 | Claims operations | Typed candidate exists and is previewable locally (`npm run build:candidate`). The checklist in [the candidate](review-candidates/claims-operations-publication-candidate.md) §C is open. | Owner approves the exact wording; private sources attached; resource scopes stated separately; salvage-vendor naming conflict decided; authenticated approval and trusted release loader. |
| 2 | Agreement Is Not Trust | [Review candidate](review-candidates/brand-research.md) only | Instrument wording, vendor attribution, reach source (study reach, not outcome); detractor proposal labelled as not adopted. |
| 3 | Enterprise AI | [Review candidate](review-candidates/enterprise-ai.md) only | Separate synthesis (38 → 8), program structure, leadership and recommendations; no impact claim from counts. |
| 4 | Telematics | [Review candidate](review-candidates/telematics.md) only; not in the previous edition’s summaries | Reconciled 23 November: five participants, one set. No retention claim. |
| 5 | Vote Huntsville (civic) | [Review candidate](review-candidates/civic-service.md) only | Reach figures need their own provenance; no turnout effect. |
| 6 | AI accessibility | [Review candidate](review-candidates/accessibility-ai.md) only | Keep the restored-code test separate from the human simulation review; the archived repository is not adoption. |

The sustainability opportunity is a private outline (D10). It is not in the queue until its framing and rights are decided.

## Known issue carried forward

The homepage evidence link and the new preview both point at the archived Claims summary. That summary names the salvage vendor, which the owner asked not to name. The archive bytes cannot change; the decision is open in the Claims checklist.

## Verification

**Independent review.** A read-only evidence and accessibility review found no high-severity issues. Changes made in response:

- “often” becomes “sometimes”.
- *Usability ≠ retention* is now conceptual, with a generic limit, so it no longer hints at an unpublished study’s instruments.
- Evidence-status labels are corrected: three distinctions relate to previous-edition summaries; the other four are conceptual.
- Representative links carry their unpublished status as an accessible description.
- Each disclosure has a distinct name.
- “≠” is spoken as “is not”.
- The kicker is tighter on very narrow screens.

Run locally on Node 22 with `npm ci`:

| Check | Result |
| --- | --- |
| Merge of `main` (`b247b7b`) | build passed (85 files audited); `npm test` 752 passed, 0 failed, 11 skipped |
| This change | `tests/professional-alignment.spec.ts` (7 checks) with the evidence-first, SEO, design-system and build-archive specs: 111 passed in Chromium, WebKit and Firefox |
| Full suite on `1de801f` (before review fixes) | 773 passed, 0 failed, 11 skipped |
| Review fixes | the three affected specs: 72 passed in Chromium, WebKit and Firefox |
| Final head (`7a7ac5f`) | `npm test` 773 passed, 0 failed, 11 skipped; `check:deploy` passed; `test:atlas` 22 passed |
| Publication safety | No sustainability figures, candidate marker or review-shell marker in `dist/`. The legacy app bundle still contains the salvage-related role wording from `src/data.ts`, as the live site already does (known issue above). |

The five-second test was run as an **automated proxy**, not with people. First-screen positions with JavaScript off, as the bottom edge of each element:

| Viewport | Identity | H1 | Evidence link | In first screen |
| --- | --- | --- | --- | --- |
| 1440 × 900 | 249 px | 541 px | 801 px | all |
| 390 × 844 | 320 px | 484 px | 801 px | all |
| 320 × 740 | 320 px | 484 px | 859 px | identity and H1; the evidence link is about 120 px below the first screen |

The 320 px gap existed on the released site too: the two-row menu takes the top third of the screen. Reordering the hero visually would break reading order, so this is left open (see approvals).
 At 1440 × 900 and 390 × 844, with JavaScript off, the name, identity, H1 and evidence link are all in the first screen, and the hero’s first link goes to evidence. Whether a recruiter actually recognizes the value in five seconds needs real readers; see the [reader evaluation protocol](READER-EVALUATION-PROTOCOL.md), task A.

Before-and-after screenshots at 1440, 390 and 320 px were taken outside Git, so private content cannot leak through them. They show only public pages.

Not established: real screen readers, physical devices, native zoom, or visitor comprehension.

## Approvals required before release

1. The exact homepage copy above, including “often”.
2. The identity *Research & Innovation Strategist* (matching LinkedIn) in the kicker, title and metadata. The earlier role terms *research strategy* and *organizational effectiveness* no longer appear on the homepage. Restore them if recruiters search for them.
3. The seven Connections distinctions and their evidence-status labels.
4. The Practice definitions.
5. The representative preview linking archived summaries, given the vendor-naming conflict.
6. The sustainability outline’s direction: keep it private, write a proposal note, or fold it into a case.
7. A public résumé file, if one is wanted.
8. Whether to address the 320 px fold, for example by a more compact menu on very narrow screens. That is a navigation change and needs its own test.
9. Merge and deployment.

## Rollback

- Revert this record’s implementation commit (`1de801f`) to restore the released homepage, Practice and Connections copy.
- The merge commit `b247b7b` can be reverted with `git revert -m 1 b247b7b`.
- No production, DNS, credential or data change was made.
