import { escapeHtml as e } from './lib'
import type { PublicNote } from './store'

/*
 * Public field notes, served at producingcuriosity.com/field-notes/ (a more specific route than the
 * public site's /*). They borrow the current edition's paper/ink/orange presentation and primary
 * navigation so they sit inside the site's IA, while the label keeps them distinct from evidence-
 * reviewed investigations: unedited thinking in progress, not portfolio claims.
 */
const css = `
:root{--paper:#f3efe7;--panel:#e9e4da;--ink:#111716;--muted:#555d58;--line:#8b918a;--soft-line:#d2d1c8;--signal:#a33a0c;--focus:#734295;--serif:Georgia,'Times New Roman',serif;--mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;--sans:system-ui,-apple-system,"Segoe UI",sans-serif;color-scheme:light}
*{box-sizing:border-box}html{background:var(--paper);color:var(--ink);font:400 17px/1.6 var(--sans)}body{margin:0}
a{color:inherit;text-underline-offset:.2em}:focus-visible{outline:3px solid var(--focus);outline-offset:3px}
.skip{position:absolute;left:-999px}.skip:focus{left:1rem;top:1rem;background:var(--paper);padding:.5rem 1rem}
.wrap{max-width:76rem;margin:0 auto;padding:0 1.25rem}
header{border-bottom:1px solid var(--line)}.head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.5rem 2rem;padding:1.25rem 0}
.mark{font-weight:650;text-decoration:none;display:inline-flex;gap:.45rem;align-items:center;min-height:44px}.mark span{color:var(--signal);font-size:1.4rem}
nav ul{display:flex;flex-wrap:wrap;gap:0 1.25rem;list-style:none;margin:0;padding:0}nav a{display:inline-flex;align-items:center;min-height:44px;font-size:.95rem}
nav a[aria-current="page"]{color:var(--signal);font-weight:650}
main{padding:3rem 0 4rem}.kicker{font:600 .75rem/1.4 var(--mono);letter-spacing:.08em;text-transform:uppercase;color:var(--signal);margin:0 0 .75rem}
h1{font:400 clamp(2.2rem,5vw,3.4rem)/1.1 var(--serif);margin:0 0 1rem;letter-spacing:-.01em}
.lead{max-width:44rem;font-size:1.1rem;color:var(--muted);margin:0 0 .5rem}
.boundary{max-width:44rem;border-left:3px solid var(--focus);padding:.25rem 0 .25rem 1rem;margin:1.25rem 0 2rem;color:var(--ink)}
.tags{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;margin:0 0 2rem;padding:0}
.tag{display:inline-flex;align-items:center;min-height:40px;padding:0 .9rem;border:1px solid var(--line);border-radius:999px;text-decoration:none;font:500 .8rem/1 var(--mono);text-transform:uppercase}
.tag[aria-current="true"]{background:var(--ink);color:var(--paper);border-color:var(--ink)}
.notes{list-style:none;margin:0;padding:0;border-top:1px solid var(--line)}
.notes li{border-bottom:1px solid var(--soft-line)}
.note{display:block;padding:1.5rem 0;text-decoration:none}.note:hover .body{text-decoration:underline;text-decoration-thickness:1px}
.meta{font:500 .8rem/1.4 var(--mono);color:var(--muted);margin:0 0 .5rem}
.body{font:500 1.05rem/1.7 var(--mono);white-space:pre-wrap;overflow-wrap:anywhere;margin:0;max-width:46rem}
.single .body{font-size:1.2rem}
.inline-tags{display:flex;flex-wrap:wrap;gap:.4rem;list-style:none;margin:.75rem 0 0;padding:0}.inline-tags li{font:500 .75rem/1 var(--mono);text-transform:uppercase;color:var(--muted)}
.empty{color:var(--muted)}
footer{border-top:1px solid var(--line);padding:1.5rem 0 2.5rem;color:var(--muted);font-size:.85rem}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`

const nav = [['/investigations/', 'Investigations'], ['/patterns/', 'Connections'], ['/practice/', 'Practice'], ['/lab/atlas/', 'Atlas of Inquiry*'], ['/field-notes/', 'Field notes'], ['/#contact', 'Contact']] as const
const date = (at: number) => new Date(at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Chicago' })

function page(title: string, description: string, content: string, indexable: boolean, canonical: string) {
  return `<!doctype html><html lang="en" data-edition="current"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(description)}"><meta name="robots" content="${indexable ? 'index, follow' : 'noindex, follow'}"><link rel="canonical" href="${e(canonical)}">
<style>${css}</style></head><body><a class="skip" href="#main">Skip to main content</a>
<header><div class="wrap head"><a class="mark" href="/"><span aria-hidden="true">*</span> Producing Curiosity</a>
<nav aria-label="Primary navigation"><ul>${nav.map(([href, label]) => `<li><a href="${href}"${href === '/field-notes/' ? ' aria-current="page"' : ''}>${e(label)}</a></li>`).join('')}</ul></nav></div></header>
<main id="main" class="wrap">${content}</main>
<footer><div class="wrap">© ${new Date().getFullYear()} Sami Belina · Field notes are unedited thinking in progress. They are not reviewed portfolio evidence; investigations carry their own sources and limits.</div></footer></body></html>`
}

const notesHeader = `<p class="kicker">Field notes</p><h1>Thinking in progress.</h1>
<p class="lead">Short notes, questions and half-formed connections, published as they occur.</p>
<p class="boundary">These notes are unedited and unreviewed. A note is not a finding: for evidence, contribution and limits, read the <a href="/investigations/">investigations</a>.</p>`

export function publicListPage(input: { notes: PublicNote[]; tags: { tag: string; count: number }[]; tag?: string; origin: string; indexable: boolean }) {
  const { notes, tags, tag } = input
  const tagList = tags.length ? `<ul class="tags" aria-label="Filter notes by tag"><li><a class="tag" href="/field-notes/" aria-current="${!tag}">All</a></li>${tags.slice(0, 12).map(item => `<li><a class="tag" href="/field-notes/?tag=${encodeURIComponent(item.tag)}" aria-current="${tag === item.tag}">#${e(item.tag)}</a></li>`).join('')}</ul>` : ''
  const list = notes.length
    ? `<ul class="notes">${notes.map(note => `<li><a class="note" href="/field-notes/${note.slug}/"><p class="meta"><time datetime="${new Date(note.published_at).toISOString()}">${date(note.published_at)}</time></p><p class="body">${e(note.body)}</p>${note.tags.length ? `<ul class="inline-tags">${note.tags.map(t => `<li>#${e(t)}</li>`).join('')}</ul>` : ''}</a></li>`).join('')}</ul>`
    : `<p class="empty">${tag ? 'No notes with this tag yet.' : 'No field notes yet.'}</p>`
  return page(tag ? `#${tag} · Field notes — Producing Curiosity` : 'Field notes — Producing Curiosity', 'Unedited field notes by Sami Belina: questions and connections in progress.', `${notesHeader}${tagList}<h2 class="sr" style="position:absolute;left:-999px">Notes</h2>${list}`, input.indexable, `${input.origin}/field-notes/${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`)
}

export function publicNotePage(note: PublicNote, origin: string, indexable: boolean) {
  const summary = note.body.replace(/\s+/g, ' ').slice(0, 150)
  return page(`Field note, ${date(note.published_at)} — Producing Curiosity`, summary, `<p class="kicker"><a href="/field-notes/">Field notes</a></p>
<article class="single"><p class="meta"><time datetime="${new Date(note.published_at).toISOString()}">${date(note.published_at)}</time></p><p class="body">${e(note.body)}</p>${note.tags.length ? `<ul class="inline-tags">${note.tags.map(t => `<li><a href="/field-notes/?tag=${encodeURIComponent(t)}">#${e(t)}</a></li>`).join('')}</ul>` : ''}</article>
<p class="boundary">An unedited note, not a reviewed finding.</p><p><a href="/field-notes/">← All field notes</a></p>`, indexable, `${origin}/field-notes/${note.slug}/`)
}

export const publicNotFound = (origin: string) => page('Note not found — Producing Curiosity', 'This field note is not available.', `${notesHeader}<p class="empty">This note isn't available. It may have been made private.</p><p><a href="/field-notes/">← All field notes</a></p>`, false, `${origin}/field-notes/`)
