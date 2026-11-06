import React from 'react'

/** Avoid font-dependent diagonal arrow glyphs in external destination labels. */
export function ExternalArrow() {
  return <svg className="pc-external-arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M3 13L13 3M4 3H13V12"/></svg>
}
