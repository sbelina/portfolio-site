/**
 * Counting what gets used (owner direction, 24 November 2026: "I want to understand what is compelling and
 * producing curiosity on the site, and it's acceptable not to want to participate").
 *
 *  - Counts, not people: each event is a name, the page path and an optional short detail. No cookies,
 *    no identifiers, no fingerprinting; the Worker stores no IP address or user agent.
 *  - Only on the live site. Previews and local builds never send anything.
 *  - Off when the browser sends Do Not Track or Global Privacy Control, or when the reader chooses
 *    "Don't count me" (remembered in this browser only). ?count=off and ?count=on set the same choice.
 *  - A short notice explains this on a first visit; /about/#counting explains it in full.
 */
const choiceKey = 'pc-count', noticeKey = 'pc-count-notice'
const liveHosts = ['producingcuriosity.com', 'www.producingcuriosity.com']

/** Every event the site can send; the Worker accepts only these. Keep in sync with worker/count.ts. */
export const countEvents = ['view', 'cta-hero', 'cta-band', 'cta-end', 'career-next-contact', 'resume-request', 'case-open', 'deep-dive-open', 'field-split', 'field-split-all', 'practice-open', 'practice-move', 'practice-play', 'explore-open', 'cfield-layer', 'cfield-point', 'career-era', 'contact-send'] as const
export type CountEvent = typeof countEvents[number]

const read = (key: string) => { try { return localStorage.getItem(key) } catch { return null } }
const write = (key: string, value: string) => { try { localStorage.setItem(key, value) } catch { /* storage unavailable: the choice lasts for this page */ } }

export const browserSaysNo = () => typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true)
export const choice = (): 'on' | 'off' => read(choiceKey) === 'off' ? 'off' : 'on'
export const isLive = () => typeof location !== 'undefined' && liveHosts.includes(location.hostname)
export const counting = () => isLive() && !browserSaysNo() && choice() === 'on'

export function setChoice(value: 'on' | 'off') {
  write(choiceKey, value)
  window.dispatchEvent(new CustomEvent('pc-count-change'))
}

export function count(event: CountEvent | string, detail?: string) {
  if (typeof window === 'undefined' || !counting() || !(countEvents as readonly string[]).includes(event)) return
  const body = JSON.stringify({ e: event, p: location.pathname, ...(detail ? { d: detail.slice(0, 40) } : {}) })
  try { navigator.sendBeacon('/api/count', new Blob([body], { type: 'application/json' })) } catch { /* never let counting break the page */ }
}

/** The first-visit notice: what is counted, why, and a one-click way out. Never blocks or takes focus. */
export function showCountingNotice() {
  if (document.querySelector('.pc-count-notice')) return
  const notice = document.createElement('aside')
  notice.className = 'pc-count-notice'
  notice.setAttribute('aria-label', 'What this site counts')
  const no = browserSaysNo()
  notice.innerHTML = `<svg class="pc-count-glyph" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="15"/><path d="M8 20H32"/><circle cx="20" cy="20" r="4"/></svg>
    <div class="pc-count-copy"><p><strong>${no ? 'Nothing is counted for you.' : 'I count which parts of this site get used, never who uses them.'}</strong></p>
    <p>${no ? 'Your browser asks sites not to track, so this site sends nothing.' : 'It shows me what produces curiosity. No cookies, no IDs, no IP addresses. Not taking part is completely fine.'} <a href="/about/#counting">What’s counted</a></p>
    <p class="pc-count-actions"></p></div>`
  const actions = notice.querySelector('.pc-count-actions')!
  const button = (label: string, onClick: () => void, primary = false) => { const element = document.createElement('button'); element.type = 'button'; element.textContent = label; if (primary) element.className = 'pc-count-primary'; element.addEventListener('click', onClick); actions.append(element) }
  const close = () => { write(noticeKey, 'seen'); notice.remove() }
  if (no) button('OK', close, true)
  else {
    button('That’s fine', close, true)
    button('Don’t count me', () => { setChoice('off'); close(); toast('You won’t be counted in this browser.', 'Undo', () => setChoice('on')) })
  }
  document.body.append(notice)
}

/** A short confirmation that announces itself to screen readers and goes away on its own. */
export function toast(message: string, actionLabel?: string, action?: () => void) {
  document.querySelector('.pc-count-toast')?.remove()
  const element = document.createElement('div')
  element.className = 'pc-count-toast'
  element.setAttribute('role', 'status')
  element.textContent = message
  if (actionLabel && action) {
    const undo = document.createElement('button'); undo.type = 'button'; undo.textContent = actionLabel
    undo.addEventListener('click', () => { action(); element.remove(); toast('Counting is back on in this browser.') })
    element.append(' ', undo)
  }
  document.body.append(element)
  window.setTimeout(() => element.remove(), 9000)
}

/** The first-visit introduction comes first; the notice waits until it has closed. */
function whenIntroCloses(then: () => void) {
  if (!document.querySelector('.pc-intro')) { window.setTimeout(then, 1200); return }
  const watcher = new MutationObserver(() => { if (!document.querySelector('.pc-intro')) { watcher.disconnect(); window.setTimeout(then, 1200) } })
  watcher.observe(document.body, { childList: true, subtree: true })
}

let started = false
/** Call once from each page's client entry. */
export function initCounting() {
  if (started || typeof window === 'undefined') return
  started = true
  const url = new URL(location.href)
  const requested = url.searchParams.get('count')
  if (requested === 'off' || requested === 'on') {
    setChoice(requested)
    url.searchParams.delete('count')
    history.replaceState(history.state, '', url.pathname + url.search + url.hash)
    toast(requested === 'off' ? 'This browser won’t be counted.' : 'Counting is on in this browser.')
  }
  count('view')
  // Elements opt in with data-count="event"; details elements count when opened.
  document.addEventListener('click', event => { const target = (event.target as Element | null)?.closest?.('[data-count]'); if (target && target.tagName !== 'DETAILS') count(target.getAttribute('data-count')!, target.getAttribute('data-count-detail') ?? undefined) }, true)
  document.addEventListener('toggle', event => { const target = event.target as HTMLElement; if (target instanceof HTMLDetailsElement && target.open && target.dataset.count) count(target.dataset.count) }, true)
  ;(window as Window & { pcShowCountingNotice?: () => void }).pcShowCountingNotice = showCountingNotice
  // Automated browsers (tests, crawlers) don't get the notice; tests call pcShowCountingNotice() directly.
  if (read(noticeKey) !== 'seen' && !navigator.webdriver) whenIntroCloses(showCountingNotice)
}
