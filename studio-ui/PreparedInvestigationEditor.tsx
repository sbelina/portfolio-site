import { useState, type FormEvent } from 'react'
import type { Entry } from '../src/content/model'
import type { Action, Manuscript } from '../studio/model'

type PreparedAction = Extract<Action, { type: 'prepareInvestigation' }>
type PreparedFields = Omit<PreparedAction, 'type' | 'manuscriptId'>

function fields(manuscript: Manuscript, entry?: Entry): PreparedFields {
  return {
    entryId: entry?.id ?? manuscript.id,
    expectedEntryRevision: entry?.revision ?? null,
    title: entry?.title ?? manuscript.title,
    slug: entry?.slug ?? (manuscript.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100) || 'untitled'),
    summary: entry?.summary ?? '',
    contribution: entry?.contribution ?? '',
    blocks: entry?.blocks ?? [{ id: crypto.randomUUID(), type: 'prose', markdown: manuscript.original }],
    evidenceIds: entry?.evidenceIds ?? [],
    ...(entry?.investigation ? { investigation: entry.investigation } : {}),
  }
}

/** Optional bridge for a prepared structured investigation; ordinary prose uses
 * the existing individual-edit forms. Server validation remains authoritative. */
export function PreparedInvestigationEditor({ manuscript, entry, onSave }: {
  manuscript: Manuscript
  entry?: Entry
  onSave: (action: PreparedAction) => Promise<void>
}) {
  const [value, setValue] = useState(() => JSON.stringify(fields(manuscript, entry), null, 2))
  const [error, setError] = useState('')
  if (manuscript.poetry) return null
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    try {
      const parsed: unknown = JSON.parse(value)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw Error('Provide one JSON object.')
      const allowed = new Set(['entryId', 'expectedEntryRevision', 'title', 'slug', 'summary', 'contribution', 'blocks', 'evidenceIds', 'investigation'])
      if (Object.keys(parsed).some(key => !allowed.has(key))) throw Error('Only prepared content fields are allowed; status, authorship, approval and source identity are server-controlled.')
      setError('')
      await onSave({ ...parsed, type: 'prepareInvestigation', manuscriptId: manuscript.id } as PreparedAction)
      // Keep the buffer on failures; durable success is reported by the parent
      // only after the authenticated server response. Never claim a JSON save here.
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read the prepared JSON. Your input is retained.')
    }
  }
  return <details>
    <summary>Advanced: prepare an investigation draft</summary>
    <p>This optional JSON bridge is for prepared sections and structured workflow, artifact or evidence blocks. Use the ordinary text-edit forms for paragraph changes. It creates or updates one restricted investigation draft tied to the original above; it never approves review passes or publishes.</p>
    <p>Keep the entry and block IDs stable. Use <code>expectedEntryRevision: null</code> only for a new entry; updates must name the saved entry revision. Source references must already exist in this private workspace. Missing evidence can remain explicit in draft wording without inventing citations.</p>
    {manuscript.structure === 'split' ? <p>This original already has split drafts. Keep their existing workflow; this bridge only supports an intact manuscript.</p> : <form aria-label={`Prepared investigation for ${manuscript.title}`} onSubmit={submit}>
      <label>Prepared investigation JSON<textarea rows={18} spellCheck={false} value={value} onChange={event => setValue(event.target.value)} /></label>
      <p>Source digest: <code>{manuscript.digest}</code>. Saving retains the original bytes and prior frozen candidates. Changing draft content requires fresh review passes.</p>
      {error ? <p role="alert">{error}</p> : null}
      <button type="submit">Save prepared investigation privately</button>
      <button type="button" onClick={() => { setValue(JSON.stringify(fields(manuscript, entry), null, 2)); setError('') }}>Replace form text with saved draft</button>
    </form>}
  </details>
}
