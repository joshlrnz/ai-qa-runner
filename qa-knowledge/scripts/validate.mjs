import fs from 'node:fs';import path from 'node:path'
const QK=new URL('..',import.meta.url).pathname
const app=JSON.parse(fs.readFileSync(QK+'application.json','utf8'))
const targets=new Set(Object.keys(app.targets))
const pages=new Set(Object.values(app.pages))
const params=new Set(Object.keys(app.params))
const pageNames=new Set(Object.keys(app.pages))
const unresolved=new Set(Object.keys(app.unresolvedTargets||{}))
const blocked=[]
const used=new Set(),badTargets=[],badPaths=[],badParams=new Set()

for(const f of fs.readdirSync(QK+'modules')){
  const s=fs.readFileSync(QK+'modules/'+f,'utf8')
  const flows=s.slice(s.indexOf('\n## Flows'), s.indexOf('\n## Contract gaps')>0?s.indexOf('\n## Contract gaps'):undefined)
  for(const m of flows.matchAll(/`((?:shell|lite|v2-[a-z-]+|v3-[a-z-]+)\.[a-z0-9-]+)`/g)){
    if(m[1].endsWith('.md')) continue
    if(pageNames.has(m[1])) continue   // route-flow tables list page names, not targets
    used.add(m[1])
    if(unresolved.has(m[1])) { blocked.push(`${f}: ${m[1]}`); continue }
    if(!targets.has(m[1])) badTargets.push(`${f}: ${m[1]}`)
  }
  for(const line of flows.split('\n')){
    if(!/^\d+\.\s/.test(line)) continue          // only numbered flow steps
    for(const m of line.matchAll(/`(\/[^`\s]*)`/g)){
      const p=m[1]; if(!pages.has(p)) badPaths.push(`${f}: ${p}`)
    }
  }
}
for(const v of [...Object.values(app.pages),...Object.values(app.targets).map(t=>t.selector)])
  for(const m of String(v).matchAll(/\{([a-zA-Z]+)\}/g)) if(!params.has(m[1])) badParams.add(m[1])

const orphans=[...targets].filter(t=>!used.has(t))
console.log('targets:',targets.size,'| pages:',Object.keys(app.pages).length,'| params:',params.size)
console.log('\nunknown targets in flows:',badTargets.length); badTargets.forEach(x=>console.log('  '+x))
console.log('\nflows blocked by an unresolved target:',blocked.length); blocked.forEach(x=>console.log('  '+x))
console.log('\nunknown paths in flows:',badPaths.length); badPaths.forEach(x=>console.log('  '+x))
console.log('\nundeclared params:',[...badParams].join(', ')||'none')
console.log('\ntargets not used by any flow:',orphans.length)
const byMod={}; for(const o of orphans) (byMod[app.targets[o].module]??=[]).push(o)
for(const [m,l] of Object.entries(byMod)) console.log('  '+m+': '+l.length)

// action-target coverage: buttons/submits that no flow invokes
const actions=[...targets].filter(t=>/-(button|submit)$/.test(t)&&!/-input$/.test(t))
const orphanActions=actions.filter(t=>!used.has(t))
console.log('\nACTION targets (buttons/submits): '+actions.length+' | not invoked by any flow: '+orphanActions.length)
const g={}; for(const o of orphanActions) (g[app.targets[o].module] ??= []).push(o)
for(const [m,l] of Object.entries(g).sort()) console.log('\n  '+m+' ('+l.length+'):\n    '+l.join('\n    '))
