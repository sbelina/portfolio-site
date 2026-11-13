import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { AtlasProof } from '../src/experiments/atlas/AtlasProof'
import { atlasPath, fixture, fixtureMarker, layoutInput } from '../src/experiments/atlas/fixture'
import { computeSemanticLayout } from '../src/experiments/atlas/layout'

// This isolated build imports a literal synthetic fixture only, never private
// studio data or a canonical publication selection.
const output = path.resolve('dist-atlas')
const layout = computeSemanticLayout(layoutInput())
const css = (await Promise.all(['src/design/tokens.css','src/components/experiment-note.css','src/experiments/atlas/proof.css'].map(file=>readFile(file,'utf8')))).join('\n')
const html = (textOnly=false) => '<!doctype html>\n'+renderToStaticMarkup(<html lang="en" data-edition="current"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex, nofollow"/><meta name="color-scheme" content="light"/><title>{`Atlas of Inquiry — ${textOnly?'text comparator':'synthetic semantic proof'}`}</title><style>{css}</style></head><body><AtlasProof account={fixture} layout={layout} textOnly={textOnly}/></body></html>)
const targets = [`${atlasPath}index.html`,`${atlasPath}text/index.html`]
await rm(output,{recursive:true,force:true})
for (let index=0;index<targets.length;index++) {
  const file=path.join(output,targets[index].slice(1)); await mkdir(path.dirname(file),{recursive:true})
  await writeFile(file,html(index===1).replaceAll('href="/experiments/reveal-hidden-work/"','href="https://producingcuriosity.com/experiments/reveal-hidden-work/"'))
}
const directory=path.join(output,atlasPath.slice(1))
await writeFile(path.join(directory,'input.json'),JSON.stringify({fixtureOnly:true,marker:fixtureMarker,input:layoutInput()},null,2)+'\n')
await writeFile(path.join(directory,'layout.json'),JSON.stringify({fixtureOnly:true,marker:fixtureMarker,...layout},null,2)+'\n')
await writeFile(path.join(output,'404.html'),'<!doctype html><html lang="en"><head><meta name="robots" content="noindex, nofollow"/><meta name="viewport" content="width=device-width, initial-scale=1"/><title>Atlas proof: address not found</title></head><body><main><h1>This trial address does not exist.</h1><p><a href="/lab/atlas/">Return to the synthetic proof</a></p></main></body></html>')
await writeFile(path.join(output,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow\n')
await writeFile(path.join(output,'route-manifest.json'),JSON.stringify({schemaVersion:1,fixture:true,marker:fixtureMarker,routes:[atlasPath,`${atlasPath}text/`]}))
console.log(`Synthetic semantic proof generated separately in dist-atlas (${layout.positions.length} cases, ${layout.pairs.length} explained distances). Not a production artifact.`)
