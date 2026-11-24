/**
 * The career thread (owner direction, 24 November 2026): in place of a résumé on About and Contact, with a
 * link to request the full résumé. Each era is a turn: what I learned that changed what I did next.
 *
 * Organizations are not named. Each is described by what makes it recognizable in its own field, which
 * keeps the published case studies from being attributed to a named employer.
 *
 * Owner facts used: degree 2011–2016; early roles at a web-hosting company and others in 2012–2013, during
 * the degree; 2019–2022 consumer technology (owner is writing that context); 2022–2026 enterprise insurance;
 * the "Next" line. Wording in ownership terms was drafted for owner review and is not yet approved.
 */
export type Proof = { label: string; href: string }
export type Era = {
  id: string
  years: string
  /** The era's exact label, and its plain subtitle. */
  title: string
  subtitle: string
  /** The organization, described rather than named. */
  setting: string
  /** The turn: what I learned that changed what I did next. */
  turn: string
  /** What I owned, in active verbs. Each part links to proof already on the site, where proof exists. */
  parts: { text: string; proof?: Proof }[]
  /** True while the owner is still writing this era's context. */
  pending?: boolean
}

export const careerEras: readonly Era[] = [
  {
    id: 'foundations',
    years: '2011–2019',
    title: 'Foundations',
    subtitle: 'Design, code and access',
    setting: 'A degree (2011–2016), with early roles in 2012–2013 at one of the largest web-hosting and domain companies serving small businesses, and others',
    turn: 'I learned that a working interface is not the same as a usable one.',
    parts: [
      { text: 'Designed and built interfaces, and structured the information behind them' },
      { text: 'Made accessibility part of the build, not a review at the end', proof: { label: 'AI-assisted development · accessibility evaluation', href: '/investigations/accessibility-ai/' } },
      { text: 'Solved technical problems end to end' },
    ],
  },
  {
    id: 'information-systems',
    years: '2019–2022',
    title: 'Information systems',
    subtitle: 'Knowledge that has to travel',
    setting: 'A global consumer-technology company known for its devices and its support experience',
    turn: 'I learned that support friction starts in how knowledge is structured, not where customers ask.',
    parts: [
      { text: 'Structured knowledge and ran how it was published' },
      { text: 'Traced customer-support friction back to the resources behind it' },
      { text: 'Set governance for what was kept, changed and retired, judged by whether a resource was actually useful' },
    ],
    pending: true,
  },
  {
    id: 'enterprise-investigation',
    years: '2022–2026',
    title: 'Enterprise investigation',
    subtitle: 'Explanations that cost money',
    setting: 'One of the largest U.S. auto insurers, known for usage-based pricing',
    turn: 'I learned that the costliest problems were not unsolved. They were explained wrong.',
    parts: [
      { text: 'Diagnosed operational failures without an assignment, and moved where verification happens', proof: { label: 'Insurance operations · process & service design', href: '/investigations/claims-operations/' } },
      { text: 'Designed survey measures that kept agreement and trust influence apart', proof: { label: 'Customer research · survey & measurement design', href: '/investigations/brand-research/' } },
      { text: 'Recovered usability findings when the session audio failed', proof: { label: 'Product research · usability research', href: '/investigations/telematics/' } },
      { text: 'Led the synthesis of 38 AI proposals into 8 shared challenge areas, and coached in the sprint', proof: { label: 'Enterprise innovation · opportunity synthesis', href: '/investigations/enterprise-ai/' } },
      { text: 'Originated an AI-assisted development experiment, and evaluated what automated checks miss', proof: { label: 'AI-assisted development · accessibility evaluation', href: '/investigations/accessibility-ai/' } },
      { text: 'Took part in strategic foresight work' },
    ],
  },
] as const

/** Alongside the eras, without dates: volunteer work that is itself a published case study. */
export const alongside = { text: 'Co-founded Vote Huntsville, a volunteer civic-information effort', proof: { label: 'Civic engagement · service & content design', href: '/investigations/civic-service/' } } as const

/** The next step is the signal, and the call to action. */
export const careerNext = {
  title: 'Next',
  subtitle: 'Systems strategy, before the fix',
  turn: 'Now I want to be in the room before the decision, not after it.',
  text: 'Investigating the assumptions and mechanisms shaping institutional outcomes, developing alternatives, and helping decision-makers change how systems work.',
  ask: 'Bring me the problem your organization keeps paying to fix.',
} as const
