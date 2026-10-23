import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import { emptyHomeReading, type HomeReading } from './home-reading'

const root = document.getElementById('root')!
const reading: HomeReading = JSON.parse(document.getElementById('home-reading')?.textContent || JSON.stringify(emptyHomeReading))
const application = (
  <React.StrictMode>
    <App reading={reading} />
  </React.StrictMode>
)
if (root.dataset.prerendered === 'true') ReactDOM.hydrateRoot(root, application)
else ReactDOM.createRoot(root).render(application)
