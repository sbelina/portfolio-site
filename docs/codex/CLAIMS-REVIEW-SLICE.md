# Investigation reading and private case review — 12 November 2026

## Scope and current state

The owner supplied a complete case-page definition and asked for layered curiosity: a visitor should be able to follow, uncover and inspect the reasoning without opening every layer. This slice builds the reusable reading instruments and a restricted local working case. It does not approve a real manuscript or enable production publishing.

Branch `feat/claims-investigation-review` starts at `1a6ad28`, preserving the creative-technologist addition in draft PR #12. Production main was `7e4a640`; exact-base GitHub CI [43074510275](https://github.com/sbelina/portfolio-site/actions/runs/43074510275) passed before development. The unrelated site-copy worktree is preserved. The existing React/TypeScript/Vite/Worker stack, intro, IDs, reading formats, writing reviews and frozen archive remain.

The actual case text, source excerpts, unresolved claim ledger, local D1, backups and screenshots stay outside public Git. Public commits contain generic code and an invented lending-desk fixture. The canonical production selection remains empty, and the real case URL continues returning 404 until a trusted release loader and exact owner approval exist.

## Implemented architecture and decisions

| Concern | Implementation / boundary |
| --- | --- |
| Authored sections | Existing prose/callout blocks gain optional validated anchors. One block sequence generates the body and chapter links. Reserved template/component identifiers and duplicate anchors are rejected. |
| Workflow comparison | `src/content/case-blocks.ts` and `src/visuals/WorkflowComparison.tsx`: strict data-only variants; each stage has identity, action, actor, available information, consequence and source references. Native radio selection defaults to the after account and works without JavaScript. Both accounts are in initial HTML; print/CSS-failure paths retain both. |
| Artifact reasoning | Native disclosures show intended user, rationale, contribution, implementation and retained-value claims. Reconstruction labels and material limitations stay visible. Reconstructed text is an illustration, never an original artifact. |
| Evidence layers | Claims retain the existing epistemic/contribution vocabulary. Statement, scope, period and material limits remain visible; one optional disclosure explains how it was known and what is missing. Sources referenced only by a stage still render their actual citation and measurement definitions. |
| Payload | Page selection gathers only required support for the current entry and relevant relationships. Unrelated article bodies do not enter its payload. Full indexes remain separate. |
| Private authoring | Existing authenticated `/api/actions` adds strict `prepareInvestigation`, tied to a preserved original and stable entry ID. The server assigns restricted/draft state, authorship placeholder, dates and revisions. Workspace CAS and an expected-entry revision prevent stale replacements. Source/ID/route collisions and nonexistent references reject. |
| Editing interface | An optional advanced prepared-JSON form extends the existing studio; ordinary paragraph edits still use individual edit proposals. It is not a universal CMS or dedicated form for every workflow/claim/artifact field. |
| Preview fidelity | Draft projection now preserves investigation metadata and metric definitions. Protected preview CSS includes the adopted tokens/foundation and all relevant visuals. Native controls work in the script-free SSR preview. Public menu destinations are real; selected readings/assets and unknown private paths stay under authorization. |
| Publication | Unverified claims/artifacts cannot enter selected public case blocks. Factual claims require selected evidence; measurements require provenance; documented workflow stages require sources. These checks do not establish truth or authenticate approval. No `publicationApproved` boolean is added as authority. |

Conceptual and documented sequences remain distinct. Geometry encodes categorical order, never fabricated duration, cost or probability. Current typography/tokens and the temporary asterisk are retained; the incoming palette and mark description do not supply finalized assets.

The chapter index is a compact native disclosure. It supports optional navigation and desktop stickiness; it does not hide the narrative. The shared experiment note adds a case-reading question and distinguishes technical observations from untested curiosity/comprehension hypotheses.

The browser uses a small discriminator module rather than importing runtime schemas. The final local reading client is 30.35 kB raw / 7.66 kB gzip; this is a build measurement, not a field-performance result. A regression check keeps case-validator code off that client path.

## Evidence reconciliation

New owner-provided narrative is material for private review, not independent proof. Earlier source/evidence rules continue to govern. The private implementation separates checking opportunities from final approval/payment authorities, and labels unresolved sequence/adoption details. It does not invent a universal operational order from an ambiguous clarification.

Independently scoped observations remain separate claims with their own missing provenance. There is no calculated reduction, shared denominator, causal slope or unsupported duration badge. Continued use, later influence, adoption and measured effectiveness remain different claims. Resource identities, collaborators, source dates and publication rights are still review dependencies. No employer document or internal artifact was imported into the public repository.

The original brief and its later clarification remain in the conversation. The local intake preserves explicitly labeled source excerpts, not a falsely claimed verbatim capture of the entire brief. The working narrative is a separate adaptation. Full manuscripts supplied for other writing remain untouched.

## Verification

Executed locally on pinned Node 22 with system Chromium:

- Frozen `npm ci` passed; no dependencies were added.
- Type checks, default build, prerender and recursive production artifact audits passed.
- Full public suite: **174/174 passed**, including eight new content checks and seven new reading checks. These cover strict schemas, invalid references, unverified/measurement selection, anchor collisions, safe text, initial HTML, default-after comparison, native keyboard/touch, reduced motion, narrow enlarged text, CSS failure, source inspection, genuine 404 and payload isolation.
- After the compact chapter index, deeper source disclosure and browser-bundle refinements, **24/24 affected content/reading/archive checks passed**. Their first direct-run invocation lacked npm's executable PATH; rerunning through `npm exec` corrected that test setup.
- Existing private suite: **11/11 passed**. New isolated case suite: **4/4 passed** for source preservation, identity, pending review, collision/stale rejection, private projection fidelity and authenticated save/reopen/protected preview.
- A real synthetic Worker stop/start preserved workspace revision 28 and its digest through a fresh sign-in.
- Public and private deployment-package **dry-runs** passed. No deployment was performed.
- The real restricted case was saved through the authenticated action, reopened in a fresh session and privately backed up. Native comparisons/disclosures, five-stage desktop layout and 320px enlarged reading passed. Anonymous GET/HEAD access to pages, original and styles was denied. These are local password-session checks, not hosted identity or owner editorial approval.

Manual visual inspection covered actual private desktop/mobile captures. It exposed an oversized chapter index, which was changed to a compact disclosure. The actual case's five-stage sequence was checked separately from the four-stage public fixture. Final evidence and limitations accompany the implementation PR.

The initial full-suite run found that an archive preservation test prohibited evolving the active studio model. The immutable ledger was not edited. A byte-exact historical model copy, matching its captured hash, is now kept in `docs/design-system/provenance/studio-model-418efb7.txt`, following the existing AGENTS provenance pattern; active authoring is verified by its functional suites. Historical build bytes and writing-review records remain unchanged.

Independent read-only architecture, evidence and interaction audits preceded implementation. A separate integrated reviewer reproduced and then confirmed fixes for source-only citation visibility, authored-anchor/control collisions and private menu destinations. Agent inspection and automated axe checks are not authenticated content approval or WCAG conformance.

The final independent source review found no remaining high/medium engineering blocker to a **draft implementation PR**. It did not approve source truth, the case manuscript, hosted identity or a production release.

Unverified: real screen readers, physical devices, native browser zoom, human curiosity/comprehension, field performance, hosted SSO, remote recovery and production publication. The private preview does not create those capabilities.

## Preview and authoring

For the public-safe local demonstration:

```sh
npm run build:fixtures
npm run preview:fixtures -- --ip 127.0.0.1 --port 4174
```

Open `/investigations/fixture-checkpoint-study/`. It is explicitly synthetic and must never be deployed. Default `npm run build` excludes it.

The reading tests attach synthetic desktop/narrow captures to the Playwright report, uploaded by CI as `browser-results`. Actual private-case captures are never included in that artifact.

For private authoring, follow [the local writing trial](PRIVATE-WRITING-TRIAL.md). Preserve the original, then use **Advanced: prepare an investigation draft** for a prepared record; use the existing individual text-edit forms thereafter. Keep source references in the private workspace, retain IDs and use the displayed expected entry revision. Saving neither reviews nor approves. The new case suite has its own synthetic D1 directory and runs sequentially with `npm run test:studio:cases`; it never resets an owner's database.

The actual case's working files and self-contained review export are handed to the owner through private workspace links, not public fixture URLs or GitHub assets. They are local working copies, not remotely managed backups. The server remains loopback-only; do not tunnel it as a hosted editor.

## Recovery and next slice

No database schema migration is required. Export private source/workspace data before reverting code that predates the new block types, because older strict validators cannot read them. Restore entries as new restricted revisions; keep prior frozen candidates and originals. Revert the feature commits through review, rebuild disposable artifacts, and retain all frozen build bytes. Public content selection, DNS, credentials and deployed main are unchanged.

Next bounded task: resolve the remaining source/sequence/rights questions on the private case, refine the exact text and resource identities, then prepare and inspect a candidate. Dedicated field forms can replace the advanced JSON bridge incrementally. The optional defect inspector, richer information-flow overlay, original social image and a production release loader remain separate work; do not imply they shipped. No canonical next-case link is created until its target exists and is selected.
