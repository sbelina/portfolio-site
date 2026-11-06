# Working on Producing Curiosity

Producing Curiosity is Sami Belina's applied human systems research and strategy portfolio and field journal. **Test → Show → Enable** is the professional practice; **Related. Not equivalent.** is the intellectual signature; **How I Know** is the evidence commitment. Help visitors understand the questions, evidence, decisions, contributions, and limits behind the work.

## Start here

Read [the Codex context index](docs/codex/README.md), then the documents relevant to the requested task. For page architecture or content editing, read the full [IA and backend brief](docs/codex/IA-AND-BACKEND-BRIEF.md), [product context](docs/codex/PRODUCT-CONTEXT.md), and [implementation plan](docs/codex/IMPLEMENTATION-PLAN.md).

The owner adopted the new [design-system blueprint](docs/design-system/BLUEPRINT.md) on 6 November 2026. Read its [adoption and implementation record](docs/design-system/ADOPTION.md), [architecture](docs/design-system/DESIGN_SYSTEM_ARCHITECTURE.md), and relevant [content](docs/design-system/CONTENT_CONTRACT.md) or [interaction contracts](docs/design-system/INTERACTION_CONTRACTS.md). The new presentation replaces the previous edition; keep the historical archive immutable. Existing evidence, authentication, stable IDs/revisions, accessibility and publication safeguards remain in force. The incoming illustrative schema does not replace the implemented model.

Distinguish implemented behavior from proposals. This documentation package does not install routing, a CMS, a database, or a new publishing workflow. The current user task determines which implementation phase is authorized. A later explicit request to implement a phase authorizes its necessary reversible development and testing; do not ask again for every routine step.

## Work carefully and keep moving

- Inspect the actual branch, git status, applicable nested instructions, dependencies, CI, and deployment configuration. Preserve unrelated changes. Work in a feature branch and make reviewable changes. Do not push to main, merge, deploy to production, change DNS, or purchase services unless authorized.
- Read `DEPLOY.md`, `docs/AUDIT.md`, and `docs/RELEASE.md` before deployment work. Audit findings are dated observations, not proof of current production behavior. Recheck relevant live behavior before diagnosing it.
- Preserve existing features and content. Reconcile a separately supplied Emergent version before replacing its functionality. If that source is unavailable, record the specific parity gap and continue independent work in isolation.
- Prefer the existing React/TypeScript/Vite and Worker stack. No unrelated framework rewrite, graph database, vector database, AI runtime, or custom CMS before the first publishing slice proves a need.
- Follow the explicit current user request over older proposal language. Make ordinary implementation choices, document material tradeoffs, and ask only when missing information blocks dependent work.

## Editorial integrity

- Separate facts, observations, interpretations, recommendations, implemented changes, and measured outcomes. Preserve authorship and contribution credit. Never invent sources, metrics, causal claims, or results.
- Prototype copy and existing data are not blanket publication approval. See [evidence rules](docs/codex/EVIDENCE-RULES.md). AI suggestions remain proposals until owner review; do not let an assistant approve its own relationships or publication.
- Keep source material and portable content independent of presentation. Use immutable IDs, editable slugs with aliases, explicit typed relationships, runtime validation, and versioned content.
- Keep draft readiness separate from what is actually deployed. Editing live material creates a draft while the selected approved version remains live.

## Interface and accessibility

- Use the adopted paper/ink/orange scientific/editorial direction for the current edition. Keep semantic violet/unresolved, coral/friction, teal/learning distinct from orange emphasis; recalculate contrast for each surface and pair color with labels or shape. Final asterisk artwork is owner-supplied and pending; a typographic asterisk is a temporary placeholder, not a finalized logo. Candidate fonts require verified files/licenses before use.
- The current edition has direct, static reading and no mandatory intro. Preserve the archived intro and its invariants in `docs/INTRO-STATES.md`: one deliberate interaction per authored step (three actions total), automatic final dive, skip/replay, keyboard/touch, reduced motion, recovery and direct content access. Do not mutate frozen archived bytes to update its historic design or wording.
- Use links for navigation and buttons for actions. Support direct loads, refresh, modified clicks, meaningful focus, Back scroll restoration, and useful reading without graph interaction.
- Give important graph relationships equivalent text navigation. Do not turn directed relationships into undirected claims. Test keyboard use, screen-reader behavior, zoom/reflow, and reduced motion; report manual and automated checks separately. Automated checks alone do not establish WCAG conformance.

## Publication boundaries

- Keep restricted drafts and originals in private storage. Public output contains only selected approved content and rights-cleared derivatives. Do not commit private case evidence, credentials, or sensitive employer material to this public repository, PRs, logs, screenshots, or bundles.
- Do not place repository-write tokens or service secrets in browser code or Vite public environment variables. Preview pages and their assets require real authorization; hidden links and noindex do not provide privacy.
- A publishing workflow must bind owner approval to exact content/application revisions and assets. Validate the public projection, serialize deployment, and keep the prior healthy release on failure. Content fields and workflow payload assertions are not authorization.

## Development experiment

Follow [the development experiment](docs/codex/DEVELOPMENT-EXPERIMENT.md) when testing new methods. Define the question and acceptance conditions before building; load relevant context progressively; preserve correction provenance; distinguish human observations from simulations and automated checks. Record actual results and limitations. Update the shared footer experiment statement when verified capabilities change.

Apply [Systems Inquiry Orchestrator v2](docs/codex/SYSTEMS-INQUIRY.md) as additive inquiry guidance: **Notice → Frame → Model → Test → Interrogate → Revise**. Investigate both the system producing behavior and the frames producing its explanation. Ask **“What way of looking at this makes it appear true?”** of the subject matter and of your own development decisions. The loop is a reasoning and review method, not compulsory interface steps. The charter adds no feature, content, or release authorization; existing architecture, evidence, accessibility, and publication rules continue to govern. Start new frame/model work with [the capability assessment](docs/codex/SYSTEMS-INQUIRY-ASSESSMENT.md).

## Verification and reporting

Use the repository-pinned Node version and lockfile. For runtime changes, the current checks are `npm ci`, `npm run build`, `npm run check:deploy`, and `npm test`; inspect the current scripts and CI before running. Install required Playwright browsers using the repository's documented procedure. Never disable TLS or dependency integrity checks to make installation pass.

For documentation-only changes, validate paths, internal links, fences, factual claims, and scope; a full application test run is unnecessary unless the edit affects execution. Add focused tests for meaningful changed behavior. Inspect production artifacts, not only the dev server. State exactly what ran, what passed, what remains unverified, and how to roll back material changes.

## Current owner positioning — 6 November 2026

Use **Sami Belina**. The single professional practice is **Test. Show. Enable.** This supersedes earlier public triads and presentation. Lead with **“I investigate situations where outcomes are visible, but the explanations behind them remain unclear.”** Return useful knowledge to affected people, communities and decision-makers. Keep the separate Systems Inquiry reasoning loop; neither it nor the three professional moves is an interaction gate. Latest evidence corrections in EVIDENCE-RULES.md govern older shorthand. Design adoption is not publication approval for case manuscripts, metrics, assets or inferred relationships.

## Bounded specialist collaboration

Use independent read-only specialists for architecture, evidence and interaction audits before substantial design work; the parent integrates. [Agent orchestration](docs/design-system/AGENT_ORCHESTRATION.md) and `.codex/agents/` define bounded roles. Preserve existing writing-review records, six-pass workflow and private studio. Assign one owner per edit surface. Role restrictions are instructions, not sandbox enforcement; validate client configuration before claiming registered agents or concurrency controls work. Agent review is not authenticated owner approval or deployment authorization.
