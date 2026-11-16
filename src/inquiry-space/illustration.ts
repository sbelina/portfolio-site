// Build-only, owner-authorized synthetic illustration. Never import a private
// workspace or the broader test fixture corpus into the production publisher.
import type { ContentStore, Entry, ReleaseManifest } from '../content/model'
import { digestRecord, validateCandidateProjection } from '../content/projection'

export const inquiryIllustrationMarker = 'INQUIRY_SPACE_PUBLIC_ILLUSTRATION_16NOV'
export const illustrationVerse = '  An edge holds a little room.\nA bracket opens—\n\n\tand waits.\n    No answer has to stand here.\n'
const date='2026-11-14T00:00:00Z' // Illustration revision, not an empirical observation.
const base={schemaVersion:1 as const,revision:1,editorialState:'approved' as const,visibility:'public' as const,createdAt:date,updatedAt:date,authorIds:['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],topicIds:[],evidenceIds:[]}
const inquiry={schemaVersion:1 as const,presentation:'fragment' as const,form:'glimmer' as const,epistemicMode:'open_question' as const,featured:true}
export const illustrationEntries:Entry[]=[
  {...base,id:'b1000000-0000-4000-8000-000000000001',kind:'observation',format:'field_note',slug:'illustration-folded-margin',title:'A folded margin',summary:'An invented observation held open, without a proposed outcome.',inquirySpace:{...inquiry,prompt:'What becomes a boundary when I fold the margin?',origin:'Invented for this interface illustration; not copied from a notebook.'},blocks:[{id:'b2000000-0000-4000-8000-000000000001',type:'prose',markdown:'A folded strip leaves an edge beside an edge.\n\nFor a moment, I look at the space between them.'}]},
  {...base,id:'b1000000-0000-4000-8000-000000000002',kind:'reference',slug:'illustration-unlabelled-tab',title:'An unlabelled tab',summary:'A synthetic question about an invitation whose meaning is not supplied.',inquirySpace:{...inquiry,form:'question',prompt:'If a blank tab stays beside a labelled one, what might you expect?',unresolvedQuestion:'No response or explanation has been collected.'},blocks:[{id:'b2000000-0000-4000-8000-000000000002',type:'prose',markdown:'A rectangle sits beside a word.\n\nThis invented scene supplies neither a task nor a measured response.'}]},
  {...base,id:'b1000000-0000-4000-8000-000000000003',kind:'perspective',format:'poetry',slug:'illustration-open-bracket',title:'An open bracket',summary:'Invented literal verse, complete as a fragment without an explanatory layer.',inquirySpace:{...inquiry,form:'expression',epistemicMode:'expression'},blocks:[{id:'b2000000-0000-4000-8000-000000000003',type:'verse',text:illustrationVerse}]},
]
export const inquiryIllustrationStore:ContentStore={entries:illustrationEntries,relationships:[{schemaVersion:1,id:'b3000000-0000-4000-8000-000000000001',revision:1,visibility:'public',reviewState:'approved',fromId:illustrationEntries[0].id,toId:illustrationEntries[1].id,type:'paired_with',rationale:'Both invented fragments draw attention to an edge before a task is specified. This is an authored resonance, not an observed human response.',evidenceIds:[],provenance:'import',exploration:{schemaVersion:1,level:'resonance',featured:true,boundary:'Folding changes a physical surface; a tab is a conventional interface sign. The resemblance does not establish similar effects or a common mechanism.',usefulQuestion:'When does an edge become an invitation?'}}],evidence:[],assets:[],aliases:[]}

/** Mechanical validation only. Authority is the owner's16November release
 * instruction, recorded with the exact release commit; JSON flags are not auth. */
export function inquiryIllustrationProjection() {
  const refs=<T extends {id:string;revision:number}>(records:T[])=>records.map(record=>({id:record.id,revision:record.revision,digest:digestRecord(record)}))
  const manifest:ReleaseManifest={schemaVersion:1,releaseId:'b4000000-0000-4000-8000-000000000002',applicationRevision:'0'.repeat(40),contentRevision:'0'.repeat(40),entries:refs(inquiryIllustrationStore.entries),relationships:refs(inquiryIllustrationStore.relationships),evidence:[],assets:[],aliases:[]}
  return validateCandidateProjection(inquiryIllustrationStore,manifest)
}
