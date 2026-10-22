# Decisions, assumptions, and open questions

Status as of the documentation handoff: proposed target architecture; no new backend or routing installed.

## Recommendations to carry forward

| Recommendation | Reason | Implementation consequence |
| --- | --- | --- |
| Curated Home; durable investigation/pattern pages | Clear entry and independently shareable work. | Generate routes from content. |
| Investigations / Patterns / Perspective / About | Reflects the selected editorial direction. | Test labels; avoid empty nav destinations. |
| Stable content IDs; editable slugs | Renaming does not break relationships. | Unique alias ownership and migration manifest. |
| Explicit relationships with rationales | Makes connections inspectable. | One canonical relation collection, derived backlinks. |
| Git-backed private authoring trial first | Fits existing ownership and portable files. | Prove owner workflow before CMS adoption. |
| Static approved public projection | Strong privacy boundary and resilient reading. | Do not ship private source data and filter in-browser. |
| Exact candidate approval | Separates saved drafts from a trustworthy release. | Bind content/application/assets; serialize deploys. |
| Keep current stack | Avoid unrelated migration cost. | Narrow routing/prerender decision with compatibility checks. |
| Optional graph and visual enhancements | Keeps content independently usable. | Equivalent text navigation; progressive loading. |

These are not evidence that a CMS, router, or infrastructure service is already adopted. Current user instructions may authorize implementation of a subset or revise a recommendation.

## Choices Codex can investigate without blocking the owner

- Which minimal routing/prerender integration fits the pinned React/Vite toolchain? Prototype the smallest working route and record the tradeoff.
- Which collection page size and module ordering suit actual content? Start with a reasonable baseline and test.
- Which existing data fields map cleanly to the versioned schema? Create an adapter and expose ambiguities.
- Which CI checks are needed for each new failure mode? Extend the existing setup rather than replacing it wholesale.
- Which secondary pages have enough public content to justify launch? Omit empty navigation items.

## Dependencies requiring owner or external information at the relevant phase

| Missing input | Blocks | Work that can continue |
| --- | --- | --- |
| Latest source/feature export from another version | Final parity sign-off and replacement of those features. | Baseline inventory, schema, isolated templates. |
| Approved case wording, metric sources, rights | Public migration of those claims/assets. | Templates with excluded fixtures; validation tooling. |
| Private repository/editor access | Actual CMS integration and author trial. | Schema, configuration draft, local proof, test harness. |
| Owner auth and protected preview mechanism | Private hosted draft preview. | Public-safe preview of approved material; controlled local preview. |
| Production credentials and release authorization | Production deployment. | Branch implementation, builds, tests, draft PR, rollback plan. |
| CMS service fit / required workflow protections | Adoption of that service for production. | Feasibility evaluation and a documented fallback comparison. |
| Keyboard hypothesis/input method | That experiment's implementation. | Core website publishing and research preparation. |

Ask for the smallest missing input only when the dependent step is reached. Do not ask the owner to choose technical options that an isolated proof can resolve. Do not treat elapsed time or missing credentials as approval.

## Architectural refinements relative to older proposals

- Editorial readiness and deployment status are separate. A live entry may have a newer draft. Releases select exact approved revisions.
- “Pagination” is split into page architecture, collection pagination, and temporary interaction state.
- Public reading routes should arrive as useful HTML, not merely route to an empty client application shell.
- Historic fragment compatibility is client-side because HTTP does not receive URL fragments; old path aliases can redirect at the server.
- The root `AGENTS.md` supplies active working guidance. `../AGENTS-PROPOSAL.md` is retained as historical context.

Record material future decisions with context, selected option, alternatives, consequences, verification, and date. Avoid copying full specifications into multiple files; use the context index to keep one canonical detailed brief.
