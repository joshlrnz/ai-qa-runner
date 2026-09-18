import { chromium } from 'playwright'
import fs from 'node:fs'
const APP=JSON.parse(fs.readFileSync('../../application.json','utf8'))
const OUT=process.env.OUT ?? './'
const B=process.env.BASE, CID=process.env.CID
const EXE=process.env.CHROME_PATH
const results=fs.existsSync(OUT+'report.json')?JSON.parse(fs.readFileSync(OUT+'report.json','utf8')).results:{}
const notes=[]
const P=pre=>Object.keys(APP.targets).filter(k=>k.startsWith(pre))
const sub=(s,v)=>s.replace(/\{(\w+)\}/g,(m,k)=>v[k]??m)
const save=()=>fs.writeFileSync(OUT+'report.json',JSON.stringify({results,notes},null,1))

let b,ctx,page,NOAUTH=false
async function fresh(){
  try{ await b?.close() }catch{}
  b=await chromium.launch({...(EXE?{executablePath:EXE}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']})
  ctx=await b.newContext({viewport:{width:1600,height:1000},storageState:OUT+'auth.json',serviceWorkers:'block'})
  page=await ctx.newPage()
}
await fresh()

async function visit(path){
  for(let a=0;a<2;a++){
    try{ await page.goto(B+path,{waitUntil:'domcontentloaded',timeout:45000}); await page.waitForTimeout(4000); return true }
    catch(e){ notes.push('GOTO '+path+' '+e.message.slice(0,60)); await fresh() }
  }
  return false
}
async function probe(targets,where,vars={}){
  for(const t of targets){
    const d=APP.targets[t]; if(!d) continue
    const miss=[...d.selector.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).filter(k=>!(k in vars))
    if(miss.length){ results[t] ??= {count:'needs:'+miss.join(','),where}; continue }
    const sel=sub(d.selector,vars)
    let c
    try{ c=await page.locator(sel).count() }
    catch(e){ c='ERR'; notes.push(t+' '+e.message.slice(0,50)); await fresh(); await visit(where) }
    const prev=results[t]
    if(!prev || prev.count===0 || typeof prev.count==='string') results[t]={count:c,where,selector:sel}
  }
  save()
}

const PLAN=JSON.parse(fs.readFileSync(OUT+(process.env.PLAN||'plan.json'),'utf8'))
for(const step of PLAN){
  if(!!step.noAuth!==NOAUTH){ NOAUTH=!!step.noAuth; await fresh() }
  const ok=await visit(step.path.replace('{companyId}',CID))
  console.log((ok?'ok  ':'FAIL')+' '+step.path)
  if(!ok) continue
  for(const c of (step.clicks||[])){
    const d=APP.targets[c]
    if(!d){ notes.push('click target missing '+c); continue }
    try{ await page.locator(d.selector).first().click({timeout:8000}); await page.waitForTimeout(2500) }
    catch(e){ notes.push('CLICK FAIL '+c+' :: '+e.message.split('\n')[0].slice(0,70)) }
  }
  await probe(step.targets.flatMap(t=>t.endsWith('*')?P(t.slice(0,-1)):[t]), step.path, step.vars||{})
  if(step.discoverText){
    const t=await page.locator(step.discoverText).first().innerText().catch(()=>null)
    if(t){ notes.push('CODE '+step.path+' = '+t.trim()); fs.appendFileSync(OUT+'codes.txt', step.path+'='+t.trim()+'\n') }
  }
  if(step.discover){
    const hrefs=await page.locator(`a[href*="${step.discover}"]`).evaluateAll(els=>els.map(e=>e.getAttribute('href'))).catch(()=>[])
    const hit=(hrefs||[]).map(h=>h&&h.match(/\/(\d+)(?:\/update)?(?:\?|$)/)).find(Boolean)
    const m=hit
    if(m){ notes.push('ID '+step.discover+' = '+m[1]); fs.appendFileSync(OUT+'ids2.txt', step.discover+'='+m[1]+'\n') }
  }
}
save()
await b.close().catch(()=>{})
console.log('DONE')
