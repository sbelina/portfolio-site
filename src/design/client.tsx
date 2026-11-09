import React from 'react'
import { hydrateRoot } from 'react-dom/client'
import { FoundationPage, foundationPages, type FoundationKind } from './FoundationPage'
import './foundation.css'

const root = document.getElementById('foundation-root')
const kind = root?.dataset.page
if (root && kind && Object.hasOwn(foundationPages, kind)) hydrateRoot(root, <FoundationPage kind={kind as FoundationKind}/> )
