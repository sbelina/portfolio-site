# Creative technologist — 11 November 2026

Owner request: create an agent to ideate interactive HTML, the aesthetic of the adopted design system, and creative coding that shows or sparks curiosity. The role formalizes the earlier creative-technologist perspective used in the [p5 evaluation](../codex/P5-EVALUATION.md); it adds a persistent project definition rather than replacing existing specialists or review records.

Definition: [creative_technologist](../../.codex/agents/creative_technologist.toml). Parent owns integration. Current task: create and run the role for ideation; no visitor-facing prototype or new publication is implied.

## Purpose and design stance

Make an idea available to play with. Look for the moment when a reader can notice a gap, follow a trace, reveal an omission, compare interpretations or discover a relationship. Curiosity may come through a surprising form, a responsive object, a small generative study or a useful nested tool. Expressive experimentation has value without pretending it proves improved comprehension.

Keep the professional account clear: Test. Show. Enable.; Related. Not equivalent.; How I Know. The material vocabulary is paper, ink, orange emphasis, observatory darkness, fine lines, arcs, annotations, purposeful asymmetry and human field notes. Preserve the separate semantic meanings of violet, coral and teal. Use current tokens and local font fallbacks. An experiment does not finalize the pending asterisk artwork or font choices.

## Responsibilities and ownership

| Concern | Creative technologist contributes | Existing owner / boundary |
| --- | --- | --- |
| Interactive HTML | Nested affordances, situated tools, object/state sketches, inspectable reading | interaction_scientist checks the task and behavior; core account stays readable |
| Visual expression | Composition and motion proposals grounded in actual tokens and components | visual_system_architect owns system coherence; identity_geometer owns assigned mark studies |
| Creative coding | Small runnable local experiments when specifically assigned; renderer rationale and lifecycle plan | interface_builder integrates approved scope; no automatic framework/dependency migration |
| Meaning and evidence | Explicit distinction among conceptual models, measured charts and expressive art | epistemic_auditor reviews sources; author approves exact claims and relationships |
| Validation | Technical observations, counterexamples and voluntary reader tasks | accessibility_adversary challenges barriers; agent critique is not participant evidence |
| Release | Reviewable artifact and recovery notes | parent/release_steward check gates; owner publication authority remains separate |

## Choose the medium for the experience

- **HTML first:** reading, labels, links, editable values, controls and nested context. Meaningful results are available without hover or a special gesture. Preserve focus, browser behavior and reading position.
- **SVG and light animation:** responsive labeled geometry, traces, aligned comparisons and inspectable relationships. Use a complete static state when motion is unavailable. Never make a label shrink merely to fit a dense composition.
- **Optional p5/canvas:** motion, accumulation, feedback, simulation or expressive play where a drawing loop earns its cost. Reuse the existing pinned adapter patterns where useful. Controls/explanations stay in HTML; data stay renderer-independent; lazy loading, pause/reset, visibility and disposal are explicit. No canvas-only reading or mandatory GPU experience.

Nested functionality should deepen one passage, not create an endless panel hierarchy. The existing native disclosures are a baseline, not a requirement that every future idea become another disclosure. Keep full entries at durable URLs and explain why any proposed connection matters. No automatic frame switcher, graph inference or new manuscript import.

## Required concept record

For each idea supply:

1. **Invitation and question:** what the visitor can notice or try, why it might invite curiosity, and whether the goal is expressive play, explanation or evidence inspection.
2. **Concrete experience:** initial composition, one-action useful result, optional next exploration, states, reset/exit and stable reading path. Include keyboard/touch, focus, static/no-JavaScript and reduced-motion behavior.
3. **Art and implementation:** actual tokens, line/shape/material treatment, semantic labels, renderer choice, reusable files/components, portable content fields and any missing source approval.
4. **Challenge and test:** conventional comparator, three plausible failure modes, technical acceptance checks and a human evaluation question. Do not invent participant findings or equate clicks/time with understanding.
5. **Bounded next task:** exact file/surface ownership, reversible local scope, verification and exit criteria. Keep status as proposed until implemented; keep implemented distinct from published or validated.

## Modes and handoff

Default **ideate** mode writes proposals only in an assigned document. **Prototype** mode requires an assigned isolated surface and produces a working local artifact, not a claim of site integration. **Implement** mode requires a bounded application task and independent review. Current owner instructions authorize necessary reversible work within an assigned mode; do not invent repeated approval steps for ordinary choices. A previous release authorization does not silently authorize every later creative feature.

Example invocation:

```text
Use creative_technologist in ideate mode. Inspect current design tokens and the
homepage illustration. Propose three different ways a visitor could inspect an
idea through interactive HTML, SVG or optional creative coding. Keep the
information static-readable, distinguish expressive art from evidence, and
recommend one small local experiment with exact files and acceptance checks.
Do not alter the live site, intro or archive.
```

The [first ideation record](CREATIVE-EXPERIMENT-IDEAS.md) records the role's actual source inspection and proposals. Project TOML definitions follow the documented format used by the existing roles. Syntax and an explicitly delegated run can be verified here; automatic discovery/reloading by every client session is a separate capability and is not assumed.

## Verification and recovery

On 11 November, the parent explicitly delegated the role instructions to `/root/creative_interaction`, with ownership of the concept record only. The agent inspected source and returned three proposals. Integration clarified the proposed static prerender, no-JavaScript control behavior and separate trial-test discovery; these are contracts for future work, not implemented features.

Local checks passed: 14 TOML files parse, 13 role names/contracts are unique, the concurrency cap remains four, 63 local link targets resolve across the four affected Markdown documents, code fences balance and `git diff --check` is clean. Application/browser tests were not rerun locally for this configuration/documentation-only change. No visitor study or automatic client-discovery test was performed.

Work is isolated on `feat/creative-technologist`, based on main `7e4a640`. No application, content projection, archive, dependency or credential changed. Recover by reverting the feature commit through review; there is no database migration or production release to roll back.
