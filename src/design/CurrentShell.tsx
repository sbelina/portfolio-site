import React, { type ReactNode } from 'react'
import { PublicNavigation } from '../components/PublicNavigation'
import { ExperimentNote } from '../components/ExperimentNote'
import { BuildArchiveLink } from '../components/BuildArchiveLink'
import { usePublicHeader } from '../components/usePublicHeader'
import { publicPath } from '../public-path'

/** Current-edition chrome; historical replay bytes never import this component. */
export function CurrentShell({ route, children, surface = 'paper', onSkipIntro }: { route: string; children: ReactNode; surface?: 'paper' | 'observatory'; onSkipIntro?: () => void }) {
  const { header, compactHeader, headerMeasured, oversizedHeader } = usePublicHeader()
  const mainId = route === '/' ? 'index' : 'content'
  return <div className="pc-site" data-surface={surface}>
    <a className="pc-skip" href={`#${mainId}`} onClick={onSkipIntro}>Skip to main content</a>
    <header ref={header} className="pc-header" data-compact={compactHeader} data-measured={headerMeasured} data-oversized={oversizedHeader}>
      <a className="pc-wordmark" href={publicPath('/')}><span aria-hidden="true">*</span> Producing Curiosity</a>
      <PublicNavigation currentPath={route}/>
    </header>
    <main id={mainId} className="pc-main" tabIndex={-1}>{children}</main>
    <footer className="pc-footer site-footer build-index-footer">
      <div className="pc-footer-line"><span>© {new Date().getFullYear()} Sami Belina</span><BuildArchiveLink/><a href={`#${mainId}`}>Back to top ↑</a></div>
      <ExperimentNote/>
    </footer>
  </div>
}
