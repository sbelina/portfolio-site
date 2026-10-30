export type Project = {
  id: string
  number: string
  domain: string
  title: string
  strapline: string
  focus: string
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
    title: 'When “complete” still generated work.',
    strapline: 'A handoff can be finished on paper while correction is still ahead.',
    focus: 'Question: when can an error still be corrected?',
    tags: ['systems', 'operations', 'problem-definition', 'measurement', 'upstream', 'transfer'],
    summary: 'Sami began the investigation unassigned, built an evidence record and led work to place salvage review before payment. IAA determines document sufficiency; adjusters release payment. The full account requires source review.',
    observed: 'Recurring clarification and rework followed paperwork marked complete.',
    diagnosed: 'Working interpretation: the recorded handoff and the later acceptance check described different states.',
    structure: 'Two connected responses: earlier verification, and administrator meetings that surfaced practitioner knowledge for a shared guide and separate training resources.',
    remains: 'Statewide guide use is owner-reported. Measurement scope and continued use require review; error-log categories did not become the guide structure.',
    capabilities: ['Process redesign', 'Root-cause analysis', 'Operational measurement', 'Frontline enablement'],
  },
  {
    id: 'brand-research',
    number: '02',
    domain: 'Perception mapping + trust research',
    title: 'Agreement and trust were different questions.',
    strapline: 'A respondent can agree with a statement without saying it shapes trust.',
    focus: 'Distinction: agreement versus reported influence on trust',
    tags: ['research', 'measurement', 'decision', 'question-design', 'evidence', 'respondent'],
    summary: 'Sami designed the study live with two peers; a vendor fielded it. Stakeholders later cited findings in briefs. The source and disclosure scope need review.',
    observed: 'Agreement with a statement and its reported influence on trust were separate responses.',
    diagnosed: 'Interpretation: treating those responses as interchangeable would obscure what the instrument could say.',
    structure: 'A respondent-conscious survey instrument, fielded by a vendor.',
    remains: 'Statistics were cited in briefs; a change in trust or business outcomes was not established.',
    capabilities: ['Instrument design', 'Stakeholder negotiation', 'Question design', 'Research ethics'],
  },
  {
    id: 'enterprise-ai',
    number: '03',
    domain: 'Enterprise AI program',
    title: 'A decision model became the team structure.',
    strapline: 'Turn a pile of proposals into a shared way to decide.',
    focus: '38 proposals grouped into 8 challenge areas',
    tags: ['ai', 'systems', 'decision', 'structure', 'synthesis', 'organizational-design'],
    summary: 'Sami synthesized proposals into shared challenge areas to support team decisions. Program design and later outcomes involved other people; the exact account needs source review.',
    observed: 'Proposals represented overlapping needs, not necessarily distinct problems.',
    diagnosed: 'Interpretation: the group needed a shared way to discuss areas of need before choosing work.',
    structure: 'A synthesis and challenge-area framework; Sami also led one team within the larger program.',
    remains: 'The grouping supported coordination. Deployed AI solutions or program outcomes are not established here.',
    capabilities: ['Synthesis', 'Portfolio prioritization', 'Program design', 'Team structure'],
  },
  {
    id: 'documentation-recovery',
    number: '04',
    domain: 'Claims knowledge work · legacy reference',
    title: 'Make the next handoff easier to understand.',
    strapline: 'Guidance, support training, and onboarding served different audiences.',
    focus: 'Related claims chapter; not a separate measured case',
    tags: ['knowledge', 'systems', 'operations', 'upstream', 'transfer', 'documentation'],
    summary: 'A legacy reference within the claims story. The separate recovery of a telematics study belongs with that investigation and awaits its own reviewed account.',
    observed: 'Guidance and training needs appeared at different points in the paperwork process.',
    diagnosed: 'Working interpretation: the same explanation could not serve every role or handoff.',
    structure: 'A paperwork reference guide, a total-loss support training deck, and an administrative onboarding program, kept distinct.',
    remains: 'Continued use is reported; dates, reach, and exact contribution need review.',
    capabilities: ['Content governance', 'Documentation systems', 'Training design', 'Knowledge transfer'],
  },
  {
    id: 'civic-service',
    number: '05',
    domain: 'Civic service',
    title: 'Voting questions did not follow service categories.',
    strapline: 'Access depended on understandable answers and practical support.',
    focus: 'Question: what did residents need to do next?',
    tags: ['service-design', 'systems', 'information-equity', 'field-research', 'dependencies', 'access'],
    summary: 'Sami co-founded the nonpartisan Vote Huntsville initiative in 2020 and helped collaborators organize plain-language answers across channels. Project reach and later continuity need source and permission review.',
    observed: 'Residents’ questions did not always match the categories used to organize voting information.',
    diagnosed: 'Interpretation: practical dependencies could interrupt a willing person’s path to participation.',
    structure: 'A shared answer source for hotline, print, web, and events, alongside practical service support.',
    remains: 'The project evolved; current naming, continuity, and individual contribution require verification.',
    capabilities: ['Service design', 'Operating models', 'Field research', 'Community partnership'],
  },
  {
    id: 'accessibility-ai',
    number: '06',
    domain: 'Accessibility in AI-assisted development',
    title: 'A person noticed a question the checks did not settle.',
    strapline: 'The agent restored removed code; planned human review asked a separate perceptual question.',
    focus: 'Distinct tests: code recovery and simulated color perception',
    tags: ['accessibility', 'ai', 'research', 'measurement', 'upstream', 'conformance'],
    summary: 'Sami originated this prototype experiment and was invited to co-facilitate. A coding agent and an accessibility agent iterated on a front-end Pomodoro timer; the deliberately removed accessibility code was restored. Planned human review separately flagged potentially weak state distinction under simulated deuteranopia.',
    observed: 'The agent restored code as intended. Under simulation, one developer questioned the visual distinction between labeled Focus and Break states.',
    diagnosed: 'Interpretation: passing the code-recovery test did not settle the separate question of visual state distinction.',
    structure: 'A coding agent, an accessibility agent and planned human review addressed different risks; both states retained text labels.',
    remains: 'The prototype informed a separate experiment already in progress. Its repository was later archived as a security precaution; reduced remediation remains an intended benefit.',
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
  { id: 'documentation-recovery', label: 'Claims knowledge reference', kind: 'project', x: 7, y: 86, detail: projects[3].summary, href: '#documentation-recovery', layer: 'core' },
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
