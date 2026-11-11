import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { EdgeCaseGame } from './EdgeCaseGame'
import { prepareDownloads } from './records'
import '../../design/tokens.css'
import './edge-case.css'

prepareDownloads()
const mount = document.getElementById('edge-case-game')
if (mount) {
  try {
    mount.replaceChildren()
    createRoot(mount).render(<StrictMode><EdgeCaseGame/></StrictMode>)
  } catch {
    mount.innerHTML = '<p class="ps-fallback">The game could not start in this browser. How it works is described below.</p>'
  }
}
