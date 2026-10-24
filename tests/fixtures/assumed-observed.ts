/** Original, wholly synthetic interface test data; not Sam's work or evidence. */
import type { Entry, Evidence } from '../../src/content/model'
import type { AssumedObservedBlock } from '../../src/content/assumed-observed'
const id=(n:number)=>`90000000-0000-4000-8000-${String(n).padStart(12,'0')}`
export const assumedObservedFixture:AssumedObservedBlock={
 id:id(1),type:'assumed_observed',componentVersion:1,title:'Assumed → observed',
 question:'A synthetic handoff: what changes when we compare the stated process with the receiving role’s account?',
 assumptions:[
  {id:id(11),label:'Sending the guide means the next role can use it.',sourcePassage:'Synthetic script: “Once the guide is sent, the receiving role has what it needs.”'},
  {id:id(12),label:'The checklist represents all the work.',sourcePassage:'Synthetic script: “The checklist describes the complete handoff.”'},
  {id:id(13),label:'Another reminder will resolve the gap.',sourcePassage:'Synthetic script: “If the handoff stalls, send a reminder.”'},
 ],
 observations:[
  {id:id(21),label:'Receipt did not explain where to look.',evidenceId:id(31),passage:'Invented receiving-role account: “I received the guide, but I still had to ask where the relevant answer was.”'},
  {id:id(22),label:'Repair work sat outside the checklist.',evidenceId:id(32),passage:'Invented annotated checklist: “Send guide → acknowledge receipt.” A margin note records an additional search for the relevant answer.'},
  {id:id(23),label:'The role asked for a usable location.',evidenceId:id(33),passage:'Invented follow-up question: “Could the handoff point to the part I need, rather than repeat the notification?”'},
 ],
 connections:[
  {id:id(41),assumptionId:id(11),observationId:id(21),meaning:'challenges',status:'documented',explanation:'The invented account explicitly distinguishes receiving the guide from locating an answer. It challenges the assumption of immediate usability.',limitation:'This is a scripted contrast. It establishes nothing about a real workplace or the effect of sending a guide.',missingEvidence:[]},
  {id:id(42),assumptionId:id(12),observationId:id(22),meaning:'challenges',status:'interpretation',explanation:'Treating the unlisted search as hidden work is an interpretation of the invented annotation. The checklist alone does not establish the whole process.',limitation:'An omitted step may be intentional. No observation establishes how often this work occurs.',missingEvidence:['A source-reviewed account of the intended checklist scope.']},
  {id:id(43),assumptionId:id(13),observationId:id(21),meaning:'qualifies',status:'interpretation',explanation:'If locating information is the difficulty, repeating receipt information may leave that difficulty unresolved. This is a possible reading, not a measured causal effect.',limitation:'The fixture contains no test comparing reminders with other responses.',missingEvidence:['A comparison of the receiving role’s task before and after a reminder.']},
  {id:id(44),assumptionId:id(13),observationId:id(23),meaning:'supports',status:'hypothesis',explanation:'A reminder that points to a usable location might help. The invented question suggests something to test, not proof that it would work.',limitation:'The hypothesis has not been evaluated. No improvement or outcome is claimed.',missingEvidence:['An observed task using a location-specific handoff, with counterexamples and source limitations.']},
 ],
}
export function visualFixture(){
 const date='2000-01-01T00:00:00Z'
 const entry:Entry={schemaVersion:1,id:id(2),revision:1,kind:'experiment',slug:'fixture-assumed-observed',title:'Fixture: inspect a synthetic handoff',summary:'An isolated, invented example for testing whether assumptions, sources and relationship meanings can be inspected. No human comprehension result is established.',createdAt:date,updatedAt:date,editorialState:'approved',visibility:'public',authorIds:['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'],topicIds:[],contribution:'Synthetic interface demonstration, not an account of Sam’s contribution.',evidenceIds:[],blocks:[{id:id(3),type:'prose',markdown:'## A question before the diagram\n\nThis is an invented script for interface testing. The observations below are fictional records, not fieldwork. The geometry carries no measured duration, strength or causal weight.\n\nSYNTHETIC_AO_FIXTURE_4c2b'},assumedObservedFixture,{id:id(4),type:'callout',label:'Limitations',markdown:'No actual workplace, participant, measured outcome or approved manuscript supports this demonstration. Automated interaction checks cannot establish improved comprehension. The current article stays here while its supporting account is inspected.'}]}
 const evidence:Evidence[]=[31,32,33].map((n,i)=>({schemaVersion:1,id:id(n),revision:1,visibility:'public',reviewState:'approved',title:['Invented receiving-role account','Invented annotated checklist','Invented follow-up question'][i],source:'Synthetic demonstration script',locator:`Invented record ${String.fromCharCode(65+i)} — not an external source`,observedAt:date,role:'context',limitations:'Invented solely for interface testing. This is not real evidence, measured data or an approved public claim.',assetIds:[],rights:'cleared',redaction:'not-required',kind:'reference'}))
 return {entry,evidence}
}
