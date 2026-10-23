# Inspectable assumptions: first visual slice

Scope: the first complete **Assumed → observed** component and its editorial path, before extending the system. Work is isolated on `feat/inspectable-assumptions`, starting from `f73f257`. Existing writing records, intro, public routes, graph and typography are retained. No manuscripts were imported or published.

## Reference and original translation

Inspected the [Toffu flat vector visualization reference](https://toffu.co/products/flat-vector-data-visualization-templates) and its public preview image, including fine tracks, sparse accents, aligned diagrams and generous space. The product is template artwork; none of its assets, chart values or layouts is copied into the repository. New SVG curves are generated from this component's own semantic HTML positions. No new chart dependency or font is introduced.

The visual question is whether inspectable assumptions, evidence and relationship meanings help readers understand an investigation. This is an open hypothesis, not a demonstrated comprehension result. Existing violet marks unresolved assumptions, coral marks challenges/friction and teal marks observation/learning. Shapes, words and line styles carry meaning alongside color. Geometry does not encode duration, strength, frequency or causation.

## Implemented

`src/visuals/AssumedObserved.tsx` combines semantic HTML controls and source accounts with inspectable SVG paths. Assumptions and observations keep their original order and coordinates. One click, tap, Enter or Space selects an assumption and reveals its explanation, source, relevant passage, interpretation, limitations and missing evidence without navigating away. Solid lines mean documented relationships, dashed lines mean interpretations and dotted lines mean hypotheses. A concise live status announces selection separately from the reading content. The close control and Escape return focus to the selected trigger without resetting reading position.

No motion or hover is required. On narrow screens, a simple vertical assumption track replaces the dense two-column geometry and explanations stack below. Text and controls remain full size. Without JavaScript, native disclosures expose equivalent source accounts; there are no visible dead buttons. The private SSR candidate preview uses that no-JavaScript alternative, while the review-surface proposal and local fixture hydrate the interactive component.

`src/content/assumed-observed.ts` defines a strict, versioned, data-only block. Labels and quotations have size bounds; node/connection IDs are stable; duplicate/dangling connections and documented claims with unresolved supporting evidence fail validation. Each observed item references an evidence ID. The public projection rejects private/unselected sources; page-specific payloads include only needed evidence/assets and do not embed unrelated manuscripts. Arbitrary script/component props are unsupported. Original and quoted text are escaped by React; quotation whitespace is retained.

The existing `assumption-comparison` interaction remains supported. This is an additional explicit block type, not a replacement or migration of approved content.

## Editorial integration

The local writing surface adds a structured form for labels, exact original passages, observation citations, connection endpoints, meanings, statuses, explanations, limitations and missing evidence. It edits content, not SVG or source code. Proposals are durable private records with source digest/offsets, revision, uncertainty and individual accept/reject decisions. Assumption quotations must occur in the preserved original, and observation sources must exist in the evidence ledger. A proposal cannot overwrite an unrelated prose block or another entry's identity.

Acceptance adds or revises a draft block; it does not approve publication. Pending proposals block candidate freezing. Adding a block changes the review basis, so the six passes need fresh review. Revising a previously accepted proposal leaves its old draft block in place until the revision is accepted; rejecting the revision preserves that prior block. Exact candidates and original manuscripts remain unchanged. Private proposal provenance is excluded from the renderable/public projection. Rights/source review remains a human obligation, and hosted CMS integration remains unimplemented.

## Isolated preview

```sh
npm run build:fixtures
npm run preview:fixtures -- --ip 127.0.0.1 --port 4174
```

Open `/experiments/fixture-assumed-observed/`. The route, passages, dates, assumptions and observations are explicitly synthetic, not Sam's manuscripts or real evidence. One documented contrast exists only within the fictional script; the other connections are labeled interpretations or hypotheses. No real measures, causal findings or outcomes are supplied.

The fixture is generated only into `dist-fixtures`, never the default `dist`. It is not added to the curated homepage. Production artifact auditing forbids its route/token and checks that fixture files are absent. No deployment or external publication is needed to inspect it.

For the private editor, use the existing local setup in [PRIVATE-WRITING-TRIAL.md](PRIVATE-WRITING-TRIAL.md), attach a source to a draft, then open **Propose an Assumed → observed visualization**. The authenticated workflow test uses the actual form and durable API, not an in-memory editor substitute.

## Verification criteria and observations

Automated checks cover schema/reference failures, private-source exclusion, page-specific evidence selection, stable node coordinates/scroll position, one-action keyboard/click/touch selection, closing/focus recovery,320px reflow,200% text enlargement, reduced motion, native no-JavaScript disclosures, safe source provenance, structured editing/acceptance and axe scans. Browser and viewport emulation are distinct from physical-device or assistive-technology testing.

Manual visual inspection covered the desktop and enlarged mobile fixture captures. Observed: the selected account remained alongside the fixed desktop diagram; narrow layouts retained full text and controls without horizontal clipping. These are interface observations, not human comprehension findings. No reader study, real screen-reader use, physical touch-device test or claim of WCAG conformance has occurred. The first test run caught an ambiguous region selector in the touch test; naming the intended explanation region resolved that test issue without changing interaction behavior.

The shared footer asterisk remains a native details/summary disclosure. Its expanded explanation now names the inspectable-assumptions experiment and explicitly says that improved comprehension has not been established.

## Subsequent stages (not implemented by this first slice)

1. **Follow a pattern:** derive the arc index from selected typed investigation/pattern relationships, with explicit direction/rationale and equivalent text links; do not infer it from tags.
2. **Work beneath the process:** use aligned categorical stages, source references and separate documented/observed accounts. Add durations only when approved timing evidence exists.
3. **Evidence in place:** generalize this slice's source/interpretation/limitation account and focus recovery into reusable markers. Do not hide conclusion-changing limitations behind optional disclosure.
4. **Continuous reading threads:** add a single-level related-entry preview at the passage, with relationship meaning and permanent URL. Load approved fragments on demand so unrelated bodies do not return to article bootstraps; private routes must retain authentication. Never build recursively nested panels or numbered progression.

Only the implemented block is registered. Unsupported future diagram types cannot be published by claiming they already render. The next bounded task is the explicit-relationship arc index after reviewing this first proof.

## Recovery

Generated output is disposable. Rebuild `dist` or `dist-fixtures` after failures; do not move fixture data into production to repair an empty preview. Revert this feature through review if rejected, preserving the earlier writing trial and originals. No data migration, DNS change, production deployment or publication occurred; no live rollback is required. A future real visualization needs source/rights review and exact candidate approval.
