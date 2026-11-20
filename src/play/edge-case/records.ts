import type { DiscoveryId, GameState } from './engine'
import { createMemory, draw, type Palette } from './render'
import { discoveries } from './system-index'

/** Run records, snapshots and personal ranking (tests/EDGE-CASE-MECHANICS.md §12). */
export interface RunRecord {
  id: string
  level: string
  code: string
  title: string
  /** won = complete; partial = left through the exit without the required samples (§9, S4). */
  outcome: 'won' | 'partial' | 'failed'
  /** Samples collected and needed for complete (absent in records made before 13 November). */
  samples?: number
  required?: number
  cause?: 'tracer' | 'field'
  seconds: number
  shifts: number
  gateTurns: number
  attempt: number
  hints: number
  discoveries: DiscoveryId[]
  method: string
  at: string
  thumb: string
}

const KEY = 'edge-case:log:v1'
const LIMIT = 40

const METHOD_TAGS: [DiscoveryId, string][] = [['reroute', 'Re:Route'], ['not-a-bug', 'Strand'], ['pivot', 'Pivot'], ['technically-correct', 'Carried exit'], ['exception', 'Exception']]
/** L3: the rule-level techniques a win used; none of them means Direct. */
export function methodOf(found: DiscoveryId[]) {
  const tags = METHOD_TAGS.filter(([id]) => found.includes(id)).map(([, label]) => label)
  return tags.length ? tags.join(' + ') : 'Direct'
}

export function loadLog(): RunRecord[] {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? '[]')
    return Array.isArray(raw) ? raw.filter(r => r && typeof r.id === 'string' && typeof r.level === 'string' && typeof r.seconds === 'number') : []
  } catch { return [] }
}

export function appendLog(log: RunRecord[], record: RunRecord) {
  const next = [record, ...log].slice(0, LIMIT)
  try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* storage full or blocked: keep playing */ }
  return next
}

export interface Standing { bestSeconds: number | null; fewestActions: number | null; ways: string[]; wins: number; runs: number; bestPartial: { samples: number; required: number } | null }
export function standing(log: RunRecord[], level: string): Standing {
  const runs = log.filter(r => r.level === level)
  const wins = runs.filter(r => r.outcome === 'won')
  return {
    bestSeconds: wins.length ? Math.min(...wins.map(r => r.seconds)) : null,
    fewestActions: wins.length ? Math.min(...wins.map(r => r.shifts + r.gateTurns)) : null,
    ways: [...new Set(wins.map(r => r.method))],
    wins: wins.length,
    runs: runs.length,
    // L5: the largest insufficient sample, shown only while a level has no complete run.
    bestPartial: runs.filter(r => r.outcome === 'partial' && typeof r.samples === 'number' && typeof r.required === 'number')
      .reduce<Standing['bestPartial']>((best, r) => !best || r.samples! > best.samples ? { samples: r.samples!, required: r.required! } : best, null),
  }
}

/** L4: position by time among this level's wins (1 = fastest). Ties share the better rank. */
export function rankOf(log: RunRecord[], record: RunRecord) {
  const wins = log.filter(r => r.level === record.level && r.outcome === 'won')
  return { rank: 1 + wins.filter(r => r.seconds < record.seconds).length, of: wins.length }
}

const discoveryName = (id: DiscoveryId) => { const d = discoveries.find(item => item.id === id)!; return `${d.code} ${d.name}` }

function renderState(state: GameState, palette: Palette, tile: number, route: [number, number][]) {
  const canvas = document.createElement('canvas')
  canvas.width = state.width * tile
  canvas.height = state.height * tile
  const ctx = canvas.getContext('2d')!
  draw(ctx, state, { tile, previews: false, reveal: false, inspect: null, reducedMotion: true, highContrast: tile < 20, ghost: route, memory: createMemory(), now: 0 }, palette)
  return canvas
}

const routeOf = (state: GameState): [number, number][] => [...state.trail, [state.player.x, state.player.y]]

/** L2: a small deterministic picture of how the attempt ended, kept in the log. */
export function thumbnail(state: GameState, palette: Palette) {
  try { return renderState(state, palette, 12, routeOf(state)).toDataURL('image/png') } catch { return '' }
}

/** L2: a full-size field record a player can save or share. */
export function snapshot(state: GameState, record: RunRecord, palette: Palette) {
  const tile = 40
  const arena = renderState(state, palette, tile, routeOf(state))
  const band = 132
  const canvas = document.createElement('canvas')
  canvas.width = arena.width
  canvas.height = arena.height + band
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = palette.paper
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(arena, 0, 0)
  ctx.fillStyle = palette.ink
  ctx.fillRect(0, arena.height, canvas.width, 3)
  ctx.textBaseline = 'top'
  ctx.font = '600 13px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillStyle = palette.muted
  ctx.fillText(`EDGE CASE · FIELD RECORD · ${record.at.slice(0, 16).replace('T', ' ')}`, 14, arena.height + 14)
  ctx.font = '700 22px ui-sans-serif, system-ui, sans-serif'
  ctx.fillStyle = palette.ink
  ctx.fillText(`${record.code} ${record.title} — ${record.outcome === 'won' ? 'complete' : record.outcome === 'partial' ? `insufficient sample, n = ${record.samples ?? '?'}/${record.required ?? '?'}` : record.cause === 'field' ? 'caught in a field' : 'caught by a tracer'}`, 14, arena.height + 36)
  ctx.font = '500 15px ui-monospace, Menlo, Consolas, monospace'
  ctx.fillText(`${record.seconds.toFixed(1)} s · ${record.shifts} junction turns · ${record.gateTurns} gate turns · attempt ${record.attempt} · hints ${record.hints}`, 14, arena.height + 70)
  const found = record.discoveries.map(discoveryName).join(' · ')
  ctx.fillStyle = palette.muted
  ctx.fillText(record.outcome === 'won' ? `Method: ${record.method}${found ? ` · ${found}` : ''}`.slice(0, 64) : 'Your route is drawn; × marks where it ended.', 14, arena.height + 96)
  return canvas
}

type Downloads = { save(request: { filename: string; data: Blob }): Promise<{ status: string }> }
let downloads: Promise<Downloads | null> = Promise.resolve(null)
/**
 * Inside a claude.ai artifact (private play-test build), saving goes through the
 * viewer's `downloads` capability. Elsewhere `window.claude` is absent and this
 * resolves to null immediately. Call once at startup, never on a save click.
 */
export function prepareDownloads() {
  const host = (window as unknown as { claude?: { use?: (name: string) => Promise<unknown> } }).claude
  downloads = host?.use ? host.use('downloads').then(value => value as Downloads | null, () => null) : Promise.resolve(null)
}

/** Save via the artifact viewer, then the share sheet (iOS: Save Image), else a download. */
export async function saveSnapshot(canvas: HTMLCanvasElement, name: string) {
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!blob) return 'failed'
  const viewer = await Promise.race([downloads, new Promise<null>(resolve => setTimeout(() => resolve(null), 300))])
  if (viewer) {
    try { await viewer.save({ filename: name, data: blob }); return 'downloaded' }
    catch (error) {
      const code = (error as { code?: string }).code
      if (code === 'declined') return 'cancelled'
      if (code === 'rate_limited') return 'failed'
      // unavailable and lifecycle codes: fall through to the browser's own routes.
    }
  }
  const file = new File([blob], name, { type: 'image/png' })
  try {
    if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: 'Edge Case field record' }); return 'shared' }
  } catch (error) { if ((error as Error).name === 'AbortError') return 'cancelled' }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
  return 'downloaded'
}
