# Edge Case prototype

Status, 11 November 2026: **unpublished prototype**, Slice 1 complete for owner review. Working title **EDGE CASE**; tagline *Every rule has an exception*. The owner approved development and testing on `claude/jolly-turing-noyo4q`. **Production deployment requires explicit owner approval and has not happened.** The authoritative rules are in [`tests/EDGE-CASE-MECHANICS.md`](../../tests/EDGE-CASE-MECHANICS.md).

## Owner direction (11 November)

- Goal: reward and teach critical thinking through doing and experimenting.
- The four-pocket revolving + is the central mechanic. Shifts rotate contents clockwise, including movement state.
- Deterministic conflicts. Controls, accessibility settings and safety information are never misleading. The interface may present incomplete interpretations.
- Keep the binary jokes, discoveries and the permanent UNKNOWN entry. Hidden achievements reward understanding, never accidental bugs.
- Level 000 tests whether SHIFT is found unaided, with accessible, progressive hints when stuck.
- An element that "screenshots" outcomes, plus a log and ranking system.
- Feel before features: three excellent levels.
- A mechanics specification alongside the tests separates intended ambiguity from defects.
- The original channel gate stays in as a discoverable surprise.

## Push-to-turn revision (12 November)

Owner direction: no button to turn doors. Push into a door and it moves, either direction. Precedents, from web search summaries (page fetches were blocked by the session's network policy, so these are not first-hand play):

- **Rodger Dodger** (After Dark Games, 1998): a maze of rotating doors. Per a review, the player's sphere turns them, and so do some enemies. ([MobyGames](https://www.mobygames.com/game/4821/after-dark-games/), [Giant Bomb](https://www.giantbomb.com/after-dark-games/3030-16055/))
- **Kwirk / Puzzle Boy** (1989–90): turnstiles you push; its arms are thick, occupying grid cells. ([Wikipedia](https://en.wikipedia.org/wiki/Kwirk), [Lexaloffle turnstile notes](https://www.lexaloffle.com/bbs/?tid=36578))
- **Chip's Challenge 2**: swivel doors that turn when you leave through a closed side; pushed blocks also turn them. ([Bit Busters wiki](https://wiki.bitbusters.club/L-door))

Implemented (spec §4a): a push builds over 8 steps (a ring fills, with an arrowhead for direction). The door then turns the way the push would spin it about its pivot. One arm of each pocket turns it clockwise, the other counter-clockwise. Holding the same push carries you through and out the far side, like a revolving door. Channel gates turn the same way, by pushing across their bars. The Shift button and keys are gone; movement is the only control. Full Circle now counts net rotation.

Proposed next, not implemented (owner decision):
1. **Tracers that push doors** (Rodger Dodger's enemies turn doors). Doors would become part of the system's pattern, and could be a distinct tracer type, introduced in one level.
2. **Doorway jam** (Kwirk): a turn is blocked while something stands half in a doorway, instead of being clamped inside.
3. **Thick doors** (Kwirk) as a later variant, where the arms occupy cells and can push things.

## Full-screen entrance and nested menu (12 November)

Owner choices: the page shows the title and text plus one Enter button. The game fills the window, with true full screen where allowed; iPhone Safari has none for pages. Exit, Escape or Back return to the page with Continue. One menu tree serves the title and Pause, with game-style keyboard navigation and breadcrumbs. Settings are grouped into Controls, Sound, Display and Gameplay. The frame is minimal and layer-aware: hints and discoveries move to their own message rail and no longer cover the arena; menus span below the frame over a veil. Spec §13 (M1–M5). New setting: offer hints when stuck (on by default).

Finding while testing: in true full screen, desktop browsers keep Escape for themselves, so the page never sees the first Escape. Leaving full screen is now treated as that Escape (M2).

## Private play-test link

A private claude.ai artifact, readable only by the owner: https://claude.ai/artifact/CNcjxxVTob4dmStG68FQn4. It is built by `scripts/build-edge-case-artifact.tsx` into `dist-artifact/` (git-ignored) as one self-contained page. It declares only the `downloads` capability, for saving snapshots. This is not the website and not a deployment. Progress and logs live in the viewer's own browser storage for that page.

## What Slice 1 contains

| Area | Implementation |
| --- | --- |
| Levels | 000 False Start, 001 Expected Behavior, 010 Shift Happens; two or three tested ways through each |
| SHIFT | Revolving + on a grid corner. Members chosen by centre point. Player offset and velocity rotate 90° clockwise, then are clamped inside the arrival pocket. Tracers snap and turn right. Samples move. The exit, track, fields and gates stay (spec §4) |
| PIVOT | The original channel gate, unannounced, in 010 (spec §5) |
| Conflicts | Fixed order of operations (§2); hazards after shifts (H3); same-place outcomes (H4); target ties go to gates (A1) |
| System index | Known operations 03/07 with clues; ten discoveries in binary (`0000 / 1010`); an uncounted, permanent UNKNOWN entry |
| Hints | 000: at 15, 30 and 45 s of play without a shift (pauses excluded): observation → structure → named control. 001 and 010 have two gentler hints. All persist on screen, are announced, and can be requested from Pause. Counted in run records (§11) |
| Touch controls | Settings → Movement control: **Pad** (default, four labelled buttons) or **Joystick that follows your finger**. The joystick is floating: the base appears where the finger lands and trails a finger that passes the rim. Direction snaps to eight ways; distance sets speed. Settings → **Control sides**: movement left with Shift right, or mirrored. Keyboard works with both (spec §12a) |
| Run records | Every ended attempt is logged with a thumbnail. The snapshot view shows a full field record (route, end point, summary) with Save image; press and hold also works. Field log: personal, local standings (best time, fewest actions, ways found `n / ?`), recent outcomes, rank by time (§12) |
| Isolation | Built only by `npm run build:fixtures`; absent from `dist/`; production audit rejects the marker and route |

## Browser and mobile foundation

- **Engines:** CI and Playwright now cover Chromium, WebKit (desktop Safari), WebKit on an iPhone 13 viewport (game specs) and Firefox. Browser-independent specs (engine, records, icons) run once, in Chromium.
- **100vh:** investigated. The current edition's intro already overrides the legacy `100vh` lock with `min-height: 100svh; overflow: visible`. In emulated iPhone WebKit the production intro computes to the small viewport with visible overflow, so nothing is clipped. **Not confirmed for any production surface; no change made.** The raw `100vh` + `overflow: hidden` remains only in the legacy edition, which production serves solely as the immutable archive. The game page uses `100dvh` with a `100vh` fallback and sizes its arena from `visualViewport`.
- **Icons:** temporary `apple-touch-icon.png` (180), `icon-192.png` and `icon-512.png`, rendered by `scripts/render-icons.ts` from the existing typographic placeholder mark. They are full-bleed and opaque (iOS masks corners), with the glyph centred by measured ink. Linked from every page template and listed in the manifest. Replace them when the owner-supplied asterisk is final.

### Engine-specific findings in existing tests

| Test | Result | Handling |
| --- | --- | --- |
| Two intro touch tests | Use Chromium-only CDP input | `skip` outside Chromium |
| Narrow investigation reading | Debug screenshot exceeds WebKit's 32,767 px capture limit | Screenshot is Chromium-only |
| Legacy hero first-screen; graph text view and no-JS menu at 200% | Legacy heading wraps taller in WebKit/Firefox | `fixme` outside Chromium (first-screen) and in WebKit (others). **Container font fallback, not a browser defect:** Iowan/Palatino are absent, and these engines fall through to the wide DejaVu Serif. Real Apple devices have Iowan. Archive bytes unchanged |
| Header keyboard-menu modality | Safari leaves links out of the Tab order by default | `skip` in WebKit (browser preference, not a site defect) |
| Experiment note on `/` | Intermittent in every engine, most often WebKit/Firefox: the note closes or ignores Enter on the **legacy fixture homepage** | `fixme` outside Chromium. **Open defect, needs investigation** (likely the legacy app re-mounting its footer around the intro). Production `/` is the current edition |

## Verification, 11 November 2026 (automated only)

- Engine: 28 tests, each citing spec rule IDs. They cover determinism; structures; every SHIFT rule (rotation of offset and velocity, clamping, centre membership, tracer turning and stranding, hazards after shift, coexisting tracers, prediction updates); target ties; all seven scripted solutions; and every discovery trigger with negative cases.
- Records: 2 pure tests (methods; standings, ties and rank).
- Browser (Chromium, desktop WebKit, iPhone WebKit, Firefox): the game page suite (11), plus hints and records (5): unaided start with escalating hints under a fake clock; pause excluded; on-demand hint; a failure logged; snapshot view and PNG save; standings `n / ?`.
- Controls: 5 pure tests (dead zone, exact axis snapping, magnitude, base trailing, proportional speed), plus browser tests for side swapping with persistence and the joystick driving the player, in all four setups.
- Icons: 6 tests.
- Full suite after the controls change: 579 passed, 0 failed, 11 skipped (Chromium, desktop WebKit, iPhone WebKit, Firefox).
- Full-suite totals, packaging and studio results: see the commit and the owner report for this date.

**Not verified:** real iPhone/Android hardware, Safari's dynamic toolbar, VoiceOver, saving inside the artifact viewer (requires a person to accept the prompt), and anything about fun, comprehension or fairness. Those need people.

## Unresolved design questions for the owner

1. **Hint timing in 000.** 15/30/45 s is a guess. Should hints wait for evidence of being stuck (wall bumps) as well as time?
2. **Exception's fairness.** Is "the counter says 0/3 while the exit opens at 2" a fair lesson, or should the exit show its requirement on approach?
3. **Rank by time.** Time is the default rank, yet the game values understanding. Should the primary ranking be ways found, or fewest actions?
4. **Shared rankings.** Records stay on the device. A shared leaderboard would need a backend, identity and a privacy decision.
5. **Velocity rotation.** Carrying momentum makes shifts feel physical but can surprise. Keep it, or zero velocity?
6. **Screen readers.** The game is real-time. A turn-based mode would make it playable with a screen reader alone.

## Next

Slice 2 waits for owner review: levels 011–111 (including *404: Path Not Found*), Deadlock, Phase Slip (needs a timed rotation rule) and Backtrace. Then play-testing with people. Before any public name: a trademark check on "Edge Case". After Slice 1 review: resume the dependency updates and README rewrite.

## Rollback

Remove `src/play/edge-case/`, `edge-case.html`, `scripts/build-play.tsx`, `scripts/build-edge-case-artifact.tsx`, and the `edge-case*` specs, mechanics spec and bot. Then revert the `vite.config.ts`, `package.json`, `scripts/prerender.tsx` and `scripts/audit-public.ts` edits. Production output is unaffected. Foundation changes revert independently: Playwright projects and CI browsers; `public/*.png`, the `apple-touch-icon` links, the manifest and `scripts/render-icons.ts`; and test skips.
