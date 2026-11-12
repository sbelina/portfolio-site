import { expect, type Page } from '@playwright/test'

export const route = '/play/edge-case/'
export const shell = (page: Page) => page.locator('.ec-shell')
export const samples = (page: Page) => page.locator('.ps-samples')
export const status = (page: Page) => page.locator('.ec-shell [role="status"][aria-live]')
export const menuCard = (page: Page) => page.locator('.ec-menu')

/** Enter the full-window game from the page (§13, M1). */
export async function enter(page: Page) {
  await page.getByRole('button', { name: /^(Enter|Continue)/ }).click()
  await expect(shell(page)).toBeVisible()
  // Let a true full-screen request settle (granted or refused) before pressing keys (§13, M2).
  await page.waitForFunction(() => !!document.fullscreenElement, null, { timeout: 1500 }).catch(() => {})
}

/** Walk the nested menu by item names, e.g. menu(page, 'Settings', 'Display'). */
export async function menu(page: Page, ...items: string[]) {
  for (const item of items) await menuCard(page).getByRole('button', { name: new RegExp(`^${item}`) }).click()
}

/** Open the page, enter, and start a level (by its code) or Play. */
export async function start(page: Page, level?: string) {
  await page.goto(route)
  await enter(page)
  if (level) await menu(page, 'Levels', level)
  else await menuCard(page).getByRole('button', { name: 'Play', exact: true }).click()
  await expect(shell(page)).toHaveAttribute('data-screen', 'playing')
  // Play hands keyboard focus to the arena (one frame after starting).
  await expect(page.locator('.ec-stage')).toBeFocused()
}

/** Hold a key until a condition holds (condition-driven, never a fixed duration). */
export async function holdUntil(page: Page, key: string, condition: () => Promise<unknown>) {
  await page.keyboard.down(key)
  try { await condition() } finally { await page.keyboard.up(key) }
}

/**
 * Press Escape and wait for the expected menu heading (or play) before continuing.
 * In true full screen a browser may swallow Escape and report it as leaving full
 * screen about half a second later; condition-driven steps keep tests faithful to that.
 */
export async function escapeTo(page: Page, heading: string | 'playing') {
  await page.keyboard.press('Escape')
  if (heading === 'playing') await expect(shell(page)).toHaveAttribute('data-screen', 'playing')
  else await expect(menuCard(page).locator('h3')).toHaveText(heading)
}

/** Store settings before the page loads (schema version 2), e.g. to choose the fixed pad. */
export async function presetSettings(page: Page, settings: Record<string, unknown>) {
  // Seeds empty storage only, so later changes (and reloads) keep what the player chose.
  await page.addInitScript(value => { if (!localStorage.getItem('edge-case:v1')) localStorage.setItem('edge-case:v1', JSON.stringify({ version: 2, settings: value, completed: [], discovered: [], indexOpens: 0 })) }, settings)
}

/**
 * Hold a movement key from inside the page, checked every animation frame, until the
 * shell attribute matches (e.g. the player's tile). Avoids overshooting under load.
 */
export async function keyUntil(page: Page, code: string, attribute: string, pattern: RegExp, timeout = 8000) {
  await page.evaluate(({ code, attribute, source, flags, timeout }) => new Promise<void>((resolve, reject) => {
    const shell = document.querySelector('.ec-shell')!
    const re = new RegExp(source, flags)
    window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code, bubbles: true }))
    const deadline = performance.now() + timeout
    const frame = () => {
      const value = shell.getAttribute(attribute) ?? ''
      const done = re.test(value)
      if (done || performance.now() > deadline) {
        window.dispatchEvent(new KeyboardEvent('keyup', { code, key: code, bubbles: true }))
        return done ? resolve() : reject(new Error(`${attribute} stayed ${value}`))
      }
      requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }), { code, attribute, source: pattern.source, flags: pattern.flags, timeout })
}
