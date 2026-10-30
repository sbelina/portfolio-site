import { z } from 'zod'

export const compositionSchema = z.enum(['boundary', 'comparison', 'network', 'revision'])
export const statementKindSchema = z.enum(['direct_observation', 'measured_result', 'documented_outcome', 'practitioner_interpretation', 'hypothesis', 'conceptual_illustration', 'intended_benefit', 'unverified'])
export const contributionLevelSchema = z.enum(['identified', 'influenced', 'designed_or_facilitated', 'implemented', 'observed_use', 'measured_impact'])
const narrativeText = z.string().min(1).max(10000)
export const investigationSchema = z.strictObject({
  schemaVersion: z.literal(1),
  composition: compositionSchema,
  visual: z.strictObject({ left: narrativeText, right: narrativeText, explanation: narrativeText }),
  observedCondition: narrativeText.optional(), workingExplanation: narrativeText.optional(),
  investigation: narrativeText.optional(), relationshipDiscovered: narrativeText.optional(),
  response: narrativeText.optional(), consequence: narrativeText.optional(), limitations: narrativeText.optional(),
  statements: z.array(z.strictObject({
    id: z.uuid(), text: narrativeText, kind: statementKindSchema,
    contribution: contributionLevelSchema,
    evidenceIds: z.array(z.uuid()).refine(ids => new Set(ids).size === ids.length, 'Duplicate evidence reference'),
    limitation: narrativeText,
  })).max(100),
}).superRefine((value, ctx) => {
  if (new Set(value.statements.map(s => s.id)).size !== value.statements.length) ctx.addIssue({ code: 'custom', path: ['statements'], message: 'Duplicate statement identity' })
})
export type Investigation = z.infer<typeof investigationSchema>
export type Composition = z.infer<typeof compositionSchema>
