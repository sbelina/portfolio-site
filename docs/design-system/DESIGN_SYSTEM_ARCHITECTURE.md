# Producing Curiosity — Design System Architecture
**Status:** Adopted design direction; capabilities remain proposed unless recorded in ADOPTION.md. **Version:** 1.0 (2026-11-06). **Owner:** Human author.

## North star
**Question what's possible. Preserve what we've learned. Test what we invent. Make the evidence visible.**

Producing Curiosity is an applied human systems research and strategy portfolio and evolving field journal. It must make the author's investigative judgment visible: the observable outcome, initial explanation, competing explanations, evidence, interpretation, decision influence, trade-offs, uncertainty, and next questions. It is not a generic UX showcase, data dashboard, artificial-intelligence chatbot, or illustration gallery.

**Public value proposition:** "I investigate situations where outcomes are visible, but the explanations behind them remain unclear." The practice is **Test. Show. Enable.** The intellectual signature is **Related. Not equivalent.** The evidence commitment is **How I Know**. Its scout-and-scribe aim is returning useful knowledge to those who can act, including communities, not only executives. The author's interdisciplinary idea: inspiration is relevant in geometry as well as poetry; rigor and imagination are partners, not substitutes.

**Two entry journeys:** (1) *Evaluate my work*: determine capability, authorship, evidence quality, decision consequence, and fit in under a few interactions; (2) *Explore my questions*: discover investigations and relationships among human behavior, information, technology, institutions and environment. The first must work without animation, filtering, a graph, or experimental UI. The second is optional depth, not an alternative requirement.

## Product invariants
1. Identity is an **asterisk**, selected for its historical role as an annotation/referential mark. Do not replace it with an alternate concept. Specific geometry remains under design. Do not claim an exact personal historical rationale beyond what the author confirms.
2. Visual identity combines **scientific instrument + experimental editorial journal + human field notes**. The site must communicate the human side of inquiry as visibly as systems/geometry.
3. Style means **precision without rigidity; imagination without inventing evidence**. Visual complexity may invite curiosity; essential information must be immediately comprehensible.
4. Existing and native web interaction patterns are default. Innovation requires a documented user task, an explicit hypothesis, reversible implementation, and testing. Visual references alone never authorize interaction.
5. Observation ≠ interpretation ≠ proposal ≠ outcome. Agreement ≠ trust; completed ≠ understood; related ≠ equivalent. Preserve uncertainty, adverse trade-offs, and authority boundaries.
6. AI and agents may *propose*, but must never publish claims, sources, connections, identities, or confidential materials without explicit human approval.
7. Meaning never depends solely on color, motion, hover, audio, complex diagrams, or a proprietary runtime.
8. No autonomous production deployment, unapproved push/merge, unauthorized content ingestion, framework migration, new CMS, or disclosure of private employer/user research materials.
9. Accessibility, portability, performance, responsive design, and security are design inputs, not final QA decorations.

## Six architectural systems
### S1 — Identity and expression
**Purpose:** Make inquiry recognizable through a distinct but coherent visual language.
- Logo: original custom six-ish-arm asterisk family to be prototyped (number/shape is not fully settled). Compare mono silhouette at 16, 24, 48, 128 px; spacing; optical center; ink/paper; inversion; print; visual similarity review. A typographic `*` can be punctuation, not the full identity mark. A logo animation is optional and nonessential.
- Identity grammar: mark-as-signature, mark-as-reference (source note), mark-as-exploration (nonfunctional motif). Distinguish roles. A clickable asterisk must have visible/contextual affordance and accessible name; a decorative one must not appear actionable.
- Typography candidates: **Geom** expressive headings; **Elms Sans** reading and interfaces; **IBM Plex Mono** measured labels. Confirm type specimens, file weights, licenses, numeral quality, paragraph legibility before shipping. Avoid triple-sans mixing without role justification. Use dynamic type scale, 60–75 character editorial measures, honest emphasis, clear citation styling.
- Color: neutral **paper/ink** foundation; **orange** for consequential emphasis; sage/graphite/cool accents as secondary atmosphere and semantic relationships, never as sole meaning. Dark observatory and light archival surfaces may coexist. Palettes remain provisional until contrast testing. Preserve historical visual semantics where useful but do not silently assign new meanings to old colors.
- Layout: systematic responsive grid; 4px spacing basis; varied section geometry; strong baselines; purposeful asymmetry; a single exception against a disciplined structure. Avoid breaking source order, reading order, or mobile hierarchy to achieve editorial disruption.
- Geometry: circles, curved trajectories, nodes, connectors, axes, stippling, construction guides, charts; explicitly mark whether decorative, conceptual, or empirical. Do not put fabricated measurement marks or data-looking labels in explanatory diagrams.
- Materials: paper, ink, solid evidence panels, restrained translucent context, rare glass controls, rare liquid/atmospheric composition. Grain/blur never degrades legibility. Define borders, radius, overlay hierarchy, z-index, light/dark shadows and contrast combinations.
- Motion: response 150ms, transition 250ms, narrative <=400ms as *starting values*; avoid autoplay dependence and flashing; `prefers-reduced-motion`; preserve focus and state orientation; static alternatives for all explanations.

### S2 — Human interaction
**Purpose:** Support real tasks through understandable action and feedback.
- Interaction contract required before any reusable control: user need; established pattern; entry affordance; full state chart; pointer/touch/keyboard behavior; focus transfer; accessible labeling; status feedback; failure and empty cases; reduced-motion/static alternative; evidence level; validation plan.
- Start with links, buttons, disclosures, conventional filters, skip links, anchors, and semantic content. Do not repurpose an icon into mysterious navigation.
- **Evidence disclosure:** use button and `aria-expanded` with associated content; explicit "Show supporting context" language. Preserve primary finding outside the disclosure.
- **Comparison:** side-by-side when simultaneous differences matter; tabs/segmented control when mutually exclusive views matter. For tabs, implement APG semantics and keyboard behavior; do not call a two-state filter "tabs" without true tab semantics.
- **Asterisk footnote:** use anchored footnote, link-to-source, or established disclosure pattern based on destination. Distinguish citations, qualifications, and side commentary. Avoid hover-only tooltips for crucial information.
- **Search/filter:** only after content size warrants it; URL/shareable state where practical; clear selected state and no-results guidance.
- **Atlas/graph:** optional second representation of authored, approved relationships. Every node/link should have textual list equivalent and source evidence. Never make graph-only navigation mandatory. No automated equivalence inference.
- **Modes:** do not build separate read/inspect experiences unless task evidence suggests benefit; start with readable article plus progressive method/evidence panels.
- **Experiment boundary:** custom spatial interaction, generative visuals, visual hypothesis toggles live in /lab until tested, labelled experimental, and not wired into required journeys.

### S3 — Knowledge and evidence
**Purpose:** Represent what is claimed, supported, interpreted, and unknown so design cannot inadvertently overclaim.
- Entities: Investigation, Pattern, Question, Claim, EvidenceSource, Observation, Interpretation, AlternativeExplanation, Decision, Outcome, Limitation, Relationship, FieldNote, Experiment, Revision, PermissionApproval.
- Each Claim should carry its provenance, method/sample/timeframe, author/contribution, evidence strength, causal attribution limit, sensitivity, publication approval status, and relationship to the narrative section. Missing confidence must render as *unknown*, not be invented.
- Each Relationship should declare type, directionality, rationale, evidence pointers, qualification, and author approval. **Related is not equivalent**: a graph connection is an editorial claim, not mathematical proof.
- Empirical vs conceptual vs expressive visualization must have clear labeling. Do not convert unverified numerical references into charts.
- Public snapshots build from approved content only. Drafts, unpublished sources, and approval metadata must never be included in public assets, bundles, source maps, or endpoints. Prefer static/prerendered reading pages and durable URLs.
- Case evidence exemplars: Trust 800+ responses over nine days, distinguish agreement from trust; AI 38 proposals → eight analytical groupings, do not call these verified user needs; Claims: the approximately 18% and 7.6% observations have different scopes and are not a before/after series. Do not juxtapose them, calculate a reduction, or assign a shared unit or denominator. Each requires its own verified definition, period, method, source and approved wording. Earlier review before payment is owner-reported; increased elapsed payment waiting has not been established. Distinguish genuine authorship and collaboration.

### S4 — Narrative and navigation
**Purpose:** Demonstrate professional value quickly while rewarding deeper exploration.
- Public page model: Home; Investigations index and durable Investigation pages; Patterns with curated cross-case links; About/Practice; Field Notes (optional at launch); Experiments/Lab (sandbox, optional launch). Connections nested in Patterns, not a compulsory visual graph homepage.
- Home must answer: Who investigates? What problems? How? What changed? Where's the evidence? What next? Provide two obvious journeys "Evaluate my work" and "Explore my questions".
- Case page preferred structure: Situation and visible outcome → initial frame → question/alternatives → methods + evidence → inference/limits → decision influence → observed change/tradeoff → remaining questions → related, not equivalent.
- Keep **Test. Show. Enable.** as a recurring editorial navigation aid but don't force every case into identical hero/cards. The visitor must never infer causal attribution from motion or diagram composition alone.
- Writing voice: thoughtful, interrogative, precise, inviting, useful; not theatrical, inflated, or research-jargon dense. The author remains the subject, not a fictional laboratory institution.
- Keep a direct professional evidence trace and optional exploratory relationships. Native URLs, breadcrumbs, accessible hierarchy, citations, and search engine-friendly text.

### S5 — Experimentation and evaluation
**Purpose:** Generate new possibilities without claiming imagined user evidence.
- Every experiment records: research question, user task, current comparator, predicted benefit, supported psychological/interaction basis, assumptions, potential harms, alternative explanation, instrumentation, exit criteria and recommendation.
- Method: inspect prior knowledge → identify task → generate candidate including baseline → adversarial review → prototype smallest reversible slice → automated checks → human task study → decide keep/revise/archive.
- Use authentic human evaluation. AI simulated personas are critique tools, **not participants**, empirical evidence, or usability validation.
- Candidate studies: asterisk-linked provenance; original-vs-revised framing comparison; text index vs graph-assisted discovery; diagram reveal vs static infographic. Avoid launching all simultaneously.
- Design library routes `/system` (token, component, behavior specimen) and optional `/lab` (hypotheses and prototypes) stay distinct from core pages.

### S6 — Engineering and governance
**Purpose:** Keep the system testable, reviewable, portable, and safe.
- Preferred historical baseline: React + TypeScript + Vite and Cloudflare Pages/Worker static/prerendered delivery. This is background, **not a guarantee about a new empty repository**. Before implementation inspect actual repository state and ask the owner only if an architectural choice must be changed. Respect clean-slate intention; do not revive archived code just because it exists.
- Source organization recommendation: `/src/design/tokens`, `/src/design/components`, `/src/content/schema`, `/src/content/public`, `/src/features/{investigations,patterns,atlas,notes,experiments}`, `/src/pages`, `/src/styles`, `/tests`, `/docs`, `/scripts`. Adopt current conventions when working in an existing repo.
- Use a typed content schema with runtime validation at build, deterministic public content compiler, explicit graph relationships, and source/approval validator.
- Enforce WCAG 2.2 AA target plus documented enhanced practices; accessible images/figures; keyboard focus; reduced motion; readable zoom/reflow; no focus traps; visible references and motion alternatives. Use ARIA APG as guidance, not a copy-and-paste substitute for behavior testing.
- Automated gates: typecheck, lint, unit, schema/claim fixtures, link validation, accessible semantics/axe checks, Playwright keyboard and responsive smoke, reduced-motion snapshot, color contrast, permission leaks, static build and privacy scan. Human manual screen reader and usability reviews remain required.
- Performance budgets: field Core Web Vitals targets LCP <=2.5s, INP <=200ms, CLS <=0.1 at p75 mobile/desktop, verified against up-to-date sources; local lab checks are approximations, not field results.
- Author-controlled publication: draft → evidence review → privacy review → editorial approval → public snapshot → deploy review. Agents cannot self-authorize final content or release.

## Decision states
Every decision gets a `status`: **locked**, **provisional**, **experimental**, **rejected**, or **needs evidence**. Each has owner, date, rationale, evidence, affected components, consequences, and reopening criteria. No agent silently upgrades a provisional choice to locked.

## V1 success tests
1. Reader can identify the author's practice and open a high-quality investigation without special interactions.
2. Each featured case shows authorship, competing explanations, traceable evidence, decision consequences, uncertainty, and a trade-off or limitation where applicable.
3. Full site meaning survives zero animation, keyboard-only use, screen-reader reading, mobile view, 200% zoom, and graph-off mode.
4. All public claims and relationships are approved; no private evidence or false attribution reaches output.
5. The asterisk is a recognizable, legible identity independent of motion and semantically meaningful when used as a functional reference.
6. Specimen `/system` shows tokens, interaction state machines, cross-device behavior, contrast results, test coverage, and versioned change log.

## Evidence and standards references
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C ARIA APG patterns: https://www.w3.org/WAI/ARIA/apg/patterns/
- W3C WAI complex images: https://www.w3.org/WAI/tutorials/images/complex/
- U.S. Web Design System accessibility: https://designsystem.digital.gov/documentation/accessibility/
- Web Vitals: https://web.dev/articles/vitals
- Current Codex subagents: https://learn.chatgpt.com/docs/agent-configuration/subagents
- Codex customization: https://learn.chatgpt.com/docs/customization/overview
