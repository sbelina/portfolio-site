# Pattern Shift prototype

Status, 11 November 2026: **unpublished prototype**. The owner approved prototype development on `claude/jolly-turing-noyo4q`, with tests and documentation, and no deployment without explicit approval. This record covers brief phases 1–5 up to the owner's review checkpoint.

## Question and acceptance

Prototype question: can a new player meet something they cannot pass, notice a repeating pattern, discover that the surrounding structure can be changed, and succeed by changing it?

The owner's success criteria are listed in the brief: understand movement without a tutorial, recognise a hazard's behaviour, discover an intervention, use it to solve a level, understand why a run succeeded or failed, and want to play another level. **Only human play-testing can answer these.** The automated checks below establish rule consistency, solvability, isolation and technical accessibility checks, not fun or comprehension.

## What exists

| Part | Implementation |
| --- | --- |
| Route | `/play/pattern-shift/`, built **only** by `npm run build:fixtures` (Vite `--mode fixtures`). Absent from `dist/`. |
| Isolation | `scripts/build-play.tsx` throws if the template reaches production output. `scripts/audit-public.ts` rejects the prototype marker and route in `dist/`. A browser test requests the route from the production Worker and expects 404. |
| Simulation | `src/play/pattern-shift/engine.ts`: pure TypeScript, fixed 60 Hz step, no React or DOM. Continuous movement with acceleration and braking, axis-separated collision, doorway corner assist. |
| Levels | `levels.ts`: three data-driven 9×11 portrait arenas (Rhythm, The gate, Upstream). |
| Hazards | **Tracers** follow track: straight if possible, else right, left, then reverse at a dead end. Loops and patrols both come from this one rule. **Timed fields** follow a fixed period, with a warning phase before activation. |
| Intervention | **Gate**: a rotating channel that passes movement along one axis. The rule is identical for the player and for tracers. A gate with anything inside it is jammed and cannot turn. |
| Feedback | Predicted tracer path (next four tiles, updates as soon as a gate turns), short tracer trail, previous-attempt route with an end mark, failure cause card, level summary (time, attempts, gate turns). |
| Interface | Canvas arena; React HUD, cards, settings; live-region announcements; canvas text summary. |
| Controls | Arrows/WASD, Space/Enter, Escape/P, R. Touch: one eight-direction pad held under the thumb, plus a large Turn gate button. Nothing requires tilt or multi-finger gestures. Controls sit below the arena, so fingers never cover it. |
| Settings | Sound and volume, motion (device/reduced/full), game speed 100/75/50%, path previews, bolder lines, vibration where supported. Stored locally; failures fall back to defaults. |
| Sound | Procedural Web Audio cues, unlocked by a user gesture. No information is conveyed only by sound. |

Visual encoding never relies on colour alone: player = filled ringed circle; tracer = arrowhead; gate = parallel bars with flow chevrons and a dashed reach ring; sample = hollow diamond; field = dashed square → sparse hatch (warning) → dense crosshatch (active); exit = broken circle → closed circle.

Colour roles follow the current tokens: orange (`--signal-art`) for the player ring and interactive gate; coral (`--pressure`) for hazards; teal (`--holds`) for samples and the open exit; violet (`--unresolved`) for predicted, not-yet-observed paths.

## Verification, 11 November 2026

Automated checks only:

- **Engine** (14 tests, no browser): determinism; exact tracer periodicity; same gate rule for player and tracers; jamming; immediate prediction change; field warning before activation; failure causes; closed exit; corner assist; scripted solutions for all three levels; early-turn trap in level 3; malformed map rejection.
- **Browser** (10 tests × Chromium, desktop WebKit, iPhone 13 WebKit): production absence; no-JS reading and `noindex`; keyboard play, collection, pause, resume and restart; gate reach and turn; Space on focused controls; settings persistence and blocked storage; reduced-motion default; 44 px targets; axe on title and settings; arena and controls on one 320 × 568 screen with no sideways scroll; touch pad hold.
- **Full suite**: 357 passed, 5 skipped, 0 failed (Chromium + desktop WebKit + iPhone WebKit). Then `npm run check:deploy` (84 files, unchanged), studio tests (11 passed).

WebKit testing found two real game defects that Chromium missed: horizontal overflow at 320 px (grid items not shrinking) and an invalid `aria-label` on a paragraph. Both are fixed.

**Not verified**: real iPhone or Android hardware, Safari's dynamic toolbar, VoiceOver, human comprehension or fun, audio quality, performance on low-end devices.

## WebKit coverage added to the site

CI now installs Chromium and WebKit. Playwright has `webkit` (Desktop Safari, full suite) and `mobile-webkit` (iPhone 13, game tests). Findings on the existing suite:

| Test | WebKit result | Handling |
| --- | --- | --- |
| Two intro touch tests | Use Chromium-only CDP touch input | `skip` outside Chromium; game touch coverage runs in WebKit |
| Narrow investigation reading | Debug full-page screenshot exceeds WebKit's 32,767 px limit | Screenshot is Chromium-only; assertions still run |
| Graph text view, no-JS menu at 200%, primary links in first screen | Horizontal overflow or a 29 px first-screen miss on the **legacy edition** (fixture homepage) | `fixme` in WebKit. Owner decision needed: the legacy edition lives on in production only as the immutable archive. The current edition's own reflow tests pass in WebKit. |

## Remaining work (not started)

Play-testing with people; real-device checks (Safari toolbar, notch/safe areas, haptics); a screen-reader-playable mode (turn-based step option); more levels and chapters; ambience; final art, once the owner-supplied asterisk is final; deciding whether this ever becomes a native app (the brief's Godot/App Store plan is separate from this web prototype).

## Rollback and publication

Remove `src/play/`, `pattern-shift.html`, `scripts/build-play.tsx`, the two `pattern-shift` specs and their bot, then revert the `vite.config.ts`, `package.json`, `scripts/prerender.tsx` and `scripts/audit-public.ts` edits. Production output is unaffected either way.

Publishing requires explicit owner approval and a deliberate change: add the input to the production build, remove the audit markers, decide indexing and navigation, and run the release checks.
