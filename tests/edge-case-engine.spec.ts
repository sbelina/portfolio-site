import { test, expect } from '@playwright/test'
import { createGame, fieldPhase, nextDirection, predictPath, step, idle, tracerPosition, type GameState, type LevelDef } from '../src/play/edge-case/engine'
import { levels } from '../src/play/edge-case/levels'
import { Bot } from './support/edge-case-bot'

const level = (code: string) => levels.find(item => item.code === code)!
const inPocket = (s: GameState, x: number, y: number, index = 0) => { const t = s.tracers[index]; const at = tracerPosition(t); return Math.floor(at.x) === x && Math.floor(at.y) === y }
const discovered = (bot: Bot) => bot.events.flatMap(e => e.type === 'discovery' ? [e.id] : [])

test.describe('Edge Case engine: rules', () => {
  test('identical inputs produce identical states', () => {
    const run = () => { const s = createGame(level('001')); for (let i = 0; i < 500; i++) step(s, { dx: i % 90 < 45 ? 1 : -1, dy: i % 200 < 100 ? 1 : 0, action: i % 120 === 60 }); return s }
    const a = run(), b = run()
    expect(JSON.stringify({ ...a, level: 0 })).toBe(JSON.stringify({ ...b, level: 0 }))
  })

  test('tracers repeat exactly: a patrol returns to the same place each period', () => {
    const s = createGame(level('000'))
    const t = s.tracers[0]
    const period = Math.round((12 / 2) * 60)
    const first = tracerPosition(t)
    for (let cycle = 0; cycle < 3; cycle++) for (let i = 0; i < period; i++) step(s, idle)
    expect(tracerPosition(t).x).toBeCloseTo(first.x, 1)
  })

  test('junction arms separate its pockets for the player and for tracers alike', () => {
    const s = createGame(level('001'))
    // Tracer track runs through two pockets, but never across the arm between them.
    expect(nextDirection(s, 3, 5, 1)).toBe(3)
    const bot = new Bot(level('000'))
    bot.hold(1, 0, 40)
    expect(bot.state.player.x).toBeLessThan(4)
    bot.hold(0, 1, 40)
    expect(bot.state.player.y).toBeLessThan(6)
  })

  test('a shift carries everything centred in a pocket one pocket clockwise; the exit stays put', () => {
    const bot = new Bot(level('000'))
    expect(bot.state.player).toMatchObject({ x: 3.5, y: 5.5 })
    bot.act()
    expect(bot.state.player).toMatchObject({ x: 4.5, y: 5.5 })
    bot.act()
    expect(bot.state.player).toMatchObject({ x: 4.5, y: 6.5 })
    bot.act()
    expect(bot.state.player).toMatchObject({ x: 3.5, y: 6.5 })
    const s = createGame(level('010'))
    s.player.x = 3.5; s.player.y = 2.5
    step(s, { ...idle, action: true })
    expect(s.exit).toEqual({ x: 4, y: 2 })
  })

  test('channel gates still pass movement along one axis and jam when occupied', () => {
    const bot = new Bot(level('010'))
    bot.state.player.x = 6.5; bot.state.player.y = 2.5
    bot.hold(-1, 0, 60)
    expect(bot.state.player.x).toBeGreaterThan(6)
    bot.act()
    expect(bot.state.gates[0].axis).toBe('ew')
    bot.hold(-1, 0, 50)
    expect(bot.state.player.x).toBeLessThan(5.5)
    // Standing inside the gate itself: it cannot turn.
    bot.state.player.x = 5.5
    bot.act()
    expect(bot.events).toContainEqual({ type: 'jammed' })
  })

  test('timed fields telegraph a warning before becoming active', () => {
    const s = createGame({ ...level('000'), field: { period: 3, on: 1, warn: 0.5 } })
    s.time = 2.6
    expect(fieldPhase(s)).toMatchObject({ active: false, warning: true })
    s.time = 3.01
    expect(fieldPhase(s)).toMatchObject({ active: true })
  })

  test('the exit opens on the required count, which may be fewer than all samples', () => {
    const s = createGame(level('010'))
    expect(s.required).toBe(2)
    expect(s.samples).toHaveLength(3)
  })

  test('levels reject malformed maps and junctions on walls', () => {
    const bad: LevelDef = { id: 'bad', code: '999', title: '', hint: '', map: ['###', '#P.', '###'], tracers: [] }
    expect(() => createGame(bad)).toThrow(/start and an exit|enclosed/)
    expect(() => createGame({ ...level('000'), junctions: [{ x: 1, y: 1 }] })).toThrow(/pockets/)
  })
})

test.describe('Edge Case engine: every level has more than one way through', () => {
  test('000 False Start: shift out north-east, collect both samples, time the tracer', () => {
    const bot = new Bot(level('000'))
    bot.act().path([4, 4], [6, 4], [5, 4], [5, 5], [4, 5]).act().act().path([3, 7], [3, 8], [1, 8], [1, 9], [3, 8], [3, 7], [3, 6]).act().act()
    expect(bot.state.player).toMatchObject({ x: 4.5, y: 5.5 })
    bot.path([4, 4], [4, 3])
    bot.until(s => s.tracers[0].dir === 1 && tracerPosition(s.tracers[0]).x > 5.2)
    bot.path([4, 1])
    expect(bot.state.status).toBe('won')
    expect(discovered(bot)).toContain('false-start')
  })

  test('000 False Start: or shift out south-west first', () => {
    const bot = new Bot(level('000'))
    bot.act().act().act()
    bot.path([3, 7], [3, 8], [1, 8], [1, 9], [3, 8], [3, 7], [3, 6]).act().act()
    bot.path([4, 4], [6, 4], [4, 4], [4, 3])
    bot.until(s => s.tracers[0].dir === 1 && tracerPosition(s.tracers[0]).x > 5.2)
    bot.path([4, 1])
    expect(bot.state.status).toBe('won')
  })

  test('001 Expected Behavior: time the crossing without touching the tracer', () => {
    const bot = new Bot(level('001'))
    bot.path([3, 8], [3, 7], [3, 6])
    // Wait in the south-west pocket until the tracer is heading away, then shift and go.
    bot.until(s => s.tracers[0].dir === 3 && tracerPosition(s.tracers[0]).x < 2.4)
    bot.act()
    expect(bot.events.some(e => e.type === 'discovery' && e.id === 'reroute')).toBe(false)
    bot.path([3, 4], [3, 2], [1, 2], [1, 1], [7, 1], [4, 1])
    expect(bot.state.status).toBe('won')
  })

  test('001 Expected Behavior: or carry the tracer away (Re:Route) and walk through', () => {
    const bot = new Bot(level('001'))
    bot.path([3, 8], [3, 7], [3, 6])
    bot.until(s => inPocket(s, 3, 5))
    bot.act()
    expect(discovered(bot)).toContain('reroute')
    expect(predictPath(bot.state, bot.state.tracers[0], 12).every(p => p.x >= 4)).toBe(true)
    bot.path([3, 4], [3, 2], [1, 2], [1, 1], [7, 1], [4, 1])
    expect(bot.state.status).toBe('won')
  })

  test('001 Expected Behavior: or strand the tracer off its track (It is not a bug)', () => {
    const bot = new Bot(level('001'))
    bot.path([3, 8], [3, 7], [3, 6])
    bot.until(s => inPocket(s, 3, 5))
    bot.act().act().act()
    expect(discovered(bot)).toContain('not-a-bug')
    const t = bot.state.tracers[0]
    expect(t.next).toBeNull()
    const at = tracerPosition(t)
    bot.wait(240)
    expect(tracerPosition(t)).toEqual(at)
  })

  test('010 Shift Happens: shift into the sealed exit pocket (Technically Correct, Exception)', () => {
    const bot = new Bot(level('010'))
    bot.path([1, 9], [3, 9], [3, 7])
    bot.until(s => tracerPosition(s.tracers[0]).x > 5.5 && s.tracers[0].dir === 1)
    bot.path([3, 6], [3, 4], [3, 3], [2, 3], [2, 1], [1, 1], [2, 1], [2, 3], [3, 3]).act().act()
    expect(bot.state.status).toBe('won')
    expect(discovered(bot)).toEqual(expect.arrayContaining(['technically-correct', 'exception']))
  })

  test('010 Shift Happens: or turn the hidden channel gate and walk in (Pivot)', () => {
    const bot = new Bot(level('010'))
    bot.path([1, 9], [6, 9], [6, 7])
    bot.until(s => tracerPosition(s.tracers[0]).x < 3.5 && s.tracers[0].dir === 3)
    bot.path([6, 6], [6, 4], [6, 3], [6, 2]).act()
    expect(discovered(bot)).toContain('pivot')
    bot.path([5, 2], [4, 2])
    expect(bot.state.status).toBe('won')
    expect(discovered(bot)).not.toContain('technically-correct')
  })
})

test.describe('Edge Case engine: discoveries come from rules, not defects', () => {
  test('Expected Behavior: watching a full cycle before moving', () => {
    const bot = new Bot(level('001'))
    bot.wait(Math.ceil((4 / 2.2) * 60) + 5)
    expect(discovered(bot)).toContain('expected-behavior')
    const moved = new Bot(level('001'))
    moved.hold(1, 0, 5).wait(240)
    expect(discovered(moved)).not.toContain('expected-behavior')
  })

  test('Full Circle: four shifts of one junction', () => {
    const bot = new Bot(level('000'))
    bot.act().act().act()
    expect(discovered(bot)).not.toContain('full-circle')
    bot.act()
    expect(discovered(bot)).toContain('full-circle')
    expect(bot.state.player).toMatchObject({ x: 3.5, y: 5.5 })
  })

  test('Off by One: a finish one simulation step ahead of a tracer', () => {
    const s = createGame(level('000'))
    s.samples.forEach(sample => { sample.taken = true })
    const t = s.tracers[0]
    t.x = 3; t.y = 1; t.next = { x: 4, y: 1 }; t.progress = 1 - 0.56 - 2 / 60; t.dir = 1
    // Tracer heading east along row 1 toward the exit tile, just outside reach.
    s.tiles[1][3] = 'track'; s.tiles[1][4] = 'track'
    s.player.x = 4.5; s.player.y = 1.5
    step(s, idle)
    expect(s.status).toBe('won')
    expect(s.discovered).toContain('off-by-one')
  })

  test('Exception only when samples remain; Technically Correct only when carried', () => {
    const s = createGame(level('010'))
    s.samples.forEach(sample => { sample.taken = true })
    s.player.x = 4.5; s.player.y = 2.5
    step(s, idle)
    expect(s.status).toBe('won')
    expect(s.discovered).not.toContain('exception')
    expect(s.discovered).not.toContain('technically-correct')
  })
})
