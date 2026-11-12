import type { PublicProjection } from '../src/content/model'
import { publicStaticRoutes } from '../src/public-routes'
import { siteOrigin } from '../scripts/seo'

/** Keep private readings/assets inside auth. Public menus use real public
 * destinations; unknown draft paths stay private rather than leaking to a host. */
export function previewAttribute(attribute: string, path: string, scope: string, projection: PublicProjection) {
  const prefix = `/preview/${scope}`
  if (attribute === 'src') return `${prefix}${path}`
  if (path === '/' || path === '/investigations/') return `${prefix}/`
  const pathname = path.split(/[?#]/)[0]
  const selected = projection.entries.some(entry => entry.path === pathname) || projection.aliases.some(alias => alias.kind === 'path' && alias.path === pathname)
  if (selected) return `${prefix}${path}`
  if (path === '/#contact' || publicStaticRoutes.some(route => route !== '/' && route !== '/investigations/' && route === pathname)) return `${siteOrigin}${path}`
  return `${prefix}${path}`
}
