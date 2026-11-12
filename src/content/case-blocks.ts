import { z } from 'zod'
import { contributionLevelSchema, statementKindSchema } from './investigation'

const uuid = z.uuid().regex(/^[0-9a-f-]+$/, 'UUIDs use canonical lowercase spelling')
const text = z.string().min(1).max(10000).refine(value => value.trim().length > 0, 'Provide meaningful text')
const label = z.string().min(1).max(300).refine(value => value.trim().length > 0, 'Provide a visible label')
const references = z.array(uuid).max(100).refine(ids => new Set(ids).size === ids.length, 'Duplicate evidence reference')

/** Authored anchors are data, not selectors or executable fragment targets. */
export const blockAnchorSchema = z.string().max(120).regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/)

const stageSchema = z.strictObject({
  id: uuid,
  action: label,
  actor: label,
  information: text,
  consequence: text,
  checkpoint: z.boolean().optional(),
  evidenceIds: references,
})

const workflowViewSchema = z.strictObject({
  label,
  summary: text,
  stages: z.array(stageSchema).min(1).max(20),
}).superRefine((view, ctx) => {
  if (new Set(view.stages.map(stage => stage.id)).size !== view.stages.length) {
    ctx.addIssue({ code: 'custom', path: ['stages'], message: 'Duplicate stage identity within workflow view' })
  }
})

/** Categorical order and explanatory text; no fabricated duration or probability. */
export const workflowComparisonSchema = z.strictObject({
  id: uuid,
  type: z.literal('workflow_comparison'),
  anchor: blockAnchorSchema.optional(),
  title: label,
  summary: text,
  basis: z.enum(['conceptual', 'documented']),
  limitation: text,
  before: workflowViewSchema,
  after: workflowViewSchema,
})
export type WorkflowComparisonBlock = z.infer<typeof workflowComparisonSchema>

const artifactSchema = z.strictObject({
  id: uuid,
  title: label,
  purpose: text,
  audience: z.array(label).min(1).max(20),
  reasoning: text,
  contribution: text,
  implementation: text,
  retainedValue: text,
  limitation: text,
  representation: z.enum(['description', 'illustrative_reconstruction']),
  reconstruction: text.optional(),
  kind: statementKindSchema,
  evidenceIds: references,
}).superRefine((artifact, ctx) => {
  if (artifact.representation === 'illustrative_reconstruction' && !artifact.reconstruction) {
    ctx.addIssue({ code: 'custom', path: ['reconstruction'], message: 'An illustrative reconstruction requires its explanatory content' })
  }
  if (artifact.representation === 'description' && artifact.reconstruction !== undefined) {
    ctx.addIssue({ code: 'custom', path: ['representation'], message: 'Reconstructed content must be labeled illustrative_reconstruction' })
  }
})

export const artifactInspectorSchema = z.strictObject({
  id: uuid,
  type: z.literal('artifact_inspector'),
  anchor: blockAnchorSchema.optional(),
  title: label,
  summary: text,
  artifacts: z.array(artifactSchema).min(1).max(30),
}).superRefine((block, ctx) => {
  if (new Set(block.artifacts.map(artifact => artifact.id)).size !== block.artifacts.length) {
    ctx.addIssue({ code: 'custom', path: ['artifacts'], message: 'Duplicate artifact identity' })
  }
})
export type ArtifactInspectorBlock = z.infer<typeof artifactInspectorSchema>

const claimSchema = z.strictObject({
  id: uuid,
  statement: text,
  kind: statementKindSchema,
  contribution: contributionLevelSchema,
  sourceSummary: text,
  scope: text,
  period: text,
  limitation: text,
  evidenceIds: references,
})

export const evidenceInspectorSchema = z.strictObject({
  id: uuid,
  type: z.literal('evidence_inspector'),
  anchor: blockAnchorSchema.optional(),
  title: label,
  summary: text,
  claims: z.array(claimSchema).min(1).max(100),
}).superRefine((block, ctx) => {
  if (new Set(block.claims.map(claim => claim.id)).size !== block.claims.length) {
    ctx.addIssue({ code: 'custom', path: ['claims'], message: 'Duplicate claim identity' })
  }
})
export type EvidenceInspectorBlock = z.infer<typeof evidenceInspectorSchema>
export type CaseStudyBlock = WorkflowComparisonBlock | ArtifactInspectorBlock | EvidenceInspectorBlock

export { isCaseStudyBlock } from './case-block-kind'

/** Shared by draft/reference validation, public selection and page payload selection. */
export function caseBlockEvidenceIds(block: CaseStudyBlock): string[] {
  const references = block.type === 'workflow_comparison'
    ? [...block.before.stages, ...block.after.stages].flatMap(stage => stage.evidenceIds)
    : block.type === 'artifact_inspector'
      ? block.artifacts.flatMap(artifact => artifact.evidenceIds)
      : block.claims.flatMap(claim => claim.evidenceIds)
  return [...new Set(references)]
}
