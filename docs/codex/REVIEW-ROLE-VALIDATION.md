# Review responsibilities: validation and reusable rubric

Owner requested research, testing and validation before role development on 28 October 2026.
Preimplementation source basis: `d2a305d8ba3f4eeb6a9aea867c057f722f8dd84d`.
This record supports improvements inside the existing six review passes; it does not add an autonomous agent, authenticated approval or publication authority.

## Question, protocol and decision rule

Question: can stronger existing review instructions expose uncovered public copy, source uncertainty and reading defects without pretending to authorize release?
Alternative: another persistent agent/service is necessary. No observed result establishes that need.
The protocol was written before the trials and separated these acceptance cases:

1. Distinguish a restricted draft excluded from public output from the same information entering legacy HTML/JS.
2. Bind review evidence to declared source/artifact paths and bytes, routes and revisions; changes invalidate earlier evidence.
3. Keep missing source support/rights unresolved and distinguish payload assertions from trusted authorization.
4. Compare clean reading controls with deliberately reversed relationship and forced-motion mutants.
5. Preserve no-JavaScript reading, native keyboard disclosure and narrow enlarged text.
6. Record false confidence, unknown coverage and human-review gaps as well as successful controls.

GO requires the narrow procedures to distinguish their known controls and preserve their limitations.
No technical pass can establish factual truth, reader comprehension, complete privacy discovery or an owner's identity.
The retained proof scripts below are research harnesses, not CI/release gates. No real approvals or private manuscripts were used.

## Actual-code editorial desk trial

The [desk trial](review-validation/editorial-desk-trial.ts) imported the actual model/projection/intake functions and inspected the existing source/build.
Eight observations were recorded; harness assertions passed. Synthetic decisions supplied to pure functions were explicitly unauthenticated.

| Case | Observed current behavior | Review consequence |
| --- | --- | --- |
| Changed legacy homepage | Current `src/data.ts` differed from the baseline and its summary appeared in default HTML with zero selected canonical entries. | Empty canonical selection cannot approve or protect legacy copy. Inventory the whole homepage diff. |
| Restricted draft excluded | An unselected synthetic restricted canary was absent from the projection. | Absence is a clean control; inspect independent render paths too. |
| Declared rights pending | Selected evidence with unresolved rights/redaction rejected. | Mechanical status checks work for records actually supplied. |
| Source support absent | Structurally valid synthetic factual prose with no evidence references projected. | Semantic source completeness remains an editorial judgment. |
| Stale content decision | Changing selected text after its digest rejected. | Review evidence must bind exact wording. |
| Stale application selection | Changing the manifest application revision rejected against the prior decision digest. | Content-only review cannot cover a changed application candidate. |
| Forged pure-function identity | A format-valid synthetic `approvedBy` assertion was mechanically accepted from the caller. | The compiler explicitly trusts its caller; this is not authenticated approval or a demonstrated endpoint bypass. |
| Existing six passes | Intake prepared six pending suggestions, each disclaiming completed factual review. | Labels/prompts are assistance; acceptance requires an actual review decision. |

Source anchors: `src/content/projection.ts` documents its trusted-caller boundary; `studio/worker.tsx` checks local session, Origin and CSRF and supplies configured owner identity.
The latter was source-inspected in this trial, not newly endpoint-tested. Local candidates remain unpublished and release-ineligible.

## Synthetic integrity experiment and editorial challenge

The [release proof](review-validation/release-proof.mjs) passed **18 in-memory integrity assertions**, independently rerun by the integration lead on Node 22.23.4.
Cases covered excluded versus exposed canaries; changed/added/deleted artifacts and routes; source bytes/revision; unresolved rights declarations; missing/forged/replayed decisions; exact binding and ordering.
Its opaque Symbol/Map decision transport is a test double. Every report remains `AUTHORIZATION_UNVERIFIED` and `releaseEligible:false`.

Independent editorial critique then produced **four known-limitation observations**: all passed mechanically despite being unsupported/unsafe by the experiment's declared meaning.

- An additional factual assertion was absent from the declared claim registry.
- A comparison used incompatible synthetic denominators/periods despite declared cleared rights.
- A base64-encoded canary escaped the exact-byte scan.
- A synthetic paraphrase assigned restricted meaning by the test author escaped that scan.

These are four confirmed blind spots, not four successful editorial/privacy controls.
Inventories and rights declarations were supplied; no independent filesystem enumeration, trusted builder, full dependency capture, signature verification, revocation or deployment race/TOCTOU protection was demonstrated.
A fresh digest and test-double decision can bind a misleading assertion exactly without making it supported or authorized.

## Experience trial: clean controls and known mutants

The [experience proof](review-validation/experience-proof.mjs) exercised the existing production-safe artifact through a separate local Worker on `127.0.0.1:4193`.
It recorded **nine cases: seven clean controls passed and two deliberately injected mutants were detected**.

| Cases | Observation and scope |
| --- | --- |
| Two clean relationship selections | Selecting either endpoint retained the same declared source → verb → target statement. Public conceptual labels were normalized to synthetic labels. |
| Reversed-statement mutant | An isolated DOM/accessible-label reversal was detected against the supplied invariant. No empirical relation was verified. |
| Clean reduced-motion handler | Requested/applied `instant`; the jump stayed stable across 35 sampled animation frames. |
| Forced-smooth mutant | An isolated API wrapper forced `smooth`; changing positions were detected under emulated reduced motion. |
| Native keyboard disclosure | Without JavaScript, Enter opened and Space closed; the trigger retained focus. |
| Static reading | Initial thesis and directed statement remained in the DOM without JavaScript. |
| Two narrow/enlarged conditions | Static and enhanced selected/expanded content had no page-level overflow at 320px with 200% CSS text enlargement and spacing. |

This tiny supplied corpus had no observed clean-control false positive or known-mutant miss; it cannot estimate general precision/recall.
One relation, handler and disclosure do not cover every route, edge or template. The invariant could itself be wrong; 35 frames can miss delayed motion.
Programmatic graph activation and Chromium emulation are not physical-device, native-toolbar zoom, real-screen-reader or vestibular-user evidence.
The specialist inspected the enlarged screenshot; the remaining findings were browser automation or source review, not human comprehension research.
Artifact hashes recorded the existing 23-file set; that did not independently rebuild or attest it from the source commit.

## Reusable responsibilities within the six passes

**Evidence Reviewer:** identify factual/causal/interpretive claims; record source support, reporter/date, contribution split, metric units/denominator/window, rights and limitations. Missing evidence stays unresolved. Rights clearance is not factual validation.

**Experience Reviewer:** declare the intended relationship/state invariant before testing; compare both endpoints/directions, keyboard/focus, motion preference, no-JavaScript reading, candidate links and narrow enlarged text. Use a clean control and isolated mutation when useful; label instrumentation and supplied-oracle limits.

**Release Checker:** enumerate actual publication surfaces, including legacy JSX/data, metadata, HTML/JS/JSON, graph, routes and assets. Name the inspected source/artifact basis, declared inventory omissions, unresolved rights, exact decision scope and trusted authorization dependency. An empty projection does not guard other renderers.

**Model Challenger**, inside these reviews: what makes this explanation appear true? Could a proxy, supplied oracle, cleared-rights flag, green test or pass label hide an unsupported inference? What alternative or excluded actor would change the decision?

Each review outputs: exact basis; question/action; observed evidence and method; finding severity/file/reproduction; missing support/uncertainty; proposed correction; owner decision still required. Backlinks preserve navigation without reversing causal assertions.
The existing Manuscript Intake, Editorial Reader and Connection Curator retain their responsibilities. No seventh pass or self-approval is introduced.

## Decision, reproduction and primary references

**GO:** linked rubrics and stronger prepared prompts for future Evidence/Experience/Release reviews, preserving saved originals, decisions and six-pass order.
**NO-GO:** new persistent agent, autonomous truth/rights verifier, production gate, hosted authentication or publisher. Those require separate evidence/contracts and authorization.
After that decision, the integration lead changed only the three future-intake suggestions in `studio/model.ts`, retained these research scripts and linked this rubric. Existing saved reviews are not migrated; the six pass identities/order, schemas and approval operations are unchanged.

Root reproduced the portable scripts on Node 22.23.4: **18 integrity assertions**, **four known blind spots**, **eight actual-code observations** and **nine browser cases** (including both detected mutants). These are distinct trials, not one combined product-test count. The local studio suite passed **11/11**, including a new preservation regression plus existing stale-review/exact-candidate and unpublished-approval coverage. The new case checks that a second intake leaves the earlier workspace/original/reviews/store/candidates unchanged, creates six pending reviews with no approval basis, and cannot freeze an incomplete candidate. No public runtime changed; the earlier 119-test public run is not claimed as a fresh run for this documentation/prompt change.

Private TypeScript/UI build through the studio suite, studio Worker packaging dry-run, public artifact audit (23 files), four-document link/fence/whitespace validation and diff checks passed. The architecture specialist independently source-reviewed the integration and checked JavaScript harness syntax; its GO applies only to the bounded assistance scope. No new human reader, physical-device or real assistive-technology evaluation occurred.

Recovery: revert the three suggestion strings and remove the linked rubric/research harnesses if rejected. No schema, saved-content or database migration is involved. Do not rewrite saved reviews or treat the experimental scripts as deployment enforcement.

Use repository Node 22 and installed dependencies; scripts make synthetic observations only:

```sh
npm run build
node docs/codex/review-validation/release-proof.mjs
node docs/codex/review-validation/release-proof.mjs --challenge
npx tsx docs/codex/review-validation/editorial-desk-trial.ts
node docs/codex/review-validation/experience-proof.mjs
```

For the experience command, first run `npx wrangler dev --local --ip 127.0.0.1 --port 4193 --persist-to /tmp/pc-review-worker` in a separate terminal.
It defaults `PC_REVIEW_ORIGIN` to `http://127.0.0.1:4193` and rejects other hosts/protocols; `PC_REVIEW_EVIDENCE_DIR` defaults to `/tmp/pc-experience-proof-replay`.
Use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium` in this environment. Never target production or a private manuscript preview; stop only the proof Worker afterward.
Retained portable-script reruns are separate from the preimplementation observations above.

Primary documentation retrieved over verified HTTPS on 28 October 2026:

- [OWASP authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): deny by default; check permissions on every request. Review reports cannot supply identity or authorization.
- [GitHub reviewing deployments](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-deployments/reviewing-deployments): actual environment-job review and optional self-approval prevention; no claim those protections are configured here.
- [SLSA 1.1 provenance](https://slsa.dev/spec/v1.1/provenance) and [Node hashing](https://nodejs.org/api/crypto.html#cryptocreatehashalgorithm-options): artifact digest differs from trusted builder/source provenance; a hash alone authenticates nobody.
- [W3C animation from interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) and [MDN scrollIntoView](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView): actual motion behavior matters; SC 2.3.3 is Level AAA, not a conformance result here.
- [W3C disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) and [Playwright network](https://playwright.dev/docs/network): keyboard disclosure expectations and isolated browser modification methods. The trial used native disclosure and DOM/API mutations.
