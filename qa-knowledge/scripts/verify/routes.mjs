import fs from 'node:fs'
const APP=JSON.parse(fs.readFileSync('../../application.json','utf8'))
const st=JSON.parse(fs.readFileSync('./auth.json','utf8'))
const cookie=st.cookies.map(c=>`${c.name}=${c.value}`).join('; ')
const B='https://releasing.oboda.app', CID='10004'
const IDS={orderId:'1',purchaseOrderId:'1',productId:'1',customerId:'1',supplierId:'1'}
const out={}
const entries=Object.entries(APP.pages).filter(([n])=>!n.startsWith('lite.'))
let i=0
for(const [name,tpl] of entries){
  const path=tpl.replace('{companyId}',CID).replace(/\{(\w+)\}/g,(m,k)=>IDS[k]??'1')
  let status
  try{ const r=await fetch(B+path,{headers:{cookie,'user-agent':'qa-knowledge-verify'},redirect:'manual'}); status=r.status }
  catch(e){ status='ERR' }
  out[name]={path,status}
  if(++i%40===0) console.log(i+'/'+entries.length)
}
fs.writeFileSync('./routes-report.json',JSON.stringify(out,null,1))
const by={}; for(const v of Object.values(out)) by[v.status]=(by[v.status]||0)+1
console.log('status distribution:',JSON.stringify(by))
const bad=Object.entries(out).filter(([,v])=>v.status!==200)
console.log('non-200:',bad.length); bad.slice(0,25).forEach(([n,v])=>console.log('  ',v.status,n,v.path))
