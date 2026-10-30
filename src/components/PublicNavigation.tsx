import React from 'react'

const destinations = [
  { href: '/#work', label: 'Investigations' },
  { href: '/#connections', label: 'Connections' },
  { href: '/#practice', label: 'Method' },
  { href: '/#field-notes', label: 'Field notes' },
  { href: '/#contact', label: 'Contact' },
] as const

/** Native links remain available without hydration, including on unavailable URLs. */
export function PublicNavigation({ currentPath, home = false }: { currentPath?: string; home?: boolean }) {
  return <nav className="public-navigation" aria-label="Primary navigation">
    <ul>{destinations.map(({ href, label }) => <li key={href}>
      <a href={home && href.startsWith('/#') ? href.slice(1) : href} aria-current={href === currentPath ? 'page' : undefined}>{label}</a>
    </li>)}</ul>
  </nav>
}
