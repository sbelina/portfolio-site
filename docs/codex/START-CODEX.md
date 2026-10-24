# Start the next Codex task

Select the repository branch containing this handoff. If it has not been merged, use that branch or explicitly bring its documentation into the working branch before starting.

Paste this message:

```text
Use this repository's AGENTS.md and docs/codex/README.md as the entry point.
Read the full IA-AND-BACKEND-BRIEF.md, PRODUCT-CONTEXT.md,
IMPLEMENTATION-PLAN.md, EVIDENCE-RULES.md, and
DECISIONS-AND-OPEN-QUESTIONS.md before implementing.

Implement W0–W2 in an isolated feature branch: establish the baseline,
create a versioned stable-ID content contract and approved-public projection,
then build one connected investigation/pattern slice with real URLs,
useful initial HTML, legacy-link compatibility, and correct HTTP 404 behavior.
Keep the current React/TypeScript/Vite and Worker stack. Preserve existing
content and intro invariants. Make narrow, documented technical choices.

Use source-reviewed content where available. If approval is missing, use
clearly labelled fixtures excluded from production. Never invent metrics,
outcomes, evidence, or implementation status. Keep restricted content and
credentials out of public artifacts and this public repository.

Run appropriate checks and provide a reviewable implementation, preview
where available, migration ledger, decisions, test evidence, limitations,
and rollback steps. Open a draft PR. Do not stop at a plan or ask again
for routine reversible development steps. If an external input blocks a
dependent step, explain that specific blocker and continue independent work.

Prepare W3's private CMS feasibility work after the reading slice is sound,
but do not claim a working editor until the real save/reopen/preview/publish/
restore workflow has been demonstrated. Do not deploy to production,
change DNS, purchase services, or discard existing work without authorization.
```

The full brief includes a broader handoff for subsequent phases. The bounded first task above keeps initial development concrete and reviewable. W3–W6 remain future work until requested or included in an explicitly expanded task.
