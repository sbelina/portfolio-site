import { test, expect } from '@playwright/test'
import { followBase, stickInput, STICK_DEAD_ZONE } from '../src/play/edge-case/stick'
import { createGame, step } from '../src/play/edge-case/engine'
import { levels } from '../src/play/edge-case/levels'

// I1 and P2 in tests/EDGE-CASE-MECHANICS.md.
test('I1: the dead zone gives no input; axis directions have exactly zero cross-component', () => {
  expect(stickInput(44 * STICK_DEAD_ZONE * 0.9, 0, 44)).toEqual([0, 0])
  const [dx, dy] = stickInput(40, 6, 44)
  expect(dy).toBe(0)
  expect(dx).toBeGreaterThan(0.85)
  const [, up] = stickInput(-3, -44, 44)
  expect(up).toBe(-1)
})

test('I1: magnitude rises from the dead zone to 1 at the rim and saturates beyond it', () => {
  const half = stickInput(22, 0, 44)[0]
  expect(half).toBeCloseTo((0.5 - STICK_DEAD_ZONE) / (1 - STICK_DEAD_ZONE), 9)
  expect(stickInput(44, 0, 44)[0]).toBe(1)
  expect(stickInput(200, 0, 44)[0]).toBe(1)
})

test('I1: diagonals snap to eight directions with the same magnitude', () => {
  const [dx, dy] = stickInput(30, 33, 44)
  expect(dx).toBeCloseTo(dy, 9)
  expect(Math.hypot(dx, dy)).toBeCloseTo(Math.min(1, (Math.hypot(30, 33) / 44 - STICK_DEAD_ZONE) / (1 - STICK_DEAD_ZONE)), 9)
})

test('I1: the base trails a finger that moves past the rim, staying at rim distance', () => {
  expect(followBase({ x: 50, y: 50 }, { x: 70, y: 50 }, 44)).toEqual({ x: 50, y: 50 })
  const moved = followBase({ x: 50, y: 50 }, { x: 150, y: 50 }, 44)
  expect(moved).toEqual({ x: 106, y: 50 })
})

test('P2: partial input moves at proportional speed; keyboard diagonals are normalised', () => {
  const run = (dx: number, dy: number) => { const s = createGame(levels[2]); s.player.x = 4.5; s.player.y = 8.5; for (let i = 0; i < 15; i++) step(s, { dx, dy, action: false }); return Math.hypot(s.player.vx, s.player.vy) }
  expect(run(0.5, 0)).toBeCloseTo(2, 6)
  expect(run(1, 0)).toBeCloseTo(4, 6)
  expect(run(1, 1)).toBeCloseTo(4, 6)
})
