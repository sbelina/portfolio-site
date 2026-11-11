import { test, expect } from '@playwright/test'
import { createGame, fieldPhase, nextDirection, predictPath, reachable, step, idle, tracerPosition, type GameState, type LevelDef } from '../src/play/edge-case/engine'
import { levels } from '../src/play/edge-case/levels'
import { Bot } from './support/edge-case-bot'

// Rule IDs refer to tests/EDGE-CASE-MECHANICS.md, the authoritative specification.
const level = (code: string) => levels.find(item => item.code === code)!
const inPocket = (s: GameState, x: number, y: number, index = 0) => { const at = tracerPosition(s.tracers[index]); return Math.floor(at.x) === x && Math.floor(at.y) === y }
const tileOf = (s: GameState) => ({ x: Math.floor(s.player.x), y: Math.floor(s.player.y) })
const discovered = (bot: Bot) => bot.events.flatMap(e => e.type === 'discovery' ? [e.id] : [])
const shiftOnce = (s: GameState) => step(s, { ...idle, action: true })

test.describe('Edge Case engine: time, movement and structures', () => {
  test('T1 T2: identical inputs produce identical states', () => {
    const run = () => { const s = createGame(level('001')); for (let i = 0; i < 500; i++) step(s, { dx: i % 90 < 45 ? 1 : -1, dy: i % 200 < 100 ? 1 : 0, action: i % 120 === 60 }); return s }
    expect(JSON.stringify({ ...run(), level: 0 })).toBe(JSON.stringify({ ...run(), level: 0 }))
  })

  test('R3: a patrol returns to the same place each period', () => {
    const s = createGame(level('000'))
    const first = tracerPosition(s.tracers[0])
    for (let i = 0; i < 3 * 360; i++) step(s, idle)
    expect(tracerPosition(s.tracers[0]).x).toBeCloseTo(first.x, 1)
  })

  test('J2 R2: junction arms separate pockets for the player and for tracers alike', () => {
    expect(nextDirection(createGame(level('001')), 3, 5, 1)).toBe(3)
    const bot = new Bot(level('000'))
    bot.hold(1, 0, 40)
    expect(bot.state.player.x).toBeLessThan(4)
    bot.hold(0, 1, 40)
    expect(bot.state.player.y).toBeLessThan(6)
  })

  test('G1 G3 G4: channel gates pass one axis, turn, and jam when occupied', () => {
    const bot = new Bot(level('010'))
    bot.state.player.x = 6.5; bot.state.player.y = 2.5
    bot.hold(-1, 0, 60)
    expect(bot.state.player.x).toBeGreaterThan(6)
    bot.act()
    expect(bot.state.gates[0].axis).toBe('ew')
    bot.hold(-1, 0, 50)
    expect(bot.state.player.x).toBeLessThan(5.5)
    bot.state.player.x = 5.5
    bot.act()
    expect(bot.events).toContainEqual({ type: 'jammed' })
  })

  test('A1: the nearest target wins; at equal distance a channel gate wins', () => {
    const s = createGame(level('010'))
    s.player.x = 5.5; s.player.y = 2.5
    expect(reachable(s)?.kind).toBe('gate')
    s.player.x = 3.5; s.player.y = 2.5
    expect(reachable(s)?.kind).toBe('junction')
    // The midpoint of gate centre (5.5, 2.5) and junction corner (4, 3) is equidistant: ties go to the gate.
    s.player.x = 4.75; s.player.y = 2.75
    expect(Math.hypot(5.5 - 4.75, 2.5 - 2.75)).toBeCloseTo(Math.hypot(4 - 4.75, 3 - 2.75), 9)
    expect(reachable(s)?.kind).toBe('gate')
  })

  test('H2: timed fields telegraph a warning before becoming active', () => {
    const s = createGame({ ...level('000'), field: { period: 3, on: 1, warn: 0.5 } })
    s.time = 2.6
    expect(fieldPhase(s)).toMatchObject({ active: false, warning: true })
    s.time = 3.01
    expect(fieldPhase(s)).toMatchObject({ active: true })
  })

  test('S2: the exit opens on the required count, which may be fewer than all samples', () => {
    const s = createGame(level('010'))
    expect(s.required).toBe(2)
    expect(s.samples).toHaveLength(3)
  })

  test('J1: malformed maps, junctions on walls and shared pockets are rejected', () => {
    const bad: LevelDef = { id: 'bad', code: '999', title: '', hint: '', map: ['###', '#P.', '###'], tracers: [] }
    expect(() => createGame(bad)).toThrow(/start and an exit|enclosed/)
    expect(() => createGame({ ...level('000'), junctions: [{ x: 1, y: 1 }] })).toThrow(/pockets/)
    expect(() => createGame({ ...level('000'), junctions: [{ x: 4, y: 6 }, { x: 5, y: 6 }] })).toThrow(/share a pocket|open tiles/)
  })
})

test.describe('Edge Case engine: SHIFT (§4)', () => {
  test('J5: members move one pocket clockwise; four shifts return them (J6); the exit never moves (J5d)', () => {
    const bot = new Bot(level('000'))
    const order = [[3, 5], [4, 5], [4, 6], [3, 6], [3, 5]]
    expect(tileOf(bot.state)).toEqual({ x: 3, y: 5 })
    for (const [x, y] of order.slice(1)) { bot.act(); expect(tileOf(bot.state)).toEqual({ x, y }) }
    expect(bot.state.player).toMatchObject({ x: 3.5, y: 5.5 })
    const s = createGame(level('010'))
    s.player.x = 3.5; s.player.y = 2.5
    shiftOnce(s)
    expect(s.exit).toEqual({ x: 4, y: 2 })
  })

  test('J5a: the player keeps a rotated offset and a rotated velocity', () => {
    const s = createGame(level('000'))
    // NW pocket, offset (-0.4, -0.6) from corner (4, 6), moving east.
    s.player.x = 3.6; s.player.y = 5.4; s.player.vx = 2; s.player.vy = 0
    shiftOnce(s)
    // §2: movement runs first (braking vx 2 → 2 − 46/60, moving x by vx/60), then the shift rotates
    // offset (ox, oy) → (−oy, ox) and velocity (vx, vy) → (−vy, vx).
    const vx = 2 - 46 / 60, ox = 3.6 + vx / 60 - 4, oy = 5.4 - 6
    expect(s.player.x).toBeCloseTo(4 - oy, 9)
    expect(s.player.y).toBeCloseTo(6 + ox, 9)
    expect(s.player.vx).toBeCloseTo(0, 9)
    expect(s.player.vy).toBeCloseTo(vx, 9)
  })

  test('J5a: a member straddling a pocket mouth is clamped fully inside the arrival pocket', () => {
    const s = createGame(level('000'))
    s.player.x = 4.5; s.player.y = 5.5
    // Centre just inside the NE pocket's open north side (J4), body mostly outside.
    s.player.y = 5.05
    shiftOnce(s)
    expect(tileOf(s)).toEqual({ x: 4, y: 6 })
    for (const value of [s.player.x - 4, s.player.y - 6]) { expect(value).toBeGreaterThanOrEqual(0.37 - 1e-9); expect(value).toBeLessThanOrEqual(0.63 + 1e-9) }
  })

  test('J4: membership is by centre only; a body overlapping a pocket with its centre outside is not carried', () => {
    const s = createGame(level('000'))
    s.player.x = 4.5; s.player.y = 4.95
    shiftOnce(s)
    expect(s.player).toMatchObject({ x: 4.5, y: 4.95 })
  })

  test('J5b R5: a carried tracer snaps, turns right, and stops if it lands off track', () => {
    const s = createGame(level('001'))
    const t = s.tracers[0]
    t.x = 3; t.y = 5; t.progress = 0; t.dir = 1; t.next = null
    s.player.x = 3.5; s.player.y = 6.5
    shiftOnce(s)
    expect({ x: t.x, y: t.y }).toEqual({ x: 4, y: 5 })
    expect(t.next).toEqual({ x: 5, y: 5 })
    shiftOnce(s)
    expect({ x: t.x, y: t.y, dir: t.dir, next: t.next }).toMatchObject({ x: 4, y: 6, next: null })
    const at = tracerPosition(t)
    for (let i = 0; i < 120; i++) step(s, idle)
    expect(tracerPosition(t)).toEqual(at)
  })

  test('H3 H4: a shift that brings the player next to a tracer is caught in the same step', () => {
    const s = createGame(level('001'))
    const t = s.tracers[0]
    // The tracer's centre is just outside the NW pocket's west mouth (J4: not carried).
    t.x = 2; t.y = 5; t.next = { x: 3, y: 5 }; t.dir = 1; t.progress = 0.4
    // The player is carried from SW to the west edge of NW: arrival (3.37, 5.5) after clamping (J5a).
    s.player.x = 3.5; s.player.y = 6.63
    shiftOnce(s)
    expect(s.player.x).toBeCloseTo(3.37, 9)
    expect(s.status).toBe('failed')
    expect(s.failCause).toBe('tracer')
  })

  test('R6: two tracers carried into the same place coexist', () => {
    const s = createGame({ ...level('001'), tracers: [{ x: 1, y: 5, dir: 1, speed: 2 }, { x: 2, y: 5, dir: 3, speed: 2 }] })
    for (let i = 0; i < 120; i++) step(s, idle)
    expect(s.status).toBe('playing')
  })

  test('R7: a shift changes the predicted path immediately', () => {
    const s = createGame(level('001'))
    const t = s.tracers[0]
    t.x = 3; t.y = 5; t.progress = 0; t.dir = 1; t.next = { x: 2, y: 5 }; t.dir = 3
    s.player.x = 3.5; s.player.y = 6.5
    expect(predictPath(s, t, 4).every(p => p.x < 4)).toBe(true)
    shiftOnce(s)
    expect(predictPath(s, t, 4).every(p => p.x >= 4)).toBe(true)
  })
})

test.describe('Edge Case engine: every level has more than one way through', () => {
  test('000 False Start: shift out north-east, collect both samples, time the tracer', () => {
    const bot = new Bot(level('000'))
    bot.act().path([4, 4], [6, 4], [5, 4], [5, 5], [4, 5]).act().act().path([3, 7], [3, 8], [1, 8], [1, 9], [3, 8], [3, 7], [3, 6]).act().act()
    expect(tileOf(bot.state)).toEqual({ x: 4, y: 5 })
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
    bot.until(s => s.tracers[0].dir === 3 && tracerPosition(s.tracers[0]).x < 2.4)
    bot.act()
    expect(discovered(bot)).not.toContain('reroute')
    bot.path([3, 4], [3, 2], [1, 2], [1, 1], [7, 1], [4, 1])
    expect(bot.state.status).toBe('won')
  })

  test('001 Expected Behavior: or carry the tracer away (Re:Route, 0x02) and walk through', () => {
    const bot = new Bot(level('001'))
    bot.path([3, 8], [3, 7], [3, 6])
    bot.until(s => inPocket(s, 3, 5))
    bot.act()
    expect(discovered(bot)).toContain('reroute')
    expect(predictPath(bot.state, bot.state.tracers[0], 12).every(p => p.x >= 4)).toBe(true)
    bot.path([3, 4], [3, 2], [1, 2], [1, 1], [7, 1], [4, 1])
    expect(bot.state.status).toBe('won')
  })

  test('001 Expected Behavior: or strand the tracer off its track (It is not a bug, 0x03)', () => {
    const bot = new Bot(level('001'))
    bot.path([3, 8], [3, 7], [3, 6])
    bot.until(s => inPocket(s, 3, 5))
    bot.act().act().act()
    expect(discovered(bot)).toContain('not-a-bug')
    expect(bot.state.tracers[0].next).toBeNull()
  })

  test('010 Shift Happens: shift into the sealed exit pocket (Technically Correct 0x05, Exception 0x06)', () => {
    const bot = new Bot(level('010'))
    bot.path([1, 9], [3, 9], [3, 7])
    bot.until(s => tracerPosition(s.tracers[0]).x > 5.5 && s.tracers[0].dir === 1)
    bot.path([3, 6], [3, 4], [3, 3], [2, 3], [2, 1], [1, 1], [2, 1], [2, 3], [3, 3]).act().act()
    expect(bot.state.status).toBe('won')
    expect(discovered(bot)).toEqual(expect.arrayContaining(['technically-correct', 'exception']))
  })

  test('010 Shift Happens: or find and turn the hidden channel gate (Pivot 0x04) and walk in', () => {
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

test.describe('Edge Case engine: discoveries come from rules (§8), not defects', () => {
  test('0x01 Expected Behavior: a full cycle before any movement input', () => {
    const bot = new Bot(level('001'))
    bot.wait(Math.ceil((4 / 2.2) * 60) + 5)
    expect(discovered(bot)).toContain('expected-behavior')
    const moved = new Bot(level('001'))
    moved.hold(1, 0, 5).wait(240)
    expect(discovered(moved)).not.toContain('expected-behavior')
  })

  test('0x09 Full Circle: the fourth shift of one junction', () => {
    const bot = new Bot(level('000'))
    bot.act().act().act()
    expect(discovered(bot)).not.toContain('full-circle')
    bot.act()
    expect(discovered(bot)).toContain('full-circle')
  })

  test('0x08 Off by One: a win one simulation step ahead of a tracer', () => {
    const s = createGame(level('000'))
    s.samples.forEach(sample => { sample.taken = true })
    const t = s.tracers[0]
    s.tiles[1][3] = 'track'; s.tiles[1][4] = 'track'
    t.x = 3; t.y = 1; t.next = { x: 4, y: 1 }; t.progress = 1 - 0.56 - 2 / 60; t.dir = 1
    s.player.x = 4.5; s.player.y = 1.5
    step(s, idle)
    expect(s.status).toBe('won')
    expect(s.discovered).toContain('off-by-one')
  })

  test('0x05 and 0x06 negatives: walking in with every sample awards neither', () => {
    const s = createGame(level('010'))
    s.samples.forEach(sample => { sample.taken = true })
    s.player.x = 4.5; s.player.y = 2.5
    s.tile = { x: 4, y: 2, enteredBy: 'move' }
    step(s, idle)
    expect(s.status).toBe('won')
    expect(s.discovered).not.toContain('exception')
    expect(s.discovered).not.toContain('technically-correct')
  })

  test('E1 0x05: entered by shift, then stepping onto the exit centre, still counts', () => {
    const s = createGame(level('010'))
    s.samples.slice(0, 2).forEach(sample => { sample.taken = true })
    s.player.x = 3.3; s.player.y = 2.3
    shiftOnce(s)
    expect(s.tile).toMatchObject({ x: 4, y: 2, enteredBy: 'shift' })
    for (let i = 0; i < 60 && s.status === 'playing'; i++) step(s, { dx: Math.sign(4.5 - s.player.x), dy: Math.sign(2.5 - s.player.y), action: false })
    expect(s.status).toBe('won')
    expect(s.discovered).toContain('technically-correct')
  })
})
