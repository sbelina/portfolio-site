import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { AtlasProof } from '../src/experiments/atlas/AtlasProof'
import { atlasPath, fixture, fixtureMarker, layoutInput } from '../src/experiments/atlas/fixture'
import { computeSemanticLayout } from '../src/experiments/atlas/layout'

/** Writes only the owner-authorized illustrative Atlas, never root files or private content. */
export async function prerenderAtlas(output:string) {
  const input=layoutInput()
  const layout=computeSemanticLayout(input)
  const css=(await Promise.all(['src/design/tokens.css','src/components/public-navigation.css','src/components/experiment-note.css','src/experiments/atlas/proof.css'].map(file=>readFile(file,'utf8')))).join('\n')
  const html=(textOnly=false)=>'<!doctype html>\n'+renderToStaticMarkup(<html lang="en" data-edition="current"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><meta name="robots" content="noindex, follow"/><meta name="color-scheme" content="light"/><title>{`Atlas of Inquiry* — ${textOnly?'text account':'experimental prototype'} · Producing Curiosity`}</title><meta name="description" content="An experimental semantic atlas of six invented investigations, with inspectable relationships, calculations and a complete text account."/><style>{css}</style></head><body><AtlasProof account={fixture} layout={layout} textOnly={textOnly}/></body></html>)
  const directory=path.join(output,atlasPath.slice(1))
  await mkdir(path.join(directory,'text'),{recursive:true})
  await writeFile(path.join(directory,'index.html'),html())
  await writeFile(path.join(directory,'text/index.html'),html(true))
  await writeFile(path.join(directory,'input.json'),JSON.stringify({illustrative:true,marker:fixtureMarker,input},null,2)+'\n')
  await writeFile(path.join(directory,'layout.json'),JSON.stringify({illustrative:true,marker:fixtureMarker,...layout},null,2)+'\n')
}
