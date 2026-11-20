import { publicPath, publicBase } from '../src/public-path'
import { practiceAreas, professionalIdentity, recruiterContact, tagline } from '../src/content/recruiter'
/** Build-only metadata for the same public documents visitors can read. */
export const siteOrigin = 'https://producingcuriosity.com'
export const siteName = 'Producing Curiosity'
export const homeTitle = 'Sami Belina — Research & Innovation Strategist'
/** Kept under ~155 characters so search results show it whole. */
export const homeDescription = 'Sami Belina, research and innovation strategist: applied research, service design and stakeholder engagement that turns evidence into understanding.'
const imageAlt = 'Producing Curiosity by Sami Belina, Research & Innovation Strategist. I turn gaps in understanding into evidence leaders can act on. Test. Show. Enable.'
const personId = `${siteOrigin}/#sami-belina`
/**
 * Who the site is about, for search engines: name, the LinkedIn identity, the profile it
 * links to, and the areas of work. Only public, owner-supplied facts; no email address (spam)
 * and no employer, which stays unnamed in public copy.
 */
export const personSchema = {
  '@type': 'Person', '@id': personId, name: 'Sami Belina', url: `${siteOrigin}/`,
  jobTitle: professionalIdentity, description: tagline, sameAs: [recruiterContact.linkedin],
  knowsAbout: [...practiceAreas, 'Research strategy', 'Organizational effectiveness', 'Innovation strategy', 'Human systems research'],
}
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
    const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'WebSite', '@id': `${siteOrigin}/#website`, name: siteName, url: `${siteOrigin}/`, description: homeDescription, inLanguage: 'en', author: { '@id': personId }, publisher: { '@id': personId } },
      personSchema,
    ] }).replaceAll('<', '\\u003c')
    head.push(`<script type="application/ld+json">${json}</script>`)
  }
  return head.join('\n')
}
