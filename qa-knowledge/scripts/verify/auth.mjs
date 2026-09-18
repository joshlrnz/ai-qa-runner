import { chromium } from 'playwright'
const B=process.env.BASE ?? 'https://releasing.oboda.app'
const EXE=process.env.CHROME_PATH
const OUT=process.env.OUT ?? './'
const b=await chromium.launch({...(EXE?{executablePath:EXE}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']})
const ctx=await b.newContext({viewport:{width:1600,height:1000}})
const req=ctx.request
const csrf=await (await req.get(B+'/api/auth/csrf')).json()
console.log('csrf ok')
const r=await req.post(B+'/api/auth/callback/credentials',{
  form:{ csrfToken:csrf.csrfToken, email:process.env.E2E_EMAIL, password:process.env.E2E_PASSWORD, redirect:'false', json:'true' }})
console.log('login status', r.status())
const sess=await (await req.get(B+'/api/auth/session')).json()
console.log('session user:', sess?.user?.email ?? JSON.stringify(sess).slice(0,120))
if(sess?.user){ await ctx.storageState({path:OUT+'auth.json'}); console.log('storage saved') }
await b.close()
