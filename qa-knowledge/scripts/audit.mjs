import fs from 'node:fs'
const QK=new URL('..',import.meta.url).pathname
const app=JSON.parse(fs.readFileSync(QK+'application.json','utf8'))
const files=fs.readdirSync(QK+'modules').filter(f=>f.endsWith('.md'))
const navPaths=new Set(), usedTargets=new Set(), flowsBy={}
for(const f of files){
  const s=fs.readFileSync(QK+'modules/'+f,'utf8')
  const a=s.indexOf('\n## Flows'), b=s.indexOf('\n## Contract gaps')
  if(a<0) continue
  const flows=s.slice(a, b>0?b:undefined)
  flowsBy[f.replace('.md','')]=[...flows.matchAll(/^### (.+)$/gm)].map(m=>m[1])
  for(const m of flows.matchAll(/`(\/[^`\s]*)`/g)) navPaths.add(m[1])
  for(const m of flows.matchAll(/`((?:shell|lite|v2-[a-z-]+|v3-[a-z-]+)\.[a-z0-9-]+)`/g)) usedTargets.add(m[1])
}
// page coverage
const byModule={}
for(const [name,path] of Object.entries(app.pages)){
  const mod=name.split('.')[0]
  ;(byModule[mod] ??= {covered:[],uncovered:[]})[navPaths.has(path)?'covered':'uncovered'].push(name)
}
console.log('=== ROUTE COVERAGE (pages navigated by >=1 flow) ===')
let c=0,u=0
for(const [m,v] of Object.entries(byModule).sort()){
  c+=v.covered.length; u+=v.uncovered.length
  console.log(`\n${m}: ${v.covered.length}/${v.covered.length+v.uncovered.length}`)
  if(v.uncovered.length) console.log('  UNCOVERED: '+v.uncovered.join(', '))
}
console.log(`\nTOTAL ${c}/${c+u} pages covered\n`)
console.log('=== FLOWS PER MODULE ===')
for(const [m,l] of Object.entries(flowsBy).sort()) console.log(`${m} (${l.length}): ${l.join(' | ')}`)
