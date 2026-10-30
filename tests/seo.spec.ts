import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { seoHead, homeTitle, homeDescription, siteOrigin } from '../scripts/seo'
import { projects } from '../src/data'

test('metadata escapes content and rejects off-site canonical routes', () => {
  const head = seoHead({ title: 'A "quote" <script>', description: 'A & B < C', route: '/example/', indexable: true })
  expect(head).toContain('A &quot;quote&quot; &lt;script&gt;')
  expect(head).toContain('A &amp; B &lt; C')
  expect(head).not.toContain('<script>')
  expect(() => seoHead({ title: 'x', description: 'x', route: '//elsewhere.example/', indexable: true })).toThrow(/local absolute path/)
})

test('production documents have one consistent metadata set and factual site schema', async () => {
  for (const [file, route, indexable] of [
    ['index.html', '/', true],
    ['investigations/index.html', '/investigations/', false],
    ['experiments/reveal-hidden-work/index.html', '/experiments/reveal-hidden-work/', true],
    ['404.html', undefined, false],
  ] as const) {
    const html = await readFile(`dist/${file}`, 'utf8')
    expect(html.match(/<title>/g)).toHaveLength(1)
    for (const name of ['description', 'robots', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
      expect(html.match(new RegExp(`<meta name="${name}"`, 'g'))).toHaveLength(1)
    }
    for (const name of ['og:title', 'og:description', 'og:image', 'og:image:alt']) {
      expect(html.match(new RegExp(`<meta property="${name}"`, 'g'))).toHaveLength(1)
    }
    expect(html).toContain(`name="robots" content="${indexable ? 'index' : 'noindex'}, follow"`)
    if (route) expect(html).toContain(`rel="canonical" href="${siteOrigin}${route}"`)
    else expect(html).not.toContain('rel="canonical"')
    if (file === 'index.html') {
      expect(html).toContain(homeTitle.replaceAll('&', '&amp;'))
      expect(html).toContain(homeDescription)
      const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)![1])
      expect(schema).toEqual({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteOrigin}/#website`, name: 'Producing Curiosity', url: `${siteOrigin}/`, description: homeDescription })
    }
  }
})

test('sitemap lists only indexable canonical public documents and fixtures never contribute', async () => {
  const sitemap = await readFile('dist/sitemap.xml', 'utf8')
  expect([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1])).toEqual([`${siteOrigin}/`, `${siteOrigin}/experiments/reveal-hidden-work/`])
  expect(await readFile('dist-fixtures/sitemap.xml', 'utf8')).not.toContain('<loc>')
  const manifest = JSON.parse(await readFile('dist-fixtures/route-manifest.json', 'utf8'))
  for (const route of manifest.routes) {
    expect(await readFile(`dist-fixtures${route}index.html`, 'utf8')).toContain('name="robots" content="noindex, follow"')
  }
  expect(await readFile('dist-fixtures/_headers', 'utf8')).toContain('/*\n  X-Robots-Tag: noindex')
  expect(await readFile('dist/_headers', 'utf8')).toContain('https://:version.:subdomain.workers.dev/*\n  X-Robots-Tag: noindex')
  expect(await readFile('dist/robots.txt', 'utf8')).toContain(`Sitemap: ${siteOrigin}/sitemap.xml`)
})

test('homepage portfolio and durable experiment link are readable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  const page = await context.newPage()
  await page.goto('http://127.0.0.1:4174/')
  for (const project of projects) await expect(page.getByRole('heading', { name: project.title, exact: true })).toBeVisible()
  await page.locator('.site-footer').getByRole('link', { name: 'Reveal the hidden work →', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Reveal the hidden work', exact: true })).toBeVisible()
  await context.close()
})
