import { createHash } from 'node:crypto'
import { z } from 'zod'

// Build-only mathematics. The browser receives the resulting artifact, never
// this validator, crypto implementation or optimizer. No canonical content is
// imported here; case classification and dimension weights remain hypotheses.
export const semanticDimensions = ['question', 'mechanism', 'methods', 'scale', 'setting'] as const
type Dimension = typeof semanticDimensions[number]
export type DimensionScores = Record<Dimension, number>
const identity = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/).max(100)
const explanation = z.string().trim().min(1).max(4000)
const scoresSchema = z.strictObject({
  question: z.number().finite().min(0).max(1), mechanism: z.number().finite().min(0).max(1),
  methods: z.number().finite().min(0).max(1), scale: z.number().finite().min(0).max(1), setting: z.number().finite().min(0).max(1),
})
const inputSchema = z.strictObject({
  schemaVersion: z.literal(1),
  rubricVersion: z.string().trim().min(1).max(100),
  weights: scoresSchema,
  // Only comparable cases are admitted. Extra cross-kind metadata rejects.
  cases: z.array(z.strictObject({ id: identity, title: z.string().trim().min(1).max(200) })).min(2).max(32),
  pairs: z.array(z.strictObject({ fromId: identity, toId: identity, scores: scoresSchema.nullable(), rationale: explanation, unknownReason: explanation.optional() })).max(496),
}).superRefine((input, ctx) => {
  if (Math.abs(semanticDimensions.reduce((sum, dimension) => sum + input.weights[dimension], 0) - 1) > 1e-12) {
    ctx.addIssue({ code: 'custom', path: ['weights'], message: 'Semantic dimension weights must sum to 1' })
  }
  const ids = new Set(input.cases.map(item => item.id))
  if (ids.size !== input.cases.length) ctx.addIssue({ code: 'custom', path: ['cases'], message: 'Duplicate case identity' })
  const pairs = new Set<string>()
  input.pairs.forEach((pair, index) => {
    const issue = (message: string) => ctx.addIssue({ code: 'custom', path: ['pairs', index], message })
    if (!ids.has(pair.fromId) || !ids.has(pair.toId)) issue('Semantic pair endpoint is missing')
    if (pair.fromId === pair.toId) issue('Self comparisons are not allowed')
    const key = [pair.fromId, pair.toId].sort().join(':')
    if (pairs.has(key)) issue('Duplicate unordered semantic pair')
    pairs.add(key)
    if (pair.scores === null && !pair.unknownReason) issue('Unknown comparisons need an explicit reason')
    if (pair.scores !== null && pair.unknownReason !== undefined) issue('A scored comparison cannot also be marked unknown')
  })
})

export type SemanticLayoutInput = z.infer<typeof inputSchema>
export type MissingComparison = { fromId: string; toId: string; reason: string }
export class MissingComparisonsError extends Error {
  readonly comparisons: MissingComparison[]
  constructor(comparisons: MissingComparison[]) {
    super('Semantic layout unavailable: every unordered case pair needs a known comparison. Unknown is not zero similarity or zero distance.')
    this.name = 'MissingComparisonsError'
    this.comparisons = structuredClone(comparisons)
  }
}

const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0
export function validateSemanticLayoutInput(value: unknown): SemanticLayoutInput {
  const input = inputSchema.parse(value)
  input.cases.sort((a, b) => compare(a.id, b.id))
  input.pairs = input.pairs.map(pair => compare(pair.fromId, pair.toId) < 0 ? pair : { ...pair, fromId: pair.toId, toId: pair.fromId })
    .sort((a, b) => compare(a.fromId, b.fromId) || compare(a.toId, b.toId))
  return structuredClone(input)
}

type Point = { x: number; y: number }
export type SemanticPosition = Point & { id: string }
type Target = { a: number; b: number; distance: number }
type ScoredPair = { fromId: string; toId: string; scores: DimensionScores; rationale: string }
export type SemanticLayout = {
  schemaVersion: 1
  inputDigest: string
  rubricVersion: string
  weights: DimensionScores
  caseIds: string[]
  positions: SemanticPosition[]
  pairs: (ScoredPair & { targetDistance: number; fittedDistance: number; signedResidual: number })[]
  algorithm: {
    name: 'raw-stress-smacof'
    version: 1
    dimensions: 2
    seeds: number[]
    maxIterations: number
    tolerance: number
    selectedSeed: number
    iterations: number
    converged: boolean
    stressTrace: number[]
    restarts: { seed: number; iterations: number; converged: boolean; rawStress: number; failure: string | null }[]
  }
  rawStress: number
  normalizedStress: number | null
}

const seeds = [104729, 130363, 155921, 196613, 233021, 275015, 314159, 350377]
const maxIterations = 2000
const tolerance = 1e-10
function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6D2B79F5) >>> 0
    let value = state
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}
function center(points: Point[]) {
  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length
  return points.map(point => ({ x: point.x - meanX, y: point.y - meanY }))
}
function stress(points: Point[], targets: Target[]) {
  return targets.reduce((sum, target) => {
    const distance = Math.hypot(points[target.a].x - points[target.b].x, points[target.a].y - points[target.b].y)
    return sum + (distance - target.distance) ** 2
  }, 0)
}
function optimize(count: number, targets: Target[], seed: number, initialScale: number) {
  const nextRandom = random(seed)
  let points = center(Array.from({ length: count }, () => ({ x: (nextRandom() - .5) * initialScale, y: (nextRandom() - .5) * initialScale })))
  let current = stress(points, targets)
  const trace = [current]
  let converged = false
  let failure: string | null = null
  for (let iteration = 0; iteration < maxIterations; iteration++) {
    const next = Array.from({ length: count }, () => ({ x: 0, y: 0 }))
    for (const target of targets) {
      const dx = points[target.a].x - points[target.b].x
      const dy = points[target.a].y - points[target.b].y
      const distance = Math.hypot(dx, dy)
      if (distance === 0 && target.distance > 0) {
        failure = 'Coincident starting points for a positive target distance'
        break
      }
      // For the complete unit-weight graph, the centered Guttman transform is
      // X_next = B(X) X / n. There is no post-layout force or axis constraint.
      const factor = distance > 0 ? target.distance / distance / count : 0
      next[target.a].x += factor * dx; next[target.a].y += factor * dy
      next[target.b].x -= factor * dx; next[target.b].y -= factor * dy
    }
    if (failure) break
    const centered = center(next)
    const candidate = stress(centered, targets)
    if (!Number.isFinite(candidate) || centered.some(point => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
      failure = 'Nonfinite SMACOF update'
      break
    }
    if (candidate > current) {
      // Never publish an increasing trace. Tiny roundoff stalls at the prior
      // valid iterate; a meaningful increase invalidates this restart.
      if (candidate - current > 1e-12 * Math.max(1, current)) failure = 'SMACOF stress increased beyond roundoff tolerance'
      else converged = true
      break
    }
    const improvement = current - candidate
    points = centered
    current = candidate
    trace.push(current)
    if (current <= 1e-24 || improvement <= tolerance * Math.max(current, 1e-20)) { converged = true; break }
  }
  return { seed, points, rawStress: current, iterations: trace.length - 1, converged, failure, trace }
}

/**
 * Complete-case, deterministic multistart metric MDS. Convergence means this
 * numerical stopping rule was met; it never establishes a global optimum or
 * validates the underlying editorial classification.
 */
export function computeSemanticLayout(value: unknown): SemanticLayout {
  const input = validateSemanticLayoutInput(value)
  const known = new Map(input.pairs.map(pair => [`${pair.fromId}:${pair.toId}`, pair]))
  const missing: MissingComparison[] = []
  const pairs: ScoredPair[] = []
  const targets: Target[] = []
  input.cases.forEach((source, a) => input.cases.slice(a + 1).forEach((target, offset) => {
    const pair = known.get(`${source.id}:${target.id}`)
    if (!pair || pair.scores === null) {
      missing.push({ fromId: source.id, toId: target.id, reason: pair?.unknownReason ?? 'No comparison was supplied' })
      return
    }
    // With weights summing to 1, sum(w * (1-s)) = 1-sum(w*s).
    // Computing the complement directly keeps perfect similarity exactly zero
    // instead of introducing a fictitious distance through cancellation.
    const dissimilarity = semanticDimensions.reduce((sum, dimension) => sum + input.weights[dimension] * (1 - pair.scores![dimension]), 0)
    const distance = Math.max(0, Math.min(1, dissimilarity))
    pairs.push({ fromId: source.id, toId: target.id, scores: pair.scores, rationale: pair.rationale })
    targets.push({ a, b: a + offset + 1, distance })
  }))
  if (missing.length) throw new MissingComparisonsError(missing)
  const denominator = targets.reduce((sum, target) => sum + target.distance ** 2, 0)
  const initialScale = Math.sqrt(denominator / targets.length)
  const runs = denominator === 0
    ? [{ seed: seeds[0], points: input.cases.map(() => ({ x: 0, y: 0 })), rawStress: 0, iterations: 0, converged: true, failure: null, trace: [0] }]
    : seeds.map(seed => optimize(input.cases.length, targets, seed, initialScale))
  const viable = runs.filter(run => run.failure === null && Number.isFinite(run.rawStress))
  if (!viable.length) throw new Error('Semantic layout unavailable: every SMACOF restart failed numerically')
  const best = viable.reduce((chosen, run) => run.rawStress < chosen.rawStress ? run : chosen)
  return {
    schemaVersion: 1,
    inputDigest: createHash('sha256').update(JSON.stringify(input)).digest('hex'),
    rubricVersion: input.rubricVersion,
    weights: input.weights,
    caseIds: input.cases.map(item => item.id),
    positions: best.points.map((point, index) => ({ id: input.cases[index].id, ...point })),
    pairs: pairs.map((pair, index) => {
      const target = targets[index]
      const fittedDistance = Math.hypot(best.points[target.a].x - best.points[target.b].x, best.points[target.a].y - best.points[target.b].y)
      return { ...pair, targetDistance: target.distance, fittedDistance, signedResidual: fittedDistance - target.distance }
    }),
    algorithm: {
      name: 'raw-stress-smacof', version: 1, dimensions: 2, seeds: [...seeds], maxIterations, tolerance,
      selectedSeed: best.seed, iterations: best.iterations, converged: best.converged, stressTrace: best.trace,
      restarts: runs.map(run => ({ seed: run.seed, iterations: run.iterations, converged: run.converged, rawStress: run.rawStress, failure: run.failure })),
    },
    rawStress: best.rawStress,
    normalizedStress: denominator === 0 ? null : Math.sqrt(best.rawStress / denominator),
  }
}
