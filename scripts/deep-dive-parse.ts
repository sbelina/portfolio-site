/**
 * Turns an owner-written deep-dive Markdown file into the structured record the Worker renders
 * in the deck grammar (docs/design-system/DECK-FOUNDATION.md §2). Runs on the owner's computer.
 *
 * Format, one block per part (spread):
 *
 *   Kicker: FIELD · CASE 01, 1 OF 3 · TEST — Diagnosing a cross-department failure
 *   ## Errors repeated. *Timing* was the problem.
 *   ### The label
 *   …
 *   ### What the evidence showed
 *   …
 *   ### Figure
 *   FIG. 02 · Conceptual illustration · positions illustrative
 *   A description of the figure.
 *   ### My role
 *   ### What changed
 *   ### Principle
 *   ### Trade-off
 *   ### Next
 *   So what changed?
 *
 * Any other ### heading becomes an extra section in that part. Text before the first part is the
 * deep dive's introduction. In a headline, *one word* is the accent (the word that carries the turn).
 */
import { marked } from 'marked'

export type DeepDivePart = {
  id: string
  kicker?: string
  headline: string // inline HTML; <em> is the accent word
  label?: string; evidence?: string; role?: string; changed?: string; principle?: string; tradeoff?: string
  figure?: { label: string; html: string }
  next?: string // the question that leads onward (plain text)
  extra: { title: string; html: string }[]
}
export type DeepDiveRecord = { schema: 2; title: string; kicker?: string; summary?: string; intro?: string; parts: DeepDivePart[] }

const known: Record<string, keyof Pick<DeepDivePart, 'label' | 'evidence' | 'role' | 'changed' | 'principle' | 'tradeoff'>> = {
  'the label': 'label', 'what the evidence showed': 'evidence', 'my role': 'role',
  'what changed': 'changed', 'what leadership changed': 'changed', 'principle': 'principle', 'trade-off': 'tradeoff',
}
const block = (markdown: string) => (marked.parse(markdown.trim(), { async: false }) as string).trim()
const inline = (markdown: string) => (marked.parseInline(markdown.trim(), { async: false }) as string).trim()

export function parseDeepDive(markdown: string, meta: { title: string; kicker?: string; summary?: string }): DeepDiveRecord {
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, '').split('\n')
  const parts: DeepDivePart[] = []
  const introLines: string[] = []
  let part: DeepDivePart | null = null
  let section: string | null = null
  let buffer: string[] = []
  let pendingKicker: string | undefined
  const flush = () => {
    if (!part || section === null) { buffer = []; return }
    const text = buffer.join('\n').trim()
    buffer = []
    if (!text) return
    const key = known[section.toLowerCase()]
    if (key) part[key] = key === 'principle' ? inline(text) : block(text)
    else if (section.toLowerCase() === 'figure') {
      const [first, ...rest] = text.split('\n')
      part.figure = { label: first.trim(), html: block(rest.join('\n') || ' ') }
    } else if (section.toLowerCase() === 'next') part.next = text.split('\n')[0].trim()
    else part.extra.push({ title: section, html: block(text) })
  }
  for (const line of lines) {
    const kicker = line.match(/^Kicker:\s*(.+)$/)
    const headline = line.match(/^##\s+(.+)$/)
    const heading = line.match(/^###\s+(.+)$/)
    if (kicker) { flush(); section = null; pendingKicker = kicker[1].trim(); continue }
    if (headline) {
      flush(); section = null
      part = { id: `part-${parts.length + 1}`, ...(pendingKicker ? { kicker: pendingKicker } : {}), headline: inline(headline[1]), extra: [] }
      parts.push(part); pendingKicker = undefined; continue
    }
    if (heading && part) { flush(); section = heading[1].trim(); continue }
    if (part) buffer.push(line); else introLines.push(line)
  }
  flush()
  const intro = introLines.join('\n').trim()
  if (!parts.length) throw new Error('A deep dive needs at least one part: a line starting with "## ".')
  return { schema: 2, title: meta.title, ...(meta.kicker ? { kicker: meta.kicker } : {}), ...(meta.summary ? { summary: meta.summary } : {}), ...(intro ? { intro: block(intro) } : {}), parts }
}
