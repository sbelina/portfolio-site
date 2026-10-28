import { chromium } from '@playwright/test'
import { writeFile, mkdir } from 'node:fs/promises'

const origin = process.env.PC_REVIEW_ORIGIN ?? 'http://127.0.0.1:4193'
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname) || new URL(origin).protocol !== 'http:') throw new Error('Research proof requires a local HTTP Worker')
const output = process.env.PC_REVIEW_EVIDENCE_DIR ?? '/tmp/pc-experience-proof-replay'
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true, executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH })
const results = []
const record = (id, expected, observed, passed) => results.push({ id, expected, observed, passed })
const alias = text => text.replaceAll('#evidence', 'Fixture observation').replaceAll('#decision', 'Fixture decision')
const expectedStatement = 'Fixture observation informs Fixture decision'

try {
  const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto(`${origin}/#connections`)
  for (const endpoint of ['decision', 'evidence']) {
    const control = page.getByRole('button', { name: `tag: #${endpoint}. Select to trace connections.`, exact: true })
    await control.focus(); await page.keyboard.press('Enter')
    const statement = page.locator('.trace-links button').filter({ hasText: '#evidence informs #decision' })
    await statement.waitFor()
    const actual = alias(await statement.innerText())
    record(`direction-clean-${endpoint}`, expectedStatement, actual, actual === expectedStatement)
  }
  const statement = page.locator('.trace-links button').filter({ hasText: '#evidence informs #decision' })
  await statement.evaluate(el => {
    el.textContent = '#decision informs #evidence'
    el.setAttribute('aria-label', 'Inspect #decision. #decision informs #evidence.')
  })
  const reversed = alias(await page.locator('.trace-links button').filter({ hasText: '#decision informs #evidence' }).innerText())
  record('direction-mutant-detected', 'Reject reversed statement against invariant source/target', reversed, reversed !== expectedStatement)
  await context.close()

  for (const mutation of [false, true]) {
    const motionContext = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1280, height: 900 } })
    await motionContext.addInitScript(() => {
      const original = Element.prototype.scrollIntoView
      window.__scrollCalls = []
      window.__forceSmooth = false
      Element.prototype.scrollIntoView = function (options) {
        const applied = window.__forceSmooth && typeof options === 'object' ? { ...options, behavior: 'smooth' } : options
        window.__scrollCalls.push({ requested: options, applied })
        return original.call(this, applied)
      }
    })
    const p = await motionContext.newPage()
    await p.goto(`${origin}/#claims-operations`)
    await p.waitForTimeout(250)
    const observed = await p.evaluate(async force => {
      window.__scrollCalls = []
      window.__forceSmooth = force
      const before = scrollY
      const button = [...document.querySelectorAll('#claims-operations .tag-button')].find(el => el.textContent === '#systems')
      button.click() // Programmatic handler activation; not physical input evidence.
      const positions = []
      for (let index = 0; index < 35; index++) {
        await new Promise(requestAnimationFrame)
        positions.push(Math.round(scrollY))
      }
      return { reduced: matchMedia('(prefers-reduced-motion: reduce)').matches, before, positions, calls: window.__scrollCalls }
    }, mutation)
    const transient = Math.max(...observed.positions) - Math.min(...observed.positions) > 2
    const instant = observed.calls.some(call => call.applied?.behavior === 'instant') && !transient
    record(mutation ? 'motion-mutant-detected' : 'motion-clean', mutation ? 'Reject forced animated scrolling under reduced motion' : 'Immediate stable jump under reduced motion', observed, mutation ? !instant && transient : instant)
    await motionContext.close()
  }

  const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 740 }, reducedMotion: 'reduce' })
  const staticPage = await nojs.newPage()
  await staticPage.goto(origin)
  const summary = staticPage.locator('.experiment-note > summary')
  await summary.focus(); await staticPage.keyboard.press('Enter')
  const opened = await staticPage.locator('.experiment-note').evaluate(el => el.open)
  const focusOnOpen = await summary.evaluate(el => el === document.activeElement)
  await staticPage.keyboard.press('Space')
  const closed = !(await staticPage.locator('.experiment-note').evaluate(el => el.open))
  record('keyboard-native-disclosure', 'Enter opens; Space closes; trigger keeps focus without JavaScript', { opened, closed, focusOnOpen }, opened && closed && focusOnOpen)
  const initialText = await staticPage.locator('#index-title').innerText()
  await staticPage.locator('.connections-list > summary').click()
  const staticRelationship = await staticPage.locator('.connections-list').innerText()
  record('nojs-reading', 'Initial thesis and directed relationship remain readable without script', { thesis: initialText, relationshipPresent: staticRelationship.includes('#evidence informs #decision') }, initialText.length > 0 && staticRelationship.includes('#evidence informs #decision'))
  await staticPage.evaluate(() => {
    const style = document.createElement('style')
    style.textContent = ':root {font-size:200%} * {letter-spacing:.12em!important;word-spacing:.16em!important}'
    document.head.append(style)
  })
  const staticReflow = await staticPage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth }))
  record('nojs-narrow-enlarged', 'No horizontal page overflow at320px with200% text and spacing', staticReflow, staticReflow.scrollWidth <= staticReflow.viewport)
  await nojs.close()

  const enlarged = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 320, height: 740 } })
  const ep = await enlarged.newPage(); await ep.goto(`${origin}/#connections`)
  await ep.getByRole('button', { name: 'tag: #decision. Select to trace connections.', exact: true }).click()
  await ep.locator('.connections-list > summary').click()
  await ep.addStyleTag({ content: ':root {font-size:200%} * {letter-spacing:.12em!important;word-spacing:.16em!important}' })
  const reflow = await ep.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth, directedTrace: document.querySelector('.trace-links')?.textContent.includes('#evidence informs #decision') }))
  record('enhanced-narrow-enlarged', 'Selected full statements and expanded text list reflow at320px/200%', reflow, reflow.scrollWidth <= reflow.viewport && reflow.directedTrace)
  await ep.locator('.graph-explanation').screenshot({ path: `${output}/enlarged-selected-trace.png` })
  await enlarged.close()
} finally {
  await browser.close()
  await writeFile(`${output}/results.json`, JSON.stringify({ method: 'Independent browser automation and isolated DOM/API mutations; not human comprehension or real assistive-technology evaluation', results }, null, 2))
  for (const result of results) console.log(`${result.passed ? 'PASS' : 'FAIL'} ${result.id}`)
}
if (results.some(result => !result.passed)) process.exitCode = 1
