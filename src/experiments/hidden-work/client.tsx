import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HiddenWorkPage } from './HiddenWorkPage'
import '../../styles.css'
import '../../components/experiment-note.css'
import './hidden-work.css'
import '../../design/foundation.css'

const root = document.getElementById('root')!
hydrateRoot(root, <StrictMode><HiddenWorkPage legacy={root.dataset.legacy === 'true'}/></StrictMode>)
