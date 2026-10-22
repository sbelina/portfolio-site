import { test, expect } from '@playwright/test'
import { graphNodes, graphEdges } from '../src/data'

test('authored graph has unique IDs and valid endpoints', () => {
  const ids = new Set(graphNodes.map(node => node.id))
  expect(ids.size).toBe(graphNodes.length)
  for (const edge of graphEdges) {
    expect(ids.has(edge.source), `Missing source ${edge.source}`).toBe(true)
    expect(ids.has(edge.target), `Missing target ${edge.target}`).toBe(true)
  }
  expect(new Set(graphEdges.map(edge => `${edge.source}:${edge.target}`)).size).toBe(graphEdges.length)
})

test('production HTML references compiled assets with correct MIME types', async ({ request }) => {
  const html = await (await request.get('/')).text()
  expect(html).not.toContain('src="/src/')
  const script = html.match(/<script[^>]*src="([^"]+)"/)?.[1]
  expect(script).toMatch(/^\/assets\/.+\.js$/)
  const response = await request.get(script!)
  expect(response.ok()).toBe(true)
  expect(response.headers()['content-type']).toMatch(/javascript/)
})

test('existing fragment navigation and graph destinations resolve', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const missing = await page.evaluate(() => [...document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')]
    .map(link => link.hash.slice(1)).filter(id => id && !document.getElementById(id)))
  expect(missing).toEqual([])
  for (const node of graphNodes.filter(node => node.href?.startsWith('#'))) {
    await expect(page.locator(`[id="${node.href!.slice(1)}"]`)).toHaveCount(1)
  }
})
