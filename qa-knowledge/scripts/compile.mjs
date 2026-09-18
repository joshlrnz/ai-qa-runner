import fs from 'node:fs'
import path from 'node:path'
const QK=new URL('..',import.meta.url).pathname
const app=JSON.parse(fs.readFileSync(QK+'application.json','utf8'))
const CONF=new Set(['high','medium','low','unresolved'])
const looksSelector=(v)=>/^(role=|input\[|div\[|nav|tr:has|text=|li:has|a\[|button|h\d|span|\.|#|\[)/.test(v)||v.includes('>>')
const targets={}, dupes=[], skipped=[], unresolved={}
for(const f of fs.readdirSync(QK+'modules').sort()){
  if(!f.endsWith('.md'))continue
  const mod=f.replace(/\.md$/,'')
  for(const line of fs.readFileSync(QK+'modules/'+f,'utf8').split('\n')){
    if(!line.startsWith('|'))continue
    const cells=line.split('|').slice(1,-1).map(c=>c.trim())
    if(cells.length<4)continue
    const nameM=cells[0].match(/^`([a-z0-9-]+\.[a-z0-9-]+)`$/i)
    if(!nameM)continue
    const name=nameM[1]
    if(!name.startsWith(mod+'.')){skipped.push(`${f}: ${name} (prefix != module)`);continue}
    let selector=null,confidence=null,note=null
    for(const c of cells.slice(1)){
      const b=c.match(/^`(.+)`$/)
      if(b&&!selector&&looksSelector(b[1])){selector=b[1];continue}
      if(CONF.has(c)&&!confidence){confidence=c;continue}
    }
    note=cells[cells.length-1]
    if(!selector||selector==='–'){skipped.push(`${f}: ${name} (no selector)`);continue}
    if(confidence==='unresolved'){skipped.push(`${f}: ${name} (unresolved)`);unresolved[name]={module:mod,selector,reason:note||'marked unresolved'};continue}
    if(targets[name]){dupes.push(name);continue}
    targets[name]={selector,module:mod,confidence:confidence??'low'}
    if(note&&note!==''&&!CONF.has(note)&&!note.startsWith('`')) targets[name].note=note
  }
}
if(dupes.length){console.error('DUPLICATE TARGET KEYS:',dupes.join(', '));process.exit(1)}
app.targets=targets
app.unresolvedTargets=unresolved
fs.writeFileSync(QK+'application.json',JSON.stringify(app,null,2)+'\n')
const byMod={}
for(const [k,v] of Object.entries(targets)) byMod[v.module]=(byMod[v.module]||0)+1
console.log('compiled',Object.keys(targets).length,'targets |',Object.keys(unresolved).length,'unresolved (kept out of the registry)')
console.log(JSON.stringify(byMod,null,1))
if(skipped.length){console.log('\nskipped ('+skipped.length+'):');for(const s of skipped)console.log('  '+s)}
