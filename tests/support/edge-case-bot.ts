import { createGame, drainEvents, pockets, step, tracerPosition, type GameEvent, type GameState, type LevelDef, type Turn } from '../../src/play/edge-case/engine'

/** Deterministic scripted player for engine tests. No timing depends on rendering. */
export class Bot {
  state: GameState
  events: GameEvent[] = []
  constructor(level: LevelDef) { this.state = createGame(level) }
  private tick(dx = 0, dy = 0) {
    step(this.state, { dx, dy })
    this.events.push(...drainEvents(this.state))
  }
  /** Move to a tile centre along a straight line. */
  to(x: number, y: number, limit = 600) {
    for (let i = 0; i < limit && this.state.status === 'playing'; i++) {
      const ex = x + 0.5 - this.state.player.x, ey = y + 0.5 - this.state.player.y
      if (Math.abs(ex) < 0.06 && Math.abs(ey) < 0.06) { this.settle(); return this }
      this.tick(Math.abs(ex) < 0.06 ? 0 : Math.sign(ex), Math.abs(ey) < 0.06 ? 0 : Math.sign(ey))
    }
    if (this.state.status === 'playing') throw new Error(`Bot could not reach ${x},${y}; at ${this.state.player.x.toFixed(2)},${this.state.player.y.toFixed(2)}`)
    return this
  }
  path(...points: [number, number][]) { for (const [x, y] of points) this.to(x, y); return this }
  settle() { for (let i = 0; i < 20 && (this.state.player.vx || this.state.player.vy); i++) this.tick(); return this }
  wait(ticks: number) { for (let i = 0; i < ticks && this.state.status === 'playing'; i++) this.tick(); return this }
  until(predicate: (s: GameState) => boolean, limit = 1200) {
    for (let i = 0; i < limit; i++) { if (predicate(this.state)) return this; this.tick() }
    throw new Error('Condition never became true')
  }
  hold(dx: number, dy: number, ticks: number) { for (let i = 0; i < ticks; i++) this.tick(dx, dy); return this }
  /**
   * Push the arm that turns the junction around the player's pocket the given way (§4a),
   * hold until it turns, then stop pushing. From NW, east turns clockwise and south
   * counter-clockwise; the other pockets follow by symmetry.
   */
  turn(dir: Turn, limit = 120) {
    const p = this.state.player
    const j = this.state.junctions.find(junction => pockets(junction).some(q => q.x === Math.floor(p.x) && q.y === Math.floor(p.y)))
    if (!j) throw new Error('Bot is not in a junction pocket')
    const index = pockets(j).findIndex(q => q.x === Math.floor(p.x) && q.y === Math.floor(p.y))
    const clockwise: [number, number][] = [[1, 0], [0, 1], [-1, 0], [0, -1]]
    const [dx, dy] = dir === 'cw' ? clockwise[index] : clockwise[(index + 3) % 4].map(v => -v) as [number, number]
    const before = this.events.length
    for (let i = 0; i < limit && this.state.status === 'playing'; i++) {
      this.tick(dx, dy)
      if (this.events.slice(before).some(e => e.type === 'shift')) return this.settle()
    }
    throw new Error(`Junction did not turn ${dir}`)
  }
  tracer(index = 0) { const t = this.state.tracers[index]; return { ...tracerPosition(t), dir: t.dir } }
}
