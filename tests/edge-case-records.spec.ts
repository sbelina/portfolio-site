import { test, expect } from '@playwright/test'
import { methodOf, rankOf, standing, type RunRecord } from '../src/play/edge-case/records'

// §12 of tests/EDGE-CASE-MECHANICS.md: run records, methods and personal ranking.
const run = (patch: Partial<RunRecord>): RunRecord => ({
  id: Math.random().toString(36), level: 'shift-happens', code: '010', title: 'Shift Happens', outcome: 'won', seconds: 20, shifts: 2, gateTurns: 0,
  attempt: 1, hints: 0, discoveries: [], method: 'Direct', at: '2026-11-11T12:00:00Z', thumb: '', ...patch,
})

test('L3: a method names the rule-level techniques used, or Direct', () => {
  expect(methodOf([])).toBe('Direct')
  expect(methodOf(['false-start', 'off-by-one'])).toBe('Direct')
  expect(methodOf(['technically-correct', 'exception'])).toBe('Carried exit + Exception')
  expect(methodOf(['pivot', 'reroute'])).toBe('Re:Route + Pivot')
})

test('L4: standings use wins only; ways counts distinct methods; rank is by time with shared ties', () => {
  const log = [
    run({ seconds: 30, method: 'Pivot', gateTurns: 1, shifts: 0 }),
    run({ seconds: 18, method: 'Carried exit + Exception', shifts: 2 }),
    run({ seconds: 18, method: 'Carried exit + Exception', shifts: 3 }),
    run({ seconds: 5, outcome: 'failed', cause: 'tracer', method: '' }),
    run({ level: 'false-start', code: '000', seconds: 9 }),
  ]
  expect(standing(log, 'shift-happens')).toEqual({ bestSeconds: 18, fewestActions: 1, ways: ['Pivot', 'Carried exit + Exception'], wins: 3, runs: 4 })
  expect(rankOf(log, log[1])).toEqual({ rank: 1, of: 3 })
  expect(rankOf(log, log[2])).toEqual({ rank: 1, of: 3 })
  expect(rankOf(log, log[0])).toEqual({ rank: 3, of: 3 })
  expect(standing(log, 'expected-behavior')).toEqual({ bestSeconds: null, fewestActions: null, ways: [], wins: 0, runs: 0 })
})
