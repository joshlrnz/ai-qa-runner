import fs from 'node:fs'
const QK=new URL('../../',import.meta.url).pathname
const REPORT=process.env.REPORT ?? './report.json'
const app=JSON.parse(fs.readFileSync(QK+'application.json','utf8'))
const R=JSON.parse(fs.readFileSync(REPORT,'utf8')).results
const all={...app.targets,...(app.unresolvedTargets||{})}
const rows={}
for(const [name,def] of Object.entries(all)){
  const m=def.module ?? name.split('.')[0]
  const r=R[name]
  const k = !r ? 'unprobed'
    : r.count===1 ? 'pass'
    : (typeof r.count==='number' && r.count>1) ? 'ambiguous'
    : r.count===0 ? 'zero' : 'unbound'
  ;(rows[m] ??= {pass:0,ambiguous:0,zero:0,unprobed:0,unbound:0,total:0})
  rows[m][k]++; rows[m].total++
}
const t={pass:0,ambiguous:0,zero:0,unprobed:0,unbound:0,total:0}
console.log('| module | targets | verified (1) | ambiguous (>1) | 0 matches | unprobed |')
console.log('| --- | ---: | ---: | ---: | ---: | ---: |')
for(const [m,v] of Object.entries(rows).sort()){
  for(const k of Object.keys(t)) t[k]+=v[k]
  console.log(`| ${m} | ${v.total} | ${v.pass} | ${v.ambiguous} | ${v.zero} | ${v.unprobed+v.unbound} |`)
}
console.log(`| **total** | **${t.total}** | **${t.pass}** | **${t.ambiguous}** | **${t.zero}** | **${t.unprobed+t.unbound}** |`)
console.log('\nzero-match targets (selector wrong OR page/state not reached):')
for(const [n,r] of Object.entries(R)) if(r.count===0) console.log('  '+n+'  ::  '+(r.selector||''))
