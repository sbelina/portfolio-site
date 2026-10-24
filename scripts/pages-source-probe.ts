/** Source-pinned native serialization/reference-schema probe; NOT a CMS sign-in or save demo. */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
const root=process.argv[2]
if(!root)throw Error('Pass the inspected Pages CMS source directory')
const pinned='6f4e860a35d934406580287e7042e5e111e207a1'
if(execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim()!==pinned)throw Error('Unexpected upstream revision; review before probing')
const directory=path.resolve('.studio-local/pages-probe')
await mkdir(directory,{recursive:true})
await writeFile(path.join(directory,'LICENSE'),await readFile(path.join(root,'LICENSE'),'utf8'))
const native=await readFile(path.join(root,'lib/serialization.ts'),'utf8')
// Exact upstream business logic, with imports resolved to isolated, pinned probe dependencies.
await writeFile(path.join(directory,'serialization.ts'),native)
const reference=await readFile(path.join(root,'fields/core/reference/index.tsx'),'utf8')
await writeFile(path.join(directory,'reference.ts'),reference.replace('import { Field } from "@/types/field";','type Field = { required?: boolean; options?: Record<string, any> };').replace(/import \{ (?:EditComponent|ViewComponent) \} from [^;]+;/g,'').replace('export { label, schema, EditComponent, ViewComponent };','export { label, schema };'))
const test=`import { parse, stringify } from './serialization';
import { schema } from './reference';
import assert from 'node:assert/strict';
import { entrySchema } from '../../src/content/model';
const verse = '  Synthetic—verse,\\n\\n\\tA tab stays.\\nLiteral <script> is content.';
const entry = {schemaVersion:1,kind:'perspective',editorialState:'draft',visibility:'restricted',createdAt:null,updatedAt:null,authorIds:[],topicIds:[],evidenceIds:[],summary:'Synthetic probe only',id:'88888888-8888-4888-8888-888888888888',revision:1,format:'poetry',slug:'synthetic-verse',title:'Synthetic verse',blocks:[{id:'80000000-0000-4000-8000-000000000001',type:'verse',text:verse}]};
const serialized=stringify(entry,{format:'json'});
assert.deepEqual(parse(serialized,{format:'json'}),entry);
assert.equal(entrySchema.safeParse(entry).success,true);
assert.equal(schema({required:true}).parse(entry.id),entry.id);
assert.deepEqual(schema({options:{multiple:true}}).parse([entry.id]),[entry.id]);
console.log('Native Pages CMS JSON serialization preserves synthetic verse and structured blocks; native reference schema stores stable IDs. No auth, Git save or preview claim.');
`;
await writeFile(path.join(directory,'probe.ts'),test)
console.log('Prepared inspected-source probe. Install isolated dependencies and run .studio-local/pages-probe/probe.ts as documented; this does not start Pages CMS.')
