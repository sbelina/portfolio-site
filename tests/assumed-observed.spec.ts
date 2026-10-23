import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { assumedObservedSchema } from '../src/content/assumed-observed'
import { assumedObservedFixture, visualFixture } from './fixtures/assumed-observed'
import { readingPageData } from '../src/reading/page-data'
import { fixtureProjection, fixtureStore } from './fixtures/reading-content'
import { validateCandidateProjection, digestRecord } from '../src/content/projection'
import type { ReleaseManifest } from '../src/content/model'
const route='/experiments/fixture-assumed-observed/'

test('diagram schema and projection reject unresolved, duplicate or private references',()=>{
 const broken=structuredClone(assumedObservedFixture)
 broken.connections[0].observationId='99999999-9999-4999-8999-999999999999'
 expect(assumedObservedSchema.safeParse(broken).success).toBe(false)
 const duplicate=structuredClone(assumedObservedFixture);duplicate.connections.push({...duplicate.connections[0],id:'99999999-9999-4999-8999-999999999999'})
 expect(assumedObservedSchema.safeParse(duplicate).success).toBe(false)
 const missing=structuredClone(assumedObservedFixture);missing.connections[0].missingEvidence=['A source is still missing']
 expect(assumedObservedSchema.safeParse(missing).success).toBe(false)
 expect(assumedObservedSchema.safeParse({...assumedObservedFixture,javascript:'execute this'}).success).toBe(false)
 const extra=visualFixture(),input=structuredClone(fixtureStore);input.entries.push(extra.entry);input.evidence.push(...extra.evidence)
 const refs=(records:{id:string;revision:number}[])=>records.map(r=>({id:r.id,revision:r.revision,digest:digestRecord(r)}))
 const manifest:ReleaseManifest={schemaVersion:1,releaseId:'99999999-9999-4999-8999-999999999999',applicationRevision:'a'.repeat(40),contentRevision:'b'.repeat(40),entries:refs(input.entries.filter(e=>e.revision===1)),relationships:refs(input.relationships),evidence:refs(input.evidence.slice(0,1)),assets:[],aliases:refs(input.aliases)}
 expect(()=>validateCandidateProjection(input,manifest)).toThrow('Diagram references private or unselected evidence')
})

test('page payload includes the diagram sources without unrelated bodies',()=>{
 const p=fixtureProjection(),entry=p.entries.find(e=>e.slug==='fixture-assumed-observed')!,page=readingPageData(p,'entry',true,entry.id)
 expect(page.projection.evidence.map(e=>e.id)).toEqual(assumedObservedFixture.observations.map(o=>o.evidenceId))
 expect(JSON.stringify(page)).not.toContain('A proposition to examine')
 expect(page.renderedMarkdown).not.toHaveProperty(assumedObservedFixture.id)
})

test('one keyboard action reveals explanation, passage and limitations without moving nodes',async({page})=>{
 await page.goto(route)
 const diagram=page.locator('.ao'),buttons=diagram.locator('.ao-assumptions button'),panel=diagram.getByRole('region',{name:'Selected assumption explanation'})
 await expect(buttons).toHaveCount(3)
 await buttons.first().focus()
 const before=await buttons.evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})))
 const scroll=await page.evaluate(()=>scrollY)
 await page.keyboard.press('Enter')
 await expect(buttons.first()).toHaveAttribute('aria-pressed','true')
 await expect(diagram.getByRole('status')).toContainText('1 explained connection')
 await expect(panel).toContainText('Documented relationship')
 await expect(panel).toContainText('Synthetic demonstration script')
 await expect(panel).toContainText('Relevant passage')
 await expect(panel).toContainText('Limitation')
 await expect(diagram.locator('path[data-active=true]')).toHaveCount(1)
 const after=await buttons.evaluateAll(els=>els.map(el=>({x:el.getBoundingClientRect().x,y:el.getBoundingClientRect().y,width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height})))
 expect(after).toEqual(before)
 expect(Math.abs(await page.evaluate(()=>scrollY)-scroll)).toBeLessThan(3)
 await buttons.nth(2).focus();await page.keyboard.press('Space')
 await expect(panel).toContainText('Hypothesis')
 await expect(panel).toContainText('Missing evidence')
 await expect(diagram.locator('path[data-active=true]')).toHaveCount(2)
 await panel.getByRole('button',{name:'Close explanation'}).focus();await page.keyboard.press('Escape')
 await expect(buttons.nth(2)).toBeFocused()
 await expect(buttons.nth(2)).toHaveAttribute('aria-pressed','false')
 await expect(page).toHaveURL(new RegExp(route+'$'))
})

test('click selection and close return focus to its trigger; article stays in place',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message))
 await page.goto(route);const diagram=page.locator('.ao'),button=diagram.locator('.ao-assumptions button').nth(1)
 await button.click()
 const panel=diagram.getByRole('region',{name:'Selected assumption explanation'})
 await expect(panel).toContainText('Interpretation')
 await expect(panel).toContainText('An omitted step may be intentional')
 await panel.getByRole('button',{name:'Close explanation'}).click()
 await expect(button).toBeFocused();await expect(page.locator('h1')).toHaveText('Fixture: inspect a synthetic handoff')
 expect(errors).toEqual([])
})

test('touch and narrow enlarged reading use a simplified layout with reduced motion',async({browser})=>{
 const context=await browser.newContext({viewport:{width:320,height:780},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage()
 await page.goto('http://127.0.0.1:4174'+route)
 const diagram=page.locator('.ao'),button=diagram.locator('.ao-assumptions button').nth(2)
 await button.tap();await expect(diagram.getByRole('region',{name:'Selected assumption explanation'})).toContainText('Hypothesis')
 expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44)
 await expect(diagram.locator('svg')).toBeHidden()
 await diagram.screenshot({path:'test-results/assumed-observed-mobile-normal.png'})
 await page.addStyleTag({content:'html {font-size:200%} * {letter-spacing:.12em!important;word-spacing:.16em!important} '})
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 expect(await button.evaluate(el=>getComputedStyle(el).animationName)).toBe('none')
 await diagram.screenshot({path:'test-results/assumed-observed-mobile.png'})
 await context.close()
})

test('no-JavaScript disclosures retain source, interpretation and limitation',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false}),page=await context.newPage()
 await page.goto('http://127.0.0.1:4174'+route)
 const diagram=page.locator('.ao'),details=diagram.locator('.ao-text-alternative details').first()
 await expect(diagram.getByRole('button')).toHaveCount(0)
 await details.locator('summary').click()
 await expect(details).toContainText('Relevant passage')
 await expect(details.getByText('Synthetic demonstration script',{exact:false})).toBeVisible()
 await expect(details.getByText('Limitation',{exact:true})).toBeVisible()
 const footer=page.locator('footer .experiment-note');await footer.locator('summary').click()
 await expect(footer).toContainText('Improved comprehension has not been established')
 await context.close()
})

test('desktop selected reasoning passes automated accessibility checks',async({page})=>{
 await page.setViewportSize({width:1440,height:1100});await page.goto(route)
 const diagram=page.locator('.ao');await diagram.locator('.ao-assumptions button').nth(2).click()
 const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()
 expect(result.violations).toEqual([])
 await diagram.screenshot({path:'test-results/assumed-observed-desktop.png'})
})
