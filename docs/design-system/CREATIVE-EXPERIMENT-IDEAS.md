# Three invitations to curiosity

11 November 2026 · Creative technologist · **Proposals, not implemented prototypes**

The brief is to make ideas available to play with, using the adopted scientific/editorial language. Curiosity may come from an expressive encounter as well as an explanation. None of these ideas has been tested with visitors, and none establishes improved understanding.

## What I inspected

- [InquiryIllustration.tsx](../../src/design/InquiryIllustration.tsx): expressive SVG, conceptual caption and two native context layers already exist. They encode no measurements.
- [PracticeMoves.tsx](../../src/design/PracticeMoves.tsx): Test. Show. Enable. and optional questions already read together.
- [AssumedObserved.tsx](../../src/visuals/AssumedObserved.tsx): fixed assumptions/observations, explained typed connections and a text fallback already work in the synthetic fixture. Selecting a node to open another evidence panel would repeat this idea.
- [HiddenWorkPage.tsx](../../src/experiments/hidden-work/HiddenWorkPage.tsx), [content.ts](../../src/experiments/hidden-work/content.ts) and [client.tsx](../../src/experiments/hidden-work/client.tsx): an illustrative reveal, aligned SVG, optional lazy p5 adapter, motion controls and visibility/preference handling already exist. These are reusable precedents, not new proposals.
- [tokens.css](../../src/design/tokens.css), [architecture](DESIGN_SYSTEM_ARCHITECTURE.md), [interaction contracts](INTERACTION_CONTRACTS.md) and [evidence rules](../codex/EVIDENCE-RULES.md): paper/ink/orange, observatory darkness, restrained linework, accessible text and evidence distinctions govern the experiments.
- [vite.config.ts](../../vite.config.ts), [prerender.tsx](../../scripts/prerender.tsx) and [build-experiment.tsx](../../scripts/build-experiment.tsx): current production and synthetic fixture outputs are explicit. A new local experiment needs its own isolated build; a sketch directory alone is not an isolation guarantee.

## 1. Read the seam — recommended first

**Invitation:** “Where does this sentence stop observing and start explaining?”

A short piece of writing sits on paper with a generous margin. One **Trace this sentence** activation reveals the joins inside its reasoning: a solid underline beneath what the record says, a dashed underline beneath an interpretation, and an open bracket where support is missing. Small numbered source notes align in the margin. The writing stays put; it is neither rewritten nor replaced by a panel.

**Synthetic inventory, written only for this proposal:**

> The board marked the request complete. A recipient then asked which version to use. The handoff may have omitted context.

Invented source note A: “Board entry: Complete.” Invented note B: “Recipient message: Which version should I use?” The first two sentences link to those invented records; the third is explicitly an interpretation. Missing support: what the recipient received, whether the instructions were available elsewhere, and alternative explanations for the question. These are fictional teaching materials, not Sami’s case evidence or a claim that omitted context caused rework.

**Initial state:** complete passage, “Synthetic reading study” label, short limitation, source notes and the conventional trace affordance. Essential distinctions are already readable in a compact text key. **One-action result:** every clause gains its relationship label and matching note marker simultaneously. **Optional depth:** follow a native source-note anchor and use its return link; toggle tracing off. Do not add another panel within a note. Any future substantial entry retains its full URL.

**State:** immutable `passage/clauses/annotations/sources/limitations`; transient `trace: off | on`; ordinary anchor/focus position. Turning tracing off keeps a focused source note in the DOM. No tracking or persistent profile is needed. A note is labeled “supports this wording,” not “proves this explanation.”

**Aesthetic:** editorial paragraph first, ink underlines and fine margin rules second. Orange marks the selected annotation, not truth. Solid/dashed/open-bracket styles carry meaning with visible words. Violet labels unresolved support; coral is reserved for an explicit friction label; teal only for a labeled learning opportunity. Use current serif/system fonts, not pending font assets. On narrow screens the margin becomes the following note list; the prose never shrinks to fit.

**Medium and reuse:** HTML paragraphs, links and annotation list; CSS underlines; decorative SVG brackets only if CSS cannot express them clearly. No canvas or p5. Reuse the token roles and `.pc-layer` focus/spacing conventions from [foundation.css](../../src/design/foundation.css), not AssumedObserved’s node-selection machinery. New work is **clause-to-source alignment inside the reading**, beyond the current whole-figure disclosures. Never inject manuscript strings as HTML or executable instructions.

**Static/reduced motion:** source markers, provenance labels and complete notes work without JavaScript. Enhancement only changes emphasis; no unique content is JS-only. Expose the trace button only when its handler is ready; the static anchors remain usable without an inert control. Reduced motion changes emphasis immediately; normal motion, if retained, is a short opacity change without text movement. Keyboard activation uses one real button; links remain links. Touch needs no precision text selection or drag.

**Comparator:** the same passage and notes with ordinary numbered footnote links, without interactive tracing. Compare ability to identify the interpretation and name missing support, not time or clicks as a proxy for comprehension.

**Three counterexamples that could defeat the idea:**

1. A sentence contains both reporting and interpretation; one label would falsely classify it. Split annotation spans or retain an explicit mixed/uncertain label.
2. A convincing source supports the quotation but not its explanation. Keep source support separate from explanatory status; styling must never imply causal proof.
3. Margin lines become a visual puzzle at zoom or on a phone. Use the linear note list as the primary relationship representation there. If it works better everywhere, keep the conventional version.

**Validation:** built local preview tests for one-action emphasis, unchanged passage text, keyboard/source-note return, focus retention, touch, 320px reflow, enlarged text, no JS and reduced motion; check both surfaces and annotation collisions. Human question: “Which part is an explanation, and what would you need to check it?” No participant results exist.

**Smallest reversible implementation task:** create only `creative-trial.html`, `vite.creative-trial.config.ts`, `scripts/build-creative-trial.tsx`, `playwright.creative-trial.config.ts`, `src/experiments/reading-seam/{content.ts,ReadingSeam.tsx,client.tsx,reading-seam.css}` and `creative-trial-tests/reading-seam.spec.ts`. Generate the initial HTML from that same content/component before hydration, following the existing prerender pattern; an empty mount point is insufficient. Build into the already ignored `.temp/creative-trial/`, outside production `dist/`, with its own test server/config; keep trial tests outside the default `tests/` discovery. No production Vite input, routes, homepage, intro or public content changes. Acceptance requires the synthetic inventory, complete static HTML, useful one-action enhancement, the checks above, and a production artifact audit proving the trial is absent. Delete these new files and ignored output to recover. Prototype this before proposing a public placement or reusable content block.

## 2. Follow a question

**Invitation:** “Can one question belong to three different stories?”

Three short fictional notebook fragments sit along aligned tracks: a note about unclear instructions, one about an ambiguous status, and one about a misunderstood measure. A shared question, “What did this label leave out?”, sits above them. **Follow this question** reveals a restrained orange arc visiting their quotation markers, with one sentence at each stop explaining the editorial connection. Positions stay fixed. The arc indicates association, not a workflow, chronology or causal chain.

**Initial/result/depth:** all three fragments and their differences are readable initially. One activation shows all explained joins; optional source-note anchors inspect a fragment. No sequential Next buttons. No pretend “full entry” links: synthetic fragments stay local until actual approved entries and permanent URLs exist.

**State and content:** immutable fragment IDs, source passages and explicit proposed `relationship` records with rationale, direction/type, qualification and review status; transient `trace: hidden | shown`. Related fragments are not interchangeable. Proposed connections never enter the approved public projection automatically.

**Art and medium:** SVG arcs and fine construction ticks behind HTML labels; an ink/paper notebook or dark observatory, with orange emphasis. Dashed “editorial interpretation” joins contrast with any genuinely documented relationship. Geometry has no strength/distance units. Reuse token roles, the illustration’s construction vocabulary and AssumedObserved’s practice of attaching paths to actual HTML positions. Do not copy its entire board or invent an unlabeled network.

**Alternatives and failure:** the static baseline is an explained three-item list; it also supplies no-JS and narrow-screen reading. Reduced motion reveals the final arc instantly; no moving marker is required. Empty/missing relationships show “No reviewed connection,” not an inferred edge. Risks are forced equivalence, misleading sequence and arc collisions; evaluate each explicitly. Keyboard/touch activate one normal button; visible text explains every join. Focus stays on the trigger and anchors preserve browser return behavior.

**Next task:** if selected later, own `src/experiments/question-trace/` and `creative-trial-tests/question-trace.spec.ts`, using the isolated trial build above. Keep portable synthetic relationship data and browser tests for stable positions, text equivalence, edge labels and missing references. Human task: explain both the connection and one important difference. The existing relationship schema is a starting point; a new transferable-principle engine or Frame Laboratory is outside scope.

## 3. A field remembers

**Invitation:** “Leave a trace. See what remains.”

An expressive observatory sheet contains a sparse stippled contour. **Leave a trace** sends one slow, bounded sweep through it, leaving an ink-like residue while the starting contour remains faintly visible. Another optional pass overlays a different seeded contour. The resulting density is an artistic consequence of the drawing rule, **not a measure of work, memory, influence or organizational behavior**.

**State:** immutable drawing recipe/seed palette; transient pass count and layer history; separate `idle | running | paused | complete | unavailable` enhancement state. Reset clears the view, not underlying content. Pause never removes the explanation. Announce “Trace complete” once, not every frame. No pointer tracking or stored visitor trail.

**Art and code:** fine ink points, one orange trace, generous dark negative space and paper-like retained marks. No axes, empirical labels or semantic learning/friction colors on arbitrary particles. Start with local Canvas 2D and a bounded animation frame loop. p5 is an option only if its sketch ergonomics or richer drawing earns the already material lazy chunk cost; a few contours do not justify loading it. Borrow lifecycle policy, not the process story, from the existing hidden-work experiment.

**One-action/static behavior:** complete HTML explanation, a three-state static SVG specimen and controls are present before optional drawing. Reduced-motion users get the finished trace immediately; no JS or failed canvas leaves the same useful static sequence. HTML Pause/Resume, Reset and Another trace are touch/keyboard controls; no drag skill required. Stop offscreen/background work and dispose observers, frames and drawing resources. Bound retained layers and draw duration.

**Next task and test:** if selected later, own `src/experiments/field-memory/` and `creative-trial-tests/field-memory.spec.ts`, using the isolated trial build above. Keep recipes independent of the drawing adapter and excluded from production. Measure lazy loading, stopped frames, reduced-motion changes, reset determinism, fallback, focus and small-screen rendering. Main risks are empty spectacle, visual clutter and unearned claims about human memory. Ask voluntary visitors what invites further play and what they think the drawing represents; do not score curiosity by repeated clicks. If the static triptych is equally inviting, keep it.

## Decision and handoff

Prototype **Read the seam** first: it offers a new situated reading behavior with little runtime cost and a clear conventional comparison. Keep the other two as distinct expressive possibilities, not a backlog commitment. Preserve the current three deliberate intro steps plus separate Dive, immutable archive, private writing trial and approval boundaries.

This run inspected source and produced proposals only. No browser/device, assistive-technology, performance or human study was run; no prototype, site change or release is claimed. Root integrates and checks the bounded next task before implementation. Only verified observations should later update the shared “About this experiment” note; these ideas supply no findings yet.
