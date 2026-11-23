import { collected, exitOpen, fieldPhase, pockets, predictPath, PUSH_STEPS, reachable, tracerCycle, tracerPosition, type Axis, type GameState, type Turn } from './engine'

export interface Palette { paper: string; panel: string; ink: string; muted: string; line: string; soft: string; accent: string; hazard: string; learning: string; predicted: string }
export interface View {
  tile: number
  /** Draw the next steps of every tracer (Always show paths, or Reveal). */
  previews: boolean
  reducedMotion: boolean
  highContrast: boolean
  ghost: [number, number][] | null
  /** Reveal (§12b): the world dims and the system's routes, turns and timing light up. */
  reveal: boolean
  /** Inspect (§12b): one tapped thing shows its part of the system. */
  inspect: Inspect | null
  /** Render-only memory: recent tracer positions and gate rotation animation. */
  memory: { trails: [number, number][][]; gateTurn: Map<string, { from: number; started: number }>; shiftTurn: Map<string, { started: number; dir: Turn }>; jam: { x: number; y: number; until: number } | null }
  now: number
}

export type Inspect =
  | { kind: 'tracer'; index: number } | { kind: 'junction'; index: number } | { kind: 'gate'; index: number }
  | { kind: 'field'; x: number; y: number } | { kind: 'exit' } | { kind: 'sample'; index: number } | { kind: 'player' }

export function readPalette(element: Element): Palette {
  const css = getComputedStyle(element)
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return {
    paper: v('--paper', '#f3efe7'), panel: v('--panel-2', '#e4ddd0'), ink: v('--ink', '#111716'), muted: v('--muted', '#555d58'),
    line: v('--line', '#8b918a'), soft: v('--soft-line', '#d2d1c8'), accent: v('--signal-art', '#ff641c'),
    hazard: v('--pressure', '#9c3e35'), learning: v('--holds', '#21675f'), predicted: v('--unresolved', '#714491'),
  }
}

export const createMemory = (): View['memory'] => ({ trails: [], gateTurn: new Map(), shiftTurn: new Map(), jam: null })
const angleOf = (axis: Axis) => (axis === 'ew' ? 0 : Math.PI / 2)
const GATE_TURN_MS = 160
const SHIFT_TURN_MS = 220

export function noteShift(memory: View['memory'], x: number, y: number, now: number, dir: Turn = 'cw') {
  memory.shiftTurn.set(`${x},${y}`, { started: now, dir })
  // Carried tracers jump; old trail points would draw a misleading line.
  memory.trails = []
}

export function noteGateTurn(memory: View['memory'], x: number, y: number, axis: Axis, now: number) {
  memory.gateTurn.set(`${x},${y}`, { from: angleOf(axis === 'ew' ? 'ns' : 'ew'), started: now })
}

export function draw(ctx: CanvasRenderingContext2D, s: GameState, view: View, c: Palette) {
  const T = view.tile
  const w = s.width * T, h = s.height * T
  const k = view.highContrast ? 1.6 : 1
  const px = (n: number) => n * T
  ctx.save()
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = c.paper
  ctx.fillRect(0, 0, w, h)

  // Construction grid: the arena reads as an instrument, not a maze.
  ctx.strokeStyle = c.soft
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = 1; x < s.width; x++) { ctx.moveTo(px(x) + 0.5, 0); ctx.lineTo(px(x) + 0.5, h) }
  for (let y = 1; y < s.height; y++) { ctx.moveTo(0, px(y) + 0.5); ctx.lineTo(w, px(y) + 0.5) }
  ctx.stroke()

  const field = fieldPhase(s)
  for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) {
    const tile = s.tiles[y][x]
    if (tile === 'wall') {
      // Bolder lines thicken edges rather than flooding walls with ink, so both themes stay calm.
      ctx.fillStyle = c.panel
      ctx.fillRect(px(x), px(y), T, T)
      ctx.strokeStyle = c.ink
      ctx.lineWidth = 1.5 * k
      ctx.beginPath()
      const open = (dx: number, dy: number) => { const t = s.tiles[y + dy]?.[x + dx]; return t !== undefined && t !== 'wall' }
      if (open(0, -1)) { ctx.moveTo(px(x), px(y)); ctx.lineTo(px(x + 1), px(y)) }
      if (open(0, 1)) { ctx.moveTo(px(x), px(y + 1)); ctx.lineTo(px(x + 1), px(y + 1)) }
      if (open(-1, 0)) { ctx.moveTo(px(x), px(y)); ctx.lineTo(px(x), px(y + 1)) }
      if (open(1, 0)) { ctx.moveTo(px(x + 1), px(y)); ctx.lineTo(px(x + 1), px(y + 1)) }
      ctx.stroke()
    } else if (tile === 'field') {
      drawField(ctx, px(x), px(y), T, field, c, k)
    }
  }

  // Track: a dashed rail diagram connecting tile centres.
  ctx.strokeStyle = c.line
  ctx.lineWidth = 1.5 * k
  ctx.setLineDash([T * 0.12, T * 0.1])
  ctx.beginPath()
  const rides = (x: number, y: number) => { const t = s.tiles[y]?.[x]; return t === 'track' || t === 'gate' }
  for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) {
    if (!rides(x, y)) continue
    if (rides(x + 1, y)) { ctx.moveTo(px(x + 0.5), px(y + 0.5)); ctx.lineTo(px(x + 1.5), px(y + 0.5)) }
    if (rides(x, y + 1)) { ctx.moveTo(px(x + 0.5), px(y + 0.5)); ctx.lineTo(px(x + 0.5), px(y + 1.5)) }
  }
  ctx.stroke()
  ctx.setLineDash([])

  // Evidence of a previous attempt: where you went and where it ended.
  if (view.ghost && view.ghost.length > 1) {
    ctx.strokeStyle = c.muted
    ctx.globalAlpha = 0.45
    ctx.lineWidth = 1.5
    ctx.setLineDash([2, T * 0.12])
    ctx.beginPath()
    view.ghost.forEach(([gx, gy], i) => i ? ctx.lineTo(px(gx), px(gy)) : ctx.moveTo(px(gx), px(gy)))
    ctx.stroke()
    ctx.setLineDash([])
    const [ex, ey] = view.ghost[view.ghost.length - 1]
    cross(ctx, px(ex), px(ey), T * 0.16, c.muted, 2)
    ctx.globalAlpha = 1
  }

  // Exit: an interrupted circle that closes when every sample is found.
  const ex = px(s.exit.x + 0.5), ey = px(s.exit.y + 0.5), er = T * 0.32
  // The exit is always passable; its circle closes when complete is available (S2).
  ctx.strokeStyle = exitOpen(s) ? c.learning : c.ink
  ctx.lineWidth = 2.5 * k
  if (exitOpen(s)) {
    ctx.beginPath(); ctx.arc(ex, ey, er, 0, Math.PI * 2); ctx.stroke()
    ctx.fillStyle = c.learning; ctx.beginPath(); ctx.arc(ex, ey, er * 0.38, 0, Math.PI * 2); ctx.fill()
  } else {
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(ex, ey, er, i * (Math.PI * 2 / 3) + 0.35, (i + 1) * (Math.PI * 2 / 3) - 0.35); ctx.stroke() }
  }

  // Samples: hollow diamonds.
  for (const sample of s.samples) {
    if (sample.taken) continue
    const cx = px(sample.x + 0.5), cy = px(sample.y + 0.5), r = T * 0.2
    ctx.fillStyle = c.paper
    ctx.strokeStyle = c.learning
    ctx.lineWidth = 2.5 * k
    ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx, cy + r); ctx.lineTo(cx - r, cy); ctx.closePath(); ctx.fill(); ctx.stroke()
  }

  // Gates: a channel of two bars around a pivot; it lets movement through along its bars.
  const target = s.status === 'playing' ? reachable(s) : null
  const reach = target?.kind === 'gate' ? target.gate : null
  for (const gate of s.gates) {
    const cx = px(gate.x + 0.5), cy = px(gate.y + 0.5)
    let angle = angleOf(gate.axis)
    const turn = view.memory.gateTurn.get(`${gate.x},${gate.y}`)
    if (turn && !view.reducedMotion) {
      const t = Math.min(1, (view.now - turn.started) / GATE_TURN_MS)
      if (t < 1) angle = turn.from + (angle - turn.from) * (1 - (1 - t) ** 3)
      else view.memory.gateTurn.delete(`${gate.x},${gate.y}`)
    }
    if (reach === gate) {
      ctx.strokeStyle = c.accent
      ctx.lineWidth = 3 * k
      ctx.setLineDash([T * 0.1, T * 0.07])
      ctx.beginPath(); ctx.arc(cx, cy, T * 0.62, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.fillStyle = c.ink
    const bar = T * 0.12 * (view.highContrast ? 1.3 : 1)
    ctx.fillRect(-T / 2, -T / 2, T, bar)
    ctx.fillRect(-T / 2, T / 2 - bar, T, bar)
    // Flow marks show the open direction without relying on colour.
    ctx.strokeStyle = c.ink
    ctx.lineWidth = 1.5 * k
    for (const dir of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(dir * T * 0.12, -T * 0.1); ctx.lineTo(dir * T * 0.26, 0); ctx.lineTo(dir * T * 0.12, T * 0.1); ctx.stroke()
    }
    ctx.restore()
    ctx.fillStyle = c.accent
    ctx.strokeStyle = c.ink
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.07, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  }
  // Junctions: a + on a grid corner. Its arms seal four pockets; a shift turns them clockwise.
  for (const j of s.junctions) {
    const cx = px(j.x), cy = px(j.y)
    ctx.strokeStyle = c.line
    ctx.lineWidth = 1.25 * k
    ctx.setLineDash([T * 0.05, T * 0.09])
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.707, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
    // The circle shows the door turns; it turns whichever way it is pushed, so no arrow.
    if (target?.kind === 'junction' && target.junction === j) {
      ctx.strokeStyle = c.accent
      ctx.lineWidth = 3 * k
      ctx.setLineDash([T * 0.1, T * 0.07])
      ctx.beginPath(); ctx.arc(cx, cy, T * 1.08, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])
    }
    let angle = 0
    const turning = view.memory.shiftTurn.get(`${j.x},${j.y}`)
    if (turning && !view.reducedMotion) {
      const t = Math.min(1, (view.now - turning.started) / SHIFT_TURN_MS)
      // Arms arrive from a quarter-turn behind: clockwise, easing out.
      if (t < 1) angle = (turning.dir === 'cw' ? -1 : 1) * (Math.PI / 2) * (1 - t) ** 3
      else view.memory.shiftTurn.delete(`${j.x},${j.y}`)
    }
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(angle)
    ctx.fillStyle = c.ink
    const arm = T * 0.12 * (view.highContrast ? 1.3 : 1)
    ctx.fillRect(-arm / 2, -T, arm, T * 2)
    ctx.fillRect(-T, -arm / 2, T * 2, arm)
    ctx.restore()
    ctx.fillStyle = c.accent
    ctx.strokeStyle = c.ink
    ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(cx, cy, T * 0.11, 0, Math.PI * 2); ctx.fill(); ctx.stroke()
  }
  // Push feedback (§4a): a ring fills while the push builds; the arrowhead shows which way it will turn.
  if (s.push && s.status === 'playing') {
    const cx = px(s.push.x), cy = px(s.push.y)
    const radius = s.push.kind === 'junction' ? T * 1.08 : T * 0.62
    const share = Math.min(1, s.push.steps / PUSH_STEPS)
    const ccw = s.push.dir === 'ccw'
    const start = -Math.PI / 2
    const end = start + (ccw ? -1 : 1) * share * Math.PI * 2
    ctx.strokeStyle = c.accent
    ctx.lineWidth = 4 * k
    ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(cx, cy, radius, start, end, ccw); ctx.stroke()
    ctx.lineCap = 'butt'
    if (s.push.dir !== 'axis') {
      const ax = cx + Math.cos(end) * radius, ay = cy + Math.sin(end) * radius
      const tangent = end + (ccw ? -Math.PI / 2 : Math.PI / 2)
      ctx.fillStyle = c.accent
      ctx.beginPath()
      ctx.moveTo(ax + Math.cos(tangent) * T * 0.14, ay + Math.sin(tangent) * T * 0.14)
      ctx.lineTo(ax + Math.cos(tangent + 2.4) * T * 0.12, ay + Math.sin(tangent + 2.4) * T * 0.12)
      ctx.lineTo(ax + Math.cos(tangent - 2.4) * T * 0.12, ay + Math.sin(tangent - 2.4) * T * 0.12)
      ctx.closePath(); ctx.fill()
    }
  }
  if (view.memory.jam && view.now < view.memory.jam.until) cross(ctx, px(view.memory.jam.x + 0.5), px(view.memory.jam.y + 0.5), T * 0.22, c.hazard, 3 * k)

  // Reveal and Inspect sit between the world and the moving things (§12b).
  if (view.reveal) {
    ctx.fillStyle = c.paper
    ctx.globalAlpha = 0.62
    ctx.fillRect(0, 0, w, h)
    ctx.globalAlpha = 1
  }
  if (view.reveal || view.inspect) drawSystem(ctx, s, view, c, T, k)

  // Tracers: predicted route, recent trace, then the tracer itself.
  s.tracers.forEach((t, index) => {
    const at = tracerPosition(t)
    const trail = view.memory.trails[index] ?? (view.memory.trails[index] = [])
    if (!view.reducedMotion) {
      trail.push([at.x, at.y]); if (trail.length > 14) trail.shift()
      trail.forEach(([tx, ty], i) => {
        ctx.fillStyle = c.hazard
        ctx.globalAlpha = (i / trail.length) * 0.3
        ctx.beginPath(); ctx.arc(px(tx), px(ty), T * 0.05 + (i / trail.length) * T * 0.06, 0, Math.PI * 2); ctx.fill()
      })
      ctx.globalAlpha = 1
    }
    if (view.previews) {
      const points = predictPath(s, t, 4)
      ctx.strokeStyle = c.predicted
      ctx.lineWidth = 2 * k
      ctx.setLineDash([T * 0.04, T * 0.1])
      ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(px(at.x), px(at.y))
      points.forEach(p => ctx.lineTo(px(p.x), px(p.y)))
      ctx.stroke()
      ctx.setLineDash([]); ctx.lineCap = 'butt'
      points.forEach((p, i) => { ctx.globalAlpha = 1 - i * 0.18; ctx.beginPath(); ctx.arc(px(p.x), px(p.y), T * 0.06, 0, Math.PI * 2); ctx.stroke() })
      ctx.globalAlpha = 1
    }
    const angle = [-Math.PI / 2, 0, Math.PI / 2, Math.PI][t.dir]
    ctx.save()
    ctx.translate(px(at.x), px(at.y))
    ctx.rotate(angle)
    const r = T * 0.3
    ctx.fillStyle = c.hazard
    ctx.strokeStyle = c.ink
    ctx.lineWidth = 1.5 * k
    ctx.beginPath(); ctx.moveTo(r, 0); ctx.lineTo(-r * 0.7, -r * 0.8); ctx.lineTo(-r * 0.35, 0); ctx.lineTo(-r * 0.7, r * 0.8); ctx.closePath(); ctx.fill(); ctx.stroke()
    ctx.restore()
  })

  // Player: the only filled circle, ringed in the accent.
  const pr = T * 0.3
  const pxp = px(s.player.x), pyp = px(s.player.y)
  ctx.fillStyle = c.ink
  ctx.beginPath(); ctx.arc(pxp, pyp, pr, 0, Math.PI * 2); ctx.fill()
  ctx.strokeStyle = c.accent
  ctx.lineWidth = 2.5 * k
  ctx.beginPath(); ctx.arc(pxp, pyp, pr - 1.25 * k, 0, Math.PI * 2); ctx.stroke()
  if (s.status === 'failed') cross(ctx, pxp, pyp, T * 0.28, c.hazard, 3.5 * k)
  ctx.restore()
}

function drawField(ctx: CanvasRenderingContext2D, x: number, y: number, T: number, phase: ReturnType<typeof fieldPhase>, c: Palette, k: number) {
  const inset = T * 0.08
  ctx.save()
  ctx.beginPath(); ctx.rect(x + inset, y + inset, T - inset * 2, T - inset * 2); ctx.clip()
  if (phase.active) { ctx.fillStyle = c.hazard; ctx.globalAlpha = 0.18; ctx.fillRect(x, y, T, T); ctx.globalAlpha = 1 }
  // Hatch density encodes state: none (idle), sparse (warning), dense crosshatch (active).
  const gap = phase.active ? T * 0.14 : T * 0.28
  if (phase.active || phase.warning) {
    ctx.strokeStyle = c.hazard
    ctx.lineWidth = (phase.active ? 2 : 1.25) * k
    ctx.beginPath()
    for (let d = -T; d < T * 2; d += gap) { ctx.moveTo(x + d, y); ctx.lineTo(x + d + T, y + T) }
    if (phase.active) for (let d = -T; d < T * 2; d += gap) { ctx.moveTo(x + d + T, y); ctx.lineTo(x + d, y + T) }
    ctx.stroke()
  }
  ctx.restore()
  ctx.strokeStyle = phase.active ? c.hazard : c.line
  ctx.lineWidth = (phase.active ? 2 : 1) * k
  ctx.setLineDash(phase.active ? [] : [T * 0.08, T * 0.08])
  ctx.strokeRect(x + inset, y + inset, T - inset * 2, T - inset * 2)
  ctx.setLineDash([])
}

function cross(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, width: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke()
  ctx.lineCap = 'butt'
}


/** The system made visible: every part under Reveal, or the one inspected part. */
function drawSystem(ctx: CanvasRenderingContext2D, s: GameState, view: View, c: Palette, T: number, k: number) {
  const px = (n: number) => n * T
  const only = view.reveal ? null : view.inspect
  const show = (kind: Inspect['kind'], index = -1, x = -1, y = -1) => !only || (only.kind === kind && (!('index' in only) || only.index === index) && (!('x' in only) || (only.x === x && only.y === y)))
  ctx.save()
  ctx.font = `600 ${Math.max(10, Math.round(T * 0.3))}px ui-monospace, Menlo, Consolas, monospace`
  ctx.textBaseline = 'middle'
  // Tracers: the whole repeating route, with chevrons in the direction of travel.
  s.tracers.forEach((t, i) => {
    if (!show('tracer', i)) return
    const route = tracerCycle(s, t)
    if (route.length < 2) return
    ctx.strokeStyle = c.predicted
    ctx.lineWidth = 3 * k
    ctx.lineJoin = 'round'
    ctx.beginPath()
    route.forEach((p, n) => n ? ctx.lineTo(px(p.x), px(p.y)) : ctx.moveTo(px(p.x), px(p.y)))
    ctx.stroke()
    ctx.fillStyle = c.predicted
    for (let n = 1; n < route.length; n += 2) {
      const a = route[n - 1], b = route[n]
      const angle = Math.atan2(b.y - a.y, b.x - a.x)
      const mx = px((a.x + b.x) / 2), my = px((a.y + b.y) / 2)
      ctx.beginPath()
      ctx.moveTo(mx + Math.cos(angle) * T * 0.13, my + Math.sin(angle) * T * 0.13)
      ctx.lineTo(mx + Math.cos(angle + 2.5) * T * 0.11, my + Math.sin(angle + 2.5) * T * 0.11)
      ctx.lineTo(mx + Math.cos(angle - 2.5) * T * 0.11, my + Math.sin(angle - 2.5) * T * 0.11)
      ctx.closePath(); ctx.fill()
    }
  })
  // Junctions: pockets outlined, and arrowheads both ways (it turns the way you push).
  s.junctions.forEach((j, i) => {
    if (!show('junction', i)) return
    ctx.strokeStyle = c.accent
    ctx.lineWidth = 2 * k
    ctx.setLineDash([T * 0.08, T * 0.08])
    for (const p of pockets(j)) ctx.strokeRect(px(p.x) + 3, px(p.y) + 3, T - 6, T - 6)
    ctx.setLineDash([])
    const cx = px(j.x), cy = px(j.y), r = T * 0.72
    ctx.lineWidth = 3 * k
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke()
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke()
    ctx.fillStyle = c.accent
    for (const [angle, dir] of [[-Math.PI * 0.15, 1], [Math.PI * 0.85, 1], [-Math.PI * 0.85, -1], [Math.PI * 0.15, -1]] as const) {
      const ax = cx + Math.cos(angle) * r, ay = cy + Math.sin(angle) * r
      const tangent = angle + dir * Math.PI / 2
      ctx.beginPath()
      ctx.moveTo(ax + Math.cos(tangent) * T * 0.14, ay + Math.sin(tangent) * T * 0.14)
      ctx.lineTo(ax + Math.cos(tangent + 2.4) * T * 0.12, ay + Math.sin(tangent + 2.4) * T * 0.12)
      ctx.lineTo(ax + Math.cos(tangent - 2.4) * T * 0.12, ay + Math.sin(tangent - 2.4) * T * 0.12)
      ctx.closePath(); ctx.fill()
    }
  })
  // Channel gates: the axis they let through.
  s.gates.forEach((g, i) => {
    if (!show('gate', i)) return
    const cx = px(g.x + 0.5), cy = px(g.y + 0.5), along = g.axis === 'ew'
    ctx.strokeStyle = c.accent
    ctx.lineWidth = 3 * k
    ctx.beginPath()
    if (along) { ctx.moveTo(cx - T * 0.45, cy); ctx.lineTo(cx + T * 0.45, cy) } else { ctx.moveTo(cx, cy - T * 0.45); ctx.lineTo(cx, cy + T * 0.45) }
    ctx.stroke()
  })
  // Timed fields: seconds until the next change, on the first tile of each run.
  const phase = fieldPhase(s)
  for (let y = 0; y < s.height; y++) for (let x = 0; x < s.width; x++) {
    // One label per run of field tiles; Inspect shows the run on the tapped row.
    const firstOfRun = s.tiles[y][x] === 'field' && s.tiles[y][x - 1] !== 'field'
    if (!firstOfRun || (only && !(only.kind === 'field' && only.y === y))) continue
    const label = `${phase.active ? 'off' : 'on'} ${phase.untilChange.toFixed(1)}s`
    label3(ctx, label, px(x + 0.12), px(y + 0.5), c)
  }
  // Exit: what complete needs.
  // Exit: a compact badge inside its tile (collected / needed for complete); the words go to the rail.
  if (show('exit')) {
    ctx.strokeStyle = c.learning; ctx.lineWidth = 2 * k
    ctx.beginPath(); ctx.arc(px(s.exit.x + 0.5), px(s.exit.y + 0.5), T * 0.44, 0, Math.PI * 2); ctx.stroke()
    ctx.font = `600 ${Math.max(9, Math.round(T * 0.24))}px ui-monospace, Menlo, Consolas, monospace`
    label3(ctx, `${collected(s)}/${s.required}`, px(s.exit.x) + 2, px(s.exit.y) + T * 0.16, c)
  }
  s.samples.forEach((sample, i) => {
    if (sample.taken || !show('sample', i) || !only) return
    ctx.strokeStyle = c.learning; ctx.lineWidth = 2 * k
    ctx.beginPath(); ctx.arc(px(sample.x + 0.5), px(sample.y + 0.5), T * 0.38, 0, Math.PI * 2); ctx.stroke()
  })
  ctx.restore()
}

function label3(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, c: Palette) {
  const width = ctx.measureText(text).width
  const height = parseInt(ctx.font.match(/(\d+)px/)?.[1] ?? '12', 10)
  ctx.fillStyle = c.panel
  ctx.fillRect(x - 4, y - height * 0.75, width + 8, height * 1.5)
  ctx.fillStyle = c.ink
  ctx.fillText(text, x, y)
}
