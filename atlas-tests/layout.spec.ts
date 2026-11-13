import { expect, test } from '@playwright/test'
import { computeSemanticLayout, MissingComparisonsError, type SemanticLayoutInput } from '../src/experiments/atlas/layout'

const weights = { question: .35, mechanism: .3, methods: .15, scale: .1, setting: .1 }
function inputFor(points: { x: number; y: number }[]): SemanticLayoutInput {
  const cases = points.map((_, index) => ({ id: `case-${index}`, title: `Invented case ${index}` }))
  const pairs = cases.flatMap((source, a) => cases.slice(a + 1).map((target, offset) => {
    const b = a + offset + 1
    const score = 1 - Math.hypot(points[a].x - points[b].x, points[a].y - points[b].y)
    return { fromId: source.id, toId: target.id, scores: { question: score, mechanism: score, methods: score, scale: score, setting: score }, rationale: 'Invented mathematical specimen; no empirical similarity claim.' }
  }))
  return { schemaVersion: 1, rubricVersion: 'synthetic-math-v1', weights, cases, pairs }
}
const square = () => inputFor([{ x: 0, y: 0 }, { x: .5, y: 0 }, { x: .5, y: .5 }, { x: 0, y: .5 }])

test('reordering case and pair records preserves the full deterministic artifact', () => {
  const input = square()
  const reordered = structuredClone(input)
  reordered.cases.reverse()
  reordered.pairs.reverse().forEach(pair => { [pair.fromId, pair.toId] = [pair.toId, pair.fromId] })
  reordered.weights = { setting: .1, methods: .15, scale: .1, mechanism: .3, question: .35 }
  expect(computeSemanticLayout(reordered)).toEqual(computeSemanticLayout(input))
  const before = structuredClone(input)
  const output = computeSemanticLayout(input)
  output.weights.question = 0
  expect(input).toEqual(before)
})

test('recovers Euclidean pair distances without assigning semantic axes', () => {
  const layout = computeSemanticLayout(square())
  expect(layout.rawStress).toBeLessThan(1e-16)
  for (const pair of layout.pairs) expect(Math.abs(pair.signedResidual)).toBeLessThan(1e-7)
  expect(layout.positions.every(point => Number.isFinite(point.x) && Number.isFinite(point.y))).toBe(true)
  expect(layout.positions.reduce((sum, point) => sum + point.x, 0)).toBeCloseTo(0, 12)
  expect(layout.positions.reduce((sum, point) => sum + point.y, 0)).toBeCloseTo(0, 12)
})

test('reports raw stress and signed projection distortion from the actual coordinates', () => {
  const input = square()
  input.pairs.forEach(pair => { pair.scores = { question: 0, mechanism: 0, methods: 0, scale: 0, setting: 0 } })
  const layout = computeSemanticLayout(input)
  const positions = new Map(layout.positions.map(point => [point.id, point]))
  let calculated = 0
  let denominator = 0
  for (const pair of layout.pairs) {
    const from = positions.get(pair.fromId)!
    const to = positions.get(pair.toId)!
    const actualDistance = Math.hypot(from.x - to.x, from.y - to.y)
    expect(pair.fittedDistance).toBe(actualDistance)
    expect(pair.signedResidual).toBe(actualDistance - pair.targetDistance)
    calculated += (actualDistance - pair.targetDistance) ** 2
    denominator += pair.targetDistance ** 2
  }
  expect(layout.rawStress).toBeCloseTo(calculated, 14)
  expect(layout.normalizedStress).toBeCloseTo(Math.sqrt(calculated / denominator), 14)
  expect(layout.rawStress).toBeGreaterThan(.01) // Four equidistant points cannot fit exactly in 2D.
  expect(layout.pairs.some(pair => pair.signedResidual > .01)).toBe(true)
  expect(layout.pairs.some(pair => pair.signedResidual < -.01)).toBe(true)
})

test('SMACOF retains a monotonic trace and bounded reproducible restart diagnostics', () => {
  const input = inputFor([{ x: 0, y: 0 }, { x: .2, y: .1 }, { x: .4, y: 0 }, { x: .1, y: .4 }, { x: .4, y: .4 }, { x: .6, y: .2 }])
  const start = performance.now()
  const layout = computeSemanticLayout(input)
  expect(performance.now() - start).toBeLessThan(5000)
  expect(layout.algorithm.restarts).toHaveLength(8)
  expect(layout.algorithm.dimensions).toBe(2)
  expect(layout.algorithm.converged).toBe(true)
  expect(layout.algorithm.iterations).toBeLessThanOrEqual(layout.algorithm.maxIterations)
  expect(layout.algorithm.stressTrace.at(-1)).toBe(layout.rawStress)
  layout.algorithm.stressTrace.slice(1).forEach((value, index) => expect(value).toBeLessThanOrEqual(layout.algorithm.stressTrace[index]))
  expect(layout.caseIds).toEqual(input.cases.map(item => item.id))
  expect(layout.inputDigest).toMatch(/^[a-f0-9]{64}$/)
})

test('all-zero target distances produce coincidence and not-estimable normalized stress', () => {
  const layout = computeSemanticLayout(inputFor([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]))
  expect(layout.rawStress).toBe(0)
  expect(layout.normalizedStress).toBeNull()
  expect(layout.algorithm.iterations).toBe(0)
  expect(layout.positions).toEqual(layout.caseIds.map(id => ({ id, x: 0, y: 0 })))
  expect(layout.pairs.every(pair => pair.targetDistance === 0 && pair.fittedDistance === 0)).toBe(true)
})

test('a genuine zero-distance pair is not moved apart by label or collision forces', () => {
  const layout = computeSemanticLayout(inputFor([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: .5, y: 0 }]))
  expect(layout.pairs.find(pair => pair.fromId === 'case-0' && pair.toId === 'case-1')!.fittedDistance).toBeLessThan(1e-7)
  expect(layout.rawStress).toBeLessThan(1e-16)
})

test('absent and explicitly unknown comparisons produce a distinct unavailable result', () => {
  const absent = square()
  const removed = absent.pairs.pop()!
  expect(() => computeSemanticLayout(absent)).toThrow(MissingComparisonsError)
  try { computeSemanticLayout(absent) } catch (error) {
    expect((error as MissingComparisonsError).comparisons).toEqual([{ fromId: removed.fromId, toId: removed.toId, reason: 'No comparison was supplied' }])
  }
  const unknown = square()
  unknown.pairs[0].scores = null
  unknown.pairs[0].unknownReason = 'The invented rubric has not classified this pair.'
  expect(() => computeSemanticLayout(unknown)).toThrow(MissingComparisonsError)
  try { computeSemanticLayout(unknown) } catch (error) {
    expect((error as MissingComparisonsError).comparisons[0].reason).toContain('not classified')
  }
})

test('weights combine dimensions as declared rather than becoming confidence or pair weights', () => {
  const input = inputFor([{ x: 0, y: 0 }, { x: .5, y: 0 }])
  input.pairs[0].scores = { question: 1, mechanism: .5, methods: 0, scale: 0, setting: 0 }
  const layout = computeSemanticLayout(input)
  expect(layout.pairs[0].targetDistance).toBeCloseTo(.5, 14)
  expect(layout.pairs[0].fittedDistance).toBeCloseTo(.5, 12)
})

test('strict runtime validation rejects invalid, ambiguous and cross-kind inputs', () => {
  const invalid: ((input: SemanticLayoutInput) => void)[] = [
    input => { input.cases[0].id = '../private' },
    input => { input.cases[0].id = input.cases[1].id },
    input => { input.weights.question = .9 },
    input => { input.weights.question = Infinity },
    input => { input.pairs[0].scores!.question = NaN },
    input => { input.pairs[0].scores!.methods = 2 },
    input => { input.pairs[0].fromId = 'not-in-corpus' },
    input => { input.pairs[0].fromId = input.pairs[0].toId },
    input => { input.pairs.push({ ...input.pairs[0], fromId: input.pairs[0].toId, toId: input.pairs[0].fromId }) },
    input => { Object.assign(input.cases[0], { kind: 'term' }) },
    input => { input.pairs[0].rationale = ' ' },
    input => { input.pairs[0].scores = null },
    input => { input.pairs[0].unknownReason = 'Contradicts the known-score state.' },
    input => { Object.assign(input, { approved: true }) },
  ]
  for (const mutate of invalid) {
    const input = square()
    mutate(input)
    expect(() => computeSemanticLayout(input)).toThrow()
  }
})
