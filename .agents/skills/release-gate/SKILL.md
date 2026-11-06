---
name: release-gate
description: Run the final prepublication review of a Producing Curiosity site change, verifying evidence, approval, accessibility, privacy, links, builds and rollback readiness.
---

# Release Gate
1. Compare proposed release to the scope and acceptance criteria in `docs/design-system/IMPLEMENTATION_PLAN.md`.
2. Verify that required human approvals for authored claims, diagrams, relationships, logo, and deployment exist.
3. Run configured deterministic checks and capture exact commands/results; do not make up passing results.
4. Audit static builds and maps for private/restricted material; inspect links, routing, content references, and meta tags.
5. Validate accessibility with both automation and manual smoke checks; document gaps.
6. Output GO / HOLD with specific blockers, evidence, owner action and rollback plan. Never deploy without explicit authorization.
