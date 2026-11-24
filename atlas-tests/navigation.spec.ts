import { test, expect } from '@playwright/test'

const atlas='/lab/atlas/'
const hub='/lab/'
const label='Experiments — experimental'
const atlasLabel='Atlas of Inquiry — experimental'

test('current primary menus expose one native experimental Observatory link in initial HTML',async({browser,baseURL})=>{
  const context=await browser.newContext({baseURL,javaScriptEnabled:false,reducedMotion:'reduce'})
  try{
    const page=await context.newPage()
    for(const route of ['/','/investigations/','/patterns/','/practice/','/system/',hub,atlas,`${atlas}text/`,'/lab/edge-case/','/missing-atlas-page/']){
      const response=await page.goto(route);expect(response?.status()).toBe(route.startsWith('/missing')?404:200)
      const nav=page.getByRole('navigation',{name:'Primary navigation',exact:true})
      await expect(nav.getByRole('link')).toHaveCount(5)
      const link=nav.getByRole('link',{name:label,exact:true})
      await expect(link).toHaveText('Experiments*');await expect(link).toHaveAttribute('href',hub)
      expect(await link.evaluate(element=>element.tagName)).toBe('A')
      expect(await link.getAttribute('target')).toBeNull()
    }
    await page.goto(hub)
    await expect(page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:label})).toHaveAttribute('aria-current','page')
    for(const member of [atlas,`${atlas}text/`,'/lab/edge-case/']){
      await page.goto(member)
      await expect(page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:label})).toHaveAttribute('aria-current','true')
    }
    await page.goto(atlas)
    await expect(page.getByRole('region',{name:'Producing Curiosity introduction'})).toHaveCount(0)
    await page.goto(`${atlas}text/`)
    await expect(page.getByRole('navigation',{name:'Atlas navigation'}).locator('[aria-current="page"]')).toHaveAttribute('href',`${atlas}text/`)
  }finally{await context.close()}
})

test('keyboard Atlas entry through the Observatory and native Back preserve access without an intro gate',async({page,request})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/')
  const link=page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:label,exact:true})
  await link.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp(hub+'$'))
  await page.getByRole('link',{name:atlasLabel,exact:true}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp(atlas+'$'))
  await expect(page.locator('.atlas-warning')).toContainText('Every case, source passage, tag and connection below is invented')
  await expect(page.getByRole('region',{name:'Producing Curiosity introduction'})).toHaveCount(0)
  await page.locator('[data-pair] summary').first().focus();await page.keyboard.press('Enter')
  await expect(page.locator('[data-pair]').first()).toHaveAttribute('open','')
  await page.goBack();await expect(page).toHaveURL(new RegExp(hub+'$'));await page.goBack();await expect(page).toHaveURL(/\/$/);await expect(link).toBeVisible()
  const input=await request.get(`${atlas}input.json`);expect(input.status()).toBe(200);expect(input.headers()['content-type']).toContain('application/json')
  expect(input.headers()['x-robots-tag']).toContain('noindex')
  const html=await(await request.get(atlas)).text();expect(html).toContain('noindex, follow');expect(html).not.toContain('not Sami’s work or a public release')
  expect((await request.get('/')).headers()['x-robots-tag']??'').not.toContain('noindex')
})

test('touch and enlarged menus preserve all destinations and reflow on narrow screens',async({browser,baseURL},testInfo)=>{
  const context=await browser.newContext({baseURL,viewport:{width:320,height:800},hasTouch:true,isMobile:true,reducedMotion:'reduce'})
  try{
    const page=await context.newPage()
    for(const route of ['/',hub,atlas,`${atlas}text/`,'/lab/edge-case/']){
      await page.goto(route)
      await page.addStyleTag({content:'html{font-size:200%}p,li{line-height:1.8!important;letter-spacing:.12em!important;word-spacing:.16em!important}'})
      const nav=page.getByRole('navigation',{name:'Primary navigation',exact:true})
      await expect(nav.getByRole('link')).toHaveCount(5)
      expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
      for(const link of await nav.getByRole('link').all())expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44)
    }
    await page.goto('/')
    await page.getByRole('navigation',{name:'Primary navigation'}).getByRole('link',{name:label,exact:true}).tap()
    await expect(page).toHaveURL(new RegExp(hub+'$'))
    await page.getByRole('link',{name:atlasLabel,exact:true}).tap()
    await expect(page).toHaveURL(new RegExp(atlas+'$'))
    const capture=testInfo.outputPath('public-atlas-navigation-320.png');await page.screenshot({path:capture});await testInfo.attach('Synthetic Atlas public navigation at320px',{path:capture,contentType:'image/png'})
  }finally{await context.close()}
})
