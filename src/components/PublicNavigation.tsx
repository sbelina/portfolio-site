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
  { href: '/investigations/', label: 'Investigations' },
  { href: '/patterns/', label: 'Connections' },
  { href: '/practice/', label: 'Practice' },
  { href: '/#contact', label: 'Contact' },
] as const

/** Native links remain available without hydration, including on unavailable URLs. */
export function PublicNavigation({ currentPath, home = false, legacy = false }: { currentPath?: string; home?: boolean; legacy?: boolean }) {
  const historical = legacy || home
  const destinations = historical ? legacyDestinations : currentDestinations
  return <nav className="public-navigation" aria-label="Primary navigation">
    <ul>{destinations.map(({ href, label }) => <li key={href}>
      <a href={home && href.startsWith('/#') ? href.slice(1) : publicPath(href)} aria-current={!historical && href === currentPath ? 'page' : undefined}>{label}</a>
    </li>)}</ul>
  </nav>
}
