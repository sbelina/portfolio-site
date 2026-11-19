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
