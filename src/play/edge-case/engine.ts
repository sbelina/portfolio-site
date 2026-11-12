/**
 * EDGE CASE simulation. Pure and deterministic: the same inputs at the same
 * fixed step always produce the same state. Discoveries are consequences of
 * the rules below, never of software defects. Unpublished prototype; the
 * marker keeps it out of production output.
 */
export const UNPUBLISHED_MARKER = 'EDGE_CASE_UNPUBLISHED_PROTOTYPE_7d3e'

export const STEP = 1 / 60
export const PLAYER_HALF = 0.3
export const PLAYER_MAX_SPEED = 4
const PLAYER_ACCEL = 34
const PLAYER_BRAKE = 46
const CORNER_ASSIST = 3.2
const GATE_THICKNESS = 0.12
const ARM_HALF = 0.06
export const GATE_REACH = 1.3
export const JUNCTION_REACH = 1.6
/** Steps of continuous pressing before a push turns a junction or gate (MECHANICS.md §4a). */
export const PUSH_STEPS = 8
/** Steps after a turn before the same structure can turn again. */
export const TURN_COOLDOWN = 18
export const TRACER_HIT = 0.55
const SAMPLE_REACH = 0.5
const EXIT_REACH = 0.45
const FIELD_HALF = 0.2
const TRAIL_EVERY = 3
const TRAIL_LIMIT = 900

/** North, east, south, west. */
export type Dir = 0 | 1 | 2 | 3
export const DX = [0, 1, 0, -1] as const
export const DY = [-1, 0, 1, 0] as const
const right = (d: Dir) => ((d + 1) % 4) as Dir
const left = (d: Dir) => ((d + 3) % 4) as Dir
const back = (d: Dir) => ((d + 2) % 4) as Dir
/** A channel gate lets movement through along one axis only. */
export type Axis = 'ns' | 'ew'
const axisOf = (d: Dir): Axis => (d % 2 === 0 ? 'ns' : 'ew')

/**
 * Map legend: # wall · . floor · = tracer track · * sample on track · o sample
 * · P start · E exit · H/V channel gate (open east–west / north–south) · ~ timed field.
 * Junctions sit on grid corners, listed separately: corner (x, y) touches the
 * four tiles (x-1, y-1), (x, y-1), (x, y) and (x-1, y).
 */
export interface LevelDef {
  id: string
  /** Three-bit index shown with the title, e.g. 010. */
  code: string
  title: string
  /** One short line; levels teach through play, not instructions. */
  hint: string
  map: string[]
  tracers: { x: number; y: number; dir: Dir; speed: number }[]
  junctions?: { x: number; y: number }[]
  /** Samples needed to open the exit. Defaults to all of them. */
  required?: number
  /**
   * Interface-only stuck hints (MECHANICS.md §11). Shown in order once playing time
   * passes `after` seconds without the level's progress condition being met.
   */
  hints?: { progress: 'shift' | 'sample' | 'exit-open'; steps: { after: number; text: string }[] }
  field?: { period: number; on: number; warn: number; offset?: number }
}

export type DiscoveryId = 'false-start' | 'expected-behavior' | 'reroute' | 'not-a-bug' | 'pivot' | 'technically-correct' | 'exception' | 'ten-types' | 'off-by-one' | 'full-circle'

export type Tile = 'wall' | 'floor' | 'track' | 'gate' | 'field'
export interface Gate { x: number; y: number; axis: Axis; cooldown: number }
export interface Junction { x: number; y: number; turns: number; net: number; cooldown: number }
export type Turn = 'cw' | 'ccw'
export interface Tracer {
  x: number; y: number; dir: Dir; next: { x: number; y: number } | null; progress: number; speed: number
  start: { x: number; y: number; dir: Dir }; departed: boolean
}
export interface Sample { x: number; y: number; taken: boolean }
export type FailCause = 'tracer' | 'field'
export type GameEvent =
  | { type: 'sample'; remaining: number }
  | { type: 'exit-open' }
  | { type: 'gate'; axis: Axis }
  | { type: 'shift'; x: number; y: number; carried: number; dir: Turn }
  | { type: 'jammed' }
  | { type: 'discovery'; id: DiscoveryId }
  | { type: 'fail'; cause: FailCause }
  | { type: 'won' }

export interface GameState {
  level: LevelDef
  width: number
  height: number
  tiles: Tile[][]
  tick: number
  time: number
  player: { x: number; y: number; vx: number; vy: number }
  exit: { x: number; y: number }
  required: number
  samples: Sample[]
  gates: Gate[]
  junctions: Junction[]
  tracers: Tracer[]
  status: 'playing' | 'failed' | 'won'
  /** How a won attempt ended (§9, S4): complete with the required samples, or partial. */
  outcome: 'complete' | 'partial' | null
  failCause: FailCause | null
  gateTurns: number
  shifts: number
  moved: boolean
  /** The tile the player's centre occupies, and how it was entered (MECHANICS.md §6). */
  tile: { x: number; y: number; enteredBy: 'start' | 'move' | 'shift' }
  /** A push in progress against one structure, in one direction (MECHANICS.md §4a). */
  push: { key: string; kind: 'junction' | 'gate'; x: number; y: number; dir: Turn | 'axis'; steps: number } | null
  discovered: DiscoveryId[]
  trail: [number, number][]
  events: GameEvent[]
}

/** Movement is the only input: structures turn when pushed (MECHANICS.md §4a). */
export interface Input { dx: number; dy: number }
export const idle: Input = { dx: 0, dy: 0 }

/** The four pocket tiles of a junction, clockwise from north-west. */
export const pockets = (j: { x: number; y: number }) => [
  { x: j.x - 1, y: j.y - 1 }, { x: j.x, y: j.y - 1 }, { x: j.x, y: j.y }, { x: j.x - 1, y: j.y },
]
const pocketIndex = (j: { x: number; y: number }, x: number, y: number) => pockets(j).findIndex(p => p.x === x && p.y === y)

export function createGame(level: LevelDef): GameState {
  const height = level.map.length
  const width = level.map[0].length
  if (level.map.some(row => row.length !== width)) throw new Error(`Level ${level.id} rows must share one width`)
  const tiles: Tile[][] = []
  const samples: Sample[] = []
  const gates: Gate[] = []
  let player: { x: number; y: number } | null = null
  let exit: { x: number; y: number } | null = null
  level.map.forEach((row, y) => {
    tiles.push([...row].map((char, x) => {
      if (char === '#') return 'wall'
      if (char === '=') return 'track'
      if (char === '*') { samples.push({ x, y, taken: false }); return 'track' }
      if (char === 'o') { samples.push({ x, y, taken: false }); return 'floor' }
      if (char === 'H' || char === 'V') { gates.push({ x, y, axis: char === 'H' ? 'ew' : 'ns', cooldown: 0 }); return 'gate' }
      if (char === '~') return 'field'
      if (char === 'P') player = { x, y }
      else if (char === 'E') exit = { x, y }
      else if (char !== '.') throw new Error(`Unknown map symbol ${char} in ${level.id}`)
      return 'floor'
    }))
  })
  if (!player || !exit) throw new Error(`Level ${level.id} needs a start and an exit`)
  const enclosed = tiles.every((row, y) => y === 0 || y === height - 1 ? row.every(t => t === 'wall') : row[0] === 'wall' && row[width - 1] === 'wall')
  if (!enclosed) throw new Error(`Level ${level.id} must be enclosed`)
  const junctions: Junction[] = (level.junctions ?? []).map(j => ({ ...j, turns: 0, net: 0, cooldown: 0 }))
  const claimed = new Set<string>()
  for (const j of junctions) for (const p of pockets(j)) {
    const t = tiles[p.y]?.[p.x]
    if (t === undefined || t === 'wall' || t === 'gate') throw new Error(`Junction pockets in ${level.id} must be open tiles`)
    if (claimed.has(`${p.x},${p.y}`)) throw new Error(`Junctions in ${level.id} cannot share a pocket`)
    claimed.add(`${p.x},${p.y}`)
  }
  const start = player as { x: number; y: number }
  const required = level.required ?? samples.length
  if (required > samples.length) throw new Error(`Level ${level.id} requires more samples than it has`)
  const state: GameState = {
    level, width, height, tiles, tick: 0, time: 0,
    player: { x: start.x + 0.5, y: start.y + 0.5, vx: 0, vy: 0 },
    exit: exit as { x: number; y: number }, required, samples, gates, junctions, tracers: [], status: 'playing', outcome: null, failCause: null,
    gateTurns: 0, shifts: 0, moved: false, tile: { x: start.x, y: start.y, enteredBy: 'start' }, push: null, discovered: [], trail: [], events: [],
  }
  for (const def of level.tracers) {
    if (!rides(state, def.x, def.y)) throw new Error(`Tracer in ${level.id} must start on track`)
    const tracer: Tracer = { x: def.x, y: def.y, dir: def.dir, next: null, progress: 0, speed: def.speed, start: { x: def.x, y: def.y, dir: def.dir }, departed: false }
    chooseNext(state, tracer)
    state.tracers.push(tracer)
  }
  return state
}

const tileAt = (s: Pick<GameState, 'tiles' | 'width' | 'height'>, x: number, y: number): Tile =>
  x < 0 || y < 0 || x >= s.width || y >= s.height ? 'wall' : s.tiles[y][x]
export const gateAt = (s: Pick<GameState, 'gates'>, x: number, y: number) => s.gates.find(g => g.x === x && g.y === y)
const rides = (s: GameState, x: number, y: number) => { const t = tileAt(s, x, y); return t === 'track' || t === 'gate' }
/** Junction arms separate every pair of its pockets. */
const armsBetween = (s: GameState, ax: number, ay: number, bx: number, by: number) =>
  s.junctions.some(j => pocketIndex(j, ax, ay) >= 0 && pocketIndex(j, bx, by) >= 0)

/** The same structures constrain tracers that constrain the player. */
export function tracerCanMove(s: GameState, x: number, y: number, d: Dir) {
  const nx = x + DX[d], ny = y + DY[d]
  if (!rides(s, x, y) || !rides(s, nx, ny) || armsBetween(s, x, y, nx, ny)) return false
  const here = gateAt(s, x, y), there = gateAt(s, nx, ny)
  return (!here || here.axis === axisOf(d)) && (!there || there.axis === axisOf(d))
}

/** Straight if possible, otherwise right, then left, then reverse at a dead end. */
export function nextDirection(s: GameState, x: number, y: number, d: Dir): Dir | null {
  for (const option of [d, right(d), left(d), back(d)]) if (tracerCanMove(s, x, y, option)) return option
  return null
}

function chooseNext(s: GameState, tracer: Tracer) {
  const d = nextDirection(s, tracer.x, tracer.y, tracer.dir)
  if (d === null) { tracer.next = null; return }
  tracer.dir = d
  tracer.next = { x: tracer.x + DX[d], y: tracer.y + DY[d] }
}

export function tracerPosition(t: Tracer, extra = 0) {
  const nx = t.next ? t.next.x : t.x, ny = t.next ? t.next.y : t.y
  const p = Math.min(1, t.progress + (t.next ? extra : 0))
  return { x: t.x + 0.5 + (nx - t.x) * p, y: t.y + 0.5 + (ny - t.y) * p }
}

/** Tile centres a tracer will visit next under the current configuration. */
/**
 * A tracer's whole repeating route under the current configuration (R8): tile centres
 * from its position until its (tile, direction) state repeats. Used by Reveal and Inspect.
 */
export function tracerCycle(s: GameState, t: Tracer, limit = 400) {
  const at = tracerPosition(t)
  const points: { x: number; y: number }[] = [at]
  if (!t.next) return points
  const seen = new Set<string>()
  let x = t.next.x, y = t.next.y, d = t.dir
  for (let i = 0; i < limit; i++) {
    points.push({ x: x + 0.5, y: y + 0.5 })
    const nd = nextDirection(s, x, y, d)
    if (nd === null) break
    const key = `${x},${y},${nd}`
    if (seen.has(key)) break
    seen.add(key)
    d = nd; x += DX[d]; y += DY[d]
  }
  return points
}

export function predictPath(s: GameState, t: Tracer, count: number) {
  const points: { x: number; y: number }[] = []
  let x = t.x, y = t.y, d = t.dir
  let next = t.next
  for (let i = 0; i < count && next; i++) {
    points.push({ x: next.x + 0.5, y: next.y + 0.5 })
    x = next.x; y = next.y
    const nd = nextDirection(s, x, y, d)
    if (nd === null) break
    d = nd
    next = { x: x + DX[d], y: y + DY[d] }
  }
  return points
}

type Owner = { kind: 'junction'; junction: Junction } | { kind: 'gate'; gate: Gate }
interface Rect { x0: number; y0: number; x1: number; y1: number; owner?: Owner }
function solids(s: GameState, cx: number, cy: number): Rect[] {
  const rects: Rect[] = []
  for (let y = Math.floor(cy) - 2; y <= Math.floor(cy) + 2; y++) for (let x = Math.floor(cx) - 2; x <= Math.floor(cx) + 2; x++) {
    if (tileAt(s, x, y) === 'wall') { rects.push({ x0: x, y0: y, x1: x + 1, y1: y + 1 }); continue }
    const gate = gateAt(s, x, y)
    if (!gate) continue
    const owner: Owner = { kind: 'gate', gate }
    if (gate.axis === 'ew') rects.push({ x0: x, y0: y, x1: x + 1, y1: y + GATE_THICKNESS, owner }, { x0: x, y0: y + 1 - GATE_THICKNESS, x1: x + 1, y1: y + 1, owner })
    else rects.push({ x0: x, y0: y, x1: x + GATE_THICKNESS, y1: y + 1, owner }, { x0: x + 1 - GATE_THICKNESS, y0: y, x1: x + 1, y1: y + 1, owner })
  }
  for (const j of s.junctions) {
    if (Math.abs(j.x - cx) > 3 || Math.abs(j.y - cy) > 3) continue
    const owner: Owner = { kind: 'junction', junction: j }
    rects.push({ x0: j.x - ARM_HALF, y0: j.y - 1, x1: j.x + ARM_HALF, y1: j.y + 1, owner }, { x0: j.x - 1, y0: j.y - ARM_HALF, x1: j.x + 1, y1: j.y + ARM_HALF, owner })
  }
  return rects
}
const overlaps = (px: number, py: number, h: number, r: Rect) => px + h > r.x0 && px - h < r.x1 && py + h > r.y0 && py - h < r.y1

function moveAxis(s: GameState, axis: 'x' | 'y', delta: number) {
  const p = s.player
  if (delta === 0) return null
  p[axis] += delta
  let blocked: Rect | null = null
  for (const r of solids(s, p.x, p.y)) {
    if (!overlaps(p.x, p.y, PLAYER_HALF, r)) continue
    // A pushable structure takes precedence over a wall when both block (§4a, PU1).
    if (!blocked || (!blocked.owner && r.owner)) blocked = r
    if (axis === 'x') p.x = delta > 0 ? r.x0 - PLAYER_HALF - 1e-6 : r.x1 + PLAYER_HALF + 1e-6
    else p.y = delta > 0 ? r.y0 - PLAYER_HALF - 1e-6 : r.y1 + PLAYER_HALF + 1e-6
  }
  if (blocked) { if (axis === 'x') p.vx = 0; else p.vy = 0 }
  return blocked
}

/** Sliding into a doorway should not require pixel-perfect alignment. */
function assist(s: GameState, axis: 'x' | 'y', sign: number, dt: number) {
  const p = s.player
  const across = axis === 'x' ? 'y' : 'x'
  const lane = Math.floor(p[across])
  const ahead = axis === 'x' ? tileAt(s, Math.floor(p.x + sign * (PLAYER_HALF + 0.05)), lane) : tileAt(s, lane, Math.floor(p.y + sign * (PLAYER_HALF + 0.05)))
  if (ahead === 'wall') return
  const offset = lane + 0.5 - p[across]
  if (Math.abs(offset) < 0.01) return
  moveAxis(s, across, Math.sign(offset) * Math.min(Math.abs(offset), CORNER_ASSIST * dt))
}

const approach = (value: number, target: number, rate: number) => value < target ? Math.min(target, value + rate) : Math.max(target, value - rate)

export function fieldPhase(s: GameState) {
  const f = s.level.field
  if (!f) return { active: false, warning: false, untilChange: Infinity }
  const t = (s.time + (f.offset ?? 0)) % f.period
  return { active: t < f.on, warning: t >= f.period - f.warn, untilChange: t < f.on ? f.on - t : f.period - t }
}

export function gateOccupied(s: GameState, g: Gate) {
  const inside = (x: number, y: number) => x === g.x && y === g.y
  if (s.tracers.some(t => inside(t.x, t.y) || (t.next && inside(t.next.x, t.next.y)))) return true
  const m = 0.02
  return overlaps(s.player.x, s.player.y, PLAYER_HALF, { x0: g.x + m, y0: g.y + m, x1: g.x + 1 - m, y1: g.y + 1 - m })
}

export type Reachable = { kind: 'gate'; gate: Gate } | { kind: 'junction'; junction: Junction }
/** The nearest turnable structure within reach: drives the reach ring and the canvas text alternative. */
export function reachable(s: GameState): Reachable | null {
  let best: Reachable | null = null, distance = Infinity
  for (const gate of s.gates) {
    const d = Math.hypot(gate.x + 0.5 - s.player.x, gate.y + 0.5 - s.player.y)
    if (d <= GATE_REACH && d < distance) { best = { kind: 'gate', gate }; distance = d }
  }
  for (const junction of s.junctions) {
    const d = Math.hypot(junction.x - s.player.x, junction.y - s.player.y)
    if (d <= JUNCTION_REACH && d < distance) { best = { kind: 'junction', junction }; distance = d }
  }
  return best
}

export const collected = (s: GameState) => s.samples.filter(sample => sample.taken).length
/** Complete is available: enough samples are collected (§9, S2). The exit itself is always open. */
export const exitOpen = (s: GameState) => collected(s) >= s.required

function discover(s: GameState, id: DiscoveryId) {
  if (s.discovered.includes(id)) return
  s.discovered.push(id)
  s.events.push({ type: 'discovery', id })
}

/** Margin that keeps a carried body fully inside its new pocket, clear of the arms. */
const POCKET_MARGIN = PLAYER_HALF + ARM_HALF + 0.01

/**
 * Turn a junction a quarter turn (MECHANICS.md §4). Membership is by centre point only.
 * - Player: position offset from the corner and velocity both rotate 90° in the turn's
 *   direction; the body is then clamped fully inside the arrival pocket.
 * - Tracers (tile-bound): snap to the arrival pocket's centre, turn the same way
 *   (right for clockwise, left for counter-clockwise), restart from progress 0.
 * - Samples: move to the arrival pocket.
 * The exit, track, fields and channel gates never move.
 */
export function turnJunction(s: GameState, j: Junction, dir: Turn) {
  const ring = pockets(j)
  const turn = dir === 'cw' ? 1 : 3
  const pocketOf = (x: number, y: number) => ring.findIndex(p => p.x === Math.floor(x) && p.y === Math.floor(y))
  let carried = 0
  const p = s.player
  const playerPocket = pocketOf(p.x, p.y)
  if (playerPocket >= 0) {
    const to = ring[(playerPocket + turn) % 4]
    const ox = p.x - j.x, oy = p.y - j.y
    const clamp = (value: number, low: number) => Math.min(low + 1 - POCKET_MARGIN, Math.max(low + POCKET_MARGIN, value))
    // Clockwise on screen (y down): (x, y) → (−y, x). Counter-clockwise: (x, y) → (y, −x).
    if (dir === 'cw') { p.x = clamp(j.x - oy, to.x); p.y = clamp(j.y + ox, to.y); const vx = p.vx; p.vx = -p.vy; p.vy = vx }
    else { p.x = clamp(j.x + oy, to.x); p.y = clamp(j.y - ox, to.y); const vx = p.vx; p.vx = p.vy; p.vy = -vx }
    s.tile = { x: Math.floor(p.x), y: Math.floor(p.y), enteredBy: 'shift' }
    carried++
  }
  for (const t of s.tracers) {
    const at = tracerPosition(t)
    const from = pocketOf(at.x, at.y)
    if (from < 0) continue
    const to = ring[(from + turn) % 4]
    t.x = to.x; t.y = to.y; t.progress = 0; t.dir = dir === 'cw' ? right(t.dir) : left(t.dir); t.departed = true
    chooseNext(s, t)
    discover(s, rides(s, t.x, t.y) && t.next ? 'reroute' : 'not-a-bug')
    carried++
  }
  for (const sample of s.samples) {
    if (sample.taken) continue
    const from = pocketOf(sample.x + 0.5, sample.y + 0.5)
    if (from < 0) continue
    const to = ring[(from + turn) % 4]
    sample.x = to.x; sample.y = to.y
    carried++
  }
  j.turns++
  j.net += dir === 'cw' ? 1 : -1
  j.cooldown = TURN_COOLDOWN
  s.shifts++
  s.events.push({ type: 'shift', x: j.x, y: j.y, carried, dir })
  // A full turn in one direction: net rotation back to the start (§8, 0x09).
  if (j.net !== 0 && j.net % 4 === 0) discover(s, 'full-circle')
}

function turnGate(s: GameState, gate: Gate) {
  if (gateOccupied(s, gate)) { s.events.push({ type: 'jammed' }); gate.cooldown = TURN_COOLDOWN; return }
  gate.axis = gate.axis === 'ew' ? 'ns' : 'ew'
  gate.cooldown = TURN_COOLDOWN
  s.gateTurns++
  s.events.push({ type: 'gate', axis: gate.axis })
  discover(s, 'pivot')
  for (const t of s.tracers) if (t.progress === 0) chooseNext(s, t)
}

/**
 * §4a Push: pressing into a junction arm (from inside one of its pockets) or across a
 * channel gate's bars for PUSH_STEPS consecutive steps turns it. A junction turns the
 * way the push would spin it about its corner: torque = ox·fy − oy·fx (y down), positive
 * = clockwise. A push straight at the corner has zero torque and turns nothing.
 */
function resolvePush(s: GameState, input: Input, blockedX: Rect | null, blockedY: Rect | null) {
  for (const j of s.junctions) if (j.cooldown > 0) j.cooldown--
  for (const g of s.gates) if (g.cooldown > 0) g.cooldown--
  const p = s.player
  const candidates: [Rect | null, number, number][] = [[blockedX, Math.sign(input.dx), 0], [blockedY, 0, Math.sign(input.dy)]]
  for (const [rect, fx, fy] of candidates) {
    if (!rect?.owner || (fx === 0 && fy === 0)) continue
    let key: string, dir: Turn | 'axis', x: number, y: number
    if (rect.owner.kind === 'junction') {
      const j = rect.owner.junction
      if (pocketIndex(j, Math.floor(p.x), Math.floor(p.y)) < 0) continue
      const torque = (p.x - j.x) * fy - (p.y - j.y) * fx
      if (Math.abs(torque) < 1e-9) continue
      dir = torque > 0 ? 'cw' : 'ccw'
      key = `j${j.x},${j.y}${dir}`; x = j.x; y = j.y
    } else {
      const g = rect.owner.gate
      dir = 'axis'; key = `g${g.x},${g.y}`; x = g.x + 0.5; y = g.y + 0.5
    }
    const steps = s.push?.key === key ? s.push.steps + 1 : 1
    s.push = { key, kind: rect.owner.kind, x, y, dir, steps }
    if (steps < PUSH_STEPS) return
    if (rect.owner.kind === 'junction' && rect.owner.junction.cooldown === 0) { turnJunction(s, rect.owner.junction, dir as Turn); s.push = null }
    else if (rect.owner.kind === 'gate' && rect.owner.gate.cooldown === 0) { turnGate(s, rect.owner.gate); s.push = null }
    return
  }
  s.push = null
}

export function step(s: GameState, input: Input, dt = STEP) {
  if (s.status !== 'playing') return s
  const p = s.player
  if (input.dx || input.dy) s.moved = true
  // Movement (P2): input longer than 1 is normalised (keyboard diagonals); shorter
  // input from the joystick is partial speed. Predictable acceleration and braking.
  const length = Math.hypot(input.dx, input.dy)
  const scale = length > 1 ? 1 / length : 1
  const tx = input.dx * scale * PLAYER_MAX_SPEED, ty = input.dy * scale * PLAYER_MAX_SPEED
  p.vx = approach(p.vx, tx, (tx === 0 ? PLAYER_BRAKE : PLAYER_ACCEL) * dt)
  p.vy = approach(p.vy, ty, (ty === 0 ? PLAYER_BRAKE : PLAYER_ACCEL) * dt)
  const blockedX = moveAxis(s, 'x', p.vx * dt)
  const blockedY = moveAxis(s, 'y', p.vy * dt)
  if (input.dx !== 0 && input.dy === 0 && blockedX) assist(s, 'x', Math.sign(input.dx), dt)
  if (input.dy !== 0 && input.dx === 0 && blockedY) assist(s, 'y', Math.sign(input.dy), dt)
  if (Math.floor(p.x) !== s.tile.x || Math.floor(p.y) !== s.tile.y) s.tile = { x: Math.floor(p.x), y: Math.floor(p.y), enteredBy: 'move' }

  resolvePush(s, input, blockedX, blockedY)

  for (const t of s.tracers) {
    if (!t.next) { chooseNext(s, t); continue }
    t.progress += t.speed * dt
    while (t.progress >= 1 && t.next) {
      t.x = t.next.x; t.y = t.next.y
      t.progress -= 1
      if (t.x !== t.start.x || t.y !== t.start.y) t.departed = true
      chooseNext(s, t)
      if (!t.next) t.progress = 0
      // Watching one complete cycle before touching anything.
      if (t.departed && t.x === t.start.x && t.y === t.start.y && t.dir === t.start.dir && !s.moved) discover(s, 'expected-behavior')
    }
  }

  const wasOpen = exitOpen(s)
  for (const sample of s.samples) {
    if (sample.taken || Math.hypot(sample.x + 0.5 - p.x, sample.y + 0.5 - p.y) > SAMPLE_REACH) continue
    sample.taken = true
    s.events.push({ type: 'sample', remaining: s.samples.length - collected(s) })
  }
  if (!wasOpen && exitOpen(s)) s.events.push({ type: 'exit-open' })

  s.time += dt
  s.tick++
  if (s.tick % TRAIL_EVERY === 0 && s.trail.length < TRAIL_LIMIT) s.trail.push([p.x, p.y])

  for (const t of s.tracers) {
    const at = tracerPosition(t)
    if (Math.hypot(at.x - p.x, at.y - p.y) < TRACER_HIT) return fail(s, 'tracer')
  }
  if (fieldPhase(s).active) {
    for (let y = Math.floor(p.y) - 1; y <= Math.floor(p.y) + 1; y++) for (let x = Math.floor(p.x) - 1; x <= Math.floor(p.x) + 1; x++) {
      if (tileAt(s, x, y) === 'field' && overlaps(p.x, p.y, FIELD_HALF, { x0: x, y0: y, x1: x + 1, y1: y + 1 })) return fail(s, 'field')
    }
  }
  // S3–S4: the exit always lets you leave; enough samples make it complete, fewer partial.
  if (Math.hypot(s.exit.x + 0.5 - p.x, s.exit.y + 0.5 - p.y) < EXIT_REACH) {
    s.status = 'won'
    s.outcome = exitOpen(s) ? 'complete' : 'partial'
    if (s.level.code === '000' && s.outcome === 'complete') discover(s, 'false-start')
    if (s.tile.enteredBy === 'shift' && s.tile.x === s.exit.x && s.tile.y === s.exit.y) discover(s, 'technically-correct')
    if (s.outcome === 'complete' && collected(s) < s.samples.length) discover(s, 'exception')
    // One more step and a tracer would have arrived.
    if (s.tracers.some(t => { const at = tracerPosition(t, t.speed * STEP); return Math.hypot(at.x - p.x, at.y - p.y) < TRACER_HIT })) discover(s, 'off-by-one')
    s.events.push({ type: 'won' })
  }
  return s
}

function fail(s: GameState, cause: FailCause) {
  s.status = 'failed'
  s.failCause = cause
  s.events.push({ type: 'fail', cause })
  return s
}

export function drainEvents(s: GameState) {
  const events = s.events
  s.events = []
  return events
}
