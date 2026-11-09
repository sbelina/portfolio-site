---
name: interaction-review
description: Review a proposed or changed Producing Curiosity interaction against real user goals, established web behavior, accessible semantics, and experiment criteria before implementation or release.
---

# Interaction Review
1. Read `docs/design-system/INTERACTION_CONTRACTS.md` and the affected product journey.
2. State the exact user task and what baseline non-novel UI can accomplish it.
3. Identify the standard semantic/APG pattern; consult documentation for nontrivial widgets.
4. Model all states and keyboard/touch/focus behavior, feedback and error recovery.
5. Determine whether the control is conventional, adapted, or experimental. For experimental, propose a separate `/lab` prototype and falsifiable comparison.
6. Test with keyboard, 200% zoom, reduced motion, and relevant assistive tech; automated checks are only partial evidence.
7. Report **observed** results separately from hypothesized benefits, and require owner approval before public behavior changes.
