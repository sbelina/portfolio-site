/**
 * Field Notes and earlier writing, kept in their own module so pages that show them do not bundle
 * the previous edition's case text (src/data.ts). Moved 23 November 2026; wording unchanged.
 */
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
