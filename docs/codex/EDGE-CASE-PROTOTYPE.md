# Edge Case prototype

Status, 11 November 2026: **unpublished prototype**, working title **EDGE CASE**, tagline *Every rule has an exception.* The owner approved prototype development on `claude/jolly-turing-noyo4q` with tests and documentation, and no deployment without explicit approval. Earlier work on this branch called it Pattern Shift; the files and route were renamed.

## Goal and acceptance

Goal (owner, 11 November): reward and teach critical thinking through doing and experimenting. The game's descriptions (HUD, objective, operations list) are claims the player can test against what the system actually does. The professional practice and the Systems Inquiry loop inform the design, but neither is an interface gate.

Prototype question: can a new player meet something they cannot pass, notice a repeating pattern, discover that the structure can be changed, and succeed by changing it? Can they then notice, through play, that an interface description is not the whole system?

**Only human play-testing can answer these.** The automated checks below establish rule consistency, solvability, discovery triggers, isolation and technical accessibility checks. They do not establish fun or comprehension.

## Design rules

- **Ambiguous to describe, deterministic in behaviour.** No randomness. Every discovery follows from the stated rules, never from a software defect.
- **More than one way through.** Each level has at least two tested solutions, and no level requires an optional discovery.
- **Controls and accessibility are never hidden.** MOVE, SHIFT and TRACE are known from the start; mystery lives only in optional discoveries.
- **Clues are observations, not instructions.** Some unknown entries deliberately say only “No record.”
- **The exit's shape is the truth; the counter is a description.** In 010 the counter reads 0/3 while two samples open the exit.
- **Honest counting.** Discoveries read `0000 / 1010` (n of 10, with the screen-reader text “n of 10”). The permanent **UNKNOWN** entry is outside the count and says so.
- **No softlocks.** A junction can always be shifted again; every pocket has a way back out.

## Mechanics

| Element | Rule |
| --- | --- |
| Junction (+) | Four arms on a grid corner seal four pockets. **SHIFT** carries everything centred in a pocket to the centre of the next pocket clockwise: player, tracers (which also turn right) and samples. The exit, track and fields stay put. Arms block movement for player and tracers alike. Reach: 1.6 tiles from the corner. |
| Channel gate (‖) | The original gate, now unannounced. It passes movement along one axis; turning it switches the axis. It jams with anything inside. First turn = PIVOT. |
| Tracer | Moves only on track: straight, else right, left, then reverse. A tracer carried onto floor stays still (and stays dangerous). |
| Timed field | Fixed period, warning phase, then active. |
| Exit | Opens when the required number of samples is collected (default: all). |

## Levels (chapter 000–010)

| Code | Title | Tested ways through |
| --- | --- | --- |
| 000 | False Start | Start sealed in a pocket: shift out north-east or south-west; collect both samples; time the tracer |
| 001 | Expected Behavior | Time the crossing; or carry the tracer onto other track (Re:Route); or strand it off track |
| 010 | Shift Happens | Shift into the sealed exit pocket (Technically Correct); or find and turn the hidden channel gate (Pivot). Two of three samples open the exit |

## System index

Known operations: MOVE, SHIFT, TRACE. Discoverable: RE:ROUTE, PIVOT, ALTERNATE EXIT, EXCEPTION (display `03 / 07`, toggle for unavailable entries).

Discoveries (each detected inside the deterministic engine, except 0x07, which the interface records):

| Code | Name | Trigger |
| --- | --- | --- |
| 0x00 | False Start | Complete 000 |
| 0x01 | Expected Behavior | A tracer completes a full cycle before any movement input |
| 0x02 | Re:Route | A shift carries a tracer onto track it can follow |
| 0x03 | It's Not a Bug | A shift carries a tracer off track; it stops |
| 0x04 | Pivot | Turn a channel gate |
| 0x05 | Technically Correct | A shift, not movement, delivers you to an open exit |
| 0x06 | Exception | Leave with samples uncollected |
| 0x07 | There Are 10 Types of Players | Open the system index for the 0b10th time |
| 0x08 | Off by One | Win on a step after which a tracer would have reached you |
| 0x09 | Full Circle | Four shifts of one junction within one attempt |

Discoveries persist locally (`edge-case:v1`). Storage failures fall back to an in-memory session.

## Implementation

`/play/edge-case/` is built **only** by `npm run build:fixtures` (Vite `--mode fixtures`). `scripts/build-play.tsx` throws if the template reaches production output. `scripts/audit-public.ts` rejects the prototype marker and route (the old Pattern Shift ones included). Source: `src/play/edge-case/`: `engine.ts` (pure fixed-step simulation, 60 Hz), `levels.ts`, `system-index.ts`, `render.ts` (canvas), `EdgeCaseGame.tsx` (interface), `EdgeCasePage.tsx` (no-JS page), `settings.ts`, `audio.ts`.

Visual encoding never relies on colour alone: player = filled ringed circle; tracer = arrowhead; junction = cross with an orange pivot and a dotted clockwise turn circle; channel gate = parallel bars with flow chevrons; sample = hollow diamond; field = dashed square → sparse hatch → dense crosshatch; exit = broken circle → closed circle. The blinking index cursor runs at 1 Hz and stops under reduced motion; there is no flashing.

## Verification, 11 November 2026

Automated checks only:

- **Engine** (19 tests, no browser): determinism; periodic tracers; arms block player and tracers; shift carries clockwise and leaves the exit; channel gate axis and jamming; field warning; required count; malformed maps; seven scripted solutions across the three levels; deterministic triggers for every discovery, plus negative cases for Exception and Technically Correct.
- **Browser** (11 tests × Chromium, desktop WebKit, iPhone 13 WebKit): production absence and production-Worker 404; no-JS reading and `noindex`; keyboard shift-then-move in 000; Space/Enter shift with readiness state; system index (03/07, four undiscovered operations, binary 0000→0001/1010 on the second visit, persistence, uncounted UNKNOWN); Space on focused controls; settings persistence and blocked storage; reduced-motion default; 44 px targets; axe on title, settings and index; 320 × 568 one-screen fit; touch shift and pad.
- **Full suite**: 365 passed, 5 skipped, 0 failed. Then `npm run check:deploy` (84 files, unchanged) and studio tests (11 passed). An earlier full run had four load-sensitive failures in existing header, experiment-note and intro-wheel tests; each passed on rerun, and CI retries failures once.

**Not verified**: real iPhone or Android hardware, Safari's dynamic toolbar, VoiceOver, human comprehension, fun, fairness of timing, audio quality, low-end performance.

## WebKit (Safari engine) findings

CI installs Chromium and WebKit. Playwright projects: `chromium` (all), `webkit` (Desktop Safari, all browser tests), `mobile-webkit` (iPhone 13, game tests).

| Test | WebKit result | Handling |
| --- | --- | --- |
| Two intro touch tests | Use Chromium-only CDP input | `skip` outside Chromium |
| Narrow investigation reading | Debug screenshot exceeds WebKit's 32,767 px capture limit | Screenshot is Chromium-only; assertions still run |
| Graph text view, no-JS menu at 200%, primary links in first screen | The legacy hero heading renders 303 px tall versus 217 px in Chromium | `fixme` in WebKit. **Diagnosis**: font fallback in the Linux test container, not a Safari defect. The heading asks for Iowan Old Style/Palatino, which the container lacks. fontconfig hands Chromium an Inter substitute; WebKit correctly falls through to Georgia, which maps to the much wider DejaVu Serif. Real Apple devices have Iowan Old Style. The legacy edition ships only as the immutable archive, so no archive bytes were changed. |

The owner approved a Safari fix (11 November); none was needed for these. WebKit did find two real game defects, both fixed: 320 px overflow and an invalid `aria-label`.

## Next (not started)

Slice 2: levels 011–111, including *404: Path Not Found* as a hidden level; Deadlock, Phase Slip (needs a timed rotation rule in the simulation) and Backtrace. Slice 3: play-testing with people, e.g. five players on 000 with no explanation. Before any public name: a trademark check on “Edge Case”.

## Rollback and publication

Remove `src/play/edge-case/`, `edge-case.html`, `scripts/build-play.tsx`, the two `edge-case` specs and their bot, then revert the `vite.config.ts`, `package.json`, `scripts/prerender.tsx` and `scripts/audit-public.ts` edits. Production output is unaffected either way. Publishing requires explicit owner approval: add the production input, remove the audit markers, decide indexing and navigation, and run the release checks.
