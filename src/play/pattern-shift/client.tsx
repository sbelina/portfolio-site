import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PatternShiftGame } from './PatternShiftGame'
import '../../design/tokens.css'
import './pattern-shift.css'

const mount = document.getElementById('pattern-shift-game')
if (mount) {
  try {
    mount.replaceChildren()
    createRoot(mount).render(<StrictMode><PatternShiftGame/></StrictMode>)
  } catch {
    mount.innerHTML = '<p class="ps-fallback">The game could not start in this browser. How it works is described below.</p>'
  }
}
