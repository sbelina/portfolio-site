import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HiddenWorkPage } from './HiddenWorkPage'
import '../../styles.css'
import '../../components/experiment-note.css'
import './hidden-work.css'
import '../../design/foundation.css'
import { initCounting } from '../../analytics'

const root = document.getElementById('root')!
hydrateRoot(root, <StrictMode><HiddenWorkPage legacy={root.dataset.legacy === 'true'}/></StrictMode>)

// Anonymous usage counts; see src/analytics.ts. Never runs off the live site.
initCounting()
