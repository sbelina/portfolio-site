# Investigations in four questions: drafts for owner review (not approved)

<!-- CLAIMS_CANDIDATE_UNAPPROVED_16NOV: build canary. scripts/audit-public.ts fails any public artifact containing this marker. -->

**Status:** drafted 20 November 2026 from the owner’s direction to lead with what changed. **Not approved and not published.** Each case answers four questions in this order, then adds one line on what I’d do differently. Caveats live in *How I know*, at the end of the case rather than in its first impression.

1. What was the problem?
2. How did I know?
3. What did I do?
4. What changed?

**Sources.** The owner’s statements in conversation (20 November outcomes list), the earlier review candidates in this folder, and [the evidence rules](../EVIDENCE-RULES.md). No employer document was inspected, so every statement is **owner-reported** until a private source is attached.

**What approval requires.** The owner approves exact wording per case. Sources are attached privately. Only an authenticated approval bound to the exact revision publishes anything. Agent drafting is not approval.

**Naming.**

- Employer, client and product names stay out unless the owner decides otherwise.
- *Snapshot* would identify the employer that the Claims case keeps unnamed, so this draft says “a usage-based insurance app”.
- *Vote Huntsville* is already public on the previous edition.
- The *Apple* result is listed without the name until its context and naming are confirmed.

**What I’d do differently.** Each case has a **proposed** line, written from that case’s stated limits. The owner should replace it with their own words or approve it. It is a reflection, not a finding.

**Claims operations** is fully drafted as the typed candidate (`content/candidates/claims-operations.ts`, revision 2) and its [publication candidate](claims-operations-publication-candidate.md). Preview it locally with `npm run build:candidate && npm run preview:candidate`.

---

## 1. Claims operations — *When “complete” still generated work*

The typed candidate is authoritative; this is the at-a-glance version.

- **What changed:** Payment now waits for the salvage partner’s review, so the sufficiency check happens before a claim looks finished. The guides and training I built from administrators’ knowledge have been used across four offices for 2+ years, and every quarter’s new hires learn from them.
- **The problem:** Paperwork could be marked delivered, and payment released, before anyone confirmed it was sufficient. Errors surfaced later as rework for customers and staff.
- **What I did:**
  - Without an assignment, I logged the exceptions and traced each handoff.
  - I recommended that payment wait for the salvage partner’s review.
  - I turned administrators’ knowledge into a guide and training.
- **How I knew:** My exception log, walk-throughs with adjusters, administrative staff and the salvage partner, and administrator knowledge sessions.
- **What I’d do differently (proposed):** Agree a definition of an exception with the team, and record a baseline, before the change, so its effect could be measured instead of estimated.
- **How I know (caveats):**
  - Management made the decision; who decides sufficiency and payment did not change.
  - Nothing was measured in a controlled way, and figures are rounded owner estimates.
  - Use of a resource is not evidence of effectiveness.
  - The two rework observations have different scopes, so they are withheld and never compared.

**Open for the owner:**

- Confirm that the four-office, 2+ year scope applies to both the guides and the training, or say which one.
- An earlier note described the guide’s use as statewide. Confirm which is right for public copy.

---

## 2. Agreement Is Not Trust — research framing and measurement

- **What changed:** Stakeholders used the study’s statistics in their briefs, and the work supported an enterprise measurement framework. The study reached 800+ respondents in nine days. *(Brief use is described only where corroborated.)*
- **The problem:** The organization wanted to know what builds trust. The usual survey asked whether people *agreed* with statements about the organization, which is a different question from what *influences* their trust.
- **What I did:**
  - I proposed the study and co-designed it live with two peers.
  - I separated the two questions in the instrument, so agreement and reported influence on trust were measured apart.
  - I built a general-to-specific interview guide with an open-ended start, to keep the cognitive load low.
  - A vendor fielded it.
- **How I knew:** The instrument design itself: two questions asked separately, so agreement and reported influence on trust could be read apart.
- **What I’d do differently (proposed):** Argue earlier and with evidence for including detractors, a proposal that was not adopted, because the people least likely to trust you are the ones the measure most needs.
- **How I know (caveats):**
  - 800+ responses is reach, not an outcome.
  - Reported influence is not a causal effect; nothing here shows trust increased.
  - The full perception-mapping framework was not implemented.
  - Vendor attribution is retained.
  - No participant quotations or raw findings are public.

**Open for the owner:**

- The source and definition of 800+ responses in nine days.
- What “supported an enterprise measurement framework” means in practice, and its source.
- Confirm the detractor proposal wording.

---

## 3. Enterprise AI — from 38 proposals to eight challenge areas

- **What changed:** The AI challenge became a sprint that the innovation services team now runs every year. The 38 proposals became eight challenge areas that teams could discuss and choose among.
- **The problem:** A large set of proposals arrived without a shared way to compare them. Thirty-eight ideas did not mean thirty-eight distinct needs.
- **What I did:**
  - I synthesized the 38 proposals into eight challenge areas, using AI-assisted parsing that I checked and interpreted myself.
  - I worked with seven teams.
  - I led the largest sprint team.
- **How I knew:** Reading every proposal against the others and checking the AI-assisted groupings by hand. *(Owner to describe how, if at all, the groupings were tested with the teams.)*
- **What I’d do differently (proposed):** Record which challenge areas teams chose and why, so the synthesis’s usefulness could be shown, not only its output.
- **How I know (caveats):**
  - I did not own the enterprise AI strategy or the sprint’s overall design.
  - The annual sprint is a program decision made by innovation services. It shows the format lasted; it does not show that my synthesis caused it.
  - No proposal’s implementation or business impact is claimed.
  - Counts of proposals and areas are not impact.

**Open for the owner:**

- Who decided to make it annual, when, and what the source is.
- Can “innovation services” be named?
- How groupings were tested, if at all.

---

## 4. Usage-based insurance app research — findings recovery and research judgment

- **What changed:** The research led to a follow-up survey of about 2,000 respondents.
- **The problem:** Session recordings were partly lost. The question was what the surviving record could still say about using the app and the value of the wider program.
- **What I did:**
  - I analyzed moderated sessions that others had conducted.
  - I recovered findings from the surviving records, keeping each quotation separate from interpretation.
  - I made opportunity recommendations.
- **How I knew:**
  - Surviving notes and records, with quotations separated from interpretation.
  - A usability score of about 70 (SUS) and a program recommendation score of about −20 (NPS), both from the same six participants.
- **What I’d do differently (proposed):** Agree on a backup and consent process for recordings before the sessions run, so recovery is never the method.
- **How I know (caveats):**
  - Six participants is a small sample.
  - SUS and NPS are different instruments; they are not one scale or a causal story.
  - The five-participant recovery account and the six-session scores are kept separate until reconciled.
  - Nothing measures retention or why people left.
  - The follow-up survey was another team’s work; it is not proof that my recommendations were adopted.

**Open for the owner:**

- Who ran the 2,000-respondent survey, and when.
- Does “led to” have a source, such as the survey brief citing the research?
- Can the product be named?

---

## 5. Vote Huntsville — civic access and multichannel service design

- **What changed:** Vote Huntsville was asked to co-sign a $20K grant. The latest owner brief reports reaching 20,000+ residents.
- **The problem:** Voting information was organized by office and service category, while residents’ questions followed the practical steps they faced.
- **What I did:**
  - I co-founded the nonpartisan Vote Huntsville in 2020, with other directors and volunteers.
  - We worked from residents’ questions to a shared plain-language answer source used across channels.
- **How I knew:** Residents’ actual questions, compared with how official information was organized.
- **What I’d do differently (proposed):** Define reach and track it per channel from the start, so “residents reached” has one clear meaning.
- **How I know (caveats):**
  - Being asked to co-sign a grant is recognition. It does not by itself show that the grant was awarded or that Vote Huntsville received funds.
  - The 20,000+ figure needs its definition, channels and period. The earlier 16,000+ figure was a population and flyer estimate, not reach.
  - No effect on turnout or policy is claimed.
  - The project’s later work is shared with others.

**Open for the owner:**

- Grant: who asked, when, for what, and whether the grant was awarded.
- The source and definition of 20,000+.
- Is the project still active, and under what name?

---

## 6. AI accessibility — automated review versus perceptual evaluation

- **What changed:** The experiment informed and qualified a separate initiative that was already under way. The agent detected and restored deliberately removed accessibility code, and a planned human review still raised a question the automated checks did not settle.
- **The problem:** Can AI-assisted development keep accessibility intact, and what can automated checks not tell you?
- **What I did:**
  - I originated the idea; a colleague advocated it to the organizer.
  - I was invited to co-facilitate, the only participant from outside the department.
  - We built a front-end-only Pomodoro prototype, iterating between a coding agent and an accessibility agent.
- **How I knew:**
  - The deliberately removed code was restored.
  - A separately planned human review, using simulated deuteranopia, flagged that the Focus and Break states might be hard to tell apart visually, although both had text labels.
- **What I’d do differently (proposed):** Include people with the relevant visual differences in the review, instead of relying on simulation alone.
- **How I know (caveats):**
  - One simulation is not proof of user failure or a standards violation.
  - The agent did not fail; human review was planned, not an afterthought.
  - The archived repository is a security precaution, not adoption.
  - Repeatable earlier checking is an intended benefit, not a measured saving.

**Open for the owner:** Which initiative it informed, and how that can be described publicly.

---

## 7. A result reported as “about 5% → about 95%” (context needed)

**Owner-reported outcome:** about 5% → about 95%. This cannot be drafted honestly without context.

**Open for the owner:**

- What was measured: a rate of what, among whom?
- The period, and how it was measured.
- My role, and who else contributed.
- What changed in between.
- Whether the client or organization can be named.

Until these are answered, the figure stays out of every public draft.

---

## Homepage, once a case is approved

- **Lead with what changed.** The homepage already switches from the interim summary link to the first approved investigation. Its featured block now reads *What changed → The problem → What I did → How I knew*.
- **Method after results.** The practice, Connections and the Observatory already come after the evidence path and representative investigations.
- **Caveats belong in each case.** The homepage’s boundary notes exist only because no case is approved yet. They disappear when one is: the homepage stops showing the interim notice and the representative preview automatically.
