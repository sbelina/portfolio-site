import { hydrateRoot } from 'react-dom/client'
import { ReadingPage, type ReadingPageData } from './ReadingPage'
import './reading.css'

const root = document.getElementById('reading-root')
const bootstrap = document.getElementById('reading-data')

if (root && bootstrap?.textContent) {
  try {
    const page = JSON.parse(bootstrap.textContent) as ReadingPageData
    hydrateRoot(root, <ReadingPage page={page} />)
    // Native document navigation supplies history and scroll restoration. Do not
    // move focus/scroll during Back/Forward or a direct section link.
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (navigation?.type === 'navigate' && !location.hash) {
      document.getElementById('reading-main')?.focus({ preventScroll: true })
    }
  } catch {
    // The initial HTML is already readable; a malformed enhancement payload must
    // not replace it with an empty client application or a failed loading state.
  }
}
