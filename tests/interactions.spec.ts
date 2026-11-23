import { expect, test } from '@playwright/test'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

// Interactions and system layer (owner decision, 23 November 2026): no Tailwind; plain CSS with
// layers, tokens and a handful of utilities; every effect reads completely without it.
const origin = 'http://127.0.0.1:4175'
const claims = `${origin}/investigations/claims-operations/`

test('every class in the current-edition stylesheets is used somewhere (no dead CSS)', () => {
  const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => { const file = path.join(dir, name); return statSync(file).isDirectory() ? walk(file) : [file] })
  const sources = [...walk('src'), ...walk('worker'), ...walk('scripts'), 'index.html', 'reading.html', 'foundation.html'].filter(file => /\.(tsx?|html)$/.test(file)).map(file => readFileSync(file, 'utf8')).join('\n')
  // Classes assembled at runtime, e.g. `effect-${effect}` or `pc-document--${kind}`.
  const dynamicPrefixes = [...sources.matchAll(/([a-z][\w-]*-)\$\{/g)].map(match => match[1])
  const unused = new Set<string>()
  for (const file of ['src/design/foundation.css', 'src/design/system.css', 'src/design/motion.css', 'src/design/tokens.css', 'src/reading/reading.css']) {
    const css = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    for (const [, name] of css.matchAll(/\.([a-zA-Z][\w-]*)/g)) {
      const literal = new RegExp(`(^|[^\\w-])${name.replace(/-/g, '\\-')}($|[^\\w-])`).test(sources)
      if (!literal && !dynamicPrefixes.some(prefix => name.startsWith(prefix))) unused.add(`${name} (${path.basename(file)})`)
    }
  }
  expect([...unused]).toEqual([])
})

test('new code sits in cascade layers, so it cannot override existing components', () => {
  const system = readFileSync('src/design/system.css', 'utf8')
  expect(system).toContain('@layer pc-tokens, pc-components, pc-motion, pc-utilities;')
  const motion = readFileSync('src/design/motion.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
  // Outside the layers there are only the two global at-rules that cannot be layered.
  const outside = motion.replace(/@layer [\w-]+ \{[\s\S]*$/, '')
  expect(outside).toMatch(/@property --pc-count/)
  expect(outside).toMatch(/@view-transition \{ navigation: auto; \}/)
  expect(readFileSync('package.json', 'utf8')).not.toMatch(/tailwind/i)
})

test('derived tokens resolve on paper and observatory surfaces', async ({ page }) => {
  await page.goto(`${origin}/`)
  const paper = await page.locator('.pc-site').first().evaluate(element => getComputedStyle(element).getPropertyValue('--signal-3').trim())
  const dark = await page.locator('.pc-interlude').evaluate(element => getComputedStyle(element).getPropertyValue('--signal-3').trim())
  expect(paper).toContain('color-mix')
  expect(dark).toContain('color-mix')
  // The same token resolves differently on the dark surface, because it derives from that surface's own colors.
  expect(dark).not.toBe(paper)
  expect(await page.locator('.pc-site').first().evaluate(element => getComputedStyle(element).getPropertyValue('--space-4').trim())).toBe('1rem')
})

test('without JavaScript every new element reads completely', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(claims)
    const layers = page.getByRole('region', { name: 'Observed, interpreted, decided' })
    await expect(layers.getByRole('listitem')).toHaveCount(3)
    await expect(layers.getByRole('button')).toHaveCount(0)
    const pin = page.getByRole('complementary', { name: 'The process, before and after' })
    await expect(pin).toContainText('Before: pay → verify')
    await expect(pin).toContainText('After: verify → pay')
    // The source note is a native popover: closed until asked for, then readable.
    await expect(page.locator('#glance-source-1')).toBeHidden()
    await page.getByRole('button', { name: /^Source 1:/ }).click()
    await expect(page.locator('#glance-source-1')).toBeVisible()
    await page.goto(`${origin}/investigations/enterprise-ai/`)
    await expect(page.getByRole('img', { name: '8 challenge areas' })).toBeVisible()
    await page.goto(`${origin}/practice/`)
    await expect(page.getByRole('region', { name: 'The parts of a case study page' }).getByRole('listitem')).toHaveCount(5)
    await expect(page.locator('.pc-strand svg title')).toHaveText(/one orange thread/i)
  } finally { await context.close() }
})

test('controls work by keyboard: layers, source popover and the pinned figure', async ({ page }) => {
  await page.goto(claims)
  const toggle = page.getByRole('button', { name: 'Pull the layers apart' })
  await toggle.focus(); await page.keyboard.press('Enter')
  await expect(page.getByRole('button', { name: 'Stack the layers' })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: /^Source 1:/ }).focus(); await page.keyboard.press('Enter')
  await expect(page.locator('#glance-source-1')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.locator('#glance-source-1')).toBeHidden()
  await page.locator('#what-changed').scrollIntoViewIfNeeded()
  await page.mouse.wheel(0, 120)
  await expect(page.locator('.pc-pin')).toHaveAttribute('data-state', 'after')
  await expect(page.locator('.pc-pin-state[data-state="after"]')).toHaveAttribute('aria-current', 'step')
})

test('reduced motion: no running animations, no progress bar, a paused travelling mark', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' })
  try {
    const page = await context.newPage()
    await page.goto(claims)
    await expect(page.locator('.pc-progress')).toBeHidden()
    expect(await page.evaluate(() => document.getAnimations().filter(animation => animation.playState === 'running').length)).toBe(0)
    await page.goto(`${origin}/practice/`)
    expect(await page.locator('.pc-strand > svg').evaluate(svg => (svg as SVGSVGElement).animationsPaused())).toBe(true)
    expect(await page.locator('.pc-strand-thread').evaluate(path => getComputedStyle(path).strokeDashoffset)).toMatch(/^0(px)?$/)
  } finally { await context.close() }
})

test('each case title shares one view-transition name between its card and its page', async ({ page }) => {
  // Read the declared name from the markup, so browsers without view transitions are tested too.
  const name = (style: string | null) => style?.match(/view-transition-name:\s*([\w-]+)/)?.[1]
  await page.goto(`${origin}/investigations/`)
  const names = (await page.locator('.reading-cards h2').evaluateAll(headings => headings.map(heading => heading.getAttribute('style')))).map(name)
  expect(new Set(names).size).toBe(names.length)
  expect(names).toContain('case-claims-operations')
  await page.goto(claims)
  expect(name(await page.locator('#reading-title').getAttribute('style'))).toBe('case-claims-operations')
  await page.goto(`${origin}/`)
  expect(name(await page.locator('.pc-selected-list h3').first().getAttribute('style'))).toBe('case-claims-operations')
})

test('verbal stress: orange turn, bold finding, italic label; never an underline outside links', async ({ page }) => {
  const { plainText } = await import('../src/content/emphasis')
  expect(plainText('==Delivered ≠ verified.== The **finding**, a *label*.')).toBe('Delivered ≠ verified. The finding, a label.')
  await page.goto(claims)
  const turn = page.locator('.pc-turn').first()
  await expect(turn).toHaveText('Delivered ≠ verified.')
  expect(await turn.evaluate(element => getComputedStyle(element).textDecorationLine)).toBe('none')
  // No stress marks leak into the page, its title or its description.
  const marks = /==[^=]+==|\*\*[^*]+\*\*/
  expect(await page.locator('main').innerText()).not.toMatch(marks)
  expect(await page.title()).not.toMatch(marks)
  expect(await page.locator('meta[name="description"]').getAttribute('content')).not.toMatch(marks)
  for (const element of await page.locator('main :is(strong, em, b, i)').all()) {
    if (await element.evaluate(node => node.closest('a'))) continue
    expect(await element.evaluate(node => getComputedStyle(node).textDecorationLine)).toBe('none')
  }
})

test('the pattern illustration sits after the cases, with every case distinction as text', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(`${origin}/`)
    await expect(page.locator('.pc-hero .pc-inquiry-figure')).toHaveCount(0)
    const headings = await page.locator('main h2').allInnerTexts()
    expect(headings.indexOf('Related. Not equivalent.')).toBeGreaterThan(headings.indexOf('Three problems, and what changed.'))
    const pairs = page.getByRole('list', { name: "Each case study's distinction" }).getByRole('link')
    await expect(pairs).toHaveCount(6)
    await expect(pairs.first()).toHaveAccessibleName('Delivered is not Verified')
  } finally { await context.close() }
})

test('conceptual drawings use the deck palette: ink, orange, sage, not the status colours', async ({ page }) => {
  const stroke = (selector: string) => page.locator(selector).first().evaluate(element => getComputedStyle(element).stroke)
  const token = (name: string) => page.locator('.pc-site').first().evaluate((element, token) => {
    const probe = document.createElement('span'); probe.style.color = `var(${token})`; element.appendChild(probe)
    const value = getComputedStyle(probe).color; probe.remove(); return value
  }, name)
  await page.goto(`${origin}/`)
  const [ink, signal, sage, unresolved, holds] = await Promise.all(['--ink', '--signal', '--sage', '--unresolved', '--holds'].map(token))
  expect(await stroke('.pc-pattern .pc-question-line')).toBe(ink)
  expect(await stroke('.pc-pattern .pc-observation-line')).toBe(signal)
  expect(await stroke('.pc-pattern .pc-open-question')).toBe(signal)
  expect(await stroke('.pc-strand-lens')).toBe(sage)
  await page.goto(claims)
  for (const selector of ['.investigation-visual svg path', '.investigation-visual .visual-friction']) expect([unresolved, holds]).not.toContain(await stroke(selector))
  expect(await page.locator('.investigation-visual').evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe('rgb(21, 21, 27)')
  await page.goto(`${origin}/writing/`)
  expect(await stroke('.pc-interlude-geometry')).not.toBe(holds)
})

test('case figures: method profile, process dial, legend and card thumbnails read without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(claims)
    const method = page.getByRole('region', { name: 'How the evidence was gathered' })
    await expect(method.locator('.pc-method-row')).toHaveCount(4)
    for (const name of ['How it was gathered', 'When', 'From whom', 'What it could establish']) await expect(method.getByRole('heading', { level: 3, name: new RegExp(`^${name}`) })).toBeVisible()
    const dial = page.getByRole('region', { name: 'Walk the process' })
    await expect(dial.locator('.pc-dial-static h3')).toHaveText(['Before: pay → verify', 'After: verify → pay'])
    await expect(dial.getByRole('list', { name: 'Key to this figure' })).toBeVisible()
    await page.goto(`${origin}/investigations/brand-research/`)
    await expect(page.locator('.pc-method-tags li[data-unknown]')).toContainText(['Survey mode not stated'])
    await page.goto(`${origin}/investigations/`)
    await expect(page.locator('.reading-cards .pc-thumb-pair')).toHaveCount(6)
    await expect(page.locator('.reading-cards .pc-thumb-pair').first()).toHaveText(/Delivered\s*≠\s*is not\s*Verified/)
  } finally { await context.close() }
})

test('the process dial steps through each stage by keyboard and switches between before and after', async ({ page }) => {
  await page.goto(claims)
  const dial = page.getByRole('region', { name: 'Walk the process' })
  await expect(dial.locator('.pc-dial-count')).toHaveText('01 / 04')
  await dial.getByRole('button', { name: 'Next step' }).focus(); await page.keyboard.press('Enter')
  await expect(dial.locator('.pc-dial-center strong')).toHaveText('Photo reviewed')
  await expect(dial.locator('.pc-dial-segment[data-current]')).toHaveAttribute('data-mark', 'change')
  await dial.getByRole('radio', { name: 'Before: pay → verify' }).check()
  await expect(dial.locator('.pc-dial-count')).toHaveText('01 / 05')
  await expect(dial.getByRole('button', { name: 'Previous step' })).toBeDisabled()
})
