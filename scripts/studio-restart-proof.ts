/** Synthetic-only real D1 restart proof. Requires test:studio to have populated the isolated test DB. */
import { spawn, type ChildProcess } from 'node:child_process'
import { digestRecord } from '../src/content/projection'
const origin='http://127.0.0.1:4181'
async function snapshot(){
 const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js','dev','--local','--env','test','--config','wrangler.studio.jsonc','--persist-to','.wrangler/studio-tests','--ip','127.0.0.1','--port','4181'],{detached:true,stdio:'ignore',env:process.env})
 const stop=async(p:ChildProcess)=>{if(p.pid){process.kill(-p.pid,'SIGTERM');await new Promise<void>(r=>p.once('exit',()=>r()))}}
 try{
  let ready=false
  for(let i=0;i<80;i++){try{if((await fetch(origin)).ok){ready=true;break}}catch{} await new Promise(r=>setTimeout(r,100))}
  if(!ready)throw Error('Local trial server did not start')
  const login=await fetch(origin+'/api/login',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify({password:'synthetic-trial-password-not-an-owner-credential'})})
  if(!login.ok)throw Error('Synthetic test login failed')
  const cookie=login.headers.get('set-cookie')!.split(';')[0]
  const response=await fetch(origin+'/api/workspace',{headers:{Cookie:cookie}})
  const body=await response.json() as {version:number;workspace:{manuscripts:unknown[]}}
  if(!response.ok || !body.workspace.manuscripts.length)throw Error('Saved synthetic workspace not found')
  return {version:body.version,digest:digestRecord(body.workspace)}
 }finally{await stop(child)}
}
const first=await snapshot(),second=await snapshot()
if(first.version!==second.version || first.digest!==second.digest)throw Error('Restart changed saved workspace')
console.log(`Real Worker stop/start proof passed: workspace revision ${first.version} and digest survived a fresh login after restart. Synthetic local D1 only.`)
