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
