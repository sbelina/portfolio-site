/**
 * Optional maintenance command: one sharing image per approved case study (1200 × 630), in the deck's
 * paper/ink/orange. Run after a case headline changes, then commit public/social/*.png:
 *   PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=… npx tsx scripts/render-case-previews.ts
 * The prerender uses an image only when its file exists; otherwise the site-wide preview is used.
 */
import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { loadApprovedProjection } from './release'
import { caseLabel } from '../src/content/primary-evidence'

const escape = (text: string) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
/** ==turn== in orange, **finding** in bold, *label* plain; the same stress the pages use. */
const stressed = (text: string) => escape(text).replace(/==(.+?)==/g, '<span class="turn">$1</span>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '$1')

const projection = await loadApprovedProjection()
await mkdir('public/social', { recursive: true })
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {})
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  for (const entry of projection.entries) {
    if (!entry.slug) continue
    await page.setContent(`<!doctype html><html><head><style>
      body { margin: 0; width: 1200px; height: 630px; background: #f3efe7; color: #111716; font-family: Arial, Helvetica, sans-serif; display: flex; flex-direction: column; justify-content: space-between; box-sizing: border-box; padding: 64px 72px; }
      .brand { font-size: 30px; font-weight: 600; } .brand span { color: #a33a0c; }
      .kicker { margin-top: 28px; font-size: 20px; letter-spacing: 2px; text-transform: uppercase; color: #555d58; }
      h1 { margin: 22px 0 0; font-size: 76px; line-height: 1.05; letter-spacing: -2px; font-weight: 700; max-width: 1000px; }
      .turn { color: #a33a0c; } .rule { width: 96px; height: 6px; background: #ff641c; margin-bottom: 22px; }
      .foot { font-size: 22px; color: #555d58; } .foot strong { color: #111716; }
    </style></head><body>
      <div><div class="brand"><span>*</span> Producing Curiosity</div><div class="kicker">Case study · ${escape(caseLabel(entry.slug) ?? '')}</div><h1>${stressed(entry.title)}</h1></div>
      <div><div class="rule"></div><div class="foot"><strong>Sami Belina</strong> · Applied Research &amp; Systems Strategist · producingcuriosity.com</div></div>
    </body></html>`)
    await page.screenshot({ path: `public/social/${entry.slug}.png` })
    console.log(`public/social/${entry.slug}.png`)
  }
} finally { await browser.close() }
