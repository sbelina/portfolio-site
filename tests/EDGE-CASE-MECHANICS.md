# EDGE CASE — mechanics specification

Authoritative rules for the simulation in `src/play/edge-case/engine.ts`. Tests in `tests/edge-case-engine.spec.ts` cite these rule IDs in their titles.

**How to use this document:** if the game does something this specification does not describe, or contradicts, it is a **defect**. If the game does something this specification describes, but which the in-game text does not explain, it is **intended ambiguity**. Discoveries must be derivable from these rules alone.

Status: prototype, slice 1 (levels 000–010). Units: one tile = 1.0. Time is in seconds of simulation time.

## 1. Time and determinism

- **T1** The simulation advances in fixed steps of 1/60 s. Rendering never changes simulation results.
- **T2** There is no randomness. The same level and the same sequence of per-step inputs always produce the same states and events.
- **T3** The interface may run 0–6 steps per animation frame (accumulated real time × game speed setting). Game speed scales time fed to the simulation, never rule constants.
- **T4** Input per step is `{ dx, dy, action }`. Keys and the pad give dx, dy ∈ {−1, 0, 1}; the joystick (I1) gives a snapped direction scaled by a magnitude in [0, 1]. Simultaneous sources are summed and each axis clamped to [−1, 1]. `action` is true for exactly one step per key press or button activation (key repeat is ignored).

## 2. Order of operations within one step

Each step applies these phases in order. Later phases see the results of earlier ones.

1. **Input bookkeeping**: if dx or dy ≠ 0, the attempt has *moved* (used by §8 0x01).
2. **Player movement** (§3), then tile-entry bookkeeping (§6).
3. **Action** (§5): at most one target is affected.
4. **Tracers advance** (§7).
5. **Samples** are collected (§9); the exit may open.
6. Clock advances; route trail recorded every 3rd step.
7. **Hazards** are evaluated (§10). A failure ends the step.
8. **Exit** is evaluated (§9). A win ends the attempt; discoveries for the win are recorded.

## 3. Player movement

- **P1** The player is a circle for drawing and an axis-aligned square of half-size 0.30 for collision.
- **P2** Target velocity is the input vector times 4.0 tiles/s, normalised to length 1 only when longer than 1 (keyboard diagonals). Shorter input, from a partly pushed joystick, gives proportionally lower speed. Each axis approaches its target at 34 tiles/s² when accelerating and 46 tiles/s² when the axis target is 0 (braking).
- **P3** Movement resolves the x axis, then the y axis. Overlap with any solid pushes the player out along that axis and zeroes that axis's velocity.
- **P4** Solids: wall tiles; junction arms (§4, J2); the two edge bars of each channel gate (§5, G1).
- **P5** Corner assist: when input is purely horizontal (or vertical), the player was blocked on that axis, and the tile ahead in the player's current lane is not a wall, the player slides toward the lane centre at up to 3.2 tiles/s. This prevents pixel-perfect doorway alignment and never moves the player through a solid.

## 4. Junctions (the revolving +, SHIFT)

- **J1** A junction sits on a grid corner (x, y). Its four **pockets** are the tiles NW (x−1, y−1), NE (x, y−1), SE (x, y), SW (x−1, y), in clockwise order. Pockets must be open tiles. Junctions may not share pockets.
- **J2** Four arms, 0.12 thick, run from the corner along the shared edges, sealing every pocket from every other pocket. Arms block the player (P4) and tracers (R2). A pocket can only be entered from its two outer sides.
- **J3** **Reach**: a junction can be shifted when the player's centre is within 1.6 of its corner.
- **J4** **Membership is by centre point only.** An object belongs to the pocket containing its centre. An object whose centre lies outside every pocket is never carried, even if part of its body overlaps a pocket.
- **J5** **Shift** carries every member one pocket clockwise (NW→NE→SE→SW→NW), simultaneously:
  - **J5a Player**: the offset from the corner rotates 90° clockwise, (ox, oy) → (−oy, ox). Velocity rotates the same way, (vx, vy) → (−vy, vx). The position is then clamped so the whole collision square lies inside the arrival pocket, at least 0.37 from each pocket edge (half-size + arm half-thickness + 0.01). The player can never be carried into a wall or an arm.
  - **J5b Tracers** are tile-bound: a carried tracer snaps to the arrival pocket's centre, its direction turns right (clockwise, matching the rotation), its progress resets to 0, and it chooses its next tile by R3. A tracer carried onto a tile that is not track stays still (R5).
  - **J5c Samples** move to the arrival pocket.
  - **J5d** The exit, track, timed fields, walls and channel gates never move.
- **J6** A shift is never blocked or jammed. (Contrast G3.) Shifting four times returns every carried object to its original pocket. A player's exact position may differ after a full turn only if clamping (J5a) applied.
- **J7** Pocket geometry is symmetric, so the arms look the same after a shift; only contents change. The renderer animates a quarter turn for 220 ms (none under reduced motion). The simulation completes the shift within the step.

## 5. Channel gates (PIVOT; unannounced)

- **G1** A channel gate occupies one tile and has an axis, ns or ew. Two 0.12-thick bars lie on the tile edges parallel to the axis. Movement passes along the axis and is blocked across it, for the player (P4) and tracers (R2) alike.
- **G2** Reach: the player's centre within 1.3 of the gate tile's centre.
- **G3** **Jam**: a gate cannot turn while anything is inside it: a tracer whose current or next tile is the gate tile, or a player whose collision square overlaps the gate tile (inset 0.02). A jammed action emits `jammed` and changes nothing.
- **G4** Turning switches the axis instantly. Tracers sitting exactly at a tile centre (progress 0) re-choose their next tile.
- **A1** **Action target**: the single nearest target within its reach (G2 or J3), measured from the player's centre to the gate tile centre or junction corner. Ties are broken in favour of channel gates, then by definition order (gates: map reading order; junctions: level list order).

## 6. Tile entry

- **E1** The game records the tile containing the player's centre and how it was last entered: `start`, `move` (the centre crossed into it during movement) or `shift` (a shift carried the player into it). This is used only by discovery 0x05.

## 7. Tracers

- **R1** Tracers move only along track tiles (`=`, `*`) and channel-gate tiles, from tile centre to tile centre, at their level-defined speed (tiles/s).
- **R2** A move from A to B is allowed only if A and B are both track (or gate), are not two pockets of the same junction (J2), and every gate on A or B is aligned with the move (G1).
- **R3** On arriving at a tile centre, a tracer tries **straight, right, left, then back**, in that order, and takes the first allowed move. Loops and back-and-forth patrols both follow from this single rule.
- **R4** A tracer with no allowed move stays at its tile centre and re-tries every step.
- **R5** A tracer on a non-track tile (only possible after J5b) has no allowed moves (R2) and stays still. **It remains a hazard.**
- **R6** Tracers do not interact with each other, samples, the exit or fields. Several tracers may share a position.
- **R7** **Prediction**: the dotted path shows the next four tile centres R3 would produce under the current configuration. It updates immediately after any shift or gate turn.

## 8. Discoveries

Each discovery is recorded at most once per attempt. The interface keeps the set across attempts (§12). All triggers are deterministic consequences of the rules above.

| ID | Name | Trigger (exact) |
| --- | --- | --- |
| 0x00 | False Start | Win level `000` |
| 0x01 | Expected Behavior | A tracer that has left its start tile arrives back at it and chooses its start direction (R3), while the attempt has not moved (§2.1) |
| 0x02 | Re:Route | A shift carries a tracer onto a tile where it has an allowed move |
| 0x03 | It's Not a Bug | A shift carries a tracer onto a tile where it has no allowed move (usually off track, R5) |
| 0x04 | Pivot | A channel gate turns (not a jam) |
| 0x05 | Technically Correct | Win while the exit tile was entered by `shift` (E1) |
| 0x06 | Exception | Win with at least one sample uncollected |
| 0x07 | There Are 10 Types of Players | The system index is opened for the second time (0b10). Recorded by the interface |
| 0x08 | Off by One | Win on a step after which some tracer, advanced one more step along its current segment, would be within hit distance (H1) |
| 0x09 | Full Circle | Any junction completes its fourth shift (4, 8, …) within one attempt |

Outside the count: the permanent **UNKNOWN** entry. It is never awarded and is labelled as not counted.

## 9. Samples and exit

- **S1** A sample is collected when the player's centre is within 0.50 of its tile centre.
- **S2** The exit opens when collected samples ≥ the level's *required* count (default: all). The HUD counter shows collected / total. **It describes; it does not decide.** The exit symbol (broken circle → closed circle) is the authoritative state, and the canvas text alternative states "Exit open/closed".
- **S3** Win: the exit is open and the player's centre is within 0.45 of the exit tile centre.

## 10. Hazards and conflicts

- **H1** **Tracer hit**: the player is caught when the distance between centres is < 0.55.
- **H2** **Timed field**: phase = (time + offset) mod period. Active while phase < on. Warning while phase ≥ period − warn. The player is caught while a field is active and a 0.20 half-size square at the player's centre overlaps a field tile.
- **H3** Hazards are evaluated after movement, actions and tracer movement (§2), so a shift that carries the player next to (or a tracer onto) the other is caught in the same step. There is no invulnerability frame.
- **H4** **Same-place outcomes**:
  - player + tracer → player caught (H1);
  - player + sample → sample collected (S1);
  - tracer + tracer, tracer + sample, tracer + exit → coexist (R6);
  - anything + channel gate → the gate jams (G3).

## 11. Hints (interface rule, not simulation)

- **N1** Hints never change the simulation. Level 000 tests whether SHIFT is found without instruction. Its hints escalate only while the player is stuck: no shift yet, by total playing time (pauses excluded): 15 s, 30 s, 45 s.
- **N2** Hint 1 is an observation. Hint 2 points at the structure. Hint 3 names the control and all of its inputs.
- **N3** Hints persist on screen until the player progresses, are announced once to assistive technology, and can be requested early from the pause menu ("Show a hint"). Requests are counted in the run record.
- **N4** Controls are never hidden. The Shift button, its keys (Shift, Space, Enter) and all settings are visible from the start; only what SHIFT does is left to discover.

## 12a. Touch controls (interface rules)

- **I1** **Joystick** (Settings → Movement control). A floating stick: the base appears where the finger first lands in the movement zone, and the knob follows the finger. If the finger travels past the rim (44 px), the base trails it at rim distance, so the stick stays under the finger. Direction is the finger's offset from the base, snapped to the nearest of eight directions (axis directions have exactly zero cross-component, so P5 applies). Magnitude is 0 within the dead zone (18% of the radius), then rises linearly to 1 at the rim. Lifting, cancelling or losing the pointer releases to zero. Only the first finger is tracked.
- **I2** **Control sides** (Settings → Control sides). Movement (pad or joystick) on the left with Shift on the right, or mirrored. Layout only; inputs are identical.
- **I3** Keyboard input (arrows/WASD, Shift/Space/Enter) works with either touch layout. The pad remains the default because its buttons are individually labelled for assistive technology.

## 12. Run records, snapshots and ranking (interface rules)

- **L1** Every ended attempt (win or failure) produces a **run record**: level, outcome (and failure cause), time, shifts, gate turns, attempt number, hints used, discoveries this attempt, method tags (L3), timestamp, and a thumbnail snapshot.
- **L2** A **snapshot** is a deterministic rendering of the final state with the attempt's full route, the end point (× for failure) and the attempt summary. Players can save a full-size PNG.
- **L3** **Method** of a win = the set of rule-level techniques used: Re:Route, Strand (0x03), Pivot, Carried exit (0x05), Exception. With none of these, the method is Direct. "Ways through" for a level counts distinct winning methods found; its total is shown as `?` because the game does not claim to know every way.
- **L4** **Ranking** is personal and local: per level, best time, fewest actions (shifts + gate turns), and ways through. A run's rank is its position by time among that level's wins. No data leaves the device.
- **L5** The log keeps the newest 40 records. Storage failure loses records and never blocks play.
