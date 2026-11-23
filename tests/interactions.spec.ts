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
    await expect(page.getByRole('region', { name: 'The parts of an investigation page' }).getByRole('listitem')).toHaveCount(5)
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
    expect(await page.locator('.pc-strand svg').evaluate(svg => (svg as SVGSVGElement).animationsPaused())).toBe(true)
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
