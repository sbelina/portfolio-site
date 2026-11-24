import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { FoundationPage, foundationPages, type FoundationKind } from './FoundationPage'
import './foundation.css'
import { initCounting } from '../analytics'

const root = document.getElementById('foundation-root')
const kind = root?.dataset.page
if (root && kind && Object.hasOwn(foundationPages, kind)) hydrateRoot(root, <FoundationPage kind={kind as FoundationKind}/> )

// Anonymous usage counts; see src/analytics.ts. Never runs off the live site.
initCounting()
