import { publicPath, publicBase } from '../src/public-path'
/** Build-only metadata for the same public documents visitors can read. */
export const siteOrigin = 'https://producingcuriosity.com'
export const siteName = 'Producing Curiosity'
export const homeTitle = 'Sami Belina — Applied Human Systems Research & Strategy'
export const homeDescription = 'Sami Belina investigates visible outcomes and unclear explanations through applied human systems research, organizational diagnosis and strategy. Test. Show. Enable.'
const imageAlt = 'Producing Curiosity by Sami Belina. Applied human systems research and strategy. Test. Show. Enable.'
export const escapeAttribute = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

export function seoHead({ title, description, route, indexable, website = false }: { title: string; description: string; route?: string; indexable: boolean; website?: boolean }) {
  if (route && (!route.startsWith('/') || route.startsWith('//'))) throw new Error('Canonical route must be a local absolute path')
  const canonical = route ? siteOrigin + publicPath(route) : undefined
  const meta = (name: string, value: string, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeAttribute(value)}" />`
  const head = [
    `<title>${escapeAttribute(title)}</title>`, meta('description', description),
    meta('robots', indexable && publicBase() === '/' ? 'index, follow' : 'noindex, follow'),
    ...(canonical ? [`<link rel="canonical" href="${escapeAttribute(canonical)}" />`, meta('og:url', canonical, true)] : []),
    meta('og:type', 'website', true), meta('og:site_name', siteName, true), meta('og:title', title, true), meta('og:description', description, true),
    meta('og:image', `${siteOrigin}/social-preview.png`, true), meta('og:image:width', '1200', true), meta('og:image:height', '630', true), meta('og:image:alt', imageAlt, true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', title), meta('twitter:description', description), meta('twitter:image', `${siteOrigin}/social-preview.png`), meta('twitter:image:alt', imageAlt),
  ]
  if (website) {
    const json = JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${siteOrigin}/#website`, name: siteName, url: `${siteOrigin}/`, description: homeDescription }).replaceAll('<', '\\u003c')
    head.push(`<script type="application/ld+json">${json}</script>`)
  }
  return head.join('\n')
}
