/** Static destinations own their URLs before any authored slug or alias. */
export const publicStaticRoutes = ['/', '/investigations/', '/patterns/', '/practice/', '/system/', '/experiments/reveal-hidden-work/', '/lab/atlas/', '/lab/atlas/text/', '/lab/atlas/je-ne-sais-qua/'] as const

/** Paths on producingcuriosity.com served by a separate Worker (not this build): field notes come from the Thoughts Worker's zone route. */
export const externallyServedRoutes = ['/field-notes/'] as const
