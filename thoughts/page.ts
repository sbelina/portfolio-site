import { cloudStep, escapeHtml as e, STATUSES, statusLabel, type Status, type ThoughtFilter } from './lib'
import type { Thought } from './store'

/*
 * Thoughts UI — design system (owner-requested, inspired by MindChuk, adapted to Producing Curiosity)
 * Surface: the existing "observatory" dark surface (paper/ink inverted). Ink #f1eee5 on #151614.
 * Type: thoughts are set in monospace, as typed; the wordmark is serif with the placeholder asterisk.
 * Color: orange is reserved for focus and the one primary action (+). Tags get a stable categorical
 *   hue (hash of the tag name) used for the card outline and tag chip; color never carries meaning
 *   alone — the #tag text is always present. AI-applied tags are marked with ✦ and a text label.
 * Layout: header · search + add · tag chips (top tags; full cloud on demand) · masonry cards.
 * Everything works without JavaScript; forms post back to the Worker.
 */

const hues = ['#f39185', '#56c7ce', '#b9a3ed', '#ffab7d', '#8fd18a', '#7fb4f0', '#e8c66a', '#f29bc7'] as const
export function tagHue(tag: string): string {
  let hash = 0
  for (const char of tag) hash = (hash * 31 + char.codePointAt(0)!) >>> 0
  return hues[hash % hues.length]
}

const css = `
:root{--paper:#151614;--panel:#1c1d1b;--raised:#232421;--ink:#f1eee5;--muted:#aaa89f;--line:rgba(241,238,229,.18);--line-strong:rgba(241,238,229,.34);--signal:#ffab7d;--focus:#f2c84b;--mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;--serif:"Century Schoolbook","Century Schoolbook L",Georgia,serif;color-scheme:dark}
*{box-sizing:border-box}html{background:var(--paper);color:var(--ink);font:400 16px/1.55 var(--mono)}body{margin:0}
a{color:inherit}:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.skip{position:absolute;left:-999px}.skip:focus{left:1rem;top:1rem;background:var(--panel);padding:.5rem 1rem;z-index:5}
.shell{max-width:68rem;margin:0 auto;padding:1rem}
.top{display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:.5rem 0 1rem;border-bottom:1px solid var(--line)}
.mark{font:400 clamp(1.8rem,5vw,2.4rem)/1 var(--serif);letter-spacing:-.02em;text-decoration:none;color:var(--muted)}.mark span{color:var(--signal)}
.bar{display:flex;gap:.75rem;margin:1.25rem 0 .75rem}
.search{flex:1;display:flex;align-items:center;gap:.6rem;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:0 1rem;min-height:52px}
.search input{flex:1;background:none;border:0;color:var(--ink);font:inherit;min-width:0}.search input:focus{outline:none}.search:focus-within{outline:3px solid var(--focus);outline-offset:2px}
.add{display:grid;place-items:center;width:52px;min-height:52px;border-radius:12px;background:var(--signal);color:#151614;font:500 1.6rem/1 var(--mono);text-decoration:none;border:0}
.chips{display:flex;flex-wrap:wrap;gap:.5rem;margin:0 0 1.25rem;padding:0;list-style:none}
.chip{display:inline-flex;align-items:center;gap:.35rem;min-height:40px;padding:0 .95rem;border:1px solid var(--line-strong);border-radius:999px;text-decoration:none;font-size:.85rem;text-transform:uppercase;letter-spacing:.02em}
.chip[aria-current="true"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.chip small{color:var(--muted);text-transform:none}.chip[aria-current="true"] small{color:var(--paper)}
details.cloud{margin:-.5rem 0 1.25rem}details.cloud summary{cursor:pointer;color:var(--muted);font-size:.85rem;min-height:40px;display:flex;align-items:center;gap:.5rem;list-style:none}details.cloud summary::-webkit-details-marker{display:none}details.cloud summary::before{content:'▸'}details.cloud[open] summary::before{content:'▾'}
.cloud-list{display:flex;flex-wrap:wrap;gap:.35rem 1rem;padding:.75rem 0;list-style:none;margin:0}
.cloud-list a{text-decoration:none}.s1{font-size:.8rem}.s2{font-size:.9rem}.s3{font-size:1.05rem}.s4{font-size:1.25rem}.s5{font-size:1.5rem}
.filters{display:flex;flex-wrap:wrap;gap:.5rem 1rem;align-items:end;font-size:.85rem;color:var(--muted);margin:0 0 1rem}
.filters label{display:grid;gap:.25rem}.filters input,.filters select{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:8px;min-height:40px;padding:0 .6rem;font:inherit}
.filters button,.btn{min-height:44px;padding:0 1rem;border-radius:10px;border:1px solid var(--line-strong);background:var(--raised);color:var(--ink);font:inherit;cursor:pointer}
.btn-primary{background:var(--signal);color:#151614;border-color:var(--signal)}.btn-danger{border-color:#f39185;color:#f39185;background:none}
.grid{columns:2 22rem;column-gap:1rem}
.card{break-inside:avoid;display:block;margin:0 0 1rem;padding:1rem 1.15rem 1.15rem;background:var(--panel);border:1.5px solid var(--hue,var(--line-strong));border-radius:14px;text-decoration:none}
.card:hover,.card:focus-within{background:var(--raised)}
.card-link{display:block;text-decoration:none}.card[data-status="done"] .body{opacity:.62}
.status-badge{color:var(--ink)}.card-actions{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem;margin-top:.9rem;padding-top:.75rem;border-top:1px solid var(--line)}
.seg{display:inline-flex;border:1px solid var(--line-strong);border-radius:10px;overflow:hidden}.seg button{min-height:40px;padding:0 .7rem;border:0;border-right:1px solid var(--line);background:none;color:var(--muted);font:inherit;font-size:.8rem;cursor:pointer}.seg button:last-child{border-right:0}
.seg button[aria-pressed="true"]{background:var(--ink);color:var(--paper)}.seg button:hover{color:var(--ink)}.seg button[aria-pressed="true"]:hover{color:var(--paper)}
details.del summary{cursor:pointer;list-style:none;min-height:40px;display:flex;align-items:center;color:var(--muted);font-size:.8rem;padding:0 .4rem}details.del summary::-webkit-details-marker{display:none}details.del[open] summary{color:#f39185}
details.del form{display:flex;flex-wrap:wrap;gap:.5rem;align-items:center;margin-top:.4rem;font-size:.8rem}
.status-row{display:flex;flex-wrap:wrap;gap:.5rem;margin:-.5rem 0 1.25rem;padding:0;list-style:none}
fieldset.status{border:1px solid var(--line);border-radius:10px;padding:.5rem .9rem .8rem;display:flex;flex-wrap:wrap;gap:.25rem 1.25rem}fieldset.status legend{font-size:.85rem;color:var(--muted);padding:0 .3rem}fieldset.status label{display:flex!important;align-items:center;gap:.4rem;min-height:40px;color:var(--ink)!important;font-size:.95rem!important}
.meta{color:var(--muted);font-size:.8rem;margin:0 0 .6rem}
.tags{display:flex;flex-wrap:wrap;gap:.35rem;margin:0 0 .7rem;padding:0;list-style:none}
.tag{display:inline-block;padding:.15rem .5rem;border-radius:6px;font-size:.8rem;text-transform:uppercase;color:var(--hue);background:color-mix(in srgb,var(--hue) 14%,transparent)}
.body{margin:0;font-weight:600;font-size:1.05rem;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:8;-webkit-box-orient:vertical;overflow:hidden}
.empty{color:var(--muted);padding:2rem 0}
.note{border:1px solid var(--signal);border-radius:12px;padding:1rem;margin:0 0 1rem}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
.form{display:grid;gap:1rem;max-width:44rem}.form label{display:grid;gap:.35rem;font-size:.85rem;color:var(--muted)}
.form input,.form textarea{background:var(--panel);color:var(--ink);border:1px solid var(--line);border-radius:10px;padding:.75rem;font:inherit;font-size:1rem}
.form textarea{min-height:12rem;resize:vertical}.publish{display:flex!important;grid-template-columns:none;gap:.75rem!important;align-items:flex-start;color:var(--ink)!important;font-size:1rem!important;min-height:44px}.publish input{width:22px;height:22px;margin:.15rem 0 0;accent-color:var(--signal)}.publish small{display:block;color:var(--muted);font-size:.8rem;margin-top:.2rem}.pub{color:var(--signal)}.actions{display:flex;flex-wrap:wrap;gap:.75rem}
.raw{background:var(--panel);border:1px dashed var(--line-strong);border-radius:10px;padding:1rem;white-space:pre-wrap;color:var(--muted)}
.legend{color:var(--muted);font-size:.8rem}
@media (max-width:40rem){.grid{columns:1}.shell{padding:.75rem}}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`

export function relativeTime(at: number, now = Date.now()): string {
  const minutes = Math.round((now - at) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  const date = new Date(at)
  const sameDay = new Date(now).toDateString() === date.toDateString()
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Chicago' })
  if (sameDay) return `Today · ${time}`
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/Chicago' })} · ${time}`
}

const tagChip = (tag: string, origin: string) => `<li class="tag" style="--hue:${tagHue(tag)}">#${e(tag)}${origin === 'ai' ? ' <span aria-hidden="true">✦</span><span class="sr">(suggested by AI)</span>' : ''}</li>`

const statusIcon: Record<Status, string> = { todo: '○', doing: '◐', done: '●' }

/** To do · Doing · Done buttons; pressing the current status clears it. Works without JavaScript. */
function statusControl(thought: Thought, csrf: string, returnTo: string) {
  return `<form method="post" action="/t/${thought.id}/status" class="seg" aria-label="Status"><input type="hidden" name="csrf" value="${e(csrf)}"><input type="hidden" name="return" value="${e(returnTo)}">${STATUSES.map(status => {
    const current = thought.status === status
    return `<button name="status" value="${current ? 'none' : status}" aria-pressed="${current}"${current ? ` title="Clear status"` : ''}><span aria-hidden="true">${statusIcon[status]}</span> ${statusLabel[status]}</button>`
  }).join('')}</form>`
}

function shell(title: string, content: string, _origin = '') {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${e(title)} · Thoughts</title><style>${css}</style></head><body>
<a class="skip" href="#main">Skip to thoughts</a><div class="shell"><header class="top"><a class="mark" href="/">Thoughts<span aria-hidden="true">*</span></a></header>
<main id="main">${content}</main></div></body></html>`
}

export function listPage(input: { thoughts: Thought[]; cloud: { tag: string; count: number; own?: number }[]; filter: ThoughtFilter; notes: { id: number; subject: string; body: string }[]; counts?: Record<Status, number>; csrf: string; returnTo?: string; now?: number }): string {
  const { thoughts, cloud, filter, notes, csrf } = input
  const returnTo = input.returnTo ?? '/'
  const counts = input.counts ?? { todo: 0, doing: 0, done: 0 }
  const query = (changes: Partial<Record<keyof ThoughtFilter, string | undefined>>) => {
    const params = new URLSearchParams()
    const merged = { ...filter, ...changes }
    for (const [key, value] of Object.entries(merged)) if (value && !(key === 'view' && value === 'active')) params.set(key, String(value))
    const text = params.toString()
    return text ? `/?${text}` : '/'
  }
  // The filter chips are your own hashtags (typed or added), most used first. AI suggestions stay on the
  // cards and in the full tag list, but never take a place in the filter row.
  const own = cloud.filter(item => (item.own ?? item.count) > 0)
  const top = [...own].sort((a, b) => (b.own ?? b.count) - (a.own ?? a.count) || a.tag.localeCompare(b.tag)).slice(0, 10)
  if (filter.tag && !top.some(item => item.tag === filter.tag)) { const current = cloud.find(item => item.tag === filter.tag); if (current) top.push(current) }
  const max = Math.max(1, ...cloud.map(item => item.count))
  const noteHtml = notes.map(note => `<section class="note" aria-label="Setup message"><p><strong>${e(note.subject)}</strong></p><p class="raw">${e(note.body)}</p><form method="post" action="/notes/${note.id}/dismiss"><input type="hidden" name="csrf" value="${e(csrf)}"><button class="btn">Dismiss</button></form></section>`).join('')
  const cards = thoughts.map(thought => {
    const lead = thought.tags.find(tag => tag.origin === 'typed') ?? thought.tags.find(tag => tag.origin === 'manual') ?? thought.tags[0]
    const hue = lead ? tagHue(lead.tag) : 'var(--line-strong)'
    const badge = thought.status ? ` · <span class="status-badge">${statusIcon[thought.status]} ${statusLabel[thought.status]}</span>` : ''
    return `<article class="card" style="--hue:${hue}"${thought.status ? ` data-status="${thought.status}"` : ''}><a class="card-link" href="/t/${thought.id}"><p class="meta">${relativeTime(thought.created_at, input.now)}${thought.source === 'text' ? ' · text' : ''}${badge}${thought.archived ? ' · archived' : ''}${thought.public ? ' · <span class="pub">public</span>' : ''}</p>${thought.tags.length ? `<ul class="tags">${thought.tags.map(tag => tagChip(tag.tag, tag.origin)).join('')}</ul>` : ''}<p class="body">${e(thought.body)}</p><span class="sr">Edit: ${e(thought.title || 'untitled thought')}</span></a>
<div class="card-actions">${statusControl(thought, csrf, returnTo)}<details class="del"><summary>Delete</summary><form method="post" action="/t/${thought.id}/delete"><input type="hidden" name="csrf" value="${e(csrf)}"><input type="hidden" name="return" value="${e(returnTo)}"><label><input type="checkbox" name="confirm" value="yes" required> Yes, delete permanently</label><button class="btn btn-danger">Delete</button></form></details></div></article>`
  }).join('')
  const filtered = Boolean(filter.q || filter.tag || filter.status || filter.from || filter.to || filter.view !== 'active')
  return shell(filter.tag ? `#${filter.tag}` : 'All thoughts', `
${noteHtml}
<form class="bar" method="get" action="/" role="search"><label class="search"><span aria-hidden="true">⌕</span><span class="sr">Search your thoughts</span><input type="search" name="q" value="${e(filter.q ?? '')}" placeholder="Search your thoughts">${filter.tag ? `<input type="hidden" name="tag" value="${e(filter.tag)}">` : ''}${filter.status ? `<input type="hidden" name="status" value="${e(filter.status)}">` : ''}</label><a class="add" href="/new" aria-label="Add a thought">+</a></form>
<ul class="chips" aria-label="Filter by your hashtags"><li><a class="chip" href="${query({ tag: undefined })}" aria-current="${!filter.tag}">All</a></li>${top.map(item => `<li><a class="chip" style="border-color:${tagHue(item.tag)}" href="${query({ tag: item.tag })}" aria-current="${filter.tag === item.tag}">#${e(item.tag)} <small>${item.own ?? item.count}</small></a></li>`).join('')}</ul>
<ul class="status-row" aria-label="Filter by status"><li><a class="chip" href="${query({ status: undefined })}" aria-current="${!filter.status}">Any status</a></li>${STATUSES.map(status => `<li><a class="chip" href="${query({ status })}" aria-current="${filter.status === status}"><span aria-hidden="true">${statusIcon[status]}</span> ${statusLabel[status]} <small>${counts[status]}</small></a></li>`).join('')}</ul>
${cloud.length > top.length ? `<details class="cloud"><summary>All ${cloud.length} tags, including AI suggestions ✦</summary><ul class="cloud-list">${cloud.map(item => `<li><a class="s${cloudStep(item.count, max)}" style="color:${tagHue(item.tag)}" href="${query({ tag: item.tag })}">#${e(item.tag)}<span class="sr"> (${item.count})</span></a></li>`).join('')}</ul></details>` : ''}
<details class="cloud" ${filter.from || filter.to || filter.view !== 'active' ? 'open' : ''}><summary>Dates and archive</summary>
<form class="filters" method="get" action="/">${filter.q ? `<input type="hidden" name="q" value="${e(filter.q)}">` : ''}${filter.status ? `<input type="hidden" name="status" value="${e(filter.status)}">` : ''}${filter.tag ? `<input type="hidden" name="tag" value="${e(filter.tag)}">` : ''}
<label>From<input type="date" name="from" value="${filter.from ?? ''}"></label><label>To<input type="date" name="to" value="${filter.to ?? ''}"></label>
<label>Show<select name="view"><option value="active"${filter.view === 'active' ? ' selected' : ''}>Active</option><option value="archived"${filter.view === 'archived' ? ' selected' : ''}>Archived</option><option value="all"${filter.view === 'all' ? ' selected' : ''}>Everything</option></select></label><button>Apply</button></form></details>
<h1 class="sr">${filter.tag ? `Thoughts tagged ${e(filter.tag)}` : 'Your thoughts'}</h1>
<p class="legend" aria-live="polite">${thoughts.length} ${thoughts.length === 1 ? 'thought' : 'thoughts'}${filtered ? ` · <a href="/">Clear filters</a>` : ''} · ✦ = tag added by AI, editable</p>
${thoughts.length ? `<div class="grid">${cards}</div>` : `<p class="empty">${filtered ? 'Nothing matches these filters.' : 'Text your Voice number, or add a thought with +.'}</p>`}`, '')
}

export function editPage(thought: Thought, csrf: string, publicOrigin = ''): string {
  const editable = thought.tags.filter(tag => tag.origin !== 'typed').map(tag => tag.tag).join(', ')
  const typed = thought.tags.filter(tag => tag.origin === 'typed').map(tag => `#${tag.tag}`).join(' ')
  return shell(thought.title || 'Thought', `
<p class="meta"><a href="/">← All thoughts</a></p>
<h1 style="font:400 1.6rem/1.3 var(--serif)">${e(thought.title || 'Untitled thought')}</h1>
<p class="meta">${new Date(thought.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago' })} · ${thought.source === 'text' ? 'from a text' : 'added here'}${thought.title_origin === 'ai' ? ' · title by AI ✦' : ''}</p>
${thought.tags.length ? `<ul class="tags">${thought.tags.map(tag => tagChip(tag.tag, tag.origin)).join('')}</ul>` : ''}
<form class="form" method="post" action="/t/${thought.id}"><input type="hidden" name="csrf" value="${e(csrf)}">
<label>Title<input name="title" value="${e(thought.title)}" maxlength="200"></label>
<label>Thought<textarea name="body" required maxlength="20000">${e(thought.body)}</textarea></label>
<label>Tags (comma separated)${typed ? ` — plus ${e(typed)} from the text` : ''}<input name="tags" value="${e(editable)}"></label>
<input type="hidden" name="status_field" value="1">
<fieldset class="status"><legend>Status (or type #todo, #doing, #done)</legend><label><input type="radio" name="status" value="none"${thought.status ? '' : ' checked'}> None</label>${STATUSES.map(status => `<label><input type="radio" name="status" value="${status}"${thought.status === status ? ' checked' : ''}> ${statusIcon[status]} ${statusLabel[status]}</label>`).join('')}</fieldset>
<input type="hidden" name="public_field" value="1">
<label class="publish"><input type="checkbox" name="public"${thought.public ? ' checked' : ''}> <span>Public field note<small>Shows the edited text and your own tags at producingcuriosity.com/field-notes/. Never the original text or AI tags. Typing #public does the same.</small></span></label>
${thought.public ? `<p class="meta">Published ${thought.published_at ? new Date(thought.published_at).toLocaleDateString('en-US', { dateStyle: 'medium', timeZone: 'America/Chicago' }) : ''}${publicOrigin ? ` · <a href="${e(publicOrigin)}/field-notes/${thought.id.slice(0, 8)}/">View public note ↗</a>` : ''}</p>` : ''}
<div class="actions"><button class="btn btn-primary">Save</button></div></form>
<div class="actions" style="margin-top:1rem"><form method="post" action="/t/${thought.id}/${thought.archived ? 'restore' : 'archive'}"><input type="hidden" name="csrf" value="${e(csrf)}"><button class="btn">${thought.archived ? 'Restore' : 'Archive'}</button></form>
<form method="post" action="/t/${thought.id}/delete"><input type="hidden" name="csrf" value="${e(csrf)}"><label class="legend" style="display:flex;gap:.5rem;align-items:center"><input type="checkbox" name="confirm" value="yes" required> Delete permanently</label><button class="btn btn-danger">Delete</button></form></div>
<details class="cloud" style="margin-top:2rem"><summary>Original, exactly as received</summary><p class="raw">${e(thought.raw)}</p></details>`, '')
}

export function newPage(csrf: string): string {
  return shell('Add a thought', `<p class="meta"><a href="/">← All thoughts</a></p><h1 style="font:400 1.6rem/1.3 var(--serif)">Add a thought</h1>
<form class="form" method="post" action="/new"><input type="hidden" name="csrf" value="${e(csrf)}"><label>Thought (#hashtags become tags)<textarea name="body" required maxlength="20000" autofocus></textarea></label><div class="actions"><button class="btn btn-primary">Save</button></div></form>`, '')
}

export const messagePage = (title: string, text: string, status = 200) => new Response(shell(title, `<h1 style="font:400 1.6rem/1.3 var(--serif)">${e(title)}</h1><p>${e(text)}</p>`, ''), { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'private, no-store' } })
