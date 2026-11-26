import { publicPath, publicBase } from '../src/public-path'
import { practiceAreas, professionalIdentity, recruiterContact, tagline } from '../src/content/recruiter'
import { differentiator } from '../src/content/about'
/** Build-only metadata for the same public documents visitors can read. */
export const siteOrigin = 'https://producingcuriosity.com'
export const siteName = 'Producing Curiosity'
export const homeTitle = `Sami Belina — ${professionalIdentity}`
/** Kept under ~155 characters so search results show it whole. */
export const homeDescription = 'Sami Belina, applied research and systems strategist: I help organizations avoid costly solutions to misunderstood problems.'
const imageAlt = 'Producing Curiosity by Sami Belina, Applied Research & Systems Strategist. I help organizations avoid costly solutions to misunderstood problems. Test. Show. Enable.'
const personId = `${siteOrigin}/#sami-belina`
/**
 * Who the site is about, for search engines: name, the LinkedIn identity, the profile it
 * links to, and the areas of work. Only public, owner-supplied facts; no email address (spam)
 * and no employer, which stays unnamed in public copy.
 */
export const personSchema = {
  '@type': 'Person', '@id': personId, name: 'Sami Belina', url: `${siteOrigin}/`,
  jobTitle: professionalIdentity, description: tagline, disambiguatingDescription: `${differentiator.lead} ${differentiator.turn}`, sameAs: [recruiterContact.linkedin],
  knowsAbout: [...practiceAreas, 'Research strategy', 'Organizational effectiveness', 'Innovation strategy', 'Human systems research', 'Process improvement', 'Knowledge management', 'Survey and measurement design', 'Information architecture', 'Content governance'],
}
export const escapeAttribute = (text: string) => text.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')

/** Structured data for one page: the person and site are referenced by @id, so every page joins one graph. */
export type JsonLd = Record<string, unknown>

export function seoHead({ title, description, route, indexable, website = false, jsonLd = [], image }: { title: string; description: string; route?: string; indexable: boolean; website?: boolean; jsonLd?: JsonLd[]; image?: { path: string; alt: string } }) {
  if (route && (!route.startsWith('/') || route.startsWith('//'))) throw new Error('Canonical route must be a local absolute path')
  const canonical = route ? siteOrigin + publicPath(route) : undefined
  const meta = (name: string, value: string, property = false) => `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeAttribute(value)}" />`
  const head = [
    `<title>${escapeAttribute(title)}</title>`, meta('description', description),
    meta('robots', indexable && publicBase() === '/' ? 'index, follow' : 'noindex, follow'),
    ...(canonical ? [`<link rel="canonical" href="${escapeAttribute(canonical)}" />`, meta('og:url', canonical, true)] : []),
    meta('og:type', 'website', true), meta('og:site_name', siteName, true), meta('og:title', title, true), meta('og:description', description, true),
    meta('og:image', `${siteOrigin}${image?.path ?? '/social-preview.png'}`, true), meta('og:image:width', '1200', true), meta('og:image:height', '630', true), meta('og:image:alt', image?.alt ?? imageAlt, true),
    meta('twitter:card', 'summary_large_image'), meta('twitter:title', title), meta('twitter:description', description), meta('twitter:image', `${siteOrigin}${image?.path ?? '/social-preview.png'}`), meta('twitter:image:alt', image?.alt ?? imageAlt),
  ]
  if (website) {
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebSite', '@id': `${siteOrigin}/#website`, name: siteName, url: `${siteOrigin}/`, description: homeDescription, inLanguage: 'en', author: { '@id': personId }, publisher: { '@id': personId } },
      personSchema,
    ] }).replaceAll('<', '\\u003c')
    head.push(`<script type="application/ld+json">${json}</script>`)
  } else if (indexable && jsonLd.length) {
    head.push(`<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': jsonLd }).replaceAll('<', '\\u003c')}</script>`)
  }
  return head.join('\n')
}

export const personRef = { '@id': personId }
export const websiteRef = { '@id': `${siteOrigin}/#website` }
/** Home › section › page, as search engines show it. */
export const breadcrumbs = (items: { name: string; path: string }[]): JsonLd => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: siteOrigin + publicPath(item.path) })),
})
