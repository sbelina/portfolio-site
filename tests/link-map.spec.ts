import { expect, test } from '@playwright/test'
import { graphNodes } from '../src/data'

test('map follows orientation and precedes cases, with reciprocal reading links', async ({ page }) => {
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/#index')
 expect(await page.evaluate(()=>{
  const follows=(a:string,b:string)=>!!(document.querySelector(a)!.compareDocumentPosition(document.querySelector(b)!)&Node.DOCUMENT_POSITION_FOLLOWING)
  return follows('.index-hero','#system-map')&&follows('#system-map','#work')&&follows('#work','.explained-connections')
 })).toBe(true)
 await page.getByRole('link',{name:'Explore connections'}).click()
 await expect(page).toHaveURL(/#connections$/)
 await page.getByRole('button',{name:'project: Claims operations. Select to trace connections.',exact:true}).click()
 await expect(page.locator('.trace-jump')).toHaveText('Go to case summary ↓')
 await page.locator('.trace-jump').click();await expect(page).toHaveURL(/#claims-operations$/)
 const comparison=page.locator('#claims-operations').getByRole('link',{name:'Examine this distinction'})
 await comparison.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#distinction-claims-operations$/)
 await page.locator('#distinction-claims-operations').getByRole('link',{name:'Read the supporting case summary'}).click()
 await expect(page).toHaveURL(/#claims-operations$/)
 await page.goBack();await expect(page).toHaveURL(/#distinction-claims-operations$/)
 await page.locator('#claims-operations').getByRole('button',{name:'Trace this case in the map'}).click()
 await expect(page.locator('.graph-node[data-node-id="claims-operations"]')).toBeFocused()
 await expect(page.locator('.graph-node[data-node-id="claims-operations"]')).toBeInViewport()
})

test('every homepage fragment and graph source resolves; arrows match actual destination order',async({page})=>{
 await page.goto('/#index')
 for(const node of graphNodes.filter(node=>node.href)) await expect(page.locator(node.href!)).toHaveCount(1)
 const findings=await page.evaluate(()=>{
  const failures:string[]=[]
  for(const link of document.querySelectorAll<HTMLAnchorElement>('a[href]')){
   const target=new URL(link.href,location.href)
   if(target.origin!==location.origin||target.pathname!==location.pathname||!target.hash)continue
   const el=document.getElementById(decodeURIComponent(target.hash.slice(1)))
   if(!el){failures.push(`Missing ${link.getAttribute('href')}`);continue}
   const text=link.textContent||''
   const after=!!(link.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING)
   if(text.includes('↓')&&!after)failures.push(`Wrong down: ${text}`)
   if(text.includes('↑')&&after)failures.push(`Wrong up: ${text}`)
   if(text.includes('↗'))failures.push(`Outward internal arrow: ${text}`)
  }return failures
 })
 expect(findings).toEqual([])
 await expect(page.locator('.site-footer').getByRole('link',{name:'Reveal the hidden work'})).toHaveText('Reveal the hidden work →')
})

test('all-layer text alternative links to exact archived descriptions without JavaScript',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,javaScriptEnabled:false,viewport:{width:320,height:740},hasTouch:true})
 try{const page=await context.newPage();await page.goto('/#connections')
 await page.getByRole('link',{name:'Read map as text'}).tap()
 await expect(page.locator('.connections-list')).toHaveAttribute('open','')
 const link=page.locator('.connections-list').getByRole('link',{name:'What’s left?'})
 await expect(link).toHaveAttribute('href','#archive-left');await link.tap()
 await expect(page).toHaveURL(/#archive-left$/)
 await expect(page.locator('#archive')).toHaveAttribute('open','')
 await expect(page.locator('#archive-left')).toBeInViewport()
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
 }finally{await context.close()}
})
