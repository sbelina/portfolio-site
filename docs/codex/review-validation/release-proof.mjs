import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';

// Synthetic in-memory originals. Never emit their bodies, identities or decision tokens.
const hash = x => createHash('sha256').update(x).digest('hex');
const ordered = x => Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b)));
const artifactSet = artifacts => Object.entries(ordered(artifacts)).map(([path,body])=>({path,sha256:hash(body)}));
const bind = candidate => hash(JSON.stringify({schema:1,sourceRevision:candidate.sourceRevision,sourceFiles:artifactSet(candidate.sourceFiles),artifacts:artifactSet(candidate.artifacts),routes:[...candidate.routes].sort(),content:candidate.content}));
const restricted = 'SYNTHETIC_RESTRICTED_CANARY_83e7';
const candidate = () => ({sourceRevision:'a'.repeat(40),sourceFiles:{'legacy.ts':'synthetic public copy'},artifacts:{'/index.html':'<main>synthetic public copy</main>','/home.js':'const copy="synthetic public copy";','/asset.css':'main{}'},routes:['/'],content:[{id:'synthetic-home',revision:1,rights:'cleared'}],restrictedDraft:restricted});
// Test-double boundary only. This map stands in for an independently verified,
// revision-bound authorization record. It is not authentication infrastructure.
const decisions = new Map();
function issueTestDecision(c) { const token=Symbol('opaque-test-decision'); decisions.set(token,{digest:bind(c),decision:'allow'}); return token; }
function inspect(c, token, reviewedDigest) {
  const digest=bind(c), blocks=[];
  if(Object.values(c.artifacts).some(body=>body.includes(c.restrictedDraft))) blocks.push('RESTRICTED_CANARY');
  if(!c.content.length || c.content.some(x=>x.rights!=='cleared')) blocks.push('RIGHTS_UNKNOWN_OR_MISSING');
  if(reviewedDigest!==digest) blocks.push('REVIEW_BINDING_MISMATCH');
  const decision=decisions.get(token);
  if(!decision || decision.decision!=='allow' || decision.digest!==digest) blocks.push('TRUSTED_DECISION_MISSING_OR_MISMATCH');
  return {schema:1,digest,artifactCount:Object.keys(c.artifacts).length,routeCount:c.routes.length,blocks,preflight:blocks.length?'BLOCK':'SYNTHETIC_CHECKS_PASS',authorization:'AUTHORIZATION_UNVERIFIED',releaseEligible:false};
}
const results=[];
function test(name, run) { run(); results.push({name,result:'PASS'}); }
function rejects(name, change, expected) {test(name,()=>{const c=candidate(),review=bind(c),token=issueTestDecision(c);change(c);assert.ok(inspect(c,token,review).blocks.includes(expected));});}
test('restricted structured draft absent from artifact is not a leak',()=>{const c=candidate();assert.equal(inspect(c,issueTestDecision(c),bind(c)).blocks.length,0);});
for(const path of ['/index.html','/home.js']) rejects(`same canary in legacy ${path.endsWith('html')?'HTML':'JS'} blocked`,c=>{c.artifacts[path]+=restricted;},'RESTRICTED_CANARY');
rejects('changed public copy invalidates reviewed candidate',c=>{c.artifacts['/index.html']+=' changed';},'REVIEW_BINDING_MISMATCH');
rejects('added artifact invalidates reviewed candidate',c=>{c.artifacts['/new.css']='x{}';},'REVIEW_BINDING_MISMATCH');
rejects('deleted artifact invalidates reviewed candidate',c=>{delete c.artifacts['/asset.css'];},'REVIEW_BINDING_MISMATCH');
rejects('added route invalidates reviewed candidate',c=>{c.routes.push('/new/');},'REVIEW_BINDING_MISMATCH');
rejects('deleted route invalidates reviewed candidate',c=>{c.routes=[];},'REVIEW_BINDING_MISMATCH');
rejects('changed source revision invalidates reviewed candidate',c=>{c.sourceRevision='b'.repeat(40);},'REVIEW_BINDING_MISMATCH');
rejects('source bytes changed under same revision invalidates review',c=>{c.sourceFiles['legacy.ts']+=' changed';},'REVIEW_BINDING_MISMATCH');
for(const state of [undefined,'unknown','pending']) test(`rights ${state??'missing'} blocks even test-double decision`,()=>{const c=candidate();c.content[0].rights=state;assert.ok(inspect(c,issueTestDecision(c),bind(c)).blocks.includes('RIGHTS_UNKNOWN_OR_MISSING'));});
test('missing trusted approval blocks',()=>{const c=candidate();assert.ok(inspect(c,undefined,bind(c)).blocks.includes('TRUSTED_DECISION_MISSING_OR_MISMATCH'));});
test('forged username and approved flag confer no authority',()=>{const c=candidate();assert.ok(inspect(c,{username:'owner',approved:true,digest:bind(c)},bind(c)).blocks.includes('TRUSTED_DECISION_MISSING_OR_MISMATCH'));});
test('exact trusted-decision test double transport passes only synthetic checks',()=>{const c=candidate(),r=inspect(c,issueTestDecision(c),bind(c));assert.equal(r.preflight,'SYNTHETIC_CHECKS_PASS');assert.equal(r.authorization,'AUTHORIZATION_UNVERIFIED');assert.equal(r.releaseEligible,false);});
test('decision for another candidate cannot be replayed',()=>{const c=candidate(),token=issueTestDecision(c);c.content[0].revision++;assert.ok(inspect(c,token,bind(c)).blocks.includes('TRUSTED_DECISION_MISSING_OR_MISMATCH'));});
test('artifact insertion order does not change binding',()=>{const c=candidate(),d=structuredClone(c);d.artifacts=Object.fromEntries(Object.entries(d.artifacts).reverse());assert.equal(bind(c),bind(d));});
if(process.argv.includes('--challenge')) {
  const observations=[];
  function limitation(name, change) {
    const c=candidate();change(c);
    // Fresh mechanical review and decision double deliberately exercise what
    // these checks cannot establish; neither represents editorial approval.
    const r=inspect(c,issueTestDecision(c),bind(c));
    assert.equal(r.blocks.length,0);assert.equal(r.authorization,'AUTHORIZATION_UNVERIFIED');assert.equal(r.releaseEligible,false);
    observations.push({name,mechanicalResult:'NOT_DETECTED',interpretation:'KNOWN_LIMITATION_CONFIRMED',authorization:r.authorization,releaseEligible:r.releaseEligible});
  }
  limitation('unsupported assertion absent from declared claim registry',c=>{c.artifacts['/index.html']+='<p>Synthetic assertion: every participant benefited.</p>';});
  limitation('incompatible denominators and periods despite declared cleared rights',c=>{c.artifacts['/index.html']+='<p>Synthetic comparison: 20 of 100 submissions in January became 5 of 10 selected cases in June, proving improvement.</p>';});
  limitation('encoded restricted canary evades exact byte scan',c=>{c.artifacts['/home.js']+=JSON.stringify(Buffer.from(restricted).toString('base64'));});
  limitation('paraphrased restricted information evades exact byte scan',c=>{c.artifacts['/index.html']+='<p>The restricted synthetic note concerns an unpublished participant exception.</p>';});
  console.log(JSON.stringify({proof:'synthetic-preflight-editorial-challenges',node:process.version,observations,total:observations.length,integrityAssertionsSeparate:18,authorization:'AUTHORIZATION_UNVERIFIED',releaseEligible:false},null,2));
} else console.log(JSON.stringify({proof:'synthetic-publication-preflight',node:process.version,results,total:results.length,authorization:'AUTHORIZATION_UNVERIFIED',releaseEligible:false},null,2));
