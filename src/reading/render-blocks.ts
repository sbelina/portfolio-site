// Build-only Markdown rendering; never import this module into a browser entry.
import { marked } from 'marked'
import sanitizeHtml from 'sanitize-html'
import type { PublicProjection } from '../content/projection'

export function renderBlocks(projection: PublicProjection): Record<string, string> {
  const output: Record<string, string> = {}
  for (const entry of projection.entries) {
    for (const block of entry.blocks) {
      if (block.type !== 'prose' && block.type !== 'callout') continue
      output[block.id] = sanitizeHtml(marked.parse(block.markdown, { async: false }), {
        allowedTags: ['p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote', 'code', 'pre', 'a', 'br'],
        allowedAttributes: { a: ['href', 'title'] },
        allowedSchemes: ['https', 'http', 'mailto'],
        allowProtocolRelative: false,
      })
    }
  }
  return output
}
