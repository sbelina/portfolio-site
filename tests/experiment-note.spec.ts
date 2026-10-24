import { test, expect } from '@playwright/test'

for (const route of ['/', '/investigations/']) {
  test(`experiment note opens by keyboard and reflows on ${route}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width: 320, height: 720 })
    await page.goto(route)
    const note = page.locator('footer .experiment-note')
    await expect(note).not.toHaveAttribute('open', '')
    const summary = note.locator('summary')
    await expect(summary).toHaveAccessibleName('About this experiment')
    await summary.focus()
    await page.keyboard.press('Enter')
    await expect(note).toHaveAttribute('open', '')
    await expect(note.getByRole('heading', { name: 'The working hypothesis' })).toBeVisible()
    await expect(note).toContainText('not a demonstrated result')
    await expect(note.getByRole('link', { name: 'Explore the source and development history' })).toHaveAttribute('href', 'https://github.com/sbelina/portfolio-site')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy()
    await summary.focus()
    await page.keyboard.press('Space')
    await expect(note).not.toHaveAttribute('open', '')
  })
}

test('experiment explanation remains available without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  for (const route of ['/', '/investigations/']) {
    await page.goto(`http://127.0.0.1:4174${route}`)
    const note = page.locator('footer .experiment-note')
    await note.locator('summary').click()
    await expect(note.getByRole('heading', { name: 'The implementation' })).toBeVisible()
  }
  await context.close()
})
