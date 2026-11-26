/**
 * Search titles and descriptions for case studies.
 * The page keeps its editorial headline; search results get a plain title that names the kind of
 * work, and a description short enough (≤155 characters) to show whole. Claims match the case text.
 */
export const caseSearch: Readonly<Record<string, { title: string; description: string }>> = {
  'claims-operations': { title: 'Insurance process redesign: verify before paying', description: 'A process and service design case study: tracing why claims were paid before paperwork was verified, and moving the check earlier. Guide still in use.' },
  'brand-research': { title: 'Trust research: measuring agreement and influence apart', description: 'A survey and measurement design case study: separating agreement from trust influence in 800+ responses, still cited in strategy a year later.' },
  'enterprise-ai': { title: 'Enterprise AI synthesis: 38 proposals, 8 challenges', description: 'An opportunity synthesis and facilitation case study: grouping 38 AI proposals into eight shared challenge areas for an innovation sprint.' },
  telematics: { title: 'Usability research: recovering findings without audio', description: 'A usability research case study: recovering usability findings from sessions whose audio failed, and what the evidence could support.' },
  'civic-service': { title: 'Civic service design: voting information by step', description: 'A service and content design case study from Vote Huntsville: one plain-language answer source organized around residents’ questions.' },
  'accessibility-ai': { title: 'AI-assisted development and accessibility evaluation', description: 'An experiment pairing a coding agent with an accessibility agent and human review: what automated checks settled, and what they did not.' },
  'operational-friction': { title: 'Operational automation: removing repetitive data entry', description: 'An operational automation case study: automating repetitive entry with existing tools while keeping security inputs and judgment with people.' },
  'knowledge-binder': { title: 'Knowledge management: one shared training binder', description: 'A knowledge architecture case study: turning six kinds of scattered source into one shared digital binder every new administrator receives.' },
  'knowledge-publishing': { title: 'Content governance, metadata and learning design', description: 'A content governance case study: auditing a team’s metadata tags, designing a representation audit, and leading learning collections for four audiences.' },
}
