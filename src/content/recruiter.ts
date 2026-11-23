/**
 * Capability-based identity, matching the owner's LinkedIn headline (19 November 2026)
 * so visitors arriving from LinkedIn or the résumé see the same terms. It describes the
 * work, not a formal employment title; formal titles stay with each investigation's role.
 */
export const professionalIdentity = 'Research & Innovation Strategist'
/** The LinkedIn headline's specialties, kept consistent across the homepage, title and metadata. */
export const practiceAreas = ['Applied research', 'Service design', 'Stakeholder engagement'] as const
/** The LinkedIn headline's tagline. */
export const tagline = 'Turning evidence into understanding, and understanding into new possibilities.'

/**
 * Homepage headline (owner decision, 23 November 2026): the final Trust deck's cover statement,
 * with "leaders" for "people" because anyone can be a leader. The accent word carries the turn.
 */
export const homeHeadline = { lead: 'I diagnose gaps in understanding and design the conditions that empower leaders to make ', accent: 'informed', end: ' decisions.' } as const
export const homeHeadlineText = `${homeHeadline.lead}${homeHeadline.accent}${homeHeadline.end}`

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
