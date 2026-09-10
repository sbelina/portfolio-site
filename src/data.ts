export type Project = {
  id: string
  number: string
  domain: string
  title: string
  strapline: string
  metric: string
  tags: string[]
  summary: string
  observed: string
  diagnosed: string
  structure: string
  remains: string
  capabilities: string[]
}

export type Writing = {
  id: string
  kind: 'Field note' | 'Essay' | 'Notebook'
  title: string
  subtitle?: string
  excerpt: string
  context: string
  tags: string[]
  featured?: boolean
}

export type ArchiveItem = {
  id: string
  type: string
  title: string
  note: string
  tags: string[]
}

export type GraphNode = {
  id: string
  label: string
  kind: 'project' | 'tag' | 'origin' | 'writing' | 'archive'
  x: number
  y: number
  detail: string
  href?: string
  layer?: 'core' | 'thinking' | 'archive'
  tone?: 'unresolved' | 'pressure' | 'holds'
}

export type GraphEdge = {
  source: string
  target: string
  relation?: string
  layer?: 'core' | 'thinking' | 'archive'
}

export const projects: Project[] = [
  {
    id: 'claims-operations',
    number: '01',
    domain: 'Claims operations',
    title: 'Move feedback points upstream.',
    strapline: 'The customer was being blamed for a structural failure.',
    metric: '18% → 7.6% documentation rework',
    tags: ['systems', 'operations', 'problem-definition', 'measurement', 'upstream', 'transfer'],
    summary: 'Verification moved ahead of submission and payment so defects surfaced while the customer still held the paperwork.',
    observed: '18% of packets came back and read as customer error.',
    diagnosed: 'Verification happened after payment was released, when correction had become slower and more expensive.',
    structure: 'A photo-verification checkpoint, representative guide, training curriculum, redesigned customer instructions, and a Wisconsin title-handling handbook.',
    remains: 'The training, guide, and handbook are still in service three years on.',
    capabilities: ['Process redesign', 'Root-cause analysis', 'Operational measurement', 'Frontline enablement'],
  },
  {
    id: 'brand-research',
    number: '02',
    domain: 'Brand + customer research',
    title: 'A survey has two users. I argued for the respondent.',
    strapline: 'Build the instrument leadership can actually decide with.',
    metric: '800+ respondents · 9 days · 20-item ceiling',
    tags: ['research', 'measurement', 'decision', 'question-design', 'evidence', 'respondent'],
    summary: 'Qualitative themes became a scorable instrument that could rank, segment, benchmark, and support strategic action.',
    observed: 'A delivered qualitative study was being treated as a finished answer.',
    diagnosed: 'Leadership had themes but no way to rank, segment, benchmark, or explain them.',
    structure: 'A 20-item instrument spanning awareness, belief, value, experience, trust, and consideration, with segmentation and benchmark structures.',
    remains: 'The instrument was still cited in strategic briefs nine months later.',
    capabilities: ['Instrument design', 'Stakeholder negotiation', 'Question design', 'Research ethics'],
  },
  {
    id: 'enterprise-ai',
    number: '03',
    domain: 'Enterprise AI program',
    title: 'A decision model became the team structure.',
    strapline: 'Turn a pile of proposals into a shared way to decide.',
    metric: '38 proposals → 8 challenge areas',
    tags: ['ai', 'systems', 'decision', 'structure', 'synthesis', 'organizational-design'],
    summary: 'Thirty-eight sponsored proposals were grouped by recurring need, user problem, and deliverable scope into eight challenge areas that became the program structure.',
    observed: '38 proposals with 38 invested sponsors read as a selection problem.',
    diagnosed: 'There was no shared model for deciding between overlapping, testable focus areas.',
    structure: 'Affinity framework, challenge taxonomy, shared criteria set, team operating structure, and workshop facilitation model.',
    remains: 'The eight challenge areas became the program’s team structure.',
    capabilities: ['Synthesis', 'Portfolio prioritization', 'Program design', 'Team structure'],
  },
  {
    id: 'documentation-recovery',
    number: '04',
    domain: 'Documentation evolution + research recovery',
    title: 'Each revision absorbed a defect the last one missed.',
    strapline: 'Treat documentation as a learning system, not a static artifact.',
    metric: '4 revisions · downstream knowledge moved upstream',
    tags: ['knowledge', 'systems', 'research', 'upstream', 'transfer', 'documentation'],
    summary: 'Customer guidance evolved through repeated failures, while a damaged usability study was reconstructed from the interaction record that survived.',
    observed: 'Instructions were repeatedly edited as new customer and process failures surfaced.',
    diagnosed: 'Knowledge about rejected forms lived downstream from the moment where customers could prevent the error.',
    structure: 'Four letter revisions, mileage defect guidance, a Wisconsin title-handling guide, and a reconstruction method for recovering findings from surviving evidence.',
    remains: 'Each revision encoded something the previous version could not catch, turning documentation into organizational memory.',
    capabilities: ['Content governance', 'Documentation systems', 'Defect analysis', 'Methodological adaptation'],
  },
  {
    id: 'civic-service',
    number: '05',
    domain: 'Civic service',
    title: 'What looked like apathy was administrative friction.',
    strapline: 'Model access as dependencies, not features.',
    metric: 'Access = document × identity × authentication × delivery',
    tags: ['service-design', 'systems', 'information-equity', 'field-research', 'dependencies', 'access'],
    summary: 'Door-to-door research surfaced four independently enterable service layers that removed administrative barriers for willing voters.',
    observed: 'Willing people were not registered and the failure was being read as lack of motivation.',
    diagnosed: 'A willing voter could still fail because one missing dependency — printer, copier, notary, ride, postage — collapsed the whole service.',
    structure: 'Print, copy, notary, and transport services; a volunteer canvassing protocol; and a four-layer service architecture.',
    remains: 'The initiative grew to 30+ volunteers and later received a $20,000 community grant after three unfunded months.',
    capabilities: ['Service design', 'Operating models', 'Field research', 'Community partnership'],
  },
  {
    id: 'accessibility-ai',
    number: '06',
    domain: 'Accessibility in AI-assisted development',
    title: 'Automated validation passed. Real-world use still failed.',
    strapline: 'Conformance is not comprehension.',
    metric: 'PASS → FAIL · ΔE 0.40',
    tags: ['accessibility', 'ai', 'research', 'measurement', 'upstream', 'conformance'],
    summary: 'A requirements-first experiment compared automated WCAG validation with human perceptual simulation and exposed a defect the rules did not catch.',
    observed: 'Automated accessibility validation returned a clean result.',
    diagnosed: 'The requirements encoded conformance, but not every perceptual question a person still had to answer.',
    structure: 'Requirements-first accessibility specification, deuteranopia test protocol, experiment design, and escalation finding.',
    remains: 'The finding was escalated and an engineering-built review agent was adopted as an internal source.',
    capabilities: ['Accessibility research', 'Experiment design', 'Design QA', 'Technical specification'],
  },
]

export const writings: Writing[] = [
  {
    id: 'the-bends',
    kind: 'Field note',
    title: 'A Spotlight on The Bends',
    subtitle: 'On depth, lived experience, and what hierarchy costs.',
    excerpt: 'The weight is not the problem to be solved. The question remaining is: Who gets to know what the pressure is doing, and who is listening for it?',
    context: 'A long-form field note using diving, decompression, and transmission as a way to examine how knowledge moves — or fails to move — through organizational hierarchy.',
    tags: ['systems', 'knowledge', 'hierarchy', 'transmission', 'depth', 'organizational-design'],
    featured: true,
  },
  {
    id: 'calculus-of-syntax',
    kind: 'Essay',
    title: 'The Calculus of Syntax',
    subtitle: 'Why grammar keeps turning into geometry.',
    excerpt: 'I began to see S → V → O not as a rule for writing, but as an equation for action.',
    context: 'An exploratory essay connecting an early fascination with grammar to structure, relation, formal systems, and the emerging geometry-of-understanding research direction.',
    tags: ['language', 'structure', 'geometry-of-understanding', 'patterns', 'delta-theory'],
  },
  {
    id: 'conjunction-conjecture',
    kind: 'Essay',
    title: 'Conjunction Conjecture',
    subtitle: 'How small words shape big conversations.',
    excerpt: 'And opens the door. Or focuses the path. Because digs deeper. Even though makes space for nuance.',
    context: 'A practical language note about how apparently tiny structural choices can change the space of possible answers.',
    tags: ['language', 'question-design', 'research', 'facilitation', 'curiosity'],
  },
  {
    id: 'tool-vs-toy',
    kind: 'Essay',
    title: 'AI: A Tool vs. A Toy',
    subtitle: 'Purpose changes what becomes discoverable.',
    excerpt: 'Toys invite interaction, stimulate creativity, and foster learning through exploration.',
    context: 'An early essay asking what changes when AI is approached not only as an instrument for output, but also as a medium for experimentation and discovery.',
    tags: ['ai', 'curiosity', 'experimentation', 'play', 'governance'],
  },
  {
    id: 'mundane-evidence',
    kind: 'Notebook',
    title: 'The mundane is evidence.',
    subtitle: 'Attention before mystification.',
    excerpt: 'Maybe the mundane is the mystical, and the gap we keep feeling is a failure of attention rather than a lack of content.',
    context: 'A notebook thread about ordinary records, interpretation, power, and the histories made visible when attention shifts away from exceptional actors.',
    tags: ['evidence', 'information', 'interpretation', 'attention', 'patterns'],
  },
]

export const archiveItems: ArchiveItem[] = [
  { id: 'archive-wage', type: 'Research sample · 2025', title: 'The Evolution of the Federal Minimum Wage', note: 'Archival writing sample with historical analysis and data visualizations. Kept out of the public reading path until its figures and sources receive a publication pass.', tags: ['research', 'data-viz', 'policy-analysis'] },
  { id: 'archive-dead-internet', type: 'Early essay', title: 'The Dead Internet Theory', note: 'An early business-facing exploration of automation, authenticity, trust, and the distinction between human and machine activity online.', tags: ['ai', 'trust', 'information', 'automation'] },
  { id: 'archive-hive-mind', type: 'Early research paper', title: 'The Singularity: Humanity’s Ascent to a Hive Mind', note: 'An exploratory paper on collective intelligence, technical mediation, privacy, autonomy, and networked consciousness.', tags: ['ai', 'systems', 'collective-intelligence', 'governance'] },
  { id: 'archive-mourning-coffee', type: 'Poem', title: 'Mourning Coffee', note: 'Memory built from ordinary objects, repeated rituals, distance, grief, and the physical evidence of a relationship.', tags: ['memory', 'objects', 'ritual', 'attention'] },
  { id: 'archive-bridge', type: 'Prose fragment', title: 'Ego eram, ultra pontem.', note: 'A bridge, a creek, and the recognition that a familiar route had become a threshold.', tags: ['thresholds', 'movement', 'water', 'reflection'] },
  { id: 'archive-left', type: 'Poem fragment', title: 'What’s left?', note: 'A compact wordplay fragment about what disappears when systems privilege what appears correct, centered, or expected.', tags: ['assumptions', 'accessibility', 'language', 'problem-definition'] },
]

const coreTagDetails: Record<string, string> = {
  curiosity: 'Questioning as a designed practice: looking beyond the prompt toward the structure that produced it.',
  'problem-definition': 'Define the problem at the level where a decision can actually be made.',
  evidence: 'The record, observation, measurement, or signal that can change a definition or decision.',
  systems: 'Relationships, dependencies, actors, feedback, and conditions that create the visible outcome.',
  decision: 'The turn: where evidence becomes a choice, criterion, or shared model.',
  research: 'Research as a way to reduce ambiguity without pretending uncertainty has disappeared.',
  upstream: 'Move the catch point to where correction is still possible and comparatively cheap.',
  measurement: 'Leave a measure behind so the next pass can register whether anything changed.',
  structure: 'Processes, criteria, operating models, specifications, or architectures that make a decision durable.',
  transfer: 'The work outlives the project because ownership, method, or measurement has moved into the system.',
  ai: 'AI as a sociotechnical design problem: requirements, workflows, governance, experimentation, and human review.',
  accessibility: 'Accessibility specified as an upstream requirement rather than inspected as a final-stage correction.',
  'service-design': 'Designing the dependencies and handoffs that allow a service to work across channels and actors.',
  'information-equity': 'Who can access, understand, authenticate, and act on information — and what conditions make that possible.',
  operations: 'The real sequence of work, actors, handoffs, defects, and downstream cost.',
  knowledge: 'When information becomes organizational memory rather than staying trapped in one person.',
}

const thinkingTagDetails: Record<string, string> = {
  'question-design': 'The wording and sequence of questions shape the space of possible answers.',
  respondent: 'The person answering is a user of the instrument; effort, clarity, and framing matter.',
  synthesis: 'Turning many partial views into a shared model without flattening their differences.',
  'organizational-design': 'How teams, ownership, criteria, hierarchy, and operating structure shape what can happen next.',
  documentation: 'Documentation as maintained infrastructure and accumulated organizational memory.',
  'field-research': 'Learning from the conditions in which the service actually has to work.',
  dependencies: 'A service can fail when one apparently small dependency goes to zero.',
  access: 'Access as the ability to complete the whole path, not merely encounter an available feature.',
  conformance: 'Passing encoded rules is necessary, but it does not answer every question of comprehension or use.',
  assumptions: 'What the system treats as given — and therefore may never inspect.',
  infrastructure: 'Structures that shape action before a person experiences them as a choice.',
  'geometry-of-understanding': 'A working phrase for how relation, distance, direction, constraint, and signal shape understanding.',
  patterns: 'Recurrences that become visible only after enough evidence can be held together.',
  'delta-theory': 'The emerging research framework growing from questions about the geometry of understanding.',
  language: 'Language as relational structure: position, connection, and context alter meaning.',
  hierarchy: 'A structure that can fragment perceptual access when knowledge does not move across levels.',
  transmission: 'The architecture that lets knowledge move across roles, levels, media, and moments of consequence.',
  depth: 'A metaphor and research lens for proximity to consequence, complexity, pressure, and lived conditions.',
  information: 'Information as material shaped by where it lives, who can access it, and what form it must take to travel.',
  interpretation: 'Meaning is not extracted in a vacuum; frames and prior structures change what becomes legible.',
  attention: 'What becomes visible when the ordinary is examined closely enough to register as evidence.',
  facilitation: 'Designing conditions for multiple kinds of knowledge to be heard without forcing premature consensus.',
  experimentation: 'Learning by probing a system, testing limits, and observing what changes.',
  play: 'Exploration without a predetermined output can reveal capabilities and constraints a task frame would hide.',
  governance: 'Rules, roles, review, and accountability that shape how a sociotechnical system behaves.',
}

const positions: Record<string, [number, number]> = {
  curiosity: [49, 11], 'problem-definition': [39, 28], evidence: [57, 29], systems: [29, 48], decision: [49, 47], research: [68, 47], upstream: [18, 63], measurement: [37, 65], structure: [55, 65], transfer: [48, 80], ai: [82, 28], accessibility: [82, 58], 'service-design': [71, 76], 'information-equity': [78, 90], operations: [14, 41], knowledge: [20, 80],
  'question-design': [47, 20], respondent: [64, 37], synthesis: [66, 18], 'organizational-design': [64, 58], documentation: [12, 73], 'field-research': [66, 87], dependencies: [67, 69], access: [86, 72], conformance: [92, 66], assumptions: [7, 54], infrastructure: [39, 90], 'geometry-of-understanding': [91, 48], patterns: [76, 39], 'delta-theory': [94, 36], language: [28, 15], hierarchy: [24, 58], transmission: [31, 71], depth: [15, 91], information: [71, 61], interpretation: [84, 45], attention: [88, 22], facilitation: [58, 56], experimentation: [78, 18], play: [90, 12], governance: [92, 54],
}

export const graphNodes: GraphNode[] = [
  { id: 'claims-operations', label: 'Claims operations', kind: 'project', x: 7, y: 23, detail: projects[0].summary, href: '#claims-operations', layer: 'core' },
  { id: 'brand-research', label: 'Brand research', kind: 'project', x: 31, y: 6, detail: projects[1].summary, href: '#brand-research', layer: 'core' },
  { id: 'enterprise-ai', label: 'Enterprise AI', kind: 'project', x: 72, y: 6, detail: projects[2].summary, href: '#enterprise-ai', layer: 'core' },
  { id: 'documentation-recovery', label: 'Documentation + recovery', kind: 'project', x: 7, y: 86, detail: projects[3].summary, href: '#documentation-recovery', layer: 'core' },
  { id: 'civic-service', label: 'Civic service', kind: 'project', x: 59, y: 95, detail: projects[4].summary, href: '#civic-service', layer: 'core' },
  { id: 'accessibility-ai', label: 'Accessibility + AI', kind: 'project', x: 93, y: 82, detail: projects[5].summary, href: '#accessibility-ai', layer: 'core' },

  ...Object.entries(coreTagDetails).map(([tag, detail]) => ({
    id: `tag-${tag}`,
    label: `#${tag}`,
    kind: 'tag' as const,
    x: positions[tag][0],
    y: positions[tag][1],
    detail,
    layer: 'core' as const,
    tone: (['curiosity', 'problem-definition', 'evidence'].includes(tag)
      ? 'unresolved'
      : tag === 'decision'
        ? 'pressure'
        : ['structure', 'transfer'].includes(tag)
          ? 'holds'
          : undefined) as GraphNode['tone'],
  })),
  ...Object.entries(thinkingTagDetails).map(([tag, detail]) => ({ id: `tag-${tag}`, label: `#${tag}`, kind: 'tag' as const, x: positions[tag][0], y: positions[tag][1], detail, layer: 'thinking' as const })),

  { id: 'origin-language', label: 'language is relational', kind: 'origin', x: 16, y: 12, detail: 'An early grammar course taught me to see meaning as something produced through position and relation.', layer: 'thinking' },
  { id: 'origin-seek-understand', label: 'seek to understand', kind: 'origin', x: 58, y: 13, detail: 'A habit strengthened through work and training: listen for intention, context, and the system behind the request.', layer: 'thinking' },
  { id: 'origin-multimodal', label: 'multimodal form', kind: 'origin', x: 87, y: 8, detail: 'Writing, photography, digital design, mixed media, drawing, painting, ceramics, and sculpture reinforced that form and medium shape understanding.', layer: 'thinking' },
  { id: 'origin-delta', label: 'Delta Theory', kind: 'origin', x: 88, y: 41, detail: 'An emerging framework for examining the geometry of understanding — how structure, relation, signal, and movement affect what can be known.', layer: 'thinking', tone: 'unresolved' },
  { id: 'origin-spiral', label: 'loops + spirals', kind: 'origin', x: 29, y: 96, detail: 'Loops return to the same point. Spirals return with a registered difference — a measure, method, or structure left behind.', layer: 'thinking' },

  { id: 'writing-the-bends', label: 'The Bends', kind: 'writing', x: 9, y: 72, detail: writings[0].context, href: '#the-bends', layer: 'thinking' },
  { id: 'writing-calculus-of-syntax', label: 'Calculus of Syntax', kind: 'writing', x: 37, y: 9, detail: writings[1].context, href: '#calculus-of-syntax', layer: 'thinking' },
  { id: 'writing-conjunction-conjecture', label: 'Conjunction Conjecture', kind: 'writing', x: 55, y: 22, detail: writings[2].context, href: '#conjunction-conjecture', layer: 'thinking' },
  { id: 'writing-tool-vs-toy', label: 'Tool vs. Toy', kind: 'writing', x: 84, y: 18, detail: writings[3].context, href: '#tool-vs-toy', layer: 'thinking' },
  { id: 'writing-mundane-evidence', label: 'The mundane is evidence', kind: 'writing', x: 83, y: 34, detail: writings[4].context, href: '#mundane-evidence', layer: 'thinking' },

  { id: 'archive-wage', label: 'Minimum wage study', kind: 'archive', x: 63, y: 83, detail: archiveItems[0].note, href: '#archive', layer: 'archive' },
  { id: 'archive-dead-internet', label: 'Dead Internet', kind: 'archive', x: 93, y: 30, detail: archiveItems[1].note, href: '#archive', layer: 'archive' },
  { id: 'archive-hive-mind', label: 'Hive Mind', kind: 'archive', x: 96, y: 20, detail: archiveItems[2].note, href: '#archive', layer: 'archive' },
  { id: 'archive-mourning-coffee', label: 'Mourning Coffee', kind: 'archive', x: 8, y: 96, detail: archiveItems[3].note, href: '#archive', layer: 'archive' },
  { id: 'archive-bridge', label: 'Ego eram, ultra pontem.', kind: 'archive', x: 17, y: 94, detail: archiveItems[4].note, href: '#archive', layer: 'archive' },
  { id: 'archive-left', label: 'What’s left?', kind: 'archive', x: 6, y: 57, detail: archiveItems[5].note, href: '#archive', layer: 'archive' },
]

const link = (source: string, targets: string[], relation?: string, layer: GraphEdge['layer'] = 'core'): GraphEdge[] =>
  targets.map((target) => ({ source, target, relation, layer }))

export const graphEdges: GraphEdge[] = [
  ...projects.flatMap((project) => project.tags.map((tag) => ({ source: project.id, target: `tag-${tag}`, layer: coreTagDetails[tag] ? 'core' as const : 'thinking' as const }))),

  ...link('tag-curiosity', ['tag-problem-definition', 'tag-research', 'tag-evidence'], 'opens'),
  ...link('tag-evidence', ['tag-decision', 'tag-measurement'], 'informs'),
  ...link('tag-decision', ['tag-structure'], 'becomes'),
  ...link('tag-structure', ['tag-transfer'], 'survives through'),
  ...link('tag-systems', ['tag-operations', 'tag-service-design', 'tag-knowledge'], 'contains'),
  ...link('tag-ai', ['tag-accessibility'], 'requires'),
  ...link('tag-service-design', ['tag-information-equity'], 'depends on'),

  ...link('tag-curiosity', ['tag-question-design', 'tag-experimentation', 'tag-play'], 'opens', 'thinking'),
  ...link('tag-evidence', ['tag-synthesis', 'tag-interpretation', 'tag-attention'], 'becomes legible through', 'thinking'),
  ...link('tag-decision', ['tag-organizational-design', 'tag-facilitation', 'tag-governance'], 'is shaped by', 'thinking'),
  ...link('tag-structure', ['tag-infrastructure', 'tag-transmission', 'tag-documentation'], 'is carried by', 'thinking'),
  ...link('tag-systems', ['tag-hierarchy', 'tag-dependencies', 'tag-depth'], 'contains', 'thinking'),
  ...link('tag-research', ['tag-question-design', 'tag-respondent', 'tag-patterns', 'tag-language'], 'uses', 'thinking'),
  ...link('tag-ai', ['tag-conformance', 'tag-experimentation', 'tag-governance', 'tag-play'], 'raises', 'thinking'),
  ...link('tag-service-design', ['tag-access', 'tag-field-research', 'tag-transmission'], 'depends on', 'thinking'),
  ...link('tag-knowledge', ['tag-transmission', 'tag-information'], 'moves through', 'thinking'),
  ...link('tag-information-equity', ['tag-access', 'tag-information', 'tag-hierarchy'], 'examines', 'thinking'),
  ...link('tag-geometry-of-understanding', ['tag-language', 'tag-patterns', 'tag-systems', 'tag-interpretation'], 'relates', 'thinking'),

  ...link('origin-language', ['tag-language', 'tag-curiosity', 'tag-research', 'tag-patterns'], 'shaped', 'thinking'),
  ...link('origin-seek-understand', ['tag-curiosity', 'tag-problem-definition', 'tag-research'], 'shaped', 'thinking'),
  ...link('origin-multimodal', ['tag-accessibility', 'tag-information-equity', 'tag-information'], 'shaped', 'thinking'),
  ...link('origin-delta', ['tag-geometry-of-understanding', 'tag-systems', 'tag-evidence', 'tag-decision', 'tag-structure', 'tag-delta-theory'], 'examines', 'thinking'),
  ...link('origin-spiral', ['tag-measurement', 'tag-transfer', 'tag-systems', 'tag-patterns'], 'models', 'thinking'),

  ...link('writing-the-bends', ['tag-systems', 'tag-knowledge', 'tag-hierarchy', 'tag-transmission', 'tag-depth', 'tag-organizational-design'], 'examines', 'thinking'),
  ...link('writing-calculus-of-syntax', ['tag-language', 'tag-structure', 'tag-geometry-of-understanding', 'tag-patterns', 'tag-delta-theory'], 'explores', 'thinking'),
  ...link('writing-conjunction-conjecture', ['tag-language', 'tag-question-design', 'tag-research', 'tag-facilitation', 'tag-curiosity'], 'explores', 'thinking'),
  ...link('writing-tool-vs-toy', ['tag-ai', 'tag-curiosity', 'tag-experimentation', 'tag-play', 'tag-governance'], 'explores', 'thinking'),
  ...link('writing-mundane-evidence', ['tag-evidence', 'tag-information', 'tag-interpretation', 'tag-attention', 'tag-patterns'], 'explores', 'thinking'),

  ...link('archive-wage', ['tag-research', 'tag-measurement', 'tag-information'], 'archives', 'archive'),
  ...link('archive-dead-internet', ['tag-ai', 'tag-information', 'tag-governance'], 'archives', 'archive'),
  ...link('archive-hive-mind', ['tag-ai', 'tag-systems', 'tag-governance'], 'archives', 'archive'),
  ...link('archive-mourning-coffee', ['tag-attention', 'tag-information'], 'archives', 'archive'),
  ...link('archive-bridge', ['tag-depth', 'tag-curiosity', 'tag-patterns'], 'archives', 'archive'),
  ...link('archive-left', ['tag-problem-definition', 'tag-accessibility', 'tag-assumptions', 'tag-language'], 'archives', 'archive'),
]

export const graphTagIds = new Set(graphNodes.filter((node) => node.kind === 'tag').map((node) => node.id.replace(/^tag-/, '')))
