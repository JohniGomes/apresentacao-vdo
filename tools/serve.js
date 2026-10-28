// Servidor estático mínimo (opcional). Uso: node tools/serve.js [porta]
const http=require('http'),fs=require('fs'),path=require('path');
const root=path.join(__dirname,'..'),port=+process.argv[2]||5173;
const T={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.webp':'image/webp'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p==='/')p='/index.html';const f=path.join(root,p);
 if(!f.startsWith(root))return r.writeHead(403).end();
 fs.stat(f,(e,st)=>{if(e||!st.isFile())return r.writeHead(404).end('404');
  const h={'Content-Type':T[path.extname(f)]||'application/octet-stream','Accept-Ranges':'bytes'};const m=/bytes=(\d*)-(\d*)/.exec(q.headers.range||'');
  if(m){const a=m[1]?+m[1]:0,b=m[2]?+m[2]:st.size-1;r.writeHead(206,{...h,'Content-Range':'bytes '+a+'-'+b+'/'+st.size,'Content-Length':b-a+1});fs.createReadStream(f,{start:a,end:b}).pipe(r);}
  else{r.writeHead(200,{...h,'Content-Length':st.size});fs.createReadStream(f).pipe(r);}});
}).listen(port,()=>console.log('http://localhost:'+port));
