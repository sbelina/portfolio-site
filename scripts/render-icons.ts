import { chromium } from '@playwright/test'

/**
 * Optional maintenance command: npx tsx scripts/render-icons.ts
 * TEMPORARY icons from the typographic placeholder mark (same as favicon.svg).
 * Replace when the owner-supplied asterisk artwork is final. Full-bleed and
 * opaque: iOS applies its own corner mask to home-screen icons.
 */
const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } : {})
try {
  for (const [file, size] of [['public/apple-touch-icon.png', 180], ['public/icon-192.png', 192], ['public/icon-512.png', 512]] as const) {
    const page = await browser.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 })
    await page.setContent(`<html><head><style>html,body{margin:0}canvas{display:block}</style></head><body><canvas width="${size}" height="${size}"></canvas></body></html>`)
    await page.evaluate((size) => {
      const ctx = document.querySelector('canvas')!.getContext('2d')!
      ctx.fillStyle = '#f3efe7'
      ctx.fillRect(0, 0, size, size)
      ctx.font = `${Math.round(size * 1.15)}px Georgia, serif`
      // Centre the glyph's measured ink, which varies by font, in the square.
      const m = ctx.measureText('*')
      const width = m.actualBoundingBoxLeft + m.actualBoundingBoxRight
      const height = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
      const scale = (size * 0.56) / Math.max(width, height)
      ctx.font = `${Math.round(size * 1.15 * scale)}px Georgia, serif`
      const n = ctx.measureText('*')
      const x = size / 2 - (n.actualBoundingBoxRight - n.actualBoundingBoxLeft) / 2
      const y = size / 2 + (n.actualBoundingBoxAscent - n.actualBoundingBoxDescent) / 2
      ctx.fillStyle = '#a33a0c'
      ctx.fillText('*', x, y)
    }, size)
    await page.screenshot({ path: file })
    await page.close()
  }
} finally { await browser.close() }
