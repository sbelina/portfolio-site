import { test, expect } from '@playwright/test'
import { createGame, fieldPhase, tracerPosition, nextDirection, predictPath, step, idle, type LevelDef } from '../src/play/pattern-shift/engine'
import { levels } from '../src/play/pattern-shift/levels'
import { Bot } from './support/pattern-shift-bot'

const level = (id: string) => levels.find(item => item.id === id)!

test.describe('Pattern Shift engine', () => {
  test('identical inputs produce identical states regardless of how the run is split', () => {
    const run = () => { const s = createGame(level('upstream')); for (let i = 0; i < 400; i++) step(s, { dx: i % 90 < 45 ? 1 : -1, dy: 0, action: i === 200 }); return s }
    const a = run(), b = run()
    expect(JSON.stringify({ ...a, level: 0 })).toBe(JSON.stringify({ ...b, level: 0 }))
  })

  test('tracers repeat exactly: a patrol returns to the same place each period', () => {
    const s = createGame(level('rhythm'))
    const t = s.tracers[0]
    // Track x 1..7: 12 tiles per round trip at 2.2 tiles/s.
    const period = Math.round((12 / 2.2) * 60)
    const at = () => tracerPosition(t)
    const samples: { x: number; y: number }[] = []
    for (let cycle = 0; cycle < 3; cycle++) { samples.push(at()); for (let i = 0; i < period; i++) step(s, idle) }
    for (const point of samples) { expect(point.x).toBeCloseTo(samples[0].x, 1); expect(point.y).toBe(samples[0].y) }
  })

  test('the gate rule is the same for the player and for tracers', () => {
    const bot = new Bot(level('gate'))
    // Gate starts open east–west: the player cannot pass north through it.
    bot.path([3, 9], [4, 9], [4, 7]).hold(0, -1, 60)
    expect(bot.state.player.y).toBeGreaterThan(6)
    // Turning it north–south opens the player's route and blocks the tracer's.
    bot.until(s => { const t = s.tracers[0]; return t.x >= 6 })
    bot.act()
    expect(bot.events).toContainEqual({ type: 'gate', axis: 'ns' })
    const s = bot.state
    expect(nextDirection(s, 5, 5, 3)).toBe(1)
    expect(predictPath(s, s.tracers[0], 12).every(point => point.x > 5)).toBe(true)
    bot.to(4, 4)
    expect(bot.state.status).toBe('playing')
  })

  test('a gate with something inside it cannot turn', () => {
    const bot = new Bot(level('gate'))
    bot.path([3, 9], [4, 9], [4, 6])
    bot.until(s => s.tracers[0].next?.x === 4 && s.tracers[0].next?.y === 5)
    bot.act()
    expect(bot.events).toContainEqual({ type: 'jammed' })
    expect(bot.state.gates[0].axis).toBe('ew')
  })

  test('turning a gate changes the predicted path immediately', () => {
    const s = createGame(level('gate'))
    s.player.x = 4.5; s.player.y = 6.5
    const before = predictPath(s, s.tracers[0], 8).map(p => p.x)
    expect(before).toContain(4.5)
    step(s, { ...idle, action: true })
    const after = predictPath(s, s.tracers[0], 8).map(p => p.x)
    expect(after).not.toContain(4.5)
  })

  test('timed fields telegraph a warning before becoming active', () => {
    const s = createGame(level('rhythm'))
    const f = s.level.field!
    s.time = f.period - f.warn + 0.01
    expect(fieldPhase(s)).toMatchObject({ active: false, warning: true })
    s.time = f.period + 0.01
    expect(fieldPhase(s)).toMatchObject({ active: true })
  })

  test('touching a tracer or an active field fails with an explained cause', () => {
    const bot = new Bot(level('rhythm'))
    bot.path([5, 9], [5, 8], [5, 7], [5, 6]).wait(600)
    expect(bot.state.status).toBe('failed')
    expect(bot.state.failCause).toBe('tracer')
    const field = new Bot(level('rhythm'))
    field.state.player.x = 3.5; field.state.player.y = 3.5
    field.state.time = 0.1
    step(field.state, idle)
    expect(field.state.failCause).toBe('field')
  })

  test('the exit stays closed until every sample is collected', () => {
    const s = createGame(level('rhythm'))
    s.player.x = s.exit.x + 0.5; s.player.y = s.exit.y + 0.5
    s.time = 2
    step(s, idle)
    expect(s.status).toBe('playing')
  })

  test('slight misalignment still slides the player into a doorway', () => {
    const bot = new Bot(level('rhythm'))
    bot.to(5, 8)
    bot.state.player.x += 0.27
    bot.hold(0, -1, 40)
    expect(bot.state.player.y).toBeLessThan(7.6)
  })

  test('level 1 is solvable by observing the tracer and the field rhythm', () => {
    const bot = new Bot(level('rhythm'))
    bot.path([1, 9], [5, 9], [5, 8])
    // Enter the lane just after the tracer passes eastward.
    bot.until(s => s.tracers[0].dir === 1 && s.tracers[0].x >= 6)
    bot.path([5, 6], [3, 6], [3, 4])
    bot.until(s => { const f = fieldPhase(s); return !f.active && !f.warning && f.untilChange > 1.3 })
    bot.path([3, 2], [7, 2], [7, 1], [4, 1])
    expect(bot.state.status).toBe('won')
  })

  test('level 2 cannot be crossed without turning the gate, and is solved by turning it', () => {
    const bot = new Bot(level('gate'))
    bot.path([7, 9], [4, 9], [4, 6])
    bot.until(s => s.tracers[0].x >= 6 || s.tracers[0].x <= 2)
    bot.act()
    bot.path([4, 3], [1, 3], [1, 1], [4, 1])
    expect(bot.state.status).toBe('won')
    expect(bot.state.gateTurns).toBe(1)
  })

  test('level 3 rewards changing the gate at the right moment', () => {
    const bot = new Bot(level('upstream'))
    bot.path([4, 8], [4, 7])
    bot.until(s => s.tracers[0].x <= 2)
    bot.act()
    expect(predictPath(bot.state, bot.state.tracers[0], 20).every(p => p.x < 4)).toBe(true)
    bot.path([4, 8], [6, 8], [6, 6], [7, 6], [6, 6], [6, 8], [4, 8], [4, 4])
    bot.until(s => { const f = fieldPhase(s); return !f.active && !f.warning && f.untilChange > 0.9 })
    bot.path([4, 2], [1, 2], [1, 1], [4, 1])
    expect(bot.state.status).toBe('won')
  })

  test('level 3 traps the tracer on the wrong side if the gate turns too early', () => {
    const bot = new Bot(level('upstream'))
    bot.path([4, 8], [4, 7])
    bot.until(s => s.tracers[0].x >= 5 && s.tracers[0].next !== null && s.tracers[0].next.x >= 5)
    bot.act()
    expect(predictPath(bot.state, bot.state.tracers[0], 20).every(p => p.x > 5)).toBe(true)
  })

  test('levels reject malformed maps', () => {
    const bad: LevelDef = { id: 'bad', title: '', hint: '', map: ['###', '#P.', '###'], tracers: [] }
    expect(() => createGame(bad)).toThrow(/start and an exit|enclosed/)
  })
})
