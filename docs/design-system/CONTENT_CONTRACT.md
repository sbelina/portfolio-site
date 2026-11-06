# Typed knowledge, evidence, permission, and relationship contract

This contract is conceptual. Reuse the existing versioned TypeScript/Zod schemas, stable IDs, editable slugs and aliases, revisions and selected public projection. Do not replace those contracts with this simplified sketch. Publication readiness fields cannot authenticate approval. A trusted owner action must approve the exact application/content/relationship/alias/asset candidate digest; a newer draft must coexist with an earlier published revision. Private approval records stay outside public output.

```ts
type PublicationStatus = "draft" | "under-review" | "approved" | "withdrawn";
type KnowledgeKind = "observation" | "interpretation" | "hypothesis" | "proposal" | "outcome";
type Visibility = "public" | "private" | "restricted";
type RelationshipKind = "shares-question" | "contrasts-with" | "develops" | "supports" | "qualifies" | "related-not-equivalent";

type SourceRef = { id: string; title: string; kind: string; date?: string; publicUrl?: string; visibility: Visibility };
type Claim = {
  id: string; exactWording: string; kind: KnowledgeKind;
  sourceIds: string[]; timeframe?: string; method?: string; sample?: string;
  authorContribution?: string; limits: string[]; competingInterpretations: string[];
  attribution?: "descriptive" | "associational" | "causal-not-established" | "causal-supported";
  visibility: Visibility; status: PublicationStatus; // Informational readiness only; never authorization.
};
type Relationship = {
  id: string; fromId: string; toId: string; kind: RelationshipKind;
  rationale: string; claimIds: string[]; limits: string[];
  visibility: Visibility; status: PublicationStatus; // Informational readiness only; never authorization.
};
type Investigation = {
  id: string; slug: string; title: string; question: string;
  originalFrame: string; alternativeFrames: string[];
  methodSummary: string; observationClaimIds: string[];
  interpretationClaimIds: string[]; decisionClaimIds: string[];
  outcomeClaimIds: string[]; limitations: string[]; tradeoffs: string[];
  authorRole: string; relatedRelationshipIds: string[];
  visibility: Visibility; status: PublicationStatus; // Informational readiness only; never authorization.
};
```

## Compiler checks (fail build)
- Public investigation contains only public + human-approved referenced claims and relationships.
- All claim source references resolve to allowed public source summaries; never import restricted original records into public build.
- Every figure with quantities has labels/units/method/timeframe or marked unknown; chart ranges derive from values, not aesthetics.
- Graph edges have approval, rationale, and declared type; no claim of equivalence from simple linking.
- All external claims have accessible source links when disclosure is permissible; confidential sources may be cited in generalized approved form only.
- No restricted source IDs, private source material, sensitive locators or approval metadata in public JS bundles, assets, source maps or static paths. Public-safe evidence IDs and approved source summaries remain available for traceability.
- Never auto-upgrade a hypothesis or interpretation into an observation/outcome.
- Diff checker flags numerical changes, source changes, and publication-status changes for explicit approval.

## Authoring and review states
Draft → Evidence & attribution review → Privacy review → Narrative review → Human approval → Public snapshot → Deployment approval.
A public edit (even typo) is reviewed; quantitative/source/claim changes require renewed evidence gate. Approval metadata private. Revocations remove generated public output at next authorized release.

## Case-specific cautions
- **Claims:** The approximately 18% and 7.6% observations have different scopes and are not a before/after series. Do not juxtapose them, calculate a reduction, or assign a shared unit or denominator. Each requires its own verified definition, period, method, source and approved wording. Earlier review before payment is owner-reported; increased elapsed payment waiting has not been established.
- **Trust:** 800+ responses over nine days; distinguishing agreement from trust is framing/measurement work, not proof of changing trust levels.
- **AI opportunity mapping:** 38 submitted proposals clustered into 8 problem spaces; categorization is analytic, not validation of 8 user needs.
- **Snapshot:** usability / recommendation divergence could show measures are not equivalent; verify source and exact population before publishing.
- **Accessibility experiment:** A coding agent restored deliberately removed accessibility code. Separately planned human review identified potentially weak differentiation between text-labeled Focus and Break states under simulated deuteranopia. This was a front-end prototype. Earlier repeatable checking and reduced remediation remain intended, unmeasured benefits.
