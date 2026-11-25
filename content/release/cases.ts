/**
 * The public versions of six investigations (owner direction, 23 November 2026): each pairs with a
 * password-protected deep dive at /deep-dive/<slug>/. These records become public only through the
 * trusted release loader (scripts/release.ts) and the approval in content/public-release.json, which
 * binds the exact digest of every record. Changing any word here changes its digest and stops the build
 * until the release is prepared and approved again.
 *
 * Evidence: every factual statement and figure cites the owner's project records and account. Client and
 * partner records stay confidential. Owner direction, 23 November: say so once per case, not on every item.
 */
import type { ContentStore, Entry, Evidence } from '../../src/content/model'
import { claimsCandidate } from '../candidates/claims-operations'
import { accessibilityArtifacts, binder, civicArtifacts, claimsArtifacts, friction, knowledge, newCaseEvidence, trustArtifacts } from './cases-nov24'

const owner = '57690867-3e73-434c-93cd-8ed27c8c7674'
const reviewed = '2026-11-23T00:00:00Z'

const evidence = (id: string, subject: string): Evidence => ({
  schemaVersion: 1, id, revision: 1, visibility: 'public', reviewState: 'approved',
  title: `Project records and notes: ${subject}`,
  source: 'Sami Belina’s project records, notes and deliverables',
  locator: 'Client and partner records are confidential',
  observedAt: reviewed, role: 'supports',
  limitations: 'Figures are rounded. Client and partner records are confidential.',
  assetIds: [], rights: 'cleared', redaction: 'not-required', kind: 'observation',
})

export const caseEvidence = {
  claims: evidence('bbe7912c-5fab-4fee-8491-ad17b75ecaa6', 'claims operations'),
  trust: evidence('226615be-b54f-4f3a-a3f9-61ceb2ff09b6', 'trust research'),
  ai: evidence('e9018f2c-bb53-48b8-9ed0-1d899606427f', 'the enterprise AI challenge'),
  telematics: evidence('61b0ec9b-4905-4e9b-8924-a6f57bd48e1f', 'usage-based insurance research'),
  civic: evidence('5d9df463-5711-470d-94a1-839960a22ce4', 'Vote Huntsville'),
  accessibility: evidence('3d35db3f-f6f1-4d54-8eae-bacc1b78d0ab', 'the AI and accessibility experiment'),
} as const

const base = (id: string, slug: string, createdAt: string) => ({
  schemaVersion: 1 as const, id, revision: 1, kind: 'investigation' as const, format: 'case' as const, slug,
  editorialState: 'approved' as const, visibility: 'public' as const, createdAt, updatedAt: reviewed,
  authorIds: [owner], topicIds: [], blocks: [],
})

/** Limitations for the inherited Claims statements, now that the owner's account is the attached evidence. */
const claimsLimitations: Record<string, string> = {
  'ed50dcf8-47c0-4ddd-af83-b910c458ad12': 'Describes the earlier process, not every claim.',
  '3fb07550-5e1f-4326-b8dd-b01b62502d25': 'A ranking from the error log review, not a measured frequency.',
  '9fa22fd6-7311-4b3f-b078-159e33f558a2': 'Leadership made the decision; who decides sufficiency and who releases payment did not change.',
  'df37a6b3-f276-4fc5-81b5-026de7435747': 'Taking part is not evidence of learning.',
  '41e8eff7-7faa-4350-8ba8-827721641966': 'The reach of one resource is never combined with another.',
  '22229e3b-c7e6-4193-8855-b09427098bdd': 'Use is not effectiveness.',
}

// Claims: revision 3 of the reviewed candidate, with the owner's 23 November answers and the decision layer.
const claimsInvestigation = claimsCandidate.investigation!
const claims: Entry = {
  ...claimsCandidate,
  revision: 3,
  title: '“Complete” now means ==verified==.',
  editorialState: 'approved', visibility: 'public', authorIds: [owner], updatedAt: reviewed,
  summary: 'Total-loss claims could be paid *before* anyone confirmed the paperwork was sufficient. I traced where problems surfaced, **leadership moved the check before payment**, and the guide we built from administrators’ knowledge is still in use in all four offices.',
  evidenceIds: [caseEvidence.claims.id],
  blocks: [],
  internalNotes: undefined,
  investigation: {
    ...claimsInvestigation,
    relationshipDiscovered: '==Delivered ≠ verified.== The status the system reported and the state the next step depended on were *related but not equivalent*. The gap was a question of **when sufficiency was checked**, not who had authority.',
    consequence: '“Complete” now means *verified*: adjusters check the paperwork before paying, and the salvage partner still decides whether it is sufficient, so **problems are found before a claim looks finished** rather than after it closes. The guide, built collectively by the claims processors from administrators’ knowledge, joined new-cohort onboarding within weeks of being shared. More than two years later, supervisors still share it across all four offices.',
    brief: { ...claimsInvestigation.brief!, result: 'Payment now waits for verification, so problems are found before a claim looks finished. The guide joined new-hire onboarding within weeks and, 2+ years on, supervisors still share it across all four offices.', evidence: 'My four-month exception log, walk-throughs with adjusters, administrative staff and the salvage partner, and administrator knowledge sessions.' },
    status: { kind: 'in_use', label: 'In use 2+ years' },
    figures: claimsInvestigation.figures!.map(figure => ({
      ...figure,
      evidenceIds: [caseEvidence.claims.id],
      ...(figure.id === 'fc27c92c-bd02-4066-b346-5bd85ccc12cc' ? { unit: 'years in use across four offices', label: 'The guide, still shared by supervisors', qualifier: 'Distribution and continued use, not measured effectiveness.' } : {}),
    })),
    decision: {
      stakes: 'Total-loss claims could be paid before the paperwork was confirmed sufficient. Defects came back afterwards as rework for customers and staff, on claims that already looked finished, when they were harder to fix.',
      prevailing: 'The errors read as a customer problem: people filling in title and transfer paperwork wrongly.',
      alternatives: [
        { option: 'Keep the order and correct defects after payment', status: 'not_chosen', note: 'The existing process. Problems surfaced at salvage review, sometimes after the claim had closed.' },
        { option: 'Verify the paperwork before payment', status: 'chosen', note: 'I recommended it and leadership chose it. Adjusters check a photo of the paperwork before paying, and the salvage partner is asked when something is uncertain.' },
        { option: 'Make administrators’ knowledge teachable', status: 'chosen', note: 'A parallel response: a guide, support training and onboarding, so fewer problems start.' },
      ],
      ownership: 'Management made the decision. The salvage partner still decides whether paperwork is sufficient, and adjusters release payment. I built the evidence and made the case, facilitated the knowledge sessions, and originated, organized and delivered the roadshow that took the guide to other teams. The guide itself was a collective effort with fellow claims processors.',
      implementation: 'Adjusters verify the paperwork before payment. After management endorsed the guide, it joined new-cohort onboarding within weeks. I led the administrative part of onboarding in my office until a reorganization moved that responsibility to my supervisor; I still support it with occasional presentations and answers in person and by chat. Supervisors continue to share the guide across all four offices.',
      implications: [
        { kind: 'resource', text: 'The change moved an existing check earlier and turned knowledge staff already had into shared resources.' },
        { kind: 'observed_change', text: 'Problems are found before payment instead of after a claim looks finished.' },
        { kind: 'unproven', text: 'Any change in rework volume, payment time or cost has not been measured. Two rework observations have different scopes and are never compared.' },
      ],
    },
    measurement: 'Nothing here was measured in a controlled way. The guide’s views are counted by the document platform; the years in use are my estimate. Two rework observations exist, but they cover different scopes, so neither is shown and they are never compared.',
    artifacts: claimsArtifacts,
    method: {
      how: { tags: ['Exception log', 'Walk-throughs', 'Knowledge sessions'], note: 'I logged recurring exceptions, then walked the process with each group the handoff touched.' },
      when: { tags: ['Four months of logging', 'Before the change'], note: 'The log ran for four months. No baseline was recorded before the change.' },
      who: { tags: ['Adjusters', 'Administrative staff', 'Salvage partner', 'Administrators'], note: 'Everyone who handled the paperwork, from first request to salvage review.' },
      learn: { tags: ['Descriptive', 'Process tracing'], note: 'It could show where and when problems surfaced. It could not measure rework, payment time or cost.' },
    },
    statements: claimsInvestigation.statements.map(statement => ({
      ...statement,
      ...(claimsLimitations[statement.id] ? { limitation: claimsLimitations[statement.id] } : {}),
      ...(statement.id === 'f3a8f704-380a-45f6-a9b7-2ced77765186' ? { text: 'Supervisors continue to share the guide across all four offices, more than two years after it was posted.', limitation: 'The four offices are the whole state. Distribution and continued use, not measured effectiveness.' } : {}),
      ...(statement.id === '2f19d6f6-513f-4e67-a16b-7739f23d0334' ? { text: 'I began the work unassigned and kept a log of recurring exceptions over four months.', limitation: 'A working record, not a controlled measure.' } : {}),
      evidenceIds: ['direct_observation', 'documented_outcome', 'measured_result'].includes(statement.kind) ? [caseEvidence.claims.id] : [],
    })),
  },
}

const trust: Entry = {
  ...base('4c5ececa-e308-4a31-9566-b3cd2fc7a0b2', 'brand-research', '2026-11-22T00:00:00Z'),
  title: 'Two measures, kept ==apart==.',
  summary: 'A trust study could have produced one favorability score. I designed the survey’s measures so **agreement and trust influence were asked separately**, and a year later the readout is still cited in strategy briefs.',
  contribution: 'I set the general-to-specific interview sequence, proposed the perception-mapping framework and co-built it with two marketing and analytics leads, and separated agreement from trust influence in the survey. The external research partner conducted the interviews and fielded the survey.',
  evidenceIds: [caseEvidence.trust.id],
  investigation: {
    schemaVersion: 1, composition: 'comparison',
    visual: { left: 'Agreement', right: 'Trust influence', explanation: 'Agreeing that an attribute is true is a different question from reporting that it influences trust.' },
    observedCondition: 'Trust can read as one attitude: how favorably people rate a company. But people may agree with an attribute without it shaping their trust.',
    workingExplanation: 'My interpretation: a single score would hide the difference between what people accept and what moves their trust.',
    investigation: 'I reviewed the draft interview guide and set a general-to-specific sequence, so participants defined trust before the brand appeared. The external research partner conducted and synthesized the interviews. I then proposed perception mapping, one of three designs, mapping drivers, moments and proof points across audiences, and co-built it with two marketing and analytics leads.',
    relationshipDiscovered: '==Agreement ≠ trust.== Agreement with an attribute and its *reported influence* on trust are different questions, so the survey asked and reported them separately.',
    response: 'I separated agreement from trust influence in the survey, broke up complex questions, and kept an open-ended opening despite concerns about abandonment. I also pushed to include detractors as a distinct group; that was not adopted.',
    consequence: 'The adopted survey measures agreement and trust influence separately. The readout was discussed by 13 people across four functions, two of them directors. A year later it is **still cited in strategy briefs**. It narrowed plans toward life stages, away from weak scenarios, and a marketing lead’s follow-up took up drivers and proof points.',
    differently: 'Include detractors from the start. Distrust can reveal what retains, repairs and grows trust.',
    notOwned: 'The external research partner conducted and synthesized the interviews and fielded the survey. Marketing and analytics leads co-built the framework and owned the decisions that followed.',
    measurement: 'Fieldwork reached 800+ responses, above target, and the partner closed it early. The measures are self-report, not causal.',
    limitations: 'Proposals are recommendations, not completed outcomes. The full framework was not implemented, and detractors were championed but not sampled. No revenue, retention or trust increase is claimed.',
    artifacts: trustArtifacts,
    brief: {
      tension: 'Trust was treated as one attitude, how favorably people rate the company, although agreeing with an attribute does not mean it shapes trust.',
      call: 'I set the interview sequence, proposed a perception-mapping framework, and separated agreement from trust influence in the survey.',
      result: 'The survey measures the two separately, and a year later the readout is still cited in strategy briefs.',
      evidence: 'The instrument design, 800+ survey responses fielded by the research partner, and how the readout was used.',
    },
    status: { kind: 'in_use', label: 'Still cited a year later' },
    deepDive: true,
    interactive: 'ask-it-differently',
    figures: [
      { id: '599f27ac-7662-4086-a133-b6498cef6921', value: '800+', unit: 'survey responses', label: 'Fieldwork, above target; the partner closed it early', basis: 'approximate', qualifier: 'Responses, not representativeness or effect.', headline: true, evidenceIds: [caseEvidence.trust.id] },
      { id: '330d4dcd-03d0-4a55-bd40-8cbdc7eea247', value: '13', unit: 'people across four functions', label: 'Discussed the readout, two of them directors', basis: 'owner_estimate', qualifier: 'Reach of the readout, not adoption of every recommendation.', evidenceIds: [caseEvidence.trust.id] },
    ],
    decision: {
      stakes: 'A single favorability score could steer strategy toward what people already accept, rather than what moves their trust.',
      prevailing: 'Trust is one attitude: how favorably people rate the company.',
      alternatives: [
        { option: 'One trust score', status: 'not_chosen', note: 'It shows how much, not why or for whom.' },
        { option: 'Measure agreement and trust influence separately', status: 'chosen', note: 'Both asked and reported separately in the adopted survey.' },
        { option: 'A perception-mapping framework', status: 'recommended', note: 'One of three designs I proposed, co-built with two marketing and analytics leads. The full framework was not implemented; a later follow-up took up drivers and proof points.' },
        { option: 'Include detractors as a distinct group', status: 'recommended', note: 'Not adopted.' },
      ],
      ownership: 'Marketing and analytics leads owned the study and its use. The research partner ran the fieldwork. I set the interview sequence and designed the measurement split.',
      implementation: 'The survey was fielded with the two measures separated. The readout was discussed across four functions and is still cited in strategy briefs.',
      implications: [
        { kind: 'resource', text: 'A baseline that a later study can compare against, instead of a one-off score.' },
        { kind: 'observed_change', text: 'Plans narrowed toward life stages, away from weak scenarios.' },
        { kind: 'unproven', text: 'No revenue, retention or trust change is claimed.' },
      ],
    },
    method: {
      how: { tags: ['Interviews', 'Survey', 'Survey mode not stated'], note: 'The external partner conducted the interviews and fielded the survey. I set the interview sequence and designed the measures.' },
      when: { tags: ['One study', 'A baseline'], note: 'A single study, kept as a baseline for a comparable follow-up.' },
      who: { tags: ['800+ survey respondents', 'Sample set by the partner', 'Detractors not sampled'], note: 'Sampling was the partner’s. Detractors were championed but not included.' },
      learn: { tags: ['Descriptive', 'Two separate measures'], note: 'It could compare agreement with reported trust influence. Self-report cannot show what produces trust.' },
    },
    statements: [
      { id: '0e5d8098-297b-4fe9-b2a1-5362db15d04f', section: 'investigation', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [caseEvidence.trust.id], text: 'I set the general-to-specific interview sequence that the final guide followed.', limitation: 'The partner conducted the interviews.' },
      { id: 'b54030f9-6a8d-4003-a61b-96bd9f14c3a4', section: 'consequence', kind: 'documented_outcome', contribution: 'influenced', evidenceIds: [caseEvidence.trust.id], text: 'A year later, the readout is still cited in strategy briefs.', limitation: 'Citation is use, not evidence of effect.' },
      { id: 'a1cdac77-09ec-490c-8701-949e585a68b2', section: 'relationshipDiscovered', kind: 'practitioner_interpretation', contribution: 'identified', evidenceIds: [], text: 'Agreement and reported influence on trust answer different questions.', limitation: 'An interpretation about measurement, not a finding about what produces trust.' },
    ],
  },
}

const ai: Entry = {
  ...base('8a218cf2-1ad6-461a-af6e-3f7ccadd9429', 'enterprise-ai', '2026-11-20T00:00:00Z'),
  title: '38 proposals. ==8== shared challenges.',
  summary: 'Nearly forty AI requests arrived without a shared way to compare them. I led a synthesis into eight challenge areas that teams could discuss and choose among, then coached in the sprint, which now runs every year.',
  contribution: 'I recognized the need for a synthesis and led it, tested the groupings with the sprint facilitator, then walked them through with innovation leadership, and was a lead and coach in the sprint, leading two ideas with one combined team. The innovation team owned the program.',
  evidenceIds: [caseEvidence.ai.id],
  investigation: {
    schemaVersion: 1, composition: 'network',
    visual: { left: '38 proposals', right: '8 challenge areas', explanation: 'Counting proposals is not the same as understanding needs.' },
    observedCondition: 'Nearly forty AI requests arrived without a shared way to compare them. Thirty-eight proposals could read as thirty-eight separate needs.',
    workingExplanation: 'My interpretation: many requests addressed overlapping challenges, and comparing them one by one would hide that.',
    investigation: 'I recognized patterns across the requests and led the synthesis. I read every proposal against the others, used AI-assisted parsing to sort them, then checked and interpreted the groupings myself. I tested the groupings with the experienced sprint facilitator who had brought the idea to the innovation team, then walked them through with innovation leadership and stakeholders while the sprint teams were being defined around the institution’s question and its problem spaces.',
    relationshipDiscovered: '==38 proposals ≠ 38 needs.== Grouped by the challenge each one addressed, the proposals became **eight areas**.',
    response: 'I was a lead and coach in the sprint, working with seven teams, and led two ideas with one combined team.',
    consequence: 'The 38 proposals became eight challenge areas that teams could discuss and choose among. After the first sprint, the innovation team **chose to keep running it every year**.',
    differently: 'Record which challenge areas teams chose and why, so the synthesis’s usefulness could be shown, not only its output.',
    notOwned: 'I did not own the enterprise AI strategy or the sprint’s design. The innovation team ran the challenge and decided to run it every year.',
    measurement: 'Nothing was measured. Counts of proposals and areas are not impact.',
    limitations: 'The yearly sprint shows the format lasted; it does not show that my synthesis caused it. No proposal’s implementation or business impact is claimed.',
    brief: {
      tension: 'Nearly forty AI requests arrived with no shared way to compare them, so each read as a separate need.',
      call: 'I led a synthesis into eight challenge areas, tested it with the sprint facilitator, walked it through with innovation leadership, and coached in the sprint.',
      result: 'Teams chose among eight shared challenge areas, and the innovation team now runs the sprint every year.',
      evidence: 'Reading every proposal against the others, checking AI-assisted groupings by hand, and testing them with the people defining the sprint.',
    },
    status: { kind: 'recurring', label: 'Now run every year' },
    deepDive: true,
    interactive: 'proposals-to-problems',
    figures: [
      { id: '1792beec-01da-4351-97fe-5e149401c27c', value: '38 → 8', unit: 'proposals into challenge areas', label: 'The synthesis I led', basis: 'owner_estimate', qualifier: 'Counts of the synthesis, not impact.', headline: true, evidenceIds: [caseEvidence.ai.id] },
      { id: '23b210a5-05d1-4480-9cb7-b47c18a6bda6', value: '7', unit: 'teams', label: 'Teams I worked with as a lead and coach', basis: 'owner_estimate', qualifier: 'Involvement, not outcomes.', evidenceIds: [caseEvidence.ai.id] },
    ],
    decision: {
      stakes: 'An innovation program could spread its effort across nearly forty separate requests, or focus it on the challenges they shared.',
      prevailing: 'Each proposal was its own opportunity.',
      alternatives: [
        { option: 'Weigh the 38 proposals one by one', status: 'considered', note: 'The starting point. Overlapping needs would compete with each other.' },
        { option: 'Group them into shared challenge areas', status: 'chosen', note: 'I led the synthesis, and teams chose among the eight areas.' },
      ],
      ownership: 'The innovation team owned the program, its design and the decision to repeat it. I led the synthesis and coached teams.',
      implementation: 'The eight areas were walked through with innovation leadership and stakeholders as the sprint teams formed. The sprint now runs every year.',
      implications: [
        { kind: 'resource', text: 'The synthesis gave teams eight shared areas to choose among instead of nearly forty separate requests.' },
        { kind: 'unproven', text: 'No financial return, implementation or business impact is claimed.' },
      ],
    },
    method: {
      how: { tags: ['Document synthesis', 'AI-assisted parsing', 'Checked by hand'], note: 'I read every proposal against the others and checked the AI-assisted groupings myself.' },
      when: { tags: ['Before the sprint', 'As teams formed'], note: 'The groupings were walked through while the sprint teams were being defined.' },
      who: { tags: ['38 proposals', 'Sprint facilitator', 'Innovation leadership', 'Stakeholders'], note: 'Tested with the facilitator first, then with leadership and stakeholders.' },
      learn: { tags: ['Synthesis', 'Grouping'], note: 'It could organize the requests into shared challenges. It could not show which would succeed, or any business impact.' },
    },
    statements: [
      { id: '620fa637-dd52-47f3-8ae0-19e75f918ca9', section: 'investigation', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [caseEvidence.ai.id], text: 'I synthesized 38 proposals into eight challenge areas, checking AI-assisted groupings by hand.', limitation: 'The grouping is my interpretation, not a count of distinct needs.' },
      { id: '04ccc97b-8007-406f-b6f5-b7d8283b6c48', section: 'consequence', kind: 'documented_outcome', contribution: 'observed_use', evidenceIds: [caseEvidence.ai.id], text: 'The innovation team chose to run the sprint every year after the first one.', limitation: 'A program decision; it does not show my synthesis caused it.' },
    ],
  },
}

const telematics: Entry = {
  ...base('1bb43e26-f27a-4493-b16f-e68682838023', 'telematics', '2026-11-20T00:00:00Z'),
  title: 'Usability is ==not== recommendation.',
  summary: 'I was asked why participants were leaving a large discount program built around a usage-based insurance app. With unreliable audio, I recovered findings from on-screen behavior, and showed that a usable app and a recommended program are different questions.',
  contribution: 'I analyzed moderated sessions that others conducted, recovered findings from on-screen behavior, wrote the report and confirmed both scores, made opportunity recommendations, and took the report to the marketing analytics team.',
  evidenceIds: [caseEvidence.telematics.id],
  investigation: {
    schemaVersion: 1, composition: 'comparison',
    visual: { left: 'A usable app', right: 'A recommended program', explanation: 'A usability score and a recommendation score measure different things.' },
    observedCondition: 'Participants were leaving a large discount program built around a usage-based insurance app. The session audio was unreliable and the transcripts only semi-reliable.',
    workingExplanation: 'The working assumption was that *the app needed updating*.',
    investigation: 'I analyzed moderated sessions that others had conducted. Beyond the unreliable audio, I read behavior: gestures, repeated patterns and the screens in front of participants, tied to what they were trying to do. That showed where the interface’s cues led people to search for answers that were not there.',
    relationshipDiscovered: '==Usability ≠ recommendation.== Among the same five participants, the *app* scored about 70 for usability (SUS) while the wider *program* scored about −20 for recommendation (NPS).',
    response: 'I explained the findings in terms of progressive disclosure and visual affordances, made opportunity recommendations, and confirmed both scores while writing a 21-page report with images and video. Recognizing that the issue was broader than the app, I took the report to the marketing analytics team.',
    consequence: 'The marketing analytics team **ran a follow-up survey of about 2,000 respondents** to define personas for the current user base.',
    differently: 'Agree a backup and consent process for recordings before the sessions run, so recovery is never the method.',
    notOwned: 'Others conducted the sessions. The marketing analytics team designed and ran the follow-up, and product decisions were not mine.',
    measurement: 'Both scores come from the same five participants and are approximate. An NPS from five people is especially unstable.',
    limitations: 'Five participants is a small sample, and the two instruments are not one scale or a causal story. Nothing here establishes why people left. The follow-up shows the research travelled, not that my recommendations were adopted. It described current users only; a future-state view would have let the teams design for what the app and program did not yet offer.',
    brief: {
      tension: 'A large discount program was losing participants, and the session audio meant to explain why was unreliable.',
      call: 'I recovered findings from on-screen behavior, kept the usability and recommendation scores apart, and took the report beyond the app team.',
      result: 'The question moved from the app to the program: marketing analytics ran a follow-up survey of about 2,000 respondents.',
      evidence: 'Session behavior read from screens, gestures and patterns; SUS and NPS from the same five participants; a 21-page report.',
    },
    status: { kind: 'follow_on', label: 'Taken up by marketing analytics' },
    deepDive: true,
    figures: [
      { id: '7269df5f-4a08-4c66-ae78-3171913ae3ad', value: '~70', unit: 'SUS', label: 'App usability, five participants', basis: 'approximate', qualifier: 'A different instrument from NPS; not comparable on one scale.', evidenceIds: [caseEvidence.telematics.id] },
      { id: 'a41ece58-0294-4cd7-b2b0-26028a6c1dec', value: '~−20', unit: 'NPS', label: 'Program recommendation, the same five participants', basis: 'approximate', qualifier: 'Unstable at this sample size.', evidenceIds: [caseEvidence.telematics.id] },
      { id: 'c0d2aaf6-5ed1-46dc-bdd2-505d55415bca', value: '~2,000', unit: 'respondents', label: 'Follow-up survey run by marketing analytics', basis: 'owner_estimate', qualifier: 'Another team’s work; not adoption of my recommendations.', evidenceIds: [caseEvidence.telematics.id] },
    ],
    decision: {
      stakes: 'A large discount program was losing participants. Treating that as an app problem risked fixing the interface while the program’s value went unexamined.',
      prevailing: 'Update the application.',
      alternatives: [
        { option: 'Update the app only', status: 'considered', note: 'It addresses the interface findings, not the program’s value.' },
        { option: 'Examine the program with marketing analytics', status: 'recommended', note: 'I took the report to that team, and they ran a follow-up survey.' },
      ],
      ownership: 'Marketing analytics decided the follow-up’s scope. Product teams owned changes to the app.',
      implementation: 'A follow-up survey of about 2,000 respondents defined personas for the current user base.',
      implications: [
        { kind: 'observed_change', text: 'The question moved from the app alone to the program and its users.' },
        { kind: 'unproven', text: 'No retention, churn or cost effect is claimed.' },
      ],
    },
    method: {
      how: { tags: ['Moderated sessions', 'Behavior analysis', 'SUS', 'NPS'], note: 'Others ran the sessions. With the audio unreliable, I read on-screen behavior, and confirmed both scores in the report.' },
      when: { tags: ['One round of sessions', 'Timing not stated'], note: 'A single round; the dates are not part of the public account.' },
      who: { tags: ['Five participants', 'Program members'], note: 'The same five people gave both scores.' },
      learn: { tags: ['Descriptive', 'Two instruments'], note: 'It could describe how people used the app and how they rated the program. It could not show why people left.' },
    },
    statements: [
      { id: '308e9680-09d1-43fe-b372-eec1deef1d03', section: 'investigation', kind: 'direct_observation', contribution: 'identified', evidenceIds: [caseEvidence.telematics.id], text: 'With the audio unreliable, I recovered findings from on-screen behavior.', limitation: 'The sessions were conducted by others; the method is described in the deep dive.' },
      { id: '94e0af76-25b0-430b-b5fb-5f88a4a5d865', section: 'consequence', kind: 'documented_outcome', contribution: 'observed_use', evidenceIds: [caseEvidence.telematics.id], text: 'After I took the report to marketing analytics, that team ran a follow-up survey of about 2,000 respondents.', limitation: 'Sequence, not proof that my recommendations were adopted.' },
    ],
  },
}

const civic: Entry = {
  ...base('873dde95-923f-41a0-bd19-55041eb4aae1', 'civic-service', '2026-11-20T00:00:00Z'),
  title: 'Organized by office. Asked by ==step==.',
  summary: 'Residents’ voting questions followed the steps in front of them, not the offices that publish the answers. As a volunteer co-founder of Vote Huntsville, I helped build one plain-language answer source used across every channel.',
  contribution: 'I co-founded the nonpartisan Vote Huntsville with other directors and volunteers, all unpaid. We gathered residents’ questions and built one shared, plain-language answer source used across channels.',
  evidenceIds: [caseEvidence.civic.id],
  investigation: {
    schemaVersion: 1, composition: 'comparison',
    visual: { left: 'Organized by office', right: 'Asked by step', explanation: 'Complete information is not the same as usable information.' },
    observedCondition: 'Voting information was organized *by office* and service category, while residents’ questions followed *the practical steps* they faced.',
    workingExplanation: 'My interpretation: complete information can still be hard to use when it is sorted the way institutions are organized, not the way questions arise.',
    investigation: 'We gathered residents’ questions door to door, on phone calls, on social media, through other organizations, at voter-registration events and in conversations among the volunteers, and compared them with how official information was organized.',
    relationshipDiscovered: '==Voting categories ≠ residents’ questions.== One question could depend on **several offices**.',
    response: 'With the other directors and volunteers, I helped build one shared, plain-language answer source used across channels: social media, the website, email, a phone line, events, and print, including QR yard signs and T-shirts.',
    consequence: 'About two months after we formed, Vote Huntsville was offered the chance to co-sign a $20,000 grant and to help define what Vote Gone Viral could be. **The grant was publicly awarded to United Women of Color**, whose program Vote Gone Viral is, and Vote Huntsville took part in the campaign.',
    differently: 'Define reach and track it per channel from the start, so “residents reached” has one clear meaning.',
    notOwned: 'Vote Huntsville was a shared volunteer effort; no one, including the directors, was paid. The grant was a partnership’s work.',
    measurement: 'Reach was not measured with one consistent definition, so no reach figure is given.',
    limitations: 'No effect on turnout or policy is claimed. The grant’s award is not credited to one person.',
    artifacts: civicArtifacts,
    brief: {
      tension: 'Voting information was organized by office, while residents’ questions followed the steps they faced.',
      call: 'With other volunteers, I gathered residents’ questions in person and online and helped build one plain-language answer source for every channel.',
      result: 'Vote Huntsville partnered on Vote Gone Viral, a campaign supported by a $20,000 grant publicly awarded to United Women of Color.',
      evidence: 'Residents’ questions gathered door to door, by phone, online and at events, compared with how official information was organized.',
    },
    status: { kind: 'recognized', label: 'Partner in a funded campaign' },
    deepDive: true,
    decision: {
      stakes: 'Residents who could not find answers in the order they needed them might not complete the steps to vote.',
      prevailing: 'The information exists, so residents can find it.',
      alternatives: [
        { option: 'Point residents to each office’s information', status: 'considered', note: 'Complete, but sorted by office rather than by step.' },
        { option: 'One shared answer source for every channel', status: 'chosen', note: 'Plain language, organized around residents’ questions.' },
      ],
      ownership: 'Decisions were shared among the volunteer directors. The grant was publicly awarded to United Women of Color; by our account the local League of Women Voters was also a partner. How the funding was allocated is not part of this account.',
      implementation: 'The same answers reached residents online, by phone, in person and in print.',
      implications: [
        { kind: 'resource', text: 'One answer source maintained once and reused across channels, by volunteers.' },
        { kind: 'observed_change', text: 'Vote Huntsville was offered the chance to co-sign a $20,000 grant, which was publicly awarded to United Women of Color.' },
        { kind: 'unproven', text: 'No reach figure, turnout effect or policy effect is claimed.' },
      ],
    },
    method: {
      how: { tags: ['Door to door', 'Phone', 'Social media', 'Events', 'Partner organizations'], note: 'Volunteers gathered residents’ questions wherever residents were.' },
      when: { tags: ['Ongoing', 'Not systematically dated'], note: 'Questions were gathered continuously through the project’s work.' },
      who: { tags: ['Residents', 'Volunteers', 'Partner organizations'], note: 'Anyone the volunteers met in person, online or through partners.' },
      learn: { tags: ['Descriptive', 'Comparison'], note: 'It could compare residents’ questions with how official information was organized. It could not show any effect on turnout.' },
    },
    statements: [
      { id: 'cd8ac815-e589-442b-8466-3a23780b05ed', section: 'investigation', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [caseEvidence.civic.id], text: 'We gathered residents’ questions door to door, by phone, online, through partner organizations and at events.', limitation: 'A shared volunteer effort.' },
      { id: '7c9bb18d-0ce9-46c1-8332-d36f87484c3e', section: 'consequence', kind: 'documented_outcome', contribution: 'observed_use', evidenceIds: [caseEvidence.civic.id], text: 'The $20,000 grant Vote Huntsville was offered the chance to co-sign was publicly awarded to United Women of Color.', limitation: 'Recognition of a partnership, not of one person. Formal co-signatory status and funding allocation are not documented here.' },
    ],
  },
}

const accessibility: Entry = {
  ...base('36e61934-b32a-4b04-a9c2-d6f99b73b5a2', 'accessibility-ai', '2026-11-20T00:00:00Z'),
  title: 'Passing checks. A ==separate== question.',
  summary: 'In an AI-assisted development experiment I originated, the accessibility agent restored code we removed on purpose. A planned human review still raised a question the automated checks did not settle.',
  contribution: 'I originated the experiment and co-facilitated it, the only participant from outside the department. A colleague advocated the idea to the organizer, and a developer conducted the human review.',
  evidenceIds: [caseEvidence.accessibility.id],
  investigation: {
    schemaVersion: 1, composition: 'boundary',
    visual: { left: 'Checks passed', right: 'Question settled', explanation: 'Automated checks answer the questions they were written for.' },
    observedCondition: 'The question was whether AI-assisted development keeps accessibility intact, and what automated checks cannot tell you.',
    workingExplanation: 'The common assumption: code that passes automated checks is accessible.',
    investigation: 'I originated the idea; a colleague advocated it to the organizer, and I was invited to co-facilitate, the only participant from outside the department. We built a front-end-only Pomodoro prototype by iterating between a coding agent and an accessibility agent, and removed accessibility code on purpose to test the check.',
    relationshipDiscovered: '==Automation ≠ judgment.== The accessibility agent detected the removal and **restored the code**. Separately, a planned human review using simulated deuteranopia flagged that the Focus and Break states *might* be hard to tell apart visually, although **both had text labels**.',
    response: 'I co-facilitated the experiment, with the human review planned separately from the agent test.',
    consequence: 'The experiment informed and qualified a separate initiative that was already under way.',
    differently: 'Include people with the relevant visual differences in the review, instead of relying on simulation alone.',
    notOwned: 'A developer conducted the human review. The separate initiative, and its decisions, belong to others.',
    measurement: 'Nothing was measured. One simulated review is not a user test.',
    limitations: 'One simulation is not proof of user failure or a standards violation, and the agent did not fail. The archived repository is a security precaution, not adoption. Earlier, repeatable checking is an intended benefit, not a measured saving.',
    artifacts: accessibilityArtifacts,
    brief: {
      tension: 'Could AI-assisted development keep accessibility intact, and what would automated checks miss?',
      call: 'I originated and co-facilitated an experiment pairing a coding agent with an accessibility agent, plus a planned human review.',
      result: 'The agent restored code removed on purpose; the human review raised a visual question the checks did not settle. It informed a separate initiative.',
      evidence: 'The restored code, and a planned review under simulated deuteranopia.',
    },
    status: { kind: 'follow_on', label: 'Informed a separate initiative' },
    deepDive: true,
    decision: {
      stakes: 'Teams adopting AI-assisted development could treat passing automated checks as proof of accessibility and skip human review.',
      prevailing: 'Passing automated checks means the work is accessible.',
      alternatives: [
        { option: 'Rely on the accessibility agent alone', status: 'not_chosen', note: 'It restored the code, but could not settle the visual question.' },
        { option: 'Pair agent checks with planned human review', status: 'recommended', note: 'The review raised a question the checks did not settle.' },
      ],
      ownership: 'The separate initiative and its decisions belong to others. A developer conducted the review.',
      implementation: 'The experiment informed a separate initiative already under way.',
      implications: [
        { kind: 'resource', text: 'Earlier, repeatable checking could reduce later remediation. This is an intended benefit, not a measured one.' },
        { kind: 'unproven', text: 'No production deployment or measured saving is claimed.' },
      ],
    },
    method: {
      how: { tags: ['Prototype experiment', 'Deliberate removal', 'Agent check', 'Planned human review'], note: 'Accessibility code was removed on purpose to test the agent; a separate human review was planned.' },
      when: { tags: ['One experiment'], note: 'A single prototype, iterated between two agents.' },
      who: { tags: ['Coding agent', 'Accessibility agent', 'One developer reviewer'], note: 'The review used simulated deuteranopia, not people with that vision.' },
      learn: { tags: ['Test of a check', 'Simulation'], note: 'It could show the agent restoring removed code, and raise a visual question. It could not show user failure or a standards violation.' },
    },
    statements: [
      { id: 'd41ba4f0-7c7b-482d-bb94-7272375d2868', section: 'relationshipDiscovered', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [caseEvidence.accessibility.id], text: 'The accessibility agent detected and restored code removed on purpose.', limitation: 'One prototype; not a general claim about the agent.' },
      { id: '5d674066-e70e-42fc-9a2d-dc80f50a6bda', section: 'relationshipDiscovered', kind: 'direct_observation', contribution: 'designed_or_facilitated', evidenceIds: [caseEvidence.accessibility.id], text: 'A planned human review under simulated deuteranopia flagged that two labelled states might be hard to tell apart.', limitation: 'A simulation, not a test with people.' },
    ],
  },
}

/** Reading order: the same order as the deep dives, each case's next question leading to the next. */
export const releaseStore: ContentStore = {
  entries: [claims, trust, ai, telematics, civic, accessibility, friction, binder, knowledge],
  relationships: [],
  evidence: [...Object.values(caseEvidence), ...Object.values(newCaseEvidence)],
  assets: [],
  aliases: [],
}
