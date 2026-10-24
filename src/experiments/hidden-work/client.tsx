import { StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HiddenWorkPage } from './HiddenWorkPage'
import '../../styles.css'
import '../../components/experiment-note.css'
import './hidden-work.css'

hydrateRoot(document.getElementById('root')!, <StrictMode><HiddenWorkPage/></StrictMode>)
