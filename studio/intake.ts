import { unzipSync, strFromU8 } from 'fflate'
import { XMLParser, XMLValidator } from 'fast-xml-parser'
/** Data-only importer: no HTML, macros, relationship fetching or instruction execution. */
export function intakeText(format: 'text'|'markdown'|'docx', base64: string): { text: string; warnings: string[] } {
 const bytes=Buffer.from(base64,'base64')
 if(!bytes.length || bytes.length>256000)throw Error('Provide a manuscript of 1–256000 bytes')
 if(format!=='docx') return {text:new TextDecoder('utf-8',{fatal:true}).decode(bytes),warnings:[]}
 let total=0
 const archive=unzipSync(bytes,{filter:file=>{
  total+=file.originalSize
  if(total>2000000 || file.originalSize>1000000)throw Error('DOCX expansion exceeds import limit')
  return file.name==='word/document.xml'
 }})
 if(!archive['word/document.xml'])throw Error('DOCX has no Word document')
 const xml=strFromU8(archive['word/document.xml'])
 if(/<!DOCTYPE|<!ENTITY/i.test(xml) || XMLValidator.validate(xml)!==true)throw Error('Unsupported or invalid document XML')
 const parser=new XMLParser({preserveOrder:true,ignoreAttributes:false,trimValues:false,parseTagValue:false,processEntities:true})
 const nodes=parser.parse(xml) as Record<string,unknown>[]
 let output=''
 const walk=(list: Record<string,unknown>[])=>{for(const n of list)for(const [tag,child]of Object.entries(n)){
  if(tag==='w:t') { for(const v of child as Record<string,unknown>[])if('#text' in v)output+=String(v['#text']); }
  else if(tag==='w:tab')output+='\t'
  else if(tag==='w:br' || tag==='w:cr')output+='\n'
  else if(tag==='w:del' || tag==='w:instrText' || tag==='w:object')continue
  else if(Array.isArray(child)){walk(child as Record<string,unknown>[]);if(tag==='w:p')output+='\n'}
 }}
 walk(nodes)
 if(output.length>200000)throw Error('Converted manuscript exceeds the draft text limit; split the input deliberately before importing')
 return {text:output,warnings:['DOCX text conversion preserves text runs, tabs, breaks and paragraph boundaries; compare against the original binary. Layout indentation, text boxes, footnotes, tracked deletions and embedded objects are not imported. No external links or macros are executed.']}
}
