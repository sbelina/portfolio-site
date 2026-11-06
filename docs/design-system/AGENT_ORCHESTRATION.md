# Codex Orchestration — Investigate / Construct / Interrogate / Release

## Why these roles exist
This is a research portfolio, not a high-volume feature factory. Agent architecture follows **epistemic failure modes**, not just engineering job titles. The central hazards are: false or exaggerated evidence, visually misleading charts, novel controls with no user benefit, decorative identity drift, private source disclosure, and publishing without author approval.

The parent Codex session is the **integrator**: it owns sequencing, file integration, user communication, and explicit approval requests. Custom agents are bounded specialists that return auditable deliverables. An agent being named a "reviewer" is not a technical permission boundary: subagents inherit the parent's sandbox settings. Use separate review branches, restricted environments, or deterministic CI where actual enforcement is needed.

## Agent lineup and contracts
| Role | Primary question | Authority | Expected output |
|---|---|---|---|
| **systems_cartographer** | What is the actual code/content architecture and how are pieces dependent? | Read-only; map, no edits | repo map, actual commands, dependencies, unknowns, file ownership suggestions |
| **interaction_scientist** | What task and known human-system behavior justify this interaction? | Design review; no unsupported novel pattern approvals | interaction contract, baseline alternative, standards, validation plan |
| **epistemic_auditor** | What is supported, ambiguous, overstated, or conflated? | Blocking recommendation on unsupported claims; no published copy edits | claim/evidence ledger, missing provenance, causal boundary, counterclaim |
| **identity_geometer** | Does graphic geometry reflect the custom asterisk and remain recognizable? | Propose mark/vector/tokens in isolated assets only after owner review | silhouettes, optical test plan, responsive geometry, rationale, possible collisions |
| **narrative_editor** | Does a reader understand the investigator's judgment quickly? | Draft only; never invent achievements, wording approval by author | narrative outline, copy diffs, skim test, missing authorship clarity |
| **semantic_cartographer** | Are relationships typed, justified, and distinguishable from equivalence? | Schemas + relationship proposals, not automatic publication | typed model, edges with evidence and limits, text alternatives |
| **interface_builder** | Can the approved specs become resilient native UI? | Scoped code edits, only assigned files | implementation, tests, screenshots, deviations |
| **accessibility_adversary** | Who could fail this interaction in keyboard, zoom, motion-off, assistive modes? | Read-only audit; high-severity block | reproduction steps, WCAG mapping, severity, suggested fix |
| **perception_researcher** | What will visitors likely notice, misunderstand, or overload? | Hypotheses + human test plan only, not real user validation | attention hierarchy risks, competing explanations, test tasks |
| **release_steward** | Is publication accurate, approved, private-safe, and reversible? | Block or request approval; never deploy | release checklist, privacy scan findings, go/no-go recommendation |

## Decision rights and interlocks
- **Human author** alone approves claims, employer-sensitive content, final logo geometry, major identity changes, novel high-impact public interactions, and publication/deployment.
- **Parent integrator** owns the architecture and merges work *only within an approved change scope*; it cannot overrule content/publication approval.
- **epistemic_auditor** can recommend a hard stop on unverifiable public claims.
- **accessibility_adversary** can recommend a hard stop on critical barriers; it must cite observable failures rather than opinion.
- **release_steward** must not declare a release ready if human approvals or deterministic checks are missing.
- **interface_builder** may not reinterpret content to make the UI more persuasive.

## Execution process
**Gate A — Reconnaissance.** `systems_cartographer` maps HEAD, framework, commands and existing spec. In parallel, `epistemic_auditor` inventories public claims and `interaction_scientist` inventories controls. Report gaps, don't edit.

**Gate B — Contract.** Integrator produces an implementation proposal with input, output, success criteria, impacted files, test plan, risk, user approval needed. `narrative_editor`, `semantic_cartographer`, and `identity_geometer` are consulted only for the specific changes in their domain.

**Gate C — Build.** One `interface_builder` owns the edit surface. Independent agents may draft tests or scrutinize contracts in parallel but should not edit the same files concurrently. Work in review branch/worktree.

**Gate D — Falsify.** `accessibility_adversary`, `epistemic_auditor`, and `perception_researcher` inspect the result *independently* and report defects, not reassuring generalities. Integrator resolves with smallest reversible fixes.

**Gate E — Author review / release.** `release_steward` runs validation and checks explicit approvals. It can prepare a release candidate but never self-publish, merge to protected branch or deploy.

## Deliberate tension: creative + skeptical pairs
- **identity_geometer × accessibility_adversary:** expressive logo/visual hierarchy must withstand 16px, monochrome, forced colors, zoom.
- **interaction_scientist × perception_researcher:** prior science supplies expectation; observed task study decides fit. No synthetic-user results.
- **narrative_editor × epistemic_auditor:** impact must be legible without inflated causality.
- **semantic_cartographer × epistemic_auditor:** a relationship must not be smuggled into equivalence or causality.
- **interface_builder × release_steward:** working is not the same as authorized for production.

## Special agent: "counterexample pass"
When a proposed element looks especially compelling, ask the skeptic pool to generate *three plausible failure modes* and *one boring baseline* that serves the same task. For example, compare a 38-to-8 animated cluster to a static annotated grouping table. The prototype survives only if it demonstrates a distinct benefit. This counterexample pass is an operational step, not a new persistent agent.

## Parallelism economics
Use 2–3 read-heavy specialists in parallel when their output is independent. Keep dependent design/implementation ordered. Start with the parent, 3 priority reviewers, and one builder; register specialized agents but activate only when needed. Current Codex supports project `.codex/agents/*.toml` with `name`, `description`, `developer_instructions`; it also supports repo `AGENTS.md`, reusable `.agents/skills`, and subagents. Check current client behavior before changing global settings.

## Minimum agent report format
```
Goal:
Scope inspected / changed:
Facts verified (file paths / evidence):
Assumptions and unknowns:
Risks / failure modes:
Recommendation and why:
Tests executed and results:
Decision needed from owner:
```

## Anti-patterns
- All agents implement in the same component file.
- A "chief creativity officer" changes established UI behavior based on style alone.
- A "user simulator" produces fake usability findings.
- Any agent infers missing confidential source material or writes fictional metrics.
- A design-review agent certifies WCAG AA solely from screenshots.
- A content generator silently converts analytical categories into validated user needs.
- A site agent automatically crawls personal accounts or publishes everything it can access.

## Additional specialist roles
- **visual_system_architect:** owns type/color/grid/material/motion system research, token prototypes and specimen coherence; advises builder and identity geometer.
- **privacy_warden:** read-heavy audit of confidential material, source permissions and compiled public artifacts; separate from release stewardship because content privacy needs a specialist challenge.

These roles are registered for scoped invocation, not expected to run in every task.
