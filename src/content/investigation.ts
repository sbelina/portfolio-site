import { z } from 'zod'

export const compositionSchema = z.enum(['boundary', 'comparison', 'network', 'revision'])
export const statementKindSchema = z.enum(['direct_observation', 'measured_result', 'documented_outcome', 'practitioner_interpretation', 'hypothesis', 'conceptual_illustration', 'intended_benefit', 'unverified'])
export const figureBasisSchema = z.enum(['owner_estimate', 'approximate', 'platform_reported', 'measured'])
export const contributionLevelSchema = z.enum(['identified', 'influenced', 'designed_or_facilitated', 'implemented', 'observed_use', 'measured_impact'])
const narrativeText = z.string().min(1).max(10000)
/** Narrative sections a statement can be threaded into. */
export const narrativeSectionSchema = z.enum(['observedCondition', 'workingExplanation', 'investigation', 'relationshipDiscovered', 'response', 'consequence', 'notOwned', 'measurement', 'limitations'])
export const investigationSchema = z.strictObject({
  schemaVersion: z.literal(1),
  composition: compositionSchema,
  visual: z.strictObject({ left: narrativeText, right: narrativeText, explanation: narrativeText }),
  observedCondition: narrativeText.optional(), workingExplanation: narrativeText.optional(),
  investigation: narrativeText.optional(), relationshipDiscovered: narrativeText.optional(),
  response: narrativeText.optional(), consequence: narrativeText.optional(), limitations: narrativeText.optional(),
  /** Featured summary for home: tension → my call → result → evidence used. */
  brief: z.strictObject({ tension: narrativeText, call: narrativeText, result: narrativeText, evidence: narrativeText }).optional(),
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
    evidenceIds: z.array(z.uuid()).refine(ids => new Set(ids).size === ids.length, 'Duplicate evidence reference'),
  })).max(6).optional(),
  /** An optional explorable illustration rendered with the narrative (conceptual, never data). */
  interactive: z.enum(['move-the-checkpoint']).optional(),
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
})
export type Investigation = z.infer<typeof investigationSchema>
export type Composition = z.infer<typeof compositionSchema>
