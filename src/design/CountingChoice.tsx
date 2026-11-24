import React, { useEffect, useState } from 'react'
import { browserSaysNo, choice, isLive, setChoice, toast } from '../analytics'

/**
 * What this site counts, and the reader's choice (owner direction, 24 November 2026). Without JavaScript
 * nothing can be counted, so the page says so; with it, the reader sees the current state and can change it.
 */
export function CountingChoice() {
  const [state, setState] = useState<{ ready: boolean; choice: 'on' | 'off' | 'unset'; browserNo: boolean; live: boolean }>({ ready: false, choice: 'unset', browserNo: false, live: true })
  useEffect(() => {
    const update = () => setState({ ready: true, choice: choice(), browserNo: browserSaysNo(), live: isLive() })
    update()
    window.addEventListener('pc-count-change', update)
    return () => window.removeEventListener('pc-count-change', update)
  }, [])
  const status = !state.ready ? 'Without JavaScript, this site counts nothing of its own.'
    : state.browserNo ? 'Your browser asks sites not to track, so this site counts nothing of its own for you.'
    : state.choice === 'unset' ? 'You haven’t chosen yet, so nothing is counted.'
    : state.choice === 'off' ? 'You said no, so nothing is counted in this browser.'
    : !state.live ? 'You agreed. This is a preview, so nothing is counted here.'
    : 'You agreed: this browser is counted, anonymously.'
  const set = (next: 'on' | 'off') => { setChoice(next); toast(next === 'off' ? 'Nothing will be counted in this browser.' : 'Thank you. Counting is on, anonymously, in this browser.') }
  return <section className="pc-section pc-counting" id="counting" aria-labelledby="pc-counting-title">
    <p className="pc-kicker">What this site counts</p>
    <h2 id="pc-counting-title">Counts, never <em className="pc-accent">people</em>.</h2>
    <div className="pc-counting-grid">
      <div>
        <p>I want to know what produces curiosity here: which case studies get opened, whether the interactive pieces get used, and whether anyone reaches the call to action. With your agreement, the site counts a few actions.</p>
        <ul className="pc-counting-list">
          <li><strong>Counted, only if you agree:</strong> the page, the action (for example, “split a point” or “opened a case study”) and the day.</li>
          <li><strong>Never kept:</strong> cookies, IDs, IP addresses, your browser’s details, what you type, or your path through the site.</li>
          <li><strong>Never counted:</strong> until you agree, when you say no, or when your browser sends Do Not Track or Global Privacy Control.</li>
          <li><strong>Also, for every visitor:</strong> Cloudflare, which hosts this site, counts visits, pages and the country they come from with its Web Analytics. It uses no cookies and does not identify you. This choice does not change it.</li>
        </ul>
        <p>Saying no is completely fine. Your choice is remembered in this browser only, and you can change it here at any time.</p>
      </div>
      <div className="pc-counting-card pc-night" data-surface="observatory">
        <svg className="pc-count-glyph" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><circle cx="20" cy="20" r="15"/><path d="M8 20H32"/><circle cx="20" cy="20" r="4"/></svg>
        <p className="pc-counting-status" role="status">{status}</p>
        {state.ready && !state.browserNo ? <p className="pc-counting-actions pc-cluster">
          {state.choice !== 'on' ? <button type="button" className="pc-count-primary" onClick={() => set('on')}>Agree to be counted</button> : null}
          {state.choice !== 'off' ? <button type="button" className={state.choice === 'on' ? 'pc-count-primary' : 'pc-count-secondary'} onClick={() => set('off')}>{state.choice === 'on' ? 'Stop counting me' : 'Disagree'}</button> : null}
        </p> : null}
      </div>
    </div>
  </section>
}
