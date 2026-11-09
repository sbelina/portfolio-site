# PRODUCING CURIOSITY
## Research-Informed Design System & Codex Delivery Blueprint

**Version:** 1.0 — 2026-11-06
**Status:** Owner-adopted direction with repository reconciliation in ADOPTION.md; distinguishes decisions, proposals and open tests
**Intended use:** Repository architecture, design-system specification, Codex implementation planning, and quality review
**Scope:** Public research portfolio/site, its underlying content and evidence models, its visual identity, its interaction rules, and its internal design laboratory

> **Question what is possible. Preserve what is understood. Test what is invented. Make the evidence visible.**

---

## 0. How to use this blueprint

This is a **decision and implementation blueprint**, not a finished visual identity, an automatically executable agent configuration, or a claim that every proposed feature is user-tested. It consolidates the design-system conversation and turns it into work Codex can plan and implement against a real repository.

### Decision states

- **LOCKED:** An explicit decision from the site owner. Do not reopen without a specific request.
- **DIRECTION:** A strongly preferred approach; prototype and verify before finalizing details.
- **HYPOTHESIS:** An unproven design idea; never silently ship as a required interaction.
- **TO VERIFY:** Requires repo inspection, source material, real-world testing, licensing review, or accessibility evaluation.

### Authority and conflicts

1. The site owner's current explicit instructions have priority.
2. Verified original project evidence and source material determine factual content.
3. Accessibility, security, privacy, and correctness requirements constrain implementation.
4. This blueprint governs intended architecture unless newer decisions supersede it.
5. Inspiration references inform exploration; they do not authorize copying or automatically establish usability.

Codex must report conflicting instructions rather than quietly pick an interpretation. Avoid making every design experiment a production obligation.

---

## 1. Mission, audiences, and promises

### Public identity

**Producing Curiosity** expresses a practice in **applied human systems research and strategy**. The work investigates situations where outcomes are visible but their causes or explanations remain uncertain. Across organizational, technological, and civic contexts, the practice studies how people perceive, interpret, decide, and act amid information, institutions, incentives, technology, and operating conditions.

**Primary positioning statement (LOCKED content direction, final typography open):**

> I investigate situations where outcomes are visible, but the explanations behind them remain unclear.

**Practice pattern:** Test → Show → Enable.

- **Test:** Question a prevailing explanation; identify plausible alternatives; inspect the evidence.
- **Show:** Clarify what was observed, inferred, disputed, and remains unknown.
- **Enable:** Help affected people and decision-makers use what was learned.

The purpose extends beyond executive decision support: **return useful discoveries to the people who need them, including communities**.

### Audience journeys

**A. Evaluate (first-class, direct):** Hiring manager, recruiter, collaborator, research lead. Needs to understand within moments: who this practitioner is; kinds of questions investigated; evidence of judgment, influence, and results; what role/collaboration is relevant; how to connect.

**B. Explore (first-class, optional depth):** Curious visitor, peer, potential collaborator, community member. Wants to follow research questions, inspect method/limitations, and connect investigations.

**C. Access (cross-cutting):** Visitor using keyboard, screen reader, zoom, reduced motion, slow connection, touch, or constrained attention. Receives the same essential conclusions and navigation without relying on ornament or special gesture.

**Core promise:** The page is immediately comprehensible without interacting with an experiment, yet rewards deeper inspection.

### Content anchor

The site owner's longer-form introduction is the primary editorial source for the About/Philosophy experience. Preserve its meaning rather than rewriting into generic UX or innovation-brand language. Possible homepage hierarchy:

1. Who/what: research strategist investigating visible outcomes and unclear explanations.
2. Why it matters: relationships between behavioral, information, operational, technological, and institutional conditions.
3. Proof: featured investigations with evidence trails and tradeoffs.
4. Paths: examine investigations, research questions, philosophy, and contact.

A Pushkin quotation about inspiration in geometry and poetry may inform the philosophy page; it must not displace the owner's own positioning. Source and attribution should be verified before public publication. D'Alembert is an intellectual precursor to the idea, not necessarily the verbatim source of the Pushkin wording.

---

## 2. The governing design philosophy

**Creative tension:**

| Structural pole | Expressive pole | Operational rule |
|---|---|---|
| Geometry | Poetry | Precision without rigidity; imagination without invented evidence |
| System | Human | Model conditions without erasing lived experience |
| Archive | Instrument | Long-form reading remains calm; tools remain understandable |
| Consistency | Exception | Strong grid; one meaningful departure at a time |
| Pattern | Anomaly | Distinguish deviations that matter from decoration |
| Question | Explanation | Reveal relationships without implying unwarranted certainty |
| Familiarity | Experiment | Established interaction first; novelty needs a documented benefit |
| Discovery | Usability | Complexity can invite curiosity; clarity must deliver meaning |

**North-star behavior:** The site should not merely *claim* the researcher investigates assumptions—it should make the evidence trail, revised explanation, and decision consequences easy to inspect.

### Explicit anti-goals

- Generic SaaS or template-like portfolio.
- Overly decorative vintage-science collage.
- Endless animated particles, chaotic background noise, unnecessary glass effects, autoplaying flashing.
- Unconventional navigation for its own sake.
- Aesthetic graphs mistaken for actual evidence.
- Fabricated sources, invented measurements, unearned causal claims.
- Heavy research detail hidden from anyone who cannot operate a novel interface.
- Visual originality purchased at the expense of content clarity or accessible interaction.

---

## 3. Six interoperable architecture systems

### 3.1 Identity & expression

Includes asterisk logo, typography, color, grid, geometric vocabulary, illustration and material grammar, image treatment, and expressive motion.

**Outputs:** tokens, logo master assets, component primitives, design principles, brand specimens.

### 3.2 Human interaction

Includes task models, conventional patterns, affordances, feedback, states, keyboard/touch behavior, accessibility, and cognitive load management.

**Outputs:** interaction contract per component, state matrix, usability hypotheses, accessibility acceptance tests.

### 3.3 Knowledge & evidence

Includes records for observation, interpretation, hypothesis, source, limitation, tradeoff, decision, outcome, and connections among claims.

**Outputs:** typed content schema, provenance rules, claim inventory, evidence-linked case studies.

### 3.4 Narrative & navigation

Includes homepage, investigation pages, research index, About, potential Field Notes, contact, internal/system pages, and direct and exploratory user journeys.

**Outputs:** site map, page templates, content blocks, navigation and cross-link schema.

### 3.5 Experimentation & evaluation

Includes design hypotheses, prototypes, comparative tests, user feedback, findings, decision ledger, and experiment archive.

**Outputs:** experiment briefs, evaluation measures, findings, accept/reject decisions.

### 3.6 Engineering & governance

Includes technical stack assessment, repository strategy, testing, performance, SEO, security, privacy, content rights, versioning, and release controls.

**Outputs:** running system, documented tests, release gates, logs, maintenance procedures.

**System invariant:** A new visual experiment cannot mutate the claims/evidence layer; a copy edit cannot silently alter a finding; changes to a logo token cannot break accessible navigation semantics.

---

## 4. Decision register

| ID | Decision | Status | Implication |
|---|---|---|---|
| D-01 | The **asterisk** is the logo, selected for its history | **LOCKED** | Do not propose replacing it with a different symbol |
| D-02 | Custom original asterisk geometry should be designed | DIRECTION | Investigate forms using hand sketches, convergence, orbit, asymmetry |
| D-03 | Its historical role as a critical/annotation mark informs identity | DIRECTION | Research exact attribution/context; useful for editorial footnotes |
| D-04 | Expressive scientific/editorial identity with technical rigor | DIRECTION | Disciplined grid, diagrams, asymmetry, analog/digital material tension |
| D-05 | Color foundation: paper, ink, orange signal | DIRECTION | Determine tested semantic tokens, not just attractive swatches |
| D-06 | Geom for display; Elms Sans for body; IBM Plex Mono for notation | **CANDIDATE** | Validate rendering, licensing, metrics, accessibility, language support |
| D-07 | Structured compositions with intentional exceptions | DIRECTION | Rare asymmetric departures only if they improve hierarchy |
| D-08 | Evidence diagrams are constrained by actual source data | **LOCKED principle** | No made-up charts; legend and provenance required |
| D-09 | Familiar behavior before novelty | **LOCKED principle** | Every control has an explicit interaction contract |
| D-10 | Research narrative: Test → Show → Enable | **LOCKED framework** | Show actual evidence of reasoning, not only outcome summaries |
| D-11 | Static-first essential content; accessible motion alternatives | **LOCKED principle** | No essential conclusion only in animation/hover |
| D-12 | Novel exploration features are experiments, not MVP assumptions | DIRECTION | Prototype in lab; user evidence before promotion |
| D-13 | Two viable journeys: Evaluate and Explore | DIRECTION | Optimize the first without removing optional depth |
| D-14 | The public site should be unmistakably a research portfolio | **LOCKED goal** | Title, positioning, cases, impact and contact discoverable immediately |
| D-15 | Existing React/TypeScript/Vite/Cloudflare architecture inspected | **VERIFIED — retain** | Preserve the frozen archive and current content/authoring contracts; see ADOPTION.md |

**Decision rule:** Codex may implement proposals as reversible, isolated prototypes, but it cannot classify them as accepted design decisions without a review record.

---

## 5. Visual foundations specification

### 5.1 Logo: the asterisk

**Meaning:** The historical asterisk can function as an annotation/critical mark drawing attention to additional context, qualifications, or something worth examining. The site's interpretation must be grounded in a verified history and the owner's own intended meaning; don't assume an unconfirmed historical anecdote.

**Formal requirements:**

- Recognizable as an asterisk at 16, 24, 48, and 128 CSS pixels.
- Works as a single-color glyph on paper and ink; orange accent optional, not required.
- Original vector construction, optically balanced; no over-reliance on golden-ratio marketing.
- Investigate six-arm, curved-path, central negative space, and one meaningful irregularity based on owner's sketch language; do not force all into one logo.
- Test favicon legibility, wordmark pairing, minimum size, clear space, print, raster export, and dark/light inversion.
- Check similarity and rights before claiming uniqueness or exclusivity.

**Three concept families for controlled exploration:** Divergent (one changed trajectory); Relational (curved arms around negative space); Orbital (rotational curves). Current preference is relational plus subtle divergent characteristic, **not a final sign-off**.

**Logo semantics:** The brand mark is not a substitute for an action label. If an asterisk triggers more information, the disclosure/link must communicate its destination or purpose accessibly. Decorative asterisks are hidden from assistive technology; footnotes are real semantic references.

### 5.2 Color / light

**Directional palette only; values require testing:**

| Token family | Candidate | Role |
|---|---|---|
| Paper | `#F3EFE7` | primary long-form light background |
| Ink | `#111716` | primary dark background/text |
| Signal | `#FF641C` | focal accent, links and major emphasis after contrast verification |
| Graphite | `#8C9293` | secondary surfaces / notation, not assumed readable on every ground |
| Observation | cool blue | a possible semantic grouping, not an established truth |
| Hypothesis | violet | a possible semantic grouping, not an established truth |
| Supported | muted green | a possible semantic grouping, not an established truth |
| Atmosphere | periwinkle, orange, soft blue | expressive artwork, never primary semantic carrier |

**Define at production level:** primitive ramp → semantic roles → component roles; text/on-surface pairs; focus ring; chart categorical and sequential ramps; states; border hierarchy; high-contrast modes; theme persistence, if a theme switch is added.

**Theme direction:** First make one excellent **Paper** reading environment and one **Observatory** dark environment; don't presume toggle necessity. If both are offered, both preserve equivalent meaning, accessible contrast and stable interaction.

**Contrast:** WCAG 2.2 AA as minimum target: ordinary text 4.5:1, qualifying large text 3:1, relevant non-text 3:1; tests performed on actual rendered layers, including blur/overlay, not just static hex codes. Color is never the sole signal.

### 5.3 Typography

**Current candidate roles:** Geom display; Elms Sans reading/UI; IBM Plex Mono labels, measurements, citations. Liter is an alternate reading candidate, not an additional fourth typeface.

**Provisional scales, not locked:**

| Usage | Desktop candidate | Mobile behavior |
|---|---|---|
| Hero | fluid 64–96px | scale to 38–60px with natural wrapping |
| Case opener | 44–64px | fluid 32–44px |
| Section heading | 28–40px | 24–32px |
| Reading body | 18–20px | 17–19px, adequate leading |
| UI | 14–16px | ensure legible sizes, tap area independent |
| Annotations | 12–14px | avoid illegibility; annotations can be expanded |

**Required specimens:** real long headlines, 800-word essay, numerical claims, citations, mixed-case and italics, tables, charts, at 200%/400% zoom, mobile sizes, Safari/iOS and other browsers. Confirm font licenses and hosting strategy. Display type should be expressive; body must maximize reading comfort.

### 5.4 Spatial and composition grammar

- Use a 4px design scale as a practical primitive; larger spacing via tokens.
- Document content max-width (comfortable reading measure), responsive gutters, grid columns, breakpoints, baseline rhythm and optical alignment.
- Standard reading and evidence content lives on clear, predictable grids.
- Allow a purposeful large-scale exception per editorial moment, never random overflow.
- Vertical and rotated text only for supplementary metadata, not essential navigation.
- Shared graphic primitives: axes, bars, nodes, trajectories, arcs, clusters, reference lines, coordinate marks, callouts, subtle grain.
- Define semantic diagram conventions separately from decorative illustration.

### 5.5 Materials

| Surface | Default use | Warning |
|---|---|---|
| Paper | essays, evidence, archival images | contrast and reading width |
| Ink | dark editorial sections, focused visuals | preserve hierarchy |
| Solid | cards, findings, actual data displays | avoid unnecessary decorative frames |
| Translucent | secondary context, overlays | test contrast against variable backdrop |
| Glass | rare floating controls/navigation | must retain legibility and focus |
| Liquid / luminous | expressive transitions, artwork | never obscure evidence |

Define blur, shadows, border, elevation, grain, image treatments, corner radius and overlay z-order as tokens. Default to restraint, not maximum visual effects.

### 5.6 Motion and temporal behavior

**Provisional timing tokens:** 150ms fast, 250ms base, 400ms deliberate. Easing defined by purpose; no universal spring for everything.

Three roles:

1. **Functional:** feedback after activation, selection, focus, navigation.
2. **Explanatory:** reveal a connection, alternate grouping, or meaningful change in a diagram.
3. **Expressive:** atmospherics from logo geometry, never required to receive information.

Rules: no flashing or strobing; respect `prefers-reduced-motion`; stop/pause where appropriate; no motion that makes buttons move away from users; no scroll hijacking; avoid autoplaying animated diagrams in body copy; preserve complete static state and annotations.

---

## 6. Evidence and diagram grammar — a crucial differentiator

An attractive representation must not be mistaken for established research evidence.

### Three visual classes

| Class | What it means | Allowed treatment | Requirements |
|---|---|---|---|
| **Observational** | measured/documented information | precise charts, tables, timelines | source, units, denominators, period, caveats |
| **Explanatory** | model of relationships or mechanisms | causal diagrams, maps, flow and comparison | proposed vs supported connections, assumptions, limitations |
| **Expressive** | atmosphere and identity metaphor | orbital motion, attractors, aesthetic data fields | label as illustrative; no implied quantitative finding |

Never map literal physics formulas or attractors onto organizational research as if they were analytically validated. Their use as aesthetic metaphor must be distinguishable.

### Evidence-state vocabulary

- `OBSERVATION`: directly documented result.
- `SOURCE`: original document, survey, transcript, log, dataset, or artifact.
- `INTERPRETATION`: a reasoned explanation of the observation.
- `HYPOTHESIS`: plausible but not sufficiently tested.
- `ALTERNATIVE`: competing explanation considered.
- `LIMITATION`: missing information or uncertainty affecting confidence.
- `DECISION`: choice the work informed; identify by whom where known.
- `OUTCOME`: subsequent observed change, not automatically caused by intervention.
- `TRADEOFF`: meaningful cost, risk, or displacement.
- `OPEN QUESTION`: what further evidence is needed.

**Visual rules:** dashed vs solid connections may differentiate proposed and observed relationships, but must be backed by text legends; interactive color and animation cannot be the sole mechanism. Every evidence diagram includes alt text or narrative/table equivalent.

### Claim/provenance schema (illustrative)

```yaml
claim_id: illustrative-measurement-review
claim_text: "Pending exact source and wording review; not public copy."
status: unverified
source_ids: []
period: null
measurement:
  numerator: null
  denominator: null
comparison: null
limits:
  - "Different scopes must not be joined into a before/after series."
  - "A workflow dependency does not establish a change in elapsed waiting."
release_status: needs_source_validation
```

Every prominent metric should include a source link/path, the unit of analysis, time period, calculation, conditions, and what it **does not** establish. Evidence can be private; show transparent descriptions without disclosing sensitive material.

### Case-study source anchors (verify against actual artifacts before publishing)

- **Claims document verification:** The approximately 18% and 7.6% observations have different scopes and are not a before/after series. Do not juxtapose them, calculate a reduction, or assign a shared unit or denominator. Each requires its own verified definition, period, method, source and approved wording. Earlier review before payment is owner-reported; increased elapsed payment waiting has not been established. Administrator collaboration informed distinct guide/training artifacts; the error categories did not directly become the guide structure.
- **Trust research:** 800+ responses over nine days; distinctions between agreement / brand-performance beliefs and evidence of trust. Don't pretend an instrument fully measured trust without limitations.
- **AI ideas:** 38 proposed initiatives synthesized into eight problem spaces; seven teams, and led largest sprint team. These are **problem-space groupings, not eight fully validated customer needs**.
- **Snapshot/telematics:** usability measure around SUS 70 versus NPS -20, subject to source confirmation; distinguish completion/usability from recommendation, trust, personalization and feedback.
- **Accessibility AI experiment:** A coding agent restored deliberately removed accessibility code. Separately planned human review identified potentially weak differentiation between text-labeled Focus and Break states under simulated deuteranopia. This was a front-end prototype. Earlier repeatable checking and reduced remediation remain intended, unmeasured benefits.
- **Other inquiries:** Duck Creek time-on-task, Appraisal Hub homeowner goals, authentication predictability, CRM relevance, PVP control, RBS understanding, foresight, civic access. Prioritize cases with inspectable evidence over maximum quantity.

### Evidence quality review rubric

Each case must show, as available:

1. Original belief or operational assumption.
2. Observed discrepancy that prompted inquiry.
3. Question/hypothesis and alternatives.
4. Method, participants/data, sampling and relevant constraints.
5. Evidence trail with citations/source captions.
6. Interpretation and uncertainty.
7. Decision rights, influence and implementation mechanism.
8. Measured outcome (or honest absence), tradeoff, next question.

Prefer **one fewer case, one more evidence trace** to overcompressed claims.

---

## 7. Content model and information architecture

### Suggested top-level navigation

- **Investigations** — selected, hiring-relevant case studies; immediately accessible.
- **Questions / Themes** — optional discovery by recurring intellectual problem, not only employer or industry.
- **About** — mission, trajectory, interdisciplinary practice and philosophy.
- **Field Notes** — optional future writing, methods, ongoing inquiries; do not create an empty shell.
- **Contact / Resume** — straightforward actions.

Avoid a compulsory interactive onboarding or thesis before case studies. The homepage must clarify role and value promptly.

### Page structures

**Homepage:** custom asterisk + positioning; proof of strategic research judgment; 3–5 investigation entry points; repeatable explanation-shift pattern; direct career/collaboration link. Atmosphere is optional, never blocking.

**Investigation detail:** executive gist → original explanation → investigation design → evidence → revised understanding → decision and influence → outcome/tradeoff → limitations and references → related questions.

**About:** longer personal statement, selected philosophy, explicit methodology, community-return mission, background; Pushkin/d'Alembert only with properly verified attribution.

**Research index:** familiar cards/list and filtering; optional connection visualization after task research.

**System/Lab (internal):** token specimens, component states, accessibility checks, typography tests, graphic experiments, research hypotheses. Mark prototypes as prototypes.

### Search and filtering

Don't add full-text search until the content volume and actual tasks justify it. Start with semantic headings, direct navigation, and possibly simple thematic filtering; avoid creating a control that implies richer content than exists.

### Content data types

`Investigation`, `ResearchQuestion`, `Observation`, `Claim`, `EvidenceSource`, `Interpretation`, `Decision`, `Outcome`, `Tradeoff`, `Method`, `Theme`, `Reference`, `Person/Collaborator (with permissions)`, `VisualAsset`, `Experiment`, `DesignDecision`.

Every content block should support editorial updates independent of layout. If existing repo uses MDX/CMS, inspect before introducing a new content platform.

---

## 8. Interaction architecture: established systems first

**Nonnegotiable:** Do not infer interaction behavior from aesthetic references. Start with the user's task and current, documented systems of web interaction, cognition, accessibility and platform conventions.

### The interaction decision chain

1. What is the user's job-to-be-done?
2. What information must be immediately visible?
3. Is interaction necessary, or will a clear static representation do better?
4. Which native HTML or established WAI-ARIA pattern matches the task?
5. What states, affordances, feedback and reversibility are expected?
6. What happens with keyboard, touch, screen reader, zoom, low motion, and slow loading?
7. What evidence supports this implementation? What are the untested assumptions?
8. What will determine whether to keep or remove it?

### Candidate interaction catalog

| Candidate | Starting pattern | Status | Decision boundary |
|---|---|---|---|
| Asterisk evidence note | semantic footnote link or labeled disclosure | evidence-informed | don't make logo a mystery button; real source/destination |
| Explanation lens | side-by-side compare or tabs/segmented control | evidence-informed | if simultaneous comparison matters, show both |
| Methodology inspection | headings and native disclosure | evidence-informed | essential result never hidden |
| Evidence network | standard index first, secondary optional visualization | hypothesis | task benefit must beat accessible index |
| Read/Inspect | progressive disclosure; simple reveal of depth | hypothesis | don't split essential content into invisible mode |
| AI proposal regrouping | static grouping first; explanatory animation optional | hypothesis | no fabricated underlying data; reduced-motion equivalent |
| Theme switch | standard explicit preference control if needed | hypothesis | themes must preserve accessibility and content |
| Search | conventional input/search results | content-dependent | don't add without search problem |
| Generative asterisk | nonfunctional decorative motion | expressive | no navigation meaning implied by moving shape |

### Interaction contract template

```yaml
component: evidence-disclosure
user_task: "Inspect rationale behind a finding."
pattern: "HTML button + collapsible content region (or native details as suitable)"
default_state: "Finding visible; supplementary context summarized and closed"
activation: "click, tap, Enter, Space"
feedback: "expanded state clearly communicated"
focus: "remains predictable; no invisible trapped focus"
assistive_tech: "accurate accessible name and expanded state"
mobile: "large tappable target; readable content"
reduced_motion: "instant state change when requested"
no_js_equivalent: "source content accessible by default or via normal link"
validation: "can participant locate support and return to finding?"
```

### Components to standardize

- Navigation header, links, breadcrumbs, skip link, focus indicators.
- Headings, paragraph blocks, inline reference links, source notes.
- Buttons and icon buttons **with accessible labels**.
- Cards, selected project cards, evidence panels, infographics.
- Tabs **only for actual alternate panels**; disclosures for additional detail.
- Filters and search with visible result count/clear state where applicable.
- Tooltips only for supplementary content, never necessary instructions on hover alone.
- Charts with table/transcript alternatives.
- Forms, validation, status messages, error recovery, empty and loading states.

**Required states:** default, hover where applicable, focus-visible, pressed/selected, expanded/collapsed, active navigation, disabled (if needed), loading, success, failure, empty, responsive and reduced-motion.

### Usability testing

Don't call a design 'validated' because a model predicts its performance. Use task observation and representative humans when possible. Compare comprehension and task completion against a simpler baseline. Suggested tasks: identify the researcher's value proposition; find strongest evidence for one case; tell observation apart from explanation; find tradeoff; contact researcher; navigate without a mouse.

---

## 9. Accessibility, inclusion, and perceptual design

Target **WCAG 2.2 AA** as a release floor, plus usability beyond technical conformance. Audit with automated tests and real keyboard, screen-reader, zoom and mobile/manual testing.

- Real headings, landmarks, skip links, explicit navigation state.
- Accessible names, roles, values, correct focus order, visible focus.
- Touch target and spacing considerations under WCAG 2.2.
- 4.5:1 ordinary text, 3:1 applicable large text and essential non-text (unless a valid exception).
- No text embedded solely in images for essential information.
- Resize/zoom/reflow (including 400%) without loss or horizontal reading scroll where WCAG requires.
- Motion reduction and no rapid flashing. Provide pause/stop for moving content where applicable.
- Charts described and available as text or data tables; source and uncertainties readable.
- Never make blur a prerequisite to reading; avoid gaze-triggered or cursor-chasing essential controls.
- Avoid color-only distinctions or requiring accurate sensory perception as a hidden test.
- Test actual contrast on glass/translucent surface with real backdrop.

**Anti-pattern:** A diagram that is elegant visually but impossible to traverse or understand without drag/hover.

---

## 10. Responsive behavior, performance, privacy, and SEO

### Responsive

Use content-driven breakpoints rather than designing three fixed screenshots. Default to a single clear reading column on narrow viewports. Optional diagrams may become scrollable **with labels and alternate summary** or transform into stacked narratives. Protect heading break points and avoid rotated primary text on mobile.

### Performance goals (initial engineering budgets; tune after measurement)

- Prefer static/SSR output for reading content; progressively enhance interactive diagrams.
- Keep heavy animation/visualization bundles out of first paint.
- Load fonts efficiently, subsets if justified, provide fallback and acceptable layout stability.
- Optimize and lazy-load editorial media; ensure alt/captions and rights.
- Aim for good Core Web Vitals and establish measured performance budgets for the actual hosting environment rather than declaring invented benchmarks achieved.
- Avoid expensive continuous canvas simulation, device battery drain, and needless background rendering.

### Security, rights and privacy

- No uncontrolled copying of inspiration imagery, fonts, illustrations, or source code.
- No public release of confidential survey responses, internal operational files, or identifying participant detail.
- Prefer privacy-respecting analytics or none; state disclosure/consent if tracking added.
- Protect any contact form from abuse; minimize data collection.
- Review external embeds, CSP, dependency vulnerabilities and third-party font/network requests.
- Distinguish original research artifacts from illustrative recreations.

### Discovery & metadata

Meaningful titles, meta descriptions, structured headings, Open Graph images, semantic URLs, accessible link text, sitemap, robots rules, canonical tags where needed, and a concise downloadable/print-friendly résumé link if provided.

---

## 11. Component hierarchy and token model

Recommended separation:

```text
Design primitives
  ├─ typography, color, space, elevation, borders, radii, motion
  ├─ illustration/grid/annotation primitives
  └─ theme and accessibility tokens
Semantic components
  ├─ link, button, disclosure, tabs, search, navigation, card
  ├─ chart, table, tooltip, callout, source caption
  └─ error/status/loading/empty patterns
Research-specific patterns
  ├─ assumption → evidence → revised interpretation
  ├─ methodology/evidence trail
  ├─ outcomes and tradeoffs
  ├─ source/provenance references
  └─ confidence / limitation / open-question states
Page templates
  ├─ home, case, about, index, field-note
  └─ lab/system (internal)
```

**Suggested token naming** (not framework-specific):

```css
:root {
  --color-bg-reading: /* verified paper */;
  --color-text-primary: /* verified ink */;
  --color-accent-signal: /* contrast-tested orange role */;
  --font-display: /* Geom, if approved */;
  --font-body: /* Elms Sans, if approved */;
  --font-meta: /* IBM Plex Mono, if approved */;
  --space-unit: 4px;
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-deliberate: 400ms;
}
```

Do not insert placeholder tokens into production CSS verbatim. Generate verified values and test them. Prefer semantic tokens over raw hex or fixed pixel values scattered throughout components.

---

## 12. The agent architecture for Codex

**Key principle:** An agent role is a responsibility and review contract, not proof that a specific Codex product automatically creates it. Implement roles with (a) focused tasks in a single Codex session, (b) repo-local Skills and `AGENTS.md`, or (c) supported subagent orchestration, where available. Verify actual runtime support and repository architecture first.

### 12.1 Why not one agent per tiny task?

Specialization is useful when independent research, construction or skeptical review will materially improve correctness. But dozens of simultaneous agents create context waste, integration friction and conflicting file edits. Use a **small coordinating core**, then invoke specialists at relevant gates. Keep independent analysis parallel; keep shared-file edits serialized or explicitly partitioned.

### 12.2 Proposed roles

| Role | Responsibility | Required deliverable | Constraint / escalation |
|---|---|---|---|
| **1. Systems Orchestrator** | decomposes phases, dependencies, handoffs | execution plan, task ledger, decision register | cannot mark unvalidated ideas as approved |
| **2. Repository Archaeologist** | audits existing code, stack, assets, dependencies | repo map, migration constraints, reuse candidates | no destructive refactor until inventory complete |
| **3. Research-Evidence Custodian** | checks every claim against source, confidence, tradeoff | claim ledger, provenance and red-flags | can block unsupported public claims |
| **4. Interaction Anthropologist** | maps visitor tasks to established affordances and cognition | task model, interaction contracts, alternatives | reject novelty without user need |
| **5. Accessibility Adversary** | attacks usability from keyboard, AT, sensory/motor/cognitive contexts | manual/automated findings, severity, reproduction | blocks critical access defects |
| **6. Semiotic Identity Designer** | develops asterisk/logo and symbolic meaning | logo specimens, construction rules, comparison | may not replace chosen asterisk |
| **7. Typography & Composition Engineer** | validates fonts, editorial grids, responsive measures | specimens, tokens, breakpoint and line-length tests | must test real long-form reading |
| **8. Visual Systems Engineer** | builds primitives, themes, materials and components | token library, component stories | no undocumented one-off effects |
| **9. Visualization Epistemologist** | distinguishes evidence charts from models and art | diagram classification, legends, source alternatives | vetoes misleading imagery |
| **10. Narrative Architect** | case structure, progressive depth, direct/explore paths | page schemas, evidence-first editorial templates | preserves original meaning and nuance |
| **11. Motion & Perception Engineer** | motion primitives, explanatory transitions and alternatives | motion specs, reduced-motion fixtures | no flashing, no comprehension dependency |
| **12. Implementation Engineer** | integrates approved designs into real repo | working components/pages and tests | must respect repo stack and scope |
| **13. Performance/Privacy Steward** | audit payload, hosting, rights, privacy and security | measured reports and remediations | blocks sensitive-data leaks |
| **14. Skeptical Counterfactual Reviewer** | asks 'what would simpler design do better?' and seeks failure cases | challenge memo, rejected assumptions | no styling preference disguised as science |
| **15. Visitor-Task Evaluator** | drafts tasks, evaluates behavior, logs evidence | usability test protocol, outcomes | AI-generated personas are hypotheses, not human evidence |
| **16. Release Integrator** | resolves cross-stream conflicts, checks ready-to-ship | release checklist, change log, rollback plan | publish only under authorized release policy |

**Outside-the-box feature of this model:** Give two *independent* specialists authority to disagree. The Visual Systems Engineer may propose expressive interaction; the Interaction Anthropologist and Evidence Custodian can reject it for confusion or misleading implications. The Orchestrator records the disagreement and runs a bounded experiment instead of flattening it into consensus.

### 12.3 Recommended operational topology

**Persistent core responsibilities** (not necessarily separate running agents): Orchestrator, Implementation Engineer, Evidence Custodian, Accessibility Adversary.

**On-demand specialist pool:** Repository Archaeologist, Identity, Typography, Interaction, Visualization, Narrative, Motion, Performance/Privacy, Counterfactual, Evaluator.

**Parallelizable work examples:** Research source audit + independent component accessibility review + typography specimen tests, as long as they do not edit the same files.

**Sequential dependencies:** Repository audit → token design → component implementation → integrated pages → performance/accessibility regression → release.

### 12.4 Role contracts as explicit deliverables

For each assigned specialist task, require:

```yaml
role: Visualization Epistemologist
input:
  - verified case-study claims
  - source/provenance ledger
  - intended viewer task
question: "What visualization represents this claim without overstating it?"
output:
  - classification: observational | explanatory | expressive
  - proposed representation and semantic legend
  - accessible textual/table equivalent
  - uncertainty and possible misreadings
  - test recommendations
permission:
  - inspect content and draft design proposals
  - do not publish or invent data
acceptance_gate:
  - evidence custodian approves claims
  - accessibility adversary checks equivalence
```

Use similar bounded contracts for all major tasks. Names are conceptual; translate to the real Codex environment rather than assuming native commands called by these names.

### 12.5 A deliberately adversarial design review

**Skeptical Counterfactual Reviewer** must answer:

- What user task would a plain HTML version fulfill faster?
- Is the complex visual actually communicating a measured relationship?
- What would a novice incorrectly infer?
- What would be missing for someone with no motion, no color, keyboard only, or limited bandwidth?
- What claim is most likely to be repeated by a hiring manager incorrectly?
- Which component is delightful but adds no task value and should be demoted to decoration?

**Evidence Custodian** must answer: What is directly observed? What is interpretation? What tradeoff is omitted? What cannot be claimed publicly from the available source?

**Accessibility Adversary** must answer: Could a user complete the same task without the intended visual/sensory channel? Can controls be operated and understood predictably?

These roles are guardrails against both conventional stagnation and speculative overdesign.

---

## 13. Codex configuration strategy (current docs checked 2026-11-06)

### What is actually supported vs what is our convention

- **`AGENTS.md`** is a recognized repository guidance convention for Codex. Keep concise and task-relevant. It is **not** an automatic roster of independent workers.
- **Skills** use a `SKILL.md` with a name and description, plus optional references, scripts and assets. Use for repeatable *workflows*, not every aesthetic preference.
- **Execution plans** (e.g., `PLANS.md`) are workflow conventions, not mandatory Codex files. Use for genuinely complex, multi-stage builds.
- **Multi-agent delegation** exists in supported OpenAI Agents API contexts, with optional session-level multi-agent configuration. That does not guarantee every user-facing Codex surface supports every subagent feature or the same settings. Confirm the environment rather than inventing CLI flags.
- Do not create speculative custom TOML agent definitions unless verified for the specific installed Codex product/version.

### Suggested repository scaffolding (after repo audit)

```text
AGENTS.md                       # short persistent repo policy
README.md
planning/
  BLUEPRINT.md                  # this source document
  DECISIONS.md                  # locked vs proposed vs tested
  PHASES.md                     # one phase per bounded delivery
  CLAIMS.md                     # public claim ledger + provenance paths
  EXPERIMENTS.md                # hypotheses and test results
  RELEASE_GATE.md               # acceptance and blockers
.agents/
  skills/
    source-trace/SKILL.md       # evidence check workflow
    interaction-contract/SKILL.md
    a11y-verification/SKILL.md
    visualization-epistemology/SKILL.md
    design-specimen/SKILL.md
    release-check/SKILL.md
src/                             # existing structure takes precedence
  ...
```

**Don't create all files preemptively.** Start with blueprint, a concise `AGENTS.md`, a phased plan, and whichever workflow skills solve repeated failure modes. Let actual project tasks justify additional structure.

### Suggested root `AGENTS.md` core (template; tailor to repo)

```markdown
# Producing Curiosity — repository guidance

## Mission
Build an accessible research portfolio that demonstrates investigative judgment,
evidence provenance, tradeoffs, and decisions enabled. The asterisk is the
chosen logo. Test → Show → Enable is the narrative framework.

## Decisions
Read planning/BLUEPRINT.md for a substantial design change. Respect LOCKED
items in planning/DECISIONS.md. Do not invent research evidence or quantitative
outcomes. Mark proposals and experiments honestly.

## Behavior
Default to native semantic HTML and established accessible interaction patterns.
Novel interactions require a stated user task, simpler baseline, accessibility
alternative, evaluation criterion, and approval before production promotion.

## Quality
For affected scope, run relevant checks: build/types, accessibility, keyboard,
reflow, visual consistency, provenance, and performance. Report results and
remaining limitations. Use research-specific skills only when applicable.

## Boundaries
Do not expose confidential research, copy third-party designs, or publish
externally without explicit project authorization. Preserve existing working code
and do not replace site architecture without assessing it first.
```

### Skill triggers worth implementing first

1. **`source-trace`** when editing research claims, case study metrics, causal language, impact or citations.
2. **`interaction-contract`** when creating nontrivial controls, overlays, navigation or stateful visualizations.
3. **`a11y-verification`** when any component, visual or motion feature changes.
4. **`visualization-epistemology`** when a diagram purports to represent research findings.
5. **`design-specimen`** when modifying tokens, typography, logo or responsive layout.
6. **`release-check`** before publishing a candidate release.

Each skill should have observable outputs and avoid repetitive generic checklists that drown useful context.

### Coordinator handoff rule

Before any substantial implementation, require a compact task card:

```text
INTENT: What visitor problem or system requirement is solved?
STATUS: LOCKED / DIRECTION / HYPOTHESIS / TO VERIFY
SOURCE: Which design decision, claim, or user need supports it?
FILES: Which files may be edited?
BASELINE: What current behavior must be preserved?
ACCEPT: What can be observed or tested to prove success?
REVIEW: Which independent role should challenge it?
```

No role should change a shared decision register without a cited reason and visible review. Review agents can critique in parallel; implementation ownership must stay coordinated.

---

## 14. Delivery sequence and acceptance gates

### Phase 0 — Repository reconnaissance

- Inventory current framework, routes, assets, existing Codex setup, build/test/hosting, fonts and content sources.
- Record what is already working and what will be preserved.
- Create source-of-truth decision ledger and minimal execution plan.
- **Gate:** No unsupported architecture guesses or destructive reset.

### Phase 1 — Identity and foundation specimens

- Develop original asterisk vectors and test favicon/monochrome/wordmark.
- Build font specimens and compare Geom, Elms Sans, optional Liter with real content; verify licenses.
- Define semantic color and spacing, grid, and material tokens; verify contrast.
- Build static specimens on light and dark backgrounds.
- **Gate:** Owner accepts identity direction, typography, and key visual tokens; documented open items remain distinct.

### Phase 2 — Component behavior and accessibility

- Implement semantic links, nav, cards, disclosures, tabs only when needed, focus patterns, error states.
- Document and test keyboard, screen readers, touch, responsive, reduced-motion.
- Include static evidence panel + source references.
- **Gate:** Component inventory passes behavior contracts and critical accessibility tests.

### Phase 3 — One reference case study

- Choose a source-rich case, likely Claims, Trust, or AI synthesis depending on available evidence.
- Populate structured data with real verified claims, evidence trace, decision, limitation and tradeoff.
- Build static narrative first; layer a single purposeful interaction if justified.
- **Gate:** An uninstructed reviewer can distinguish observation, interpretation and decision.

### Phase 4 — Homepage and research index

- Present positioning immediately, proof through selected investigations, appropriate navigation and contact.
- Build theme/index connections using conventional filtering/links first.
- **Gate:** First-time hiring visitor can find what matters quickly, without any experimental interaction.

### Phase 5 — Experimental laboratory

- Prototype generative asterisk, relationship maps, explanation lenses, comparative evidence views.
- Include hypothesis, baseline, accessibility alternative and explicit success metric.
- **Gate:** Promote only if meaningful task value or editorial value is clear and associated costs are acceptable.

### Phase 6 — Expansion, optimization and release

- Expand case studies with verified sources; polish visuals and copy.
- Check mobile, high zoom, multiple browsers and AT, color contrast and content rights.
- Measure performance, verify SEO and privacy, secure approval for public deployment.
- **Gate:** No critical blocker, no unsupported flagship claim, rollback available.

**Scope principle:** A beautiful first case with auditable evidence is more valuable than a dozen thin pages or speculative graph animations.

---

## 15. Quality matrix

| Area | Required evidence of done |
|---|---|
| Identity | custom asterisk in one color works at small size; logo story sourced; no copied mark |
| Typography | specimens tested with real long-form content, responsive and zoom |
| Color | calculated contrast for all semantic foreground/background pairs |
| Layout | no accidental overflow; correct order in reading and zoom contexts |
| Motion | reduced-motion equivalence; no flashing; meaningful use only |
| Interaction | documented task/pattern/state/focus; keyboard and touch equivalence |
| Evidence | every central claim backed by source or explicitly marked unverified |
| Case studies | original assumption, method, evidence, interpretation, influence, tradeoff, open questions |
| Content ethics | no identifiable participants/confidential documents; rights reviewed |
| Performance | measured bundle/media/field metrics; regressions identified |
| Technical | build/type/lint/test passes as applicable; maintainable components |
| User research | documented human feedback when available; simulation never mislabeled validation |

### Measuring success without faking certainty

**Task measures (proposals):** Time to identify professional role, correct interpretation of one finding, ability to locate evidence, ability to identify tradeoff, task completion, navigation and comprehension errors, confidence calibration, subjective feedback.

**Research hypothesis examples:**

- Does a side-by-side comparison improve accurate explanation recall over an animated transition?
- Does a visually linked research index improve recognition of shared themes over simple tags?
- Does a footnote-style evidence control increase source inspection without distracting from the main conclusion?
- Does a dark atmospheric cover increase engagement while leaving key content discoverable?

Predeclare what would count as meaningful improvement, use appropriate sample/context, and avoid overstating sparse findings.

---

## 16. Immediate Codex handoff prompt

Copy the following as the initial Codex task after placing this file in the repository. The first task is **inspect and plan**, not rebuild everything immediately.

```text
You are the Systems Orchestrator for the Producing Curiosity research portfolio.

Read planning/BLUEPRINT.md (or this file's actual path) and audit the current
repository before changing production files. Respect the LOCKED decisions:
asterisk logo, evidence-first research positioning, Test → Show → Enable,
familiar accessible interaction patterns, and no fabricated evidence.

Deliver, in this order:
1. A factual repo inventory: framework, routes, design tokens, fonts, current
   content, build/testing/deployment, existing AGENTS.md or skills.
2. A gap analysis against the six systems and decision register, separating
   confirmed facts, missing evidence, design choices, and experimental ideas.
3. A minimally invasive target architecture reusing existing working code.
4. An agent/skill responsibility plan with bounded file ownership and review
   gates; do not assume unsupported subagent or CLI features.
5. A phased implementation plan with explicit acceptance criteria, test commands,
   dependencies, reversibility, and a single recommended first slice.
6. A short list of source material or decisions genuinely needed from the owner.

Do not publish, rewrite factual research claims, replace the chosen logo, copy
third-party artwork, or make unapproved destructive changes. Do not treat an
attractive interaction as validated just because it is visually compelling.
Propose the smallest high-quality working specimen first.
```

---

## 17. Reference framework and documentation

The following were checked as of **2026-11-06** and inform implementation patterns. These sources should be revisited where tools or standards evolve.

**Accessibility and interaction**

- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG overview: https://www.w3.org/WAI/standards-guidelines/wcag/
- WAI ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WAI disclosures: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- WAI tabs: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- NN/g usability heuristics: https://www.nngroup.com/articles/ten-usability-heuristics/
- U.S. Web Design System: https://designsystem.digital.gov/

**Codex and agent workflows**

- OpenAI, *Iterating Development Workflows with Codex* (2026): https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex
- OpenAI, *Using PLANS.md for multi-hour problem solving*: https://developers.openai.com/cookbook/articles/codex_exec_plans
- OpenAI, *Rethinking skills and prompts for GPT-6 Astra* (2026): https://developers.openai.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra
- OpenAI, *Using skills to accelerate OSS maintenance* (2026): https://developers.openai.com/blog/skills-agents-sdk
- OpenAI, *Multi-agent (Agents API)*: https://developers.openai.com/api/docs/guides/agents-api/multi-agent
- OpenAI, *Agent configuration*: https://developers.openai.com/api/docs/guides/agents-api/configuration
- OpenAI, *Skills*: https://developers.openai.com/api/docs/guides/tools-skills

**Visual references already supplied by the owner (not licensed assets for reuse):** Sable personal system; historical scientific graphs; constructivist and contemporary editorial layouts; geometry and generative trajectory visuals; visual attention/contrast examples; asterisk construction sketches; Geom/Liter/Elms Sans specimens; geometric identity projects; asymmetrical Japanese graphic references; analog-computational artwork; research visualization. These are sources of principles and potential test cases, not things to clone.

---

## 18. The one-page summary

**Identity:** Asterisk as a historical mark of inquiry; original geometry informed by personal sketching. **Do not replace it.**

**Aesthetic:** Scientific/editorial, geometrically precise yet expressive, paper/ink/orange, controlled asymmetry, selective analog texture, contemporary interactive instruments. Geom/Elms Sans/IBM Plex Mono are candidate roles, not yet final specimen approval.

**Experience:** Direct proof for hiring stakeholders and optional exploratory depth for curious visitors. Familiar navigation and interactions first.

**Content:** Source-backed investigation narrative—what was assumed, what was observed, what explanations were tested, what was decided, what changed, and what remains uncertain.

**Behavior:** Component contracts grounded in current human factors, conventions, accessibility and user tasks. Novel interfaces are testable hypotheses, not arbitrary enhancements.

**Engineering:** Audit the repo, build foundations and one real case, verify, expand deliberately. Release only content and features whose factual and usability claims are supportable.

**Agent strategy:** Small coordinating core plus independent, on-demand specialists for evidence, interaction, identity, visualization, accessibility, perception and adversarial critique. Clear deliverables, scoped edits and independent review gates.

**North star:** **Make the poetry of discovery and the geometry of explanation coexist—without confusing metaphor for evidence.**
