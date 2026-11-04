import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'
import './build-index.css'
import { emptyHomeReading, type HomeReading } from './home-reading'

const root = document.getElementById('root')!
const reading: HomeReading = JSON.parse(document.getElementById('home-reading')?.textContent || JSON.stringify(emptyHomeReading))
// Fixtures retain the previous home for its regression suite; production uses the new index.
const page = reading.fixture
  ? React.createElement((await import('./App')).default, { reading })
  : React.createElement((await import('./BuildIndex')).default)
const application = <React.StrictMode>{page}</React.StrictMode>
if (root.dataset.prerendered === 'true') ReactDOM.hydrateRoot(root, application)
else ReactDOM.createRoot(root).render(application)
