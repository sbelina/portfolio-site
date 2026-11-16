import { z } from 'zod'

/** Presentation and authored context, not a new entry kind or readiness score. */
export const inquirySpaceSchema = z.strictObject({
  schemaVersion: z.literal(1),
  presentation: z.enum(['fragment', 'exhibit']),
  form: z.enum(['glimmer', 'question', 'contradiction', 'resonance', 'conjecture', 'expression', 'prototype']),
  epistemicMode: z.enum(['expression', 'open_question', 'interpretation', 'hypothesis', 'evidence_backed']),
  featured: z.boolean(),
  // These optional strings retain authored whitespace. Empty draft fields are
  // allowed; neither their presence nor their length establishes evidence.
  prompt: z.string().max(1000).optional(),
  origin: z.string().max(4000).optional(),
  observation: z.string().max(4000).optional(),
  possibleExplanations: z.string().max(4000).optional(),
  competingInterpretations: z.string().max(4000).optional(),
  unresolvedQuestion: z.string().max(1000).optional(),
})
export type InquirySpace = z.infer<typeof inquirySpaceSchema>

/** Separate from editorial reviewState: a reviewed resonance stays speculative. */
export const explorationSchema = z.strictObject({
  schemaVersion: z.literal(1),
  level: z.enum(['resonance', 'interpretation', 'supported']),
  boundary: z.string().max(4000).refine(value => value.trim().length > 0, 'An authored pairing needs a nonempty boundary'),
  usefulQuestion: z.string().max(1000).optional(),
  featured: z.boolean(),
})
export type RelationshipExploration = z.infer<typeof explorationSchema>
