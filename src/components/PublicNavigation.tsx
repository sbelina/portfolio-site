import { publicPath } from '../public-path'
import React from 'react'

const legacyDestinations = [
  { href: '/#work', label: 'Investigations' },
  { href: '/#connections', label: 'Connections' },
  { href: '/#practice', label: 'Method' },
  { href: '/#field-notes', label: 'Field notes' },
  { href: '/#contact', label: 'Contact' },
] as const
const currentDestinations = [
  { href: '/investigations/', label: 'Work' },
  { href: '/practice/', label: 'Practice' },
  { href: '/writing/', label: 'Field Notes' },
  { href: '/lab/', label: 'Observatory' },
  { href: '/#contact', label: 'Contact' },
] as const

/** Pages that belong to the Observatory section; its menu link marks them aria-current="true". */
export const observatoryMembers = ['/lab/atlas/', '/lab/atlas/text/', '/lab/atlas/je-ne-sais-qua/', '/lab/edge-case/', '/experiments/reveal-hidden-work/'] as const
const currentState = (href: string, currentPath?: string) => href === currentPath ? 'page' as const
  : href === '/lab/' && currentPath && (observatoryMembers as readonly string[]).includes(currentPath) ? 'true' as const
  // Connections belongs to Practice in the menu (23 November): five items, no Connections link of its own.
  : href === '/practice/' && currentPath === '/patterns/' ? 'true' as const : undefined

/** Native links remain available without hydration, including on unavailable URLs. */
export function PublicNavigation({ currentPath, home = false, legacy = false }: { currentPath?: string; home?: boolean; legacy?: boolean }) {
  const historical = legacy || home
  const destinations = historical ? legacyDestinations : currentDestinations
  return <nav className="public-navigation" aria-label="Primary navigation">
    <ul>{destinations.map(({ href, label }) => <li key={href}>
      <a href={home && href.startsWith('/#') ? href.slice(1) : publicPath(href)} aria-label={href === '/lab/' ? 'Observatory — experimental' : undefined} aria-current={historical ? undefined : currentState(href, currentPath)}>{label}{href === '/lab/' ? <span aria-hidden="true">*</span> : null}</a>
    </li>)}</ul>
  </nav>
}
