/** Portable content. No measurements or case evidence. */
export interface ProcessExperiment {
  schemaVersion: 1
  id: string
  title: string
  question: string
  provenance: { status: 'illustrative'; description: string; limitation: string }
  stages: { id: string; label: string }[]
  work: { id: string; stageId: string; label: string; meaning: 'unresolved' | 'friction' | 'learning'; explanation: string }[]
  relationships: { id: string; from: string; to: string; kind: 'clarification' | 'rework' | 'verification'; explanation: string }[]
}

export const hiddenWork: ProcessExperiment = {
  schemaVersion: 1,
  id: 'hidden-work-illustration-v1',
  title: 'Reveal the hidden work',
  question: 'What disappears when a process looks simple?',
  provenance: {
    status: 'illustrative',
    description: 'An invented request-and-review process, made for this interaction experiment. These are illustrative relationships, not observations from a real organization.',
    limitation: 'Sequence and placement are categorical. Lines do not measure time, effort, frequency, or causal strength. Revealing extra steps does not establish that any real process contains them.',
  },
  stages: [{ id: 'request', label: 'Request' }, { id: 'review', label: 'Review' }, { id: 'complete', label: 'Complete' }],
  work: [
    { id: 'clarify', stageId: 'request', label: 'Clarify the question', meaning: 'unresolved', explanation: 'In this illustration, someone must establish what the request is actually asking before it can move forward.' },
    { id: 'context', stageId: 'review', label: 'Find missing context', meaning: 'friction', explanation: 'The fictional review reveals missing context. Gathering it is work that the simple top-level label does not show.' },
    { id: 'return', stageId: 'review', label: 'Return for clarification', meaning: 'friction', explanation: 'The illustrative loop returns to the question. It shows rework, without assigning a duration or blaming the person doing it.' },
    { id: 'receipt', stageId: 'complete', label: 'Check what arrived', meaning: 'learning', explanation: 'Here, completion includes checking whether the next person received what they need. That check creates an opportunity to learn; no improved outcome is asserted.' },
  ],
  relationships: [
    { id: 'request-clarify', from: 'request', to: 'clarify', kind: 'clarification', explanation: 'The request label conceals the work of clarifying the question.' },
    { id: 'review-context', from: 'review', to: 'context', kind: 'clarification', explanation: 'The review label conceals the search for missing context.' },
    { id: 'context-return', from: 'context', to: 'return', kind: 'rework', explanation: 'Missing context leads to a return for clarification in this invented sequence.' },
    { id: 'return-clarify', from: 'return', to: 'clarify', kind: 'rework', explanation: 'The return reconnects the review to the original question. This is an illustrative loop, not a documented causal finding.' },
    { id: 'complete-receipt', from: 'complete', to: 'receipt', kind: 'verification', explanation: 'The complete label conceals a check on what the next person received.' },
  ],
}

/** Shared categorical coordinates for SVG and motion, not timing or identity. */
export function processGeometry(content: ProcessExperiment) {
  const nodes = new Map<string, { x: number; y: number }>()
  content.stages.forEach((stage, column) => {
    const x = (column + .5) * 800 / content.stages.length
    nodes.set(stage.id, { x, y: 45 })
    content.work.filter(item => item.stageId === stage.id).forEach((item, row) => nodes.set(item.id, { x, y: 150 + row * 95 }))
  })
  return content.relationships.map(relationship => ({ ...relationship, from: nodes.get(relationship.from)!, to: nodes.get(relationship.to)! }))
}
