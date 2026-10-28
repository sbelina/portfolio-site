// Research-only desk trial. No approvals here authorize publication.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { buildPublicProjection,digestRecord } from '../../../src/content/projection'
import { projects } from '../../../src/data'
import { applyAction,emptyWorkspace,passes } from '../../../studio/model'
const root=fileURLToPath(new URL('../../../',import.meta.url))
const id=(n:number)=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`
const date='2000-01-01T00:00:00Z'
const entry=(n:number,extra:any={})=>({schemaVersion:1,id:id(n),revision:1,kind:'investigation',format:'case',slug:`synthetic-desk-${n}`,title:'Synthetic desk entry',summary:'Synthetic only',editorialState:'approved',visibility:'public',createdAt:date,updatedAt:date,authorIds:[id(90)],topicIds:[],contribution:'Synthetic fixture author',blocks:[{id:id(n+100),type:'prose',markdown:'Synthetic prose, not an owner manuscript.'}],evidenceIds:[],...extra})
const store=()=>({entries:[entry(1)],relationships:[],evidence:[],assets:[],aliases:[]})
const refs=(rows:any[])=>rows.map(r=>({id:r.id,revision:r.revision,digest:digestRecord(r)}))
const manifest=(s:any)=>({schemaVersion:1,releaseId:id(80),applicationRevision:'a'.repeat(40),contentRevision:'b'.repeat(40),entries:refs([s.entries[0]]),relationships:refs(s.relationships),evidence:refs(s.evidence),assets:refs(s.assets),aliases:refs(s.aliases)})
const mechanicalDecision=(m:any,identity='synthetic-fixture-only')=>[{candidateDigest:digestRecord(m),approvedBy:identity,approvedAt:date}]
const results:any[]=[]
function record(name:string,observed:unknown,scope:string){results.push({name,observed,scope})}
const baseline=execFileSync('git',['show','origin/main:src/data.ts'],{cwd:root,encoding:'utf8'})
const current=readFileSync(root+'/src/data.ts','utf8')
const html=readFileSync(root+'/dist/index.html','utf8')
const publicProjection=JSON.parse(readFileSync(root+'/dist/public-content.json','utf8'))
assert.notEqual(createHash('sha256').update(baseline).digest('hex'),createHash('sha256').update(current).digest('hex'))
assert.equal(publicProjection.entries.length,0)
assert(html.includes(projects[0].summary))
record('legacy-copy-outside-projection',{dataChangedFromOriginMain:true,currentSummaryInDefaultHtml:true,selectedCanonicalEntryCount:0},'Actual existing local build/source; no publication performed')
const s:any=store();s.entries.push(entry(2,{editorialState:'draft',visibility:'restricted',title:'SYNTHETIC_RESTRICTED_DESK_79a1'}))
const m=manifest(s);const p=buildPublicProjection(s,m,mechanicalDecision(m))
assert.equal(JSON.stringify(p).includes('SYNTHETIC_RESTRICTED_DESK_79a1'),false)
record('excluded-private-draft',{projectedCount:p.entries.length,restrictedCanaryPresent:false},'Actual projection function, synthetic records and mechanical decision')
const unresolved:any=store();unresolved.evidence=[{schemaVersion:1,id:id(60),revision:1,visibility:'public',reviewState:'approved',title:'Synthetic pending source',source:'Synthetic',locator:'synthetic://fixture',observedAt:date,role:'context',limitations:'No real source or rights',assetIds:[],rights:'pending',redaction:'pending',kind:'reference'}]
unresolved.entries[0].evidenceIds=[id(60)]
const um=manifest(unresolved);let rightsError='';try{buildPublicProjection(unresolved,um,mechanicalDecision(um))}catch(e){rightsError=String(e)}
assert.match(rightsError,/rights or redaction/)
record('declared-rights-unresolved',{rejected:true,error:rightsError},'Deterministic declared-record status; not substantive rights verification')
const unsupported:any=store();unsupported.entries[0].blocks[0].markdown='SYNTHETIC CLAIM: a process improved every outcome; no supporting record is attached.'
const sm=manifest(unsupported);assert.equal(buildPublicProjection(unsupported,sm,mechanicalDecision(sm)).entries.length,1)
record('semantic-support-absent',{mechanicallyAccepted:true,evidenceRecords:0},'Expected semantic gap: schemas cannot verify every factual claim has adequate sources')
const stale:any=store();const stm=manifest(stale);const decision=mechanicalDecision(stm);stale.entries[0].summary='Synthetic changed wording after candidate digest'
let staleError='';try{buildPublicProjection(stale,stm,decision)}catch(e){staleError=String(e)}
assert.match(staleError,/changed after candidate approval/)
record('stale-content-digest',{rejected:true,error:staleError},'Exact record integrity, synthetic mechanical decision')
const staleApp:any=store();const am=manifest(staleApp);const appDecision=mechanicalDecision(am);am.applicationRevision='c'.repeat(40)
let appError='';try{buildPublicProjection(staleApp,am,appDecision)}catch(e){appError=String(e)}
assert.match(appError,/does not match exact selection/)
record('stale-application-selection',{rejected:true,error:appError},'Exact manifest selection integrity')
const forged:any=store();const fm=manifest(forged);assert.equal(buildPublicProjection(forged,fm,mechanicalDecision(fm,'FORGED_SYNTHETIC_IDENTITY_NO_AUTHORITY')).entries.length,1)
record('forged-identity-at-pure-function',{mechanicallyAccepted:true,authenticated:false,releaseAuthorized:false},'Documented pure-function trust boundary, not a demonstrated unauthorized endpoint or publisher')
const intake=applyAction(emptyWorkspace(),{type:'intake',title:'Synthetic desk intake',filename:'synthetic.txt',format:'text',bytes:Buffer.from('Synthetic research manuscript. Not a real finding.').toString('base64'),poetry:false},1,'synthetic-fixture-only','a'.repeat(40),date)
assert.deepEqual(intake.manuscripts[0].reviews.map(r=>r.pass),[...passes]);assert(intake.manuscripts[0].reviews.every(r=>r.decision==='pending'&&r.uncertainty.includes('not a completed')))
record('six-pass-current-behavior',{passCount:6,allPending:true,preparedPromptsNotSubstantiveReviews:true},'Actual intake implementation; no autonomous reviewer ran')
console.log(JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),node:process.version,observations:results.length,authorization:'UNVERIFIED; synthetic decisions only',releaseEligible:false,results},null,2))
