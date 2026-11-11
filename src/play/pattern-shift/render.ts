import { exitOpen, fieldPhase, predictPath, reachableGate, tracerPosition, type Axis, type GameState } from './engine'

export interface Palette { paper: string; panel: string; ink: string; muted: string; line: string; soft: string; accent: string; hazard: string; learning: string; predicted: string }
export interface View {
  tile: number
  previews: boolean
  reducedMotion: boolean
  highContrast: boolean
  ghost: [number, number][] | null
  /** Render-only memory: recent tracer positions and gate rotation animation. */
  memory: { trails: [number, number][][]; gateTurn: Map<string, { from: number; started: number }>; jam: { x: number; y: number; until: number } | null }
  now: number
}

export function readPalette(element: Element): Palette {
  const css = getComputedStyle(element)
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return {
    paper: v('--paper', '#f3efe7'), panel: v('--panel-2', '#e4ddd0'), ink: v('--ink', '#111716'), muted: v('--muted', '#555d58'),
    line: v('--line', '#8b918a'), soft: v('--soft-line', '#d2d1c8'), accent: v('--signal-art', '#ff641c'),
    hazard: v('--pressure', '#9c3e35'), learning: v('--holds', '#21675f'), predicted: v('--unresolved', '#714491'),
  }
}

export const createMemory = (): View['memory'] => ({ trails: [], gateTurn: new Map(), jam: null })
const angleOf = (axis: Axis) => (axis === 'ew' ? 0 : Math.PI / 2)
const GATE_TURN_MS = 160

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
      ctx.fillStyle = view.highContrast ? c.ink : c.panel
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
  const reach = s.status === 'playing' ? reachableGate(s) : null
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
  if (view.memory.jam && view.now < view.memory.jam.until) cross(ctx, px(view.memory.jam.x + 0.5), px(view.memory.jam.y + 0.5), T * 0.22, c.hazard, 3 * k)

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
