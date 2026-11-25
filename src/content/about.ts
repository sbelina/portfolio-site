/**
 * About-page positioning and the storm-workflow example (owner direction, 25 November 2026).
 * The owner wrote the supporting points to themself ("You don’t simply research…"); the site states them
 * in the first person. The storm workflow is reconstructed from the owner's account: the original was not
 * saved, and the time saved is the owner's estimate, not a measurement.
 */
export const researchPhilosophy = 'My work begins where existing explanations become insufficient. I investigate what prevailing assumptions, measurements, and systems may obscure, translating evidence into opportunities for more effective decisions, organizational change, and human flourishing.'

export const positioningPoints = [
  { term: 'What I investigate', detail: 'The relationships between organizational assumptions, information, human behavior, and operating conditions.' },
  { term: 'What I change', detail: 'How institutions interpret evidence, define problems, make decisions, and design their systems.' },
  { term: 'What institutions gain', detail: 'More accurate understanding, greater operational effectiveness, reduced organizational and human costs, and stronger capacity to adapt.' },
] as const

export const differentiator = { lead: 'I don’t simply research people within systems.', turn: 'I investigate and redesign the systems through which institutions understand people, interpret evidence, and act.' } as const

export const stormWorkflow = {
  title: 'An early example: the storm workflow',
  context: 'Before any of the case studies, I answered online-order chats for a consumer-technology company. One winter, the same question kept arriving: where is my package? The deliveries had one thing in common: a shipping hub hit by winter storms. I noticed the pattern, flagged it, and built a shared way to answer it.',
  steps: [
    { title: 'Recognize the reason for the chat', text: 'Identify that the customer is asking about a storm-affected delivery.' },
    { title: 'Research the order', text: 'Review it and connect it to the known shipping issue.' },
    { title: 'Set expectations', text: 'Explain the storm and the delay, and when to chat back in for advanced order support if it hasn’t arrived by the expected date.' },
    { title: 'Flag and note the shipment', text: 'Mark it as related to the issue and leave notes, so the next person sees the history.' },
  ],
  outcome: 'Team leadership distributed the workflow across the United States, Canada and beyond. By my estimate it cut the time of those chats by about a third.',
  label: 'FIG · Reconstructed from memory · the original wasn’t saved · the time saved is my estimate, not a measurement',
  why: 'It is the earliest version of a pattern in my later work: notice the condition that keeps coming back, then build the shared response once.',
} as const
