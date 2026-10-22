# Codex context: start here

This directory turns the portfolio strategy, design exploration, page architecture, and backend requirements into repository-readable context. It is a documentation handoff, not an implementation of those proposals.

## Reading order

| File | Purpose |
| --- | --- |
| [Root AGENTS.md](../../AGENTS.md) | Concise instructions loaded at the repository level. |
| [PRODUCT-CONTEXT.md](PRODUCT-CONTEXT.md) | Positioning, audience jobs, visual grammar, interaction principles, and inspiration. |
| [IA-AND-BACKEND-BRIEF.md](IA-AND-BACKEND-BRIEF.md) | Full researched specification: URLs, templates, models, authoring, rendering, publishing, and sources. |
| [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) | Dependency-ordered work packages, deliverables, and acceptance tests. |
| [EVIDENCE-RULES.md](EVIDENCE-RULES.md) | Contribution/claim corrections and source-review requirements. |
| [DECISIONS-AND-OPEN-QUESTIONS.md](DECISIONS-AND-OPEN-QUESTIONS.md) | Recommendation status, unresolved choices, and what actually blocks work. |
| [START-CODEX.md](START-CODEX.md) | A short prompt to begin the next implementation task. |

Existing context remains important: [content architecture proposal](../CONTENT-ARCHITECTURE.md), [intro states](../INTRO-STATES.md), [keyboard investigation](../KEYBOARD-RESEARCH.md), [audit](../AUDIT.md), [release notes](../RELEASE.md), and [deployment instructions](../../DEPLOY.md).

## Status and authority

Prepared 22 October 2026 against main commit `0fb948124a5f02455818f10bbbdc53d2fafbe6b4` (tree `562fe5f2c8f2f23bd32e173a48064ff5a7485218`). Reinspect before implementation. The live domain was not retested as part of this documentation handoff.

The current application is a single-page React/Vite prototype. Routing, the content studio, private previews, and the publishing model in this directory are target behavior unless current code proves otherwise. No external editor or paid service is selected merely by documenting it.

The user's latest explicit request determines task scope. Root `AGENTS.md` provides durable working guidance. The older `docs/AGENTS-PROPOSAL.md` remains a historical proposal, not a second active instruction file. Existing source and measured tests establish actual implementation state. This directory expands earlier architecture proposals; conflicts that materially affect implementation should be called out and resolved in a small decision record, not silently blended.

## Primary outcome

A visitor opens a useful investigation at its own URL, understands Sam's contribution and evidence, and follows an explained connection to a pattern. Sam can create an Observation with three meaningful connections, save/reopen it, preview privately, publish an approved revision, and restore it without editing source code.

Start small enough to prove that entire cycle. Do not replace it with an elaborate editor mockup or a static demonstration that only appears to save.
