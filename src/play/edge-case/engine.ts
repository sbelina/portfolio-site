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
  field?: { period: number; on: number; warn: number; offset?: number }
}

export type DiscoveryId = 'false-start' | 'expected-behavior' | 'reroute' | 'not-a-bug' | 'pivot' | 'technically-correct' | 'exception' | 'ten-types' | 'off-by-one' | 'full-circle'

export type Tile = 'wall' | 'floor' | 'track' | 'gate' | 'field'
export interface Gate { x: number; y: number; axis: Axis }
export interface Junction { x: number; y: number; turns: number }
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
  | { type: 'shift'; x: number; y: number; carried: number }
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
  failCause: FailCause | null
  gateTurns: number
  shifts: number
  moved: boolean
  carriedThisStep: boolean
  discovered: DiscoveryId[]
  trail: [number, number][]
  events: GameEvent[]
}

export interface Input { dx: number; dy: number; action: boolean }
export const idle: Input = { dx: 0, dy: 0, action: false }

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
      if (char === 'H' || char === 'V') { gates.push({ x, y, axis: char === 'H' ? 'ew' : 'ns' }); return 'gate' }
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
  const junctions: Junction[] = (level.junctions ?? []).map(j => ({ ...j, turns: 0 }))
  for (const j of junctions) for (const p of pockets(j)) {
    const t = tiles[p.y]?.[p.x]
    if (t === undefined || t === 'wall' || t === 'gate') throw new Error(`Junction pockets in ${level.id} must be open tiles`)
  }
  const start = player as { x: number; y: number }
  const required = level.required ?? samples.length
  if (required > samples.length) throw new Error(`Level ${level.id} requires more samples than it has`)
  const state: GameState = {
    level, width, height, tiles, tick: 0, time: 0,
    player: { x: start.x + 0.5, y: start.y + 0.5, vx: 0, vy: 0 },
    exit: exit as { x: number; y: number }, required, samples, gates, junctions, tracers: [], status: 'playing', failCause: null,
    gateTurns: 0, shifts: 0, moved: false, carriedThisStep: false, discovered: [], trail: [], events: [],
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

interface Rect { x0: number; y0: number; x1: number; y1: number }
function solids(s: GameState, cx: number, cy: number): Rect[] {
  const rects: Rect[] = []
  for (let y = Math.floor(cy) - 2; y <= Math.floor(cy) + 2; y++) for (let x = Math.floor(cx) - 2; x <= Math.floor(cx) + 2; x++) {
    if (tileAt(s, x, y) === 'wall') { rects.push({ x0: x, y0: y, x1: x + 1, y1: y + 1 }); continue }
    const gate = gateAt(s, x, y)
    if (!gate) continue
    if (gate.axis === 'ew') rects.push({ x0: x, y0: y, x1: x + 1, y1: y + GATE_THICKNESS }, { x0: x, y0: y + 1 - GATE_THICKNESS, x1: x + 1, y1: y + 1 })
    else rects.push({ x0: x, y0: y, x1: x + GATE_THICKNESS, y1: y + 1 }, { x0: x + 1 - GATE_THICKNESS, y0: y, x1: x + 1, y1: y + 1 })
  }
  for (const j of s.junctions) {
    if (Math.abs(j.x - cx) > 3 || Math.abs(j.y - cy) > 3) continue
    rects.push({ x0: j.x - ARM_HALF, y0: j.y - 1, x1: j.x + ARM_HALF, y1: j.y + 1 }, { x0: j.x - 1, y0: j.y - ARM_HALF, x1: j.x + 1, y1: j.y + ARM_HALF })
  }
  return rects
}
const overlaps = (px: number, py: number, h: number, r: Rect) => px + h > r.x0 && px - h < r.x1 && py + h > r.y0 && py - h < r.y1

function moveAxis(s: GameState, axis: 'x' | 'y', delta: number) {
  const p = s.player
  if (delta === 0) return false
  p[axis] += delta
  let blocked = false
  for (const r of solids(s, p.x, p.y)) {
    if (!overlaps(p.x, p.y, PLAYER_HALF, r)) continue
    blocked = true
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
/** The nearest thing within reach that the player's action would turn. */
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
export const exitOpen = (s: GameState) => collected(s) >= s.required

function discover(s: GameState, id: DiscoveryId) {
  if (s.discovered.includes(id)) return
  s.discovered.push(id)
  s.events.push({ type: 'discovery', id })
}

/**
 * Shift a junction: anything whose centre lies in one of its pockets moves to the
 * centre of the next pocket clockwise. Tracers turn with it. The exit, fields and
 * track stay where they are.
 */
function shift(s: GameState, j: Junction) {
  const ring = pockets(j)
  const pocketOf = (x: number, y: number) => ring.findIndex(p => p.x === Math.floor(x) && p.y === Math.floor(y))
  let carried = 0
  const p = s.player
  const playerPocket = pocketOf(p.x, p.y)
  if (playerPocket >= 0) {
    const to = ring[(playerPocket + 1) % 4]
    p.x = to.x + 0.5; p.y = to.y + 0.5; p.vx = 0; p.vy = 0
    s.carriedThisStep = true
    carried++
  }
  for (const t of s.tracers) {
    const at = tracerPosition(t)
    const from = pocketOf(at.x, at.y)
    if (from < 0) continue
    const to = ring[(from + 1) % 4]
    t.x = to.x; t.y = to.y; t.progress = 0; t.dir = right(t.dir); t.departed = true
    chooseNext(s, t)
    discover(s, rides(s, t.x, t.y) && t.next ? 'reroute' : 'not-a-bug')
    carried++
  }
  for (const sample of s.samples) {
    if (sample.taken) continue
    const from = pocketOf(sample.x + 0.5, sample.y + 0.5)
    if (from < 0) continue
    const to = ring[(from + 1) % 4]
    sample.x = to.x; sample.y = to.y
    carried++
  }
  j.turns++
  s.shifts++
  s.events.push({ type: 'shift', x: j.x, y: j.y, carried })
  if (j.turns % 4 === 0) discover(s, 'full-circle')
}

export function step(s: GameState, input: Input, dt = STEP) {
  if (s.status !== 'playing') return s
  const p = s.player
  s.carriedThisStep = false
  if (input.dx || input.dy) s.moved = true
  // Movement: predictable acceleration and braking, diagonal input normalised.
  const length = Math.hypot(input.dx, input.dy) || 1
  const tx = (input.dx / length) * PLAYER_MAX_SPEED, ty = (input.dy / length) * PLAYER_MAX_SPEED
  p.vx = approach(p.vx, tx, (tx === 0 ? PLAYER_BRAKE : PLAYER_ACCEL) * dt)
  p.vy = approach(p.vy, ty, (ty === 0 ? PLAYER_BRAKE : PLAYER_ACCEL) * dt)
  const blockedX = moveAxis(s, 'x', p.vx * dt)
  const blockedY = moveAxis(s, 'y', p.vy * dt)
  if (input.dx !== 0 && input.dy === 0 && blockedX) assist(s, 'x', Math.sign(input.dx), dt)
  if (input.dy !== 0 && input.dx === 0 && blockedY) assist(s, 'y', Math.sign(input.dy), dt)

  if (input.action) {
    const target = reachable(s)
    if (target?.kind === 'junction') shift(s, target.junction)
    else if (target?.kind === 'gate' && gateOccupied(s, target.gate)) s.events.push({ type: 'jammed' })
    else if (target?.kind === 'gate') {
      const gate = target.gate
      gate.axis = gate.axis === 'ew' ? 'ns' : 'ew'
      s.gateTurns++
      s.events.push({ type: 'gate', axis: gate.axis })
      discover(s, 'pivot')
      for (const t of s.tracers) if (t.progress === 0) chooseNext(s, t)
    }
  }

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
  if (exitOpen(s) && Math.hypot(s.exit.x + 0.5 - p.x, s.exit.y + 0.5 - p.y) < EXIT_REACH) {
    s.status = 'won'
    if (s.level.code === '000') discover(s, 'false-start')
    if (s.carriedThisStep) discover(s, 'technically-correct')
    if (collected(s) < s.samples.length) discover(s, 'exception')
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
