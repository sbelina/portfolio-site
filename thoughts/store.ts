import { normalizeTag, typedTags, type TagOrigin, type ThoughtFilter } from './lib'

export interface Statement { bind(...values: unknown[]): Statement; first<T>(): Promise<T | null>; run(): Promise<{ meta: { changes: number } }>; all<T>(): Promise<{ results: T[] }> }
export interface Database { prepare(sql: string): Statement; batch(statements: Statement[]): Promise<unknown[]> }

export type ThoughtRow = { id: string; created_at: number; updated_at: number; source: 'text' | 'web'; raw: string; body: string; title: string; title_origin: string; archived: number; sorted: number }
export type Thought = ThoughtRow & { tags: { tag: string; origin: TagOrigin }[] }

const newId = () => crypto.randomUUID()

/** Saves a new thought with its typed #tags. Returns undefined if this message was already stored. */
export async function addThought(db: Database, input: { text: string; source: 'text' | 'web'; messageId?: string; now?: number }): Promise<string | undefined> {
  const now = input.now ?? Date.now()
  if (input.messageId && await db.prepare('SELECT id FROM thoughts WHERE message_id = ?').bind(input.messageId).first()) return undefined
  const id = newId()
  const statements = [db.prepare('INSERT INTO thoughts (id, created_at, updated_at, source, raw, body, message_id) VALUES (?, ?, ?, ?, ?, ?, ?)').bind(id, now, now, input.source, input.text, input.text, input.messageId ?? null)]
  for (const tag of typedTags(input.text)) statements.push(db.prepare('INSERT OR IGNORE INTO thought_tags (thought_id, tag, origin) VALUES (?, ?, ?)').bind(id, tag, 'typed'))
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
  if (filter.from) { where.push('t.created_at >= ?'); values.push(dayStart(filter.from)) }
  if (filter.to) { where.push('t.created_at < ?'); values.push(dayStart(filter.to) + 86_400_000) }
  const sql = `SELECT t.* FROM thoughts t${where.length ? ` WHERE ${where.join(' AND ')}` : ''} ORDER BY t.created_at DESC LIMIT ?`
  const { results } = await db.prepare(sql).bind(...values, limit).all<ThoughtRow>()
  if (!results.length) return []
  const ids = results.map(row => row.id)
  const { results: tags } = await db.prepare(`SELECT thought_id, tag, origin FROM thought_tags WHERE thought_id IN (${ids.map(() => '?').join(',')}) ORDER BY tag`).bind(...ids).all<{ thought_id: string; tag: string; origin: TagOrigin }>()
  return results.map(row => ({ ...row, tags: tags.filter(tag => tag.thought_id === row.id).map(({ tag, origin }) => ({ tag, origin })) }))
}

export async function tagCloud(db: Database, view: ThoughtFilter['view']): Promise<{ tag: string; count: number }[]> {
  const condition = view === 'active' ? 'WHERE t.archived = 0' : view === 'archived' ? 'WHERE t.archived = 1' : ''
  const { results } = await db.prepare(`SELECT g.tag AS tag, COUNT(*) AS count FROM thought_tags g JOIN thoughts t ON t.id = g.thought_id ${condition} GROUP BY g.tag ORDER BY g.tag`).all<{ tag: string; count: number }>()
  return results.map(row => ({ tag: row.tag, count: Number(row.count) }))
}

/** Saves edits. Tags typed into the edited text are added; the tag field replaces manual/AI tags. */
export async function updateThought(db: Database, id: string, input: { title: string; body: string; tags: string[] }, now = Date.now()) {
  const tags = [...new Set(input.tags.map(normalizeTag).filter(Boolean))].slice(0, 30)
  const typed = typedTags(input.body)
  const existing = await getThought(db, id)
  if (!existing) return false
  const origins = new Map(existing.tags.map(tag => [tag.tag, tag.origin]))
  const statements = [
    db.prepare("UPDATE thoughts SET title = ?, title_origin = CASE WHEN ? = title THEN title_origin ELSE 'manual' END, body = ?, updated_at = ? WHERE id = ?").bind(input.title.trim().slice(0, 200), input.title.trim().slice(0, 200), input.body.slice(0, 20_000), now, id),
    db.prepare('DELETE FROM thought_tags WHERE thought_id = ?').bind(id),
  ]
  for (const tag of new Set([...tags, ...typed])) {
    const origin: TagOrigin = typed.includes(tag) ? 'typed' : origins.get(tag) === 'ai' ? 'ai' : 'manual'
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
