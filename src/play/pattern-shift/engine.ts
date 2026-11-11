/**
 * Pattern Shift simulation. Pure, deterministic and independent of rendering:
 * the same inputs at the same fixed step always produce the same state.
 * Unpublished prototype; the marker below keeps it out of production output.
 */
export const UNPUBLISHED_MARKER = 'PATTERN_SHIFT_UNPUBLISHED_PROTOTYPE_7d3e'

export const STEP = 1 / 60
export const PLAYER_HALF = 0.3
export const PLAYER_MAX_SPEED = 4
const PLAYER_ACCEL = 34
const PLAYER_BRAKE = 46
const CORNER_ASSIST = 3.2
const GATE_THICKNESS = 0.12
export const GATE_REACH = 1.3
const TRACER_HIT = 0.55
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
/** A gate channel lets movement through along one axis only. */
export type Axis = 'ns' | 'ew'
const axisOf = (d: Dir): Axis => (d % 2 === 0 ? 'ns' : 'ew')

/**
 * Map legend: # wall · . floor · = tracer track · * sample on track · o sample
 * · P start · E exit · H gate open east–west · V gate open north–south · ~ timed field.
 */
export interface LevelDef {
  id: string
  title: string
  /** One short line; levels teach through play, not instructions. */
  hint: string
  map: string[]
  tracers: { x: number; y: number; dir: Dir; speed: number }[]
  field?: { period: number; on: number; warn: number; offset?: number }
}

export type Tile = 'wall' | 'floor' | 'track' | 'gate' | 'field'
export interface Gate { x: number; y: number; axis: Axis }
export interface Tracer { x: number; y: number; dir: Dir; next: { x: number; y: number } | null; progress: number; speed: number }
export interface Sample { x: number; y: number; taken: boolean }
export type FailCause = 'tracer' | 'field'
export type GameEvent =
  | { type: 'sample'; remaining: number }
  | { type: 'exit-open' }
  | { type: 'gate'; axis: Axis }
  | { type: 'jammed' }
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
  samples: Sample[]
  gates: Gate[]
  tracers: Tracer[]
  status: 'playing' | 'failed' | 'won'
  failCause: FailCause | null
  gateTurns: number
  trail: [number, number][]
  events: GameEvent[]
}

export interface Input { dx: number; dy: number; action: boolean }
export const idle: Input = { dx: 0, dy: 0, action: false }

export function parseLevel(level: LevelDef): Omit<GameState, 'tracers'> & { tracers: Tracer[] } {
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
  const start = player as { x: number; y: number }
  return {
    level, width, height, tiles, tick: 0, time: 0,
    player: { x: start.x + 0.5, y: start.y + 0.5, vx: 0, vy: 0 },
    exit: exit as { x: number; y: number }, samples, gates, tracers: [], status: 'playing', failCause: null, gateTurns: 0, trail: [], events: [],
  }
}

export function createGame(level: LevelDef): GameState {
  const state = parseLevel(level)
  for (const def of level.tracers) {
    if (!rides(state, def.x, def.y)) throw new Error(`Tracer in ${level.id} must start on track`)
    const tracer: Tracer = { x: def.x, y: def.y, dir: def.dir, next: null, progress: 0, speed: def.speed }
    chooseNext(state, tracer)
    state.tracers.push(tracer)
  }
  return state
}

const tileAt = (s: Pick<GameState, 'tiles' | 'width' | 'height'>, x: number, y: number): Tile =>
  x < 0 || y < 0 || x >= s.width || y >= s.height ? 'wall' : s.tiles[y][x]
export const gateAt = (s: Pick<GameState, 'gates'>, x: number, y: number) => s.gates.find(g => g.x === x && g.y === y)
const rides = (s: GameState, x: number, y: number) => { const t = tileAt(s, x, y); return t === 'track' || t === 'gate' }

/** The same channel rule constrains tracers that constrains the player. */
export function tracerCanMove(s: GameState, x: number, y: number, d: Dir) {
  const nx = x + DX[d], ny = y + DY[d]
  if (!rides(s, nx, ny)) return false
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

export function tracerPosition(t: Tracer) {
  const nx = t.next ? t.next.x : t.x, ny = t.next ? t.next.y : t.y
  return { x: t.x + 0.5 + (nx - t.x) * t.progress, y: t.y + 0.5 + (ny - t.y) * t.progress }
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

export function reachableGate(s: GameState) {
  let best: Gate | null = null, distance = GATE_REACH
  for (const g of s.gates) {
    const d = Math.hypot(g.x + 0.5 - s.player.x, g.y + 0.5 - s.player.y)
    if (d <= distance) { best = g; distance = d }
  }
  return best
}

export const exitOpen = (s: GameState) => s.samples.every(sample => sample.taken)

export function step(s: GameState, input: Input, dt = STEP) {
  if (s.status !== 'playing') return s
  const p = s.player
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
    const gate = reachableGate(s)
    if (gate && gateOccupied(s, gate)) s.events.push({ type: 'jammed' })
    else if (gate) {
      gate.axis = gate.axis === 'ew' ? 'ns' : 'ew'
      s.gateTurns++
      s.events.push({ type: 'gate', axis: gate.axis })
      // A turned gate can strand a tracer mid-route; it re-chooses from its tile.
      for (const t of s.tracers) if (t.progress === 0) chooseNext(s, t)
    }
  }

  for (const t of s.tracers) {
    if (!t.next) { chooseNext(s, t); continue }
    t.progress += t.speed * dt
    while (t.progress >= 1 && t.next) {
      t.x = t.next.x; t.y = t.next.y
      t.progress -= 1
      chooseNext(s, t)
      if (!t.next) t.progress = 0
    }
  }

  for (const sample of s.samples) {
    if (sample.taken || Math.hypot(sample.x + 0.5 - p.x, sample.y + 0.5 - p.y) > SAMPLE_REACH) continue
    sample.taken = true
    const remaining = s.samples.filter(item => !item.taken).length
    s.events.push({ type: 'sample', remaining })
    if (remaining === 0) s.events.push({ type: 'exit-open' })
  }

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
