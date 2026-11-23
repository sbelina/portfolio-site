import React from 'react'

/**
 * Verbal stress in text (owner direction, 23 November 2026). Case and page copy may mark three kinds of
 * spoken emphasis; nothing else is interpreted, and no HTML is ever passed through.
 *
 *   ==term==   the turn: the distinction a passage hinges on, in the accent colour (orange) and bold
 *   **term**   the finding: what a reader should retain, in bold
 *   *term*     a label people used, or a word stressed when spoken, in italics
 *
 * Underlines are reserved for links and are never used for emphasis.
 */
const pattern = /(==[^=\n]+==|\*\*[^*\n]+\*\*|\*[^*\n]+\*)/g

/** In headings, `heading` renders the turn as the headline accent (orange, headline weight) instead of bold. */
export function Stressed({ text, heading = false }: { text: string; heading?: boolean }) {
  const parts = text.split(pattern)
  return <>{parts.map((part, index) => {
    if (part.startsWith('==') && part.endsWith('==') && part.length > 4) return heading ? <em key={index} className="pc-accent">{part.slice(2, -2)}</em> : <strong key={index} className="pc-turn">{part.slice(2, -2)}</strong>
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) return <strong key={index}>{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) return <em key={index}>{part.slice(1, -1)}</em>
    return <React.Fragment key={index}>{part}</React.Fragment>
  })}</>
}

/** The same text with its stress marks removed, for titles, metadata, search and aria labels. */
export function plainText(text: string) {
  return text.replace(/==([^=\n]+)==/g, '$1').replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/\*([^*\n]+)\*/g, '$1')
}
