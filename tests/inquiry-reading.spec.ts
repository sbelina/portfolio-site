import {test,expect} from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import {readFile} from 'node:fs/promises'
import {inquirySpacePath} from '../src/inquiry-space/paths'
import {inquiryIllustrationMarker,inquiryIllustrationProjection,illustrationVerse} from '../src/inquiry-space/illustration'
import {inquiryEntries,inquiryVerse} from './fixtures/inquiry-content'

test('Threshold initial HTML offers four independent invitations and one complete authored pairing',async({request})=>{
 const response=await request.get(inquirySpacePath);expect(response.status()).toBe(200);const html=await response.text()
 for(const text of ['Je ne sais qu’a','INQUIRY_SPACE_FIXTURE_14NOV','Follow a curiosity','Find a connection','Try an experiment','Read the margins','Where the analogy breaks','Speculative resonance'])expect(html).toContain(text)
 expect(html).not.toContain('PRIVATE_INQUIRY');expect(html).not.toContain('data-map-node');expect(html).not.toContain('<script')
 const live=await request.get('http://127.0.0.1:4175'+inquirySpacePath);expect(live.status()).toBe(200);expect(await live.text()).toContain(inquiryIllustrationMarker);expect(await live.text()).not.toContain('Review fixture — unpublished')
 expect((await request.get(inquirySpacePath+'unreviewed/')).status()).toBe(404)
})

test('no-JavaScript keyboard exploration preserves focus, reading position and canonical return paths',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,reducedMotion:'reduce'})
 try{
  const page=await context.newPage();await page.goto(inquirySpacePath)
  const invitations=page.getByRole('navigation',{name:'Ways into the inquiry space'});await expect(invitations.getByRole('link')).toHaveCount(4)
  await invitations.getByRole('link',{name:'Find a connection',exact:false}).click();await expect(page).toHaveURL(/#unexpected-connections$/)
  const summary=page.getByText('What might connect these fragments?',{exact:true});await summary.focus();const before=await page.evaluate(()=>scrollY)
  await page.keyboard.press('Enter');await expect(summary.locator('..')).toHaveAttribute('open','');await expect(summary).toBeFocused();await expect(summary.locator('..')).toContainText('Where the analogy breaks')
  expect(await page.evaluate(()=>scrollY)).toBeCloseTo(before,0);await page.keyboard.press('Space');await expect(summary).toBeFocused()
  await page.getByRole('link',{name:inquiryEntries[0].title,exact:true}).first().click();await expect(page).toHaveURL(/\/notes\/fixture-folded-margin\/$/)
  await expect(page.getByRole('heading',{name:'Contribution and scope'})).toHaveCount(0)
  await expect(page.locator('.reading-connections')).toContainText('Speculative resonance')
  await page.goBack();await expect(page).toHaveURL(/#unexpected-connections$/)
 }finally{await context.close()}
})

test('an expression retains exact text without mandatory explanation, source score or case layout',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false})
 try{
  const page=await context.newPage();await page.goto('/perspective/fixture-open-bracket/')
  expect(await page.locator('.reading-verse').textContent()).toBe(inquiryVerse)
  await expect(page.locator('.reading-inquiry-context')).toHaveCount(0);await expect(page.getByRole('heading',{name:'Contribution and scope'})).toHaveCount(0)
  await expect(page.getByText('Untested hypothesis',{exact:true})).toHaveCount(0)
  await page.getByRole('link',{name:'Return to Je ne sais qu’a',exact:false}).click();await expect(page).toHaveURL(new RegExp(inquirySpacePath+'$'))
 }finally{await context.close()}
})

test('touch, reduced motion and enlarged320px reading keep every invitation and pairing usable',async({browser,baseURL},testInfo)=>{
 const context=await browser.newContext({baseURL,viewport:{width:320,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
 try{
  const page=await context.newPage();await page.goto(inquirySpacePath);await page.addStyleTag({content:'html{font-size:200%}p,li,dd{line-height:1.8!important;letter-spacing:.12em!important;word-spacing:.16em!important}'})
  await page.getByText('What might connect these fragments?',{exact:true}).tap();await expect(page.locator('.inquiry-pairings details')).toHaveAttribute('open','')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  const file=testInfo.outputPath('inquiry-threshold-320.png');await page.screenshot({path:file});await testInfo.attach('Synthetic inquiry review at320px',{path:file,contentType:'image/png'})
 }finally{await context.close()}
})

test('review fixture has accessible semantics and no dead local destinations',async({page,request},testInfo)=>{
 await page.goto(inquirySpacePath);await page.getByText('What might connect these fragments?',{exact:true}).click()
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
 const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')!))
 for(const href of new Set(links)){
  if(href.startsWith('#'))await expect(page.locator(`[id="${href.slice(1)}"]`)).toHaveCount(1)
  else if(href.startsWith('/'))expect((await request.get(href)).status(),href).toBe(200)
 }
 await page.goto(inquirySpacePath);const file=testInfo.outputPath('inquiry-threshold-desktop.png');await page.screenshot({path:file});await testInfo.attach('Synthetic inquiry Threshold',{path:file,contentType:'image/png'})
 const graph=JSON.parse(await readFile('dist-fixtures/graph-index.json','utf8'));expect(graph.edges.some((edge:{type:string})=>edge.type==='paired_with')).toBe(false)
 const production=await readFile('dist/route-manifest.json','utf8');expect(production).toContain(inquirySpacePath)
})

test('published illustration uses its own scoped projection, explicit labels,404s and unindexed routes',async({request})=>{
 const projection=inquiryIllustrationProjection()
 const root='http://127.0.0.1:4175'
 for(const entry of projection.entries){
  const response=await request.get(root+entry.path);expect(response.status()).toBe(200);const html=await response.text()
  expect(html).toContain('Experimental illustration — invented writing.');expect(html).toContain('Illustration revision date')
  expect(html).not.toContain('INQUIRY_SPACE_FIXTURE_14NOV');expect(html).not.toContain('PRIVATE_INQUIRY');expect(html).not.toContain('not publication-approved content')
  const payload=JSON.parse(html.match(/<script id="reading-data" type="application\/json">([^<]+)<\/script>/)![1])
  expect(payload.illustrative).toBe(true);expect(payload.entry.id).toBe(entry.id)
  for(const other of projection.entries.filter(other=>other.id!==entry.id))for(const block of other.blocks)if(block.type==='prose')expect(Object.values(payload.renderedMarkdown).join('')).not.toContain(block.markdown)
  expect(response.headers()['x-robots-tag']).toContain('noindex');expect(html).toContain('name="robots" content="noindex, follow"')
 }
 expect((await request.get(root+inquirySpacePath+'unreviewed/')).status()).toBe(404)
 expect((await request.get(root+'/notes/fixture-folded-margin/')).status()).toBe(404)
 expect(JSON.parse(await(await request.get(root+'/search-index.json')).text())).toEqual([])
 expect(JSON.parse(await(await request.get(root+'/graph-index.json')).text())).toEqual({nodes:[],edges:[]})
 expect(await(await request.get(root+'/sitemap.xml')).text()).not.toContain('illustration-')
})

test('public Atlas leads to the optional space and literal fragment reading without JavaScript or intro',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'})
 try{
  const page=await context.newPage();await page.goto('http://127.0.0.1:4175/lab/atlas/')
  await page.locator('.atlas-footer').getByRole('link',{name:'Je ne sais qu’a — experimental',exact:true}).click()
  await expect(page.locator('.inquiry-review')).toContainText('Experimental illustration.')
  await expect(page.locator('[role="dialog"]')).toHaveCount(0)
  await page.getByRole('link',{name:'An open bracket',exact:true}).click()
  expect(await page.locator('.reading-verse').textContent()).toBe(illustrationVerse)
  await expect(page.getByRole('heading',{name:'Contribution and scope'})).toHaveCount(0)
  await page.getByRole('link',{name:'Return to Je ne sais qu’a',exact:false}).click()
  const trigger=page.getByText('What might connect these fragments?',{exact:true});await trigger.focus();const before=await page.evaluate(()=>scrollY)
  await page.keyboard.press('Enter');await expect(trigger).toBeFocused();expect(await page.evaluate(()=>scrollY)).toBeCloseTo(before,0)
  await expect(page.locator('.inquiry-pairings details')).toContainText('Where the analogy breaks')
 }finally{await context.close()}
})

test('public illustration supports touch, reduced motion and enlarged narrow reading with accessible semantics',async({browser},testInfo)=>{
 const context=await browser.newContext({viewport:{width:320,height:800},isMobile:true,hasTouch:true,reducedMotion:'reduce'})
 try{
  const page=await context.newPage();await page.goto('http://127.0.0.1:4175'+inquirySpacePath)
  await page.addStyleTag({content:'html{font-size:200%}p,li,dd{line-height:1.8!important;letter-spacing:.12em!important;word-spacing:.16em!important}'})
  await page.getByText('What might connect these fragments?',{exact:true}).tap()
  await expect(page.locator('.inquiry-pairings details')).toHaveAttribute('open','')
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([])
  const file=testInfo.outputPath('public-inquiry-320.png');await page.screenshot({path:file});await testInfo.attach('Public synthetic illustration, enlarged320px',{path:file,contentType:'image/png'})
 }finally{await context.close()}
})
