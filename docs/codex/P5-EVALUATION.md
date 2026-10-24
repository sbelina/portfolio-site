# Optional creative coding: p5.js evaluation

Creative-technologist assessment, 23 October 2026. Integration lead implements and verifies the release; this assessment is not publication approval. Starting production branch: `main` at `0fb948124a5f02455818f10bbbdc53d2fafbe6b4`. The separate `feat/inspectable-assumptions` branch at `75b2820` contains unpublished reading and private-writing work; it is deliberately not a dependency of this experiment.

## Decision and question

Use p5.js as an optional, client-only drawing adapter for one isolated **Reveal the hidden work** experiment. Keep all labels, reading, evidence, navigation and controls in semantic HTML and SVG. The experiment asks: **What becomes visible when the work beneath a simplified process is revealed without erasing the original view?** A related reader question is whether inspectable assumptions, evidence and relationships help people understand how Sam investigates systems. Neither question has a demonstrated comprehension result.

The release is a clearly labeled illustrative sequence, not an investigation finding, measured process, approved manuscript or simulation calibrated against evidence. Do not reuse unapproved claims from the existing portfolio as evidence. Use categorical positions, never line lengths that imply measured duration. If documented relationships are added later, require their actual source, meaning, limitation and review status; do not infer causal relationships from adjacency.

## Technology fit and primary-source inspection

Inspected the upstream `p5` package metadata and tagged implementation on 23 October 2026:

- [`p5@1.11.13` package](https://www.npmjs.com/package/p5/v/1.11.13) and [tagged core source](https://github.com/processing/p5.js/blob/v1.11.13/src/core/main.js): constructor instance mode attaches one sketch to a supplied element; `remove()` stops its loop, cancels its animation frame and removes its DOM/event listeners.
- [Tagged loop-control source](https://github.com/processing/p5.js/blob/v1.11.13/src/core/structure.js): `noLoop()` stops repeated drawing; `redraw()` supports a requested static frame; `loop()` resumes drawing. The application must still own offscreen/document visibility and user pause policy.
- [Official `noLoop` reference](https://p5js.org/reference/p5/noLoop/) and [`remove` reference](https://p5js.org/reference/p5/remove/): public API behavior verified against the source above.
- [`p5@2.3.4` tagged package](https://github.com/processing/p5.js/blob/v2.3.4/package.json) and [`core/main.js`](https://github.com/processing/p5.js/blob/v2.3.4/src/core/main.js): latest major provides ESM, types and modular exports. The distributed core still transitively imports renderer/image/WebGL infrastructure, so a much smaller shipped chunk cannot be assumed from the word “modular.”
- [LGPL2.1 license](https://github.com/processing/p5.js/blob/v1.11.13/license.txt): preserve attribution and license, identify the exact unmodified upstream source and keep the library replaceable as a separately loaded dependency. This is a dependency notice, not a claim of legal review.

Recommend **exactly pinned `p5@1.11.13`** for this bounded 2D adapter: latest inspected 1.x patch, straightforward instance-mode lifecycle, no WebGL features needed. Reevaluate 2.x when an actual requirement or measured bundle/runtime benefit warrants the migration. Pin matching TypeScript declarations if required; keep p5-specific types inside the adapter rather than the content model.

Package size is material. As an initial comparison only, the upstream minified 1.11.11 file was 1,057,680 bytes (251,239 gzip bytes); 2.3.4 was 990,638 bytes (285,326 gzip bytes). These are not the final Vite chunk sizes or a performance benchmark. Measure the chosen 1.11.13 production artifact. There must be no eager sketch/library request on the homepage or initial experiment load. Do not add a CDN request or third-party telemetry.

## Minimal architecture

1. A serializable, renderer-independent process account owns stable step IDs, labels, explanations, initial/revealed membership and explicit relationship meanings. Mark the whole account illustrative. No p5 objects, geometry, animation time or DOM nodes enter this data.
2. Static HTML presents the question, limitations, simplified sequence and expandable hidden steps. Semantic SVG retains aligned positions and faint original traces. Native disclosure provides one-action reveal with keyboard/touch and works without JavaScript.
3. A separate p5 adapter consumes the same account plus a small view state. It draws only optional motion/traces, hidden from assistive technology and noninteractive. It cannot change the source account or determine what is true. All meaningful text is available independently.
4. Import the sketch/p5 only after a useful user action and when its area is visible. Reduced-motion users receive the complete static result without loading or running the animation. Failed imports leave the disclosure and static explanation usable; no loading screen blocks content.
5. Keep content state (account), persistent reading state (native disclosure) and temporary enhancement state (loading/running/paused/complete/failure) distinct. Pause/resume does not conceal revealed content. Reset returns the view to its initial state without mutating the account or scrolling the reader away.
6. Use an explicitly bounded animation, `noLoop()` after completion, `noLoop()` whenever offscreen or the document is hidden, and `remove()` on disposal. A resumed animation must not jump by the entire hidden elapsed wall-clock interval. Cancel any owned observers/listeners on unmount. Respect a preference change to reduced motion immediately.
7. Keep the existing React/TypeScript/Vite/Worker stack and homepage/intro behavior. Add a finite permanent experiment URL with useful initial HTML, correct direct loading and not-found behavior. Keep private studio, manuscripts, old fixtures and unreviewed content out of this release.

## Acceptance required before agent approval

- One native disclosure action reveals useful hidden-work text immediately; labels identify illustrative sequence, relationship meanings and absence of timing measurements. Original process remains faintly visible after reveal.
- Static no-JavaScript reading, links and footer disclosure work. Keyboard Enter/Space and touch activation work with visible focus and comfortably sized targets; no hover requirement.
- Narrow320px and enlarged text remain readable without horizontal clipping; motion never carries unique meaning. Color has text/shape counterparts.
- p5 remains absent from initial homepage and experiment requests; reveal loads it only where motion is allowed and visible. Test failure handling and page disposal as well as success.
- Pause/reset work in HTML; animation stops offscreen, in a hidden document and after its bounded transition. Reduced motion, including changing the preference, stops/prevents animation without losing content.
- The same data supports the HTML/SVG and p5 adapter; source content is unchanged by reveal/reset. No invented measured values, private material or implied causal findings enter public output.
- Run frozen install, type/build, deployment-package and browser checks; inspect the actual release artifact and remote CI. Compare existing homepage content/intro and legacy links. Record automated versus human observations separately.
- Reviewers inspect the exact candidate source and build. Root records any changes after approval and reruns affected checks; substantive changes require fresh review. User's current authorization permits only this scoped experiment's publication after approval; it does not approve the other feature branches or private writing.

## Experimental opportunities and limits

After this proof, consider bounded accumulation that reveals rework, feedback that shows a documented consequence, or an explicitly illustrative simulation where assumptions are editable and limitations remain visible. Choose p5 when the temporal model adds understanding; ordinary inline evidence, diagrams and reading links remain HTML/SVG. Evaluate with voluntary reader tasks before claiming learning or comprehension benefits. Automated motion/lifecycle tests establish technical behavior, not reader understanding.

The footer should retain the compact native **\* About this experiment** disclosure and explain the idea, open hypothesis, owner-led process, implemented boundaries and this question. Record actual interface observations only after verification. No visitor tracking is required.

## Release scope and recovery

Release from a new branch based on fresh production `main`, preserving earlier feature branches intact. Do not merge the draft handoff or writing-studio branches merely to obtain a footer. Port only the shared native footer semantics and truthful release-specific copy plus the isolated experiment. Preserve the prior deployed commit/version before publication and verify homepage, permanent experiment URL, asset MIME and404 after deployment. Failed build or health verification must retain or restore the previous healthy release. No DNS or paid services are needed.

Implementation details, final artifact measurements, test outcomes and publication status belong in the accompanying release record. None is implied by this architectural recommendation.

## Exact-source creative-technologist approval — 24 October 2026

**APPROVE** scoped publication of implementation commit `0755a37ab38bb996cbdf124e2ca370607d9dd51f`, after the integration lead verifies remote CI and the hosted preview for the resulting release candidate. This approves the illustrative hidden-work experiment and shared disclosure, not private writing, the earlier development branches, or a claim of reader benefit. Documentation-only review records may be added without changing this runtime approval; substantive implementation changes need fresh review.

I inspected the actual data account, HTML/SVG page, lazy p5 adapter, static prerender and artifact audit, focused tests, homepage/config diff and generated output. Stable source identities and explained illustrative relationships remain independent of the drawing adapter. One native action exposes the useful account without waiting for p5. Faint initial traces and full text remain available without motion. The adapter is client-only, instance-mode and bounded; visibility, pause, reduced motion, failed/deferred loading and disposal are handled outside the source content. The LGPL notice and tagged upstream source are exposed on the page. The measured lazy chunk cost (approximately1,048KB raw /255KB gzip) is accepted for this optional prototype, not as a reason to use p5 for ordinary reading or diagrams.

The prior `c80f80f` initialization issue was a publication blocker. In the approved revision, missing/throwing resize support is established before p5 allocation; observed failure paths leave a usable static explanation and no canvas. Three focused regressions cover missing support, constructor failure and `observe` failure. I inspected the integrated check log at `/workspace/portfolio-audit/hidden-work-revised-integrated.log`: **39/39 passed**, comprising26 retained baseline checks and13 experiment checks, against the built local Worker artifact. The integration lead also supplied frozen-install, type/build/prerender/audit and deployment-package evidence. I did not claim a separate successful rerun: my earlier extra browser attempt lost its reused server and produced connection failures; it adds no product evidence.

No remaining substantive architecture or experiment-scope blocker was identified in this reviewed source. The independent reviewer separately reproduced lifecycle and narrow-layout behavior, including the repaired resize failure. Remote CI and preview remain release gates, not completed checks at the time of this approval. Real assistive-technology use, physical devices, native browser zoom and human comprehension remain unverified. The next experiment should evaluate whether readers can distinguish the overview, hidden steps, illustrative relationships and absence of real evidence before expanding the system.
