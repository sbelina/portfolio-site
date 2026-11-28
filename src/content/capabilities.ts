/**
 * Capability registry: one place that says which approved case
 * demonstrates which recognizable professional capability. The homepage, the Work filters, each case's
 * "more work like this" links, and the methods inventory all read from here, so a classification is
 * changed once. A capability appears only when at least one published case demonstrates it.
 *
 * Classifications are editorial: they say what kind of work a case shows, not that the case proves
 * mastery of the whole field.
 */
export const capabilities = [
  { id: 'organizational-effectiveness', label: 'Organizational effectiveness', text: 'Diagnosing why work goes wrong, and redesigning where checks and effort sit.' },
  { id: 'research-strategy', label: 'Research strategy', text: 'Deciding what to ask, of whom, and what an answer can and cannot support.' },
  { id: 'service-design', label: 'Service design', text: 'Designing services around how people move through them.' },
  { id: 'measurement', label: 'Measurement and evaluation', text: 'Making sure a measure answers the question it is used for.' },
  { id: 'responsible-ai', label: 'Responsible AI', text: 'Using AI where it helps, with human judgment kept where it matters.' },
  { id: 'knowledge-systems', label: 'Knowledge and information systems', text: 'Making knowledge findable, classifiable and carried by others.' },
  { id: 'strategic-innovation', label: 'Strategic innovation', text: 'Framing scattered ideas as shared problems an organization can choose among.' },
] as const

export type CapabilityId = typeof capabilities[number]['id']

/** Which capabilities each published case demonstrates (by case slug). */
export const caseCapabilities: Readonly<Record<string, readonly CapabilityId[]>> = {
  'claims-operations': ['organizational-effectiveness', 'service-design', 'knowledge-systems'],
  'brand-research': ['research-strategy', 'measurement'],
  'enterprise-ai': ['strategic-innovation', 'responsible-ai'],
  telematics: ['research-strategy', 'measurement'],
  'civic-service': ['service-design', 'knowledge-systems'],
  'accessibility-ai': ['responsible-ai', 'measurement'],
  'operational-friction': ['organizational-effectiveness'],
  'knowledge-binder': ['knowledge-systems', 'organizational-effectiveness'],
  'knowledge-publishing': ['knowledge-systems', 'measurement'],
}

export const capabilityLabel = (id: string) => capabilities.find(item => item.id === id)?.label
export const capabilitiesOf = (slug?: string) => (slug ? caseCapabilities[slug] ?? [] : []).map(id => capabilities.find(item => item.id === id)!).filter(Boolean)
/** Capabilities shown publicly: only those demonstrated by at least one of the given published slugs. */
export const demonstratedCapabilities = (slugs: readonly string[]) => capabilities
  .map(capability => ({ ...capability, slugs: slugs.filter(slug => caseCapabilities[slug]?.includes(capability.id)) }))
  .filter(capability => capability.slugs.length > 0)
/** The Work collection, filtered by one capability. */
export const workHref = (id?: string) => id ? `/investigations/?capability=${id}` : '/investigations/'

/**
 * Methods inventory (Practice): each method links only to cases whose public text shows it.
 * Families follow the directive; no method claims a formal credential.
 */
export const methodFamilies = [
  { family: 'Inquiry and research', methods: [
    { method: 'Interviews and qualitative research', slugs: ['brand-research', 'civic-service'] },
    { method: 'Behavioral observation', slugs: ['telematics'] },
    { method: 'Document and content analysis', slugs: ['knowledge-publishing'] },
    { method: 'Survey and instrument design', slugs: ['brand-research'] },
    { method: 'Workflow observation', slugs: ['operational-friction'] },
    { method: 'Exception analysis', slugs: ['claims-operations'] },
    { method: 'Research recovery', slugs: ['telematics'] },
    { method: 'Evidence synthesis', slugs: ['enterprise-ai'] },
  ] },
  { family: 'Representation and design', methods: [
    { method: 'Service blueprinting', slugs: ['claims-operations'] },
    { method: 'Process mapping and task decomposition', slugs: ['operational-friction'] },
    { method: 'Information architecture', slugs: ['civic-service', 'knowledge-binder'] },
    { method: 'Knowledge classification', slugs: ['knowledge-publishing'] },
    { method: 'Prototyping', slugs: ['accessibility-ai'] },
  ] },
  { family: 'Strategy and enablement', methods: [
    { method: 'Opportunity framing and problem synthesis', slugs: ['enterprise-ai'] },
    { method: 'Stakeholder facilitation', slugs: ['enterprise-ai', 'claims-operations'] },
    { method: 'Research-informed recommendations', slugs: ['claims-operations', 'brand-research'] },
    { method: 'Knowledge transfer', slugs: ['claims-operations', 'knowledge-binder'] },
  ] },
] as const

/** Research agenda (Practice): continuing interests, not established theories. */
export const researchAgenda = [
  { theme: 'Measurement and representation', question: 'When do organizational indicators fail to represent the conditions they are meant to describe?', slugs: ['brand-research', 'telematics', 'knowledge-publishing'] },
  { theme: 'Information and interpretation', question: 'How do language, categories and information structures shape what people and institutions understand?', slugs: ['civic-service', 'knowledge-publishing', 'claims-operations'] },
  { theme: 'Human judgment and artificial intelligence', question: 'Which parts of interpretation can be delegated to computational systems, and which need situated human judgment?', slugs: ['accessibility-ai', 'enterprise-ai'] },
  { theme: 'Organizational knowledge and adaptation', question: 'How does knowledge reach the people who decide, and how does it stay usable over time?', slugs: ['claims-operations', 'knowledge-binder', 'operational-friction'] },
] as const
