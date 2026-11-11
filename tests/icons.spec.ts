import { test, expect } from '@playwright/test'
import { readFileSync } from 'node:fs'

// Temporary placeholder icons until the owner-supplied asterisk is final.
const png = (file: string) => {
  const bytes = readFileSync(file)
  expect(bytes.subarray(1, 4).toString()).toBe('PNG')
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) }
}

test('home-screen and manifest PNG icons ship at their declared sizes', () => {
  expect(png('dist/apple-touch-icon.png')).toEqual({ width: 180, height: 180 })
  expect(png('dist/icon-192.png')).toEqual({ width: 192, height: 192 })
  expect(png('dist/icon-512.png')).toEqual({ width: 512, height: 512 })
  const manifest = JSON.parse(readFileSync('dist/site.webmanifest', 'utf8'))
  expect(manifest.icons).toEqual(expect.arrayContaining([
    expect.objectContaining({ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }),
    expect.objectContaining({ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }),
  ]))
})

for (const page of ['dist/index.html', 'dist/practice/index.html', 'dist/investigations/index.html', 'dist/experiments/reveal-hidden-work/index.html', 'dist/404.html']) {
  test(`${page} links the iOS home-screen icon`, () => {
    expect(readFileSync(page, 'utf8')).toContain('<link rel="apple-touch-icon" href="/apple-touch-icon.png" />')
  })
}
