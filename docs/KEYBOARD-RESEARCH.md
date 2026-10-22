# Proposed investigation: The Machine Changed. Why Didn't the Keyboard?

Status: research brief only. No prototype implementation, input mechanism, superiority claim or production publication is approved.

## Question and evidence standards

Does persistent keyboard geometry reflect continuing suitability, learning/standardization costs, inherited constraints, or some combination? Preserve the original curiosity about input technology changing while familiar structures persist. The claim that QWERTY was deliberately designed to slow typists is disputed; present competing explanations with primary sources and qualified historical scholarship before stating a conclusion.

Keep six variables separate: geometry, character mapping, physical ergonomics, software behavior, learning cost and measured performance. A browser key display cannot establish physical comfort, accessibility or hardware ergonomics. Simulated transition distance is a calculation, not observed typing speed.

Proposed reading structure: historical curiosity → sourced chronology and competing explanations → persistence/standardization → alternatives → explicit design hypothesis → optional comparisons → methods/findings → limitations and next questions. These are optional editorial sections, not a fictional experiment report. Initially mark methods as proposed and results as not collected.

Research ledger per claim: statement, fact/hypothesis/disputed/simulation/measured status, source/locator, author/date, alternative explanation, quality/limits, rights, review status. Start with historical patent/typewriter records and scholarly history; investigate rather than cite unsourced internet repetition. No external historical claims have been verified in this brief.

## Input options to decide before building

| Option | What it explores | Consequence / limit |
|---|---|---|
| Mouse or touch directly selecting visible keys | Spatial selection, target sizes, adjacency, geometry | Pointer travel and touch targeting are not conventional physical typing. Report those tasks separately. |
| Physical keyboard typing into an ordinary text field with visual highlights | Familiar mapping, feedback and comparison baseline | Does not test new physical geometry; no OS remapping. Avoid global key capture and browser/AT shortcut interference. |
| Navigable on-screen controls plus conventional text input | Keyboard/switch access and an inclusive fallback | Spatial traversal cost differs from direct selection; never pool measurements as if input mechanisms were equivalent. |
| Hardware prototype, later | Physical geometry/effort | Separate engineering, safety and study scope; no ergonomic/medical claims from browser work. |

Sam must choose the intended input mechanism, hypothesis and comparison scope before prototype implementation. A reasonable first research question is whether changing visual geometry affects target selection under one specified pointer input; this is an option, not an adopted design decision.

If approved, compare A standard QWERTY, B hexagonal geometry with QWERTY positions preserved as far as explicitly documented, and C alternative hexagonal mapping. Compare A/B to investigate geometry under the chosen mechanism; compare B/C to investigate mapping. Document residual placement changes so A/B is not falsely treated as perfectly isolated.

## Optional module boundaries

Portable layout JSON: key IDs, coordinates, shape/size/spacing and character mapping; separate input adapters, SVG/native-button rendering, passage/task configuration, measurement logic and aggregate analysis. No hardcoded experimental conclusions. Use deterministic layouts, labelled native controls or equivalently accessible SVG, visible focus, non-color active states, undo/reset/layout switching and ordinary text input. Preserve state predictably when changing layouts. Avoid trapping typing outside the active input.

Accessibility gate: keyboard-only and screen-reader control names/state, touch targets, reduced motion, reflow/zoom, no forced dragging, clear errors/status, explicit reset and alternative to spatial input. Decorative geometry is hidden from assistive technology. Assistive navigation is a supported mode, not a failed performance result.

## Evaluation and privacy

Specify task, device, input method, passage, scoring, exposure/practice and exclusion rules in advance. Use comparable provided passages; account for QWERTY familiarity, learning effects and fatigue; counterbalance/randomize order where feasible and report the actual procedure. Report participant count, uncertainty and individual learning curves. Do not generalize from an exploratory convenience sample.

Potential measures: corrected WPM with explicit denominator, corrected/uncorrected error rates, correction frequency, estimated transition distance, task completion, practice progression and optional subjective effort/comfort. Keep observed and calculated metrics separate. Device and input-method groups must remain distinguishable. Accessibility barriers are findings, not participant failures.

Default: no analytics and no saving of arbitrary typed text or keystroke logs. Use only provided passages. Any aggregate export requires informed consent and a clear retention/deletion policy; do not record private text, identifiers or background typing. Computation should remain local unless participants explicitly opt in to a defined data transfer. No medical or ergonomic guarantees.

Potential archive connection: “Inherited Structures Become Invisible Assumptions.” This is an editorial interpretation to review, not a verified causal relationship. Proposed links to process redesign, information architecture, measurement, accessibility and institutional inertia each need their own rationale and evidence. The investigation stays independent of the core publishing milestone.
