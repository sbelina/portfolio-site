import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFile } from 'node:fs/promises'
import { renderToStaticMarkup } from 'react-dom/server'
import React from 'react'
import { AtlasProof } from '../src/experiments/atlas/AtlasProof'
import { fixture, fixtureMarker, layoutInput, validateFixture } from '../src/experiments/atlas/fixture'
import { computeSemanticLayout } from '../src/experiments/atlas/layout'
import { auditPublic } from '../scripts/audit-public'

const route='/lab/atlas/'

test('initial HTML, comparator, download records and 404s retain the whole bounded account',async({request})=>{
  const response=await request.get(route); expect(response.status()).toBe(200)
  const html=await response.text()
  expect(html).toContain(fixtureMarker); expect(html).not.toContain('<script')
  for(const entry of fixture.cases) expect(html).toContain(entry.title)
  expect((html.match(/data-pair=/g)??[])).toHaveLength(15)
  expect(html).toContain('Page directions have no conceptual meaning')
  expect(html).toContain('proposed / excluded from drawn connections')
  const comparator=await request.get(`${route}text/`); expect(comparator.status()).toBe(200)
  const text=await comparator.text(); expect(text).not.toContain('<svg')
  expect((text.match(/data-pair=/g)??[])).toHaveLength(15)
  for(const entry of fixture.cases) expect(text).toContain(entry.sourcePassage.replaceAll('&','&amp;').replaceAll('“','“'))
  const layout=await(await request.get(`${route}layout.json`)).json()
  const inputRecord=await(await request.get(`${route}input.json`)).json()
  expect(computeSemanticLayout(inputRecord.input).inputDigest).toBe(layout.inputDigest)
  expect(layout.positions).toHaveLength(6);expect(layout.pairs).toHaveLength(15)
  expect(layout.fixtureOnly).toBe(true)
  expect((await request.get(`${route}missing-entry/`)).status()).toBe(404)
  expect((await request.get('/investigations/claims-operations/')).status()).toBe(404)
})

test('one native keyboard action reveals a pair without JavaScript or coordinate changes',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false})
  try{
    const page=await context.newPage();await page.goto(route)
    const positions=await page.locator('[data-map-node] circle').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('cx'),node.getAttribute('cy')]))
    const details=page.locator('[data-pair]').first();const summary=details.locator('summary')
    await summary.focus();const scroll=await page.evaluate(()=>scrollY);await page.keyboard.press('Enter')
    await expect(details).toHaveAttribute('open','');await expect(summary).toBeFocused()
    await expect(details).toContainText('Target dissimilarity');await expect(details).toContainText('similarity contribution')
    expect(await page.evaluate(()=>scrollY)).toBeCloseTo(scroll,0)
    expect(await page.locator('[data-map-node] circle').evaluateAll(nodes=>nodes.map(node=>[node.getAttribute('cx'),node.getAttribute('cy')]))).toEqual(positions)
    await page.keyboard.press('Space');await expect(details).not.toHaveAttribute('open','');await expect(summary).toBeFocused()
    await page.getByText('About this experiment',{exact:true}).click()
    await expect(page.locator('.experiment-note')).toContainText('Does an inspectable geography add useful understanding')
  }finally{await context.close()}
})

test('native filtering hides nodes without moving or refitting the full layout',async({page})=>{
  await page.goto(route)
  const svg=page.locator('.atlas-figure svg')
  const before=await svg.locator('circle').evaluateAll(nodes=>nodes.map(node=>({x:node.getAttribute('cx'),y:node.getAttribute('cy')})))
  const digest=await svg.getAttribute('data-layout-digest')
  await page.getByLabel('Show only cases tagged').check()
  expect(await svg.locator('circle').evaluateAll(nodes=>nodes.map(node=>({x:node.getAttribute('cx'),y:node.getAttribute('cy')})))).toEqual(before)
  await expect(svg.locator('[data-map-node][data-visible-in-filter="false"]').first()).toBeHidden()
  await expect(svg.locator('[data-map-node][data-visible-in-filter="true"]').first()).toBeVisible()
  await expect(svg).toHaveAttribute('data-layout-digest',digest!)
  await expect(page.locator('.atlas-case')).toHaveCount(6)
  await page.getByLabel('Show only cases tagged').uncheck()
})

test('SVG uses an isotropic transform and the actual fitted coordinates',async({page,request})=>{
  await page.goto(route)
  const layout=await(await request.get(`${route}layout.json`)).json()
  const actual=await page.locator('.atlas-figure svg').evaluate(svg=>{
    const element=svg as SVGSVGElement;const matrix=element.getCTM()!
    return {a:matrix.a,d:matrix.d,b:matrix.b,c:matrix.c,nodes:[...element.querySelectorAll('[data-map-node]')].map(node=>({id:node.getAttribute('data-map-node'),x:Number(node.querySelector('circle')!.getAttribute('cx')),y:Number(node.querySelector('circle')!.getAttribute('cy'))}))}
  })
  expect(actual.a).toBeCloseTo(actual.d,10);expect(actual.b).toBe(0);expect(actual.c).toBe(0)
  await expect(page.locator('.atlas-figure svg')).toHaveAttribute('role','img')
  await expect(page.locator('.atlas-figure svg a')).toHaveCount(0)
  const labels=await page.locator('[data-map-node]').evaluateAll(nodes=>nodes.map(node=>{
    const circle=node.querySelector('circle')!,label=node.querySelector('text')!
    const shape=circle.getBoundingClientRect(),text=label.getBoundingClientRect()
    return {sameX:circle.getAttribute('cx')===label.getAttribute('x'),sameY:circle.getAttribute('cy')===label.getAttribute('y'),inside:text.left>=shape.left&&text.right<=shape.right&&text.top>=shape.top&&text.bottom<=shape.bottom}
  }))
  expect(labels.every(label=>label.sameX&&label.sameY&&label.inside)).toBe(true)
  for(const point of layout.positions){const node=actual.nodes.find(item=>item.id===point.id)!;expect(node.x).toBe(point.x);expect(node.y).toBe(-point.y)}
  for(const pair of layout.pairs){const left=actual.nodes.find(item=>item.id===pair.fromId)!,right=actual.nodes.find(item=>item.id===pair.toId)!;expect(Math.hypot(left.x-right.x,left.y-right.y)).toBeCloseTo(pair.fittedDistance,14)}
  await expect(page.locator('[data-map-edge="fixture-card-dependency"]')).toHaveAttribute('marker-end','url(#atlas-flow-arrow)')
  await expect(page.locator('[data-map-edge="fixture-status-comparison"]')).not.toHaveAttribute('marker-end')
  await expect(page.locator('[data-map-edge="fixture-unresolved-comparison"]')).toHaveCount(0)
})

test('all local links resolve and native navigation returns to a stable case index',async({page,request})=>{
  await page.goto(route)
  const links=await page.locator('a[href]').evaluateAll(nodes=>nodes.map(node=>node.getAttribute('href')!))
  const ids=await page.locator('[id]').evaluateAll(nodes=>nodes.map(node=>node.id))
  for(const href of new Set(links)){
    if(href.startsWith('#')) expect(ids).toContain(href.slice(1))
    else if(href.startsWith('/')) expect((await request.get(href)).status()).toBe(200)
  }
  const index=page.getByRole('navigation',{name:'Fictional case index'})
  await index.getByRole('link').first().click();await expect(page).toHaveURL(/#fixture-/)
  await page.getByRole('link',{name:'Return to case index ↑'}).first().click();await expect(page).toHaveURL(/#case-index$/)
  await page.goBack();await expect(page).toHaveURL(/#fixture-/)
  expect(await page.locator('.atlas-figure svg').getAttribute('data-layout-digest')).toMatch(/^[a-f0-9]{64}$/)
})

test('touch, reduced motion and narrow enlarged text retain the full text account',async({browser,baseURL},testInfo)=>{
  const context=await browser.newContext({baseURL,hasTouch:true,isMobile:true,viewport:{width:320,height:740},reducedMotion:'reduce'})
  try{
    const page=await context.newPage();await page.goto(route)
    await page.addStyleTag({content:'html{font-size:200%}p,li,dd{line-height:1.8!important;letter-spacing:.12em!important;word-spacing:.16em!important}'})
    const details=page.locator('[data-pair]').first();await details.locator('summary').tap();await expect(details).toHaveAttribute('open','')
    await expect(page.locator('.atlas-figure svg')).toBeHidden()
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
    expect(await page.evaluate(()=>matchMedia('(prefers-reduced-motion:reduce)').matches)).toBe(true)
    const capture=testInfo.outputPath('atlas-narrow.png');await page.screenshot({path:capture});await testInfo.attach('Synthetic enlarged text account',{path:capture,contentType:'image/png'})
  }finally{await context.close()}
})

test('CSS failure retains accounts and opening disclosures needs no client script',async({page})=>{
  await page.goto(route)
  await page.evaluate(()=>document.querySelectorAll('style').forEach(node=>node.remove()))
  const details=page.locator('[data-pair]').first();await details.locator('summary').click();await expect(details).toContainText('Signed residual')
  await expect(page.locator('script')).toHaveCount(0)
  await expect(page.locator('.atlas-case')).toHaveCount(6)
})

test('automated accessibility scan and synthetic capture',async({page},testInfo)=>{
  await page.goto(route)
  await page.locator('[data-pair] summary').first().click()
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
  expect(result.violations).toEqual([])
  await page.goto(route)
  const mapCapture=testInfo.outputPath('atlas-map.png');await page.locator('.atlas-figure').screenshot({path:mapCapture});await testInfo.attach('Synthetic semantic map',{path:mapCapture,contentType:'image/png'})
  const capture=testInfo.outputPath('atlas-desktop.png');await page.screenshot({path:capture,fullPage:false});await testInfo.attach('Synthetic semantic proof desktop',{path:capture,contentType:'image/png'})
})

test('strict synthetic contract rejects source, relationship and route mistakes; text stays escaped',()=>{
  const unknown=structuredClone(fixture);Object.assign(unknown,{approved:true});expect(()=>validateFixture(unknown)).toThrow()
  const broken=structuredClone(fixture);broken.relationships[0].toId='fixture-private';expect(()=>validateFixture(broken)).toThrow()
  const unsupported=structuredClone(fixture);delete unsupported.relationships.find(edge=>edge.status==='documented')!.sourcePassage;expect(()=>validateFixture(unsupported)).toThrow()
  const changed=structuredClone(fixture);changed.cases[0].observation='<img src=x onerror="alert(1)">'
  const html=renderToStaticMarkup(React.createElement(AtlasProof,{account:validateFixture(changed),layout:computeSemanticLayout(layoutInput(changed))}))
  expect(html).toContain('&lt;img');expect(html).not.toContain('<img src=x')
})

test('default public artifact excludes the synthetic proof and rejects accidental trial deployment',async()=>{
  await auditPublic('dist')
  await expect(auditPublic('dist-atlas')).rejects.toThrow(/fixture|draft/)
  const manifest=await readFile('dist/route-manifest.json','utf8');expect(manifest).not.toContain(route)
  expect(fixtureMarker).toBe('ATLAS_SYNTHETIC_PROOF_13NOV')
})
