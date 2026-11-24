/**
 * The previous edition's homepage fragments, reviewed and mapped to current destinations when the public
 * archive was retired (owner decision, 23 November 2026). An old link such as /#claims-operations now
 * lands on the current page for the same thing, never on a retired build.
 */
const investigations = ['claims-operations', 'brand-research', 'enterprise-ai', 'civic-service', 'accessibility-ai'] as const
const writing = ['the-bends', 'calculus-of-syntax', 'conjunction-conjecture', 'tool-vs-toy', 'mundane-evidence', 'archive-wage', 'archive-dead-internet', 'archive-hive-mind', 'archive-mourning-coffee', 'archive-bridge', 'archive-left'] as const

export const legacyFragments: Readonly<Record<string, string>> = Object.freeze({
  ...Object.fromEntries(investigations.map(slug => [slug, `/investigations/${slug}/`])),
  'documentation-recovery': '/investigations/claims-operations/',
  ...Object.fromEntries(investigations.map(slug => [`distinction-${slug}`, '/patterns/'])),
  work: '/investigations/', 'work-title': '/investigations/', 'reading-gateway-title': '/investigations/',
  connections: '/patterns/', 'connections-title': '/patterns/', 'system-map': '/patterns/', 'map-text': '/patterns/', 'distinctions-title': '/patterns/',
  practice: '/practice/', 'practice-title': '/practice/', 'inquiry-title': '/practice/', 'study-label': '/practice/', 'practice-language': '/practice/', 'practice-form': '/practice/', 'delta-theory': '/practice/',
  'field-notes': '/writing/', 'field-notes-title': '/writing/', archive: '/writing/#earlier-work',
  ...Object.fromEntries(writing.map(id => [id, `/writing/#${id}`])),
  'closing-title': '/contact/',
})
