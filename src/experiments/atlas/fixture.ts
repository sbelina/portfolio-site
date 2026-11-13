import { z } from 'zod'

export const fixtureMarker = 'ATLAS_SYNTHETIC_PROOF_13NOV'
export const atlasPath = '/lab/atlas/'
export const dimensions = ['question', 'mechanism', 'methods', 'scale', 'setting'] as const
export type Dimension = typeof dimensions[number]
const text = z.string().trim().min(1).max(2500)
const id = z.string().regex(/^fixture-[a-z0-9-]+$/)
const tags = z.array(z.string().regex(/^[a-z0-9-]+$/)).min(1).max(8).refine(items => new Set(items).size === items.length, 'Duplicate classification tag')
const profileSchema = z.strictObject({ question: tags, mechanism: tags, methods: tags, scale: tags, setting: tags })
const caseSchema = z.strictObject({ id, title: text, observation: text, interpretation: text, limitation: text, sourcePassage: text, profile: profileSchema })
const relationshipSchema = z.strictObject({
  id, fromId: id, toId: id, type: z.enum(['shares-question', 'informed', 'may-contrast']),
  rationale: text, difference: text, status: z.enum(['documented', 'interpreted', 'proposed']),
  boundary: text, sourcePassage: text.optional(), directional: z.boolean(),
})
const fixtureSchema = z.strictObject({
  schemaVersion: z.literal(1), fixtureOnly: z.literal(true), marker: z.literal(fixtureMarker),
  rubricVersion: z.literal('synthetic-tag-overlap-1'),
  weights: z.strictObject({ question: z.number(), mechanism: z.number(), methods: z.number(), scale: z.number(), setting: z.number() }),
  cases: z.array(caseSchema).length(6), relationships: z.array(relationshipSchema),
  routes: z.array(z.strictObject({ id, title: text, rationale: text, caseIds: z.array(id).min(2) })),
  terms: z.array(z.strictObject({ id, title: text, definition: text, boundary: text })),
}).superRefine((value, ctx) => {
  const allIds = [...value.cases, ...value.relationships, ...value.routes, ...value.terms].map(item => item.id)
  if (allIds.length !== new Set(allIds).size) ctx.addIssue({code:'custom',message:'Duplicate fixture identity'})
  const cases = new Set(value.cases.map(item => item.id))
  for (const edge of value.relationships) {
    if (!cases.has(edge.fromId) || !cases.has(edge.toId) || edge.fromId === edge.toId) ctx.addIssue({code:'custom',message:'Invalid relationship endpoints'})
    if ((edge.type === 'informed') !== edge.directional || (edge.directional && edge.status !== 'documented')) ctx.addIssue({code:'custom',message:'Only documented dependencies receive arrows'})
    if (edge.status === 'documented' && !edge.sourcePassage) ctx.addIssue({code:'custom',message:'Documented fictional relation requires its source passage'})
  }
  for (const route of value.routes) if (route.caseIds.some(item=>!cases.has(item)) || new Set(route.caseIds).size !== route.caseIds.length) ctx.addIssue({code:'custom',message:'Invalid reading route'})
  if (Object.values(value.weights).some(weight=>!Number.isFinite(weight)||weight<0) || Math.abs(Object.values(value.weights).reduce((a,b)=>a+b,0)-1)>1e-10) ctx.addIssue({code:'custom',message:'Invalid rubric weights'})
})
export type AtlasFixture = z.infer<typeof fixtureSchema>
export const validateFixture = (input: unknown): AtlasFixture => fixtureSchema.parse(input)

export const fixture = validateFixture({
  schemaVersion:1,fixtureOnly:true,marker:fixtureMarker,rubricVersion:'synthetic-tag-overlap-1',
  weights:{question:.35,mechanism:.30,methods:.15,scale:.10,setting:.10},
  cases:[
    {id:'fixture-opened-notice',title:'Opened notice',
      observation:'An invented workshop record marks a notice opened. A recipient asks which entrance the notice describes.',
      interpretation:'The recorded opening may not establish that the recipient understood the location.',
      limitation:'An opening marker and one question do not establish comprehension or explain why the question arose.',
      sourcePassage:'Fictional script: “Notice marked opened. Recipient: Which entrance does this describe?”',
      profile:{question:['limits-of-signals'],mechanism:['proxy-assumption'],methods:['record-comparison'],scale:['encounter'],setting:['communications']}},
    {id:'fixture-green-card',title:'Green card',
      observation:'An invented materials card is green. A facilitator asks whether the kit contains its adapter.',
      interpretation:'The status color and physical readiness are different accounts of the kit.',
      limitation:'The script contains a question, not a verified missing adapter, delay or performance result.',
      sourcePassage:'Fictional script: “Kit card: green. Facilitator: Does this kit contain its adapter?”',
      profile:{question:['limits-of-signals'],mechanism:['proxy-assumption'],methods:['record-comparison'],scale:['encounter'],setting:['materials']}},
    {id:'fixture-shared-name',title:'Shared name',
      observation:'Two invented organizers give different meanings for the phrase “open table”.',
      interpretation:'Using the same phrase may conceal a difference in expectations.',
      limitation:'Two definitions do not establish that any disagreement or access barrier occurred.',
      sourcePassage:'Fictional script: “Organizer A: open table means no booking. Organizer B: open table means beginners welcome.”',
      profile:{question:['shared-meaning'],mechanism:['category-mismatch'],methods:['account-comparison'],scale:['coordination'],setting:['communications']}},
    {id:'fixture-repeated-request',title:'Repeated request',
      observation:'An invented request card asks which checklist applies after a rule was copied into it.',
      interpretation:'A request may identify unresolved context without identifying its cause.',
      limitation:'The script does not establish that the rule caused confusion or repeated work.',
      sourcePassage:'Fictional script: “The organizer used the changed rule to write the request card. The same card was used for a later request asking which checklist applied.”',
      profile:{question:['conditions-of-action'],mechanism:['context-gap'],methods:['record-comparison'],scale:['coordination'],setting:['communications']}},
    {id:'fixture-quiet-session',title:'Quiet session',
      observation:'An invented welcome session records no questions. A later message asks whether visitors may use the tools.',
      interpretation:'Silence during a session does not by itself establish that expectations were understood.',
      limitation:'The later question does not reveal what anyone understood during the session or why they were quiet.',
      sourcePassage:'Fictional script: “Welcome session: no questions recorded. Later message: May visitors use the tools?”',
      profile:{question:['limits-of-signals','shared-meaning'],mechanism:['proxy-assumption','context-gap'],methods:['account-comparison'],scale:['encounter'],setting:['participation']}},
    {id:'fixture-changed-rule',title:'Changed rule',
      observation:'An invented organizer copies a new rule into a request card before a later request is recorded.',
      interpretation:'This records a dependency in preparing an instruction, not the success of that instruction.',
      limitation:'The sequence establishes neither that the rule was useful nor that it caused the later question.',
      sourcePassage:'Fictional script: “The organizer used the changed rule to write the request card. The same card was used for a later request asking which checklist applied.”',
      profile:{question:['conditions-of-action'],mechanism:['category-mismatch'],methods:['record-comparison'],scale:['coordination'],setting:['materials']}},
  ],
  relationships:[
    {id:'fixture-signals-comparison',fromId:'fixture-opened-notice',toId:'fixture-quiet-session',type:'shares-question',directional:false,status:'interpreted',rationale:'Both ask what a recorded signal can establish about understanding.',difference:'An opened message and silence in a session are different observations, not interchangeable measures.',boundary:'No common cause, comprehension level or effect is established.'},
    {id:'fixture-status-comparison',fromId:'fixture-green-card',toId:'fixture-changed-rule',type:'shares-question',directional:false,status:'interpreted',rationale:'Both invite inspection of what an administrative representation leaves unverified.',difference:'One concerns a kit status; the other records preparation of an instruction.',boundary:'This is an analogy about inquiry, not a shared finding or operational mechanism.'},
    {id:'fixture-card-dependency',fromId:'fixture-changed-rule',toId:'fixture-repeated-request',type:'informed',directional:true,status:'documented',rationale:'The fictional record explicitly identifies the changed rule as an input to writing the request card used in the later account.',difference:'Preparing the instruction and receiving a request are distinct activities.',boundary:'The arrow indicates a documented preparation dependency only; it does not assert that the rule caused the request.',sourcePassage:'Fictional script: “The organizer used the changed rule to write the request card. The same card was used for a later request asking which checklist applied.”'},
    {id:'fixture-unresolved-comparison',fromId:'fixture-shared-name',toId:'fixture-green-card',type:'may-contrast',directional:false,status:'proposed',rationale:'A shared label might be worth comparing with a status label.',difference:'The accounts concern different kinds of language and contain no shared observed mechanism.',boundary:'Excluded from drawn connections. A common word is insufficient to establish a meaningful relationship.'},
  ],
  routes:[
    {id:'fixture-route-signals',title:'What a signal leaves open',rationale:'An editorial order for comparing limits, not a chain of causes or an input to distance.',caseIds:['fixture-opened-notice','fixture-green-card','fixture-quiet-session']},
    {id:'fixture-route-meaning',title:'Where meanings separate',rationale:'A reading order that moves across different questions without asserting equal findings.',caseIds:['fixture-shared-name','fixture-opened-notice','fixture-repeated-request']},
    {id:'fixture-route-action',title:'From an instruction to a question',rationale:'A curated path, with only the separately recorded dependency eligible for an arrow.',caseIds:['fixture-changed-rule','fixture-repeated-request','fixture-quiet-session']},
  ],
  terms:[
    {id:'fixture-term-readiness',title:'Readiness',definition:'In this fictional account, having the conditions needed for the next activity.',boundary:'A green status does not establish every required condition.'},
    {id:'fixture-term-understanding',title:'Understanding',definition:'A working interpretation of what information means in a specified situation.',boundary:'Neither opening a notice nor remaining silent is a direct measure of this construct.'},
    {id:'fixture-term-evidence',title:'Evidence',definition:'An observation or account used to support a bounded assertion.',boundary:'Its relevance to an assertion must be explained; availability is not sufficient support.'},
  ],
})

/** Explicit illustrative rubric: each dimension uses Jaccard overlap of authored tags. */
export function layoutInput(account = fixture) {
  const cases = [...account.cases].sort((a,b)=>a.id.localeCompare(b.id,'en'))
  return {
    schemaVersion:1 as const,rubricVersion:account.rubricVersion,weights:account.weights,
    cases:cases.map(({id,title})=>({id,title})),
    pairs:cases.flatMap((left,index)=>cases.slice(index+1).map(right=>({
      fromId:left.id,toId:right.id,
      scores:Object.fromEntries(dimensions.map(dimension=>{
        const first = new Set(left.profile[dimension]); const second = new Set(right.profile[dimension])
        const intersection = [...first].filter(tag=>second.has(tag)).length
        return [dimension,intersection / new Set([...first,...second]).size]
      })) as Record<Dimension,number>,
      rationale:dimensions.map(dimension=>`${dimension}: [${left.profile[dimension].join(', ')}] compared with [${right.profile[dimension].join(', ')}].`).join(' '),
    }))),
  }
}
