import { normalizeTag, statusFromText, stripStatusTags, typedTags, type Status, type TagOrigin, type ThoughtFilter } from './lib'

export interface Statement { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null>; run(): Promise<{ meta: { changes: number } }>; all<T>(): Promise<{ results: T[] }> }
export interface Database { prepare(sql: string): Statement; batch(statements: Statement[]): Promise<unknown[]> }

export type ThoughtRow = { id: string; created_at: number; updated_at: number; source: 'text' | 'web'; raw: string; body: string; title: string; title_origin: string; archived: number; sorted: number; public: number; published_at: number | null; status: Status | null }
export type Thought = ThoughtRow & { tags: { tag: string; origin: TagOrigin }[] }

const newId = () => crypto.randomUUID()
export const PUBLIC_TAG = 'public'

/** Saves a new thought with its typed #tags. Returns undefined if this message was already stored. */
export async function addThought(db: Database, input: { text: string; source: 'text' | 'web'; messageId?: string; now?: number }): Promise<string | undefined> {
  const now = input.now ?? Date.now()
  if (input.messageId && await db.prepare('SELECT id FROM thoughts WHERE message_id = ?').bind(input.messageId).first()) return undefined
  const id = newId()
  const tags = typedTags(input.text)
  // #public is the owner's explicit opt-in at capture time.
  const isPublic = tags.includes(PUBLIC_TAG) ? 1 : 0
  // #todo, #doing or #done set a status at capture.
  const status = statusFromText(input.text) ?? null
  const statements = [db.prepare('INSERT INTO thoughts (id, created_at, updated_at, source, raw, body, message_id, public, published_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').bind(id, now, now, input.source, input.text, input.text, input.messageId ?? null, isPublic, isPublic ? now : null, status)]
  for (const tag of tags) statements.push(db.prepare('INSERT OR IGNORE INTO thought_tags (thought_id, tag, origin) VALUES (?, ?, ?)').bind(id, tag, 'typed'))
  await db.batch(statements)
  return id
}

/** Applies sorting suggestions. They are pre-approved (shown as AI) and never replace a manual title. */
export async function applySuggestion(db: Database, id: string, suggestion: { title: string; tags: string[] }, origin: 'ai' | 'fallback') {
  const statements = [db.prepare("UPDATE thoughts SET title = CASE WHEN title_origin = 'manual' THEN title ELSE ? END, title_origin = CASE WHEN title_origin = 'manual' THEN title_origin ELSE ? END, sorted = 1 WHERE id = ?").bind(suggestion.title, origin, id)]
  for (const tag of suggestion.tags) statements.push(db.prepare('INSERT OR IGNORE INTO thought_tags (thought_id, tag, origin) VALUES (?, ?, ?)').bind(id, tag, 'ai'))
  await db.batch(statements)
}

export async function getThought(db: Database, id: string): Promise<Thought | undefined> {
  const row = await db.prepare('SELECT * FROM thoughts WHERE id = ?').bind(id).first<ThoughtRow>()
  if (!row) return undefined
  const { results } = await db.prepare('SELECT tag, origin FROM thought_tags WHERE thought_id = ? ORDER BY tag').bind(id).all<{ tag: string; origin: TagOrigin }>()
  return { ...row, tags: results }
}

const dayStart = (date: string) => Date.parse(`${date}T00:00:00Z`)

export async function listThoughts(db: Database, filter: ThoughtFilter, limit = 200): Promise<Thought[]> {
  const where: string[] = []
  const values: unknown[] = []
  if (filter.view === 'active') where.push('t.archived = 0')
  if (filter.view === 'archived') where.push('t.archived = 1')
  if (filter.q) { where.push("(t.body LIKE ? ESCAPE '\\' OR t.title LIKE ? ESCAPE '\\')"); const like = `%${filter.q.replace(/[\\%_]/g, c => `\\${c}`)}%`; values.push(like, like) }
  if (filter.tag) { where.push('EXISTS (SELECT 1 FROM thought_tags x WHERE x.thought_id = t.id AND x.tag = ?)'); values.push(filter.tag) }
  if (filter.status === 'none') where.push('t.status IS NULL')
  else if (filter.status) { where.push('t.status = ?'); values.push(filter.status) }
  if (filter.from) { where.push('t.created_at >= ?'); values.push(dayStart(filter.from)) }
  if (filter.to) { where.push('t.created_at < ?'); values.push(dayStart(filter.to) + 86_400_000) }
  const sql = `SELECT t.* FROM thoughts t${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY t.created_at DESC LIMIT ?`
  const { results } = await db.prepare(sql).bind(...values, limit).all<ThoughtRow>()
  if (!results.length) return []
  const ids = results.map(row => row.id)
  const { results: tags } = await db.prepare(`SELECT thought_id, tag, origin FROM thought_tags WHERE thought_id IN (${ids.map(() => '?').join(',')}) ORDER BY tag`).bind(...ids).all<{ thought_id: string; tag: string; origin: TagOrigin }>()
  return results.map(row => ({ ...row, tags: tags.filter(tag => tag.thought_id === row.id).map(({ tag, origin }) => ({ tag, origin })) }))
}

/** Every tag with its count; `own` counts only the tags you typed or added (not AI suggestions). */
export async function tagCloud(db: Database, view: ThoughtFilter['view']): Promise<{ tag: string; count: number; own: number }[]> {
  const condition = view === 'active' ? 'WHERE t.archived = 0' : view === 'archived' ? 'WHERE t.archived = 1' : ''
  const { results } = await db.prepare(`SELECT g.tag AS tag, COUNT(*) AS count, SUM(CASE WHEN g.origin != 'ai' THEN 1 ELSE 0 END) AS own FROM thought_tags g JOIN thoughts t ON t.id = g.thought_id ${condition} GROUP BY g.tag ORDER BY g.tag`).all<{ tag: string; count: number; own: number }>()
  return results.map(row => ({ tag: row.tag, count: Number(row.count), own: Number(row.own) }))
}

/** Counts per status for the status chips, within the current view. */
export async function statusCounts(db: Database, view: ThoughtFilter['view']): Promise<Record<Status, number>> {
  const condition = view === 'active' ? 'WHERE archived = 0 AND status IS NOT NULL' : view === 'archived' ? 'WHERE archived = 1 AND status IS NOT NULL' : 'WHERE status IS NOT NULL'
  const { results } = await db.prepare(`SELECT status, COUNT(*) AS count FROM thoughts ${condition} GROUP BY status`).all<{ status: Status; count: number }>()
  const counts: Record<Status, number> = { todo: 0, doing: 0, done: 0 }
  for (const row of results) counts[row.status] = Number(row.count)
  return counts
}

export async function setStatus(db: Database, id: string, status: Status | null, now = Date.now()) {
  const { meta } = await db.prepare('UPDATE thoughts SET status = ?, updated_at = ? WHERE id = ?').bind(status, now, id).run()
  return meta.changes > 0
}

/** Saves edits. Tags typed into the edited text are added; the tag field replaces manual/AI tags. */
export async function updateThought(db: Database, id: string, input: { title: string; body: string; tags: string[]; public?: boolean; status?: Status | null }, now = Date.now()) {
  const tags = [...new Set(input.tags.map(normalizeTag).filter(Boolean))].slice(0, 30)
  const typed = typedTags(input.body)
  const existing = await getThought(db, id)
  if (!existing) return false
  const origins = new Map(existing.tags.map(tag => [tag.tag, tag.origin]))
  // Publishing: the edit-page switch decides. Newly adding #public (typed or in the tag field) also publishes,
  // so the hashtag works the same after capture. The 'public' tag is kept in step with the switch.
  let isPublic: boolean | undefined
  if (input.public !== undefined) {
    const addedPublicTag = !existing.public && (tags.includes(PUBLIC_TAG) || typed.includes(PUBLIC_TAG))
    isPublic = input.public || addedPublicTag
  }
  // Status: the edit-page control decides; a status hashtag newly typed into the text also counts,
  // unless the control was changed in the same save.
  let status = input.status
  const typedStatus = statusFromText(input.body)
  if (typedStatus && typedStatus !== statusFromText(existing.body) && (input.status === undefined || input.status === existing.status)) status = typedStatus
  const finalTags = new Set([...tags.filter(tag => !['todo', 'to-do', 'doing', 'in-progress', 'wip', 'done'].includes(tag)), ...typed])
  if (isPublic === true) finalTags.add(PUBLIC_TAG)
  if (isPublic === false) finalTags.delete(PUBLIC_TAG)
  const statements = [
    db.prepare("UPDATE thoughts SET title = ?, title_origin = CASE WHEN ? = title THEN title_origin ELSE 'manual' END, body = ?, updated_at = ? WHERE id = ?").bind(input.title.trim().slice(0, 200), input.title.trim().slice(0, 200), input.body.slice(0, 20_000), now, id),
    db.prepare('DELETE FROM thought_tags WHERE thought_id = ?').bind(id),
  ]
  if (status !== undefined) statements.push(db.prepare('UPDATE thoughts SET status = ? WHERE id = ?').bind(status, id))
  // After capture, the edit-page switch decides; publishing again keeps the first publication date.
  if (isPublic !== undefined) statements.push(isPublic
    ? db.prepare('UPDATE thoughts SET public = 1, published_at = COALESCE(published_at, ?) WHERE id = ?').bind(now, id)
    : db.prepare('UPDATE thoughts SET public = 0, published_at = NULL WHERE id = ?').bind(id))
  for (const tag of finalTags) {
    const origin: TagOrigin = typed.includes(tag) ? 'typed' : origins.get(tag) === 'ai' && tag !== PUBLIC_TAG ? 'ai' : 'manual'
    statements.push(db.prepare('INSERT OR IGNORE INTO thought_tags (thought_id, tag, origin) VALUES (?, ?, ?)').bind(id, tag, origin))
  }
  await db.batch(statements)
  return true
}

export async function setArchived(db: Database, id: string, archived: boolean, now = Date.now()) {
  await db.prepare('UPDATE thoughts SET archived = ?, updated_at = ? WHERE id = ?').bind(archived ? 1 : 0, now, id).run()
}

export async function deleteThought(db: Database, id: string) {
  await db.batch([db.prepare('DELETE FROM thought_tags WHERE thought_id = ?').bind(id), db.prepare('DELETE FROM thoughts WHERE id = ?').bind(id)])
}

export async function unsorted(db: Database, limit = 20) {
  const { results } = await db.prepare('SELECT id, body FROM thoughts WHERE sorted = 0 ORDER BY created_at LIMIT ?').bind(limit).all<{ id: string; body: string }>()
  return results
}

export async function addSystemNote(db: Database, subject: string, body: string, now = Date.now()) {
  await db.prepare('INSERT INTO system_notes (created_at, subject, body) VALUES (?, ?, ?)').bind(now, subject.slice(0, 300), body.slice(0, 5000)).run()
}

export async function systemNotes(db: Database) {
  const { results } = await db.prepare('SELECT id, created_at, subject, body FROM system_notes ORDER BY created_at DESC LIMIT 5').all<{ id: number; created_at: number; subject: string; body: string }>()
  return results
}

export async function dismissSystemNote(db: Database, id: number) {
  await db.prepare('DELETE FROM system_notes WHERE id = ?').bind(id).run()
}

/* ---------- Public field notes (read-only, opt-in) ---------- */

export type PublicNote = { id: string; slug: string; body: string; published_at: number; tags: string[] }
/** Only what a reader may see: edited text, owner tags (typed or manual), publication date. Never raw text, sources or AI tags. */
const toPublic = (row: { id: string; body: string; published_at: number }, tags: { tag: string; origin: TagOrigin }[]): PublicNote => ({
  id: row.id, slug: row.id.slice(0, 8), published_at: row.published_at,
  body: stripStatusTags(row.body.replace(/(^|[\s(])#public\b/gi, '$1')).replace(/[ \t]{2,}/g, ' ').trim(),
  tags: tags.filter(tag => tag.origin !== 'ai' && tag.tag !== PUBLIC_TAG).map(tag => tag.tag),
})

export async function listPublicNotes(db: Database, tag?: string, limit = 200): Promise<PublicNote[]> {
  const where = ['t.public = 1', 't.archived = 0']
  const values: unknown[] = []
  if (tag) { where.push("EXISTS (SELECT 1 FROM thought_tags x WHERE x.thought_id = t.id AND x.tag = ? AND x.origin != 'ai')"); values.push(tag) }
  const { results } = await db.prepare(`SELECT t.id, t.body, t.published_at FROM thoughts t WHERE ${where.join(' AND ')} ORDER BY t.published_at DESC LIMIT ?`).bind(...values, limit).all<{ id: string; body: string; published_at: number }>()
  if (!results.length) return []
  const ids = results.map(row => row.id)
  const { results: tags } = await db.prepare(`SELECT thought_id, tag, origin FROM thought_tags WHERE thought_id IN (${ids.map(() => '?').join(',')}) ORDER BY tag`).bind(...ids).all<{ thought_id: string; tag: string; origin: TagOrigin }>()
  return results.map(row => toPublic(row, tags.filter(tag => tag.thought_id === row.id)))
}

export async function getPublicNote(db: Database, slug: string): Promise<PublicNote | undefined> {
  if (!/^[0-9a-f]{8}$/.test(slug)) return undefined
  const row = await db.prepare("SELECT id, body, published_at FROM thoughts WHERE public = 1 AND archived = 0 AND substr(id, 1, 8) = ?").bind(slug).first<{ id: string; body: string; published_at: number }>()
  if (!row) return undefined
  const { results } = await db.prepare('SELECT tag, origin FROM thought_tags WHERE thought_id = ? ORDER BY tag').bind(row.id).all<{ tag: string; origin: TagOrigin }>()
  return toPublic(row, results)
}

export async function publicTags(db: Database): Promise<{ tag: string; count: number }[]> {
  const { results } = await db.prepare("SELECT g.tag AS tag, COUNT(*) AS count FROM thought_tags g JOIN thoughts t ON t.id = g.thought_id WHERE t.public = 1 AND t.archived = 0 AND g.origin != 'ai' AND g.tag != 'public' GROUP BY g.tag ORDER BY count DESC, g.tag").all<{ tag: string; count: number }>()
  return results.map(row => ({ tag: row.tag, count: Number(row.count) }))
}
