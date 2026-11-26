/**
 * Capability-based identity (owner decision, 23 November 2026; earlier the LinkedIn headline)
 * so visitors arriving from LinkedIn or the résumé see the same terms. It describes the
 * work, not a formal employment title; formal titles stay with each investigation's role.
 */
export const professionalIdentity = 'Applied Research & Systems Strategist'
/** The LinkedIn headline's specialties, kept consistent across the homepage, title and metadata. */
export const practiceAreas = ['Applied research', 'Service design', 'Stakeholder engagement'] as const
/** The line under the identity (owner decision, 23 November 2026). */
export const tagline = 'Increasing understanding, effectiveness, and adaptability in complex systems.'

/**
 * Homepage headline (owner decision, 23 November 2026, second decision that day): lead with the
 * institutional value. It supersedes "I diagnose gaps in understanding and design the conditions that
 * empower leaders to make informed decisions." The accent word carries the turn.
 */
/** Two emphases, two meanings (owner direction, 23 November): the cost to avoid in bold ink, the turn in orange. */
export const homeHeadline = { lead: 'I help organizations avoid ', cost: 'costly solutions', middle: ' to ', accent: 'misunderstood problems', end: '.' } as const
/** What the work makes possible for an institution: positioning, not a measured saving. */
export const valueLine = 'My work helps institutions determine what needs to change, what existing resources can accomplish, and where further investment is justified.'
export const possibilities = [
  { title: 'Better explanations', question: 'What is really causing the problem?' },
  { title: 'Better choices', question: 'Which response is justified?' },
  { title: 'Better implementation', question: 'How can the change work in practice?' },
] as const
/** What an organization gets from working with me: an offer, not a measured result. */
export const ctaOffer = [
  { title: 'A tested explanation', text: 'of what is driving the outcome, checked against the record.' },
  { title: 'A clear choice', text: 'of which responses the evidence supports, and which it does not.' },
  { title: 'A change people can carry', text: 'guides, training and decisions your team owns after I leave.' },
] as const
export const homeHeadlineText = `${homeHeadline.lead}${homeHeadline.cost}${homeHeadline.middle}${homeHeadline.accent}${homeHeadline.end}`

/** Public contact actions repeated on the homepage. */
export const recruiterContact = {
  email: 'hello@sbelina.com',
  linkedin: 'https://www.linkedin.com/in/transplantsam',
  /**
   * Owner-supplied, public-safe résumé (e.g. '/media/sami-belina-resume.pdf').
   * null hides the action: never link a résumé that has not been reviewed for public release.
   */
  resumeHref: null as string | null,
  /** The owner's portrait for About (and Contact): a public-safe, rights-cleared file in public/media. null hides it. */
  portrait: null as null | { src: string; alt: string; width: number; height: number },
}

/**
 * Engagement pathways (directive PC-2026-11-25): three visible ways in, each opening Contact with the
 * matching reason selected. Possibilities to discuss, not fixed offerings, prices or promised outcomes.
 */
export const engagementPaths = [
  { reason: 'employment', title: 'Employment and research leadership', text: 'A role or initiative where investigating the problem comes before choosing the fix.' },
  { reason: 'organization', title: 'An organizational challenge', text: 'A problem that keeps coming back, competing explanations, or a measure you no longer trust.' },
  { reason: 'research', title: 'Research, teaching or collaboration', text: 'A question worth investigating together, or a conversation to teach or speak.' },
] as const

/** Reasons for contact, with the prompt each one asks (Contact form). */
export const contactReasons = [
  { value: 'employment', label: 'Employment or leadership opportunity', prompt: 'Tell me about the role or initiative.' },
  { value: 'organization', label: 'Organizational inquiry', prompt: 'What is your organization trying to understand or change?' },
  { value: 'research', label: 'Research collaboration', prompt: 'What question or area of inquiry brings you here?' },
  { value: 'teaching', label: 'Teaching or speaking', prompt: 'What would you like to explore together?' },
  { value: 'other', label: 'Something else', prompt: 'What would you like to talk about?' },
] as const
