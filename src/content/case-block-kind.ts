import type { CaseStudyBlock } from './case-blocks'

/** Browser-safe discriminator. Runtime schemas stay on build/server paths. */
export function isCaseStudyBlock(block: { type: string }): block is CaseStudyBlock {
  return block.type === 'workflow_comparison' || block.type === 'artifact_inspector' || block.type === 'evidence_inspector'
}
