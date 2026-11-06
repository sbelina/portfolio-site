# Scoped implementation and approval plan

## Phase 0 — Verify actual starting state (read-only)
Owner: parent + systems_cartographer + epistemic_auditor + interaction_scientist.
Deliverable: real repo inventory, code/tests/deploy history, data exposure risks, surviving functionality, protected decisions, open design decisions, chosen path for the clean-slate site.
Gate resolved by owner instruction on 6 November: continue sbelina/portfolio-site on a separate review branch, retain React/TypeScript/Vite/Worker and immutable archive, replace current presentation. No clean-slate framework initialization.

## Phase 1 — Foundation specimen
Define alias/semantic tokens, both surface treatments, type specimen, asterisk geometry studies (do not finalize without author), spacing/grid, responsive breakpoints, minimal button/link/disclosure components, `/system` specimen.
Gate: images/screenshots in desktop/mobile, font legibility, contrast results, asterisk at 16px, tests for focus/reduced-motion.

## Phase 2 — One complete vertical slice
Build a real Claims investigation using verified, approved content and allowed sources. Home short journey to Claims, original assumption vs evidence/interpretation, authorship, decision, limitations and accessible diagram/text. Include quantities or trade-offs only when their independent source, scope and wording are approved; no required rework-rate or waiting-time field. No invented stats. Add native navigation and durable route.
Gate: epistemic_auditor and accessibility_adversary report findings; neither authenticates approval. The owner approves exact words, figures, relationships and assets through the trusted candidate contract. No real canonical manuscript is currently approved.

## Phase 3 — Knowledge model and pattern index
Typed schema for investigations, source refs, claims, relationships. Public compiler and privacy safeguards. Investigations index and a curated Patterns page with typed, documented connections and text equivalents. No AI-generated graph edges automatically published.
Gate: build fails on unapproved/public mix or unresolved source; URLs load and back/forward works.

## Phase 4 — Additional investigations and public value
Add Trust, AI grouping, Snapshot, accessibility experiment and other verified studies incrementally as evidence allows. Refine About / practice. Feature visual diversity with common evidence grammar. Field Notes optional.
Gate: claims traceability and consistency across case studies; mobile/desktop reading and skim usability evaluation.

## Phase 5 — Controlled research lab
Prototype asterisk source notes, comparisons, or graph-enhanced discovery *one at a time*. Each comes with task/comparator, hypothesis, expected gain, failure modes, test plan. Collect human evidence before replacing baseline. Experimental features isolated.
Gate: measured task improvement or clear user-validated explanatory benefit; otherwise retain baseline.

## Phase 6 — Release candidate
Complete privacy audit, contrast, WCAG 2.2 AA testing, manual keyboard and screen reader sampling, performance budgets, broken links, metadata, backup/rollback, author editorial review. Release_steward can prepare release candidate, not deploy. Explicit human authorization to ship.

## Objective completion tests
- Direct hiring-manager route yields clear research value and 2–3 evidence-rich case studies.
- Each case separates assumed/observed/inferred/changed and tells what the author controlled.
- Optional experimentation never blocks essential tasks.
- Charts do not overclaim; source and limitation accessible.
- Main site works without optional canvas/SVG animations and in reduced motion.
- No private records or claims leak into build artifacts.

## Example independent tests
- Run `npx tsc --noEmit` if TypeScript configured, `npm test` where available, build command from inspected `package.json`; never fabricate passing results.
- Playwright: homepage → case → evidence → browser back; keyboard-only; 320px width; 200% zoom; reduced motion; static graph-off; focus order.
- axe: automated critical detection plus manual checks; automated passes do not imply entire conformance.
- Claim fixture intentionally has an unpublished numeric claim — compiler should fail; unpublished source URL should not appear in generated bundles.
- Verify actual fonts license and appearance in target browser before final token lock.

## Decision backlog
| ID | Decision | State | Owner |
|---|---|---|---|
| DS-01 | Asterisk is primary logo | LOCKED | Human |
| DS-02 | Exact asterisk geometry | PROVISIONAL | Human + identity_geometer |
| DS-03 | Geom / Elms Sans / IBM Plex Mono | PROVISIONAL | Human + visual engineer |
| DS-04 | Paper/ink/orange primary color roles | PROVISIONAL | Human + accessibility reviewer |
| DS-05 | Native navigation and readable pages | LOCKED | Human + interaction scientist |
| DS-06 | Every interactive element has explicit contract | LOCKED | Human + interaction scientist |
| DS-07 | Verified claims/relations + human publish gate | LOCKED | Human + epistemic auditor |
| DS-08 | Relationship graph as optional representation | EXPERIMENTAL | Human + semantic_cartographer |
| DS-09 | "Read/Inspect" mode | NEEDS EVIDENCE | Human + perception researcher |
| DS-10 | Generative geometric art | EXPERIMENTAL | Human + identity_geometer |
| DS-11 | Clean-slate repo architecture | RESOLVED: retain existing architecture and archive | Human + parent |
