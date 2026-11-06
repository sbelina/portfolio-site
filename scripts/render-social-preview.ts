import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'

/** Optional maintenance command: npx tsx scripts/render-social-preview.ts */
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {})
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.setContent(`<html><head><style>body{margin:0}svg{display:block}</style></head><body>${await readFile('public/social-preview.svg', 'utf8')}</body></html>`)
  await page.screenshot({ path: 'public/social-preview.png' })
} finally { await browser.close() }
