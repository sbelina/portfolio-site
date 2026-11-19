/**
 * Capability-based identity (owner direction, 19 November 2026). It describes the work,
 * not a formal employment title; formal titles stay with each investigation's role.
 */
export const professionalIdentity = 'Applied Research & Innovation Strategist'
/** Recruiting terms kept consistent across the homepage, title and metadata. */
export const practiceAreas = ['Research strategy', 'Organizational effectiveness', 'Service design', 'Innovation'] as const

/** Public contact actions repeated on the homepage. */
export const recruiterContact = {
  email: 'hello@sbelina.com',
  linkedin: 'https://www.linkedin.com/in/transplantsam',
  /**
   * Owner-supplied, public-safe résumé (e.g. '/media/sami-belina-resume.pdf').
   * null hides the action: never link a résumé that has not been reviewed for public release.
   */
  resumeHref: null as string | null,
}
