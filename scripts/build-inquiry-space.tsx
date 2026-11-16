import React from 'react'
import { renderToString } from 'react-dom/server'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { InquirySpacePage } from '../src/inquiry-space/InquirySpacePage'
import { inquirySpacePath, inquirySpaceTitle } from '../src/inquiry-space/paths'
import type { PublicProjection } from '../src/content/model'
import { inquiryIllustrationMarker } from '../src/inquiry-space/illustration'

/** Scoped composition of an already selected projection, never a private store. */
export async function prerenderInquirySpace(output:string, projection:PublicProjection, fixture:boolean) {
  const files=['src/design/tokens.css','src/components/public-navigation.css','src/design/foundation.css','src/components/experiment-note.css','src/inquiry-space/inquiry-space.css']
  const css=(await Promise.all(files.map(file=>readFile(file,'utf8')))).map(source=>source.replaceAll(/@import[^;]+;/g,'')).join('\n')
  const markup=renderToString(<InquirySpacePage projection={projection} fixture={fixture}/>)
  const html='<!doctype html>\n'+renderToString(<html lang="en" data-edition="current"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="robots" content="noindex, follow"/><title>{`${inquirySpaceTitle}* — ${fixture?'synthetic review':'experimental illustration'} · Producing Curiosity`}</title><style>{css}</style></head><body><div data-inquiry-illustration={fixture?'INQUIRY_SPACE_FIXTURE_14NOV':inquiryIllustrationMarker} dangerouslySetInnerHTML={{__html:markup}}/></body></html>)
  const directory=path.join(output,inquirySpacePath.slice(1));await mkdir(directory,{recursive:true});await writeFile(path.join(directory,'index.html'),html)
}
