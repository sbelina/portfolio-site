import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { createHash } from 'node:crypto'
import { readFile, mkdtemp, cp, appendFile, rm, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import archive from '../content/build-archive.json' with { type: 'json' }
import { verifyBuildArchive } from '../scripts/build-archives'
import { auditPublic } from '../scripts/audit-public'

const origin='http://127.0.0.1:4175'
const previous=archive.reviewPath
const source=path.resolve('build-archives',archive.id)

test('original and review artifacts match frozen inventories; agent and writing records survive',async()=>{
 const capture=await verifyBuildArchive(source)
 expect(capture.sourceCommit).toBe('418efb750fe89c754b890b99a605213fed5ffddc')
 const preserved=JSON.parse(await readFile(path.join(source,'preserved-agent-files.json'),'utf8')) as Record<string,string>
 for(const [file,digest]of Object.entries(preserved))expect(createHash('sha256').update(await readFile(file)).digest('hex'),file).toBe(digest)
 expect(capture.deploymentStatus).toBe('not-observed-live-at-capture')
})

test('archive assembly rejects changed historical bytes instead of silently rebuilding them',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'pc-archive-check-'))
 try{await cp(source,temp,{recursive:true});await appendFile(path.join(temp,'review/index.html'),'\nChanged after capture')
 await expect(verifyBuildArchive(temp)).rejects.toThrow('checksum mismatch')
 }finally{await rm(temp,{recursive:true,force:true})}
})

test('artifact audit searches nested archive files for private content',async()=>{
 const temp=await mkdtemp(path.join(os.tmpdir(),'pc-archive-private-'))
 try{await mkdir(path.join(temp,'builds/example'),{recursive:true});await writeFile(path.join(temp,'route-manifest.json'),JSON.stringify({fixture:false}))
 await writeFile(path.join(temp,'builds/example/payload.json'),'PRIVATE_DRAFT_CANARY_8b72')
 await expect(auditPublic(temp)).rejects.toThrow('fixture or unselected draft')
 }finally{await rm(temp,{recursive:true,force:true})}
})

test('production new index links to the archived build with keyboard and preserves core identity',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'})
 try{const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 const requests:string[]=[];page.on('request',r=>requests.push(r.url()))
 await page.goto(origin+'/');await expect(page.getByRole('heading',{level:1})).toHaveText('The visible problem is rarely the one producing the outcome.')
 await expect(page.locator('.project-list')).toHaveCount(0)
 await expect(page.getByRole('region',{name:'Producing Curiosity introduction'})).toHaveCount(0)
 const link=page.locator('.site-footer').getByRole('link',{name:'Review the previous build'})
 await expect(link).toHaveAttribute('href',previous);await link.focus();await page.keyboard.press('Enter')
 await expect(page).toHaveURL(origin+previous)
 await expect(page.getByRole('complementary',{name:'Archived build notice'})).toBeInViewport()
 await expect(page.locator('#claims-operations')).toHaveCount(1)
 await page.getByRole('link',{name:'Return to current index'}).click();await expect(page).toHaveURL(origin+'/')
 expect(errors).toEqual([])
 // Initial new-index requests precede the first archived asset request.
 const beforeArchive=requests.slice(0,requests.findIndex(url=>url===origin+previous))
 expect(beforeArchive.some(url=>/\/assets\/(?:App-|sketch-)/.test(url))).toBe(false)
 }finally{await context.close()}
})

test('archived intro, map, reading and optional experiment stay inside the archive namespace',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1440,height:1000}})
 try{const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
 const assets:string[]=[];page.on('request',r=>{if(r.url().includes('/assets/'))assets.push(r.url())})
 await page.goto(origin+previous)
 await page.getByRole('button',{name:'Begin exploring the question'}).click()
 await page.getByRole('button',{name:'step 2: test the limits'}).click()
 await page.getByRole('button',{name:'step 3: recognize patterns'}).click()
 await expect(page.getByRole('region',{name:'Producing Curiosity introduction'})).toHaveCount(0)
 await page.getByRole('link',{name:'Explore connections'}).click();await expect(page).toHaveURL(origin+previous+'#connections')
 await page.getByRole('button',{name:'project: Claims operations. Select to trace connections.',exact:true}).click()
 await page.locator('.trace-jump').click();await expect(page).toHaveURL(origin+previous+'#claims-operations')
 await page.getByRole('link',{name:'Browse investigations'}).click();await expect(page).toHaveURL(origin+previous+'investigations/')
 await page.locator('.reading-wordmark').click();await expect(page).toHaveURL(origin+previous)
 await page.locator('.site-footer').getByRole('link',{name:'Reveal the hidden work',exact:false}).click()
 await expect(page).toHaveURL(origin+previous+'experiments/reveal-hidden-work/')
 await expect(page.getByRole('heading',{name:'Reveal the hidden work',exact:true})).toBeVisible()
 await page.locator('.work-disclosure > summary').click()
 await page.locator('.process-drawing').scrollIntoViewIfNeeded()
 await expect(page.locator('canvas')).toHaveCount(1)
 expect(assets.some(url=>url.includes('/sketch-'))).toBe(true)
 await page.getByRole('button',{name:'Reset experiment'}).click()
 await expect(page.locator('canvas')).toHaveCount(0)
 expect(assets.length).toBeGreaterThan(0);expect(assets.every(url=>url.startsWith(origin+previous+'assets/'))).toBe(true)
 const license=await context.request.get(origin+previous+'licenses/p5-LGPL-2.1.txt');expect(license.status()).toBe(200)
 expect(errors).toEqual([])
 }finally{await context.close()}
})

test('legacy root fragments reach the archived section, preserve query and bypass intro',async({browser})=>{
 const context=await browser.newContext()
 try{const page=await context.newPage();await page.goto(origin+'/?review=1#claims-operations')
 await expect(page).toHaveURL(origin+previous+'?review=1#claims-operations')
 await expect(page.locator('#claims-operations')).toBeInViewport()
 await expect(page.getByRole('region',{name:'Producing Curiosity introduction'})).toHaveCount(0)
 await page.goto(origin+'/#__proto__');await expect(page).toHaveURL(origin+'/#__proto__');await expect(page.locator('.build-index')).toBeVisible()
 }finally{await context.close()}
})

test('new index, legacy fallback, archive and footer disclosure work without JavaScript and touch reflow',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:740},hasTouch:true,reducedMotion:'reduce'})
 try{const page=await context.newPage();await page.goto(origin+'/#claims-operations')
 await expect(page.locator('.build-index-legacy')).toHaveAttribute('open','')
 await page.locator('#claims-operations a').tap();await expect(page).toHaveURL(origin+previous+'#claims-operations')
 await expect(page.locator('#claims-operations')).toBeInViewport()
 await page.getByRole('link',{name:'Return to current index'}).tap()
 await page.getByText('About this experiment',{exact:true}).tap();await expect(page.getByRole('heading',{name:'The working hypothesis'})).toBeVisible()
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%'})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await page.locator('.build-index-footer').getByRole('link',{name:'Review the previous build'}).tap()
 await expect(page).toHaveURL(origin+previous)
 await page.evaluate(()=>{document.documentElement.style.fontSize='200%'})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 await expect(page.getByRole('complementary',{name:'Archived build notice'})).toBeInViewport()
 }finally{await context.close()}
})

test('archive pages are noindex; raw artifacts, manuscripts and private tools are not served',async({request})=>{
 for(const route of [previous,previous+'investigations/',previous+'experiments/reveal-hidden-work/']){
 const response=await request.get(origin+route);expect(response.status()).toBe(200)
 expect(response.headers()['x-robots-tag']).toContain('noindex')
 expect(await response.text()).toContain('name="robots" content="noindex, follow"')
 }
 for(const route of [previous+'original/index.html',previous+'studio/',previous+'investigations/fixture-claims-handoff/','/build-archives/'+archive.id+'/original/index.html'])expect((await request.get(origin+route)).status()).toBe(404)
 expect((await (await request.get(origin+previous+'public-content.json')).json()).entries).toEqual([])
})

test('automated accessibility checks on the new production index and archived page',async({browser})=>{
 const context=await browser.newContext({reducedMotion:'reduce'})
 try{const page=await context.newPage();for(const route of ['/',previous]){
 await page.goto(origin+route);expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
 }}finally{await context.close()}
})
