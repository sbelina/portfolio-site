import React, { useEffect, useState } from 'react'
import { browserSaysNo, choice, isLive, setChoice, toast } from '../analytics'

/**
 * What this site counts, and the reader's choice (owner direction, 24 November 2026). Without JavaScript
 * nothing can be counted, so the page says so; with it, the reader sees the current state and can change it.
 */
export function CountingChoice() {
  const [state, setState] = useState<{ ready: boolean; on: boolean; browserNo: boolean; live: boolean }>({ ready: false, on: true, browserNo: false, live: true })
  useEffect(() => {
    const update = () => setState({ ready: true, on: choice() === 'on', browserNo: browserSaysNo(), live: isLive() })
    update()
    window.addEventListener('pc-count-change', update)
    return () => window.removeEventListener('pc-count-change', update)
  }, [])
  const status = !state.ready ? 'Nothing is counted without JavaScript.'
    : state.browserNo ? 'Your browser asks sites not to track, so nothing is counted for you.'
    : !state.on ? 'You chose not to be counted in this browser.'
    : !state.live ? 'This is a preview, so nothing is counted here.'
    : 'This browser is counted, anonymously.'
  return <section className="pc-section pc-counting" id="counting" aria-labelledby="pc-counting-title">
    <p className="pc-kicker">What this site counts</p>
    <h2 id="pc-counting-title">Counts, never <em className="pc-accent">people</em>.</h2>
    <div className="pc-counting-grid">
      <div>
        <p>I want to know what produces curiosity here: which case studies get opened, whether the interactive pieces get used, and whether anyone reaches the call to action. So the site counts a few actions.</p>
        <ul className="pc-counting-list">
          <li><strong>Counted:</strong> the page, the action (for example, “split a point” or “opened a case study”) and the day.</li>
          <li><strong>Never kept:</strong> cookies, IDs, IP addresses, your browser’s details, what you type, or your path through the site.</li>
          <li><strong>Never counted:</strong> when your browser sends Do Not Track or Global Privacy Control, or when you choose not to take part.</li>
        </ul>
        <p>Not taking part is completely fine. The choice is remembered in this browser only.</p>
      </div>
      <div className="pc-counting-card pc-night" data-surface="observatory">
        <svg className="pc-count-glyph" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="15"/><path d="M8 20H32"/><circle cx="20" cy="20" r="4"/></svg>
        <p className="pc-counting-status" role="status">{status}</p>
        {state.ready && !state.browserNo ? <button type="button" className="pc-count-primary" aria-pressed={!state.on} onClick={() => { const next = state.on ? 'off' : 'on'; setChoice(next); toast(next === 'off' ? 'You won’t be counted in this browser.' : 'Counting is on in this browser.') }}>{state.on ? 'Don’t count me' : 'Count me again'}</button> : null}
      </div>
    </div>
  </section>
}
