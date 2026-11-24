import { z } from 'zod'

export const compositionSchema = z.enum(['boundary', 'comparison', 'network', 'revision'])
export const statementKindSchema = z.enum(['direct_observation', 'measured_result', 'documented_outcome', 'practitioner_interpretation', 'hypothesis', 'conceptual_illustration', 'intended_benefit', 'unverified'])
export const figureBasisSchema = z.enum(['owner_estimate', 'approximate', 'platform_reported', 'measured'])
export const contributionLevelSchema = z.enum(['identified', 'influenced', 'designed_or_facilitated', 'implemented', 'observed_use', 'measured_impact'])
const narrativeText = z.string().min(1).max(10000)
/** Owner direction (22 November): no date call-outs in tags or headline figures; durations such as “2+ years” are fine. */
const datePattern = /\b(?:19|20)\d{2}\b|\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/i
export const undated = (max: number) => z.string().min(1).max(max).refine(text => !datePattern.test(text), 'No date call-outs: state a duration or an outcome, not a date')
/** What became of the work, in one short tag. The kind is a fixed vocabulary; the label is the owner's wording. */
export const caseStatusKindSchema = z.enum(['in_use', 'adopted', 'recurring', 'follow_on', 'recognized', 'proposal'])
/** Narrative sections a statement can be threaded into. */
export const narrativeSectionSchema = z.enum(['observedCondition', 'workingExplanation', 'investigation', 'relationshipDiscovered', 'response', 'consequence', 'notOwned', 'measurement', 'limitations'])
const blueprintLabel = z.string().min(1).max(120)
/**
 * A service blueprint: lanes (who acts, and what the customer sees) by stages, shown before and after.
 * Data only; the page decides presentation. `mark` flags a failure point or a change, always in words.
 */
export const blueprintSchema = z.strictObject({
  title: blueprintLabel,
  caption: narrativeText,
  /** How the artifact was made, e.g. reconstructed later from notes. Always shown. */
  provenance: narrativeText,
  /** The one change to see first, in plain words (e.g. what moved). */
  shift: narrativeText.optional(),
  lanes: z.array(z.strictObject({ id: z.string().regex(/^[a-z][a-z0-9-]*$/), label: blueprintLabel, lineAfter: z.enum(['Line of interaction', 'Line of visibility']).optional() })).min(2).max(6),
  views: z.tuple([
    z.strictObject({ id: z.literal('before'), label: blueprintLabel, summary: narrativeText, stages: z.array(z.strictObject({ label: blueprintLabel, note: z.string().min(1).max(60).optional(), cells: z.array(z.strictObject({ lane: z.string(), text: narrativeText, mark: z.enum(['failure', 'change']).optional() })).max(12) })).min(2).max(8) }),
    z.strictObject({ id: z.literal('after'), label: blueprintLabel, summary: narrativeText, stages: z.array(z.strictObject({ label: blueprintLabel, note: z.string().min(1).max(60).optional(), cells: z.array(z.strictObject({ lane: z.string(), text: narrativeText, mark: z.enum(['failure', 'change']).optional() })).max(12) })).min(2).max(8) }),
  ]),
}).superRefine((value, ctx) => {
  const lanes = new Set(value.lanes.map(lane => lane.id))
  if (lanes.size !== value.lanes.length) ctx.addIssue({ code: 'custom', path: ['lanes'], message: 'Duplicate lane' })
  value.views.forEach((view, v) => view.stages.forEach((stage, s) => stage.cells.forEach((cell, c) => {
    if (!lanes.has(cell.lane)) ctx.addIssue({ code: 'custom', path: ['views', v, 'stages', s, 'cells', c, 'lane'], message: 'Unknown lane' })
  })))
})
export type Blueprint = z.infer<typeof blueprintSchema>

export const investigationSchema = z.strictObject({
  schemaVersion: z.literal(1),
  composition: compositionSchema,
  visual: z.strictObject({ left: narrativeText, right: narrativeText, explanation: narrativeText }),
  observedCondition: narrativeText.optional(), workingExplanation: narrativeText.optional(),
  investigation: narrativeText.optional(), relationshipDiscovered: narrativeText.optional(),
  response: narrativeText.optional(), consequence: narrativeText.optional(), limitations: narrativeText.optional(),
  /** Featured summary for home: tension → my call → result → evidence used. */
  brief: z.strictObject({ tension: narrativeText, call: narrativeText, result: narrativeText, evidence: narrativeText }).optional(),
  /** The case's main visual: a before/after service blueprint (reconstructed artifacts say so). */
  blueprint: blueprintSchema.optional(),
  /** One status tag for cards and the case header (e.g. “In use 2+ years”, “Proposal, not adopted”). */
  status: z.strictObject({ kind: caseStatusKindSchema, label: undated(40) }).optional(),
  /** A longer, password-protected version exists at /deep-dive/<slug>/; its content is never in this repository. */
  deepDive: z.boolean().optional(),
  /**
   * The institutional decision layer (owner direction, 23 November): what was at stake, the explanation
   * people held, the options and what became of each, who decided, what changed in practice, and its
   * resource implications, each labelled by how far it is established. Never a financial claim by inference.
   */
  decision: z.strictObject({
    stakes: narrativeText,
    prevailing: narrativeText,
    alternatives: z.array(z.strictObject({ option: z.string().min(1).max(160), status: z.enum(['considered', 'recommended', 'chosen', 'not_chosen']), note: narrativeText })).min(1).max(6),
    ownership: narrativeText,
    implementation: narrativeText,
    implications: z.array(z.strictObject({ kind: z.enum(['resource', 'observed_change', 'measured', 'unproven']), text: narrativeText })).min(1).max(6),
  }).optional(),
  /**
   * The method profile (owner direction, 23 November; after the "four decisions" survey-type infographic):
   * how the evidence was gathered, when, from whom, and what it could and could not establish.
   * Facts only; a decision that was not recorded says so instead of guessing.
   */
  method: z.strictObject(Object.fromEntries((['how', 'when', 'who', 'learn'] as const).map(key => [key, z.strictObject({
    tags: z.array(z.string().min(1).max(60)).min(1).max(8),
    note: narrativeText,
  })])) as Record<'how' | 'when' | 'who' | 'learn', z.ZodObject<{ tags: z.ZodArray<z.ZodString>; note: z.ZodString }, z.core.$strict>>).optional(),
  /** One honest line on what the author would do differently next time (owner's own words). */
  differently: narrativeText.optional(),
  /** What the author did not own or decide. */
  notOwned: narrativeText.optional(),
  /** How anything here was (or was not) measured. */
  measurement: narrativeText.optional(),
  /** Small labelled figures. Each needs selected evidence before publication; basis states its nature. */
  figures: z.array(z.strictObject({
    id: z.uuid(), value: z.string().min(1).max(24), unit: z.string().min(1).max(80), label: z.string().min(1).max(200),
    basis: figureBasisSchema, qualifier: z.string().min(1).max(400),
    /** Shown in the homepage results strip once the case is approved. Headline figures carry no date call-outs. */
    headline: z.boolean().optional(),
    evidenceIds: z.array(z.uuid()).refine(ids => new Set(ids).size === ids.length, 'Duplicate evidence reference'),
  })).max(6).optional(),
  /**
   * Working artifacts (owner approval, November 2026): tables and step traces drawn from the evidence
   * registry. Data only. Each says how it was made (label: FIG · type · caveat) and what it does not
   * claim (note). Steps name who acted, in words: mine, others', or not yet confirmed.
   */
  artifacts: z.array(z.strictObject({
    id: z.string().regex(/^[a-z][a-z0-9-]*$/),
    title: z.string().min(1).max(160),
    label: z.string().min(1).max(200),
    intro: narrativeText.optional(),
    table: z.strictObject({
      columns: z.array(z.string().min(1).max(80)).min(2).max(5),
      rows: z.array(z.array(z.string().min(1).max(400)).min(2).max(5)).min(1).max(16),
    }).optional(),
    steps: z.array(z.strictObject({ title: z.string().min(1).max(120), text: narrativeText.optional(), by: z.enum(['me', 'others', 'shared', 'open']) })).min(2).max(10).optional(),
    note: narrativeText.optional(),
  }).refine(artifact => artifact.table || artifact.steps, 'An artifact needs a table or steps')
    .refine(artifact => !artifact.table || artifact.table.rows.every(row => row.length === artifact.table!.columns.length), 'Every row needs one cell per column')).max(8).optional(),
  /** An optional explorable illustration rendered with the narrative (conceptual, never data). */
  interactive: z.enum(['move-the-checkpoint', 'ask-it-differently', 'proposals-to-problems']).optional(),
  statements: z.array(z.strictObject({
    id: z.uuid(), text: narrativeText, kind: statementKindSchema,
    contribution: contributionLevelSchema,
    /** Where the statement sits in the story. Unplaced statements are listed together after it. */
    section: narrativeSectionSchema.optional(),
    evidenceIds: z.array(z.uuid()).refine(ids => new Set(ids).size === ids.length, 'Duplicate evidence reference'),
    limitation: narrativeText,
  })).max(100),
}).superRefine((value, ctx) => {
  if (new Set(value.statements.map(s => s.id)).size !== value.statements.length) ctx.addIssue({ code: 'custom', path: ['statements'], message: 'Duplicate statement identity' })
  value.figures?.forEach((figure, index) => {
    if (figure.headline && [figure.value, figure.unit, figure.label].some(text => datePattern.test(text))) ctx.addIssue({ code: 'custom', path: ['figures', index], message: 'Headline figures carry no date call-outs' })
  })
})
export type Investigation = z.infer<typeof investigationSchema>
export type Composition = z.infer<typeof compositionSchema>
