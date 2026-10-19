import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'
import {createServer} from 'vite'; import * as D from './db.js'
const vite=await createServer({server:{middlewareMode:true}})
const body=q=>new Promise(r=>{const c=[];q.on('data',d=>c.push(d));q.on('end',()=>r(Buffer.concat(c)))})
const json=(r,o)=>{r.setHeader('Content-Type','application/json');r.end(JSON.stringify(o))}
http.createServer(async(q,r)=>{
  const u=new URL(q.url,'http://x'),p=u.pathname.split('/').filter(Boolean)
  try{
    if(p[0]=='api'){
      if(p[1]=='state') return json(r,D.state())
      if(p[1]=='upload'){const ext=path.extname(u.searchParams.get('name')||'.png').slice(0,6)||'.png',n=crypto.randomBytes(6).toString('hex')+ext
        fs.writeFileSync('data/images/'+n,await body(q));return json(r,{path:'images/'+n})}
      if(!D.TABLES.includes(p[2])) return r.writeHead(400).end()
      if(p[1]=='put') D.put(p[2],JSON.parse((await body(q)).toString()))
      if(p[1]=='del') D.del(p[2],p[3])
      return json(r,{ok:1})
    }
    if(p[0]=='images'){const f='data/images/'+path.basename(p[1]);if(fs.existsSync(f))return r.end(fs.readFileSync(f))}
  }catch(e){r.writeHead(500).end(String(e))}
  vite.middlewares(q,r)
}).listen(5173,'127.0.0.1',()=>console.log('MediaLib running at http://localhost:5173'))
