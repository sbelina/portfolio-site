/**
 * Cases and working artifacts approved by the owner in November 2026 ("I approve: make sure we got it all
 * and go live"), drawn from the private evidence registry. Only items the registry marks publishable are
 * here. Withheld: the 88% timing and the eight-minutes-a-day estimate (no records yet), every exact figure
 * from the consumer-technology assignment (generalized
 * counts for Vote Huntsville (no single definition), original materials that still need co-founders' and
 * photographed people's permission, and every employer screenshot (never used).
 */
import type { Entry, Evidence } from '../../src/content/model'

const owner = '57690867-3e73-434c-93cd-8ed27c8c7674'
const reviewed = '2026-11-24T00:00:00Z'

const evidence = (id: string, subject: string): Evidence => ({
  schemaVersion: 1, id, revision: 1, visibility: 'public', reviewState: 'approved',
  title: `Project records and notes: ${subject}`,
  source: 'Sami Belina’s project records, notes and deliverables',
  locator: 'Employer and partner records are confidential',
  observedAt: reviewed, role: 'supports',
  limitations: 'Figures are as recorded or modeled, and labelled. Employer and partner records are confidential.',
  assetIds: [], rights: 'cleared', redaction: 'not-required', kind: 'observation',
})

export const newCaseEvidence = {
  friction: evidence('9afb5150-a45f-42fa-b169-a2debb79d020', 'operational automation'),
  binder: evidence('70945299-c9ac-4f09-bdc8-d73e68231d93', 'the training binder'),
  knowledge: evidence('234c7525-456e-4aa9-aae3-8e4bcda9a918', 'knowledge publishing and governance'),
} as const

const base = (id: string, slug: string) => ({
  schemaVersion: 1 as const, id, revision: 1, kind: 'investigation' as const, format: 'case' as const, slug,
  editorialState: 'approved' as const, visibility: 'public' as const, createdAt: reviewed, updatedAt: reviewed,
  authorIds: [owner], topicIds: [], blocks: [],
})

export const friction: Entry = {
  ...base('4b9bd07b-87ba-4040-a2d6-82f904b9d59a', 'operational-friction'),
  title: 'One shortcut replaced years of ==retyping==.',
  summary: 'Administrative work repeated the same entries, field by field, every day. I captured the work by hand, automated the repetitive parts with tools we already had, kept the security inputs and judgment calls with people, and shared the method until others adopted it.',
  contribution: 'I observed and decomposed the work, built the automation with existing tools, tested it, and trained and shared it. Four peers adopted the purchasing workflow; they, a supervisor and a manager adopted the text shortcuts.',
  evidenceIds: [newCaseEvidence.friction.id],
  investigation: {
    schemaVersion: 1, composition: 'revision',
    visual: { left: 'Typed by hand', right: 'Typed once', explanation: 'Repeating the same entry is a design problem, not a diligence problem.' },
    observedCondition: 'The same details were typed, field by field, many times a day: request letters, standard replies and the forms for purchasing police reports.',
    workingExplanation: 'My interpretation: the time went into **repetition the tools could carry**, not into the decisions that needed a person.',
    investigation: 'I captured my own desktop interactions by hand while doing the work, then split the police-report purchase into its steps: the request, the purchase, the claim note, the upload and closing the task. I timed the whole transaction, then tested the automated version across ten tasks.',
    relationshipDiscovered: '==Repetition ≠ judgment.== Most of each entry was **identical every time**; only the payment-security inputs and a few choices needed a person.',
    response: 'With text-expansion tools we already had, one shortcut now fills a form field by field. The two payment-security inputs and three dropdown choices stay with the person, and every form is reviewed before it is sent. I trained colleagues and shared the method with other administrative teams.',
    consequence: 'Four peers adopted the purchasing workflow. They, a supervisor and a manager adopted the text shortcuts. My own shortcut counter recorded **445,786 characters** I did not have to type.',
    differently: 'Keep the raw timings in one place from the first test, so the result can be shown with its evidence.',
    notOwned: 'I did not own the forms, the purchasing system or the security rules; the automation works within them. Adopting it was each person’s choice.',
    measurement: 'The character count is the shortcut tool’s own counter, for my use only. Hours of typing are a model, not measured time saved. The four working days a year are my estimate (about eight minutes a day × 250 days ÷ 8 hours), not a measurement. Task timings exist but are not yet compiled, so no percentage is shown.',
    limitations: 'Typing time is not freed working time: entering shortcuts, reviewing and keeping templates current are not subtracted. Sharing the method with teams in six states is dissemination, not adoption, and no savings are extrapolated.',
    brief: {
      tension: 'The same details were typed by hand, field by field, many times a day.',
      call: 'I decomposed the work, automated the repetitive entry with existing tools, kept security inputs and judgment calls with people, and shared the method.',
      result: 'Four peers adopted the purchasing workflow, six people use the shortcuts, and my counter recorded 445,786 characters not typed.',
      evidence: 'Hand-captured desktop interactions, a timed breakdown of the transaction, a ten-task test, and the shortcut tool’s counter.',
    },
    status: { kind: 'adopted', label: 'Adopted by peers and managers' },
    decision: {
      stakes: 'Time spent retyping the same entries is time not spent on the cases that need judgment, and every manual entry is a chance for a typo.',
      prevailing: 'Data entry takes as long as it takes; care means typing it yourself.',
      alternatives: [
        { option: 'Keep typing every field', status: 'not_chosen', note: 'The existing practice.' },
        { option: 'Buy new software', status: 'not_chosen', note: 'Not needed: the tools we had could expand text and move between fields.' },
        { option: 'Automate the repetition, keep judgment with people', status: 'chosen', note: 'Security inputs, dropdown choices and a final review stay manual.' },
      ],
      ownership: 'I built and shared the method. Each colleague chose whether to adopt it. The forms and security rules belong to others.',
      implementation: 'Four peers use the purchasing workflow; six colleagues use the shortcuts. The method was presented to administrative teams in six states.',
      implications: [
        { kind: 'resource', text: 'No added software cost: built with tools already in place.' },
        { kind: 'observed_change', text: 'Colleagues and two managers adopted the shortcuts.' },
        { kind: 'unproven', text: 'Time saved per task, error rates and savings across teams have not been measured.' },
      ],
    },
    method: {
      how: { tags: ['Hand-captured interactions', 'Task decomposition', 'Timed test', 'Tool counter'], note: 'I recorded my own steps, timed the whole transaction, then tested the automated version.' },
      when: { tags: ['Ongoing use', 'Counter over 2+ years'], note: 'The counter ran from my first shortcut onward.' },
      who: { tags: ['My own work', 'Four peers', 'A supervisor and a manager'], note: 'The counter covers my use only.' },
      learn: { tags: ['Descriptive', 'Model'], note: 'It can show what was repeated and how much I did not type. It cannot show time saved across the team.' },
    },
    figures: [
      { id: '443dbc7d-dfcc-4557-a723-b4737ab15d8c', value: '445,786', unit: 'characters not typed', label: 'My shortcut tool’s own counter, my use only', basis: 'platform_reported', qualifier: 'Counts characters the shortcuts filled in.', evidenceIds: [newCaseEvidence.friction.id] },
      { id: 'b85bffd5-fa2f-4c9b-acce-ddadf533e298', value: '~33', unit: 'hours of typing, modeled', label: 'Those characters at 45 words a minute (five characters a word)', basis: 'approximate', qualifier: 'Models typing time only.', evidenceIds: [newCaseEvidence.friction.id] },
      { id: 'a4b4c09c-8e4c-49da-943a-a44098b68b60', value: '~4', unit: 'working days a year', label: 'My estimate: about eight minutes a day, over a 250-day working year', basis: 'owner_estimate', qualifier: 'My own estimate of time saved, kept separate from the typing model.', evidenceIds: [newCaseEvidence.friction.id] },
      { id: '8487977d-e83b-4173-bb5a-8eb49f636a18', value: '4', unit: 'peers adopted the workflow', label: 'The police-report purchasing workflow', basis: 'owner_estimate', qualifier: 'Adoption as reported, counted apart from the shortcut adopters.', evidenceIds: [newCaseEvidence.friction.id] },
    ],
    artifacts: [
      {
        id: 'automation-framework', title: 'How the automation was found and kept honest',
        label: 'FIG · Retrospective synthesis · a model of the practice, not a historical protocol',
        steps: [
          { title: 'Observe', text: 'Captured my own desktop interactions by hand while doing the work.', by: 'me' },
          { title: 'Decompose', text: 'Split the purchase into request, purchase, claim note, upload and closing the task.', by: 'me' },
          { title: 'Quantify', text: 'Timed the whole transaction, then ten automated tasks.', by: 'me' },
          { title: 'Assess fit', text: 'Repetitive navigation and entry automated; payment-security inputs and dropdown choices kept with the person.', by: 'me' },
          { title: 'Redesign', text: 'Text expansion with field-to-field navigation, using tools already in place.', by: 'me' },
          { title: 'Validate', text: 'A comparative test across ten tasks. The timings are being compiled.', by: 'open' },
          { title: 'Transfer', text: 'Trained peers; shared with administrative teams in six states.', by: 'shared' },
        ],
        note: 'Validation can send the work back to observation when a step does not hold.',
      },
      {
        id: 'typing-model', title: 'Typing time, modeled at five speeds',
        label: 'FIG · Model, not measurement · 445,786 characters ÷ 5 characters a word ÷ typing speed ÷ 480 minutes a day',
        table: { columns: ['Typing speed', 'Eight-hour days', 'Hours'], rows: [
          ['40 words a minute', '4.64', '37.1'], ['45 words a minute', '4.13', '33.0'], ['50 words a minute', '3.71', '29.7'], ['60 words a minute', '3.10', '24.8'], ['70 words a minute', '2.65', '21.2'],
        ] },
        note: 'An earlier chart of mine divided characters by words a minute and overstated these about fivefold. These are corrected. Shortcut entry, review and template upkeep are not subtracted.',
      },
      {
        id: 'who-does-what', title: 'What the shortcut fills, and what stays with the person',
        label: 'FIG · Structure of the automation · categories, not the employer’s form',
        table: { columns: ['Part of the form', 'Handled by', 'Why'], rows: [
          ['Stable request details and standard notes', 'The shortcut', 'Identical every time'],
          ['Moving from field to field', 'The shortcut', 'The order never changes'],
          ['Two payment-security inputs', 'The person', 'A security requirement; never stored in a template'],
          ['Three dropdown choices, including the request type: priority delivery or an in-person office appointment', 'The person', 'A judgment for each case'],
          ['Review before sending', 'The person', 'Human verification kept'],
          ['Addresses', 'The shortcut', 'Prefilled by the automated template, so they are never retyped; the form’s own address check runs only on typed entries'],
        ] },
        note: 'Not claimed: a security audit, or fewer errors.',
      },
      {
        id: 'adoption-scopes', title: 'Who adopted it, and who saw it',
        label: 'FIG · Retrospective · adoption and dissemination kept apart',
        table: { columns: ['Scope', 'Who', 'What it shows'], rows: [
          ['The purchasing workflow', 'Four peers', 'Adoption, as reported'],
          ['The text shortcuts', 'Those four, a supervisor and a manager', 'Adoption, as reported'],
          ['Shown to other teams', 'Administrative teams in six states', 'Dissemination, not adoption'],
        ] },
      },
    ],
    statements: [
      { id: '0d81a740-76d4-4949-930c-05c90eb85c08', section: 'investigation', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [newCaseEvidence.friction.id], text: 'I captured my desktop interactions by hand and timed the whole purchasing transaction.', limitation: 'One person’s workflow; click counts from that analysis are not located.' },
      { id: '20a54ba7-af80-4dd7-a4a4-e00a316d3d95', section: 'consequence', kind: 'documented_outcome', contribution: 'implemented', evidenceIds: [newCaseEvidence.friction.id], text: 'Four peers adopted the purchasing workflow; they, a supervisor and a manager adopted the shortcuts.', limitation: 'Adoption as reported; how often each person uses it is not measured.' },
      { id: 'c79c010f-4a33-4680-8190-beadf61e4473', section: 'relationshipDiscovered', kind: 'practitioner_interpretation', contribution: 'identified', evidenceIds: [], text: 'Most of each entry was identical every time; the parts needing a person were few and identifiable.', limitation: 'An interpretation of one workflow.' },
    ],
  },
}

export const binder: Entry = {
  ...base('53b25756-4072-4d5d-a495-9b5173474084', 'knowledge-binder'),
  title: 'Six scattered sources became ==one== shared binder.',
  summary: 'New administrators learned the job from emails, printouts, training pages, spreadsheets and note templates, each holding part of the answer. I designed one organized binder from them, a single digital file the whole team shares; the team reviewed and keeps improving it, and every new administrative hire receives it.',
  contribution: 'I originated and designed the binder and synthesized the sources. The team reviewed it and keeps it current with me.',
  evidenceIds: [newCaseEvidence.binder.id],
  investigation: {
    schemaVersion: 1, composition: 'network',
    visual: { left: 'Scattered sources', right: 'One place to look', explanation: 'Having the knowledge is not the same as being able to find it.' },
    observedCondition: 'How to do the administrative work lived in **six kinds of source**: emails, printed legacy resources, internal training pages, documents, spreadsheets and claim-note templates.',
    workingExplanation: 'My interpretation: new people were not missing information; they were missing **one place to look**, organized the way the work arrives.',
    investigation: 'I gathered what I had been given and what colleagues used, and sorted it by the tasks it answered rather than where it came from.',
    relationshipDiscovered: '==Available ≠ findable.== The answers existed, but each question sent people to **several places**.',
    response: 'I designed a shared digital binder in nine sections that follow the work: incoming requests, documents, processes, assignments, supplies, support for new hires and events, plus office pages and frequently asked questions. The team reviewed it, then we revised it together.',
    consequence: 'It is **given to every new administrative hire**, and the team keeps it current.',
    differently: 'Date every page and record who owns it, so the binder shows what is current at a glance.',
    notOwned: 'The team reviews and improves it; it is a shared resource, not mine alone. The procedures it describes belong to the organization.',
    measurement: 'Nothing was measured. Seven new hires have received it; whether each used it, or learned faster, is not known.',
    limitations: 'Providing a resource is not proof it was used. The seven hires are a different group from the current team of seven, and the two are never combined.',
    brief: {
      tension: 'The job’s know-how was spread across emails, printouts, training pages, spreadsheets and templates.',
      call: 'I designed one shared digital binder organized by the tasks the work brings, and the team reviewed and revised it with me.',
      result: 'Every new administrative hire receives it, and the team keeps it current.',
      evidence: 'The sources I gathered, the binder’s structure, and the record of who has received it.',
    },
    status: { kind: 'in_use', label: 'Given to every new hire' },
    decision: {
      stakes: 'Each new person rebuilt the same knowledge from scattered sources, and each version could differ.',
      prevailing: 'The information is out there; new people will pick it up.',
      alternatives: [
        { option: 'Keep the sources where they were', status: 'not_chosen', note: 'Complete, but each question sent people to several places.' },
        { option: 'One shared digital binder organized by task, maintained by the team', status: 'chosen', note: 'Reviewed with the team and revised together.' },
      ],
      ownership: 'I designed it; the team reviews and maintains it with me.',
      implementation: 'Every new administrative hire receives the binder.',
      implications: [
        { kind: 'resource', text: 'One shared resource kept once, instead of each person keeping their own.' },
        { kind: 'unproven', text: 'Faster onboarding or fewer errors have not been measured.' },
      ],
    },
    figures: [
      { id: '26c97d33-c556-4cdd-aa53-8e3a6621b3a5', value: '7', unit: 'new hires have received it', label: 'Given to every new administrative hire', basis: 'owner_estimate', qualifier: 'Counts who received it; a different group from the current team of seven.', evidenceIds: [newCaseEvidence.binder.id] },
      { id: '9b500e03-5fe3-462b-9292-f9535cb822ee', value: '9', unit: 'sections', label: 'Organized by the tasks the work brings', basis: 'owner_estimate', qualifier: 'Describes the structure.', evidenceIds: [newCaseEvidence.binder.id] },
    ],
    artifacts: [
      {
        id: 'sources-to-binder', title: 'From six kinds of source to one shared digital binder',
        label: 'FIG · Retrospective model · source types from my account · structure only',
        steps: [
          { title: 'Six kinds of source', text: 'Emails, printed legacy resources, internal training pages, documents, spreadsheets and claim-note templates.', by: 'others' },
          { title: 'Synthesis', text: 'Sorted by the task each answers, not by where it came from.', by: 'me' },
          { title: 'One shared digital file, nine sections', text: 'Requests, documents, processes, assignments, supplies, new-hire support, events, office pages, questions.', by: 'me' },
          { title: 'Reviewed with the team', by: 'shared' },
          { title: 'Revised together, kept current', by: 'shared' },
          { title: 'Given at onboarding', text: 'To every new administrative hire.', by: 'others' },
        ],
      },
      {
        id: 'binder-record', title: 'What the record shows, and what it doesn’t',
        label: 'FIG · Retrospective · each record kept to its own scope',
        table: { columns: ['Record', 'What it shows', 'What it doesn’t'], rows: [
          ['I originated and designed it', 'Authorship of the structure', 'That the content is mine alone'],
          ['Seven new hires have received it', 'Distribution at onboarding', 'That each used it; faster onboarding'],
          ['A questions page dated early in its life', 'An early dated page', 'When the whole binder was created'],
          ['A current team of seven', 'Who maintains it now', 'Not the same people as the seven hires'],
        ] },
      },
    ],
    statements: [
      { id: 'd292284a-6f08-4f2c-9af5-4411a8b8479d', section: 'response', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [newCaseEvidence.binder.id], text: 'I originated and designed the binder from six kinds of source; the team reviewed and revised it with me.', limitation: 'A shared resource; content contributions are the team’s too.' },
      { id: '4c4660b3-ebc7-46f9-a03f-07b48cfb947c', section: 'consequence', kind: 'documented_outcome', contribution: 'observed_use', evidenceIds: [newCaseEvidence.binder.id], text: 'Every new administrative hire receives the binder; seven have so far.', limitation: 'Distribution, not use or effect.' },
    ],
  },
}

export const knowledge: Entry = {
  ...base('cab071fd-fbb8-4b7e-9a62-460d754a16da', 'knowledge-publishing'),
  title: 'A content library re-tagged for the people ==using== it.',
  summary: 'On a six-month assignment publishing sales learning content, I audited all of the team’s metadata tags and implemented the approved standard, designed the attributes for a worldwide audit of who the content represented, and led the next quarter’s learning collections for four audiences.',
  contribution: 'With colleagues I audited the content library; I audited the team’s tags and implemented the approved changes, developed the representation audit’s attributes, finalized and then developed quiz sets, and led the next quarter’s collections. The team approved changes and set audiences with me.',
  evidenceIds: [newCaseEvidence.knowledge.id],
  investigation: {
    schemaVersion: 1, composition: 'network',
    visual: { left: 'Tagged for publishing', right: 'Found and used', explanation: 'A library sorted for whoever publishes it is not yet sorted for whoever needs it.' },
    observedCondition: 'A large sales-learning library had grown by publishing habit: overlapping tags, outdated resources, and content that only some audiences could use.',
    workingExplanation: 'My interpretation: the library was organized for the people **publishing** it, not for the sellers **using** it or the reports judging it.',
    investigation: 'With two colleagues I audited the team’s library of digital sales resources. I audited **all** of the team’s metadata tags from a spreadsheet the team exported, condensing it into a reference. For a worldwide audit of customer scenarios, I pulled content by six tags, removed duplicates and developed the attributes the team would assess.',
    relationshipDiscovered: '==Published ≠ representative.== Few resources showed visible disabilities; nonvisible and cognitive disabilities were **not represented**; some combinations of people were missing from business scenarios.',
    response: 'I implemented the approved metadata changes and reconnected older content to the updated reporting categories. We retired outdated resources and created or updated what was missing. The next quarter, I was asked to lead the learning collections: I wrote the content, structured the collections, developed the quiz set and curated polls, in four versions for four kinds of partner.',
    consequence: 'The team **kept the condensed tag spreadsheet** as its reference, the representation findings were the task force’s to act on, a version of the registration flyer I revised with the team’s feedback shipped, and the four collections launched.',
    differently: 'Write down how each audit attribute was defined and check that two people rate it the same way.',
    notOwned: 'The team approved every metadata change and set audiences with me. The program, its partners and the task force’s conclusions belonged to others. It was a six-month assignment, not a permanent role.',
    measurement: 'Nothing here was measured as an outcome. Audit counts and program size are kept private and described in general terms.',
    limitations: 'Findings describe the assessed content only, while analysis was still under way. No codebook or reliability check exists. Program size is scope, not reach or learning.',
    brief: {
      tension: 'A large learning library had grown by publishing habit: overlapping tags, outdated resources, and gaps in who it represented.',
      call: 'I audited all of the team’s tags and implemented the approved standard, designed the representation audit’s attributes, and led the next quarter’s collections.',
      result: 'The team kept the tag reference, a revised registration flyer shipped, and four audience-specific collections launched.',
      evidence: 'The library audit with two colleagues, the tag export, the scenario audit I designed, and the published collections.',
    },
    status: { kind: 'adopted', label: 'Tag reference kept by the team' },
    decision: {
      stakes: 'Sellers searching a cluttered, unevenly tagged library could miss current material, and content that left people out would keep doing so.',
      prevailing: 'If it is published and tagged, people can find it, and it speaks to everyone.',
      alternatives: [
        { option: 'Keep tagging as before', status: 'not_chosen', note: 'Overlapping and ambiguous tags stayed in use.' },
        { option: 'One condensed tag reference, applied after approval', status: 'chosen', note: 'The team approved the changes; I implemented them.' },
        { option: 'Assess representation with defined attributes', status: 'chosen', note: 'I developed the attributes; the team assessed the content.' },
        { option: 'One collection for every partner', status: 'not_chosen', note: 'Partners’ needs differed, so the collection was built in four versions.' },
      ],
      ownership: 'The team approved metadata changes and owned the program. The task force owned the representation findings. I designed, audited, implemented and led the collections.',
      implementation: 'The tag reference became the team’s; older content was reconnected to updated reporting categories; four collections launched.',
      implications: [
        { kind: 'resource', text: 'One maintained tag reference instead of tags added by habit.' },
        { kind: 'observed_change', text: 'Outdated resources were retired and missing ones created or updated.' },
        { kind: 'unproven', text: 'Any effect on sellers’ search, learning or sales was not measured.' },
      ],
    },
    method: {
      how: { tags: ['Content audit', 'Metadata export', 'Attribute design', 'Assessment'], note: 'An audit with two colleagues, a full tag export, and a scenario audit with attributes I developed.' },
      when: { tags: ['Six-month assignment'], note: 'Audits first, then the next quarter’s collections.' },
      who: { tags: ['The content library', 'Customer scenarios', 'Partner audiences'], note: 'Content, not people, was assessed; no traits were inferred about real individuals.' },
      learn: { tags: ['Descriptive', 'Within the assessed scope'], note: 'It could show what the library held and lacked. It could not show effects on sellers.' },
    },
    artifacts: [
      {
        id: 'metadata-governance', title: 'From a tag inventory to a kept reference',
        label: 'FIG · Retrospective · the team’s tags, in general terms',
        intro: 'Two measurements, kept apart: **all** of the team’s tags were audited for the standard, and **six** were used to pull content for the representation audit.',
        steps: [
          { title: 'Inventory', text: 'The team exported every tag in use; I copied the spreadsheet to condense it.', by: 'shared' },
          { title: 'Audit', text: 'Duplicates, near-duplicates and ambiguous tags.', by: 'me' },
          { title: 'Approve', text: 'The team approved the changes.', by: 'others' },
          { title: 'Implement', text: 'I applied the approved changes and reconnected older content to the updated reporting categories.', by: 'me' },
          { title: 'Maintain', text: 'The team kept the condensed spreadsheet as its reference.', by: 'others' },
        ],
      },
      {
        id: 'legacy-mapping', title: 'Old tags to current categories, without losing history',
        label: 'FIG · Synthetic example · invented tags · shows the method, not the team’s classifications',
        table: { columns: ['Old tag', 'Problem', 'Current category', 'History kept by'], rows: [
          ['promo-fall', 'Season-specific; expires', 'Campaign → Seasonal', 'The old tag kept as an alias'],
          ['Promo_Fall, promo fall', 'Duplicate spellings', 'Merged into the line above', 'A merge log'],
          ['biz', 'Ambiguous: business customer or business use?', 'Audience → Business; Use → Work', 'The split noted in the reference'],
          ['new', 'Its meaning decays', 'Retired; replaced by a publish date', 'A retired-tag list'],
        ] },
      },
      {
        id: 'audit-instrument', title: 'Two audits, and what each asked',
        label: 'FIG · Retrospective · documented aims marked apart from criteria proposed now',
        table: { columns: ['Question', 'Audit', 'Status'], rows: [
          ['Is the same idea tagged the same way everywhere?', 'Metadata', 'Documented aim: a standard'],
          ['Does a tag feed a report someone uses?', 'Metadata', 'Documented aim: internal reporting'],
          ['Do two tags mean the same thing? Could one be read two ways?', 'Metadata', 'Proposed now'],
          ['What does the resource show or state about the people in it?', 'Representation', 'Documented: I developed the attributes'],
          ['Business or personal scenario?', 'Representation', 'Documented'],
          ['Who adds, retires and reviews tags?', 'Metadata', 'Proposed now'],
        ] },
        note: 'The representation audit rated only what a resource shows or states, never traits of real people, and allowed “can’t tell”.',
      },
      {
        id: 'quality-gate', title: 'The publishing quality gate',
        label: 'FIG · Retrospective · what I did, apart from what I’d add today',
        table: { columns: ['Step', 'My historical part', 'What I’d add today'], rows: [
          ['Content', 'Wrote copy, developed the quiz set, curated polls', '—'],
          ['Organization', 'Structured the collections', 'Name an owner for each collection'],
          ['Copy review', 'Worked the team’s checklist', 'A second reader for anything public'],
          ['Link check', 'Tested links and resources', 'An automated check before publishing'],
          ['Audiences', 'Set with the team', 'Preview as each audience'],
          ['Publication', 'Published resources; approval authority not established', 'Record who approved'],
          ['Testing', 'Tested every resource after publishing', 'Keep a test log'],
        ] },
      },
      {
        id: 'four-audiences', title: 'From finishing someone else’s quarter to leading the next',
        label: 'FIG · Retrospective · responsibilities compared · a six-month assignment, not a promotion',
        table: { columns: ['Responsibility', 'First two weeks', 'Next quarter'], rows: [
          ['Quizzes', 'Finalized the quizzes the previous participant drafted for the quarter under way', 'Developed the quiz set; curated polls'],
          ['Content', '—', 'Wrote it'],
          ['Structure', 'Organized resources into collections', 'Designed it, in four versions for four kinds of partner'],
          ['Audiences', 'Assisted', 'Set with the team'],
          ['Role', 'Supporting work in progress', 'Asked to lead the collections'],
        ] },
      },
      {
        id: 'facilitation', title: 'Facilitation and peer learning',
        label: 'FIG · Retrospective · no measured outcome',
        steps: [
          { title: 'Asked to lead it', text: 'A drawing activity for the enablement and field-marketing teams.', by: 'others' },
          { title: 'Prepared', text: 'A shared document, sent two weeks ahead.', by: 'me' },
          { title: 'Barrier', text: 'Not everyone could open it on their device.', by: 'others' },
          { title: 'Adapted', text: 'Built shapes in the app everyone had, so all could take part.', by: 'me' },
          { title: 'Peer learning', text: 'A daily channel where about eight of us on similar assignments shared what we were learning.', by: 'me' },
        ],
      },
    ],
    statements: [
      { id: 'bef352d9-fe79-4e5f-8d76-d7880de36e8c', section: 'investigation', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [newCaseEvidence.knowledge.id], text: 'I developed the attributes the team assessed in a worldwide audit of customer scenarios.', limitation: 'No codebook or reliability check; analysis was still under way.' },
      { id: '207f1c70-5ebf-46d1-bcfe-580d139a1c9b', section: 'response', kind: 'documented_outcome', contribution: 'implemented', evidenceIds: [newCaseEvidence.knowledge.id], text: 'I implemented the approved metadata changes; the team kept the condensed reference.', limitation: 'The team approved the changes.' },
      { id: '75855900-0a50-42f7-ae9a-09086a619e44', section: 'consequence', kind: 'documented_outcome', contribution: 'implemented', evidenceIds: [newCaseEvidence.knowledge.id], text: 'I was asked to lead the next quarter’s collections, built in four versions for four kinds of partner.', limitation: 'Program direction was not mine; scope is not reach.' },
    ],
  },
}

type Artifacts = NonNullable<NonNullable<Entry['investigation']>['artifacts']>

export const claimsArtifacts: Artifacts = [
  {
    id: 'knowledge-transfer', title: 'How the guide travelled',
    label: 'FIG · Retrospective trace · each step marked by who acted · a sequence, not proof of cause',
    steps: [
      { title: 'Exceptions traced case by case', text: 'Including payments already cashed when problems surfaced.', by: 'me' },
      { title: 'A guide built from administrators’ knowledge', text: 'I facilitated the sessions; the guide was a collective effort with fellow claims processors.', by: 'shared' },
      { title: 'Management endorsed it', text: 'Managers received it first and asked teams to review it.', by: 'others' },
      { title: 'Posted for everyone', text: 'A colleague posted it to the shared library.', by: 'others' },
      { title: 'The roadshow', text: 'I originated, organized and delivered presentations to other teams, including one a manager over two branches invited.', by: 'me' },
      { title: 'Onboarding, within weeks', text: 'I led the administrative part in my office until a reorganization moved it to my supervisor; I still present and answer questions.', by: 'shared' },
      { title: 'Two years on', text: 'Supervisors still share it across all four offices; opened 835 times by 113 people.', by: 'others' },
    ],
    note: 'Not claimed: statewide or continuous onboarding ownership, supervisory authority, or measured effects on rework or payment time. Views are access, not use.',
  },
  {
    id: 'three-resources', title: 'The guide, the roadshow and onboarding',
    label: 'FIG · Retrospective · the reach of one resource is never added to another',
    table: { columns: ['Resource', 'For', 'My part'], rows: [
      ['The guide', 'Anyone handling the paperwork: purpose, responsibilities, restrictions, errors and examples for each document', 'Facilitated the sessions it came from; a collective effort'],
      ['The roadshow', 'Other teams, with questions and answers', 'Originated, organized and delivered it'],
      ['Onboarding', 'New cohorts', 'Led it in my office at first; now support it'],
    ] },
  },
  {
    id: 'guide-structure', title: 'The guide’s structure, on an invented subject',
    label: 'FIG · Reconstruction of structure · a fictional, unregulated scenario · not the guide’s content',
    intro: 'The real guide covers state title paperwork and internal names. This keeps its architecture and invents the rest: lending field equipment.',
    table: { columns: ['Part', 'Example'], rows: [
      ['Purpose', 'Return loaned equipment so it can be reissued without a second trip.'],
      ['Who does what', 'The borrower returns the kit and form; the coordinator checks it is complete; the inventory lead decides whether it can be reissued.'],
      ['Restriction', 'A kit is not marked returned until the check is done. Delivery alone is not completion.'],
      ['Common error', 'A missing accessory: hold the return as incomplete, note what is missing and contact the borrower the same day.'],
      ['Worked example', 'A kit arrives without its charger; the coordinator logs “incomplete: charger” and checks it in when the charger arrives.'],
      ['Who decides', 'Only the inventory lead releases a kit for reissue.'],
    ] },
  },
]

export const trustArtifacts: Artifacts = [
  {
    id: 'two-measures', title: 'What each measure can and cannot support',
    label: 'FIG · Retrospective · item wording is a neutral example, not the instrument',
    table: { columns: ['Measure', 'Example item (invented)', 'Supports', 'Cannot support'], rows: [
      ['Agreement', '“The company is easy to reach.” Agree to disagree', 'Which attributes people accept as true', 'Whether the attribute matters to their trust'],
      ['Reported trust influence', '“How much does being easy to reach affect your trust?” None to a great deal', 'Which attributes people say shape trust', 'A causal effect on trust or behavior'],
      ['Not measured', '—', '—', 'Observed reliance or behavior'],
    ] },
  },
  {
    id: 'recommendations', title: 'What became of each recommendation',
    label: 'FIG · Retrospective register · unknown means not recorded, not rejected',
    table: { columns: ['Recommendation', 'Status'], rows: [
      ['Ask agreement and trust influence separately', 'Adopted in the fielded survey'],
      ['Include detractors as a distinct group', 'Not adopted'],
      ['Open with an open-ended question', 'Not recorded'],
      ['Split complex questions', 'Not recorded'],
      ['Repeat as a baseline', 'Not recorded'],
    ] },
    note: 'Fieldwork reached 800+ responses in nine days, ahead of the expected two weeks, and closed once the target was passed. The partner ran fieldwork, analysis and the report.',
  },
]

export const civicArtifacts: Artifacts = [
  {
    id: 'registration-paths', title: 'Two paths to the state’s registration service',
    label: 'FIG · Retrospective reconstruction · the destination is the state’s service, not Vote Huntsville’s',
    table: { columns: ['Step', 'On your own', 'With a volunteer'], rows: [
      ['Start', 'A shirt, flyer or yard sign with a QR code', 'A volunteer at an event or a home visit'],
      ['Device', 'Your own phone', 'Your phone or the volunteer’s'],
      ['Destination', 'The state’s official online application', 'The same official application'],
      ['Who submits', 'You', 'You, with help'],
    ] },
    note: 'Not claimed: a scan rate, registrations caused by the codes, or that every application started was completed.',
  },
  {
    id: 'grant-trace', title: 'The grant: what each source supports',
    label: 'FIG · Retrospective evidence synthesis · nothing here shows money moving to Vote Huntsville',
    table: { columns: ['Claim', 'Support', 'Status'], rows: [
      ['A $20,000 grant was awarded to United Women of Color', 'The funders’ public announcement', 'Public record'],
      ['Vote Gone Viral is United Women of Color’s program', 'Its own description', 'Public record'],
      ['Vote Huntsville took part in Vote Gone Viral', 'Local newspaper advertisements that season', 'Public record'],
      ['Offered the chance to co-sign, about two months after forming', 'My account, written the next year', 'Historical account'],
      ['Formal co-signatory status', '—', 'Agreement not in hand'],
      ['The local League of Women Voters took part', 'My account', 'Reported'],
      ['How the funds were allocated', '—', 'Unknown'],
    ] },
    note: 'Most of the people Vote Huntsville reached were reached before the award, without the partnership.',
  },
  {
    id: 'barriers', title: 'What residents ran into, and what we did',
    label: 'FIG · Retrospective synthesis · intended benefits, not measured effects',
    table: { columns: ['Barrier', 'Response', 'What the record shows'], rows: [
      ['Information scattered across offices', 'One local, plain-language answer source', 'Distributed; use not measured'],
      ['Hard to reach the official service', 'QR codes and direct links to the state’s application', 'No conversion data'],
      ['Unsure of procedures, such as absentee voting or restoring rights', 'Guides, a phone line and assisted help', 'Activity, not effect'],
      ['Little reliable candidate information', 'A candidate questionnaire, published', 'Done'],
      ['Getting to the polls', 'Rides coordinated', 'Activity, not effect'],
      ['Can’t navigate it alone', 'Volunteer-assisted registration and home visits', 'Assistance is not a completed registration'],
    ] },
  },
  {
    id: 'infrastructure', title: 'From a community effort to an operating organization',
    label: 'FIG · Retrospective · what I built, apart from what we did together',
    table: { columns: ['Infrastructure', 'Function', 'Who'], rows: [
      ['Identity and logo', 'Recognizable in public', 'Me'],
      ['Website', 'One place for voting information', 'Me'],
      ['Domain and email', 'The organization corresponds as itself', 'Me'],
      ['Social accounts and graphics', 'Reach people where they are', 'I set them up; content was shared'],
      ['Print: pamphlets, door hangers, business cards', 'Physical outreach', 'I designed them; distribution was shared'],
      ['Shirts with QR codes', 'Visible presence and a path to the state’s service', 'I designed them'],
      ['Vote Gone Viral', 'The campaign’s research, concept, logo, event banners and pamphlets', 'Me, for a partner’s campaign'],
      ['Partnerships', 'Coordination and resources', 'I developed some local ones; the grant partnership was the organization’s'],
      ['Volunteers, events, rides, registrations', 'Service', 'Everyone'],
    ] },
    note: 'Partners by kind: United Women of Color (operating partner; public grant recipient), the local League of Women Voters and Indivisible 5th District (networking and partnership; no grant role assumed).',
  },
]

export const accessibilityArtifacts: Artifacts = [
  {
    id: 'planned-executed', title: 'Planned, then what ran',
    label: 'FIG · Retrospective · from the pitch, my account and the team report',
    table: { columns: ['Element', 'Planned', 'What ran'], rows: [
      ['Question', 'Best practices for building accessible apps with AI models in one or a few attempts', 'The same, on one prototype'],
      ['Selection', 'A proposal', 'One of three chosen from seven'],
      ['Length', 'About half a day of building, demos and discussion', 'A day and a half'],
      ['Scope', 'Accessible apps from bounded prompting', 'A lightweight timer app with no database, which I chose to leave the leads time for their own builds'],
      ['Method', 'Bounded attempts', 'Mockups, a prepared specification, one generation prompt, then an agent loop of audit, review and revise'],
      ['Follow-up', 'A survey of the developers', 'Not sent; results were shared with stakeholders'],
      ['Share-out', '—', '21 attendees, including three IT managers'],
    ] },
  },
  {
    id: 'sketch-to-build', title: 'From the sketch to the build',
    label: 'FIG · Retrospective comparison · fidelity to the sketch, not usability',
    table: { columns: ['In the sketch', 'In the build'], rows: [
      ['A menu, top left', 'Present'],
      ['A light and dark mode toggle, top right', 'Present'],
      ['A label saying Focus or Break for the current mode', 'Present'],
      ['A pull-up drawer of earlier sessions', 'Present'],
    ] },
    note: 'One prototype. Matching the sketch says the prompt was followed, not that people could use it easily.',
  },
  {
    id: 'who-did-what', title: 'Who did what',
    label: 'FIG · Retrospective · the agent’s reports are not independent verification',
    table: { columns: ['Role', 'Me', 'Co-lead', 'The agent'], rows: [
      ['Originate the idea; write the pitch', 'Yes', 'Pitched and sponsored it', '—'],
      ['Facilitate', 'Yes', 'Covered during my office duties', '—'],
      ['Find the audit tool and research its integration', 'Jointly', 'Jointly', '—'],
      ['Automated audit and revision', '—', '—', 'Yes'],
      ['Human accessibility review after the build', '—', 'Yes', '—'],
      ['Assess the code against the build’s expectations', 'Defined the expectations', 'Requested it', '—'],
    ] },
    note: 'Not claimed: an unaided prompt (it had prepared context), standards certification (the standards were targets in the prompt), or approval and rollout from the share-out.',
  },
]
