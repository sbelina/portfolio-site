/**
 * The career thread (owner direction, 24 November 2026): in place of a résumé on About and Contact, with a
 * link to request the full résumé. Each era is a turn: what I learned that changed what I did next.
 *
 * Organizations are not named. Each is described by what makes it recognizable in its own field, which
 * keeps the published case studies from being attributed to a named employer.
 *
 * Owner facts used: degree 2011–2016; early roles at a web-hosting company and others in 2012–2013, during
 * the degree; 2019–2022 consumer technology (from the owner's own summary: knowledge structures, publishing, customer-support friction, governance, resource usefulness); 2022–2026 enterprise insurance;
 * the "Next" line. Earlier roles and specifics added from the owner's résumés and answers, approved
 * November 2026 ("I approve"). Titles and figures the owner has not confirmed stay out.
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
    setting: 'A design degree (2011–2016), with roles at a web-hosting company serving small businesses (2012–2013), a summer camp (2015–2016), a web design firm (2017–2018) and an authorized device-repair provider (2018–2019)',
    turn: 'I learned that a working interface is not the same as a usable one.',
    parts: [
      { text: 'Consulted small-business owners on hosting, websites and being found in search' },
      { text: 'Designed a summer-long arts program for ages 4 to 17, and restored a kiln to teach ceramics' },
      { text: 'Introduced wireframes and mockups across a design department, and restructured how its work was filed' },
      { text: 'Handled the bulk of repairs during a battery-replacement program, as a front-line technical lead' },
      { text: 'Made accessibility part of the build, not a review at the end', proof: { label: 'AI-assisted development · accessibility evaluation', href: '/investigations/accessibility-ai/' } },
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
      { text: 'Spotted a recurring storm-delivery problem in support chats and built the workflow leadership shared across countries; by my estimate it cut those chats by about a third' },
      { text: 'Audited all of a team’s metadata tags and implemented the approved standard', proof: { label: 'Consumer technology · content governance & learning design', href: '/investigations/knowledge-publishing/' } },
      { text: 'Designed the attributes for a worldwide audit of who learning content represented', proof: { label: 'Consumer technology · content governance & learning design', href: '/investigations/knowledge-publishing/' } },
      { text: 'Led a quarter’s learning collections for four partner audiences, on a six-month assignment' },
      { text: 'Curated a Black History Month schedule of daily team presentations, and suggested the sign-language meeting room that became a regular gathering' },
    ],
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
      { text: 'Automated repetitive entry with tools we already had; peers and two managers adopted it', proof: { label: 'Insurance operations · operational automation', href: '/investigations/operational-friction/' } },
      { text: 'Designed the training binder every new administrator receives', proof: { label: 'Insurance operations · knowledge architecture', href: '/investigations/knowledge-binder/' } },
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
