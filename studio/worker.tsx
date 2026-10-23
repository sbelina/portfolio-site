import React from 'react'
import { renderToString } from 'react-dom/server'
import { timingSafeEqual, randomUUID } from 'node:crypto'
import { z } from 'zod'
import { ReadingPage } from '../src/reading/ReadingPage'
import { readingPageData } from '../src/reading/page-data'
import { actionSchema, applyAction, draftProjection, emptyWorkspace, digestBytes, media, type Workspace, type StoredWorkspace } from './model'
import { digestRecord } from '../src/content/projection'
import { entryPath, storeSchema } from '../src/content/model'
interface Statement { bind(...args: unknown[]): Statement; first<T>(): Promise<T|null>; run(): Promise<{meta:{changes:number}}>; all<T>():Promise<{results:T[]}> }
interface Database { prepare(sql:string): Statement; batch(statements:Statement[]):Promise<{meta:{changes:number}}[]> }
interface Env { DB: Database; UI: {fetch(request:Request):Promise<Response>}; OWNER_PASSWORD_HASH: string; OWNER_NAME:string; APPLICATION_REVISION:string }
const cookieName='pc_studio_session'
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{'Content-Type':'application/json'}})
const b64=(data:Uint8Array)=>Buffer.from(data).toString('hex')
const token=()=>b64(crypto.getRandomValues(new Uint8Array(32)))
const key=(env:Env,value:string)=>digestBytes(new TextEncoder().encode(`${env.OWNER_PASSWORD_HASH}:${value}`))
async function passwordOK(env:Env,password:string) {
 const [salt,expected]=env.OWNER_PASSWORD_HASH.split(':')
 if(!/^[a-f0-9]{32}$/.test(salt??'') || !/^[a-f0-9]{64}$/.test(expected??''))return false
 const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits'])
 const bits=await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:Buffer.from(salt,'hex'),iterations:100000},base,256)
 return timingSafeEqual(Buffer.from(bits),Buffer.from(expected,'hex'))
}
const local=(url:URL)=>['127.0.0.1','localhost'].includes(url.hostname)
const cookie=(value:string,url:URL,maxAge=3600)=>`${cookieName}=${value}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${local(url)?'':'; Secure'}`
const current=async(env:Env)=>await env.DB.prepare('SELECT version,body FROM workspace WHERE id=1').first<{version:number;body:string}>()
const escape=(s:string)=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')
const loginHTML='<!doctype html><html lang="en"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sign in — Private Writing Trial</title><main><h1>Private Writing Trial</h1><p>Local trial. Nothing entered here is published.</p><form action="/login" method="post"><label>Owner password <input name="password" type="password" autocomplete="current-password" required maxlength="256"></label><button>Sign in</button></form></main></html>'
async function handle(request:Request,env:Env):Promise<Response> {
 const url=new URL(request.url), path=url.pathname
 if(!local(url))return json({error:'This trial is loopback-only. Hosted identity and deployment are not configured.'},503)
 if(!env.OWNER_PASSWORD_HASH || !env.OWNER_NAME || !/^[a-f0-9]{40}$/.test(env.APPLICATION_REVISION??''))return json({error:'Run studio setup before starting this private local trial'},503)
 if(!['GET','HEAD'].includes(request.method) && request.headers.get('Origin')!==url.origin)return json({error:'Origin denied'},403)
 if(request.method==='POST' && ['/api/login','/login'].includes(path)) {
  const bucket=Math.floor(Date.now()/60000)
  await env.DB.prepare('INSERT INTO login_attempts(bucket,count) VALUES(?,1) ON CONFLICT(bucket) DO UPDATE SET count=count+1').bind(bucket).run()
  await env.DB.prepare('DELETE FROM login_attempts WHERE bucket<?').bind(bucket-2).run()
  const attempts=await env.DB.prepare('SELECT count FROM login_attempts WHERE bucket=?').bind(bucket).first<{count:number}>()
  if((attempts?.count??0)>10)return json({error:'Too many sign-in attempts. Try again in a minute.'},429)
  const data=path==='/login'?Object.fromEntries(await request.formData()):await request.json() as {password:string}
  const password=typeof data.password==='string'?data.password:''
  if(password.length>256 || !await passwordOK(env,password))return json({error:'Sign-in failed'},401)
  const session=token(),csrf=token()
  await env.DB.prepare('INSERT INTO sessions(token,csrf,expires) VALUES(?,?,?)').bind(key(env,session),csrf,Date.now()+3600000).run()
  await env.DB.prepare('DELETE FROM sessions WHERE expires<?').bind(Date.now()).run()
  return new Response(path==='/login'?null:JSON.stringify({csrf,subject:env.OWNER_NAME}),{status:path==='/login'?303:200,headers:{'Set-Cookie':cookie(session,url),'Content-Type':'application/json',...(path==='/login'?{Location:'/'}:{})}})
 }
 const raw=request.headers.get('Cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(`${cookieName}=`))?.slice(cookieName.length+1)??''
 const session=raw?await env.DB.prepare('SELECT token,csrf,expires FROM sessions WHERE token=? AND expires>?').bind(key(env,raw),Date.now()).first<{token:string;csrf:string;expires:number}>():null
 if(!session) {
  if(path==='/' && request.method==='GET')return new Response(loginHTML,{headers:{'Content-Type':'text/html'}})
  return json({error:'Sign in required'},401)
 }
 if(!['GET','HEAD'].includes(request.method) && request.headers.get('X-CSRF-Token')!==session.csrf)return json({error:'CSRF token required'},403)
 if(path==='/api/session')return json({csrf:session.csrf,subject:env.OWNER_NAME})
 if(path==='/api/logout' && request.method==='POST') {
  await env.DB.prepare('DELETE FROM sessions WHERE token=?').bind(session.token).run()
  return new Response(null,{status:204,headers:{'Set-Cookie':cookie('',url,0)}})
 }
 await env.DB.prepare('INSERT OR IGNORE INTO workspace(id,version,body) VALUES(1,0,?)').bind(JSON.stringify(emptyWorkspace())).run()
 const row=(await current(env))!, workspace=JSON.parse(row.body) as StoredWorkspace
 if(path==='/api/workspace' && request.method==='GET')return json({version:row.version,workspace})
 if(path==='/api/history' && request.method==='GET')return json((await env.DB.prepare('SELECT version FROM history ORDER BY version DESC LIMIT 100').all<{version:number}>()).results)
 if(path==='/api/backup' && request.method==='GET')return new Response(JSON.stringify({schemaVersion:1,version:row.version,digest:digestRecord(workspace),workspace}),{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="private-writing-backup.json"'}})
 if(['/api/actions','/api/restore'].includes(path) && request.method==='POST') {
  const input=await request.json() as {expectedVersion:number;action:unknown;entryId?:string;fromVersion?:number}
  if(input.expectedVersion!==row.version)return json({error:'Stale save: reload or compare your changes before retrying',currentVersion:row.version},409)
  let next:Workspace
  if(path==='/api/actions')next=applyAction(workspace,actionSchema.parse(input.action),row.version,env.OWNER_NAME,env.APPLICATION_REVISION)
  else {
   const args=z.strictObject({expectedVersion:z.number().int().nonnegative(),entryId:z.uuid(),fromVersion:z.number().int().nonnegative()}).parse(input)
   const old=await env.DB.prepare('SELECT body FROM history WHERE version=?').bind(args.fromVersion).first<{body:string}>()
   const entry=old?(JSON.parse(old.body) as Workspace).store.entries.find(e=>e.id===args.entryId):null
   const target=workspace.store.entries.find(e=>e.id===args.entryId)
   if(!entry || !target)return json({error:'Revision unavailable'},404)
   next=structuredClone(workspace);const index=next.store.entries.findIndex(e=>e.id===args.entryId)
   next.store.entries[index]={...entry,revision:target.revision+1,visibility:'restricted',editorialState:'draft',updatedAt:new Date().toISOString()}
   const restoredPath=entryPath(next.store.entries[index]),previousPath=entryPath(target)
   next.store.aliases=next.store.aliases.filter(a=>a.kind!=='path' || a.path!==restoredPath)
   if(previousPath!==restoredPath && !next.store.aliases.some(a=>a.kind==='path' && a.path===previousPath))next.store.aliases.push({schemaVersion:1,id:randomUUID(),revision:1,visibility:'restricted',reviewState:'approved',kind:'path',path:previousPath,targetId:target.id})
   storeSchema.parse(next.store)
  }
  const body=JSON.stringify(next)
  if(new TextEncoder().encode(body).length>1500000)return json({error:'Local trial workspace size limit reached; export before continuing'},413)
  // D1 batch is transactional; both history and write are conditional on the same version.
  const result=await env.DB.batch([
   env.DB.prepare('INSERT OR IGNORE INTO history(version,body) SELECT version,body FROM workspace WHERE id=1 AND version=?').bind(row.version),
   env.DB.prepare('UPDATE workspace SET version=version+1,body=? WHERE id=1 AND version=?').bind(body,row.version),
  ])
  if(result[1].meta.changes!==1)return json({error:'Concurrent save rejected; your base revision moved'},409)
  return json({version:row.version+1,workspace:next})
 }
 const original=path.match(/^\/api\/original\/([a-f0-9-]+)$/)
 if(original){const m=workspace.manuscripts.find(m=>m.id===original[1]);if(!m)return json({error:'Not found'},404)
  return new Response(Buffer.from(m.bytes,'base64'),{headers:{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="original.${m.format==='docx'?'docx':'txt'}"`}})}
 const bundle=path.match(/^\/api\/candidate\/([a-f0-9]{64})\/export$/)
 if(bundle){const c=workspace.candidates.find(c=>c.digest===bundle[1]);if(!c?.approval || c.approval.digest!==c.digest)return json({error:'Exact candidate approval required'},403)
  return new Response(JSON.stringify({status:'approved-unpublished',...c}),{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="approved-unpublished-candidate.json"'}})}
 const preview=path.match(/^\/preview\/(draft|[a-f0-9]{64})(\/.*)$/)
 if(preview) {
  const scope=preview[1],relative=preview[2],candidate=scope==='draft'?null:workspace.candidates.find(c=>c.digest===scope)
  if(scope!=='draft' && !candidate)return json({error:'Not found'},404)
  const projection=candidate?.projection??draftProjection(workspace),bytes=candidate?.assets??media(workspace)
  const image=projection.assets.find(a=>a.url===relative)
  if(image) {const data=bytes[image.id];if(!data)return json({error:'Not found'},404)
   const buffer=Buffer.from(data,'base64');if(digestBytes(buffer)!==image.checksum)throw Error('Private asset checksum mismatch')
   return new Response(buffer,{headers:{'Content-Type':'image/png'}})}
  const alias=projection.aliases.find(a=>a.kind==='path' && a.path===relative)
  if(alias)return Response.redirect(`${url.origin}/preview/${scope}${projection.entries.find(e=>e.id===alias.targetId)!.path}`,302)
  const entry=projection.entries.find(e=>e.path===relative)
  if(relative!=='/' && !entry)return json({error:'Not found'},404)
  const data=readingPageData(projection,entry?'entry':'collection',false,entry?.id)
  let html=renderToString(<ReadingPage page={data}/>).replaceAll(/(href|src)="\/(?!\/)([^"]*)"/g,`$1="/preview/${scope}/$2"`)
  const links=projection.entries.map(e=>`<li><a href="/preview/${scope}${escape(e.path)}">${escape(e.title)}</a></li>`).join('')
  html=`<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escape(entry?.title??'Private readings')} — private preview</title><link rel="stylesheet" href="/preview.css"></head><body><aside class="preview-status"><a href="/">Back to writing review</a><p>${candidate?'Frozen candidate '+candidate.digest:'Current saved draft'} — private, unpublished. No intro or graph required.</p><ul>${links}</ul></aside>${html}</body></html>`
  return new Response(html,{headers:{'Content-Type':'text/html'}})
 }
 if(path.startsWith('/api/') || path.startsWith('/preview/'))return json({error:'Not found'},404)
 return env.UI.fetch(request)
}
export default {async fetch(request:Request,env:Env) {
 let response:Response
 try {
  if(Number(request.headers.get('Content-Length')??0)>600000)response=json({error:'Request too large'},413)
  else if(!['GET','HEAD'].includes(request.method)) {
   const reader=request.body?.getReader();let size=0;const chunks:Uint8Array[]=[]
   if(reader)for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>600000){await reader.cancel();throw Error('Request too large')}chunks.push(value)}
   const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
   response=await handle(new Request(request,{body:bytes}),env)
  } else response=await handle(request,env)
 } catch(error) {
  response=json({error:error instanceof z.ZodError?'Validation failed: '+error.issues.map(i=>i.path.join('.')+' '+i.message).join('; '):error instanceof Error?error.message:'Request failed'},400)
 }
 const headers=new Headers(response.headers)
 headers.set('Cache-Control','private, no-store');headers.set('Vary','Cookie, Authorization');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','same-origin');headers.set('X-Robots-Tag','noindex, nofollow')
 headers.set('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; frame-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'self'")
 return new Response(request.method==='HEAD'?null:response.body,{status:response.status,headers})
}}
